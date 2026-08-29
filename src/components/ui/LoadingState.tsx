/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Refining wardrobe curation...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-10 h-10 rounded-full border border-gray-200 animate-ping opacity-25" />
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500 absolute" />
      </div>
      <p className="text-xs tracking-wider uppercase text-gray-600 font-medium">{message}</p>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-50/60 rounded-xl ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <Skeleton className="w-full aspect-[4/5] rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center mt-1">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
