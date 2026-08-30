/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { WardrobePage } from './pages/WardrobePage';
import { StylistPage } from './pages/StylistPage';
import { OutfitsPage } from './pages/OutfitsPage';
import { PlannerPage } from './pages/PlannerPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthPage } from './pages/AuthPage';
import { AddClothingModal } from './components/wardrobe/AddClothingModal';
import { ClothingDetailModal } from './components/wardrobe/ClothingDetailModal';
import { CreateLookModal } from './components/outfits/CreateLookModal';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function RouterView() {
  const { currentRoute, user, navigateTo } = useApp();

  if (currentRoute === '/admin' && user.role !== 'supervisor' && user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif tracking-widest text-gray-900 uppercase">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 max-w-md mt-2 mb-6">
          The Administrator & Supervisor portal requires elevated cryptographic credentials. Your account is logged in as a Standard Atelier Client.
        </p>
        <button
          onClick={() => navigateTo('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-300 text-gray-900 text-xs font-medium uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Private Wardrobe</span>
        </button>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentRoute) {
      case '/': return <HomePage key="home" />;
      case '/wardrobe': return <WardrobePage key="wardrobe" />;
      case '/stylist': return <StylistPage key="stylist" />;
      case '/outfits': return <OutfitsPage key="outfits" />;
      case '/planner': return <PlannerPage key="planner" />;
      case '/favorites': return <FavoritesPage key="favorites" />;
      case '/profile': return <ProfilePage key="profile" />;
      case '/settings': return <SettingsPage key="settings" />;
      case '/admin': return <AdminPage key="admin" />;
      default: return <NotFoundPage key="notfound" />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentRoute}
        initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full"
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}

export function AppContent() {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-900">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-300 flex items-center justify-center shadow-2xl mb-4 relative animate-pulse">
          <span className="font-serif text-2xl font-bold tracking-widest text-gray-900">
            PN
          </span>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-mono">
          PN OUTFIT SUGGESTER
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <AppLayout>
      <RouterView />
      <AddClothingModal />
      <ClothingDetailModal />
      <CreateLookModal />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
