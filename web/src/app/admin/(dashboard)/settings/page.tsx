'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Activity, Server, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleTestNotification = async () => {
    setTestStatus('loading');
    try {
      const res = await fetch('/api/notify/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity: 'CRITICAL', message: 'This is a test notification from the admin panel.' })
      });
      
      if (res.ok) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
      }
    } catch (e) {
      setTestStatus('error');
    }
  };

  return (
    <div className="p-8 lg:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-200/50">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">System configuration and troubleshooting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <Activity className="h-5 w-5 text-teal-500" />
                <span className="font-medium">Version</span>
              </div>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-mono font-semibold">1.0.0</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <Server className="h-5 w-5 text-teal-500" />
                <span className="font-medium">Environment</span>
              </div>
              <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md text-xs font-mono font-semibold">Production</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <Smartphone className="h-5 w-5 text-teal-500" />
                <span className="font-medium">Device ID</span>
              </div>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-mono font-semibold">esp32-001</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">
                Send a simulated payload to the notification system to verify that your alerts are correctly configured and permissions are active.
              </p>
            </div>
            
            <Button 
              variant="secondary" 
              onClick={handleTestNotification}
              disabled={testStatus === 'loading'}
              className="w-full flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4 text-teal-600" />
              <span>
                {testStatus === 'loading' ? 'Transmitting...' : testStatus === 'success' ? 'Verified Successfully!' : 'Trigger Test Notification'}
              </span>
            </Button>
            
            {testStatus === 'error' && (
              <p className="text-red-500 text-xs font-medium text-center animate-in slide-in-from-top-1">Failed to send test notification. Check API logs.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
