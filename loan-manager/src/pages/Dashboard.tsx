import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWorkers, getTransactions } from '@/lib/db';
import { KpiCard } from '@/components/ui/KpiCard';
import { AmountText } from '@/components/ui/AmountText';
import { SegmentedProgress } from '@/components/ui/SegmentedProgress';
import { AvatarChip } from '@/components/ui/AvatarChip';
import { StatusPill } from '@/components/ui/StatusPill';
import { DetailPanel } from '@/components/ui/DetailPanel';
import { FilterBar, FilterChip } from '@/components/ui/FilterBar';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subMonths, isSameMonth, differenceInDays } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Expand, ChevronRight, X, Download } from 'lucide-react';
import { WorkerBalance, Worker, Transaction } from '@/types';

export function Dashboard() {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'cleared'>('all');

  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: getWorkers });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => getTransactions() });

  // Calculate Balances
  const workerBalances = useMemo(() => {
    const balances: Record<string, WorkerBalance> = {};

    workers.forEach(w => {
      balances[w.id] = {
        worker: w,
        total_loaned: 0,
        total_repaid: 0,
        outstanding: 0,
        status: 'cleared'
      };
    });

    transactions.forEach(tx => {
      if (balances[tx.worker_id]) {
        if (tx.type === 'loan') {
          balances[tx.worker_id].total_loaned += Number(tx.amount);
          balances[tx.worker_id].outstanding += Number(tx.amount);

          if (!balances[tx.worker_id].last_loan_date || new Date(tx.tx_date) > new Date(balances[tx.worker_id].last_loan_date!)) {
            balances[tx.worker_id].last_loan_date = tx.tx_date;
          }
        } else {
          balances[tx.worker_id].total_repaid += Number(tx.amount);
          balances[tx.worker_id].outstanding -= Number(tx.amount);

          if (!balances[tx.worker_id].last_repayment_date || new Date(tx.tx_date) > new Date(balances[tx.worker_id].last_repayment_date!)) {
            balances[tx.worker_id].last_repayment_date = tx.tx_date;
          }
        }
      }
    });

    Object.values(balances).forEach(b => {
      b.status = b.outstanding > 0 ? 'pending' : (b.outstanding < 0 ? 'overpaid' : 'cleared');
    });

    return Object.values(balances).sort((a, b) => b.outstanding - a.outstanding);
  }, [workers, transactions]);

  const totalOutstanding = workerBalances.reduce((sum, b) => sum + (b.outstanding > 0 ? b.outstanding : 0), 0);
  const totalLoanedAllTime = workerBalances.reduce((sum, b) => sum + b.total_loaned, 0);

  const thisMonth = new Date();
  const thisMonthTxs = transactions.filter(t => isSameMonth(new Date(t.tx_date), thisMonth));
  const repaidThisMonth = thisMonthTxs.filter(t => t.type === 'repayment').reduce((sum, t) => sum + Number(t.amount), 0);
  const loanedThisMonth = thisMonthTxs.filter(t => t.type === 'loan').reduce((sum, t) => sum + Number(t.amount), 0);

  const today = new Date();
  const repaidToday = transactions
    .filter(t => t.type === 'repayment' && new Date(t.tx_date).toDateString() === today.toDateString())
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const daysSinceList = workerBalances.filter(b => b.last_repayment_date).map(b => differenceInDays(today, new Date(b.last_repayment_date!)));
  const avgDaysSinceRepayment = daysSinceList.length > 0 ? Math.round(daysSinceList.reduce((a, b) => a + b, 0) / daysSinceList.length) : 0;

  const top3Workers = workerBalances.filter(b => b.outstanding > 0).slice(0, 3);
  const filteredList = workerBalances.filter(b => activeTab === 'all' || b.status === activeTab);

  const selectedBalance = selectedWorkerId ? workerBalances.find(b => b.worker.id === selectedWorkerId) : null;
  const selectedWorkerTxs = selectedWorkerId ? transactions.filter(t => t.worker_id === selectedWorkerId).slice(0, 5) : [];

  return (
    <div className="flex flex-col gap-6">

      {/* Row 1: KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Wide Card */}
        <div className="lg:col-span-2 bg-card rounded-card p-6 lg:p-8 border border-border flex flex-col gap-8 shadow-subtle relative overflow-hidden">
          {/* subtle background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-coral/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div>
              <span className="text-text-muted text-sm font-medium">Total outstanding</span>
              <div className="mt-2">
                <AmountText amount={totalOutstanding} type="due" className="text-4xl lg:text-[40px] tracking-tight font-bold" />
              </div>
            </div>
            <div>
              <span className="text-text-muted text-sm font-medium">Repaid this month</span>
              <div className="mt-2">
                <AmountText amount={repaidThisMonth} type="repaid" className="text-2xl lg:text-3xl tracking-tight font-bold" />
              </div>
            </div>
            <div>
              <span className="text-text-muted text-sm font-medium">Avg days since last repayment</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="tabular-nums font-heading text-2xl lg:text-3xl text-text-primary tracking-tight font-bold">{avgDaysSinceRepayment}</span>
                <span className="text-text-muted text-sm">days</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50 relative z-10 mt-auto">
             {/* Last 3 months segments */}
             {[2, 1, 0].map(monthOffset => {
                const date = subMonths(thisMonth, monthOffset);
                const monthTxs = transactions.filter(t => isSameMonth(new Date(t.tx_date), date));
                const monthLoan = monthTxs.filter(t => t.type === 'loan').reduce((sum, t) => sum + Number(t.amount), 0);
                const monthRepaid = monthTxs.filter(t => t.type === 'repayment').reduce((sum, t) => sum + Number(t.amount), 0);
                const activeWorkerIds = [...new Set(monthTxs.map(t => t.worker_id))];

                return (
                  <div key={monthOffset} className="flex flex-col gap-3">
                    <SegmentedProgress total={monthLoan} completed={monthRepaid} label={format(date, 'MMM yyyy')} delay={0.2 + (2-monthOffset)*0.1} />
                    {activeWorkerIds.length > 0 && (
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {activeWorkerIds.slice(0, 4).map(id => {
                           const w = workers.find(w => w.id === id);
                           return w ? <AvatarChip key={id} name={w.name} className="w-6 h-6 text-[9px] ring-2 ring-card" /> : null;
                        })}
                        {activeWorkerIds.length > 4 && (
                           <div className="w-6 h-6 rounded-full bg-card-raised ring-2 ring-card flex items-center justify-center text-[9px] font-bold text-text-muted">
                             +{activeWorkerIds.length - 4}
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                );
             })}
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-card rounded-card p-6 lg:p-8 border border-border flex flex-col shadow-subtle relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-lime/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="flex justify-between items-start z-10 relative">
            <div>
              <span className="text-text-muted text-sm font-medium">Repaid today</span>
              <div className="mt-1">
                <AmountText amount={repaidToday} type="neutral" className="text-3xl tracking-tight font-bold" />
              </div>
            </div>
            <button className="text-text-muted hover:text-text-primary transition-colors p-1"><Expand className="w-4 h-4" /></button>
          </div>

          <div className="mt-8 flex flex-col gap-3 z-10 relative">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Top outstanding</span>
            {top3Workers.map((b, i) => (
              <div key={b.worker.id} className={cn("p-3 rounded-inner flex items-center justify-between", i === 0 ? "bg-accent-lime text-accent-limeText" : "bg-card-raised text-text-primary")}>
                <div className="flex items-center gap-2">
                  <AvatarChip name={b.worker.name} className={cn("w-7 h-7 text-[10px]", i === 0 && "bg-[#0C0F14]/10 text-accent-limeText")} />
                  <span className="text-sm font-medium">{b.worker.name}</span>
                </div>
                <span className="tabular-nums font-heading font-bold text-sm">{formatCurrency(b.outstanding)}</span>
              </div>
            ))}
          </div>

          <button className="mt-auto pt-6 z-10 relative w-full">
            <div className="w-full bg-card-raised hover:bg-border/50 border border-border text-text-primary rounded-full py-3 font-medium text-sm transition-colors text-center">
              Record repayment
            </div>
          </button>
        </div>
      </div>

      {/* Row 2: Filter bar */}
      <FilterBar>
         <div className="bg-card-raised p-1 rounded-full flex gap-1 border border-border w-full sm:w-auto">
            {(['all', 'pending', 'cleared'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedWorkerId(null); }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize flex-1 sm:flex-none text-center relative",
                  activeTab === tab ? "text-accent-limeText" : "text-text-muted hover:text-text-primary"
                )}
              >
                {activeTab === tab && (
                  <motion.div layoutId="tabIndicator" className="absolute inset-0 bg-accent-lime rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
         </div>
      </FilterBar>

      {/* Row 3: Light Panel list & Dark Panel detail */}
      <div className="bg-panel-light rounded-card p-2 border border-border/20 shadow-xl overflow-hidden min-h-[600px] flex flex-col lg:flex-row relative">

        {/* Left List */}
        <div className="flex-1 flex flex-col h-full lg:max-w-md border-r border-panel-lightText/5">
          <div className="p-5 pb-3">
             <h2 className="text-panel-lightText font-heading font-bold text-xl">Worker balances</h2>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1 pb-safe">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-panel-lightText/60 text-sm">No workers found.</div>
            ) : (
              filteredList.map(b => (
                <button
                  key={b.worker.id}
                  onClick={() => setSelectedWorkerId(b.worker.id === selectedWorkerId ? null : b.worker.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-inner flex items-center justify-between transition-all group",
                    selectedWorkerId === b.worker.id
                      ? "bg-canvas text-text-primary shadow-lg scale-[0.99] -translate-y-px"
                      : "hover:bg-black/5 text-panel-lightText"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <AvatarChip name={b.worker.name} className={cn(selectedWorkerId === b.worker.id ? "" : "shadow-sm")} />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{b.worker.name}</span>
                      <span className={cn("text-[11px]", selectedWorkerId === b.worker.id ? "text-text-muted" : "text-panel-lightText/60")}>
                        {b.last_repayment_date
                          ? `Repaid ${differenceInDays(today, new Date(b.last_repayment_date))}d ago`
                          : 'No repayment yet'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className={cn("tabular-nums font-heading font-bold", selectedWorkerId === b.worker.id ? (b.outstanding > 0 ? "text-accent-coral" : "text-text-primary") : "")}>
                       {formatCurrency(b.outstanding)}
                     </span>
                     <StatusPill status={b.status} className={cn("scale-[0.85] origin-right", selectedWorkerId === b.worker.id ? "" : "opacity-80")} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Detail Panel (Desktop) */}
        <div className="hidden lg:block flex-1 p-2 bg-panel-light relative h-[600px]">
          {selectedBalance ? (
            <DetailPanel isOpen={true} className="shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <AvatarChip name={selectedBalance.worker.name} className="w-14 h-14 text-xl" />
                  <div>
                    <h3 className="text-2xl font-heading font-bold">{selectedBalance.worker.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-text-muted text-sm">{selectedBalance.worker.phone || 'No phone added'}</span>
                      <StatusPill status={selectedBalance.status} />
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedWorkerId(null)} className="p-2 bg-card-raised rounded-full text-text-muted hover:text-text-primary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-card-raised rounded-inner p-4 border border-border">
                  <span className="text-xs text-text-muted font-medium">Total loaned</span>
                  <div className="mt-1 font-heading text-lg">{formatCurrency(selectedBalance.total_loaned)}</div>
                </div>
                <div className="bg-card-raised rounded-inner p-4 border border-border">
                  <span className="text-xs text-text-muted font-medium">Total repaid</span>
                  <div className="mt-1 font-heading text-lg text-accent-lime">{formatCurrency(selectedBalance.total_repaid)}</div>
                </div>
                <div className="bg-card-raised rounded-inner p-4 border border-accent-coral/20">
                  <span className="text-xs text-text-muted font-medium">Outstanding</span>
                  <div className="mt-1 font-heading text-lg text-accent-coral font-bold">{formatCurrency(selectedBalance.outstanding)}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <h4 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Recent Activity</h4>
                <div className="space-y-2">
                  {selectedWorkerTxs.length === 0 ? (
                    <div className="text-sm text-text-muted py-4 text-center">No transactions yet.</div>
                  ) : (
                    selectedWorkerTxs.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", tx.type === 'loan' ? "bg-accent-coral/10 text-accent-coral" : "bg-accent-lime/10 text-accent-lime")}>
                             {tx.type === 'loan' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{tx.type === 'loan' ? 'Loan given' : 'Repayment'}</span>
                            <span className="text-xs text-text-muted">{format(new Date(tx.tx_date), 'dd MMM yyyy')}</span>
                          </div>
                        </div>
                        <AmountText amount={tx.amount} type={tx.type === 'loan' ? 'due' : 'repaid'} className="text-sm font-medium" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 flex gap-3">
                <button className="flex-1 bg-card-raised hover:bg-border/50 text-text-primary rounded-input py-3 text-sm font-medium transition-colors border border-border">
                  Add loan
                </button>
                <button className="flex-1 bg-accent-lime hover:bg-[#b3e025] text-accent-limeText rounded-input py-3 text-sm font-bold transition-colors">
                  Record repayment
                </button>
                <button className="p-3 bg-card-raised hover:bg-border/50 text-text-primary rounded-input transition-colors border border-border" aria-label="Export statement">
                  <Download className="w-5 h-5" />
                </button>
              </div>

            </DetailPanel>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-panel-lightText/40">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mb-4 opacity-20">
                <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="font-medium">Select a worker to view details</p>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Detail Panel (Full screen overlay) */}
      <AnimatePresence>
        {selectedWorkerId && selectedBalance && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="lg:hidden fixed inset-0 z-50 bg-canvas flex flex-col"
          >
             <div className="flex items-center justify-between p-4 border-b border-border/50 sticky top-0 bg-canvas/90 backdrop-blur">
               <button onClick={() => setSelectedWorkerId(null)} className="p-2 -ml-2 text-text-muted">
                 <X className="w-6 h-6" />
               </button>
               <span className="font-heading font-bold">Worker details</span>
               <div className="w-10"></div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                <div className="flex flex-col items-center text-center gap-3 mt-4">
                  <AvatarChip name={selectedBalance.worker.name} className="w-20 h-20 text-3xl" />
                  <div>
                    <h3 className="text-2xl font-heading font-bold">{selectedBalance.worker.name}</h3>
                    <p className="text-text-muted mt-1">{selectedBalance.worker.phone || 'No phone'}</p>
                    <div className="mt-3"><StatusPill status={selectedBalance.status} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-4">
                  <div className="bg-card rounded-inner p-5 border border-border flex justify-between items-center">
                    <span className="text-sm text-text-muted font-medium">Outstanding</span>
                    <span className="font-heading text-xl text-accent-coral font-bold">{formatCurrency(selectedBalance.outstanding)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded-inner p-4 border border-border">
                      <span className="text-xs text-text-muted font-medium">Total loaned</span>
                      <div className="mt-1 font-heading text-base">{formatCurrency(selectedBalance.total_loaned)}</div>
                    </div>
                    <div className="bg-card rounded-inner p-4 border border-border">
                      <span className="text-xs text-text-muted font-medium">Total repaid</span>
                      <div className="mt-1 font-heading text-base text-accent-lime">{formatCurrency(selectedBalance.total_repaid)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Recent Activity</h4>
                  <div className="bg-card rounded-inner border border-border divide-y divide-border/50 overflow-hidden">
                    {selectedWorkerTxs.length === 0 ? (
                      <div className="text-sm text-text-muted py-6 text-center">No transactions yet.</div>
                    ) : (
                      selectedWorkerTxs.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", tx.type === 'loan' ? "bg-accent-coral/10 text-accent-coral" : "bg-accent-lime/10 text-accent-lime")}>
                               {tx.type === 'loan' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{tx.type === 'loan' ? 'Loan given' : 'Repayment'}</span>
                              <span className="text-xs text-text-muted">{format(new Date(tx.tx_date), 'dd MMM yyyy')}</span>
                            </div>
                          </div>
                          <AmountText amount={tx.amount} type={tx.type === 'loan' ? 'due' : 'repaid'} className="text-base font-bold" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
             </div>

             <div className="p-4 border-t border-border/50 bg-card pb-safe">
                <div className="flex gap-3">
                  <button className="flex-1 bg-card-raised border border-border text-text-primary rounded-input py-4 text-sm font-medium active:scale-95 transition-all">
                    Add loan
                  </button>
                  <button className="flex-[2] bg-accent-lime text-accent-limeText rounded-input py-4 text-sm font-bold active:scale-95 transition-all">
                    Record repayment
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
