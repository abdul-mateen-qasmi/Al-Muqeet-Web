import React from 'react';
import { motion } from 'framer-motion';

interface SegmentedProgressProps {
  total: number;
  completed: number;
  label?: string;
  delay?: number;
}

export function SegmentedProgress({ total, completed, label, delay = 0 }: SegmentedProgressProps) {
  const segments = 10;

  // Handle edge cases
  let percentage = 0;
  if (total > 0) {
    percentage = (completed / total) * 100;
  }

  const filledSegments = Math.round((percentage / 100) * segments);

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider">{label}</span>}
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-card-raised overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: i < filledSegments ? '100%' : 0 }}
              transition={{ duration: 0.5, delay: delay + (i * 0.05), ease: "easeOut" }}
              className="h-full bg-accent-lime"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-text-muted mt-1">
        <span>{Math.round(percentage)}% recovered</span>
      </div>
    </div>
  );
}
