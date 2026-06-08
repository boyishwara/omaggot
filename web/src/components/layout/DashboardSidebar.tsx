'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, FileText, BellRing, LogOut, Menu, X, Users, User, BookOpen, Database } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils/classnames';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';

const baseLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Production', href: '/dashboard/production', icon: Database },
  { name: 'Guide', href: '/dashboard/guide', icon: BookOpen },
  { name: 'Warning Rules', href: '/dashboard/rules', icon: BellRing },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function NavContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useAuth();

  // Add Users tab if superadmin
  const links = [...baseLinks];
  if (profile?.role === 'superadmin') {
    links.push({ name: 'User Management', href: '/dashboard/users', icon: Users });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-[72px] flex items-center px-6 border-b border-slate-800/50">
        <Link href="/" onClick={onNavigate} className="flex items-center space-x-3 group transition-colors">
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-2 rounded-lg shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 group-hover:-translate-y-0.5 transition-all duration-300">
            <Logo className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight text-slate-100">O'Maggot</span>
        </Link>
      </div>

      <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-800/20">
        <p className="text-slate-100 font-medium">Hello, {profile?.name || 'User'}!</p>
        <p className="text-xs text-slate-400 mt-1 capitalize">You're an/a {profile?.role || 'user'}</p>
        {profile?.role === 'admin' && !profile?.is_approved && (
          <p className="text-[10px] text-amber-400 mt-1 font-medium bg-amber-400/10 inline-block px-2 py-0.5 rounded">Pending Approval</p>
        )}
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Management</div>
        {links.map((link, i) => {
          const Icon = link.icon;
          const isActive = link.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(link.href);
          return (
            <motion.div key={link.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative overflow-hidden',
                  isActive ? 'text-teal-400 bg-teal-500/10' : 'hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-500 rounded-r-md" />}
                <Icon className={cn('h-4 w-4 transition-transform duration-200 group-hover:scale-110', isActive ? 'text-teal-400' : 'text-slate-500')} />
                <span>{link.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 w-full rounded-lg bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-slate-700/50 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col h-screen shrink-0 sticky top-0 text-slate-400 font-sans shadow-xl shadow-slate-900/20 z-40">
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800 shadow-lg">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-1.5 rounded-lg">
            <Logo className="h-4 w-4" />
          </div>
          <span className="font-serif text-lg font-semibold text-slate-100">O'Maggot</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-400 font-sans"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <NavContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
