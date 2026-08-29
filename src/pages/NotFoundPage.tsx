/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-emerald-500 mb-2">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-editorial">
        Route Not Found
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 max-w-sm">
        The sartorial coordinate you are searching for does not exist in your current digital capsule.
      </p>
      <Button
        variant="primary"
        onClick={() => navigateTo('/')}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Return to Dashboard
      </Button>
    </div>
  );
}
