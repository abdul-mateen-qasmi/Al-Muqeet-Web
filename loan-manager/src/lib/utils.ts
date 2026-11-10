import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'AED'): string {
  // Format based on standard requirement: #,##0.00;(#,##0.00);-
  if (amount === 0) return '-';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(Math.abs(amount));
  return amount < 0 ? `(${formatted})` : formatted;
}
