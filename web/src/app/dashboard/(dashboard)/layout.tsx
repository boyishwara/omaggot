import React from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user profile to get role and approval status
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fallback profile if it doesn't exist yet (e.g. older accounts)
  const userProfile = profile || { 
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User', 
    role: user.user_metadata?.role || 'user', 
    is_approved: true 
  };

  return (
    <div className="flex min-h-screen bg-[var(--canvas)]">
      <DashboardSidebar profile={userProfile} />
      <main className="flex-1 overflow-x-hidden pt-14 lg:pt-0 relative">
        {children}
      </main>
    </div>
  );
}
