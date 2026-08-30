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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { NavigationRoute } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';

export function Navbar() {
  const { currentRoute, navigateTo, setIsAddClothingModalOpen, user, signOut } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRouteTitle = () => {
    switch (currentRoute) {
      case '/':
        return { title: 'Dashboard', subtitle: 'Atelier Overview & Styling Intelligence' };
      case '/wardrobe':
        return { title: 'Digital Wardrobe', subtitle: 'Catalogued Pieces & Capsule Essentials' };
      case '/stylist':
        return { title: 'AI Stylist', subtitle: 'Occasion-Driven Luxury Outfit Generator' };
      case '/outfits':
        return { title: 'Lookbook', subtitle: 'Curated Outfits & Style Compositions' };
      case '/planner':
        return { title: 'Style Planner', subtitle: 'Wardrobe Calendar & Scheduled Looks' };
      case '/favorites':
        return { title: 'Favorites', subtitle: 'Saved Garments & Signature Ensembles' };
      case '/profile':
        return { title: 'Style Profile', subtitle: 'Aesthetic DNA & Personal Fit Preferences' };
      case '/settings':
        return { title: 'Settings', subtitle: 'App Preferences & System Integration' };
      case '/admin':
        return { title: 'Supervisor Console', subtitle: 'Platform Telemetry & Audit Logs' };
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
    <header className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile Logo & Breadcrumb / Desktop Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="lg:hidden flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('/')}>
          <BrandLogo size="sm" showWordmark={false} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate tracking-tight">
              {title}
            </h1>
            {currentRoute === '/admin' && (
              <Badge variant="amber" size="sm">
                Supervisor
              </Badge>
            )}
          </div>
          <p className="hidden sm:block text-[11px] text-gray-600 truncate font-normal">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Weather Indicator */}
        {user.location && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-700">
            <CloudSun className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium">{user.location}</span>
          </div>
        )}

        {/* AI Stylist Fast Button */}
        <Button
          variant="gold-outline"
          size="sm"
          className="hidden sm:inline-flex"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
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

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Simple Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Styling Alerts
                </span>
                <span className="text-[10px] text-emerald-500 font-medium">Real-time</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-white/80 border border-gray-200 text-xs">
                  <div className="font-medium text-gray-800">Welcome to PN, {user.name}</div>
                  <div className="text-[11px] text-gray-600 mt-0.5">
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
          className="lg:hidden w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] bg-white border-b border-gray-200 p-4 space-y-3 shadow-2xl z-40">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleNavClick('/')}
              className="p-3 rounded-xl bg-white border border-gray-200 text-left text-gray-800"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('/wardrobe')}
              className="p-3 rounded-xl bg-white border border-gray-200 text-left text-gray-800"
            >
              Wardrobe
            </button>
            <button
              onClick={() => handleNavClick('/stylist')}
              className="p-3 rounded-xl bg-white border border-gray-200 text-left text-emerald-500"
            >
              AI Stylist
            </button>
            <button
              onClick={() => handleNavClick('/outfits')}
              className="p-3 rounded-xl bg-white border border-gray-200 text-left text-gray-800"
            >
              Lookbook
            </button>
            <button
              onClick={() => handleNavClick('/planner')}
              className="p-3 rounded-xl bg-white border border-gray-200 text-left text-gray-800"
            >
              Planner
            </button>
            <button
              onClick={() => handleNavClick('/favorites')}
              className="p-3 rounded-xl bg-white border border-gray-200 text-left text-gray-800"
            >
              Favorites
            </button>
            <button
              onClick={() => handleNavClick('/profile')}
              className="p-3 rounded-xl bg-white border border-gray-200 text-left text-gray-800"
            >
              Profile
            </button>
            <button
              onClick={() => handleNavClick('/settings')}
              className="p-3 rounded-xl bg-white border border-gray-200 text-left text-gray-800"
            >
              Settings
            </button>
          </div>
          <button
            onClick={() => handleNavClick('/admin')}
            className="w-full p-2.5 rounded-xl bg-emerald-50/20 border border-emerald-200/30 text-emerald-400 text-xs flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Supervisor Console ({user.role})
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              signOut();
            }}
            className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-red-400 text-xs flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out ({user.name})
          </button>
        </div>
      )}
    </header>
  );
}
