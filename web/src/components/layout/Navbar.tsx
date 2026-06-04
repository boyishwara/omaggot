'use client';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/classnames';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function Navbar({ className }: { className?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className={cn('h-[72px] bg-white/80 backdrop-blur-lg text-[var(--ink)] flex items-center px-6 border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-300', className)}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <a href="/" className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-2 rounded-xl shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 group-hover:-translate-y-0.5 transition-all duration-300">
            <Logo className="h-5 w-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-slate-800">Smart Maggot</span>
        </a>
        
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-10 w-28 bg-slate-100 animate-pulse rounded-lg"></div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <a href="/admin/dashboard" className="text-body-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                Dashboard
              </a>
              <button onClick={handleLogout} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-body-sm font-medium hover:bg-slate-800 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <a href="/admin/login" className="text-body-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                Sign in
              </a>
              <a href="/admin/dashboard" className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-lg text-body-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5">
                Go to Console
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
