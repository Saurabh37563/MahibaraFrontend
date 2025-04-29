
/**
 * SSE Context Provider
 * Provides an application-wide SSE client instance
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { SSEClient, SSEEvent, FileStatusEvent, AnalysisStatusEvent } from '@/lib/sse-client';

interface SSEContextValue {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  
  // File status tracking
  fileStatuses: Record<string, FileStatusEvent['data']>;
  
  // Analysis status tracking
  analysisStatuses: Record<string, AnalysisStatusEvent['data']>;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  
  // Advanced listeners
  addEventListener: <T extends SSEEvent['type'] | '*'>(
    eventType: T, 
    listener: (event: T extends '*' ? SSEEvent : Extract<SSEEvent, { type: T }>) => void
  ) => () => void;
}

interface SSEProviderProps {
  children: React.ReactNode;
  endpoint: string;
  token?: string;
  autoConnect?: boolean;
}

// Create context with default values
const SSEContext = createContext<SSEContextValue | null>(null);

export function SSEProvider({
  children,
  endpoint,
  token,
  autoConnect = true,
}: SSEProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatusEvent['data']>>({});
  const [analysisStatuses, setAnalysisStatuses] = useState<Record<string, AnalysisStatusEvent['data']>>({});
  
  // Create SSE client
  const sseClient = useMemo(() => new SSEClient({
    url: endpoint,
    token,
    autoReconnect: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'info',
    onConnect: () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    },
    onDisconnect: () => {
      setIsConnected(false);
      setIsConnecting(false);
    },
    onError: (err) => {
      setError(err);
      setIsConnecting(false);
    },
  }), [endpoint, token]);
  
  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      setIsConnecting(true);
      sseClient.connect();
    }
    
    // Register event listeners
    const unsubscribeFileStatus = sseClient.on('file_status', (event) => {
      setFileStatuses(prev => ({
        ...prev,
        [event.data.fileId]: event.data
      }));
    });
    
    const unsubscribeAnalysisStatus = sseClient.on('analysis_status', (event) => {
      setAnalysisStatuses(prev => ({
        ...prev,
        [event.data.analysisId]: event.data
      }));
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribeFileStatus();
      unsubscribeAnalysisStatus();
      sseClient.disconnect();
    };
  }, [sseClient, autoConnect]);
  
  // Context value
  const value: SSEContextValue = {
    isConnected,
    isConnecting,
    error,
    fileStatuses,
    analysisStatuses,
    connect: () => {
      setIsConnecting(true);
      sseClient.connect();
    },
    disconnect: () => sseClient.disconnect(),
    addEventListener: (eventType, listener) => sseClient.on(eventType, listener),
  };
  
  return (
    <SSEContext.Provider value={value}>
      {children}
    </SSEContext.Provider>
  );
}

// Hook to use the SSE context
export function useSSEContext() {
  const context = useContext(SSEContext);
  
  if (!context) {
    throw new Error('useSSEContext must be used within an SSEProvider');
  }
  
  return context;
}