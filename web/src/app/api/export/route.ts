import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const format = searchParams.get('format') || 'json';
    const status = searchParams.get('status') || 'all';

    const supabase = createAdminClient();
    
    let query = supabase
      .from('sensor_readings')
      .select('*')
      .order('recorded_at', { ascending: true });

    if (from) {
      query = query.gte('recorded_at', from);
    }
    if (to) {
      query = query.lte('recorded_at', to);
    }
    if (status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    const { data, error } = await query;

    if (error) throw error;

    if (format === 'csv') {
      if (!data || data.length === 0) {
        return new NextResponse('No data found', { status: 404 });
      }
      // Generate CSV
      const headers = ['id', 'recorded_at', 'temperature', 'humidity', 'heat_index', 'status'];
      const csvRows = [headers.join(',')];
      
      for (const row of data) {
        csvRows.push([
          row.id,
          row.recorded_at,
          row.temperature,
          row.humidity,
          row.heat_index || '',
          row.status
        ].join(','));
      }
      
      const csvString = csvRows.join('\n');
      return new NextResponse(csvString, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="maggot-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
