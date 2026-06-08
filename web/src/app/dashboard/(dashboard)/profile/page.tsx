'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Trash2, ShieldAlert, CheckCircle2, Clock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function ProfilePage() {
  const { user: authUser, profile, refreshProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loadingName, setLoadingName] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      setEmail(authUser.email || '');
    }
    if (profile) {
      setName(profile.name || '');
    }
  }, [authUser, profile]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setLoadingName(true);
    const { error } = await (supabase as any).from('user_profiles').update({ name }).eq('id', authUser.id);
    if (error) showMessage('error', error.message);
    else {
      showMessage('success', 'Name updated successfully.');
      await refreshProfile();
    }
    setLoadingName(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to change your email address?')) return;
    setLoadingEmail(true);
    const { error } = await supabase.auth.updateUser({ email });
    if (error) showMessage('error', error.message);
    else showMessage('success', 'Verification link sent to both old and new email addresses.');
    setLoadingEmail(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    if (password.length < 8 || !/\d/.test(password)) {
      showMessage('error', 'Password must be at least 8 characters and contain at least one number');
      return;
    }

    if (!window.confirm('Are you sure you want to change your password?')) return;
    setLoadingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) showMessage('error', error.message);
    else {
      showMessage('success', 'Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
    }
    setLoadingPassword(false);
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Type "DELETE" to permanently delete your account. This action cannot be undone.');
    if (confirmation !== 'DELETE') return;

    setLoadingDelete(true);
    const res = await fetch('/api/profile', { method: 'DELETE' });
    const json = await res.json();
    
    if (json.success) {
      await supabase.auth.signOut();
      router.push('/login');
    } else {
      showMessage('error', json.error);
      setLoadingDelete(false);
    }
  };

  if (!authUser) return null;

  const isApproved = profile?.is_approved ?? true;
  const role: string = profile?.role ?? authUser?.user_metadata?.role ?? 'user';
  const isPendingAdmin = role === 'admin' && !isApproved;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 max-w-4xl mx-auto">
      {/* Account Status Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
          isPendingAdmin
            ? 'bg-amber-50 border-amber-200'
            : 'bg-teal-50 border-teal-200'
        }`}>
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isPendingAdmin ? 'bg-amber-100' : 'bg-teal-100'
          }`}>
            {isPendingAdmin
              ? <Clock className="h-5 w-5 text-amber-600" />
              : <CheckCircle2 className="h-5 w-5 text-teal-600" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-bold capitalize ${
                isPendingAdmin ? 'text-amber-800' : 'text-teal-800'
              }`}>
                {role}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                isPendingAdmin
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-teal-100 text-teal-700 border-teal-300'
              }`}>
                {isPendingAdmin ? 'Pending Approval' : 'Active'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${
              isPendingAdmin ? 'text-amber-700' : 'text-teal-700'
            }`}>
              {isPendingAdmin
                ? 'Your admin account is awaiting approval from a Superadmin. You can view the dashboard but editing features are locked until approved.'
                : `Your ${role} account is active and fully operational.`
              }
            </p>
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your personal information and account settings</p>
      </motion.div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Name */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-4 w-4 text-teal-500" /> Display Name</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="profile-name" className="text-sm font-semibold text-slate-700">Full Name</label>
                  <Input id="profile-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loadingName || !name || name === profile?.name} className="w-full">
                  {loadingName ? 'Saving...' : 'Update Name'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Update Email */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal-500" /> Email Address</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="profile-email" className="text-sm font-semibold text-slate-700">New Email Address</label>
                  <Input id="profile-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loadingEmail || !email || email === authUser?.email} className="w-full">
                  {loadingEmail ? 'Sending...' : 'Change Email'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Update Password */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4 text-teal-500" /> Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="profile-password" className="text-sm font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <Input id="profile-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="profile-confirm-password" className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <Input id="profile-confirm-password" name="confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="pr-10" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loadingPassword || !password} className="w-full">
                  {loadingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Delete Account */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="h-full border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600"><ShieldAlert className="h-4 w-4" /> Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Permanently delete your account and all associated data. This action cannot be undone. You will immediately lose access to the dashboard.
                </p>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={loadingDelete}
                  className="w-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 font-semibold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {loadingDelete ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
