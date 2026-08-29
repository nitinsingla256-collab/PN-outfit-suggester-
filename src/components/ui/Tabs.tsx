/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
}: TabsProps) {
  if (variant === 'underline') {
    return (
      <div className={`flex items-center border-b border-gray-200 gap-6 overflow-x-auto no-scrollbar ${className}`}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap flex items-center gap-2 ${
                isActive ? 'text-emerald-500' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(226,199,153,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center p-1 bg-white border border-gray-200/90 rounded-xl gap-1 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              isActive
                ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-300/60 font-semibold'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
            }`}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
