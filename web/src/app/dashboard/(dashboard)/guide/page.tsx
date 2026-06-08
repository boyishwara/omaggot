'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Activity, BellRing, ShieldCheck, Database, Info, Leaf, Bug } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-500/10 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-teal-600" />
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900">User Manual & Guide</h1>
        </div>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Everything you need to know about using O'Maggot and interpreting sensor data.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Getting Started */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                Welcome to <strong>O'Maggot</strong>, the smart maggot farming monitoring system. Our platform connects directly to IoT sensors to give you real-time insights into your farming environment.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Dashboard:</strong> View live sensor readings and recent alerts.</li>
                <li><strong>Reports:</strong> Export historical data and analyze trends over time.</li>
                <li><strong>Warning Rules:</strong> Set up automated alerts for when environmental factors go out of range.</li>
                <li><strong>Settings:</strong> Manage test notifications, and view active Telegram subscribers.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Understanding Sensor Data */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-500" />
                Understanding Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                The system monitors several critical environmental factors. Understanding these values is key to maintaining a healthy maggot farm.
              </p>
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong className="text-slate-800 block mb-1">Temperature (°C)</strong>
                  Keep it between 25°C and 30°C. High temperatures can kill maggots, while low temperatures stunt growth.
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong className="text-slate-800 block mb-1">Humidity (%)</strong>
                  Optimal range is 60% - 70%. High humidity risks mold, while low humidity can dehydrate the larvae.
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong className="text-slate-800 block mb-1">Heat Index</strong>
                  Calculated from a combination of temperature and humidity. It provides a measure of the "real heat stress" experienced by the larvae, and is used to trigger tiered warning levels.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Warning Rules & Notifications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-rose-500" />
                Warnings & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                O'Maggot continuously evaluates sensor data against <strong>Warning Rules</strong>. If a rule is breached, a notification is generated.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Rule Conditions:</strong> You can define conditions (e.g., Temperature {'>'} 35°C).</li>
                <li><strong>Severity Levels:</strong> Alerts are classified as NORMAL, WARNING, or DANGER.</li>
                <li><strong>Telegram Integration:</strong> WARNING and DANGER alerts are immediately pushed to your Telegram group or personal bot chat if subscribed.</li>
              </ul>
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs">
                <strong>Tip:</strong> Always ensure you have subscribed to the Telegram Bot to receive critical warnings instantly.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Roles & Permissions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-violet-500" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                Access to system features depends on your account role:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">User</span>
                  <p>Can view the dashboard, sensor data, and export reports. Cannot modify rules or settings.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-semibold">Admin</span>
                  <p>Can manage warning rules and access system settings. Must be <strong>approved</strong> by a Superadmin first.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs font-semibold">Superadmin</span>
                  <p>Has full control. Can approve/reject Admins, manage all users, and alter any system configuration.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Production & Insights */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-500" />
                Production & Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                Admins and Superadmins can manually record <strong>Feed (Pakan)</strong> and <strong>Maggot Harvests</strong> from the Dashboard. The Reports page will calculate several AI-driven insights:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Feed Conversion Ratio (FCR):</strong> Calculates how much feed is required to produce 1 kg of maggot. An ideal FCR is between 1.5 and 2.5.</li>
                <li><strong>Daily Growth Rate:</strong> Monitors the daily harvest average. If the curve flattens quickly, the system will alert you to check nutrition and environmental factors.</li>
                <li><strong>Climate Impact:</strong> Automatically correlates average temperature and humidity during the period with feed consumption and growth rates, providing actionable warnings if maggots are too stressed to eat.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feed & Maggot Explanation — full width */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
        <Card className="border-teal-100">
          <CardHeader className="bg-teal-50/40 border-b border-teal-100">
            <CardTitle className="flex items-center gap-2 text-teal-800">
              <Leaf className="h-5 w-5 text-teal-500" />
              Feed &amp; Maggot — What Are They &amp; Why Are They Recorded?
            </CardTitle>
          </CardHeader>
          <CardContent className="py-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
            {/* Feed */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Feed</span>
                <span className="text-slate-400 text-xs">(Input)</span>
              </div>
              <p>
                <strong>Feed</strong> is the organic material given to the BSF (Black Soldier Fly) larvae as food — such as food scraps, fruit pulp, or other organic waste. It is the <em>input</em> of the cultivation process.
              </p>
              <p className="text-slate-500 text-xs italic">
                "How many kilograms of organic waste did we give to the larvae today?"
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
                <strong>Example:</strong> Today you fed 10 kg of vegetable scraps to the maggot colony. You record <strong>10 kg</strong> in the Feed field.
              </div>
            </div>

            {/* Maggot */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Maggot</span>
                <span className="text-slate-400 text-xs">(Output)</span>
              </div>
              <p>
                <strong>Maggot</strong> refers to the BSF larvae harvested after completing their growth cycle. It is the <em>output</em> or product of the cultivation process. These larvae have commercial value as animal or fish feed.
              </p>
              <p className="text-slate-500 text-xs italic">
                "How many kilograms of larvae did we harvest today?"
              </p>
              <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-xs text-teal-800">
                <strong>Example:</strong> After a few days, you harvest <strong>2.5 kg</strong> of BSF larvae from the colony that was given 10 kg of feed.
              </div>
            </div>

            {/* Relationship */}
            <div className="md:col-span-2 bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
              <p className="font-semibold text-indigo-800 text-sm flex items-center gap-2">
                <Bug className="h-4 w-4" />
                How Feed and Maggot Relate — and Why Both Must Be Recorded
              </p>
              <p>
                Feed is the <strong>fuel</strong>; Maggot is the <strong>result</strong>. Without recording both, the system cannot calculate your farming efficiency.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white border border-indigo-100 rounded-lg p-3">
                  <p className="font-bold text-indigo-700 mb-1">Feed Conversion Ratio (FCR)</p>
                  <p className="text-slate-600 mb-1">= Feed (kg) ÷ Maggot (kg)</p>
                  <p className="text-slate-500">Measures how many kg of feed are needed to produce 1 kg of maggot. A lower number means higher efficiency. The ideal range is <strong>4–6</strong> for wet organic waste.</p>
                </div>
                <div className="bg-white border border-indigo-100 rounded-lg p-3">
                  <p className="font-bold text-indigo-700 mb-1">Bioconversion Yield</p>
                  <p className="text-slate-600 mb-1">= (Maggot ÷ Feed) × 100%</p>
                  <p className="text-slate-500">The percentage of feed successfully converted into larval biomass. The ideal range is <strong>15%–25%</strong>. A low yield may indicate suboptimal temperature or humidity conditions.</p>
                </div>
              </div>
              <p className="text-xs text-indigo-600 font-medium">
                💡 That is why O'Maggot asks you to record <em>both values together</em> — the system will automatically calculate efficiency and correlate it with environmental sensor data on the Reports page.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
