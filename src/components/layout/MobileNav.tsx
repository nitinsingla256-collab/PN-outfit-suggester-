/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  Layers,
  Calendar,
  MoreHorizontal,
  Heart,
  User,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationRoute } from '../../types';

export function MobileNav() {
  const { currentRoute, navigateTo, user } = useApp();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { label: 'Home', route: '/' as NavigationRoute, icon: LayoutDashboard },
    { label: 'Wardrobe', route: '/wardrobe' as NavigationRoute, icon: Shirt },
    { label: 'Stylist', route: '/stylist' as NavigationRoute, icon: Sparkles, highlight: true },
    { label: 'Outfits', route: '/outfits' as NavigationRoute, icon: Layers },
    { label: 'Plan', route: '/planner' as NavigationRoute, icon: Calendar },
  ];

  const moreTabs = [
    { label: 'Favorites', route: '/favorites' as NavigationRoute, icon: Heart },
    { label: 'Profile', route: '/profile' as NavigationRoute, icon: User },
    { label: 'Settings', route: '/settings' as NavigationRoute, icon: Settings },
    { label: 'Supervisor', route: '/admin' as NavigationRoute, icon: ShieldCheck, supervisor: true },
  ];

  const handleMoreNavigation = (route: NavigationRoute) => {
    navigateTo(route);
    setIsMoreMenuOpen(false);
  };

  const isMoreActive = ['/favorites', '/profile', '/settings', '/admin'].includes(currentRoute);

  return (
    <>
      {/* More Options Modal Bottom Sheet */}
      {isMoreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-slate-950/70 transition-opacity"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-2xl p-5 pb-8 z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Atelier Directory
              </span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {moreTabs.map(tab => {
                if (tab.supervisor && user.role !== 'supervisor' && user.role !== 'admin') {
                  return null;
                }
                const Icon = tab.icon;
                const isActive = currentRoute === tab.route;
                return (
                  <button
                    key={tab.route}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMoreNavigation(tab.route);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-emerald-500/40 shadow-2xs'
                        : tab.supervisor
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#090D16]/95 border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 pb-safe flex items-center justify-around shadow-2xs"
      >
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.route;
          return (
            <button
              key={tab.route}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigateTo(tab.route);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors relative flex-1 ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className={`p-1 rounded-lg ${tab.highlight && isActive ? 'bg-emerald-50 dark:bg-emerald-950/50' : ''}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </button>
          );
        })}

        {/* More Tab */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsMoreMenuOpen(true);
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors relative flex-1 ${
            isMoreActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="p-1 rounded-lg">
            <MoreHorizontal className="w-4.5 h-4.5" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isMoreActive ? 'font-semibold' : 'font-normal'}`}>
            More
          </span>
          {isMoreActive && (
            <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          )}
        </button>
      </nav>
    </>
  );
}
