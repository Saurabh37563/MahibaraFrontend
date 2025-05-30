"use client";

import React, { useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSSE } from "@/hooks/useSSE";
import { SpreadsheetData, SSEEvent } from "@/types/spreadsheet-types";
import { FiLoader } from "react-icons/fi";
import DownloadFile from "./download-sheet";
import DeleteSheet from "./delete-sheet";
import ExcelViewer from "@/components/common/excel-file-viewer";
import axios, { AxiosError } from "axios";
import { BASE_TEMP_BACKEND_URL } from "@/constants/endpoints-constant";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";

interface SpreadsheetViewProps {
  title?: string;
  sheetType: string;
  onError?: (error: Error) => void;
  onFileLoad?: (sheetNames: string[]) => void;
  onFileUpload?: (file: File) => void;
  onDelete?: () => void;
  enableSSE?: boolean;
  onClearSelection?: () => void;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: SheetApiResponse;
  error: null | string;
  metadata: null | any;
}

interface SheetApiResponse {
  fileId: string;
  fileUrl: string;
  status: "pending" | "processing" | "completed" | "validated" | "failed";
  taskId: string;
  message?: string;
  progress?: number;
  metadata: {
    fileName: string;
    fileSize: string;
    sheetIndex?: number;
    sheetType: string;
    lastModified: string;
  };
}

const FINAL_STATUSES = ["completed", "failed", "validated"];

const statusBadgeConfig = {
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

const fetchSheetData = async (
  projectId: string,
  sheetType: string
): Promise<SheetApiResponse> => {
  try {
    const { data: response } = await axios.post<ApiResponse>(
      `http://192.168.1.63:8000/api/v1/sheet/get_mapped_sheet`,
      {
        project_id: projectId,
        sheet_type: sheetType,
      }
    );
    if (!response.success)
      throw new Error(response.error || "Failed to fetch sheet data");
    if (!response.data) throw new Error("NO_DATA_FOUND");
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) throw new Error("NO_DATA_FOUND");
      throw new Error(
        `Failed to fetch sheet data: ${
          axiosErr.response?.status ?? axiosErr.message
        }`
      );
    }
    throw err;
  }
};

const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  title = "Spreadsheet",
  sheetType,
  onError,
  onFileLoad,
  onFileUpload,
  onDelete,
  enableSSE = true,
  onClearSelection,
}) => {
  const params = useParams();
  const projectId = params?.id as string;

  // React Query for sheet data
  const {
    data: sheetData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<SheetApiResponse, Error>({
    queryKey: ["sheetData", projectId, sheetType],
    queryFn: () => fetchSheetData(projectId, sheetType),
    enabled: !!projectId && !!sheetType,
    retry: 1,
  });

  // SSE logic
  const shouldConnectSSE = useMemo(() => {
    if (!enableSSE || !projectId || !sheetData) return false;
    return !FINAL_STATUSES.includes(sheetData.status);
  }, [enableSSE, projectId, sheetData]);

  const sseUrl = useMemo(() => {
    if (!projectId || !sheetData?.taskId) return "";
    return `${BASE_TEMP_BACKEND_URL}/tasks/${sheetData.taskId}/events`;
  }, [projectId, sheetData?.taskId]);

  const { addEventListener, disconnect: disconnectSSE } = useSSE(sseUrl, {
    enabled: shouldConnectSSE,
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  });

  // SSE event handler
  React.useEffect(() => {
    if (!shouldConnectSSE || !sheetData) return;
    const unsubscribeFileStatus = addEventListener("file_status", (event) => {
      try {
        const eventData: SSEEvent["data"] =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        const actualData = eventData?.data || eventData;
        if (
          (actualData.projectId === projectId ||
            actualData.fileId === projectId) &&
          actualData.sheetType === sheetType
        ) {
          queryClient.setQueryData<SheetApiResponse>(
            ["sheetData", projectId, sheetType],
            (prev) =>
              prev
                ? {
                    ...prev,
                    status: actualData.status,
                    message: actualData.message,
                    progress: actualData.progress,
                    fileUrl: actualData.fileUrl || prev.fileUrl,
                    metadata: { ...prev.metadata, ...actualData.metadata },
                  }
                : prev
          );
          if (FINAL_STATUSES.includes(actualData.status)) {
            setTimeout(() => {
              disconnectSSE();
            }, 2000);
          }
        }
      } catch (error) {
        // ignore
      }
    });
    return () => {
      unsubscribeFileStatus();
    };
  }, [
    shouldConnectSSE,
    addEventListener,
    projectId,
    sheetType,
    disconnectSSE,
    sheetData,
    queryClient,
  ]);

  // Render status badge
  const renderStatusBadge = React.useMemo(() => {
    if (!sheetData) return null;
    const config =
      statusBadgeConfig[sheetData.status] || statusBadgeConfig.pending;
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-2">
        <span
          className={`${config.styles} text-[10px] capitalize rounded-full px-2 py-[2px] flex items-center gap-1`}
        >
          <Icon
            className={
              sheetData?.status.toLowerCase() === "processing"
                ? "animate-spin"
                : ""
            }
            size={12}
          />
          <span>{config.label}</span>
          {sheetData.progress !== undefined && (
            <span className="ml-1">({sheetData.progress}%)</span>
          )}
        </span>
      </div>
    );
  }, [sheetData]);

  // Retry handler
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Go back handler
  const handleGoBack = useCallback(() => {
    onClearSelection?.();
  }, [onClearSelection]);

  // Loading state
  if (isLoading || isFetching) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {sheetType} data...</p>
          <p className="text-sm text-gray-400 mt-2">Project: {projectId}</p>
        </div>
      </div>
    );
  }

  // Error or no data state
  if (error || !sheetData) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load sheet data";
    const isNoData = errorMessage === "NO_DATA_FOUND";
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileX size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isNoData ? "No Data Found" : "Error Loading Data"}
          </h3>
          <p className="text-gray-600 mb-4">
            {isNoData
              ? "No data found for this source file. The file may not have been uploaded yet or may have been removed."
              : errorMessage}
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Project ID: {projectId}</p>
            <p>Sheet Type: {sheetType}</p>
          </div>
          <div className="mt-6 space-x-3">
            <Button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="px-4 py-2 rounded-md"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isFileOperationDisabled = ["processing", "pending"].includes(
    sheetData.status
  );
  const hasFileUrl = !!sheetData.fileUrl;

  return (
    <div className="h-full max-md:h-[95%] flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col p-4 border-b bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-center gap-2">
            <FileSpreadsheet size={20} className="text-gray-400" />
            <div className="flex flex-col items-start justify-center">
              <h2 className="text-[14px] font-medium">
                {sheetData?.metadata?.fileName}
              </h2>
              {renderStatusBadge}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DownloadFile
              fileUrl={sheetData.fileUrl}
              fileName={sheetData.metadata?.fileName}
              isDisabled={isFileOperationDisabled || !hasFileUrl}
              onDownloadStart={() => console.log("Download started")}
              onDownloadComplete={() => console.log("Download completed")}
              onDownloadError={(error) =>
                console.error("Download failed:", error)
              }
            />
            <DeleteSheet
              projectId={projectId}
              sheetType={sheetType}
              fileName={sheetData.metadata?.fileName}
              isDisabled={isFileOperationDisabled || !hasFileUrl}
              onDeleteStart={() => console.log("Starting deletion...")}
              onDeleteComplete={() => {
                queryClient.invalidateQueries({
                  queryKey: ["sheetData", projectId, sheetType] as const,
                });
                onDelete?.();
              }}
              onDeleteError={(error) => {
                console.error("Deletion failed:", error);
              }}
            />
          </div>
        </div>
        <p className="flex flex-wrap gap-2 text-[10px] text-gray-500 font-medium mt-2">
          {sheetData.metadata?.lastModified && (
            <span>
              Last Modified:{" "}
              {new Date(sheetData.metadata.lastModified).toLocaleDateString()}
            </span>
          )}
          {sheetData.metadata?.fileSize && (
            <span>Size: {sheetData.metadata.fileSize}</span>
          )}
          <span>Sheet Type: {sheetData.metadata?.sheetType}</span>
        </p>
      </div>
      {/* File Viewer Section */}
      <div className="flex-1 overflow-y-hidden overflow-x-hidden p-0">
        <ExcelViewer fileUrl={sheetData?.fileUrl} />
      </div>
    </div>
  );
};

export default SpreadsheetView;
