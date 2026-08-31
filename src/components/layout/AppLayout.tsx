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
      {/* Dynamic Atmospheric Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[140px] animate-pulse-slow"></div>
            <div className="absolute top-[30%] -right-[10%] w-[45%] h-[60%] rounded-full bg-indigo-950/40 blur-[130px] animate-pulse-slower"></div>
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-emerald-950/25 blur-[160px] animate-pulse-slow"></div>
          </>
        ) : (
          <>
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[120px] animate-pulse-slow"></div>
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-slate-100/50 blur-[100px] animate-pulse-slower"></div>
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-emerald-50/50 blur-[150px] animate-pulse-slow"></div>
          </>
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
