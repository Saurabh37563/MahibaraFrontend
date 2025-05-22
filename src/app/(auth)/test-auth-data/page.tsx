'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Helper function to decode a JWT
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return { error: 'Could not decode token' };
  }
}

export default function AuthTestPage() {
  const { data: session, status, update }:any = useSession();
  const [mounted, setMounted] = useState(false);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('session');

  useEffect(() => {
    setMounted(true);
    
    // Try to decode token if present
    if (session?.accessToken) {
      try {
        setDecodedToken(decodeJwt(session.accessToken as string));
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, [session]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Auth.js v5 Test Page</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Debugging authentication with Next-Auth 5.0
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className={`px-4 py-1 rounded-full text-sm font-medium ${
                status === 'authenticated' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                status === 'loading' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                Status: {status}
              </div>
              
              {status === 'authenticated' && (
                <button 
                  onClick={() => update()}
                  className="ml-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Refresh Session
                </button>
              )}
            </div>

            {session?.user && (
              <div className="flex items-center gap-4 p-4 mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {session.user.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'} 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{session.user.name || 'Anonymous User'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{session.user.email || 'No email'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">ID: {session.user.id || 'No ID'}</p>
                </div>
              </div>
            )}

            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('session')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'session' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Session Data
                </button>
                {decodedToken && (
                  <button
                    onClick={() => setActiveTab('token')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${
                      activeTab === 'token' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    JWT Token
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'raw' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Raw Data
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'session' && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Session Properties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires</p>
                      <p>{session?.expires ? new Date(session.expires).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Has Access Token</p>
                      <p>{session?.accessToken ? 'Yes' : 'No'}</p>
                    </div>
                    {session?.user?.id && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
                        <p className="truncate">{session.user.id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'token' && decodedToken && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Decoded JWT Token</h3>
                  <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                    <code>{JSON.stringify(decodedToken, null, 2)}</code>
                  </pre>
                </div>
              )}

              {activeTab === 'raw' && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Raw Session Data</h3>
                  <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                    <code>{JSON.stringify(session, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
          >
            Back to Home
          </Link>
          
          {status === 'authenticated' && (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200 rounded-lg transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          )}
          
          {status === 'unauthenticated' && (
            <Link
              href="/api/auth/signin"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
