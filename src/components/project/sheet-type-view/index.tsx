"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { BASE_TEMP_BACKEND_URL } from "@/constants/endpoints-constant";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import DownloadFile from "./download-sheet";
import DeleteSheet from "./delete-sheet";
import ExcelViewer from "@/components/common/excel-file-viewer";
import { FiLoader } from "react-icons/fi";

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
  metadata: Record<string, unknown> | null;
}

interface SheetApiResponse {
  fileId: string;
  fileUrl: string;
  status: "pending" | "processing" | "completed" | "validated" | "failed";
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
      `${BASE_TEMP_BACKEND_URL}/api/v1/sheet/get_mapped_sheet`,
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
  sheetType,
  onDelete,
  enableSSE = true,
  onClearSelection,
}) => {
  const params = useParams();
  const projectId = params?.id as string;

  // State to force updates on SSE events
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

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

  // SSE logic for real-time updates
  useEffect(() => {
    const canConnectSSE =
      enableSSE &&
      !!projectId &&
      !!sheetData?.taskId &&
      !FINAL_STATUSES.includes(sheetData.status);

    if (!canConnectSSE) return;

    const sseUrl = `${BASE_TEMP_BACKEND_URL}/api/v1/sheet/task_events/${sheetData.taskId}`;
    const eventSource = new window.EventSource(sseUrl);

    const handleUpdate = (event: MessageEvent) => {
      try {
        const eventData =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (eventData.taskId === sheetData.taskId) {
          queryClient.setQueryData<SheetApiResponse>(
            ["sheetData", projectId, sheetType],
            (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                status: eventData.status,
                message: eventData.message,
                progress: eventData.progress,
                stage: eventData.stage,
                type: eventData.type,
                timestamp: eventData.timestamp,
                fileUrl: eventData.resultUrl || prev.fileUrl,
                metadata: { ...prev.metadata, ...eventData.metadata },
              };
            }
          );
          setLastUpdate(Date.now());
          if (FINAL_STATUSES.includes(eventData.status)) {
            setTimeout(() => {
              eventSource.close();
              refetch();
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Error parsing SSE update event:", error);
      }
    };

    const handleFinal = (event: MessageEvent) => {
      try {
        const eventData =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (eventData.taskId === sheetData.taskId) {
          queryClient.setQueryData<SheetApiResponse>(
            ["sheetData", projectId, sheetType],
            (prev) =>
              prev
                ? {
                    ...prev,
                    status: eventData.status,
                    progress: 100,
                    message: eventData.message || "Task completed successfully",
                    completedAt: eventData.timestamp,
                    fileUrl: eventData.resultUrl || prev.fileUrl,
                  }
                : prev
          );
          setLastUpdate(Date.now());
          setTimeout(() => {
            eventSource.close();
            refetch();
          }, 1000);
        }
      } catch (error) {
        console.error("Error parsing SSE final event:", error);
      }
    };

    eventSource.addEventListener("update", handleUpdate);
    eventSource.addEventListener("final", handleFinal);

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("update", handleUpdate);
      eventSource.removeEventListener("final", handleFinal);
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enableSSE,
    projectId,
    sheetData?.taskId,
    sheetData?.status,
    sheetType,
    refetch,
  ]);

  // Render status badge
  const renderStatusBadge = () => {
    if (!sheetData) return null;
    const config =
      statusBadgeConfig[sheetData.status] || statusBadgeConfig.pending;
    const Icon = config.icon;

    return (
      <div className="flex flex-col gap-1">
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
      </div>
    );
  };

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleGoBack = useCallback(() => {
    onClearSelection?.();
  }, [onClearSelection]);

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
  const isProcessingComplete = FINAL_STATUSES.includes(sheetData.status);

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
              {renderStatusBadge()}
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
        {sheetData.status === "processing" ? (
          <div className="h-full flex flex-col items-center justify-center bg-white p-6">
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="mt-8 flex flex-col items-center">
                <FileSpreadsheet className="h-16 w-16 text-gray-200 mb-3" />
                <p className="text-xs text-gray-400">
                  Your file will be available when processing completes
                </p>
              </div>
              <div className="w-full mb-8">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    Processing
                  </span>
                  <span className="text-sm font-medium text-emerald-800">
                    {sheetData.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-emerald-800 h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, sheetData.progress || 0)
                      )}%`,
                    }}
                  />
                </div>
              </div>
              {sheetData.stage && (
                <div className="flex items-center gap-2 mb-3 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm">{sheetData.stage}</span>
                </div>
              )}
              {sheetData.message && (
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  {sheetData.message}
                </p>
              )}
            </div>
          </div>
        ) : isProcessingComplete && hasFileUrl ? (
          <ExcelViewer fileUrl={sheetData?.fileUrl} />
        ) : (
          <div className="h-full flex items-center justify-center bg-white">
            <div className="text-center">
              <FileX size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                {hasFileUrl
                  ? "File preview is not available"
                  : "Waiting for file processing to begin"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpreadsheetView;
