'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Activity, BellRing, ShieldCheck, Database, Info } from 'lucide-react';

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
      </div>
    </div>
  );
}
