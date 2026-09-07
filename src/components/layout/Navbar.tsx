/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Plus,
  CloudSun,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { NavigationRoute } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';

export function Navbar() {
  const { currentRoute, navigateTo, setIsAddClothingModalOpen, user, signOut, theme, toggleTheme } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRouteTitle = () => {
    switch (currentRoute) {
      case '/':
        return { title: 'Dashboard', subtitle: 'Overview & Daily Styling' };
      case '/wardrobe':
        return { title: 'Digital Wardrobe', subtitle: 'Manage & Organize Your Clothes' };
      case '/stylist':
        return { title: 'AI Stylist', subtitle: 'Weather & Occasion Outfit Suggestions' };
      case '/outfits':
        return { title: 'Lookbook', subtitle: 'Saved & Curated Outfits' };
      case '/planner':
        return { title: 'Style Planner', subtitle: 'Outfit Calendar & Event Scheduling' };
      case '/favorites':
        return { title: 'Favorites', subtitle: 'Saved Clothes & Signature Looks' };
      case '/profile':
        return { title: 'Personal Style Profile', subtitle: 'Measurements & Style Preferences' };
      case '/settings':
        return { title: 'Settings', subtitle: 'Preferences & Data Management' };
      case '/admin':
        return { title: 'System Console', subtitle: 'Platform Telemetry & System Status' };
      default:
        return { title: 'PN', subtitle: 'AI Wardrobe & Stylist' };
    }
  };

  const { title, subtitle } = getRouteTitle();

  const handleNavClick = (route: NavigationRoute) => {
    navigateTo(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#090D16]/95 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-2xs">
      {/* Mobile Logo & Breadcrumb / Desktop Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="lg:hidden flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('/')}>
          <BrandLogo size="sm" showWordmark={false} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-serif font-normal text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {title}
            </h1>
            {currentRoute === '/admin' && (
              <Badge variant="amber" size="sm">
                Supervisor
              </Badge>
            )}
          </div>
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 truncate font-normal mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Weather Indicator */}
        {user.location && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <CloudSun className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-[11px] tracking-tight">{user.location}</span>
          </div>
        )}

        {/* AI Stylist Fast Button */}
        <Button
          variant="gold-outline"
          size="sm"
          className="hidden sm:inline-flex"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          onClick={() => navigateTo('/stylist')}
        >
          Stylist
        </Button>

        {/* Quick Add Piece (Header CTA on mobile/tablet) */}
        <Button
          variant="primary"
          size="sm"
          className="lg:hidden"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddClothingModalOpen(true)}
        >
          Add Piece
        </Button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'Light Atelier' ? 'Midnight Luxury' : 'Light Atelier'}`}
          aria-label="Toggle Theme"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {theme === 'Midnight Luxury' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Simple Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Styling Alerts
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Real-time</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <div className="font-medium text-slate-900 dark:text-slate-100">Welcome to PN Atelier, {user.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Your personal AI wardrobe and concierge stylist is ready.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger for Sub-pages */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[53px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-2xl z-40">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleNavClick('/')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-slate-800 dark:text-slate-200 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('/wardrobe')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-slate-800 dark:text-slate-200 font-medium"
            >
              Wardrobe
            </button>
            <button
              onClick={() => handleNavClick('/stylist')}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-emerald-700 dark:text-emerald-300 font-medium"
            >
              AI Stylist
            </button>
            <button
              onClick={() => handleNavClick('/outfits')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-slate-800 dark:text-slate-200 font-medium"
            >
              Lookbook
            </button>
            <button
              onClick={() => handleNavClick('/planner')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-slate-800 dark:text-slate-200 font-medium"
            >
              Planner
            </button>
            <button
              onClick={() => handleNavClick('/favorites')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-slate-800 dark:text-slate-200 font-medium"
            >
              Favorites
            </button>
            <button
              onClick={() => handleNavClick('/profile')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-slate-800 dark:text-slate-200 font-medium"
            >
              Profile
            </button>
            <button
              onClick={() => handleNavClick('/settings')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-slate-800 dark:text-slate-200 font-medium"
            >
              Settings
            </button>
          </div>
          <button
            onClick={() => handleNavClick('/admin')}
            className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Supervisor Console ({user.role})
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              signOut();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out ({user.name})
          </button>
        </div>
      )}
    </header>
  );
}
