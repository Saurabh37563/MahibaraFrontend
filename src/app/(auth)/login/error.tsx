'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  useEffect(() => {
    console.error('Authentication error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-red-600">
          Authentication Error
        </h1>
        <p className="text-center">
          {error === 'Configuration'
            ? 'There was an issue with the authentication configuration. Please contact support.'
            : `Error: ${error || 'Unknown error'}`}
        </p>
        <div className="flex justify-center">
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
