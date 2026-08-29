/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gold-outline';
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
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      secondary: 'bg-white hover:bg-gray-100 active:bg-gray-50 text-gray-900 border border-gray-200/90 hover:border-gray-300',
      outline: 'bg-transparent hover:bg-white active:bg-gray-50 text-gray-800 border border-gray-300/80 hover:border-zinc-500',
      'gold-outline': 'bg-transparent hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/40 hover:border-emerald-500',
      ghost: 'bg-transparent hover:bg-gray-50 text-gray-700 hover:text-gray-900',
      destructive: 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs h-8 px-3 rounded-lg gap-1.5',
      md: 'text-sm h-10 px-4 rounded-xl gap-2',
      lg: 'text-base h-12 px-6 rounded-xl gap-2.5 font-medium',
      icon: 'h-9 w-9 p-0 rounded-lg',
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
