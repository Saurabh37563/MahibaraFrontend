
import { useEffect, useState, useRef, useCallback } from 'react';
import { SSEClient, SSEClientOptions, SSEEvent } from '@/lib/sse-client';

interface UseSSEOptions extends Omit<SSEClientOptions, 'url'> {
  enabled?: boolean;
}

/**
 * React hook for handling SSE connections in components
 * 
 * @param url The SSE endpoint URL
 * @param options Configuration options for the SSE client
 */
export function useSSE<T extends SSEEvent['type'] | '*' = '*'>(
  url: string,
  options: UseSSEOptions = {}
) {
  const {
    enabled = true,
    token,
    ...restOptions
  } = options;
  
  // Use refs to avoid unnecessary re-renders
  const clientRef = useRef<SSEClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastEvent, setLastEvent] = useState<T extends '*' ? SSEEvent | null : Extract<SSEEvent, { type: T }> | null>(null);
  
  // Create or update the client when options change
  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new SSEClient({
        url,
        token,
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onError: (err) => setError(err),
        ...restOptions,
      });
    } else {
      clientRef.current.updateOptions({ url, token, ...restOptions });
    }
    
    // Connect if enabled
    if (enabled) {
      clientRef.current.connect();
    }
    
    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [url, token, enabled]);

  // Listen for events
  const addEventListener = useCallback(<E extends SSEEvent['type'] | '*'>(
    eventType: E,
    handler: (event: E extends '*' ? SSEEvent : Extract<SSEEvent, { type: E }>) => void
  ) => {
    if (!clientRef.current) return () => {};
    return clientRef.current.on(eventType, handler);
  }, []);

  // Subscribe to events of type T or all events
  useEffect(() => {
    if (!clientRef.current) return;
    
    const unsubscribe = clientRef.current.on(
      (T as string), 
      (event) => {
        setLastEvent(event as any);
      }
    );
    
    return unsubscribe;
  }, []);

  // Expose API for manual control
  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);
  
  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);
  
  return {
    isConnected,
    lastEvent,
    error,
    addEventListener,
    connect,
    disconnect,
  };
}