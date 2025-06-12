"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Info } from "lucide-react"; // Changed icon to Info for neutral state
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { BASE_TEMP_BACKEND_URL } from "@/constants/endpoints-constant";
import { toast } from "sonner";
import AnalysisHeader from "./analysis-header";
import AnalysisStatusView from "./analysis-status-view";
import ExcelViewer from "@/components/common/excel-file-viewer";
import { useSSE } from "@/hooks/useSSE";
import { queryClient } from "@/providers/query-provider";

// Types
export interface AnalysisApiResponse {
  analysisId: string;
  fileUrl: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "not_started"
    | "not_mapped"
    | "draft"
    | "running";
  message?: string;
  progress?: number;
  lastAnalysisDate?: string;
  sourceFileLastModified?: string;
  isSourceFileChanged?: boolean;
  fileMappingStatus?: boolean;
  isColumnMapped?: boolean;
  metadata?: {
    fileName?: string;
    fileSize?: string;
    recordCount?: number;
    analysisParameters?: {
      threshold?: string;
      dateRange?: string;
    };
    sourceFileName?: string;
  };
  sourceFileId?: string;
  sourceFileName?: string;
}

export interface SourceFile {
  id: string;
  name: string;
}

// Define API error response type
interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface AnalysisViewProps {
  title?: string;
  analysisType: string;
  onError?: (error: Error) => void;
  onAnalysisComplete?: () => void;
  enableSSE?: boolean;
  onClose?: () => void; // Add onClose prop for closing the error view
}

const FINAL_STATUSES = ["completed", "failed"];

const AnalysisView: React.FC<AnalysisViewProps> = ({
  title = "Analysis",
  analysisType,
  onError,
  onAnalysisComplete,
  onClose,
}) => {
  const params = useParams();
  const projectId = params?.id as string;
  const queryClient = useQueryClient();

  // State management
  const [isTriggering, setIsTriggering] = useState(false);
  const [excelViewerBlobUrl, setExcelViewerBlobUrl] = useState<string | null>(
    null
  );
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Fetch analysis data
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useQuery<AnalysisApiResponse>({
    queryKey: ["analysisData", projectId, analysisType],
    queryFn: async () => {
      const res = await axios.get(
        `${BASE_TEMP_BACKEND_URL}/api/v1/projects/analysis/${projectId}/${analysisType}`
      );
      return res.data?.data as AnalysisApiResponse;
    },
    enabled: !!projectId && !!analysisType,
    retry: false,
    staleTime: 0,
  });

  // Trigger analysis mutation
  const triggerAnalysisMutation = useMutation({
    mutationFn: async () => {
      await axios.post(
        `${BASE_TEMP_BACKEND_URL}/api/v1/projects/${projectId}/analysis/${analysisType}/process`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["analysisData", projectId, analysisType],
      });
      setIsTriggering(false);
      onAnalysisComplete?.();
    },
    onError: (err: unknown) => {
      setIsTriggering(false);
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to trigger analysis";
      toast.error(errorMessage);
      onError?.(new Error(errorMessage));
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async ({
      fileUrl,
      fileName,
    }: {
      fileUrl: string;
      fileName?: string;
    }) => {
      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");

      // Set the href to the file URL
      a.href = fileUrl;

      // Set download attribute to specify filename
      a.download = fileName || "analysis_result.xlsx";

      // Important: Do not set target="_blank" as it can interfere with download

      // Hide the element (not necessary to show it)
      a.style.display = "none";

      // Add to DOM, click, then remove
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    },
    onSuccess: () => {
      toast.success("Download started");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Failed to download analysis file. Please try again later."
      );
    },
  });

  // SSE logic for analysis status
  const shouldConnectSSE = useMemo(() => {
    if (!projectId || !analysisData) return false;

    // Early return if status is not_mapped or mapping is needed
    if (analysisData.status === "not_mapped") return false;

    // Don't connect if mapping is required
    if (analysisData.isColumnMapped === false) return false;

    // Don't connect if source file changed and status is completed
    if (analysisData.isSourceFileChanged && analysisData.status === "completed")
      return false;

    // Only connect for active analysis states
    return ["pending", "processing"].includes(analysisData.status);
  }, [projectId, analysisData]);

  const sseUrl = useMemo(() => {
    if (!projectId || !analysisData?.analysisId) return "";
    // Use correct backend SSE endpoint
    return `${BASE_TEMP_BACKEND_URL}/api/v1/projects/${projectId}/analysis/${analysisData.analysisId}/stream`;
  }, [projectId, analysisData?.analysisId]);

  const { addEventListener, disconnect: disconnectSSE } = useSSE(sseUrl, {
    enabled: shouldConnectSSE,
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  });

  useEffect(() => {
    // Only disconnect and refetch if we're transitioning from a valid state
    const shouldDisconnectAndRefetch =
      analysisData &&
      ((analysisData.status !== "not_mapped" && !analysisData.isColumnMapped) ||
        (analysisData.isSourceFileChanged &&
          analysisData.status === "completed"));

    if (shouldDisconnectAndRefetch) {
      disconnectSSE();
      // Only refetch if we're not already in a not_mapped or failed state
      if (!["not_mapped", "failed"].includes(analysisData.status)) {
        refetchAnalysis();
      }
    }
  }, [
    analysisData?.status,
    analysisData?.isColumnMapped,
    analysisData?.isSourceFileChanged,
    disconnectSSE,
    refetchAnalysis,
  ]);

  // Modified version of analysis status effect
  useEffect(() => {
    if (!shouldConnectSSE || !analysisData) return;

    const unsubscribeUpdate = addEventListener("update", (event) => {
      try {
        const eventData =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (eventData.analysisId === analysisData.analysisId) {
          // Map "running" status to "processing" for UI consistency
          const status =
            eventData.status === "running" ? "processing" : eventData.status;

          queryClient.setQueryData<AnalysisApiResponse>(
            ["analysisData", projectId, analysisType],
            (prev) =>
              prev
                ? {
                    ...prev,
                    status,
                    message: eventData.message,
                    progress: eventData.progress,
                    fileUrl: eventData.fileUrl || prev.fileUrl,
                    lastAnalysisDate:
                      eventData.lastAnalysisDate || prev.lastAnalysisDate,
                    metadata: {
                      ...prev.metadata,
                      ...eventData.metadata,
                      recordCount: eventData.records_processed,
                    },
                  }
                : prev
          );

          // Only update lastUpdate if we're in an active state
          if (["pending", "processing", "running"].includes(eventData.status)) {
            setLastUpdate(Date.now());
          }
        }
      } catch (error) {
        console.error("Error parsing SSE update event:", error);
      }
    });

    // Listen for 'final' events (task completion)
    const unsubscribeFinal = addEventListener("final", (event) => {
      try {
        const eventData =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (eventData.analysisId === analysisData.analysisId) {
          queryClient.setQueryData<AnalysisApiResponse>(
            ["analysisData", projectId, analysisType],
            (prev) =>
              prev
                ? {
                    ...prev,
                    status: eventData.status,
                    progress: 100,
                    message: eventData.message || "Task completed successfully",
                    lastAnalysisDate:
                      eventData.lastAnalysisDate || prev.lastAnalysisDate,
                    fileUrl: eventData.fileUrl || prev.fileUrl,
                  }
                : prev
          );
          setLastUpdate(Date.now());

          setTimeout(() => {
            disconnectSSE();
            refetchAnalysis();
          }, 1000);
        }
      } catch (error) {
        console.error("Error parsing SSE final event:", error);
      }
    });

    // Listen for 'error' events
    const unsubscribeError = addEventListener("error", (event) => {
      try {
        const eventData =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (eventData.analysisId === analysisData.analysisId) {
          queryClient.setQueryData<AnalysisApiResponse>(
            ["analysisData", projectId, analysisType],
            (prev) =>
              prev
                ? {
                    ...prev,
                    status: "failed",
                    message: eventData.message || "Processing failed",
                  }
                : prev
          );
          setLastUpdate(Date.now());
        }
      } catch (error) {
        console.error("Error parsing SSE error event:", error);
      }
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeFinal();
      unsubscribeError();
    };
  }, [
    shouldConnectSSE,
    addEventListener,
    projectId,
    analysisType,
    disconnectSSE,
    analysisData,
    refetchAnalysis,
  ]);

  // Computed values
  const hasResults = useMemo(
    () => analysisData?.status === "completed" && !!analysisData?.fileUrl,
    [analysisData]
  );

  const isProcessing = useMemo(
    () => ["pending", "processing"].includes(analysisData?.status ?? ""),
    [analysisData?.status]
  );

  // Error state
  if (analysisError) {
    let friendlyMessage = "Analysis not found.";
    if (
      (analysisError as AxiosError<ApiErrorResponse>)?.response?.status !==
        404 &&
      !(analysisError as Error)?.message?.includes("404")
    ) {
      friendlyMessage = "Unable to load analysis.";
    }

    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-center max-w-md p-0 rounded-lg">
          <Info
            size={48}
            className="mx-auto mb-4 text-green-900"
            aria-label="Information"
          />
          <h3 className="text-base font-semibold text-green-900 mb-6">
            {friendlyMessage}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => refetchAnalysis()}
              className="bg-green-900 text-white hover:bg-green-800 focus:ring-green-900"
              aria-label="Retry loading analysis"
              tabIndex={0}
            >
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (onClose) {
                  onClose();
                }
              }}
              className="border-green-900 text-green-900 hover:bg-green-50 focus:ring-green-900"
              aria-label="Close error message"
              tabIndex={0}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Only show ExcelViewer when status is "completed" and fileUrl is present
  const showExcelViewer =
    analysisData?.status === "completed" &&
    !!(excelViewerBlobUrl || analysisData?.fileUrl);

  return (
    <div className="h-full max-md:h-[95%] flex flex-col">
      <AnalysisHeader
        title={title}
        analysisData={analysisData}
        isLoading={isAnalysisLoading}
        isTriggering={isTriggering}
        isProcessing={isProcessing}
        hasResults={hasResults}
        projectId={projectId}
        analysisType={analysisType}
        onTriggerAnalysis={() => {
          setIsTriggering(true);
          triggerAnalysisMutation.mutate();
        }}
        onDownload={() => {
          if (analysisData?.fileUrl) {
            downloadMutation.mutate({
              fileUrl: analysisData.fileUrl,
              fileName: analysisData.metadata?.fileName,
            });
          }
        }}
        downloadLoading={downloadMutation.isPending}
        triggerLoading={triggerAnalysisMutation.isPending}
      />

      <div className="flex-1 overflow-hidden p-0">
        {isAnalysisLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Loading {analysisType} analysis...
              </p>
              <p className="text-sm text-gray-400 mt-2">Project: {projectId}</p>
            </div>
          </div>
        ) : !analysisData ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No analysis data available</p>
          </div>
        ) : showExcelViewer ? (
          <ExcelViewer
            key={excelViewerBlobUrl || analysisData.fileUrl}
            fileUrl={excelViewerBlobUrl || analysisData.fileUrl}
          />
        ) : (
          <AnalysisStatusView
            analysisData={analysisData}
            projectId={projectId}
            analysisType={analysisType}
            onTriggerAnalysis={() => {
              setIsTriggering(true);
              triggerAnalysisMutation.mutate();
            }}
            isTriggering={isTriggering || triggerAnalysisMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
