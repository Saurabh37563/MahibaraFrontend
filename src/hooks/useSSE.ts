import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSSEOptions {
  enabled?: boolean;
  token?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface SSEHook {
  isConnected: boolean;
  error: Error | null;
  addEventListener: (eventType: string, handler: (event: MessageEvent) => void) => () => void;
  disconnect: () => void;
}

export const useSSE = (url: string, options: UseSSEOptions = {}): SSEHook => {
  const {
    enabled = true,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const listenersRef = useRef<Map<string, Set<(event: MessageEvent) => void>>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDisconnectedRef = useRef(false);

  const disconnect = useCallback(() => {
    console.log('[SSE] Manually disconnecting');
    isDisconnectedRef.current = true;
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
    setError(null);
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !url || isDisconnectedRef.current) {
      console.log('[SSE] Not connecting:', { enabled, url, isDisconnected: isDisconnectedRef.current });
      return;
    }

    // Prevent multiple connections
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      console.log('[SSE] Connection already exists, skipping');
      return;
    }

    try {
      console.log('[SSE] Creating new connection to:', url);
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[SSE] Connected successfully');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onerror = (event) => {
        console.error('[SSE] Connection error:', event);
        setIsConnected(false);
        
        // Don't reconnect if manually disconnected
        if (isDisconnectedRef.current) {
          console.log('[SSE] Manually disconnected, not reconnecting');
          return;
        }
        
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`[SSE] Attempting reconnect ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
            connect();
          }, reconnectInterval);
        } else {
          setError(new Error('Failed to connect to real-time updates'));
        }
      };

      eventSource.onmessage = (event) => {
        console.log('[SSE] Generic message received:', event.data);
        const genericListeners = listenersRef.current.get('message') || new Set();
        genericListeners.forEach(handler => handler(event));
      };

      // Setup custom event listeners for events that were registered before connection
      listenersRef.current.forEach((handlers, eventType) => {
        if (eventType !== 'message') {
          eventSource.addEventListener(eventType, (event) => {
            console.log(`[SSE] Custom event received (${eventType}):`, event.data);
            handlers.forEach(handler => handler(event as MessageEvent));
          });
        }
      });

    } catch (err) {
      console.error('[SSE] Failed to create connection:', err);
      setError(err instanceof Error ? err : new Error('Unknown SSE error'));
    }
  }, [enabled, url, autoReconnect, maxReconnectAttempts, reconnectInterval]);

  const addEventListener = useCallback((eventType: string, handler: (event: MessageEvent) => void) => {
    console.log(`[SSE] Adding event listener for: ${eventType}`);
    
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(handler);

    // If already connected, add listener to existing EventSource
    if (eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN) {
      if (eventType !== 'message') {
        eventSourceRef.current.addEventListener(eventType, handler as EventListener);
      }
    }

    // Return cleanup function
    return () => {
      const listeners = listenersRef.current.get(eventType);
      if (listeners) {
        listeners.delete(handler);
        if (listeners.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }
      if (eventSourceRef.current && eventType !== 'message') {
        eventSourceRef.current.removeEventListener(eventType, handler as EventListener);
      }
    };
  }, []);

  useEffect(() => {
    if (enabled && url) {
      isDisconnectedRef.current = false;
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, url, connect, disconnect]); // Remove connect and disconnect from dependencies to prevent loops

  return {
    isConnected,
    error,
    addEventListener,
    disconnect,
  };
};
