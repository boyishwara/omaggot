'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, X, Edit2 } from 'lucide-react';
import type { WarningRule } from '@/types';

export default function RulesPage() {
  const supabase = createClient();
  const [rules, setRules] = useState<WarningRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [parameter, setParameter] = useState('temperature');
  const [condition, setCondition] = useState('gt');
  const [threshold, setThreshold] = useState('');
  const [severity, setSeverity] = useState('WARNING');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('warning_rules').select('*').order('created_at', { ascending: true });
    if (data) setRules(data);
    setLoading(false);
  };

  const toggleRule = async (id: number, currentStatus: boolean) => {
    const { error } = await (supabase as any).from('warning_rules').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchRules();
  };

  const deleteRule = async (id: number) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      const { error } = await (supabase as any).from('warning_rules').delete().eq('id', id);
      if (!error) fetchRules();
    }
  };

  const openCreateModal = () => {
    setEditingRuleId(null);
    setName('');
    setParameter('temperature');
    setCondition('gt');
    setThreshold('');
    setSeverity('WARNING');
    setMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (rule: WarningRule) => {
    setEditingRuleId(rule.id);
    setName(rule.name);
    setParameter(rule.parameter);
    setCondition(rule.condition);
    setThreshold(rule.threshold.toString());
    setSeverity(rule.severity);
    setMessage(rule.message);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const ruleData = {
      name,
      parameter,
      condition,
      threshold: parseFloat(threshold),
      severity,
      message,
      is_active: true,
      notify_email: false,
      notify_sound: true
    };

    let error;
    
    if (editingRuleId) {
      const res = await (supabase as any).from('warning_rules').update(ruleData as any).eq('id', editingRuleId);
      error = res.error;
    } else {
      const res = await (supabase as any).from('warning_rules').insert([ruleData as any]);
      error = res.error;
    }
    
    if (!error) {
      setIsModalOpen(false);
      fetchRules();
    } else {
      alert(`Failed to ${editingRuleId ? 'update' : 'create'} rule: ` + error.message);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 lg:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Warning Rules</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Configure thresholds for alerts and notifications</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Rule</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Rule Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Condition</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Severity</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Loading rules...</td></tr>
                ) : rules.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No warning rules configured.</td></tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleRule(rule.id, rule.is_active)} 
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${rule.is_active ? 'bg-teal-500' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{rule.name}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{rule.message}</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-sm border border-slate-200">
                          {rule.parameter} {rule.condition === 'gt' ? '&gt;' : rule.condition === 'lt' ? '&lt;' : rule.condition} {rule.threshold}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={rule.severity} variant="pill">{rule.severity}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(rule)} 
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteRule(rule.id)} 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">{editingRuleId ? 'Edit Rule' : 'Create New Rule'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveRule} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Rule Name</label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. High Temperature Alert" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Parameter</label>
                  <select 
                    value={parameter} onChange={(e) => setParameter(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-teal-500/50 hover:bg-white"
                  >
                    <option value="temperature">Temperature</option>
                    <option value="humidity">Humidity</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Condition</label>
                  <select 
                    value={condition} onChange={(e) => setCondition(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-teal-500/50 hover:bg-white"
                  >
                    <option value="gt">Greater Than (&gt;)</option>
                    <option value="lt">Less Than (&lt;)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Threshold</label>
                  <Input required type="number" step="0.1" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="e.g. 35.5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Severity</label>
                <select 
                  value={severity} onChange={(e) => setSeverity(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-teal-500/50 hover:bg-white"
                >
                  <option value="WARNING">WARNING</option>
                  <option value="DANGER">DANGER</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Alert Message</label>
                <Input required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="The message to log when triggered" />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Rule'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
