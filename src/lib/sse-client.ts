import { z } from "zod";

// Event schemas
const BaseEventSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
  timestamp: z.number().default(() => Date.now()),
});

const FileStatusEventSchema = BaseEventSchema.extend({
  type: z.literal("file_status"),
  data: z.object({
    fileId: z.string(),
    status: z.enum([
      "pending",
      "processing",
      "completed",
      "failed",
      "validated",
    ]),
    progress: z.number().min(0).max(100).optional(),
    message: z.string().optional(),
    errorDetails: z.string().optional(),
  }),
});

const AnalysisStatusEventSchema = BaseEventSchema.extend({
  type: z.literal("analysis_status"),
  data: z.object({
    analysisId: z.string(),
    status: z.enum(["queued", "running", "completed", "failed"]),
    progress: z.number().min(0).max(100).optional(),
    result: z.record(z.unknown()).optional(),
    message: z.string().optional(),
    errorDetails: z.string().optional(),
  }),
});

const SystemNotificationSchema = BaseEventSchema.extend({
  type: z.literal("system_notification"),
  data: z.object({
    level: z.enum(["info", "warning", "error"]),
    message: z.string(),
    autoClose: z.boolean().optional(),
  }),
});

const SSEEventSchema = z.discriminatedUnion("type", [
  FileStatusEventSchema,
  AnalysisStatusEventSchema,
  SystemNotificationSchema,
]);

export type SSEEvent = z.infer<typeof SSEEventSchema>;
export type SSEEventType = SSEEvent["type"];
export type FileStatusEvent = z.infer<typeof FileStatusEventSchema>;
export type AnalysisStatusEvent = z.infer<typeof AnalysisStatusEventSchema>;
export type SystemNotification = z.infer<typeof SystemNotificationSchema>;

export interface SSEClientOptions {
  url: string;
  token?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  connectionTimeout?: number;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  logLevel?: "none" | "error" | "warn" | "info" | "debug";
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private options: Required<SSEClientOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private eventListeners: Map<string, Set<(event: SSEEvent) => void>> =
    new Map();
  private isConnecting = false;
  private forceDisconnected = false;

  private static readonly DEFAULT_OPTIONS: Omit<
    Required<SSEClientOptions>,
    "url"
  > = {
    token: "",
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    connectionTimeout: 15000,
    withCredentials: false,
    headers: {},
    onConnect: () => undefined,
    onDisconnect: () => undefined,
    onError: () => undefined,
    logLevel: "error",
  };

  constructor(options: SSEClientOptions) {
    this.options = {
      ...SSEClient.DEFAULT_OPTIONS,
      ...options,
    } as Required<SSEClientOptions>;

    ["file_status", "analysis_status", "system_notification", "*"].forEach(
      (type) => {
        this.eventListeners.set(type, new Set());
      },
    );
  }

  private buildUrl(): string {
    try {
      const baseUrl = new URL(this.options.url, window.location.origin);

      const hardcodedParam = "1747911898074"; // 👈 Hardcoded path param

      const path = baseUrl.pathname.endsWith("/")
        ? `${baseUrl.pathname}${hardcodedParam}`
        : `${baseUrl.pathname}/${hardcodedParam}`;

      baseUrl.pathname = path;

      const token = "test-token"; // 👈 Hardcoded token
      baseUrl.searchParams.append("token", token);
      baseUrl.searchParams.append("timestamp", token);

      return baseUrl.toString();
    } catch (error) {
      this.log("error", "Failed to build URL:", error);
      throw error;
    }
  }

  private log(
    level: "error" | "warn" | "info" | "debug",
    message: string,
    ...data: unknown[]
  ): void {
    const logLevels = { debug: 4, info: 3, warn: 2, error: 1, none: 0 };
    const configLevel = logLevels[this.options.logLevel];
    const messageLevel = logLevels[level];

    if (messageLevel <= configLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[SSEClient ${timestamp}]`;
      console[level](prefix, message, ...data);
    }
  }

  public connect(): void {
    if (this.eventSource || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.forceDisconnected = false;

    this.connectionTimeoutTimer = setTimeout(() => {
      if (this.isConnecting) {
        this.disconnect("timeout");
        if (this.options.autoReconnect) {
          this.scheduleReconnect();
        }
      }
    }, this.options.connectionTimeout);

    try {
      const url = this.buildUrl();
      this.log("info", "Connecting to:", url);

      this.eventSource = new EventSource(url, {
        withCredentials: this.options.withCredentials,
      });

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        if (this.connectionTimeoutTimer) {
          clearTimeout(this.connectionTimeoutTimer);
        }
        this.log("info", "Connected successfully");
        this.options.onConnect();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const result = SSEEventSchema.safeParse(data);

          if (result.success) {
            this.dispatchEvent(result.data);
          } else {
            this.log("warn", "Invalid event format:", event.data, result.error);
          }
        } catch (error) {
          this.log("error", "Failed to parse event:", error);
        }
      };

      this.eventSource.onerror = (error) => {
        this.log("error", "Connection error:", error);
        if (this.eventSource) {
          this.disconnect("error");
          if (this.options.autoReconnect && !this.forceDisconnected) {
            this.scheduleReconnect();
          }
        }
        this.options.onError(new Error("SSE connection error"));
      };
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  private handleConnectionError(error: unknown): void {
    this.isConnecting = false;
    this.log("error", "Connection failed:", error);

    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
    }

    if (this.options.autoReconnect && !this.forceDisconnected) {
      this.scheduleReconnect();
    }

    this.options.onError(
      error instanceof Error ? error : new Error(String(error)),
    );
  }

  public disconnect(reason = "manual"): void {
    if (reason === "manual") {
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
      this.eventSource.close();
      this.eventSource = null;
      this.isConnecting = false;
      this.options.onDisconnect(reason);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log("warn", "Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts += 1;
    const delay =
      this.options.reconnectInterval *
      Math.pow(1.5, this.reconnectAttempts - 1);

    this.log(
      "info",
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
      this.reconnectTimer = null;
    }, delay);
  }

  private dispatchEvent(event: SSEEvent): void {
    const typeListeners = this.eventListeners.get(event.type);
    const wildcardListeners = this.eventListeners.get("*");

    typeListeners?.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        this.log("error", `Event listener error:`, error);
      }
    });

    wildcardListeners?.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        this.log("error", "Wildcard listener error:", error);
      }
    });
  }

  public on<T extends SSEEventType | "*">(
    eventType: T,
    listener: (
      event: T extends "*" ? SSEEvent : Extract<SSEEvent, { type: T }>,
    ) => void,
  ): () => void {
    const listeners = this.eventListeners.get(eventType) ?? new Set();
    listeners.add(listener as (event: SSEEvent) => void);
    this.eventListeners.set(eventType, listeners);

    return () => {
      const currentListeners = this.eventListeners.get(eventType);
      currentListeners?.delete(listener as (event: SSEEvent) => void);
    };
  }

  public updateOptions(options: Partial<SSEClientOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
  }
}
