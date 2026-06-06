import React from 'react';
import { ThermometerSun, Droplets, BellRing, Cpu } from 'lucide-react';

const features = [
  {
    icon: <ThermometerSun className="h-6 w-6 text-rose-500" />,
    iconBg: 'bg-rose-50',
    title: 'Temperature Tracking',
    description: 'BSF larvae thrive between 25–35°C. The system logs every reading and fires an alert the moment temperature drifts outside your configured threshold.',
  },
  {
    icon: <Droplets className="h-6 w-6 text-blue-500" />,
    iconBg: 'bg-blue-50',
    title: 'Humidity Control',
    description: 'Target 60–80% relative humidity. Too dry stunts early-instar growth; too wet invites fungal contamination. Real-time monitoring keeps you in the safe zone.',
  },
  {
    icon: <BellRing className="h-6 w-6 text-amber-500" />,
    iconBg: 'bg-amber-50',
    title: 'Tiered Alert System',
    description: 'Two severity levels — Warning and Danger — let you distinguish between "worth watching" and "act now". Alerts appear in the dashboard and are pushed via Telegram.',
  },
  {
    icon: <Cpu className="h-6 w-6 text-teal-600" />,
    iconBg: 'bg-teal-50',
    title: 'ESP32 + Cloud',
    description: 'An ESP32 microcontroller reads the DHT sensor every 5 seconds and posts data to a Next.js API backed by Supabase — no polling needed, updates are real-time.',
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="py-24 px-6 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-3">How it works</p>
          <h2 className="text-display-lg mb-5 text-slate-900">Precision at every stage.</h2>
          <p className="text-title-md text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A 5°C temperature swing can double your larvae's growth cycle. Every sensor reading counts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-slate-50 p-7 rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className={`${feature.iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm border border-white group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
