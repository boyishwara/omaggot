'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, X, Edit2, ShieldAlert } from 'lucide-react';
import type { WarningRule } from '@/types';

// ──────────────────── helpers ────────────────────
const EMPTY_FORM = {
  name: '',
  parameter: 'temperature',
  condition: 'gt',
  threshold: '',
  severity: 'WARNING',
  message: '',
};

// ──────────────────── RuleModal ────────────────────
function RuleModal({
  open, onClose, onSave, editingRule,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>, id?: number) => Promise<void>;
  editingRule: WarningRule | null;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editingRule
      ? { name: editingRule.name, parameter: editingRule.parameter, condition: editingRule.condition, threshold: String(editingRule.threshold), severity: editingRule.severity, message: editingRule.message }
      : EMPTY_FORM
    );
  }, [editingRule, open]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, threshold: parseFloat(form.threshold), is_active: true, notify_email: false, notify_sound: true }, editingRule?.id);
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingRule ? 'Edit Rule' : 'Create Rule'}</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rule Name</label>
                <Input required value={form.name} onChange={set('name')} placeholder="e.g. High Temperature Alert" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['parameter', 'condition', 'threshold'] as const).map((k) => (
                  <div key={k} className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 capitalize">{k}</label>
                    {k === 'threshold' ? (
                      <Input required type="number" step="0.1" value={form[k]} onChange={set(k)} placeholder="35.5" />
                    ) : k === 'parameter' ? (
                      <select value={form[k]} onChange={set(k)} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-500/50 hover:bg-white outline-none">
                        <option value="temperature">Temperature</option>
                        <option value="humidity">Humidity</option>
                      </select>
                    ) : (
                      <select value={form[k]} onChange={set(k)} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-500/50 hover:bg-white outline-none">
                        <option value="gt">&gt;</option>
                        <option value="lt">&lt;</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Severity</label>
                <select value={form.severity} onChange={set('severity')} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-500/50 hover:bg-white outline-none">
                  <option value="WARNING">WARNING</option>
                  <option value="DANGER">DANGER</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Alert Message</label>
                <Input required value={form.message} onChange={set('message')} placeholder="Message when triggered" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Rule'}</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ──────────────────── Page ────────────────────
export default function RulesPage() {
  const [rules, setRules] = useState<WarningRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WarningRule | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/rules');
    const json = await res.json();
    if (json.success) setRules(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const handleSave = async (data: Record<string, any>, id?: number) => {
    const url = id ? `/api/rules/${id}` : '/api/rules';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!json.success) { alert(`Error: ${json.error}`); return; }
    setModalOpen(false);
    fetchRules();
  };

  const toggleRule = async (rule: WarningRule) => {
    await fetch(`/api/rules/${rule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !rule.is_active }),
    });
    fetchRules();
  };

  const deleteRule = async (id: number) => {
    if (!confirm('Delete this rule?')) return;
    await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    fetchRules();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 rounded-xl"><ShieldAlert className="h-5 w-5 text-teal-600" /></div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Warning Rules</h1>
            <p className="text-slate-500 text-sm mt-0.5">Configure alert thresholds for monitoring</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => { setEditingRule(null); setModalOpen(true); }} className="flex items-center gap-2 shrink-0">
          <Plus className="h-4 w-4" /><span>Create Rule</span>
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <CardHeader><CardTitle>Active Rules ({rules.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    {['Status', 'Rule Name', 'Condition', 'Severity', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">Loading rules…</td></tr>
                  ) : rules.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No rules configured. Create your first one!</td></tr>
                  ) : (
                    rules.map((rule) => (
                      <motion.tr key={rule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4">
                          <button onClick={() => toggleRule(rule)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 ${rule.is_active ? 'bg-teal-500' : 'bg-slate-300'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${rule.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 text-sm">{rule.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{rule.message}</div>
                        </td>
                        <td className="px-5 py-4">
                          <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs border border-slate-200">
                            {rule.parameter} {rule.condition === 'gt' ? '>' : '<'} {rule.threshold}
                          </code>
                        </td>
                        <td className="px-5 py-4"><Badge status={rule.severity} variant="pill">{rule.severity}</Badge></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingRule(rule); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                            <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {loading ? (
                <p className="p-6 text-center text-slate-400 text-sm">Loading…</p>
              ) : rules.length === 0 ? (
                <p className="p-6 text-center text-slate-400 text-sm">No rules yet.</p>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{rule.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{rule.message}</p>
                      </div>
                      <Badge status={rule.severity} variant="pill">{rule.severity}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs border border-slate-200">
                        {rule.parameter} {rule.condition === 'gt' ? '>' : '<'} {rule.threshold}
                      </code>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleRule(rule)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rule.is_active ? 'bg-teal-500' : 'bg-slate-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${rule.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                        <button onClick={() => { setEditingRule(rule); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <RuleModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editingRule={editingRule} />
    </div>
  );
}
