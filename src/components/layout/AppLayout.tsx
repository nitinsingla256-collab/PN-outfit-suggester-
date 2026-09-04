/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../ui/Toast';
import { useApp } from '../../context/AppContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { toasts, dismissToast, theme } = useApp();

  const isDark = theme === 'Midnight Luxury';

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-600 dark:selection:text-emerald-400 relative overflow-hidden transition-colors duration-200">
      {/* Dynamic Atmospheric Background - Static GPU-safe subtle backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {isDark ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[#090D16] via-[#0D1322] to-[#090D16]" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] via-[#F8F9FA] to-[#F3F4F6]" />
        )}
      </div>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-32 lg:pb-10 relative z-10">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
