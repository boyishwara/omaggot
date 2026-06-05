import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { calculateHeatIndex, determineStatus } from '@/lib/utils/sensor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { temperature, humidity, device_id, api_key } = body;

    // Validate API Key
    if (api_key !== process.env.ESP32_API_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    if (typeof temperature !== 'number' || typeof humidity !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid payload: temperature and humidity must be numbers' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Calculate Heat Index
    const heatIndex = calculateHeatIndex(temperature, humidity);

    // Fetch active warning rules
    const { data: rules, error: rulesError } = await supabase
      .from('warning_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) throw rulesError;

    // Fetch simulation status
    const { data: simSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'simulation_status')
      .single();
      
    const simulationStatus = simSetting?.value || 'NONE';

    // Determine status
    const { status: calculatedStatus, severityRules } = determineStatus(temperature, humidity, rules || []);
    
    // Override status if simulation is active and not NONE
    const finalStatus = (simulationStatus !== 'NONE' && simulationStatus !== 'NORMAL') 
      ? simulationStatus 
      : calculatedStatus;

    // Insert reading
    const { data: readingData, error: insertError } = await supabase
      .from('sensor_readings')
      .insert({
        temperature,
        humidity,
        heat_index: heatIndex,
        status: finalStatus,
        device_id: device_id || 'esp32-001'
      })
      .select('id, status, heat_index')
      .single();

    if (insertError) throw insertError;

    // Insert notifications if needed
    let notificationsToInsert: any[] = [];
    
    // 1. If simulating, create a fake alert to test Telegram
    if (simulationStatus === 'DANGER' || simulationStatus === 'WARNING') {
      notificationsToInsert.push({
        rule_name: `TEST: Simulation ${simulationStatus}`,
        severity: simulationStatus,
        message: `This is a test alert triggered by the admin simulation panel.`,
        reading_id: readingData.id,
        temperature: temperature,
        humidity: humidity
      });
    } 
    // 2. Otherwise, if normal rules triggered, insert real alerts
    else if (calculatedStatus !== 'NORMAL' && severityRules.length > 0) {
      notificationsToInsert = severityRules.map(rule => ({
        rule_id: rule.id,
        rule_name: rule.name,
        severity: rule.severity,
        message: rule.message,
        reading_id: readingData.id,
        temperature: temperature,
        humidity: humidity
      }));
    }

    if (notificationsToInsert.length > 0) {
      await supabase.from('notifications').insert(notificationsToInsert);
    }

    return NextResponse.json({
      success: true,
      data: readingData
    });

  } catch (error: any) {
    console.error('Error processing sensor data:', error);
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
      .from('sensor_readings')
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
