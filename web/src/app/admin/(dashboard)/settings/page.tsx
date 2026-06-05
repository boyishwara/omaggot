'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Activity, Server, Smartphone, Users, BellRing, Database, Wifi, UserX } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ─── Subscriber row ───────────────────────────────────────────────────────
function SubscriberRow({ sub, onUnsubscribe }: { sub: any; onUnsubscribe: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {sub.first_name || sub.username || 'Unknown'}{sub.username ? ` @${sub.username}` : ''}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">ID: {sub.chat_id}</p>
      </div>
      <div className="flex items-center gap-2 ml-3 shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.is_active ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-slate-100 text-slate-400'}`}>
          {sub.is_active ? 'Active' : 'Inactive'}
        </span>
        {sub.is_active && (
          <button
            onClick={() => onUnsubscribe(sub.chat_id)}
            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove subscriber"
          >
            <UserX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Stat row ───────────────────────────────────────────────────────────────
function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 text-slate-600 min-w-0">
        {icon}
        <span className="font-medium text-sm truncate">{label}</span>
      </div>
      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-mono font-semibold shrink-0 ml-2">{value}</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const supabase = createClient();
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({ sensorCount: 0, alertCount: 0, activeRules: 0 });
  const [lastSeen, setLastSeen] = useState<string>('Unknown');
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [subRes, sensorRes, alertRes, rulesRes, latestRes] = await Promise.all([
        (supabase as any).from('telegram_subscribers').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('sensor_readings').select('id', { count: 'exact', head: true }),
        (supabase as any).from('notifications').select('id', { count: 'exact', head: true }),
        (supabase as any).from('warning_rules').select('id', { count: 'exact', head: true }).eq('is_active', true),
        (supabase as any).from('sensor_readings').select('recorded_at').order('recorded_at', { ascending: false }).limit(1).single(),
      ]);

      if (subRes.data) setSubscribers(subRes.data);
      setSystemStats({
        sensorCount: sensorRes.count ?? 0,
        alertCount: alertRes.count ?? 0,
        activeRules: rulesRes.count ?? 0,
      });
      if (latestRes.data?.recorded_at) {
        const diffMins = Math.floor((Date.now() - new Date(latestRes.data.recorded_at).getTime()) / 60000);
        setLastSeen(diffMins < 1 ? 'Just now' : diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`);
      }
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleTestNotification = async () => {
    setTestStatus('loading');
    try {
      const res = await fetch('/api/notify/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity: 'CRITICAL', message: 'This is a test notification from the admin panel.' }),
      });
      setTestStatus(res.ok ? 'success' : 'error');
      if (res.ok) setTimeout(() => setTestStatus('idle'), 3000);
    } catch {
      setTestStatus('error');
    }
  };

  const handleUnsubscribe = async (chatId: string) => {
    await (supabase as any).from('telegram_subscribers').update({ is_active: false }).eq('chat_id', chatId);
    fetchAll();
  };

  const activeCount = subscribers.filter((s) => s.is_active).length;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">System configuration and monitoring</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* System Health */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-4 w-4 text-teal-500" />System Health</CardTitle></CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-3 animate-pulse">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}</div>
              ) : (
                <>
                  <StatRow icon={<Activity className="h-4 w-4 text-teal-500" />} label="Total Sensor Readings" value={systemStats.sensorCount.toLocaleString()} />
                  <StatRow icon={<BellRing className="h-4 w-4 text-orange-500" />} label="Total Alerts Fired" value={systemStats.alertCount.toLocaleString()} />
                  <StatRow icon={<Wifi className="h-4 w-4 text-blue-500" />} label="Active Warning Rules" value={String(systemStats.activeRules)} />
                  <StatRow icon={<Smartphone className="h-4 w-4 text-violet-500" />} label="ESP32 Last Seen" value={lastSeen} />
                  <StatRow icon={<Server className="h-4 w-4 text-slate-500" />} label="Version" value="1.0.0" />
                  <StatRow icon={<Activity className="h-4 w-4 text-slate-500" />} label="Environment" value="Production" />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Diagnostics */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-4 w-4 text-teal-500" />Diagnostics</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                Send a simulated <span className="font-semibold text-slate-800">CRITICAL</span> alert to verify your notification pipeline end-to-end - this will send a real Telegram message to all active subscribers.
              </div>
              <Button
                variant="secondary"
                onClick={handleTestNotification}
                disabled={testStatus === 'loading'}
                className="w-full flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4 text-teal-600" />
                {testStatus === 'loading' ? 'Sending…' : testStatus === 'success' ? '✅ Sent Successfully!' : 'Trigger Test Notification'}
              </Button>
              {testStatus === 'error' && (
                <p className="text-red-500 text-xs font-medium text-center">Failed. Check API logs for details.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Telegram Subscribers */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />Telegram Subscribers
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {activeCount} active
                  </span>
                  <button onClick={fetchAll} className="text-xs text-teal-600 hover:text-teal-700 font-semibold">Refresh</button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-2 animate-pulse">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg" />)}</div>
              ) : subscribers.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No subscribers yet</p>
                  <p className="text-xs mt-1">Send /subscribe to the Telegram bot to add yourself.</p>
                </div>
              ) : (
                <div className="divide-y divide-transparent">
                  {subscribers.map((sub) => (
                    <SubscriberRow key={sub.id} sub={sub} onUnsubscribe={handleUnsubscribe} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
