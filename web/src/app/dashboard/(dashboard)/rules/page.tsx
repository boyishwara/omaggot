'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, X, Edit2, ShieldAlert, Clock, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { WarningRule } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';

// ──────────────────── helpers ────────────────────
const EMPTY_FORM = {
  name: '',
  parameter: 'temperature',
  condition: 'gt',
  threshold: '',
  severity: 'WARNING',
  message: '',
};

const SEVERITY_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  WARNING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Warning' },
  DANGER:  { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Danger' },
};

const PARAM_LABEL: Record<string, string> = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  heat_index: 'Heat Index',
};

const COND_LABEL: Record<string, string> = {
  gt: 'greater than',
  lt: 'less than',
  gte: 'at least',
  lte: 'at most',
};

const COND_OP: Record<string, string> = { gt: '>', lt: '<', gte: '>=', lte: '<=' };

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

  // Human-readable preview of the condition
  const preview = form.threshold
    ? `When ${PARAM_LABEL[form.parameter] || form.parameter} is ${COND_LABEL[form.condition] || form.condition} ${form.threshold}${form.parameter === 'humidity' ? '%' : '°C'}, trigger a ${form.severity} alert.`
    : '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingRule ? 'Edit Rule' : 'New Alert Rule'}</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rule Name</label>
                <Input required value={form.name} onChange={set('name')} placeholder="e.g. High Temperature Alert" />
              </div>

              {/* Condition builder row */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Trigger Condition</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Parameter</label>
                    <select value={form.parameter} onChange={set('parameter')} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-500/50 hover:bg-white outline-none">
                      <option value="temperature">Temperature</option>
                      <option value="humidity">Humidity</option>
                      <option value="heat_index">Heat Index</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Condition</label>
                    <select value={form.condition} onChange={set('condition')} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-500/50 hover:bg-white outline-none">
                      <option value="gt">&gt; greater than</option>
                      <option value="lt">&lt; less than</option>
                      <option value="gte">&ge; at least</option>
                      <option value="lte">&le; at most</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Threshold</label>
                    <Input required type="number" step="0.1" value={form.threshold} onChange={set('threshold')} placeholder="35.0" />
                  </div>
                </div>
                {/* Live preview */}
                {preview && (
                  <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 mt-1">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-teal-500" />
                    <span>{preview}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Severity Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['WARNING', 'DANGER'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, severity: s }))}
                      className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${form.severity === s
                        ? (s === 'WARNING' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-red-500 bg-red-50 text-red-700')
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${SEVERITY_STYLE[s].dot}`} />
                      {s === 'WARNING' ? 'Warning' : 'Danger'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Alert Message</label>
                <Input required value={form.message} onChange={set('message')} placeholder="e.g. Temperature too high! Check cooling." />
                <p className="text-xs text-slate-400">Shown in the dashboard alert feed and sent via Telegram.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingRule ? 'Save Changes' : 'Create Rule'}</Button>
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
  const { profile: userProfile } = useAuth();

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

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';
  const isApproved = (userProfile?.role === 'admin' && userProfile?.is_approved) || userProfile?.role === 'superadmin';
  const isPendingAdmin = userProfile?.role === 'admin' && !userProfile?.is_approved;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 rounded-xl"><ShieldAlert className="h-5 w-5 text-teal-600" /></div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Alert Rules</h1>
            <p className="text-slate-500 text-sm mt-0.5">Define thresholds that trigger Warning or Danger alerts</p>
          </div>
        </div>
        {isApproved && (
          <Button variant="primary" onClick={() => { setEditingRule(null); setModalOpen(true); }} className="flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" /><span>New Rule</span>
          </Button>
        )}
      </motion.div>

      {/* Pending admin banner */}
      {isPendingAdmin && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Your account is pending Superadmin approval</p>
            <p className="text-sm text-amber-700 mt-0.5">You can view all rules below, but editing, toggling, and creating rules is locked until a Superadmin approves your account.</p>
          </div>
        </motion.div>
      )}

      {/* Rules Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Rules ({rules.length})</span>
              <span className="text-xs font-normal text-slate-400">{rules.filter(r => r.is_active).length} active</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    {isAdmin && <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-16">Active</th>}
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Rule</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Condition</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Severity</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Alert Message</th>
                    {isApproved && (
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Loading rules…</td></tr>
                  ) : rules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <ShieldAlert className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500 font-medium">No rules configured</p>
                        <p className="text-slate-400 text-sm mt-1">{isApproved ? 'Click "New Rule" to create your first alert threshold.' : 'Rules will appear here once created.'}</p>
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => {
                      const sev = SEVERITY_STYLE[rule.severity] ?? SEVERITY_STYLE.WARNING;
                      return (
                        <motion.tr key={rule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`transition-colors ${rule.is_active ? 'hover:bg-slate-50' : 'opacity-50 hover:bg-slate-50'}`}>
                          {/* Toggle */}
                          {isAdmin && (
                            <td className="px-5 py-4">
                              <button
                                onClick={() => isApproved && toggleRule(rule)}
                                disabled={!isApproved}
                                title={!isApproved ? 'Requires approval to toggle' : rule.is_active ? 'Disable rule' : 'Enable rule'}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 ${isApproved ? 'cursor-pointer' : 'cursor-not-allowed'} ${rule.is_active ? 'bg-teal-500' : 'bg-slate-300'}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${rule.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                            </td>
                          )}
                          {/* Rule name */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900 text-sm">{rule.name}</p>
                          </td>
                          {/* Condition */}
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                              <span className="text-xs font-semibold text-slate-600">{PARAM_LABEL[rule.parameter] || rule.parameter}</span>
                              <span className="text-xs font-bold text-slate-800">{COND_OP[rule.condition] || rule.condition}</span>
                              <span className="text-xs font-semibold text-slate-900">{rule.threshold}{rule.parameter === 'humidity' ? '%' : '°C'}</span>
                            </div>
                          </td>
                          {/* Severity */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sev.bg} ${sev.text} ${rule.severity === 'WARNING' ? 'border-amber-200' : 'border-red-200'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                              {sev.label}
                            </span>
                          </td>
                          {/* Message - full text, no truncation */}
                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-600 leading-snug">{rule.message}</p>
                          </td>
                          {/* Actions */}
                          {isApproved && (
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => { setEditingRule(rule); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit rule"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete rule"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          )}
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {loading ? (
                <p className="p-6 text-center text-slate-400 text-sm">Loading…</p>
              ) : rules.length === 0 ? (
                <div className="p-8 text-center">
                  <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-slate-400 text-sm">No rules yet.</p>
                </div>
              ) : (
                rules.map((rule) => {
                  const sev = SEVERITY_STYLE[rule.severity] ?? SEVERITY_STYLE.WARNING;
                  return (
                    <div key={rule.id} className={`p-4 space-y-3 ${!rule.is_active ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{rule.name}</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${sev.bg} ${sev.text} ${rule.severity === 'WARNING' ? 'border-amber-200' : 'border-red-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {sev.label}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                        <span className="text-xs font-semibold text-slate-600">{PARAM_LABEL[rule.parameter] || rule.parameter}</span>
                        <span className="text-xs font-bold text-slate-800">{COND_OP[rule.condition] || rule.condition}</span>
                        <span className="text-xs font-semibold text-slate-900">{rule.threshold}{rule.parameter === 'humidity' ? '%' : '°C'}</span>
                      </div>
                      <p className="text-sm text-slate-600">{rule.message}</p>
                      {isAdmin && (
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => isApproved && toggleRule(rule)}
                            disabled={!isApproved}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isApproved ? 'cursor-pointer' : 'cursor-not-allowed'} ${rule.is_active ? 'bg-teal-500' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${rule.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                          {isApproved && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingRule(rule); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <RuleModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editingRule={editingRule} />
    </div>
  );
}
