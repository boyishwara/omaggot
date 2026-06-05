import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * DELETE /api/data/clear
 * Body: { strategy, from?, to?, date?, olderThanDays?, status?, also_notifications? }
 *
 * Strategies:
 *   "date_range"      - delete between from → to
 *   "single_day"      - delete all readings on `date` (YYYY-MM-DD)
 *   "older_than"      - delete readings older than `olderThanDays` days
 *   "by_status"       - delete readings where status = `status`
 *   "all"             - delete ALL readings (requires confirm: true)
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { strategy, from, to, date, olderThanDays, status, also_notifications, confirm } = body;
    const supabase = createAdminClient();

    let sensorQuery: any = supabase.from('sensor_readings').delete();
    let notifQuery: any = supabase.from('notifications').delete();
    let deletedLabel = '';

    switch (strategy) {
      case 'date_range': {
        if (!from || !to) return NextResponse.json({ success: false, error: 'Provide from and to for date_range strategy' }, { status: 400 });
        sensorQuery = sensorQuery.gte('recorded_at', from).lte('recorded_at', to);
        notifQuery = notifQuery.gte('created_at', from).lte('created_at', to);
        deletedLabel = `range ${from} → ${to}`;
        break;
      }
      case 'single_day': {
        if (!date) return NextResponse.json({ success: false, error: 'Provide date for single_day strategy' }, { status: 400 });
        const dayStart = `${date}T00:00:00.000Z`;
        const dayEnd = `${date}T23:59:59.999Z`;
        sensorQuery = sensorQuery.gte('recorded_at', dayStart).lte('recorded_at', dayEnd);
        notifQuery = notifQuery.gte('created_at', dayStart).lte('created_at', dayEnd);
        deletedLabel = `day ${date}`;
        break;
      }
      case 'older_than': {
        if (!olderThanDays || isNaN(Number(olderThanDays))) return NextResponse.json({ success: false, error: 'Provide olderThanDays for older_than strategy' }, { status: 400 });
        const cutoff = new Date(Date.now() - Number(olderThanDays) * 86400000).toISOString();
        sensorQuery = sensorQuery.lt('recorded_at', cutoff);
        notifQuery = notifQuery.lt('created_at', cutoff);
        deletedLabel = `older than ${olderThanDays} days`;
        break;
      }
      case 'by_status': {
        if (!status) return NextResponse.json({ success: false, error: 'Provide status for by_status strategy' }, { status: 400 });
        sensorQuery = sensorQuery.eq('status', status.toUpperCase());
        notifQuery = notifQuery.eq('severity', status.toUpperCase());
        deletedLabel = `status = ${status.toUpperCase()}`;
        break;
      }
      case 'all': {
        if (!confirm) return NextResponse.json({ success: false, error: 'Must pass confirm: true for all-delete' }, { status: 400 });
        // Supabase requires a filter even for full-table delete; use gte('id', 0) as a truthy filter
        sensorQuery = sensorQuery.gte('id', 0);
        notifQuery = notifQuery.gte('id', 0);
        deletedLabel = 'ALL data';
        break;
      }
      default:
        return NextResponse.json({ success: false, error: `Unknown strategy: ${strategy}` }, { status: 400 });
    }

    if (also_notifications) {
      const { error: notifError } = await notifQuery;
      if (notifError) throw notifError;
    }

    const { error: sensorError } = await sensorQuery;
    if (sensorError) throw sensorError;

    return NextResponse.json({ success: true, message: `Deleted ${deletedLabel}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
