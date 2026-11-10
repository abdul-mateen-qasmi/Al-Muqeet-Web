import React, { useState } from 'react';
import { PillNav } from '../ui/PillNav';
import { LayoutDashboard, Users, ArrowLeftRight, FileBarChart, Settings as SettingsIcon, Search, Plus, LogOut } from 'lucide-react';
import { AvatarChip } from '../ui/AvatarChip';
import { Link } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { id: 'workers', label: 'Workers', path: '/workers', icon: <Users size={20} /> },
  { id: 'transactions', label: 'Transactions', path: '/transactions', icon: <ArrowLeftRight size={20} /> },
  { id: 'reports', label: 'Reports', path: '/reports', icon: <FileBarChart size={20} /> },
  { id: 'settings', label: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
];

export function TopNav() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="hidden lg:flex items-center justify-between py-6 px-8 sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-3">
        {/* Simple SVG Logo */}
        <div className="w-10 h-10 bg-accent-lime rounded-xl flex items-center justify-center rotate-3 shadow-[0_0_15px_rgba(196,241,53,0.3)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V22" stroke="#0C0F14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#0C0F14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-heading font-bold text-xl tracking-tight text-text-primary">Loan Manager</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <PillNav items={navItems} />
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center bg-card rounded-full px-3 py-2 border transition-colors ${searchFocused ? 'border-accent-lime' : 'border-border'}`}>
          <Search className="text-text-muted w-4 h-4 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted/60 w-32 focus:w-48 transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <button className="flex items-center gap-2 bg-accent-lime text-accent-limeText px-4 py-2 rounded-full font-medium text-sm hover:bg-[#b3e025] transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime focus:ring-offset-2 focus:ring-offset-canvas active:scale-97">
          <Plus className="w-4 h-4" />
          <span>New entry</span>
        </button>

        <div className="relative group cursor-pointer">
          <AvatarChip name="Admin User" />
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  return (
    <>
      <div className="lg:hidden fixed bottom-24 right-6 z-50">
        <button className="w-14 h-14 bg-accent-lime text-accent-limeText rounded-full flex items-center justify-center shadow-lg hover:bg-[#b3e025] active:scale-95 transition-all focus:outline-none">
          <Plus size={24} />
        </button>
      </div>
      <div className="lg:hidden">
        <PillNav items={navItems} isMobile={true} />
      </div>
    </>
  );
}
