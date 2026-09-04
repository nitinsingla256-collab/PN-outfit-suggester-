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
    <div className="flex min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-emerald-500/20 selection:text-emerald-500 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Atmospheric Background - Simplified to prevent GPU OOM crash */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-emerald-950/20" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30" />
        )}
      </div>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-10 relative z-10">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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
