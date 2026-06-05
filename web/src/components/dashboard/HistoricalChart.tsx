'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

interface ChartPoint {
  time: string;
  temperature: number;
  humidity: number;
}

interface HistoricalChartProps {
  data: ChartPoint[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function HistoricalChart({ data, onRefresh, isRefreshing }: HistoricalChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 p-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Historical Trends</h3>
          <p className="text-xs text-slate-400 mt-0.5">Last 50 readings</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#cbd5e1" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#cbd5e1" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
            <YAxis yAxisId="right" orientation="right" stroke="#cbd5e1" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: 13 }}
              itemStyle={{ color: '#0f172a', fontWeight: 600 }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontSize: 12 }} />
            <Area yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 5, strokeWidth: 0 }} />
            <Area yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHum)" activeDot={{ r: 5, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
