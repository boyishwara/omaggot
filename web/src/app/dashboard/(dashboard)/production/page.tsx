'use client';

import React, { useEffect, useState } from 'react';
import { ProductionInput } from '@/components/dashboard/ProductionInput';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Database, Info, Pencil, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BlockedPage } from '@/components/ui/BlockedPage';

type ProductionRecord = {
  id: string;
  recorded_at: string;
  pakan_kg: number;
  maggot_kg: number;
};

function EditModal({
  record,
  onClose,
  onSaved,
}: {
  record: ProductionRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pakanKg, setPakanKg] = useState(String(record.pakan_kg));
  const [maggotKg, setMaggotKg] = useState(String(record.maggot_kg));
  const [recordedAt, setRecordedAt] = useState(
    new Date(record.recorded_at).toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/production/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pakan_kg: parseFloat(pakanKg || '0'),
          maggot_kg: parseFloat(maggotKg || '0'),
          recorded_at: new Date(recordedAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Record</h2>
            <p className="text-xs text-slate-500 mt-0.5">Update production entry values.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Feed / Nutrisi (kg)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={pakanKg}
              onChange={(e) => setPakanKg(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Maggot (kg)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={maggotKg}
              onChange={(e) => setMaggotKg(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Date & Time</label>
            <Input
              type="datetime-local"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="h-9 text-sm max-w-[220px] w-full"
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 h-9 text-sm bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProductionPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProfileAndData = async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setSessionUser(session.user);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profile) setUserProfile(profile);
    }

    const { data: prodData } = await supabase
      .from('production_records')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(10);

    if (prodData) setRecords(prodData);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this production record? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/production/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      fetchProfileAndData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading production data...</div>;
  }

  const role = userProfile?.role || sessionUser?.user_metadata?.role || 'user';
  const isApproved = userProfile?.is_approved ?? true;
  const canManage = (role === 'admin' && isApproved) || role === 'superadmin';

  if (!canManage) {
    return (
      <BlockedPage 
        title="Access Restricted" 
        message="The production tab can only be accessed by admin and superadmin users." 
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6">
      {/* Edit Modal */}
      <AnimatePresence>
        {editingRecord && (
          <EditModal
            record={editingRecord}
            onClose={() => setEditingRecord(null)}
            onSaved={fetchProfileAndData}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm"
      >
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
            Production Data
          </h1>
          <p className="text-slate-500 mt-0.5 text-xs sm:text-sm">
            Record feed input and maggot harvests to track farming efficiency.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="lg:col-span-1 space-y-6"
        >
          <ProductionInput userProfile={userProfile || { id: sessionUser?.id, role, is_approved: isApproved }} onAdd={fetchProfileAndData} />

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
                <li>
                  <strong>Feed Conversion Ratio (FCR):</strong> Ideally between{' '}
                  <strong>4.0 - 6.0</strong> for wet waste.
                </li>
                <li>
                  <strong>Bioconversion Yield:</strong> Ideally between{' '}
                  <strong>15% - 25%</strong> of the wet weight of the feed.
                </li>
              </ul>
              <p className="text-xs text-slate-500 italic mt-2">
                Check the Reports tab for AI-calculated insights based on your inputted data.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-slate-500" />
                Recent Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-10">
                  No production records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 font-semibold text-slate-600">Date &amp; Time</th>
                        <th className="py-3 font-semibold text-slate-600">Feed (kg)</th>
                        <th className="py-3 font-semibold text-slate-600">Maggot (kg)</th>
                        <th className="py-3 font-semibold text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 text-slate-600">
                            {new Date(r.recorded_at).toLocaleString()}
                          </td>
                          <td className="py-3 text-slate-800 font-medium">
                            {Number(r.pakan_kg).toFixed(2)}
                          </td>
                          <td className="py-3 text-slate-800 font-medium">
                            {Number(r.maggot_kg).toFixed(2)}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingRecord(r)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                                title="Edit record"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={deletingId === r.id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                                title="Delete record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
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
