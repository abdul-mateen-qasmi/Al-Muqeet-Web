import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav, BottomNav } from './TopNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-body">
      <TopNav />

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 sticky top-0 bg-canvas/90 backdrop-blur-md z-40 border-b border-border/50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-accent-lime rounded-lg flex items-center justify-center rotate-3">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 2V22" stroke="#0C0F14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#0C0F14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </div>
           <span className="font-heading font-bold text-lg tracking-tight">Loan Manager</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs font-bold text-text-muted">
          AU
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 lg:p-8 pb-32 lg:pb-8">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
