import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// 1. Register bootstrap diagnostics tracking
export interface BootDiagnostics {
  url: string;
  safeModeDetected: boolean;
  reactInitBegan: boolean;
  appImportBegan: boolean;
  appImportSucceeded: boolean;
  reactMounted: boolean;
  lastStep: string;
  error: string | null;
}

declare global {
  interface Window {
    __BOOT_DIAGNOSTICS__?: BootDiagnostics;
    showGlobalError?: (msg: string) => void;
  }
}

const diagnostics: BootDiagnostics = {
  url: typeof window !== 'undefined' ? window.location.href : '',
  safeModeDetected: false,
  reactInitBegan: true,
  appImportBegan: false,
  appImportSucceeded: false,
  reactMounted: false,
  lastStep: 'main.tsx started',
  error: null,
};
window.__BOOT_DIAGNOSTICS__ = diagnostics;

function isSafeModeRequested(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    return search.includes('safe=1') || hash.includes('safe=1');
  } catch {
    return false;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  const err = new Error('Root element #root not found in document.');
  diagnostics.error = err.message;
  diagnostics.lastStep = 'Root element missing';
  if (typeof window.showGlobalError === 'function') {
    window.showGlobalError(err.message);
  }
  throw err;
}

const root = createRoot(rootElement);

async function bootstrap() {
  const isSafe = isSafeModeRequested();
  diagnostics.safeModeDetected = isSafe;

  // SAFE MODE PATH: Import only minimal SafeModeScreen. DO NOT import App.tsx.
  if (isSafe) {
    diagnostics.lastStep = 'Booting Safe Mode';
    try {
      const { SafeModeScreen } = await import('./components/ui/SafeModeScreen');
      diagnostics.reactMounted = true;
      diagnostics.lastStep = 'Safe Mode Mounted';
      root.render(
        <StrictMode>
          <SafeModeScreen />
        </StrictMode>
      );
    } catch (safeErr: any) {
      const msg = `Safe Mode Boot Failure: ${safeErr?.message || String(safeErr)}`;
      diagnostics.error = msg;
      diagnostics.lastStep = 'Safe Mode Failed';
      if (typeof window.showGlobalError === 'function') {
        window.showGlobalError(msg);
      }
    }
    return;
  }

  // NORMAL PATH: Dynamically import App.tsx and mount the complete application
  diagnostics.appImportBegan = true;
  diagnostics.lastStep = 'Importing App.tsx';

  try {
    const appModule = await import('./App');
    const App = appModule.default;
    diagnostics.appImportSucceeded = true;
    diagnostics.lastStep = 'Rendering App';

    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    diagnostics.reactMounted = true;
    diagnostics.lastStep = 'Normal App Mounted';
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const errorStack = error?.stack || '';
    diagnostics.error = `${errorMsg}\n\nStack:\n${errorStack}`;
    diagnostics.lastStep = 'App.tsx Import/Evaluation Failed';

    console.error('[Bootstrap Error] Failed to load application module:', error);

    if (typeof window.showGlobalError === 'function') {
      window.showGlobalError(
        `Failed to import or initialize application module (App.tsx):\n\n${errorMsg}\n\nStack:\n${errorStack}`
      );
    }
  }
}

bootstrap().catch((err: any) => {
  diagnostics.error = String(err?.message || err);
  diagnostics.lastStep = 'Bootstrap Uncaught Exception';
  console.error('[Bootstrap Critical Error]', err);
  if (typeof window.showGlobalError === 'function') {
    window.showGlobalError(String(err?.message || err));
  }
});
