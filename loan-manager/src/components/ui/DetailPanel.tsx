import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DetailPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DetailPanel({ isOpen, onClose, children, className }: DetailPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn("bg-canvas rounded-card p-6 border border-border h-full flex flex-col", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
