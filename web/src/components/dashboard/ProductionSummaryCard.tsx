import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Database, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export function ProductionSummaryCard() {
  const [totalPakan, setTotalPakan] = useState(0);
  const [totalMaggot, setTotalMaggot] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProduction = async () => {
      setLoading(true);
      const supabase = createClient();
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data } = await supabase
        .from('production_records')
        .select('pakan_kg, maggot_kg')
        .gte('recorded_at', sevenDaysAgo.toISOString());
        
      if (data) {
        setTotalPakan(data.reduce((acc: number, curr: any) => acc + Number(curr.pakan_kg || 0), 0));
        setTotalMaggot(data.reduce((acc: number, curr: any) => acc + Number(curr.maggot_kg || 0), 0));
      }
      setLoading(false);
    };
    
    fetchRecentProduction();
  }, []);

  return (
    <Card className="border border-indigo-100 shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-indigo-50 bg-indigo-50/30 rounded-t-xl flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-indigo-800">
          <Database className="h-4 w-4 text-indigo-600" />
          Production (Last 7 Days)
        </CardTitle>
        <Link href="/dashboard/production" className="text-xs text-indigo-600 font-semibold hover:underline">
          Manage &rarr;
        </Link>
      </CardHeader>
      <CardContent className="px-4 py-3 space-y-2.5">
        {loading ? (
          <div className="text-center text-xs text-slate-400 py-2">Loading...</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Feed Used</span>
              <span className="text-xs font-bold text-slate-700">{totalPakan.toFixed(2)} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Maggot Harvested</span>
              <span className="text-xs font-bold text-teal-600">{totalMaggot.toFixed(2)} kg</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Est. FCR: {totalMaggot > 0 ? (totalPakan / totalMaggot).toFixed(2) : '—'}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Yield: {totalPakan > 0 ? ((totalMaggot / totalPakan) * 100).toFixed(1) : '—'}%
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
