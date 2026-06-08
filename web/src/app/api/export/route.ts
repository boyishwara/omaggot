import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

const EXPORT_HEADERS = ['id', 'recorded_at', 'temperature', 'humidity', 'heat_index', 'status', 'device_id'];

function buildQuery(supabase: any, { from, to, status }: { from?: string | null; to?: string | null; status?: string | null }) {
  let q = supabase.from('sensor_readings').select('*').order('recorded_at', { ascending: true });
  if (from) q = q.gte('recorded_at', from);
  if (to) q = q.lte('recorded_at', to);
  if (status && status !== 'all') q = q.eq('status', status.toUpperCase());
  return q;
}

function buildProductionQuery(supabase: any, { from, to }: { from?: string | null; to?: string | null }) {
  let q = supabase.from('production_records').select('*').order('recorded_at', { ascending: true });
  if (from) q = q.gte('recorded_at', from);
  if (to) q = q.lte('recorded_at', to);
  return q;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const status = searchParams.get('status') || 'all';
    const filename = `maggot-report-${new Date().toISOString().split('T')[0]}`;

    const supabase = createAdminClient();
    const { data, error } = await buildQuery(supabase, { from, to, status });
    if (error) throw error;
    
    const { data: prodData, error: prodError } = await buildProductionQuery(supabase, { from, to });
    if (prodError) throw prodError;

    if ((!data || data.length === 0) && (!prodData || prodData.length === 0)) {
      return new NextResponse('No data found for selected range.', { status: 404 });
    }

    const PROD_HEADERS = ['id', 'recorded_at', 'pakan_kg', 'maggot_kg', 'recorded_by'];

    // ── CSV ──────────────────────────────────────────────────────────────────
    if (format === 'csv') {
      const rows = [];
      if (data && data.length > 0) {
        rows.push(EXPORT_HEADERS.join(','));
        for (const row of data) {
          rows.push(EXPORT_HEADERS.map((h) => row[h] ?? '').join(','));
        }
      }
      
      if (prodData && prodData.length > 0) {
        if (rows.length > 0) rows.push('\n--- PRODUCTION DATA ---');
        rows.push(PROD_HEADERS.join(','));
        for (const row of prodData) {
          rows.push(PROD_HEADERS.map((h) => row[h] ?? '').join(','));
        }
      }

      return new NextResponse(rows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // ── TSV (Excel-friendly tab-separated) ───────────────────────────────────
    if (format === 'tsv') {
      const rows = [];
      if (data && data.length > 0) {
        rows.push(EXPORT_HEADERS.join('\t'));
        for (const row of data) {
          rows.push(EXPORT_HEADERS.map((h) => row[h] ?? '').join('\t'));
        }
      }
      
      if (prodData && prodData.length > 0) {
        if (rows.length > 0) rows.push('\n--- PRODUCTION DATA ---');
        rows.push(PROD_HEADERS.join('\t'));
        for (const row of prodData) {
          rows.push(PROD_HEADERS.map((h) => row[h] ?? '').join('\t'));
        }
      }

      return new NextResponse(rows.join('\n'), {
        headers: {
          'Content-Type': 'text/tab-separated-values; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.tsv"`,
        },
      });
    }

    // ── XLSX (Excel binary) ───────────────────────────────────────────────────
    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();
      
      if (data && data.length > 0) {
        const wsData = data.map((row: any) =>
          EXPORT_HEADERS.reduce((acc: any, h) => { acc[h] = row[h] ?? ''; return acc; }, {})
        );
        const ws = XLSX.utils.json_to_sheet(wsData, { header: EXPORT_HEADERS });
        ws['!cols'] = [{ wch: 8 }, { wch: 24 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Sensor Data');
      }

      if (prodData && prodData.length > 0) {
        const prodWsData = prodData.map((row: any) =>
          PROD_HEADERS.reduce((acc: any, h) => { acc[h] = row[h] ?? ''; return acc; }, {})
        );
        const prodWs = XLSX.utils.json_to_sheet(prodWsData, { header: PROD_HEADERS });
        prodWs['!cols'] = [{ wch: 8 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 36 }];
        XLSX.utils.book_append_sheet(wb, prodWs, 'Production Data');
      }

      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    }

    // ── JSON (default) ────────────────────────────────────────────────────────
    return new NextResponse(JSON.stringify({ 
      success: true, 
      sensorData: { count: data?.length || 0, data: data || [] },
      productionData: { count: prodData?.length || 0, data: prodData || [] }
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
