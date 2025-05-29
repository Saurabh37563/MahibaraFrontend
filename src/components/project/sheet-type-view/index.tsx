"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Trash2, Info, Wifi, WifiOff } from "lucide-react";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileX,
} from "lucide-react";
import { GrValidate } from "react-icons/gr";
import { Button } from "@/components/ui/button";
import { useSSE } from "@/hooks/useSSE";
import { fetchSpreadsheetData } from "@/services/api/spreadsheet-api";
import { SpreadsheetData, SSEEvent } from "@/types/spreadsheet-types";
import ValidateFileData from "./validate-file-data";
import { FiLoader } from "react-icons/fi";
import DownloadFile from "./download-sheet";
import DeleteSheet from "./delete-sheet";
import ValidateFile from "./validate-file-data";
import ExcelViewer from "@/components/common/excel-file-viewer";
import axios, { AxiosError } from "axios";

interface SpreadsheetViewProps {
  title?: string;
  sheetType: string; // Make this required for API calls
  onError?: (error: Error) => void;
  onFileLoad?: (sheetNames: string[]) => void;
  onFileUpload?: (file: File) => void;
  onDelete?: () => void;
  enableSSE?: boolean;
}

// Simulated API response structure
interface SheetApiResponse {
  fileId: string;
  fileUrl: string;
  status: SpreadsheetData["status"];
  message?: string;
  progress?: number;
  metadata?: {
    fileName?: string;
    fileSize?: string;
    lastModified?: string;
  };
}

const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  title = "Spreadsheet",
  sheetType,
  onError,
  onFileLoad,
  onFileUpload,
  onDelete,
  enableSSE = true,
}) => {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  // State management
  const [sheetData, setSheetData] = useState<SheetApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noDataFound, setNoDataFound] = useState(false);

  // Refs to prevent unnecessary re-renders
  const dataFetchedRef = useRef(false);

  // Define final statuses that should stop SSE connection
  const FINAL_STATUSES = ["completed", "failed", "validated"];

  // Determine if SSE should be active
  const shouldConnectSSE = useMemo(() => {
    if (!enableSSE || !projectId || !sheetData) return false;
    return !FINAL_STATUSES.includes(sheetData.status);
  }, [enableSSE, projectId, sheetData]);

  // SSE connections till we fetch it from the backend
  const sseUrl = useMemo(() => {
    if (!projectId) return "";
    return `http://192.168.1.63:8000/api/v1/sheet/get_mapped_sheet`;
  }, [projectId]);

  const {
    isConnected: sseConnected,
    error: sseError,
    addEventListener,
    disconnect: disconnectSSE,
  } = useSSE(sseUrl, {
    enabled: shouldConnectSSE,
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  });

  // Status badge configuration
  const statusBadgeConfig = useMemo(
    () => ({
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
    }),
    []
  );

  // Simulated API call - replace this with actual API call later
  // const fetchSheetData = async (
  //   projectId: string,
  //   sheetType: string
  // ): Promise<SheetApiResponse> => {
  //   // Simulate API delay
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   // Simulate different scenarios based on projectId for testing
  //   if (projectId === "no-data") {
  //     throw new Error("NO_DATA_FOUND");
  //   }

  //   if (projectId === "error-test") {
  //     throw new Error("Failed to fetch sheet data");
  //   }

  //   // Simulate successful response
  //   return {
  //     fileId: `file_${projectId}_${sheetType}`,
  //     fileUrl: "/SOB_PO_test.xlsx", // Local file in public folder
  //     status: "completed",
  //     message: "File ready for viewing",
  //     progress: 100,
  //     metadata: {
  //       fileName: "SOB_PO_test.xlsx",
  //       fileSize: "2.5 MB",
  //       lastModified: new Date().toISOString(),
  //     },
  //   };
  // };

  const fetchSheetData = async (
    projectId: string,
    sheetType: string
  ): Promise<SheetApiResponse> => {
    try {
      const { data, status } = await axios.post<any>(
        `http://192.168.1.63:8000/api/v1/sheet/get_mapped_sheet`,
        {
          project_id: "38",
          sheet_type: "RST",
        }
      );

      // Axios treats non-2xx as throw, but in case you want explicit check:
      if (status === 404) {
        throw new Error("NO_DATA_FOUND");
      }

      return data?.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response?.status === 404) {
          throw new Error("NO_DATA_FOUND");
        }
        // You can inspect axiosErr.response?.data or axiosErr.message here
        throw new Error(
          `Failed to fetch sheet data: ${
            axiosErr.response?.status ?? axiosErr.message
          }`
        );
      }
      // Non-Axios error
      throw err;
    }
  };
  // Initial data fetch - only once per projectId and sheetType
  // Remove onError from dependencies since it's not used in the critical path
  useEffect(() => {
    const loadSheetData = async () => {
      if (!projectId || !sheetType) return;

      try {
        setIsLoading(true);
        setError(null);
        setNoDataFound(false);

        const data = await fetchSheetData(projectId, sheetType);
        setSheetData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load sheet data";

        if (errorMessage === "NO_DATA_FOUND") {
          setNoDataFound(true);
          setError(null);
        } else {
          setError(errorMessage);
          // Call onError outside of the dependency array
          if (onError) {
            onError(new Error(errorMessage));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSheetData();
  }, [projectId, sheetType]); // Only depend on what actually matters

  // Reset data fetch flag when projectId or sheetType changes
  useEffect(() => {
    dataFetchedRef.current = false;
    setSheetData(null);
    setError(null);
    setNoDataFound(false);
  }, [projectId, sheetType]);

  // Handle SSE events
  useEffect(() => {
    if (!shouldConnectSSE) return;

    console.log("[SSE] Setting up event listeners for project:", projectId);

    // Listen for file_status events
    const unsubscribeFileStatus = addEventListener("file_status", (event) => {
      try {
        const eventData: SSEEvent["data"] =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        console.log("[SSE] File status update:", eventData);

        const actualData = eventData?.data || eventData;

        // Only process events for our project and sheet type
        if (
          (actualData.projectId === projectId ||
            actualData.fileId === projectId) &&
          actualData.sheetType === sheetType
        ) {
          setSheetData((prev) => {
            if (!prev) return prev;

            const newStatus = actualData.status as SheetApiResponse["status"];

            console.log(
              "[SSE] Updating status from",
              prev.status,
              "to",
              newStatus
            );

            return {
              ...prev,
              status: newStatus,
              message: actualData.message,
              progress: actualData.progress,
              fileUrl: actualData.fileUrl || prev.fileUrl,
              metadata: {
                ...prev.metadata,
                ...actualData.metadata,
              },
            };
          });

          // If processing is complete, disconnect SSE
          if (FINAL_STATUSES.includes(actualData.status)) {
            console.log(
              "[SSE] Processing completed with status:",
              actualData.status
            );
            setTimeout(() => {
              console.log("[SSE] Disconnecting SSE due to final status");
              disconnectSSE();
            }, 2000);
          }
        }
      } catch (error) {
        console.warn("[SSE] Failed to parse file status event:", error);
      }
    });

    return () => {
      unsubscribeFileStatus();
    };
  }, [shouldConnectSSE, addEventListener, projectId, sheetType, disconnectSSE]);

  // Disconnect SSE when status is final
  useEffect(() => {
    if (sheetData && FINAL_STATUSES.includes(sheetData.status)) {
      console.log("[SSE] Final status reached, disconnecting SSE");
      disconnectSSE();
    }
  }, [sheetData?.status, disconnectSSE]);

  // Handle retry function
  const handleRetry = useCallback(() => {
    dataFetchedRef.current = false;
    setError(null);
    setNoDataFound(false);
    setSheetData(null);
    // Trigger re-fetch by changing the dependency
    window.location.reload();
  }, []);

  // Render status badge
  const renderStatusBadge = useMemo(() => {
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
  }, [sheetData, statusBadgeConfig]);

  // Render loading state
  if (isLoading) {
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

  // Render no data found state
  if (noDataFound) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileX size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Data Found
          </h3>
          <p className="text-gray-600 mb-4">
            No {sheetType} data found for this project. The file may not have
            been uploaded yet or may have been removed.
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
              onClick={() => router.back()}
              className="px-4 py-2 rounded-md"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
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
              onClick={() => router.back()}
              className="px-4 py-2 rounded-md"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If no sheet data, this shouldn't happen but handle gracefully
  if (!sheetData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sheet data available</p>
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
            {/* <ValidateFile
              sheet_type={sheetType}
              file_id={sheetData.fileId}
              project_id={projectId}
              fileName={sheetData.metadata?.fileName}
              onRefetchData={() => {
                console.log("Refetch Data triggered");
                // You can implement refetch logic here if needed
              }}
            /> */}
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
                console.log("File deleted successfully");
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
          <span>Sheet Type: {sheetType}</span>
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
