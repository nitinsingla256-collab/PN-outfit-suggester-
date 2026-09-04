/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

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


import { AddClothingModal } from './components/wardrobe/AddClothingModal';
import { ClothingDetailModal } from './components/wardrobe/ClothingDetailModal';
import { CreateLookModal } from './components/outfits/CreateLookModal';
import { FirstLoginMeasurementsModal } from './components/profile/FirstLoginMeasurementsModal';
import { SafeModeScreen } from './components/ui/SafeModeScreen';

function PageLoadingSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800/60 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl hidden sm:block" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200/60 dark:border-gray-700/40" />
        <div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200/60 dark:border-gray-700/40" />
        <div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200/60 dark:border-gray-700/40" />
      </div>
      <div className="h-64 bg-gray-100 dark:bg-gray-800/40 rounded-2xl border border-gray-200/60 dark:border-gray-700/40" />
    </div>
  );
}

function RouterView() {
  const { currentRoute, user, navigateTo } = useApp();

  if (currentRoute === '/admin' && user.role !== 'supervisor' && user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif tracking-widest text-gray-900 dark:text-gray-100 uppercase">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 max-w-md mt-2 mb-6">
          The Administrator & Supervisor portal requires elevated cryptographic credentials. Your account is logged in as a Standard Atelier Client.
        </p>
        <button
          onClick={() => navigateTo('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-medium uppercase tracking-wider transition"
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
      case '/home': return <HomePage key="home" />;
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
    <ErrorBoundary
      key={currentRoute}
      pageName={currentRoute}
      fallbackTitle={`Issue rendering ${currentRoute.replace('/', '') || 'Home'} page`}
      fallbackMessage="We encountered an issue displaying this page. Your wardrobe and data remain completely safe."
    >
      <div className="w-full h-full">
        {renderPage()}
      </div>
    </ErrorBoundary>
  );
}

export function AppContent() {
  const {
    isAuthenticated,
    authLoading,
    isAddClothingModalOpen,
    selectedWardrobeItemForDetail,
    isCreateLookModalOpen,
    isFirstLoginMeasurementsModalOpen,
    setIsFirstLoginMeasurementsModalOpen,
  } = useApp();





  return (
    <AppLayout>
      <RouterView />

      {/* Conditionally rendered modals for pristine memory and zero idle CPU usage */}
      {isAddClothingModalOpen && (
        <AddClothingModal />
      )}

      {selectedWardrobeItemForDetail && (
        <ClothingDetailModal />
      )}

      {isCreateLookModalOpen && (
        <CreateLookModal />
      )}

      {isFirstLoginMeasurementsModalOpen && (
        <FirstLoginMeasurementsModal
          isOpen={isFirstLoginMeasurementsModalOpen}
          onClose={() => setIsFirstLoginMeasurementsModalOpen(false)}
        />
      )}
    </AppLayout>
  );
}

export default function App() {
  const isSafeMode = typeof window !== 'undefined' && (
    window.location.search.includes('safe=1') ||
    window.location.hash.includes('safe=1')
  );

  if (isSafeMode) {
    return <SafeModeScreen />;
  }

  return (
    <ErrorBoundary
      fallbackTitle="Application Recovery"
      fallbackMessage="An unexpected issue occurred. Click below to reload the Atelier."
    >
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
