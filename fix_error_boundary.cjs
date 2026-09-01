const fs = require('fs');

const code = `import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  pageName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught error in page:", this.props.pageName || "Unknown", error, errorInfo);
  }

  public handleRetry = () => {
    const isChunkLoadError = this.state.error?.message?.toLowerCase().includes('failed to fetch dynamically imported module') || 
                             this.state.error?.message?.toLowerCase().includes('importing a module script failed');
                             
    if (isChunkLoadError) {
      window.location.href = window.location.pathname + "?t=" + Date.now();
      return;
    }

    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 text-center shadow-lg max-w-xl mx-auto my-8 space-y-5 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-editorial">
              {this.props.fallbackTitle || \`\${this.props.pageName || 'View'} Rendering Issue\`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {this.props.fallbackMessage ||
                "A temporary rendering glitch occurred on this view. Your wardrobe catalog, saved outfits, and account data remain completely safe."}
            </p>
          </div>

          {/* Collapsible Error Diagnostics */}
          {this.state.error && (
            <div className="text-left bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-semibold cursor-pointer" onClick={() => this.setState({ showDetails: !this.state.showDetails })}>
                <span>Diagnostic Info: {this.state.error.message || 'Unknown Error'}</span>
                <button type="button" className="text-slate-500 hover:text-slate-800">
                  {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {this.state.showDetails && (
                <pre className="text-[10px] text-slate-600 font-mono overflow-x-auto p-2 bg-white rounded-xl border border-slate-200 max-h-40 whitespace-pre-wrap">
                  {this.state.error.stack || this.state.errorInfo?.componentStack || 'No additional stack trace available'}
                </pre>
              )}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={this.handleRetry}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              className="rounded-xl px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (window.history && typeof window.history.pushState === 'function') {
                  window.history.pushState({}, '', '/');
                }
                window.location.href = '/';
              }}
              leftIcon={<Home className="w-4 h-4" />}
              className="rounded-xl px-5 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
`;

fs.writeFileSync('src/components/ui/ErrorBoundary.tsx', code);
console.log('Fixed ErrorBoundary');
