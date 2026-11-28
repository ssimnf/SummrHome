'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Unexpected application error.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendly = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed?.error) {
          friendly = `${parsed.error} (${parsed.operationType || 'read'} on ${parsed.path || 'database'})`;
        }
      } catch {
        // Keep raw message if not JSON
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-700 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Something went wrong</span>
            </div>
            <p className="text-xs text-slate-600 break-words leading-relaxed">
              {friendly}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload SummrHome</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
