import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ApprovalGateProps {
  /** If true, renders children normally. If false, renders a locked/greyed overlay with tooltip. */
  allowed: boolean;
  /** Message shown in the tooltip when locked. */
  message?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps any child element and, when `allowed` is false, overlays it with a
 * semi-transparent lock state and a hover tooltip. The child remains visible
 * but is visually disabled — industry-standard pattern for pending permissions.
 */
export function ApprovalGate({
  allowed,
  message = 'Requires Superadmin approval to use this feature.',
  children,
  className,
}: ApprovalGateProps) {
  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className={`relative group inline-flex ${className ?? ''}`}>
      {/* Greyed-out children */}
      <div className="opacity-40 pointer-events-none select-none w-full">
        {children}
      </div>

      {/* Invisible click-blocker + hover area */}
      <div className="absolute inset-0 cursor-not-allowed z-10" />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100] flex items-center gap-1.5 w-[220px] text-center leading-snug">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
        <span className="flex-1 text-left">{message}</span>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}
