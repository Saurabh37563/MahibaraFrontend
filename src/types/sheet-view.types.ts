import {
  Clock,
  CheckCircle,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";
import { FiLoader } from "react-icons/fi";

export interface SpreadsheetViewProps {
  title?: string;
  sheetType: string;
  onError?: (error: Error) => void;
  onFileLoad?: (sheetNames: string[]) => void;
  onFileUpload?: (file: File) => void;
  onDelete?: () => void;
  enableSSE?: boolean;
  onClearSelection?: () => void;
}

export interface SheetApiResponse {
  fileId: string;
  fileUrl: string;
  status: SheetStatus;
  taskId: string;
  message?: string;
  progress?: number;
  stage?: string;
  type?: string;
  timestamp?: string;
  projectId?: string;
  sheetType?: string;
  resultUrl?: string;
  createdAt?: string;
  completedAt?: string;
  metadata: {
    fileName: string;
    fileSize: string;
    sheetIndex?: number;
    sheetType: string;
    lastModified: string;
  };
}

export type SheetStatus = "pending" | "processing" | "completed" | "validated" | "failed";

export const FINAL_STATUSES = ["completed", "failed", "validated"] as const;

export interface StatusBadgeConfig {
  icon: LucideIcon | typeof FiLoader;
  styles: string;
  label: string;
}

export const statusBadgeConfig: Record<SheetStatus | string, StatusBadgeConfig> = {
  pending: {
    icon: Clock,
    styles: "text-yellow-800 bg-yellow-100",
    label: "Pending",
  },
  processing: {
    icon: FiLoader,
    styles: "text-blue-800 bg-blue-100",
    label: "Processing",
  },
  completed: {
    icon: CheckCircle,
    styles: "text-green-800 bg-green-100",
    label: "Completed",
  },
  validated: {
    icon: CheckCircle,
    styles: "text-green-800 bg-green-100",
    label: "Validated",
  },
  failed: {
    icon: AlertTriangle,
    styles: "text-red-800 bg-red-100",
    label: "Failed",
  },
};

export interface SSEEventData {
  taskId: string;
  status: SheetStatus;
  progress: number;
  message: string;
  type: 'connection' | 'progress' | 'final';
  timestamp: string;
  dbStatus?: string;
  projectId?: number;
  sheetType?: string;
  resultUrl?: string | null;
  createdAt?: string;
  completedAt?: string | null;
}
