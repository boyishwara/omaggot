import React from 'react';
import { cn } from '@/lib/utils/classnames';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'glass';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-300';
  const variants = {
    default: 'bg-white text-slate-800 shadow-md shadow-slate-200/50 border border-slate-200/80 hover:shadow-lg hover:border-slate-300',
    dark: 'bg-slate-900 text-slate-100 shadow-xl shadow-slate-900/20 border border-slate-800 relative',
    glass: 'bg-white/70 backdrop-blur-xl text-slate-800 shadow-xl shadow-teal-900/5 border border-white/50'
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-5 border-b border-slate-200/60', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold tracking-tight text-slate-800', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}
