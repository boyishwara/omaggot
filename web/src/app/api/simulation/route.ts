import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { status } = body; // 'NORMAL', 'WARNING', 'DANGER', 'NONE'

    if (!['NORMAL', 'WARNING', 'DANGER', 'NONE'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({ key: 'simulation_status', value: status, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'simulation_status')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    
    return NextResponse.json({ success: true, status: data?.value || 'NONE' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
