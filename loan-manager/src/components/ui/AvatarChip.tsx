import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarChipProps {
  name: string;
  className?: string;
}

export function AvatarChip({ name, className }: AvatarChipProps) {
  // Deterministic muted color generation based on name
  const colors = [
    'bg-[#2A3441]',
    'bg-[#382E3E]',
    'bg-[#2D3B36]',
    'bg-[#3D312E]',
    'bg-[#263545]'
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-text-primary text-xs font-semibold shrink-0",
        colors[colorIndex],
        className
      )}
      style={{ width: '2.5rem', height: '2.5rem' }}
    >
      {initials}
    </div>
  );
}
