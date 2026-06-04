import React from 'react';
import { cn } from '@/lib/utils/classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'secondaryOnDark' | 'textLink' | 'iconCircular';
  size?: 'md' | 'icon';
  href?: string;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  href,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none text-sm active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/40 rounded-xl h-11 px-6 focus:ring-teal-500',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm hover:border-slate-300 rounded-xl h-11 px-6 focus:ring-slate-200',
    secondaryOnDark: 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl px-6 py-2.5 shadow-sm focus:ring-slate-700',
    textLink: 'bg-transparent text-teal-600 hover:text-teal-700 hover:underline underline-offset-4 px-0 py-0 focus:ring-0',
    iconCircular: 'bg-white text-slate-700 rounded-full h-10 w-10 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm flex items-center justify-center'
  };

  const sizes = {
    md: '',
    icon: ''
  };

  if (href) {
    return (
      <a href={href} className={cn(baseStyles, variants[variant], sizes[size], className)}>
        {children}
      </a>
    );
  }

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
