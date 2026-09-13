import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkKeyNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Clerk is not configured</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add <code className="rounded bg-slate-100 px-1 py-0.5">VITE_CLERK_PUBLISHABLE_KEY</code> to{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">client/.env</code> (see{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">.env.example</code> and the README) and restart the dev server.
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/onboarding">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <MissingClerkKeyNotice />
    )}
  </React.StrictMode>
);
