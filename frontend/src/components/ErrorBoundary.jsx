import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('AmarSheba render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="container-shell grid min-h-[60vh] place-items-center py-12">
          <div className="max-w-xl rounded-md border border-red-200 bg-white p-6 text-center shadow-soft dark:border-red-500/30 dark:bg-slate-900">
            <p className="text-sm font-bold uppercase text-red-600 dark:text-red-200">Something went wrong</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">AmarSheba could not load this page.</h1>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
              Please refresh the page or return home. দয়া করে পেজটি রিফ্রেশ করুন অথবা হোমে ফিরে যান।
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="focus-ring h-11 rounded-md bg-sheba-600 px-4 text-sm font-bold text-white"
              >
                Refresh
              </button>
              <a
                href="/"
                className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100"
              >
                Go Home
              </a>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
