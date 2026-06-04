import React from 'react';
import { ThermometerSun, Droplets, BellRing } from 'lucide-react';

export function FeatureSection() {
  const features = [
    {
      icon: <ThermometerSun className="h-6 w-6 text-teal-600" />,
      title: "Temperature Monitoring",
      description: "Track ambient temperature continuously. BSF larvae thrive between 25°C and 35°C. Receive alerts instantly if it drops below 20°C or exceeds 40°C."
    },
    {
      icon: <Droplets className="h-6 w-6 text-teal-600" />,
      title: "Humidity Control",
      description: "Maintain the optimal 60-80% RH. Prevent desiccation at early instar stages or fungal growth from excessive moisture."
    },
    {
      icon: <BellRing className="h-6 w-6 text-teal-600" />,
      title: "Smart Alerts",
      description: "Multi-level warning system (Normal, Warning, Danger, Critical) with local LED/Buzzer indicators and remote dashboard notifications."
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-display-lg mb-6 text-slate-900">Precision matters.</h2>
          <p className="text-title-md text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Every 5°C drop below optimal temperatures can double the growth cycle of your larvae. Monitor closely to maximize yield.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-teal-50 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-title-md mb-3 text-slate-800">{feature.title}</h3>
              <p className="text-body-md text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
