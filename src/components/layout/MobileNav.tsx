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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white border-t border-gray-200 rounded-t-3xl p-6 pb-8 z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                More Features
              </span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moreTabs.map(tab => {
                if (tab.supervisor && user.role !== 'supervisor' && user.role !== 'admin') {
                  return null;
                }
                const Icon = tab.icon;
                const isActive = currentRoute === tab.route;
                return (
                  <button
                    key={tab.route}
                    onClick={() => handleMoreNavigation(tab.route)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 border-emerald-500/40'
                        : tab.supervisor
                        ? 'bg-emerald-50/20 text-emerald-700 border-emerald-200/30'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${tab.supervisor ? 'text-emerald-500' : 'text-emerald-500'}`} />
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
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 py-1.5 pb-safe flex items-center justify-around"
      >
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.route;
          return (
            <button
              key={tab.route}
              onClick={() => navigateTo(tab.route)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative flex-1 ${
                isActive ? 'text-emerald-500' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${tab.highlight && isActive ? 'bg-emerald-500/15' : ''}`}>
                <Icon className={`w-5 h-5 ${tab.highlight ? 'text-emerald-500' : ''}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative flex-1 ${
            isMoreActive ? 'text-emerald-500' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="p-1 rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isMoreActive ? 'font-semibold' : 'font-medium'}`}>
            More
          </span>
          {isMoreActive && (
            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
          )}
        </button>
      </nav>
    </>
  );
}
