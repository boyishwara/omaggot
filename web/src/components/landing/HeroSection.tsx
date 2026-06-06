import React from 'react';
import { Button } from '@/components/ui/Button';
import { ThermometerSun, Droplets, Activity } from 'lucide-react';

const stats = [
  { value: '5s', label: 'Sensor update interval' },
  { value: '2', label: 'Parameters monitored' },
  { value: '2', label: 'Alert severity levels' },
];

export function HeroSection() {
  return (
    <section className="relative bg-slate-50 overflow-hidden py-20 px-6 min-h-[88vh] flex items-center">
      {/* Background blobs */}
      <div className="absolute top-[-8%] left-[-8%] w-[35%] h-[35%] bg-teal-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-8%] w-[35%] h-[35%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
        {/* Left — copy */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span>Live IoT Monitoring</span>
          </div>

          <h1 className="text-display-xl mb-6 text-slate-900 drop-shadow-sm">
            Keep your maggot farm at{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
              peak conditions.
            </span>
          </h1>

          <p className="text-title-md text-slate-600 mb-6 max-w-lg leading-relaxed">
            Smart Maggot Box continuously monitors temperature and humidity from an ESP32 sensor,
            alerting you the moment conditions drift outside safe ranges for Black Soldier Fly larvae.
          </p>

          {/* Quick stats */}
          <div className="flex items-center gap-6 mb-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-teal-600">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-7 py-3.5 rounded-xl text-body-md font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1"
            >
              Open Dashboard
            </a>
            <a
              href="https://t.me/smart_maggot_kel_7_bot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-7 py-3.5 rounded-xl text-body-md font-semibold hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
            >
              <svg className="w-5 h-5 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram Bot
            </a>
          </div>
        </div>

        {/* Right — live data mock-up */}
        <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-800 hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 rounded-2xl pointer-events-none" />
            {/* Traffic lights */}
            <div className="flex space-x-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            {/* Live stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 text-center">
                <div className="flex justify-center mb-2"><ThermometerSun className="h-4 w-4 text-rose-400" /></div>
                <p className="text-xs text-slate-400">Temperature</p>
                <p className="text-xl font-bold text-white mt-0.5">28.5<span className="text-sm font-normal text-slate-400">°C</span></p>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 text-center">
                <div className="flex justify-center mb-2"><Droplets className="h-4 w-4 text-blue-400" /></div>
                <p className="text-xs text-slate-400">Humidity</p>
                <p className="text-xl font-bold text-white mt-0.5">65<span className="text-sm font-normal text-slate-400">%</span></p>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 text-center">
                <div className="flex justify-center mb-2"><Activity className="h-4 w-4 text-teal-400" /></div>
                <p className="text-xs text-slate-400">Status</p>
                <p className="text-sm font-bold text-teal-400 mt-1.5">NORMAL</p>
              </div>
            </div>
            {/* Recent alert feed */}
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 font-mono text-xs text-slate-400 space-y-2">
              <p className="flex items-center gap-2"><span className="text-green-400">✓</span>ESP32 connected — reading sensors</p>
              <p className="flex items-center gap-2"><span className="text-teal-400">→</span>Payload sent to /api/sensor</p>
              <p className="flex items-center gap-2"><span className="text-green-400">✓</span>No active alerts — all within range</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
