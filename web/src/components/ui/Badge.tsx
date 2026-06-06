import React from 'react';
import { cn } from '@/lib/utils/classnames';
import type { SensorStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: SensorStatus | 'OFFLINE';
  variant?: 'pill' | 'solid';
}

export function Badge({ className, status, variant = 'pill', children, ...props }: BadgeProps) {
  let statusClass = '';
  
  if (status === 'NORMAL') statusClass = 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm shadow-teal-500/10';
  else if (status === 'WARNING') statusClass = 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm shadow-amber-500/10';
  else if (status === 'DANGER') statusClass = 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm shadow-orange-500/10';
  else if (status === 'OFFLINE') statusClass = 'bg-slate-100 text-slate-600 border border-slate-200';

  const baseClass = variant === 'solid' 
    ? 'inline-flex items-center rounded-lg bg-teal-500 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-white shadow-md shadow-teal-500/30'
    : 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase';

  return (
    <div className={cn(statusClass ? statusClass + ' ' + baseClass : baseClass, className)} {...props}>
      {children}
    </div>
  );
}
