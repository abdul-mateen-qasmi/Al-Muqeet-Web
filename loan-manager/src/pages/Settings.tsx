import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, saveSettings, seedDemoData, clearDemoData } from '@/lib/db';
import { Settings as SettingsType } from '@/types';
import { Building2, Globe, Moon, Database, Trash2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToastProvider, Toast, ToastTitle, ToastViewport } from '@radix-ui/react-toast';

export function Settings() {
  const queryClient = useQueryClient();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const mutation = useMutation({
    mutationFn: (newSettings: SettingsType) => saveSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setToastMsg('Settings saved successfully');
      setToastOpen(true);
    }
  });

  const seedMutation = useMutation({
    mutationFn: seedDemoData,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setToastMsg('Demo data loaded successfully');
      setToastOpen(true);
    }
  });

  const clearMutation = useMutation({
    mutationFn: clearDemoData,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setToastMsg('Data cleared successfully');
      setToastOpen(true);
    }
  });

  if (isLoading || !settings) return <div className="p-8">Loading settings...</div>;

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-3xl lg:text-[40px] font-heading font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-muted">Manage your company preferences and data.</p>
        </div>

        <div className="bg-card rounded-card p-6 border border-border flex flex-col gap-6">

          {/* Company Details */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-heading font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent-lime" /> Company Details
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-muted ml-1">Company Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => mutation.mutate({ ...settings, company_name: e.target.value })}
                className="bg-canvas border border-border rounded-input px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime transition-shadow"
              />
            </div>
          </section>

          <hr className="border-border/50" />

          {/* Preferences */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-heading font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent-lime" /> Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-muted ml-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => mutation.mutate({ ...settings, currency: e.target.value })}
                  className="bg-canvas border border-border rounded-input px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime transition-shadow appearance-none cursor-pointer"
                >
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-muted ml-1">Week Start</label>
                <select
                  value={settings.week_start}
                  onChange={(e) => mutation.mutate({ ...settings, week_start: e.target.value as 'monday'|'sunday' })}
                  className="bg-canvas border border-border rounded-input px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime transition-shadow appearance-none cursor-pointer"
                >
                  <option value="monday">Monday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-border/50" />

          {/* Data Management */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-heading font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-accent-lime" /> Data Management
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="flex items-center justify-center gap-2 bg-card-raised border border-border text-text-primary hover:bg-border/50 px-4 py-3 rounded-input font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime disabled:opacity-50"
              >
                <Database className="w-4 h-4" /> Load Demo Data
              </button>
              <button
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="flex items-center justify-center gap-2 bg-card-raised border border-border text-accent-coral hover:bg-accent-coral/10 px-4 py-3 rounded-input font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-coral disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Clear All Data
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1">Warning: Clearing data is irreversible and removes all workers and transactions.</p>
          </section>

          <hr className="border-border/50" />

          <button className="flex items-center justify-center gap-2 text-text-muted hover:text-text-primary px-4 py-3 rounded-input font-medium transition-colors mt-2">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <Toast open={toastOpen} onOpenChange={setToastOpen} className="bg-card-raised border border-border p-4 rounded-xl shadow-lg flex items-center gap-3">
        <div className="w-2 h-2 bg-accent-lime rounded-full" />
        <ToastTitle className="text-text-primary text-sm font-medium">{toastMsg}</ToastTitle>
      </Toast>
      <ToastViewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-[390px] max-w-[100vw] m-0 list-none z-[100] outline-none" />
    </ToastProvider>
  );
}
