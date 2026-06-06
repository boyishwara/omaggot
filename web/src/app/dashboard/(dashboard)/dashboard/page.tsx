import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createAdminClient();

  // Fetch initial data concurrently
  const [
    { data: readingsData },
    { data: notifsData },
    { data: simSetting }
  ] = await Promise.all([
    supabase.from('sensor_readings').select('*').order('recorded_at', { ascending: false }).limit(50),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('system_settings').select('value').eq('key', 'simulation_status').single()
  ]);

  const initialReadings = readingsData || [];
  const initialNotifications = notifsData || [];
  const initialSimulationStatus = (simSetting as any)?.value || 'NONE';

  return (
    <DashboardClient 
      initialReadings={initialReadings}
      initialNotifications={initialNotifications}
      initialSimulationStatus={initialSimulationStatus}
    />
  );
}
