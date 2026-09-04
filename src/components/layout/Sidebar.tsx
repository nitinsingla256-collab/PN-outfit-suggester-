/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  Layers,
  Calendar,
  Heart,
  User,
  Settings,
  ShieldCheck,
  Plus,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationRoute } from '../../types';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';

export function Sidebar() {
  const { currentRoute, navigateTo, setIsAddClothingModalOpen, user, wardrobe, signOut } = useApp();

  const primaryNavItems: { label: string; route: NavigationRoute; icon: React.ReactNode; badge?: number }[] = [
    { label: 'Home', route: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Wardrobe', route: '/wardrobe', icon: <Shirt className="w-4 h-4" />, badge: wardrobe.length },
    { label: 'AI Stylist', route: '/stylist', icon: <Sparkles className="w-4 h-4 text-emerald-500" /> },
    { label: 'Lookbook', route: '/outfits', icon: <Layers className="w-4 h-4" /> },
    { label: 'Planner', route: '/planner', icon: <Calendar className="w-4 h-4" /> },
  ];

  const secondaryNavItems: { label: string; route: NavigationRoute; icon: React.ReactNode }[] = [
    { label: 'Favorites', route: '/favorites', icon: <Heart className="w-4 h-4" /> },
    { label: 'Profile', route: '/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Settings', route: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-[#090D16] border-r border-slate-200/80 dark:border-slate-800/80 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <BrandLogo size="md" showWordmark={true} />
        </button>
      </div>

      {/* Quick Add CTA */}
      <div className="px-4 py-3.5">
        <Button
          variant="primary"
          size="md"
          className="w-full justify-center shadow-xs"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddClothingModalOpen(true)}
        >
          Add Clothing Piece
        </Button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        <div>
          <div className="px-3 mb-2 text-[9.5px] uppercase tracking-[0.2em] font-semibold text-slate-400 dark:text-slate-500">
            Core Atelier
          </div>
          <nav className="space-y-1">
            {primaryNavItems.map(item => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[9.5px] uppercase tracking-[0.2em] font-semibold text-slate-400 dark:text-slate-500">
            Personalization
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map(item => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Supervisor / Admin Area */}
        {(user.role === 'supervisor' || user.role === 'admin') && (
          <div>
            <div className="px-3 mb-2 text-[9.5px] uppercase tracking-[0.2em] font-semibold text-slate-400 dark:text-slate-500">
              System Control
            </div>
            <button
              onClick={() => navigateTo('/admin')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                currentRoute === '/admin'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Admin Console</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 font-mono">
                {user.role}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* User Footer Section with Logout */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between gap-2">
        <button
          onClick={() => navigateTo('/profile')}
          className="flex-1 flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left group min-w-0"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white">
              {user.name}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono capitalize">
              {user.role}
            </div>
          </div>
        </button>

        <button
          onClick={signOut}
          title="Sign Out of Atelier"
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
