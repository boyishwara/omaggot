import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Telegram sends updates inside an 'message' object
    if (!body.message || !body.message.text) {
      return NextResponse.json({ success: true, message: 'Not a text message' });
    }

    const { chat, text, from } = body.message;
    const chatId = chat.id.toString();
    const command = text.trim().toLowerCase();

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is missing');
    }

    const supabase = createAdminClient();

    let replyMessage = '';

    if (command === '/start' || command === '/subscribe') {
      // Upsert subscriber
      const { error } = await supabase
        .from('telegram_subscribers')
        .upsert(
          { 
            chat_id: chatId, 
            username: from.username || null,
            first_name: from.first_name || null,
            is_active: true,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'chat_id' }
        );

      if (error) throw error;
      replyMessage = '✅ Successfully subscribed to Smart Maggot Box alerts! You will receive notifications when conditions become critical.\n\nSend /unsubscribe at any time to stop alerts.';
    
    } else if (command === '/unsubscribe') {
      // Deactivate subscriber
      const { error } = await supabase
        .from('telegram_subscribers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('chat_id', chatId);

      if (error) throw error;
      replyMessage = '❌ Unsubscribed from alerts. Send /subscribe if you wish to receive them again.';
    
    } else {
      replyMessage = 'I only understand /subscribe and /unsubscribe.';
    }

    // Send reply back to Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyMessage
      })
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram Bot Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
