/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
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
import { AuthPage } from './pages/AuthPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy-loaded modal dialogues for pristine memory and zero idle CPU usage
const AddClothingModal = lazy(() => import('./components/wardrobe/AddClothingModal').then(m => ({ default: m.AddClothingModal })));
const ClothingDetailModal = lazy(() => import('./components/wardrobe/ClothingDetailModal').then(m => ({ default: m.ClothingDetailModal })));
const CreateLookModal = lazy(() => import('./components/outfits/CreateLookModal').then(m => ({ default: m.CreateLookModal })));
const FirstLoginMeasurementsModal = lazy(() => import('./components/profile/FirstLoginMeasurementsModal').then(m => ({ default: m.FirstLoginMeasurementsModal })));

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

import { isStyleProfileComplete } from './utils/profileValidation';
import { PersonalStyleProfileCard } from './components/profile/PersonalStyleProfileCard';

function RouterView() {
  const { currentRoute, user, navigateTo, isAuthenticated } = useApp();

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
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigateTo('/auth')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium uppercase tracking-wider transition shadow-sm"
          >
            <span>Sign In with Admin Account</span>
          </button>
          <button
            onClick={() => navigateTo('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-medium uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Private Wardrobe</span>
          </button>
        </div>
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
      case '/auth': return <AuthPage key="auth" />;
      case '/login': return <AuthPage key="login" />;
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
    user,
    isAddClothingModalOpen,
    selectedWardrobeItemForDetail,
    isCreateLookModalOpen,
    isFirstLoginMeasurementsModalOpen,
    setIsFirstLoginMeasurementsModalOpen,
  } = useApp();

  // Force setup if authenticated and profile is not completely valid
  const needsSetup = isAuthenticated && !isStyleProfileComplete(user.profile);

  if (needsSetup) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-start justify-center p-4 py-8 sm:py-12 animate-in fade-in duration-500 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold font-editorial text-slate-900">Welcome to PN</h1>
            <p className="text-sm text-slate-500 mt-1">Please complete your style profile to begin building your digital wardrobe.</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <PersonalStyleProfileCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <RouterView />

      {/* Conditionally rendered modals for pristine memory and zero idle CPU usage */}
      <Suspense fallback={null}>
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
      </Suspense>
    </AppLayout>
  );
}

export default function App() {
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
