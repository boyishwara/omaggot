'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ThermometerSun, Droplets, Activity, BellRing, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { SensorReading } from '@/types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

export default function DashboardClient({ 
  initialReadings, 
  initialNotifications, 
  initialSimulationStatus 
}: { 
  initialReadings: SensorReading[]; 
  initialNotifications: any[]; 
  initialSimulationStatus: string; 
}) {
  const supabase = createClient();
  const [latestData, setLatestData] = useState<SensorReading | null>(initialReadings[0] || null);
  const [historyData, setHistoryData] = useState<SensorReading[]>(initialReadings);
  const [notifications, setNotifications] = useState<any[]>(initialNotifications);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(initialSimulationStatus);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const dataSubscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setLatestData(newReading);
          setIsDeviceOnline(true);
          setHistoryData(prev => [newReading, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    const notifSubscription = supabase
      .channel('schema-notif-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(dataSubscription); 
      supabase.removeChannel(notifSubscription); 
    };
  }, []);

  useEffect(() => {
    if (!latestData) return;
    const checkOnlineStatus = () => {
      const now = new Date();
      const recorded = new Date(latestData.recorded_at);
      const diffSeconds = (now.getTime() - recorded.getTime()) / 1000;
      setIsDeviceOnline(diffSeconds < 60);
    };
    const interval = setInterval(checkOnlineStatus, 10000);
    checkOnlineStatus();
    return () => clearInterval(interval);
  }, [latestData]);

  const fetchManualData = async () => {
    setIsRefreshing(true);
    const { data } = await supabase.from('sensor_readings').select('*').order('recorded_at', { ascending: false }).limit(50);
    if (data && data.length > 0) {
      setLatestData(data[0]);
      setHistoryData(data);
    }
    const { data: notifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (notifs) setNotifications(notifs);
    setIsRefreshing(false);
  };

  const handleSimulate = async (status: string) => {
    setIsSimulating(true);
    try {
      await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setSimulationStatus(status);
    } catch (e) {
      console.error(e);
    }
    setIsSimulating(false);
  };

  const chartData = [...historyData].reverse().map(d => ({
    time: new Date(d.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: d.temperature,
    humidity: d.humidity
  }));

  return (
    <div className="p-8 lg:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Environment Overview</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Real-time metrics from Smart Maggot Box</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center space-x-2 mr-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Hardware:</span>
            <select 
              value={simulationStatus}
              onChange={(e) => handleSimulate(e.target.value)}
              disabled={isSimulating}
              className="text-sm bg-white border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="NONE">Normal (Auto)</option>
              <option value="WARNING">Test Warning</option>
              <option value="DANGER">Test Danger</option>
            </select>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isDeviceOnline ? 'bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]' : 'bg-slate-400'}`}></div>
            <span className="text-sm font-semibold text-slate-700">{isDeviceOnline ? 'ESP32 Online' : 'Device Offline'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:-translate-y-1 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">System Status</span>
              <div className="p-2 bg-slate-50 rounded-lg"><Activity className="h-5 w-5 text-slate-400" /></div>
            </div>
            <div className="mt-2">
              <Badge status={latestData?.status || 'OFFLINE'} variant="pill">
                {latestData?.status || 'NO DATA'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:-translate-y-1 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Temperature</span>
              <div className="p-2 bg-rose-50 rounded-lg"><ThermometerSun className="h-5 w-5 text-rose-500" /></div>
            </div>
            <div className="flex items-baseline space-x-1">
              <h2 className="text-4xl font-bold text-slate-800 tracking-tighter">{latestData?.temperature ? `${latestData.temperature.toFixed(1)}` : '--'}</h2>
              <span className="text-slate-500 font-semibold text-lg">°C</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:-translate-y-1 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Humidity</span>
              <div className="p-2 bg-blue-50 rounded-lg"><Droplets className="h-5 w-5 text-blue-500" /></div>
            </div>
            <div className="flex items-baseline space-x-1">
              <h2 className="text-4xl font-bold text-slate-800 tracking-tighter">{latestData?.humidity ? `${latestData.humidity.toFixed(1)}` : '--'}</h2>
              <span className="text-slate-500 font-semibold text-lg">%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-1 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Heat Index</span>
              <div className="p-2 bg-amber-50 rounded-lg"><ThermometerSun className="h-5 w-5 text-amber-500" /></div>
            </div>
            <div className="flex items-baseline space-x-1">
              <h2 className="text-4xl font-bold text-slate-800 tracking-tighter">{latestData?.heat_index ? `${latestData.heat_index.toFixed(1)}` : '--'}</h2>
              <span className="text-slate-500 font-semibold text-lg">°C</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Historical Trends</CardTitle>
            <button 
              onClick={fetchManualData} 
              disabled={isRefreshing}
              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 border border-slate-200"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card variant="dark" className="overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
          <CardHeader className="border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Live Alerts</h3>
              <Badge variant="solid" className="bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-none">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-auto p-0">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          notif.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                          notif.severity === 'DANGER' ? 'bg-orange-500' : 
                          'bg-amber-500'
                        }`}></div>
                        <span className="font-semibold text-slate-200 text-sm">{notif.rule_name}</span>
                      </div>
                      <span className="text-xs text-slate-500" suppressHydrationWarning>
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{notif.message}</p>
                    <div className="flex items-center space-x-3 mt-3">
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-400 font-mono">
                        {notif.temperature}°C
                      </Badge>
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-400 font-mono">
                        {notif.humidity}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center h-full flex flex-col justify-center items-center text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 shadow-inner">
                  <BellRing className="h-8 w-8 text-slate-500" />
                </div>
                <p className="font-medium text-slate-300">No active alerts.</p>
                <p className="text-sm mt-2 leading-relaxed">All environmental parameters are within optimal ranges.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
