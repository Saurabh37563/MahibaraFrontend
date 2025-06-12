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

const ACTIVE_STATUSES = ["queued", "running", "processing", "pending"];
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

  // Rerun analysis mutation
  const rerunAnalysisMutation = useMutation({
    mutationFn: async () => {
      await axios.post(
        `${BASE_TEMP_BACKEND_URL}/api/v1/projects/rerun_analysis/${projectId}/${analysisType}`
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
        "Failed to re-run analysis";
      toast.error(errorMessage);
      onError?.(new Error(errorMessage));
    },
  });

  // SSE logic for analysis status (manual EventSource)
  useEffect(() => {
    // Inline shouldConnectSSE logic
    const canConnectSSE =
      !!projectId &&
      !!analysisData &&
      analysisData.status !== "not_mapped" &&
      analysisData.isColumnMapped !== false &&
      !(
        analysisData.isSourceFileChanged && analysisData.status === "completed"
      ) &&
      ACTIVE_STATUSES.includes(analysisData.status);

    if (!canConnectSSE || !projectId || !analysisData?.analysisId) return;

    const sseUrl = `${BASE_TEMP_BACKEND_URL}/api/v1/projects/${projectId}/analysis/${analysisData.analysisId}/stream`;
    const eventSource = new window.EventSource(sseUrl);

    const handleStatus = (event: MessageEvent) => {
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
                    progress: eventData.progress ?? prev.progress,
                    message: eventData.message || prev.message,
                    fileUrl: eventData.fileUrl || prev.fileUrl,
                  }
                : prev
          );
          if (ACTIVE_STATUSES.includes(eventData.status)) {
            setLastUpdate(Date.now());
          }
          if (FINAL_STATUSES.includes(eventData.status)) {
            setTimeout(() => {
              eventSource.close();
              refetchAnalysis();
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Error parsing SSE status event:", error);
      }
    };

    const handleFinal = (event: MessageEvent) => {
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
                    fileUrl: eventData.fileUrl || prev.fileUrl,
                  }
                : prev
          );
          setLastUpdate(Date.now());
          setTimeout(() => {
            eventSource.close();
            refetchAnalysis();
          }, 1000);
        }
      } catch (error) {
        console.error("Error parsing SSE final event:", error);
      }
    };

    eventSource.addEventListener("status", handleStatus);
    eventSource.addEventListener("final", handleFinal);

    eventSource.onerror = (err) => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("status", handleStatus);
      eventSource.removeEventListener("final", handleFinal);
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    analysisData,
    analysisData?.analysisId,
    analysisType,
    refetchAnalysis,
    queryClient,
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
        onRerunAnalysis={() => {
          setIsTriggering(true);
          rerunAnalysisMutation.mutate();
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
            onRerunAnalysis={() => {
              setIsTriggering(true);
              rerunAnalysisMutation.mutate();
            }}
            rerunLoading={rerunAnalysisMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
