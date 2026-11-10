import React from 'react';
import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card-raised rounded-full text-[13px] border border-border">
      <span className="text-text-primary">{label}</span>
      <button
        onClick={onRemove}
        className="text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime rounded-full"
        aria-label={`Remove filter ${label}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface FilterBarProps {
  children?: React.ReactNode;
  activeFilters?: Array<{ id: string; label: string; onRemove: () => void }>;
  onOpenFilters?: () => void;
  className?: string;
}

export function FilterBar({ children, activeFilters = [], onOpenFilters, className }: FilterBarProps) {
  return (
    <div className={cn("bg-card rounded-card p-4 border border-border flex flex-col sm:flex-row sm:items-center gap-4", className)}>
      <div className="flex items-center gap-3">
        {onOpenFilters && (
          <button
            onClick={onOpenFilters}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-card-raised border border-border text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime"
            aria-label="Open filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        )}
        <span className="text-sm font-medium text-text-muted">Active filters</span>
      </div>

      <div className="flex-1 flex flex-wrap items-center gap-2">
        {activeFilters.length > 0 ? (
          activeFilters.map(filter => (
            <FilterChip key={filter.id} label={filter.label} onRemove={filter.onRemove} />
          ))
        ) : (
          <span className="text-sm text-text-muted/50 italic">None</span>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          {children}
        </div>
      )}
    </div>
  );
}
