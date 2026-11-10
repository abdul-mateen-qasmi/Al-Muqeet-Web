import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkers, getTransactions, addWorker } from '@/lib/db';
import { AvatarChip } from '@/components/ui/AvatarChip';
import { StatusPill } from '@/components/ui/StatusPill';
import { AmountText } from '@/components/ui/AmountText';
import { cn, formatCurrency } from '@/lib/utils';
import { Search, Plus, UserPlus, X, ChevronRight, Download } from 'lucide-react';
import { WorkerBalance, Worker } from '@/types';
import { format } from 'date-fns';

export function Workers() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'outstanding' | 'name'>('outstanding');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');

  const queryClient = useQueryClient();

  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: getWorkers });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => getTransactions() });

  const addWorkerMutation = useMutation({
    mutationFn: () => addWorker({ name: newWorkerName, phone: newWorkerPhone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      setIsAddOpen(false);
      setNewWorkerName('');
      setNewWorkerPhone('');
    }
  });

  const workerBalances = useMemo(() => {
    const balances: Record<string, WorkerBalance> = {};
    workers.forEach(w => {
      balances[w.id] = { worker: w, total_loaned: 0, total_repaid: 0, outstanding: 0, status: 'cleared' };
    });
    transactions.forEach(tx => {
      if (balances[tx.worker_id]) {
        if (tx.type === 'loan') {
          balances[tx.worker_id].total_loaned += Number(tx.amount);
          balances[tx.worker_id].outstanding += Number(tx.amount);
        } else {
          balances[tx.worker_id].total_repaid += Number(tx.amount);
          balances[tx.worker_id].outstanding -= Number(tx.amount);
        }
      }
    });
    Object.values(balances).forEach(b => {
      b.status = b.outstanding > 0 ? 'pending' : (b.outstanding < 0 ? 'overpaid' : 'cleared');
    });

    let result = Object.values(balances).filter(b => b.worker.name.toLowerCase().includes(search.toLowerCase()));

    if (sort === 'outstanding') {
      result.sort((a, b) => b.outstanding - a.outstanding);
    } else {
      result.sort((a, b) => a.worker.name.localeCompare(b.worker.name));
    }

    return result;
  }, [workers, transactions, search, sort]);

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-[40px] font-heading font-bold text-text-primary mb-1">Workers</h1>
          <p className="text-text-muted">Manage your team and their balances.</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-accent-lime text-accent-limeText px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#b3e025] transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add worker</span>
        </button>
      </div>

      <div className="bg-card rounded-card border border-border p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-canvas border border-border rounded-input pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime transition-all placeholder:text-text-muted/50"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="bg-canvas border border-border rounded-input px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime outline-none appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="outstanding">Sort by outstanding</option>
          <option value="name">Sort by name (A-Z)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workerBalances.length === 0 ? (
           <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted border border-dashed border-border rounded-card">
             <UserPlus className="w-12 h-12 mb-3 opacity-20" />
             <p className="text-lg font-medium text-text-primary mb-1">No workers found</p>
             <p className="text-sm">Add a worker to start tracking their balance.</p>
           </div>
        ) : (
          workerBalances.map(b => (
            <div key={b.worker.id} className="bg-card rounded-card p-5 border border-border flex flex-col gap-4 hover:border-border/80 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <AvatarChip name={b.worker.name} className="w-12 h-12 text-lg" />
                  <div className="flex flex-col">
                    <span className="font-heading font-bold text-lg">{b.worker.name}</span>
                    <span className="text-sm text-text-muted">{b.worker.phone || 'No phone'}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted font-medium">Outstanding</span>
                  <AmountText amount={b.outstanding} type={b.outstanding > 0 ? 'due' : 'neutral'} className="font-bold text-lg mt-0.5" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-text-muted font-medium mb-1.5">Status</span>
                  <StatusPill status={b.status} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-card w-full max-w-md border border-border shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h2 className="font-heading font-bold text-xl">Add Worker</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-muted ml-1">Full Name</label>
                <input
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="bg-canvas border border-border rounded-input px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime"
                  placeholder="e.g. Suraj Kumar"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-muted ml-1">Phone Number (optional)</label>
                <input
                  type="text"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  className="bg-canvas border border-border rounded-input px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime"
                  placeholder="e.g. +971 50 123 4567"
                />
              </div>
            </div>
            <div className="p-5 bg-card-raised border-t border-border flex justify-end gap-3">
              <button onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-canvas transition-colors">Cancel</button>
              <button
                onClick={() => addWorkerMutation.mutate()}
                disabled={!newWorkerName.trim() || addWorkerMutation.isPending}
                className="bg-accent-lime text-accent-limeText px-6 py-2.5 rounded-full font-bold text-sm disabled:opacity-50 transition-colors"
              >
                Save worker
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
