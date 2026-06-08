import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApprovalGate } from '@/components/ui/ApprovalGate';
import { Leaf, PlusCircle } from 'lucide-react';

export function ProductionInput({ userProfile, onAdd }: { userProfile: any, onAdd: () => void }) {
  const [pakanKg, setPakanKg] = useState('');
  const [maggotKg, setMaggotKg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pakanKg && !maggotKg) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pakan_kg: parseFloat(pakanKg || '0'),
          maggot_kg: parseFloat(maggotKg || '0'),
          user_id: userProfile?.id
        })
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setPakanKg('');
      setMaggotKg('');
      onAdd();
      alert('Production record added successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile || userProfile.role === 'user') return null;

  return (
    <ApprovalGate
      allowed={(userProfile.role === 'admin' && userProfile.is_approved) || userProfile.role === 'superadmin'}
      message="Needs Admin/Superadmin approval to input production data."
    >
      <Card className="h-full border border-teal-100 shadow-sm">
        <CardHeader className="pb-3 border-b border-teal-50 bg-teal-50/30 rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-base text-teal-800">
            <Leaf className="h-4 w-4 text-teal-600" />
            Add Production Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</div>}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Feed / Nutrisi (kg)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={pakanKg} 
                  onChange={(e) => setPakanKg(e.target.value)} 
                  placeholder="e.g. 10.5"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Maggot (kg)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={maggotKg} 
                  onChange={(e) => setMaggotKg(e.target.value)} 
                  placeholder="e.g. 5.2"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || (!pakanKg && !maggotKg)} 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2 h-9 text-sm"
            >
              <PlusCircle className="h-4 w-4" />
              {loading ? 'Adding...' : 'Save Record'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </ApprovalGate>
  );
}
