import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { from, to, also_notifications } = body;
    const supabase = createAdminClient();
    
    if (!from || !to) {
       return NextResponse.json({ success: false, error: 'Must provide from and to dates' }, { status: 400 });
    }

    // Step 1: Optional delete from notifications
    if (also_notifications) {
      const { error: notifError } = await supabase
        .from('notifications')
        .delete()
        .gte('created_at', from)
        .lte('created_at', to);
      if (notifError) throw notifError;
    }

    // Step 2: Delete from sensor_readings
    const { error: sensorError } = await supabase
      .from('sensor_readings')
      .delete()
      .gte('recorded_at', from)
      .lte('recorded_at', to);

    if (sensorError) throw sensorError;

    return NextResponse.json({ success: true, message: 'Data cleared successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
