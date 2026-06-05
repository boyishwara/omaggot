'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, FileJson, FileSpreadsheet, Activity, Thermometer, Droplets, BellRing, CalendarDays } from 'lucide-react';

// ─── helpers ───────────────────────────────────────────────────────────────
type Preset = { label: string; days: number };
const PRESETS: Preset[] = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

interface Stats {
  count: number;
  avgTemp: number;
  avgHumidity: number;
  minTemp: number;
  maxTemp: number;
  alertCount: number;
}

// ─── Stat mini-card ─────────────────────────────────────────────────────────
function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100`}>
      <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [fromDate, setFromDate] = useState(toDateString(new Date(Date.now() - 7 * 86400000)));
  const [toDate, setToDate] = useState(toDateString(new Date()));
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch stats for the selected date range
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const params = new URLSearchParams({ limit: '5000' });
      if (fromDate) params.set('from', `${fromDate}T00:00:00Z`);
      if (toDate) params.set('to', `${toDate}T23:59:59Z`);

      const [sensorRes, alertRes] = await Promise.all([
        fetch(`/api/sensor?${params}`),
        fetch(`/api/export?format=json&status=${statusFilter}${fromDate ? `&from=${fromDate}T00:00:00Z` : ''}${toDate ? `&to=${toDate}T23:59:59Z` : ''}`),
      ]);

      const sensorJson = await sensorRes.json();
      const readings: any[] = sensorJson.success ? sensorJson.data : [];

      // Fetch notifications count separately
      const notifRes = await fetch(`/api/sensor?limit=1`); // just a proxy to get count
      const _ = await notifRes.json();

      if (readings.length > 0) {
        const temps = readings.map((r: any) => r.temperature);
        const humids = readings.map((r: any) => r.humidity);
        const alertReadings = readings.filter((r: any) => r.status !== 'NORMAL');
        setStats({
          count: readings.length,
          avgTemp: temps.reduce((a: number, b: number) => a + b, 0) / temps.length,
          avgHumidity: humids.reduce((a: number, b: number) => a + b, 0) / humids.length,
          minTemp: Math.min(...temps),
          maxTemp: Math.max(...temps),
          alertCount: alertReadings.length,
        });
      } else {
        setStats({ count: 0, avgTemp: 0, avgHumidity: 0, minTemp: 0, maxTemp: 0, alertCount: 0 });
      }
    } catch {
      setStats(null);
    }
    setLoadingStats(false);
  };

  // Apply preset
  const applyPreset = (days: number) => {
    const to = new Date();
    const from = days === 0 ? new Date() : new Date(Date.now() - days * 86400000);
    setFromDate(toDateString(from));
    setToDate(toDateString(to));
  };

  useEffect(() => { fetchStats(); }, [fromDate, toDate, statusFilter]);

  const handleExport = (format: 'csv' | 'json', type: 'sensor' | 'alerts' = 'sensor') => {
    if (type === 'sensor') {
      let url = `/api/export?format=${format}&status=${statusFilter}`;
      if (fromDate) url += `&from=${fromDate}T00:00:00Z`;
      if (toDate) url += `&to=${toDate}T23:59:59Z`;
      window.open(url, '_blank');
    } else {
      // Export notifications
      let url = `/api/export?format=${format}&type=notifications`;
      if (fromDate) url += `&from=${fromDate}T00:00:00Z`;
      if (toDate) url += `&to=${toDate}T23:59:59Z`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">Data &amp; Reports</h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">Export and analyse historical sensor data</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

        {/* Left: Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-teal-500" />Date Range</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.days)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors border border-transparent hover:border-teal-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Manual range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">From</label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">To</label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
              </div>
              {/* Status filter */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500/50 outline-none hover:bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="warning">Warning Only</option>
                  <option value="danger">Danger Only</option>
                  <option value="critical">Critical Only</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Export buttons */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-4 w-4 text-teal-500" />Export Sensor Data</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="primary" onClick={() => handleExport('csv')} className="flex items-center justify-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4" />CSV
              </Button>
              <Button variant="secondary" onClick={() => handleExport('json')} className="flex items-center justify-center gap-2 text-sm">
                <FileJson className="h-4 w-4" />JSON
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Stats preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-teal-500" />Period Summary</CardTitle>
                <button onClick={fetchStats} className="text-xs text-teal-600 hover:text-teal-700 font-semibold">Refresh</button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              ) : stats && stats.count > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MiniStat icon={<Activity className="h-3.5 w-3.5 text-teal-600" />} label="Total Readings" value={stats.count.toLocaleString()} color="bg-teal-50" />
                  <MiniStat icon={<Thermometer className="h-3.5 w-3.5 text-rose-500" />} label="Avg Temperature" value={`${stats.avgTemp.toFixed(1)}°C`} color="bg-rose-50" />
                  <MiniStat icon={<Droplets className="h-3.5 w-3.5 text-blue-500" />} label="Avg Humidity" value={`${stats.avgHumidity.toFixed(1)}%`} color="bg-blue-50" />
                  <MiniStat icon={<Thermometer className="h-3.5 w-3.5 text-amber-500" />} label="Min Temp" value={`${stats.minTemp.toFixed(1)}°C`} color="bg-amber-50" />
                  <MiniStat icon={<Thermometer className="h-3.5 w-3.5 text-red-500" />} label="Max Temp" value={`${stats.maxTemp.toFixed(1)}°C`} color="bg-red-50" />
                  <MiniStat icon={<BellRing className="h-3.5 w-3.5 text-orange-500" />} label="Alert Events" value={stats.alertCount.toLocaleString()} color="bg-orange-50" />
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No data for selected range</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date range summary line */}
          {stats && stats.count > 0 && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm text-teal-700">
              <span className="font-semibold">{stats.count.toLocaleString()} readings</span> from{' '}
              <span className="font-semibold">{fromDate}</span> to{' '}
              <span className="font-semibold">{toDate}</span> · {' '}
              <span className="font-semibold">{stats.alertCount}</span> alert event{stats.alertCount !== 1 ? 's' : ''} recorded.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
