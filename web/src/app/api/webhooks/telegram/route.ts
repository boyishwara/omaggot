import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Supabase Webhook Payload (Database Insert)
    // Structure: { type: 'INSERT', table: 'notifications', record: { ... } }
    const payload = body.record;

    if (!payload || !payload.message) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (!TELEGRAM_BOT_TOKEN) {
      console.warn('Telegram token missing. Skipping notification.');
      return NextResponse.json({ success: false, error: 'Telegram credentials missing' }, { status: 500 });
    }

    const supabase = createAdminClient();
    const { data: subscribers, error: subError } = await supabase
      .from('telegram_subscribers')
      .select('chat_id')
      .eq('is_active', true);

    if (subError) throw subError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, message: 'No active subscribers to notify' });
    }

    const emoji = payload.severity === 'CRITICAL' ? '🚨' : payload.severity === 'DANGER' ? '🔥' : '⚠️';
    
    const text = `${emoji} *Smart Maggot Box Alert*\n\n` +
                 `*Severity:* ${payload.severity}\n` +
                 `*Rule:* ${payload.rule_name}\n\n` +
                 `*Message:* ${payload.message}\n\n` +
                 `*Current State:*\n` +
                 `🌡️ Temperature: ${payload.temperature}°C\n` +
                 `💧 Humidity: ${payload.humidity}%\n\n` +
                 `_Time: ${new Date(payload.created_at).toLocaleString()}_`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    // Broadcast to all active subscribers concurrently
    await Promise.allSettled(
      subscribers.map(sub => 
        fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: sub.chat_id,
            text: text,
            parse_mode: 'Markdown'
          })
        })
      )
    );

    return NextResponse.json({ success: true, broadcast_count: subscribers.length });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
