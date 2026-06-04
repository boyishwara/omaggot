import React from 'react';
import { cn } from '@/lib/utils/classnames';

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("w-6 h-6", className)} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Central Body */}
      <path d="M12 2.5L16 6.5V11.5L12 15.5L8 11.5V6.5L12 2.5Z" fill="url(#logo-gradient)" />
      {/* Right Wing */}
      <path d="M16 8L22 10.5L16 13V8Z" fill="currentColor" fillOpacity="0.6" />
      {/* Left Wing */}
      <path d="M8 8L2 10.5L8 13V8Z" fill="currentColor" fillOpacity="0.6" />
      {/* Tail Segment */}
      <path d="M12 16L14.5 19.5H9.5L12 16Z" fill="currentColor" fillOpacity="0.4" />
      {/* Bottom Sensor Node */}
      <circle cx="12" cy="21.5" r="1.5" fill="currentColor" />
    </svg>
  );
}
