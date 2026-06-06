'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BlockedPage } from '@/components/ui/BlockedPage';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const supabase = createClient();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);
    }
    const res = await fetch('/api/users');
    const json = await res.json();
    if (json.success) setUsers(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const confirmMessage = action === 'approve' 
      ? 'Approve this user as an Admin?' 
      : 'Reject and delete this user?';
      
    if (!confirm(confirmMessage)) return;

    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    
    const json = await res.json();
    if (json.success) {
      fetchUsers();
    } else {
      alert(`Error: ${json.error}`);
    }
  };

  if (userProfile && userProfile.role !== 'superadmin') {
    return <BlockedPage title="Access Restricted" message="Only Superadmins can access User Management." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 rounded-xl"><ShieldCheck className="h-5 w-5 text-teal-600" /></div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">Approve or manage platform users</p>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-teal-500" /> All Users ({users.length})</CardTitle>
              <button onClick={fetchUsers} className="text-xs text-teal-600 hover:text-teal-700 font-semibold">↻ Refresh</button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">Loading users…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">No users found.</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 text-sm">{u.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Joined: {new Date(u.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {u.is_approved ? (
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 border border-teal-200 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3" /> Approved
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role === 'admin' && !u.is_approved && (
                              <button 
                                onClick={() => handleAction(u.id, 'approve')} 
                                className="px-3 py-1.5 text-xs font-semibold bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              onClick={() => handleAction(u.id, 'reject')} 
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <XCircle className="h-5 w-5" />
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
      </motion.div>
    </div>
  );
}
