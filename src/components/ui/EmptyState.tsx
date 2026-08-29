/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: ButtonProps['variant'];
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  badgeText?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  badgeText,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-gray-200/80 bg-white/60 max-w-lg mx-auto ${className}`}
    >
      {badgeText && (
        <span className="text-[11px] font-medium tracking-wider uppercase text-emerald-500 mb-4 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          {badgeText}
        </span>
      )}
      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold tracking-tight text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'primary'}
              size="md"
              onClick={primaryAction.onClick}
              leftIcon={primaryAction.icon}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" size="md" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
