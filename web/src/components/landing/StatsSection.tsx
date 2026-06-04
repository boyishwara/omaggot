import React from 'react';

export function StatsSection() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-teal-500 via-teal-600 to-blue-700 rounded-3xl p-16 text-center shadow-2xl shadow-teal-500/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-display-sm mb-6 text-white drop-shadow-sm">Ready to scale your cultivation?</h2>
          <p className="text-title-md text-teal-50 mb-10 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Join other forward-thinking breeders who rely on Smart Maggot Box for consistent, high-yield Black Soldier Fly production.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/admin/login" className="bg-white text-teal-700 hover:bg-slate-50 hover:text-teal-800 font-semibold text-lg px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              Access Dashboard
            </a>
            <p className="text-sm text-teal-100/80 mt-4 sm:mt-0 font-medium">Free for academic projects.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
