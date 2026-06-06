'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Automatically redirect to login after successful registration
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-teal-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl h-16 w-16 mb-6 shadow-xl shadow-teal-500/30">
            <Logo className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-display-sm text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-body-md text-slate-500 mt-2">Join Smart Maggot Box</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl shadow-slate-200 rounded-3xl p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 block">Full Name</label>
              <input 
                id="name"
                name="name"
                type="text" 
                autoComplete="name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 block">Email Address</label>
              <input 
                id="email"
                name="email"
                type="email" 
                autoComplete="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="john@example.com"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 block">Password</label>
              <input 
                id="password"
                name="password"
                type="password" 
                autoComplete="new-password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 block">Account Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
              >
                <option value="user">Normal User (View Only)</option>
                <option value="admin">Admin (Requires Approval)</option>
              </select>
              {role === 'admin' && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mt-2">
                  Note: Admin accounts require Superadmin approval before you can edit rules or settings.
                </p>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <a href="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
