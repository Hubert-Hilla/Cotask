// components/CookieNotice.tsx
'use client';

import { useState, useEffect } from 'react';

export default function CookieNotice() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookiesAccepted');
    if (!hasAccepted) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl animate-slide-up">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Cookie Notice
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  We use strictly necessary cookies to keep you logged in and ensure the security of your account. We do not use tracking, analytics, or advertising cookies. By using Cotask, you agree to our use of essential cookies.{' '}
                  <a 
                    href="#privacy" 
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline font-medium"
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 sm:flex-shrink-0">
            <button
              onClick={handleAccept}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}