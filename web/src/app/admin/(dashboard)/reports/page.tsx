'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('all');

  const handleExport = (format: 'csv' | 'json') => {
    let url = `/api/export?format=${format}&status=${status}`;
    if (fromDate) url += `&from=${fromDate}T00:00:00Z`;
    if (toDate) url += `&to=${toDate}T23:59:59Z`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-8 lg:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-200/50">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data & Reports</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Export historical sensor data for analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">Start Date</label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">End Date</label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Status Filter</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:border-teal-500 hover:bg-white"
              >
                <option value="all">All Statuses (Normal, Warning, Danger, Critical)</option>
                <option value="warning">Warning Only</option>
                <option value="danger">Danger Only</option>
                <option value="critical">Critical Only</option>
              </select>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-slate-100">
              <Button variant="primary" onClick={() => handleExport('csv')} className="flex-1 flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
              <Button variant="secondary" onClick={() => handleExport('json')} className="flex-1 flex items-center justify-center gap-2">
                <FileJson className="h-4 w-4" />
                <span>Export JSON</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
