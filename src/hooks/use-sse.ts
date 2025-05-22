import { useEffect, useState, useRef, useCallback } from "react";
import {
  SSEClient,
  SSEClientOptions,
  SSEEvent,
  SSEEventType,
} from "@/lib/sse-client";

type UseSSEOptions = Omit<SSEClientOptions, "url"> & {
  enabled?: boolean;
};

type EventTypeMap<T extends SSEEventType | "*"> = T extends "*"
  ? SSEEvent
  : Extract<SSEEvent, { type: T }>;

export function useSSE<T extends SSEEventType | "*" = "*">(
  url: string,
  options: UseSSEOptions = {},
) {
  const { enabled = true, token, ...restOptions } = options;
  const clientRef = useRef<SSEClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastEvent, setLastEvent] = useState<EventTypeMap<T> | null>(null);

  const initializeClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new SSEClient({
        url,
        token,
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onError: setError,
        ...restOptions,
      });
    } else {
      clientRef.current.updateOptions({ url, token, ...restOptions });
    }
  }, [url, token, restOptions]);

  useEffect(() => {
    initializeClient();

    if (enabled) {
      clientRef.current?.connect();
    }

    return () => {
      clientRef.current?.disconnect();
      clientRef.current = null;
    };
  }, [enabled, initializeClient]);

  const addEventListener = useCallback(
    <E extends SSEEventType | "*">(
      eventType: E,
      handler: (event: EventTypeMap<E>) => void,
    ): (() => void) => {
      if (!clientRef.current) {
        initializeClient();
      }
      return (
        clientRef.current?.on(
          eventType,
          handler as (event: SSEEvent) => void,
        ) ?? (() => undefined)
      );
    },
    [initializeClient],
  );

  useEffect(() => {
    if (!clientRef.current) {
      initializeClient();
    }

    // Fixed: Use a const assertion for the event type
    const eventType = "*" as const;
    return clientRef.current?.on(eventType, (event) =>
      setLastEvent(event as EventTypeMap<T>),
    );
  }, [initializeClient]);

  return {
    isConnected,
    lastEvent,
    error,
    addEventListener,
    connect: useCallback(() => clientRef.current?.connect(), []),
    disconnect: useCallback(() => clientRef.current?.disconnect(), []),
  } as const;
}
