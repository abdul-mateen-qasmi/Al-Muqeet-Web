import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
  delay?: number;
}

export function KpiCard({ title, value, icon, className, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn("bg-card rounded-card p-6 flex flex-col justify-between h-full border border-border/50", className)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-text-muted text-[13px] font-medium leading-tight">{title}</span>
        {icon && <div className="text-text-muted/60">{icon}</div>}
      </div>
      <div className="mt-auto">
        {value}
      </div>
    </motion.div>
  );
}
