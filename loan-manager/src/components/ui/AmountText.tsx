import React from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/lib/db';

interface AmountTextProps {
  amount: number;
  type: 'due' | 'repaid' | 'neutral';
  className?: string;
  showCurrency?: boolean;
}

export function AmountText({ amount, type, className, showCurrency = true }: AmountTextProps) {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  const textColor =
    type === 'due' ? 'text-accent-coral' :
    type === 'repaid' ? 'text-accent-lime' :
    'text-text-primary';

  const currencyStr = showCurrency && settings ? ` ${settings.currency}` : '';

  return (
    <span className={cn(`tabular-nums font-heading ${textColor}`, className)}>
      {formatCurrency(amount)}{currencyStr}
    </span>
  );
}
