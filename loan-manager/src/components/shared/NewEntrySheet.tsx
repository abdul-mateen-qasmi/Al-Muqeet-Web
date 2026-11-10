import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkers, addTransaction } from '@/lib/db';
import { cn, formatCurrency } from '@/lib/utils';
import { X, Check } from 'lucide-react';
import { AvatarChip } from '../ui/AvatarChip';

interface NewEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'loan' | 'repayment';
  defaultWorkerId?: string;
}

export function NewEntrySheet({ isOpen, onClose, defaultType = 'loan', defaultWorkerId }: NewEntrySheetProps) {
  const [type, setType] = useState<'loan' | 'repayment'>(defaultType);
  const [workerId, setWorkerId] = useState<string>(defaultWorkerId || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const queryClient = useQueryClient();
  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: getWorkers });

  const mutation = useMutation({
    mutationFn: () => addTransaction({
      worker_id: workerId,
      type,
      amount: parseFloat(amount),
      tx_date: new Date().toISOString(),
      note: note.trim() || undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
      setWorkerId('');
      setAmount('');
      setNote('');
    }
  });

  const handleSave = () => {
    if (!workerId || !amount || parseFloat(amount) <= 0) return;
    mutation.mutate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-x-0 bottom-0 z-[101] bg-card rounded-t-[32px] border-t border-border flex flex-col max-h-[90vh] lg:max-h-none lg:h-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:rounded-[32px] lg:w-full lg:max-w-md lg:border shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="font-heading font-bold text-xl">New Entry</h2>
              <button onClick={onClose} className="p-2 -mr-2 bg-canvas rounded-full text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6 overflow-y-auto flex flex-col gap-6">

              {/* Type Segmented Control */}
              <div className="bg-canvas p-1 rounded-full flex border border-border">
                <button
                  onClick={() => setType('loan')}
                  className={cn(
                    "flex-1 py-2.5 rounded-full text-sm font-bold transition-all relative",
                    type === 'loan' ? "text-accent-coralText" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  {type === 'loan' && (
                    <motion.div layoutId="entryType" className="absolute inset-0 bg-accent-coral rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                  <span className={cn("relative z-10", type === 'loan' && "text-[#0C0F14]")}>Loan Given</span>
                </button>
                <button
                  onClick={() => setType('repayment')}
                  className={cn(
                    "flex-1 py-2.5 rounded-full text-sm font-bold transition-all relative",
                    type === 'repayment' ? "text-accent-limeText" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  {type === 'repayment' && (
                    <motion.div layoutId="entryType" className="absolute inset-0 bg-accent-lime rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                  <span className={cn("relative z-10", type === 'repayment' && "text-[#0C0F14]")}>Repayment</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-muted ml-1">Worker</label>
                  <select
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    className="bg-canvas border border-border rounded-input px-4 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a worker...</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-muted ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-heading text-lg">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-canvas border border-border rounded-input pl-8 pr-4 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime font-heading text-lg tabular-nums placeholder:text-text-muted/30"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-muted ml-1">Note (optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="bg-canvas border border-border rounded-input px-4 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime placeholder:text-text-muted/30"
                    placeholder="E.g., Advance for tools"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!workerId || !amount || parseFloat(amount) <= 0 || mutation.isPending}
                className={cn(
                  "w-full py-4 rounded-input font-bold text-base flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50",
                  type === 'loan'
                    ? "bg-accent-coral text-[#0C0F14] hover:bg-[#ff8070]"
                    : "bg-accent-lime text-[#0C0F14] hover:bg-[#b3e025]"
                )}
              >
                <Check className="w-5 h-5" />
                Save {type === 'loan' ? 'Loan' : 'Repayment'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
