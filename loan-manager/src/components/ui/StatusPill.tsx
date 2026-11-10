import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 'pending' | 'cleared' | 'overpaid';

interface StatusPillProps {
  status: StatusType;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider",
        status === 'cleared' && "bg-status-repaid/20 text-status-repaid",
        status === 'pending' && "bg-status-due/20 text-status-due",
        status === 'overpaid' && "bg-status-neutral text-text-primary",
        className
      )}
    >
      {status}
    </span>
  );
}
