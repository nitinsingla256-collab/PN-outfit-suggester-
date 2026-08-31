/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gold-outline' | 'luxury-dark';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 tracking-tight';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 border border-emerald-500/40',
      'luxury-dark':
        'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white hover:from-slate-800 hover:to-slate-900 border border-slate-700/80 shadow-md',
      secondary:
        'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-200/90 shadow-2xs hover:border-slate-300',
      outline:
        'bg-transparent hover:bg-white text-slate-800 border border-slate-300 hover:border-slate-400 hover:shadow-2xs',
      'gold-outline':
        'bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 hover:border-emerald-500/60 font-semibold',
      ghost:
        'bg-transparent hover:bg-slate-100/70 text-slate-700 hover:text-slate-900',
      destructive:
        'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs h-8 px-3.5 rounded-xl gap-1.5',
      md: 'text-xs sm:text-sm h-10 px-4.5 rounded-xl gap-2',
      lg: 'text-sm sm:text-base h-12 px-6 rounded-2xl gap-2.5 font-semibold',
      icon: 'h-9 w-9 p-0 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
