"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { SSEClient, SSEEvent, SSEEventType } from "@/lib/sse-client";

type FileStatus = Extract<SSEEvent, { type: "file_status" }>["data"];
type AnalysisStatus = Extract<SSEEvent, { type: "analysis_status" }>["data"];

interface SSEContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  fileStatuses: Record<string, FileStatus>;
  analysisStatuses: Record<string, AnalysisStatus>;
  connect: () => void;
  disconnect: () => void;
  addEventListener: <T extends SSEEventType | "*">(
    eventType: T,
    listener: (
      event: T extends "*" ? SSEEvent : Extract<SSEEvent, { type: T }>,
    ) => void,
  ) => () => void;
}

const SSEContext = createContext<SSEContextValue | null>(null);

interface SSEProviderProps {
  children: React.ReactNode;
  endpoint: string;
  token?: string;
  autoConnect?: boolean;
}

export function SSEProvider({
  children,
  endpoint,
  token,
  autoConnect = true,
}: SSEProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>(
    {},
  );
  const [analysisStatuses, setAnalysisStatuses] = useState<
    Record<string, AnalysisStatus>
  >({});

  const sseClient = useMemo(
    () =>
      new SSEClient({
        url: endpoint,
        token,
        autoReconnect: true,
        logLevel: process.env.NODE_ENV === "production" ? "error" : "info",
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
      }),
    [endpoint, token],
  );

  useEffect(() => {
    if (autoConnect) {
      setIsConnecting(true);
      sseClient.connect();
    }

    const unsubscribeFileStatus = sseClient.on("file_status", (event) => {
      setFileStatuses((prev) => ({ ...prev, [event.data.fileId]: event.data }));
    });

    const unsubscribeAnalysisStatus = sseClient.on(
      "analysis_status",
      (event) => {
        setAnalysisStatuses((prev) => ({
          ...prev,
          [event.data.analysisId]: event.data,
        }));
      },
    );

    return () => {
      unsubscribeFileStatus();
      unsubscribeAnalysisStatus();
      sseClient.disconnect();
    };
  }, [autoConnect, sseClient]);

  const contextValue = useMemo<SSEContextValue>(
    () => ({
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
      addEventListener: (eventType, listener) =>
        sseClient.on(eventType, listener),
    }),
    [
      isConnected,
      isConnecting,
      error,
      fileStatuses,
      analysisStatuses,
      sseClient,
    ],
  );

  return (
    <SSEContext.Provider value={contextValue}>{children}</SSEContext.Provider>
  );
}

export const useSSEContext = () => {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error("useSSEContext must be used within an SSEProvider");
  }
  return context;
};
