import React from 'react';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <section className="relative bg-slate-50 overflow-hidden py-24 px-6 min-h-[85vh] flex items-center">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span>Real-time IoT Monitoring</span>
          </div>
          <h1 className="text-display-xl mb-6 text-slate-900 drop-shadow-sm">
            Optimize your maggot cultivation with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">precision.</span>
          </h1>
          <p className="text-title-md text-slate-600 mb-10 max-w-lg leading-relaxed">
            Smart Maggot Box uses advanced IoT sensors to monitor temperature and humidity in real-time, ensuring the perfect environment for Black Soldier Fly larvae growth.
          </p>
          <div className="flex items-center space-x-4">
            <a href="/dashboard/dashboard" className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3.5 rounded-xl text-body-md font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1">
              View Dashboard
            </a>
          </div>
        </div>
        
        <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl relative border border-slate-800 transform hover:scale-[1.02] transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 rounded-2xl"></div>
            <div className="absolute top-4 left-4 flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="mt-8 font-mono text-sm text-slate-300 space-y-4 relative z-10">
              <p className="flex items-center"><span className="text-teal-400 mr-2">➜</span> <span className="text-white">esp32</span> connecting to WiFi...</p>
              <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> Connected to network</p>
              <p className="flex items-center"><span className="text-teal-400 mr-2">➜</span> <span className="text-white">dht22</span> reading sensors...</p>
              <div className="bg-slate-800/50 p-4 rounded-xl text-slate-200 border border-slate-700/50 shadow-inner">
                <code>
                  {`{\n  "temperature": 28.5,\n  "humidity": 65.2,\n  "heat_index": 29.1,\n  "status": "NORMAL"\n}`}
                </code>
              </div>
              <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> Payload sent to /api/sensor</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
