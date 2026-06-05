'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/classnames';

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  unit?: string;
  icon: React.ReactNode;
  iconBg: string;
  index?: number;
}

export function StatCard({ label, value, unit, icon, iconBg, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-xl', iconBg)}>{icon}</div>
      </div>
      <div className="flex items-baseline space-x-1">
        {typeof value === 'string' ? (
          <span className="text-4xl font-bold text-slate-800 tracking-tighter font-sans">{value}</span>
        ) : value}
        {unit && <span className="text-slate-400 font-semibold text-lg">{unit}</span>}
      </div>
    </motion.div>
  );
}
