import React, { useState } from 'react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic will go here
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-card p-8 border border-border flex flex-col gap-8 shadow-2xl">

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 bg-accent-lime rounded-2xl flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(196,241,53,0.2)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V22" stroke="#0C0F14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#0C0F14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-text-muted">
              {isSignUp ? 'Sign up to manage your company ledger' : 'Sign in to access your ledger'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-canvas border border-border rounded-input px-4 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime transition-all placeholder:text-text-muted/40"
              placeholder="name@company.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-canvas border border-border rounded-input px-4 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime transition-all placeholder:text-text-muted/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent-lime text-accent-limeText font-bold py-3.5 rounded-input mt-2 hover:bg-[#b3e025] transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime focus:ring-offset-2 focus:ring-offset-canvas active:scale-[0.98]"
          >
            {isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>
    </div>
  );
}
