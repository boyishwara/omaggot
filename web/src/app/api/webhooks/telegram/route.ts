import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// In-memory dedup cache: notificationId -> timestamp sent
// Prevents duplicate Telegram sends if multiple Supabase webhooks fire for same INSERT
const recentlySent = new Map<string, number>();
const DEDUP_WINDOW_MS = 30_000; // 30 seconds

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Supabase Webhook Payload: { type: 'INSERT', table: 'notifications', record: { ... } }
    const payload = body.record;

    if (!payload || !payload.message) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    // ── Deduplication guard ──────────────────────────────────────────────────
    const notifId = String(payload.id);
    const now = Date.now();
    if (recentlySent.has(notifId)) {
      console.warn(`[Telegram] Duplicate webhook for notification ${notifId} — skipping.`);
      return NextResponse.json({ success: true, message: 'Duplicate suppressed' });
    }
    recentlySent.set(notifId, now);
    // Clean up stale entries older than the window
    for (const [id, ts] of recentlySent) {
      if (now - ts > DEDUP_WINDOW_MS) recentlySent.delete(id);
    }
    // ────────────────────────────────────────────────────────────────────────

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      console.warn('Telegram token missing.');
      return NextResponse.json({ success: false, error: 'Telegram credentials missing' }, { status: 500 });
    }

    const supabase = createAdminClient();
    const { data: subscribers, error: subError } = await supabase
      .from('telegram_subscribers')
      .select('chat_id')
      .eq('is_active', true);

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, message: 'No active subscribers' });
    }

    const emoji = payload.severity === 'CRITICAL' ? '🚨' : payload.severity === 'DANGER' ? '🔥' : '⚠️';
    const text =
      `${emoji} *Smart Maggot Box Alert*\n\n` +
      `*Severity:* ${payload.severity}\n` +
      `*Rule:* ${payload.rule_name}\n\n` +
      `*Message:* ${payload.message}\n\n` +
      `*Current Readings:*\n` +
      `🌡️ Temperature: ${payload.temperature}°C\n` +
      `💧 Humidity: ${payload.humidity}%\n\n` +
      `_${new Date(payload.created_at).toLocaleString()}_`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    await Promise.allSettled(
      subscribers.map((sub: any) =>
        fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: sub.chat_id, text, parse_mode: 'Markdown' }),
        })
      )
    );

    console.log(`[Telegram] Broadcast notification ${notifId} to ${subscribers.length} subscriber(s).`);
    return NextResponse.json({ success: true, broadcast_count: subscribers.length });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
