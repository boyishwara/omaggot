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

    if (command === '/start') {
      replyMessage = `👋 *Welcome to O'Maggot Box Bot!*\n\n` +
                     `I can help you monitor the real-time conditions of your BSF maggot cultivation box.\n\n` +
                     `*Available Commands:*\n` +
                     `👉 /subscribe - Start receiving Danger alerts automatically\n` +
                     `👉 /unsubscribe - Stop receiving automatic alerts\n` +
                     `👉 /status - Check the current temperature and humidity immediately\n\n` +
                     `Use /status to get an instant reading right now!`;
    } else if (command === '/subscribe') {
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
      replyMessage = '✅ *Successfully subscribed!* You will now receive automatic alerts when conditions become dangerous.\n\nSend /unsubscribe at any time to stop alerts.';
    
    } else if (command === '/unsubscribe') {
      // Deactivate subscriber
      const { error } = await supabase
        .from('telegram_subscribers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('chat_id', chatId);

      if (error) throw error;
      replyMessage = '❌ *Unsubscribed.* You will no longer receive alerts. Send /subscribe if you wish to receive them again.';
    
    } else if (command === '/status') {
      // Check if user is subscribed first
      const { data: subscriber } = await supabase
        .from('telegram_subscribers')
        .select('is_active')
        .eq('chat_id', chatId)
        .single();
        
      if (!subscriber || !subscriber.is_active) {
        replyMessage = '🔒 *Access Denied.*\n\nYou must be subscribed to view the live status. Send /subscribe to gain access.';
      } else {
        // Fetch latest reading
        const { data: latestReading, error } = await supabase
          .from('sensor_readings')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();
        
      if (error || !latestReading) {
        replyMessage = '⚠️ Unable to fetch the latest sensor reading. Is the device online?';
      } else {
        const date = new Date(latestReading.recorded_at);
        const now = new Date();
        const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        let timeString = '';
        if (diffSec < 60) timeString = `${diffSec} seconds ago`;
        else if (diffMin < 60) timeString = `${diffMin} minutes ago`;
        else if (diffHour < 24) timeString = `${diffHour} hours ago`;
        else if (diffDay < 7) timeString = `${diffDay} days ago`;
        else timeString = `on ${date.toLocaleDateString()}`;

        // Fetch recent production stats (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: prodData } = await supabase
          .from('production_records')
          .select('pakan_kg, maggot_kg')
          .gte('recorded_at', sevenDaysAgo.toISOString());

        let totalPakan = 0;
        let totalMaggot = 0;
        if (prodData) {
          totalPakan = prodData.reduce((acc: any, curr: any) => acc + Number(curr.pakan_kg || 0), 0);
          totalMaggot = prodData.reduce((acc: any, curr: any) => acc + Number(curr.maggot_kg || 0), 0);
        }

        replyMessage = `📊 *Current Status*\n\n` +
                       `🌡️ *Temperature:* ${latestReading.temperature}°C\n` +
                       `💧 *Humidity:* ${latestReading.humidity}%\n` +
                       `🔥 *Heat Index:* ${latestReading.heat_index}°C\n\n` +
                       `📈 *Production (Last 7 Days):*\n` +
                       `🌾 Feed Used: ${totalPakan.toFixed(2)} kg\n` +
                       `🐛 Maggot Harvested: ${totalMaggot.toFixed(2)} kg\n\n` +
                       `_Last updated: ${timeString}_`;
      }
      }
    } else {
      replyMessage = 'I only understand /start, /subscribe, /unsubscribe, and /status.';
    }

    // Send reply back to Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyMessage,
        parse_mode: 'Markdown'
      })
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram Bot Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
