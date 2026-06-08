import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pakan_kg, maggot_kg, user_id, recorded_at } = body;

    if (typeof pakan_kg !== 'number' || typeof maggot_kg !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid payload: pakan_kg and maggot_kg must be numbers' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Insert reading
    const payload: any = {
      pakan_kg,
      maggot_kg,
      recorded_by: user_id || null
    };

    if (recorded_at) {
      payload.recorded_at = recorded_at;
    }

    const { data: recordData, error: insertError } = await supabase
      .from('production_records')
      .insert(payload)
      .select('*')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      data: recordData
    });

  } catch (error: any) {
    console.error('Error processing production data:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const supabase = createAdminClient();
    
    let query = supabase
      .from('production_records')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (from) {
      query = query.gte('recorded_at', from);
    }
    if (to) {
      query = query.lte('recorded_at', to);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
