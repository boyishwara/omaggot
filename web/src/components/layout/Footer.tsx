import { Logo } from '@/components/ui/Logo';
import { Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 pb-10 border-b border-slate-800">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-slate-800 p-2 rounded-lg">
                <Logo className="h-5 w-5 text-teal-500" />
              </div>
              <span className="font-serif text-lg text-slate-200 tracking-tight">Smart Maggot Box</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed text-center sm:text-left">
              IoT environmental monitoring for Black Soldier Fly cultivation.
              Built with Next.js, Supabase, and ESP32.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center sm:items-end gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-1">Links</p>
            <a href="/login" className="text-sm hover:text-teal-400 transition-colors">
              Sign In
            </a>
            <a href="https://t.me/smart_maggot_kel_7_bot" target="_blank" rel="noreferrer" className="text-sm hover:text-teal-400 transition-colors flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" /> Telegram Bot
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© 2026 Smart Maggot Box. All rights reserved.</p>
          <p>Monitoring Temperature &amp; Humidity for optimal BSF growth.</p>
        </div>
      </div>
    </footer>
  );
}
