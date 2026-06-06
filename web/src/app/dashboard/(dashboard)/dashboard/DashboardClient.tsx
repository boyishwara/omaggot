'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ThermometerSun, Droplets, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { LiveAlerts } from '@/components/dashboard/LiveAlerts';
import { HistoricalChart } from '@/components/dashboard/HistoricalChart';
import type { SensorReading } from '@/types';

export default function DashboardClient({
  initialReadings,
  initialNotifications,
  initialSimulationStatus,
}: {
  initialReadings: SensorReading[];
  initialNotifications: any[];
  initialSimulationStatus: string;
}) {
  const supabase = createClient();
  const [latestData, setLatestData] = useState<SensorReading | null>(initialReadings[0] || null);
  const [historyData, setHistoryData] = useState<SensorReading[]>(initialReadings);
  const [notifications, setNotifications] = useState<any[]>(initialNotifications);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(initialSimulationStatus);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const dataSub = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
        const r = payload.new as SensorReading;
        setLatestData(r);
        setIsDeviceOnline(true);
        setHistoryData((prev) => [r, ...prev].slice(0, 50));
      })
      .subscribe();

    const notifSub = supabase
      .channel('schema-notif-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dataSub);
      supabase.removeChannel(notifSub);
    };
  }, []);

  useEffect(() => {
    if (!latestData) return;
    const check = () => {
      const diff = (Date.now() - new Date(latestData.recorded_at).getTime()) / 1000;
      setIsDeviceOnline(diff < 60);
    };
    const interval = setInterval(check, 10000);
    check();
    return () => clearInterval(interval);
  }, [latestData]);

  const fetchManualData = async () => {
    setIsRefreshing(true);
    const { data } = await supabase.from('sensor_readings').select('*').order('recorded_at', { ascending: false }).limit(50);
    if (data?.length) { setLatestData(data[0]); setHistoryData(data); }
    const { data: notifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (notifs) setNotifications(notifs);
    setIsRefreshing(false);
  };

  const handleSimulate = async (status: string) => {
    setIsSimulating(true);
    await fetch('/api/simulation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setSimulationStatus(status);
    setIsSimulating(false);
  };

  const chartData = [...historyData].reverse().map((d) => ({
    time: new Date(d.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: d.temperature,
    humidity: d.humidity,
  }));

  const fmt = (v?: number | null) => (v != null ? v.toFixed(1) : '--');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Environment Overview</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Real-time metrics from Smart Maggot Box</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Simulation selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Test:</span>
            <select
              value={simulationStatus}
              onChange={(e) => handleSimulate(e.target.value)}
              disabled={isSimulating}
              className="text-sm bg-white border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="NONE">Normal</option>
              <option value="WARNING">Warning</option>
              <option value="DANGER">Danger</option>
            </select>
          </div>

          {/* Online indicator */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
            <div className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]' : 'bg-slate-400'}`} />
            <span className="text-sm font-semibold text-slate-700">{isDeviceOnline ? 'ESP32 Online' : 'Offline'}</span>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          index={0}
          label="Status"
          iconBg="bg-slate-50"
          icon={<Activity className="h-4 w-4 text-slate-400" />}
          value={<Badge status={latestData?.status || 'OFFLINE'} variant="pill">{latestData?.status || 'NO DATA'}</Badge>}
        />
        <StatCard index={1} label="Temperature" unit="°C" iconBg="bg-rose-50" icon={<ThermometerSun className="h-4 w-4 text-rose-500" />} value={fmt(latestData?.temperature)} />
        <StatCard index={2} label="Humidity" unit="%" iconBg="bg-blue-50" icon={<Droplets className="h-4 w-4 text-blue-500" />} value={fmt(latestData?.humidity)} />
        <StatCard index={3} label="Heat Index" unit="°C" iconBg="bg-amber-50" icon={<ThermometerSun className="h-4 w-4 text-amber-500" />} value={fmt(latestData?.heat_index)} />
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <HistoricalChart data={chartData} onRefresh={fetchManualData} isRefreshing={isRefreshing} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <LiveAlerts notifications={notifications} />
        </motion.div>
      </div>
    </div>
  );
}
