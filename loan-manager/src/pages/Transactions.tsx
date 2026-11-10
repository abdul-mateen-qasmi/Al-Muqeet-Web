import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, getWorkers, deleteTransaction } from '@/lib/db';
import { FilterBar, FilterChip } from '@/components/ui/FilterBar';
import { AmountText } from '@/components/ui/AmountText';
import { AvatarChip } from '@/components/ui/AvatarChip';
import { format, isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Trash2, Edit2, Download } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';

export function Transactions() {
  const queryClient = useQueryClient();
  const { data: allTransactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => getTransactions() });
  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: getWorkers });

  // Filters state
  const [selectedWorker, setSelectedWorker] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'loan' | 'repayment'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction? This should only be used to correct mistakes.")) {
      deleteMutation.mutate(id);
    }
  };

  // Compute filtered list and running balances
  const { filteredTx, summary } = useMemo(() => {
    const today = new Date();

    // Sort oldest to newest to compute running balances correctly per worker
    const chronologicalTxs = [...allTransactions].sort((a, b) => new Date(a.tx_date).getTime() - new Date(b.tx_date).getTime());

    // Compute running balance attached to each transaction object
    const balancesByWorker: Record<string, number> = {};
    const txWithRunningBalances = chronologicalTxs.map(tx => {
      if (!balancesByWorker[tx.worker_id]) balancesByWorker[tx.worker_id] = 0;
      if (tx.type === 'loan') {
        balancesByWorker[tx.worker_id] += Number(tx.amount);
      } else {
        balancesByWorker[tx.worker_id] -= Number(tx.amount);
      }
      return { ...tx, running_balance: balancesByWorker[tx.worker_id] };
    });

    // Now apply filters
    let filtered = txWithRunningBalances.filter(tx => {
      if (selectedWorker !== 'all' && tx.worker_id !== selectedWorker) return false;
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      if (selectedPeriod !== 'all') {
        const txDate = new Date(tx.tx_date);
        if (selectedPeriod === 'today' && !isSameDay(txDate, today)) return false;
        if (selectedPeriod === 'week' && !isSameWeek(txDate, today, { weekStartsOn: 1 })) return false; // Default monday start
        if (selectedPeriod === 'month' && !isSameMonth(txDate, today)) return false;
      }
      return true;
    });

    // Reverse to show newest first, unless a single worker is selected, then we keep chronological (statement view)
    if (selectedWorker === 'all') {
      filtered.reverse();
    }

    // Summary calculations
    let loans = 0;
    let repayments = 0;
    filtered.forEach(tx => {
      if (tx.type === 'loan') loans += Number(tx.amount);
      if (tx.type === 'repayment') repayments += Number(tx.amount);
    });

    return {
      filteredTx: filtered,
      summary: { loans, repayments, count: filtered.length }
    };
  }, [allTransactions, selectedWorker, selectedType, selectedPeriod]);


  // Active filters mapping for FilterBar
  const activeFilters = [];
  if (selectedWorker !== 'all') {
    const w = workers.find(w => w.id === selectedWorker);
    activeFilters.push({ id: 'worker', label: `Worker: ${w?.name}`, onRemove: () => setSelectedWorker('all') });
  }
  if (selectedType !== 'all') {
    activeFilters.push({ id: 'type', label: `Type: ${selectedType === 'loan' ? 'Loan given' : 'Repayment'}`, onRemove: () => setSelectedType('all') });
  }
  if (selectedPeriod !== 'all') {
    const pLabel = selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This week' : 'This month';
    activeFilters.push({ id: 'period', label: pLabel, onRemove: () => setSelectedPeriod('all') });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-[40px] font-heading font-bold text-text-primary mb-1">Transactions</h1>
          <p className="text-text-muted">Full history and statements.</p>
        </div>
        <button className="flex items-center gap-2 bg-card-raised border border-border text-text-primary px-5 py-2.5 rounded-full font-medium text-sm hover:bg-border/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime">
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="bg-card rounded-card border border-border p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <select
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
          className="bg-canvas border border-border rounded-input px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime outline-none appearance-none cursor-pointer w-full md:w-auto min-w-[200px]"
        >
          <option value="all">All workers</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="bg-canvas border border-border rounded-input px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime outline-none appearance-none cursor-pointer w-full md:w-auto"
        >
          <option value="all">All types</option>
          <option value="loan">Loans given</option>
          <option value="repayment">Repayments</option>
        </select>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="bg-canvas border border-border rounded-input px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime outline-none appearance-none cursor-pointer w-full md:w-auto"
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center px-2">
          <span className="text-xs font-medium text-text-muted mr-2">Active filters:</span>
          {activeFilters.map(f => (
            <FilterChip key={f.id} label={f.label} onRemove={f.onRemove} />
          ))}
          <button
            onClick={() => { setSelectedWorker('all'); setSelectedType('all'); setSelectedPeriod('all'); }}
            className="text-xs text-text-muted hover:text-text-primary ml-2 underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-inner p-4 border border-border">
           <span className="text-xs text-text-muted font-medium">Loans given</span>
           <div className="mt-1"><AmountText amount={summary.loans} type="due" className="text-xl font-bold" /></div>
        </div>
        <div className="bg-card rounded-inner p-4 border border-border">
           <span className="text-xs text-text-muted font-medium">Repayments</span>
           <div className="mt-1"><AmountText amount={summary.repayments} type="repaid" className="text-xl font-bold" /></div>
        </div>
        <div className="col-span-2 bg-card rounded-inner p-4 border border-border flex items-center justify-between">
           <div>
             <span className="text-xs text-text-muted font-medium">Net change</span>
             <div className="mt-1"><AmountText amount={summary.loans - summary.repayments} type={(summary.loans - summary.repayments) > 0 ? "due" : "repaid"} className="text-xl font-bold" /></div>
           </div>
           <div className="text-right text-text-muted">
             <div className="text-2xl font-heading font-bold">{summary.count}</div>
             <div className="text-xs uppercase tracking-wide">Entries</div>
           </div>
        </div>
      </div>

      <div className="bg-card rounded-card border border-border overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b border-border/50 text-xs font-medium text-text-muted uppercase tracking-wider bg-canvas">
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Worker</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2 text-right">Running Balance</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border/50">
          {filteredTx.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No transactions match the selected filters.
            </div>
          ) : (
            filteredTx.map((tx: Transaction & { running_balance: number }) => {
              const worker = workers.find(w => w.id === tx.worker_id);
              return (
                <div key={tx.id} className="p-4 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:items-center hover:bg-card-raised transition-colors group">
                  {/* Mobile Date & Worker */}
                  <div className="flex justify-between items-start lg:hidden mb-2">
                    <div className="flex items-center gap-2">
                      <AvatarChip name={worker?.name || 'Unknown'} className="w-8 h-8 text-[10px]" />
                      <span className="font-semibold text-sm">{worker?.name}</span>
                    </div>
                    <span className="text-xs text-text-muted">{format(parseISO(tx.tx_date), 'dd MMM yyyy')}</span>
                  </div>

                  {/* Desktop Date */}
                  <div className="hidden lg:block col-span-2 text-sm text-text-muted">
                    {format(parseISO(tx.tx_date), 'dd MMM yyyy')}
                  </div>

                  {/* Desktop Worker */}
                  <div className="hidden lg:flex col-span-3 items-center gap-3">
                    <AvatarChip name={worker?.name || 'Unknown'} className="w-8 h-8 text-[10px]" />
                    <span className="font-semibold text-sm">{worker?.name}</span>
                  </div>

                  {/* Type */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", tx.type === 'loan' ? "bg-accent-coral/10 text-accent-coral" : "bg-accent-lime/10 text-accent-lime")}>
                      {tx.type === 'loan' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{tx.type === 'loan' ? 'Loan Given' : 'Repayment'}</span>
                      {tx.note && <span className="text-xs text-text-muted line-clamp-1">{tx.note}</span>}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 lg:text-right flex items-center justify-between lg:block mt-2 lg:mt-0">
                    <span className="lg:hidden text-xs text-text-muted">Amount</span>
                    <AmountText amount={tx.amount} type={tx.type === 'loan' ? 'due' : 'repaid'} className="text-sm font-bold lg:text-base" />
                  </div>

                  {/* Running Balance */}
                  <div className="col-span-2 lg:text-right flex items-center justify-between lg:block mt-1 lg:mt-0">
                    <span className="lg:hidden text-xs text-text-muted">Balance after</span>
                    <AmountText amount={tx.running_balance} type={tx.running_balance > 0 ? 'due' : (tx.running_balance < 0 ? 'repaid' : 'neutral')} className="text-sm font-medium" />
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-2 mt-4 lg:mt-0 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity border-t lg:border-t-0 border-border/50 pt-3 lg:pt-0">
                    <button className="p-2 bg-canvas rounded-full text-text-muted hover:text-text-primary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tx.id)} className="p-2 bg-canvas rounded-full text-text-muted hover:text-accent-coral transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
