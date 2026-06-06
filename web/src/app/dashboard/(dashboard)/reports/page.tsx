'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Download, Trash2, CalendarDays, Activity, Thermometer,
  Droplets, BellRing, ChevronDown, X, AlertTriangle, BarChart3,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ApprovalGate } from '@/components/ui/ApprovalGate';

// ─── types ───────────────────────────────────────────────────────────────────
type ExportFormat = 'csv' | 'tsv' | 'xlsx' | 'json';
type DeleteStrategy = 'date_range' | 'single_day' | 'older_than' | 'by_status' | 'all';

interface Stats {
  count: number;
  avgTemp: number;
  avgHum: number;
  minTemp: number;
  maxTemp: number;
  minHum: number;
  maxHum: number;
  alertCount: number;
  normalCount: number;
  warningCount: number;
  dangerCount: number;
  peakTempTime: string;
  peakHumTime: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

const FORMATS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Best for spreadsheet analysis - opens in Excel, Google Sheets' },
  { value: 'csv', label: 'CSV (.csv)', desc: 'Universal - works with any tool, databases, Python/pandas' },
  { value: 'tsv', label: 'TSV (.tsv)', desc: 'Tab-separated - ideal for direct paste into Excel' },
  { value: 'json', label: 'JSON (.json)', desc: 'For developers and API integrations' },
];

const DELETE_STRATEGIES: { value: DeleteStrategy; label: string; desc: string; color: string }[] = [
  { value: 'single_day', label: 'Specific Day', desc: 'Delete all readings on a chosen date', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'date_range', label: 'Date Range', desc: 'Delete all readings between two dates', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'older_than', label: 'Older Than…', desc: 'Delete data older than N days (save storage)', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { value: 'by_status', label: 'By Status', desc: 'Delete only NORMAL readings (keep alert history)', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'all', label: 'Delete ALL', desc: 'Wipe entire sensor history - irreversible!', color: 'text-red-700 bg-red-50 border-red-300' },
];

// ─── sub-components ──────────────────────────────────────────────────────────
function MiniStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${color || 'text-slate-800'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span>{count.toLocaleString()} ({pct.toFixed(1)}%)</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function ExportModal({
  open, onClose, format, setFormat, onConfirm, fromDate, toDate, stats,
}: {
  open: boolean; onClose: () => void; format: ExportFormat; setFormat: (f: ExportFormat) => void;
  onConfirm: () => void; fromDate: string; toDate: string; stats: Stats | null;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Download className="h-4 w-4 text-teal-500" />Export Data</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-sm text-teal-700 space-y-0.5">
                <p><span className="font-semibold">{stats?.count.toLocaleString() ?? '-'} records</span> from <span className="font-semibold">{fromDate}</span> to <span className="font-semibold">{toDate}</span></p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Choose format</p>
                {FORMATS.map((f) => (
                  <button key={f.value} onClick={() => setFormat(f.value)} className={`w-full text-left p-3 rounded-xl border transition-all ${format === f.value ? 'bg-teal-50 border-teal-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                    <p className={`text-sm font-semibold ${format === f.value ? 'text-teal-700' : 'text-slate-700'}`}>{f.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-slate-100">
              <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={onConfirm} className="flex-1 flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />Download {format.toUpperCase()}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DeleteModal({
  open, onClose, onConfirm, strategy, setStrategy, deleteDate, setDeleteDate,
  deleteFrom, setDeleteFrom, deleteTo, setDeleteTo, olderThanDays, setOlderThanDays,
  deleteStatus, setDeleteStatus, deleteNotifs, setDeleteNotifs,
}: any) {
  const [confirmText, setConfirmText] = useState('');
  const cfg = DELETE_STRATEGIES.find((s) => s.value === strategy)!;
  const needsTypedConfirm = strategy === 'all';

  const canDelete = strategy !== 'all' || confirmText === 'DELETE ALL';

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Trash2 className="h-4 w-4 text-red-500" />Delete Readings</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Strategy picker */}
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-700">Delete strategy</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {DELETE_STRATEGIES.map((s) => (
                    <button key={s.value} onClick={() => { setStrategy(s.value); setConfirmText(''); }} className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${strategy === s.value ? s.color : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {s.label} <span className="font-normal text-xs opacity-70">- {s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy inputs */}
              {strategy === 'single_day' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Select date</label>
                  <Input type="date" value={deleteDate} onChange={(e) => setDeleteDate(e.target.value)} />
                </div>
              )}
              {strategy === 'date_range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">From</label><Input type="date" value={deleteFrom} onChange={(e) => setDeleteFrom(e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">To</label><Input type="date" value={deleteTo} onChange={(e) => setDeleteTo(e.target.value)} /></div>
                </div>
              )}
              {strategy === 'older_than' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Delete readings older than</label>
                  <div className="flex gap-2 flex-wrap">
                    {[7, 30, 60, 90].map((d) => (
                      <button key={d} onClick={() => setOlderThanDays(String(d))} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${olderThanDays === String(d) ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{d} days</button>
                    ))}
                    <Input type="number" placeholder="Custom" value={olderThanDays} onChange={(e) => setOlderThanDays(e.target.value)} className="w-24 h-8 text-xs" />
                  </div>
                </div>
              )}
              {strategy === 'by_status' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Delete readings with status</label>
                  <div className="flex gap-2 flex-wrap">
                    {['NORMAL', 'WARNING', 'DANGER'].map((s) => (
                      <button key={s} onClick={() => setDeleteStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${deleteStatus === s ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {strategy === 'all' && (
                <div className="space-y-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <div className="flex items-start gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">This will permanently delete ALL sensor readings. This cannot be undone.</p>
                  </div>
                  <Input placeholder='Type "DELETE ALL" to confirm' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="text-sm" />
                </div>
              )}

              {/* Also delete notifications */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={deleteNotifs} onChange={(e) => setDeleteNotifs(e.target.checked)} className="w-4 h-4 accent-teal-500" />
                <span className="text-sm text-slate-600">Also delete associated alert notifications</span>
              </label>
            </div>
            <div className="flex gap-2 p-5 border-t border-slate-100">
              <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
              <button
                onClick={() => canDelete && onConfirm()}
                disabled={!canDelete}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${canDelete ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                <Trash2 className="h-4 w-4" />Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [fromDate, setFromDate] = useState(toDateStr(new Date(Date.now() - 7 * 86400000)));
  const [toDate, setToDate] = useState(toDateStr(new Date()));
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const supabase = createClient();

  // Export modal
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [delStrategy, setDelStrategy] = useState<DeleteStrategy>('date_range');
  const [delDate, setDelDate] = useState(toDateStr(new Date()));
  const [delFrom, setDelFrom] = useState(toDateStr(new Date(Date.now() - 7 * 86400000)));
  const [delTo, setDelTo] = useState(toDateStr(new Date()));
  const [olderThanDays, setOlderThanDays] = useState('30');
  const [delStatus, setDelStatus] = useState('NORMAL');
  const [delNotifs, setDelNotifs] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);
      }
      const params = new URLSearchParams({ limit: '5000' });
      if (fromDate) params.set('from', `${fromDate}T00:00:00Z`);
      if (toDate) params.set('to', `${toDate}T23:59:59Z`);
      const res = await fetch(`/api/sensor?${params}`);
      const json = await res.json();
      const readings: any[] = json.success ? json.data : [];
      if (!readings.length) { setStats(null); return; }

      const temps = readings.map((r) => r.temperature);
      const hums = readings.map((r) => r.humidity);
      const peakTempReading = readings.reduce((a, b) => a.temperature > b.temperature ? a : b);
      const peakHumReading = readings.reduce((a, b) => a.humidity > b.humidity ? a : b);

      const bySeverity = (s: string) => readings.filter((r) => r.status === s).length;
      setStats({
        count: readings.length,
        avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
        avgHum: hums.reduce((a, b) => a + b, 0) / hums.length,
        minTemp: Math.min(...temps),
        maxTemp: Math.max(...temps),
        minHum: Math.min(...hums),
        maxHum: Math.max(...hums),
        alertCount: readings.filter((r) => r.status !== 'NORMAL').length,
        normalCount: bySeverity('NORMAL'),
        warningCount: bySeverity('WARNING'),
        dangerCount: bySeverity('DANGER'),
        peakTempTime: new Date(peakTempReading.recorded_at).toLocaleString(),
        peakHumTime: new Date(peakHumReading.recorded_at).toLocaleString(),
      });
    } finally {
      setLoadingStats(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const applyPreset = (days: number) => {
    setToDate(toDateStr(new Date()));
    setFromDate(toDateStr(days === 0 ? new Date() : new Date(Date.now() - days * 86400000)));
  };

  const handleExport = () => {
    let url = `/api/export?format=${exportFormat}`;
    if (fromDate) url += `&from=${fromDate}T00:00:00Z`;
    if (toDate) url += `&to=${toDate}T23:59:59Z`;
    window.open(url, '_blank');
    setExportOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const payload: any = { strategy: delStrategy, also_notifications: delNotifs };
    if (delStrategy === 'date_range') { payload.from = `${delFrom}T00:00:00Z`; payload.to = `${delTo}T23:59:59Z`; }
    if (delStrategy === 'single_day') { payload.date = delDate; }
    if (delStrategy === 'older_than') { payload.olderThanDays = Number(olderThanDays); }
    if (delStrategy === 'by_status') { payload.status = delStatus; }
    if (delStrategy === 'all') { payload.confirm = true; }

    const res = await fetch('/api/data/clear', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    setDeleting(false);
    setDeleteOpen(false);
    if (json.success) { fetchStats(); alert(`✅ ${json.message}`); }
    else { alert(`❌ Error: ${json.error}`); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">Data &amp; Reports</h1>
          <p className="text-slate-500 mt-0.5 text-xs sm:text-sm">Analyse, export, and manage historical sensor data</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {userProfile && userProfile.role !== 'user' && (
            <ApprovalGate
              allowed={(userProfile.role === 'admin' && userProfile.is_approved) || userProfile.role === 'superadmin'}
              message="Needs Superadmin approval to delete data."
            >
              <Button variant="secondary" onClick={() => setDeleteOpen(true)} className="flex items-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />Delete
              </Button>
            </ApprovalGate>
          )}
          <Button variant="primary" onClick={() => setExportOpen(true)} className="flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />Export
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-wrap items-end gap-4">
              {/* Presets */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Select</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESETS.map((p) => (
                    <button key={p.label} onClick={() => applyPreset(p.days)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors border border-transparent hover:border-teal-200">
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Date range */}
              <div className="flex items-end gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">From</label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">To</label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary view */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-teal-500" />Period Summary</CardTitle>
              <button onClick={fetchStats} className="text-xs text-teal-600 hover:text-teal-700 font-semibold">↻ Refresh</button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
              </div>
            ) : !stats ? (
              <div className="py-12 text-center text-slate-400">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No data for selected range</p>
                <p className="text-xs mt-1">Try a different date range or preset.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Key metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniStat label="Total Readings" value={stats.count.toLocaleString()} color="text-teal-700" />
                  <MiniStat label="Alert Events" value={stats.alertCount.toLocaleString()} color="text-rose-600" />
                  <MiniStat label="Avg Temperature" value={`${stats.avgTemp.toFixed(1)}°C`} />
                  <MiniStat label="Avg Humidity" value={`${stats.avgHum.toFixed(1)}%`} />
                  <MiniStat label="Min / Max Temp" value={`${stats.minTemp.toFixed(1)}° / ${stats.maxTemp.toFixed(1)}°C`} />
                  <MiniStat label="Min / Max Humidity" value={`${stats.minHum.toFixed(1)}% / ${stats.maxHum.toFixed(1)}%`} />
                  <MiniStat label="Peak Temp At" value={stats.maxTemp.toFixed(1) + '°C'} sub={stats.peakTempTime} />
                  <MiniStat label="Peak Humidity At" value={stats.maxHum.toFixed(1) + '%'} sub={stats.peakHumTime} />
                </div>
                {/* Status distribution */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Distribution</p>
                  <StatusBar label="Normal" count={stats.normalCount} total={stats.count} color="bg-teal-500" />
                  <StatusBar label="Warning" count={stats.warningCount} total={stats.count} color="bg-amber-400" />
                  <StatusBar label="Danger" count={stats.dangerCount} total={stats.count} color="bg-red-500" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <ExportModal
        open={exportOpen} onClose={() => setExportOpen(false)} format={exportFormat}
        setFormat={setExportFormat} onConfirm={handleExport} fromDate={fromDate}
        toDate={toDate} stats={stats}
      />
      <DeleteModal
        open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        strategy={delStrategy} setStrategy={setDelStrategy}
        deleteDate={delDate} setDeleteDate={setDelDate}
        deleteFrom={delFrom} setDeleteFrom={setDelFrom}
        deleteTo={delTo} setDeleteTo={setDelTo}
        olderThanDays={olderThanDays} setOlderThanDays={setOlderThanDays}
        deleteStatus={delStatus} setDeleteStatus={setDelStatus}
        deleteNotifs={delNotifs} setDeleteNotifs={setDelNotifs}
      />
    </div>
  );
}
