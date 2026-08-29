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
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-gray-200/60">
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <BrandLogo size="md" showWordmark={true} />
        </button>
      </div>

      {/* Quick Add CTA */}
      <div className="px-4 py-4">
        <Button
          variant="primary"
          size="md"
          className="w-full justify-center shadow-[0_2px_12px_rgba(212,175,55,0.15)]"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddClothingModalOpen(true)}
        >
          Add Clothing Piece
        </Button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
            Core Atelier
          </div>
          <nav className="space-y-1">
            {primaryNavItems.map(item => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gray-100/80 text-gray-900 border border-gray-300/60 font-semibold shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-emerald-500' : 'text-gray-600'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : 'bg-gray-50 text-gray-600'
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
          <div className="px-3 mb-2 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
            Personalization
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map(item => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gray-100/80 text-gray-900 border border-gray-300/60 font-semibold shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-500' : 'text-gray-600'}>
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
            <div className="px-3 mb-2 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              System Control
            </div>
            <button
              onClick={() => navigateTo('/admin')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                currentRoute === '/admin'
                  ? 'bg-emerald-50/30 text-emerald-700 border border-emerald-200/40 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
                <span>Admin Console</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200 font-mono">
                {user.role}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* User Footer Section with Logout */}
      <div className="p-3 border-t border-gray-200/80 bg-gray-50 flex items-center justify-between gap-2">
        <button
          onClick={() => navigateTo('/profile')}
          className="flex-1 flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50/60 transition-colors text-left group min-w-0"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-emerald-500/30 flex items-center justify-center text-xs font-semibold text-emerald-500 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800 truncate group-hover:text-gray-900">
              {user.name}
            </div>
            <div className="text-[10px] text-gray-500 truncate font-mono">
              {user.role}
            </div>
          </div>
        </button>

        <button
          onClick={signOut}
          title="Sign Out of Atelier"
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
