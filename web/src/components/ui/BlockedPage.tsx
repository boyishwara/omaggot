import React from 'react';
import { Lock } from 'lucide-react';

export function BlockedPage({ 
  title = "Access Restricted", 
  message = "You do not have permission to view this content." 
}: { 
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] px-4">
      <div className="bg-slate-800/5 p-6 rounded-full mb-6">
        <Lock className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 text-center max-w-md">{message}</p>
    </div>
  );
}
