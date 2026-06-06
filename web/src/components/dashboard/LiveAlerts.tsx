'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing } from 'lucide-react';

const SEVERITY_CONFIG: Record<string, { dot: string; label: string; msgColor: string; badgeBg: string; badgeText: string }> = {
  DANGER: {
    dot: 'bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.8)]',
    label: 'text-orange-300 font-semibold',
    msgColor: 'text-slate-200',
    badgeBg: 'bg-orange-500/20 border-orange-500/30',
    badgeText: 'text-orange-300',
  },
  WARNING: {
    dot: 'bg-amber-400',
    label: 'text-amber-300 font-semibold',
    msgColor: 'text-slate-300',
    badgeBg: 'bg-amber-500/20 border-amber-500/30',
    badgeText: 'text-amber-300',
  },
};

function SensorBadge({ value, cls }: { value: string; cls: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-mono font-medium ${cls}`}>
      {value}
    </span>
  );
}

export function LiveAlerts({ notifications }: { notifications: any[] }) {
  const cfg = (s: string) => SEVERITY_CONFIG[s] ?? SEVERITY_CONFIG.WARNING;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-teal-500 via-blue-500 to-violet-500" />
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <h3 className="text-base font-semibold text-white">Live Alerts</h3>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 350 }}>
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            <AnimatePresence initial={false}>
              {notifications.map((notif) => {
                const c = cfg(notif.severity);
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                        <span className={`text-sm truncate ${c.label}`}>{notif.rule_name}</span>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0" suppressHydrationWarning>
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 leading-relaxed ${c.msgColor}`}>{notif.message}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <SensorBadge value={`${notif.temperature}°C`} cls={`${c.badgeBg} ${c.badgeText}`} />
                      <SensorBadge value={`${notif.humidity}%`} cls={`${c.badgeBg} ${c.badgeText}`} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col justify-center items-center h-full gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <BellRing className="h-7 w-7 text-slate-500" />
            </div>
            <div>
              <p className="font-medium text-slate-300">All Clear</p>
              <p className="text-sm text-slate-500 mt-1">All parameters within optimal ranges.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
