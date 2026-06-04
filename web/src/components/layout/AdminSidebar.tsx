'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, FileText, BellRing, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils/classnames';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Warning Rules', href: '/admin/rules', icon: BellRing },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 sticky top-0 text-slate-400 font-sans shadow-xl shadow-slate-900/20 z-40">
      <div className="h-[72px] flex items-center px-6 border-b border-slate-800/50">
        <Link href="/" className="flex items-center space-x-3 group transition-colors">
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-2 rounded-lg shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 group-hover:-translate-y-0.5 transition-all duration-300">
            <Logo className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight text-slate-100">Smart Maggot</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Management</div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium group relative overflow-hidden",
                isActive 
                  ? "text-teal-400 bg-teal-500/10" 
                  : "hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-md"></div>}
              <Icon className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110", isActive ? "text-teal-400" : "text-slate-500")} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 w-full rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
