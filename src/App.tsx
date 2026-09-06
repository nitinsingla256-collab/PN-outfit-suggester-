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

// Route-level lazy imports to avoid eagerly loading heavy dependencies (such as Recharts)
const WardrobePage = lazy(() => import('./pages/WardrobePage').then(m => ({ default: m.WardrobePage })));
const StylistPage = lazy(() => import('./pages/StylistPage').then(m => ({ default: m.StylistPage })));
const OutfitsPage = lazy(() => import('./pages/OutfitsPage').then(m => ({ default: m.OutfitsPage })));
const PlannerPage = lazy(() => import('./pages/PlannerPage').then(m => ({ default: m.PlannerPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded modal dialogues
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
      <Suspense fallback={<PageLoadingSkeleton />}>
        <div className="w-full h-full">
          {renderPage()}
        </div>
      </Suspense>
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
