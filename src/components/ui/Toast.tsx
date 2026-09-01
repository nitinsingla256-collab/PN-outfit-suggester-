/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastMessage } from '../../types';

export interface ToastProps {
  key?: React.Key;
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-white',
    info: 'border-sky-500/30 bg-white',
    warning: 'border-emerald-500/30 bg-white',
    error: 'border-rose-500/30 bg-white',
  };

  return (
    <motion.div exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${borders[toast.type]} shadow-[0_8px_25px_rgba(0,0,0,0.6)] w-full max-w-sm pointer-events-auto backdrop-blur-md`}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-gray-900">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-gray-500 hover:text-gray-700 p-0.5 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
    >
      <div>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}
