import React from 'react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center space-x-2 text-slate-200 mb-6 group cursor-pointer">
          <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-teal-500/20 transition-colors">
            <Logo className="h-6 w-6 text-teal-500" />
          </div>
          <span className="font-serif text-2xl tracking-tight">Smart Maggot Box</span>
        </div>
        <p className="text-body-md max-w-md mb-8 leading-relaxed">
          Advanced IoT monitoring system for optimal Black Soldier Fly maggot cultivation. Built with Next.js, Supabase, and ESP32.
        </p>
        
        <div className="flex space-x-6 text-sm font-medium">
          <a href="/login" className="hover:text-teal-400 transition-colors">Admin Login</a>
          <a href="https://github.com/boyishwara" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">GitHub</a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>© 2026 Smart Maggot Box. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <span className="opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">Privacy Policy</span>
          <span className="opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
