import React from 'react';

export function StatsSection() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-teal-500 via-teal-600 to-blue-700 rounded-3xl p-14 text-center shadow-2xl shadow-teal-500/20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-200 mb-4">Get started</p>
          <h2 className="text-display-sm mb-5 text-white drop-shadow-sm">
            Ready to monitor your cultivation?
          </h2>
          <p className="text-base text-teal-100 mb-10 max-w-xl mx-auto leading-relaxed opacity-90">
            Log in to access the live dashboard, set your alert thresholds, and connect your ESP32 device.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-slate-50 hover:text-teal-800 font-semibold text-base px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign in to Dashboard
          </a>
        </div>
      </div>
    </section>
  );
}
