'use client';

import React, { useEffect, useState } from 'react';
import { ProductionInput } from '@/components/dashboard/ProductionInput';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Database, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductionPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndData = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setUserProfile(profile);
    }
    
    // Fetch recent 10 records
    const { data: prodData } = await supabase
      .from('production_records')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(10);
      
    if (prodData) {
      setRecords(prodData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm"
      >
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">Production Data</h1>
          <p className="text-slate-500 mt-0.5 text-xs sm:text-sm">Record feed input and maggot harvests to track farming efficiency.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="lg:col-span-1 space-y-6">
          <ProductionInput userProfile={userProfile} onAdd={fetchProfileAndData} />
          
          <Card className="border-indigo-100 shadow-sm bg-indigo-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-indigo-800">
                <Info className="h-4 w-4 text-indigo-600" />
                Industry Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>For Black Soldier Fly (BSF) larvae processing organic waste:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Feed Conversion Ratio (FCR):</strong> Ideally between <strong>4.0 - 6.0</strong> for wet waste.</li>
                <li><strong>Bioconversion Yield:</strong> Ideally between <strong>15% - 25%</strong> of the wet weight of the feed.</li>
              </ul>
              <p className="text-xs text-slate-500 italic mt-2">Check the Reports tab for AI-calculated insights based on your inputted data.</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-slate-500" />
                Recent Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-sm text-slate-500 py-10">Loading...</div>
              ) : records.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-10">No production records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 font-semibold text-slate-600">Date &amp; Time</th>
                        <th className="py-3 font-semibold text-slate-600">Feed (kg)</th>
                        <th className="py-3 font-semibold text-slate-600">Maggot (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 text-slate-600">{new Date(r.recorded_at).toLocaleString()}</td>
                          <td className="py-3 text-slate-800 font-medium">{Number(r.pakan_kg).toFixed(2)}</td>
                          <td className="py-3 text-slate-800 font-medium">{Number(r.maggot_kg).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
