import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { severity = 'WARNING', message = 'Test notification message' } = body;
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          rule_name: 'Test Rule',
          severity,
          message,
          temperature: 35.5,
          humidity: 85.0
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
