'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
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
          <h1 className="text-display-sm text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-body-md text-slate-500 mt-2">Enter your email to receive a recovery link</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl shadow-slate-200 rounded-3xl p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Check Your Email</h2>
              <p className="text-sm text-slate-500">
                We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>.
              </p>
              <a href="/login" className="block mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
                Return to Login
              </a>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              
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
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? 'Sending Link...' : 'Send Recovery Link'}
              </button>
              
              <div className="text-center mt-6">
                <p className="text-sm text-slate-500">
                  Remembered your password?{' '}
                  <a href="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
