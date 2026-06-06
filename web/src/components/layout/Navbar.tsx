'use client';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/classnames';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function Navbar({ className }: { className?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className={cn(
      'h-[68px] flex items-center px-6 sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200/60'
        : 'bg-transparent',
      className
    )}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-2 rounded-xl shadow-md shadow-teal-500/30 group-hover:shadow-teal-500/50 group-hover:-translate-y-0.5 transition-all duration-300">
            <Logo className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-slate-800">O'Maggot</span>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
          ) : user ? (
            <>
              <a
                href="/dashboard/dashboard"
                className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors px-3 py-2 rounded-lg hover:bg-teal-50"
              >
                Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
