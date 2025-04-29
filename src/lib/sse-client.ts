/**
 * SSE Client Utility
 * A robust implementation for handling Server-Sent Events in production applications
 */

import { z } from 'zod';

// Define event types with Zod schemas for runtime validation
export const BaseEventSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
  timestamp: z.number().default(() => Date.now()),
});

export const FileStatusEventSchema = BaseEventSchema.extend({
  type: z.literal('file_status'),
  data: z.object({
    fileId: z.string(),
    status: z.enum(['queued', 'processing', 'completed', 'failed', 'validated']),
    progress: z.number().min(0).max(100).optional(),
    message: z.string().optional(),
    errorDetails: z.string().optional(),
  }),
});

export const AnalysisStatusEventSchema = BaseEventSchema.extend({
  type: z.literal('analysis_status'),
  data: z.object({
    analysisId: z.string(),
    status: z.enum(['queued', 'running', 'completed', 'failed']),
    progress: z.number().min(0).max(100).optional(),
    result: z.record(z.unknown()).optional(),
    message: z.string().optional(),
    errorDetails: z.string().optional(),
  }),
});

export const SystemNotificationSchema = BaseEventSchema.extend({
  type: z.literal('system_notification'),
  data: z.object({
    level: z.enum(['info', 'warning', 'error']),
    message: z.string(),
    autoClose: z.boolean().optional(),
  }),
});

// Union of all possible event types
export const SSEEventSchema = z.discriminatedUnion('type', [
  FileStatusEventSchema,
  AnalysisStatusEventSchema,
  SystemNotificationSchema,
]);

// Type inference from Zod schemas
export type BaseEvent = z.infer<typeof BaseEventSchema>;
export type FileStatusEvent = z.infer<typeof FileStatusEventSchema>;
export type AnalysisStatusEvent = z.infer<typeof AnalysisStatusEventSchema>;
export type SystemNotification = z.infer<typeof SystemNotificationSchema>;
export type SSEEvent = z.infer<typeof SSEEventSchema>;

// Configuration options for SSE client
export interface SSEClientOptions {
  // URL for the SSE endpoint
  url: string;
  
  // Authentication token (if required)
  token?: string;
  
  // Should attempt auto-reconnection on disconnect
  autoReconnect?: boolean;
  
  // Time in ms to wait before reconnecting
  reconnectInterval?: number;
  
  // Maximum number of reconnection attempts
  maxReconnectAttempts?: number;
  
  // Timeout in ms before considering a connection attempt failed
  connectionTimeout?: number;
  
  // Whether to include credentials in the request
  withCredentials?: boolean;
  
  // Custom headers to include with the request
  headers?: Record<string, string>;
  
  // Event handlers
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  
  // Log level for debugging
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug';
}

/**
 * SSEClient class for handling Server-Sent Events with robust error handling,
 * reconnection logic, and typed event parsing.
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private options: Required<SSEClientOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private eventListeners: Map<string, Set<(event: SSEEvent) => void>> = new Map();
  private isConnecting = false;
  private forceDisconnected = false;

  // Default configuration options
  private static readonly DEFAULT_OPTIONS: Omit<Required<SSEClientOptions>, 'url'> = {
    token: '',
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    connectionTimeout: 15000,
    withCredentials: false,
    headers: {},
    onConnect: () => {},
    onDisconnect: () => {},
    onError: () => {},
    logLevel: 'error',
  };

  /**
   * Create a new SSEClient
   * @param options Configuration options for the SSE client
   */
  constructor(options: SSEClientOptions) {
    this.options = {
      ...SSEClient.DEFAULT_OPTIONS,
      ...options,
    } as Required<SSEClientOptions>;
    
    // Initialize event listener collections for each event type
    this.eventListeners.set('file_status', new Set());
    this.eventListeners.set('analysis_status', new Set());
    this.eventListeners.set('system_notification', new Set());
    this.eventListeners.set('*', new Set());
  }

  /**
   * Log messages based on configured log level
   */
  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string, ...data: any[]): void {
    const logLevels = { debug: 4, info: 3, warn: 2, error: 1, none: 0 };
    const configLevel = logLevels[this.options.logLevel];
    const messageLevel = logLevels[level];
    
    if (messageLevel <= configLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[SSEClient ${timestamp}]`;
      
      switch (level) {
        case 'error':
          console.error(prefix, message, ...data);
          break;
        case 'warn':
          console.warn(prefix, message, ...data);
          break;
        case 'info':
          console.info(prefix, message, ...data);
          break;
        case 'debug':
          console.debug(prefix, message, ...data);
          break;
      }
    }
  }

  /**
   * Parse and validate SSE data
   */
  private parseEvent(eventData: string): SSEEvent | null {
    try {
      const data = JSON.parse(eventData);
      const result = SSEEventSchema.safeParse(data);
      
      if (!result.success) {
        this.log('warn', 'Invalid event format received:', eventData, result.error);
        return null;
      }
      
      return result.data;
    } catch (error) {
      this.log('error', 'Failed to parse event data:', error);
      return null;
    }
  }

  /**
   * Build the SSE endpoint URL with authentication if needed
   */
  private buildUrl(): string {
    const url = new URL(this.options.url, window.location.origin);
    
    // Add token as a query parameter if provided
    if (this.options.token) {
      url.searchParams.append('token', this.options.token);
    }
    
    // Add a cache-busting parameter to prevent browsers from caching the response
    url.searchParams.append('_', Date.now().toString());
    
    return url.toString();
  }

  /**
   * Connect to the SSE endpoint
   */
  public connect(): void {
    if (this.eventSource || this.isConnecting) {
      this.log('warn', 'Connection already established or in progress');
      return;
    }
    
    this.isConnecting = true;
    this.forceDisconnected = false;
    
    // Set a timeout for connection
    this.connectionTimeoutTimer = setTimeout(() => {
      if (this.isConnecting) {
        this.log('error', 'Connection timeout');
        this.disconnect();
        
        if (this.options.autoReconnect) {
          this.scheduleReconnect();
        }
      }
    }, this.options.connectionTimeout);
    
    try {
      const url = this.buildUrl();
      this.log('info', 'Connecting to SSE endpoint:', url);
      
      this.eventSource = new EventSource(url, {
        withCredentials: this.options.withCredentials,
      });
      
      // Handle connection opening
      this.eventSource.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        if (this.connectionTimeoutTimer) {
          clearTimeout(this.connectionTimeoutTimer);
          this.connectionTimeoutTimer = null;
        }
        
        this.log('info', 'SSE connection established');
        this.options.onConnect();
      };
      
      // Handle message events
      this.eventSource.onmessage = (event) => {
        this.log('debug', 'SSE message received:', event.data);
        
        const parsedEvent = this.parseEvent(event.data);
        if (parsedEvent) {
          this.dispatchEvent(parsedEvent);
        }
      };
      
      // Handle connection errors
      this.eventSource.onerror = (error) => {
        this.log('error', 'SSE connection error:', error);
        
        // Handle connection error
        if (this.eventSource) {
          this.disconnect('error');
          
          if (this.options.autoReconnect && !this.forceDisconnected) {
            this.scheduleReconnect();
          }
        }
        
        const errorObj = new Error('SSE connection error');
        this.options.onError(errorObj);
      };
    } catch (error) {
      this.isConnecting = false;
      this.log('error', 'Failed to create SSE connection:', error);
      
      if (this.connectionTimeoutTimer) {
        clearTimeout(this.connectionTimeoutTimer);
        this.connectionTimeoutTimer = null;
      }
      
      if (this.options.autoReconnect && !this.forceDisconnected) {
        this.scheduleReconnect();
      }
      
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.options.onError(errorObj);
    }
  }

  /**
   * Disconnect from the SSE endpoint
   */
  public disconnect(reason: string = 'manual'): void {
    if (reason === 'manual') {
      this.forceDisconnected = true;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
    
    if (this.eventSource) {
      try {
        this.eventSource.close();
        this.log('info', `SSE connection closed: ${reason}`);
      } catch (error) {
        this.log('error', 'Error closing SSE connection:', error);
      }
      
      this.eventSource = null;
      this.isConnecting = false;
      this.options.onDisconnect(reason);
    }
  }

  /**
   * Schedule reconnection attempt with backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log('warn', `Maximum reconnection attempts reached (${this.options.maxReconnectAttempts})`);
      return;
    }
    
    this.reconnectAttempts += 1;
    const delay = this.options.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);
    
    this.log('info', `Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
      this.reconnectTimer = null;
    }, delay);
  }

  /**
   * Dispatch event to all registered listeners for its type and to wildcard listeners
   */
  private dispatchEvent(event: SSEEvent): void {
    // Get listeners for this specific event type
    const typeListeners = this.eventListeners.get(event.type);
    
    // Get wildcard listeners
    const wildcardListeners = this.eventListeners.get('*');
    
    // Call all specific type listeners
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          this.log('error', `Error in event listener for "${event.type}":`, error);
        }
      });
    }
    
    // Call all wildcard listeners
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          this.log('error', 'Error in wildcard event listener:', error);
        }
      });
    }
  }

  /**
   * Add event listener for a specific event type or all events
   */
  public on<T extends SSEEvent['type'] | '*'>(
    eventType: T, 
    listener: (event: T extends '*' ? SSEEvent : Extract<SSEEvent, { type: T }>) => void
  ): () => void {
    // Get or create the set of listeners for this event type
    let listeners = this.eventListeners.get(eventType);
    if (!listeners) {
      listeners = new Set();
      this.eventListeners.set(eventType, listeners);
    }
    
    // Add the listener to the set
    listeners.add(listener as any);
    
    // Return a function to remove this listener
    return () => {
      this.off(eventType, listener as any);
    };
  }

  /**
   * Remove event listener
   */
  public off<T extends SSEEvent['type'] | '*'>(
    eventType: T, 
    listener: (event: T extends '*' ? SSEEvent : Extract<SSEEvent, { type: T }>) => void
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener as any);
    }
  }

  /**
   * Remove all event listeners
   */
  public removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.eventListeners.set(eventType, new Set());
    } else {
      this.eventListeners.forEach((_, key) => {
        this.eventListeners.set(key, new Set());
      });
    }
  }

  /**
   * Update client options
   */
  public updateOptions(options: Partial<SSEClientOptions>): void {
    const reconnectChanged = options.autoReconnect !== undefined && 
                             options.autoReconnect !== this.options.autoReconnect;
    
    this.options = {
      ...this.options,
      ...options,
    };
    
    // If autoReconnect was enabled and we're not connected, attempt to connect
    if (reconnectChanged && this.options.autoReconnect && !this.eventSource && !this.isConnecting) {
      this.connect();
    }
  }
}