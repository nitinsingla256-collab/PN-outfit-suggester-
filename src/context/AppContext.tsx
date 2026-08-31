/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  NavigationRoute,
  User,
  WardrobeItem,
  Outfit,
  PlannedOutfit,
  ToastMessage,
  OccasionType,
  ThemeMode,
} from '../types';
import { INITIAL_USER } from '../data/seedData';
import { wardrobeService } from '../services/wardrobeService';
import { outfitService } from '../services/outfitService';
import { plannerService } from '../services/plannerService';
import { authService } from '../services/authService';

interface AppContextType {
  // Routing
  currentRoute: NavigationRoute;
  navigateTo: (route: NavigationRoute) => void;

  // Theme & Aesthetics
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Auth State & Actions
  isAuthenticated: boolean;
  authLoading: boolean;
  user: User;
  signIn: (email: string, passwordPlain: string) => Promise<void>;
  signUp: (name: string, email: string, passwordPlain: string, confirmPassword?: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ message: string; resetCode?: string }>;
  resetPassword: (email: string, resetCode: string, newPasswordPlain: string) => Promise<string>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Wardrobe
  wardrobe: WardrobeItem[];
  isLoadingWardrobe: boolean;
  addWardrobeItem: (item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>) => Promise<WardrobeItem>;
  updateWardrobeItem: (id: string, updates: Partial<WardrobeItem>) => Promise<void>;
  deleteWardrobeItem: (id: string) => Promise<void>;
  deleteMultipleWardrobeItems: (ids: string[]) => Promise<void>;
  clearWardrobe: () => Promise<void>;
  resetToSampleWardrobe: () => Promise<void>;
  toggleWardrobeFavorite: (id: string) => Promise<void>;
  recordWearItem: (id: string) => Promise<void>;
  reloadWardrobe: () => Promise<void>;

  // Outfits / Looks
  outfits: Outfit[];
  isLoadingOutfits: boolean;
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>) => Promise<Outfit>;
  deleteOutfit: (id: string) => Promise<void>;
  deleteMultipleOutfits: (ids: string[]) => Promise<void>;
  clearOutfits: () => Promise<void>;
  toggleOutfitFavorite: (id: string) => Promise<void>;
  recordWearOutfit: (id: string) => Promise<void>;

  // Planner
  plans: PlannedOutfit[];
  isLoadingPlans: boolean;
  addPlan: (plan: Omit<PlannedOutfit, 'id' | 'createdAt' | 'isCompleted'>) => Promise<PlannedOutfit>;
  deletePlan: (id: string) => Promise<void>;
  togglePlanCompleted: (id: string) => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Active Modals / Drawers
  isAddClothingModalOpen: boolean;
  setIsAddClothingModalOpen: (open: boolean) => void;
  isCreateLookModalOpen: boolean;
  setIsCreateLookModalOpen: (open: boolean) => void;
  isPlanModalOpen: boolean;
  setIsPlanModalOpen: (open: boolean) => void;
  isFirstLoginMeasurementsModalOpen: boolean;
  setIsFirstLoginMeasurementsModalOpen: (open: boolean) => void;
  openMeasurementsModal: () => void;
  selectedWardrobeItemForDetail: WardrobeItem | null;
  setSelectedWardrobeItemForDetail: (item: WardrobeItem | null) => void;
  quickOccasionForStylist: OccasionType | null;
  setQuickOccasionForStylist: (occasion: OccasionType | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VALID_NAVIGATION_ROUTES: NavigationRoute[] = [
  '/',
  '/wardrobe',
  '/stylist',
  '/outfits',
  '/planner',
  '/favorites',
  '/profile',
  '/settings',
  '/admin',
];

function resolveCurrentRoute(): NavigationRoute {
  try {
    if (typeof window === 'undefined') return '/';

    // 1. Prioritize hash-based route if present (e.g. "#/wardrobe", "#wardrobe")
    const hash = window.location.hash || '';
    if (hash) {
      const cleanHash = hash.replace(/^#\/?/, '').split('?')[0].split('/')[0];
      if (cleanHash === 'home' || cleanHash === '') return '/';
      const candidate = `/${cleanHash}` as NavigationRoute;
      if (VALID_NAVIGATION_ROUTES.includes(candidate)) {
        return candidate;
      }
    }

    // 2. Fallback to pathname if accessed directly (e.g. "/wardrobe")
    const pathname = window.location.pathname || '/';
    if (pathname !== '/' && pathname !== '') {
      const cleanPath = pathname.replace(/^\//, '').split('?')[0].split('/')[0];
      if (cleanPath === 'home' || cleanPath === '') return '/';
      const candidate = `/${cleanPath}` as NavigationRoute;
      if (VALID_NAVIGATION_ROUTES.includes(candidate)) {
        return candidate;
      }
    }

    return '/';
  } catch {
    return '/';
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State with zero-reload browser & PWA sync
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute>(() => resolveCurrentRoute());

  const [user, setUser] = useState<User>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Visual Theme State ('Light Atelier' | 'Midnight Luxury')
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('pn_theme') as ThemeMode;
      if (savedTheme === 'Midnight Luxury' || savedTheme === 'Light Atelier') {
        return savedTheme;
      }
    } catch {
      // ignore
    }
    return 'Light Atelier';
  });

  // Apply theme to DOM documentElement
  useEffect(() => {
    try {
      if (theme === 'Midnight Luxury') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'midnight');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('pn_theme', theme);
    } catch (e) {
      console.warn('Could not persist theme to localStorage', e);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      if (newTheme === 'Midnight Luxury') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'midnight');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('pn_theme', newTheme);
    } catch (e) {
      console.warn('Theme update storage error:', e);
    }

    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: newTheme === 'Midnight Luxury' ? 'Dark' : 'Light',
      },
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = theme === 'Light Atelier' ? 'Midnight Luxury' : 'Light Atelier';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [plans, setPlans] = useState<PlannedOutfit[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState(false);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Modals state
  const [isAddClothingModalOpen, setIsAddClothingModalOpen] = useState(false);
  const [isCreateLookModalOpen, setIsCreateLookModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isFirstLoginMeasurementsModalOpen, setIsFirstLoginMeasurementsModalOpen] = useState(false);
  const [selectedWardrobeItemForDetail, setSelectedWardrobeItemForDetail] = useState<WardrobeItem | null>(null);
  const [quickOccasionForStylist, setQuickOccasionForStylist] = useState<OccasionType | null>(null);

  const openMeasurementsModal = useCallback(() => {
    setIsFirstLoginMeasurementsModalOpen(true);
  }, []);

  // Sync route safely across standalone PWA, mobile Chrome, and embedded iframes
  const navigateTo = useCallback((route: NavigationRoute) => {
    const targetRoute = route === '/home' ? '/' : route;
    setCurrentRoute(prev => {
      if (prev !== targetRoute) {
        console.log(`[PN Router] Navigated: ${prev} -> ${targetRoute}`);
      }
      return targetRoute;
    });

    try {
      if (typeof window !== 'undefined' && window.history) {
        const hashTarget = targetRoute === '/' ? '' : `#${targetRoute.replace(/^\//, '')}`;
        // Preserve current pathname and search, update hash for smooth single-page history
        const urlToPush = `${window.location.pathname}${window.location.search}${hashTarget}`;
        window.history.pushState({ route: targetRoute }, '', urlToPush);
      }
    } catch (e) {
      console.warn('[PN Router] pushState warning (restricted environment):', e);
    }
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {}
  }, []);

  // Initialize history state and handle back/forward / hashchange navigation
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.history && typeof window.history.replaceState === 'function') {
        const initial = resolveCurrentRoute();
        const hashTarget = initial === '/' ? '' : `#${initial.replace(/^\//, '')}`;
        const urlToReplace = `${window.location.pathname}${window.location.search}${hashTarget}`;
        window.history.replaceState({ route: initial }, '', urlToReplace);
      }
    } catch {}

    const handleSync = () => {
      try {
        const nextRoute = resolveCurrentRoute();
        console.log(`[PN Router] Route Sync Event -> ${nextRoute}`);
        setCurrentRoute(nextRoute);
      } catch (err) {
        console.warn('[PN Router] Route Sync warning:', err);
      }
    };

    window.addEventListener('popstate', handleSync);
    window.addEventListener('hashchange', handleSync);
    return () => {
      window.removeEventListener('popstate', handleSync);
      window.removeEventListener('hashchange', handleSync);
    };
  }, []);

  // Toasts
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, type, durationMs = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, title, description, type, durationMs };
      setToasts(prev => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
    },
    [dismissToast]
  );

  // Load User's Data from backend
  const loadUserData = useCallback(async () => {
    try {
      setIsLoadingWardrobe(true);
      setIsLoadingOutfits(true);
      setIsLoadingPlans(true);

      const [loadedWardrobe, loadedOutfits, loadedPlans] = await Promise.all([
        wardrobeService.getAll(),
        outfitService.getAll(),
        plannerService.getAll(),
      ]);

      setWardrobe(loadedWardrobe);
      setOutfits(outfitService.enrichWithWardrobeItems(loadedOutfits, loadedWardrobe));
      setPlans(plannerService.enrichWithOutfits(loadedPlans, loadedOutfits));
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setIsLoadingWardrobe(false);
      setIsLoadingOutfits(false);
      setIsLoadingPlans(false);
    }
  }, []);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        setAuthLoading(true);
        const session = await authService.getCurrentSession();
        if (session.isAuthenticated && session.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await loadUserData();

          // If user hasn't completed first-login height/weight calibration, show onboarding prompt
          if (!session.user.measurements?.hasCompletedFirstLoginMeasurements) {
            setIsFirstLoginMeasurementsModalOpen(true);
          }
        } else {
          setIsAuthenticated(false);
          setWardrobe([]);
          setOutfits([]);
          setPlans([]);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, [loadUserData]);

  // Auth Operations
  const signIn = async (email: string, passwordPlain: string) => {
    try {
      const { user: authedUser } = await authService.signIn(email, passwordPlain);
      setUser(authedUser);
      setIsAuthenticated(true);
      await loadUserData();

      // Check if user should be asked height & weight
      if (!authedUser.measurements?.hasCompletedFirstLoginMeasurements) {
        setIsFirstLoginMeasurementsModalOpen(true);
      }

      showToast({
        title: 'Welcome to PN',
        description: `Signed in as ${authedUser.name}.`,
        type: 'success',
      });
      if (authedUser.role === 'supervisor' || authedUser.role === 'admin') {
        navigateTo('/admin');
      } else {
        navigateTo('/');
      }
    } catch (err) {
      throw err;
    }
  };

  const signUp = async (name: string, email: string, passwordPlain: string, confirmPassword?: string) => {
    try {
      const { user: newUser } = await authService.signUp(name, email, passwordPlain, confirmPassword);
      setUser(newUser);
      setIsAuthenticated(true);
      setWardrobe([]);
      setOutfits([]);
      setPlans([]);

      // Prompt new users for height and weight immediately after account creation
      setIsFirstLoginMeasurementsModalOpen(true);

      showToast({
        title: 'Account Created',
        description: `Welcome to PN Outfit Suggester, ${newUser.name}. Your digital wardrobe is ready.`,
        type: 'success',
      });
      navigateTo('/');
    } catch (err) {
      throw err;
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    setWardrobe([]);
    setOutfits([]);
    setPlans([]);
    showToast({
      title: 'Signed Out',
      description: 'You have been safely signed out of PN.',
      type: 'info',
    });
    navigateTo('/');
  };

  const requestPasswordReset = async (email: string) => {
    return await authService.requestPasswordReset(email);
  };

  const resetPassword = async (email: string, resetCode: string, newPasswordPlain: string) => {
    return await authService.resetPassword(email, resetCode, newPasswordPlain);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const updated = await authService.updateUserProfile(updates);
    setUser(updated);
    showToast({
      title: 'Preferences Saved',
      description: 'Your styling parameters and profile have been synchronized.',
      type: 'success',
    });
  };

  const updateUser = updateProfile;

  const resetToDemoData = async () => {
    await loadUserData();
    showToast({
      title: 'Synchronized with Cloud Store',
      description: 'Your wardrobe data has been refreshed.',
      type: 'success',
    });
  };

  const clearAllData = async () => {
    setWardrobe([]);
    setOutfits([]);
    setPlans([]);
    showToast({
      title: 'Cache Cleared',
      description: 'In-memory state refreshed.',
      type: 'info',
    });
  };

  const addWardrobeItem = async (
    itemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>
  ): Promise<WardrobeItem> => {
    const newItem = await wardrobeService.create(itemData);
    setWardrobe(prev => [newItem, ...prev]);
    showToast({
      title: 'Item Catalogued',
      description: `"${newItem.name}" added to your digital wardrobe.`,
      type: 'success',
    });
    return newItem;
  };

  const updateWardrobeItem = async (id: string, updates: Partial<WardrobeItem>) => {
    const updated = await wardrobeService.update(id, updates);
    setWardrobe(prev => prev.map(item => (item.id === id ? updated : item)));
    showToast({
      title: 'Wardrobe Updated',
      description: `Changes to "${updated.name}" have been saved.`,
      type: 'success',
    });
  };

  const deleteWardrobeItem = async (id: string) => {
    await wardrobeService.delete(id);
    setWardrobe(prev => prev.filter(item => item.id !== id));
    showToast({
      title: 'Piece Removed',
      description: 'Item removed from your wardrobe catalogue.',
      type: 'info',
    });
  };

  const deleteMultipleWardrobeItems = async (ids: string[]) => {
    if (ids.length === 0) return;
    await wardrobeService.deleteMany(ids);
    const idSet = new Set(ids);
    setWardrobe(prev => prev.filter(item => !idSet.has(item.id)));
    showToast({
      title: 'Items Removed',
      description: `${ids.length} pieces removed from your digital wardrobe.`,
      type: 'info',
    });
  };

  const clearWardrobe = async () => {
    await wardrobeService.clearAll();
    setWardrobe([]);
    showToast({
      title: 'Wardrobe Emptied',
      description: 'All pieces have been removed from your wardrobe.',
      type: 'info',
    });
  };

  const resetToSampleWardrobe = async () => {
    const samples = await wardrobeService.resetToDemoItems();
    setWardrobe(samples);
    showToast({
      title: 'Sample Wardrobe Loaded',
      description: 'Editorial sample items have been restored.',
      type: 'success',
    });
  };

  const toggleWardrobeFavorite = async (id: string) => {
    const updated = await wardrobeService.toggleFavorite(id);
    setWardrobe(prev => prev.map(item => (item.id === id ? updated : item)));
    showToast({
      title: updated.isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
      description: `"${updated.name}" updated in your collection.`,
      type: 'info',
      durationMs: 2500,
    });
  };

  const recordWearItem = async (id: string) => {
    const updated = await wardrobeService.recordWear(id);
    setWardrobe(prev => prev.map(item => (item.id === id ? updated : item)));
    showToast({
      title: 'Wear Cycle Recorded',
      description: `Logged wear for "${updated.name}" (Cycle: ${updated.timesWorn}).`,
      type: 'success',
      durationMs: 3000,
    });
  };

  const reloadWardrobe = async () => {
    const items = await wardrobeService.getAll();
    setWardrobe(items);
  };

  const addOutfit = async (
    outfitData: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>
  ): Promise<Outfit> => {
    const created = await outfitService.create(outfitData);
    const enriched = outfitService.enrichWithWardrobeItems([created], wardrobe)[0];
    setOutfits(prev => [enriched, ...prev]);
    showToast({
      title: 'Look Created',
      description: `"${created.name}" saved to your lookbook.`,
      type: 'success',
    });
    return created;
  };

  const deleteOutfit = async (id: string) => {
    await outfitService.delete(id);
    setOutfits(prev => prev.filter(o => o.id !== id));
    showToast({
      title: 'Lookbook Updated',
      description: 'Outfit removed from your collection.',
      type: 'info',
    });
  };

  const deleteMultipleOutfits = async (ids: string[]) => {
    if (ids.length === 0) return;
    await outfitService.deleteMany(ids);
    const idSet = new Set(ids);
    setOutfits(prev => prev.filter(o => !idSet.has(o.id)));
    showToast({
      title: 'Looks Removed',
      description: `${ids.length} outfits removed from your lookbook.`,
      type: 'info',
    });
  };

  const clearOutfits = async () => {
    await outfitService.clearAll();
    setOutfits([]);
    showToast({
      title: 'Lookbook Cleared',
      description: 'All saved outfits have been removed.',
      type: 'info',
    });
  };

  const toggleOutfitFavorite = async (id: string) => {
    const updated = await outfitService.toggleFavorite(id);
    setOutfits(prev =>
      prev.map(o => (o.id === id ? { ...o, isFavorite: updated.isFavorite } : o))
    );
    showToast({
      title: updated.isFavorite ? 'Look Favorited' : 'Look Unfavorited',
      description: `"${updated.name}" updated.`,
      type: 'info',
      durationMs: 2500,
    });
  };

  const recordWearOutfit = async (id: string) => {
    const updated = await outfitService.recordWear(id);
    setOutfits(prev => prev.map(o => (o.id === id ? { ...o, timesWorn: updated.timesWorn } : o)));
    await reloadWardrobe();
    showToast({
      title: 'Outfit Worn Today',
      description: `"${updated.name}" logged. Wear cycles updated for all constituent pieces.`,
      type: 'success',
      durationMs: 3500,
    });
  };

  const addPlan = async (
    planData: Omit<PlannedOutfit, 'id' | 'createdAt' | 'isCompleted'>
  ): Promise<PlannedOutfit> => {
    const newPlan = await plannerService.create(planData);
    const enriched = plannerService.enrichWithOutfits([newPlan], outfits)[0];
    setPlans(prev => [enriched, ...prev]);
    showToast({
      title: 'Outfit Scheduled',
      description: `Look scheduled for ${newPlan.date}.`,
      type: 'success',
    });
    return newPlan;
  };

  const deletePlan = async (id: string) => {
    await plannerService.delete(id);
    setPlans(prev => prev.filter(p => p.id !== id));
    showToast({
      title: 'Schedule Removed',
      description: 'Planned outfit entry removed.',
      type: 'info',
    });
  };

  const togglePlanCompleted = async (id: string) => {
    const target = plans.find(p => p.id === id);
    if (!target) return;
    const updated = await plannerService.update(id, { isCompleted: !target.isCompleted });
    setPlans(prev => prev.map(p => (p.id === id ? { ...p, isCompleted: updated.isCompleted } : p)));
    showToast({
      title: updated.isCompleted ? 'Marked as Worn' : 'Marked as Upcoming',
      description: `Schedule status updated.`,
      type: 'info',
      durationMs: 2500,
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigateTo,
        theme,
        setTheme,
        toggleTheme,
        isAuthenticated,
        authLoading,
        user,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        updateUser,
        resetToDemoData,
        clearAllData,
        wardrobe,
        isLoadingWardrobe,
        addWardrobeItem,
        updateWardrobeItem,
        deleteWardrobeItem,
        deleteMultipleWardrobeItems,
        clearWardrobe,
        resetToSampleWardrobe,
        toggleWardrobeFavorite,
        recordWearItem,
        reloadWardrobe,
        outfits,
        isLoadingOutfits,
        addOutfit,
        deleteOutfit,
        deleteMultipleOutfits,
        clearOutfits,
        toggleOutfitFavorite,
        recordWearOutfit,
        plans,
        isLoadingPlans,
        addPlan,
        deletePlan,
        togglePlanCompleted,
        toasts,
        showToast,
        dismissToast,
        isAddClothingModalOpen,
        setIsAddClothingModalOpen,
        isCreateLookModalOpen,
        setIsCreateLookModalOpen,
        isPlanModalOpen,
        setIsPlanModalOpen,
        isFirstLoginMeasurementsModalOpen,
        setIsFirstLoginMeasurementsModalOpen,
        openMeasurementsModal,
        selectedWardrobeItemForDetail,
        setSelectedWardrobeItemForDetail,
        quickOccasionForStylist,
        setQuickOccasionForStylist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
