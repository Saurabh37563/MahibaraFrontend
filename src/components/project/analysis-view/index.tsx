"use client";

import React, { useState, useMemo } from "react";
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
    | "draft";
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
      const response = await fetch(fileUrl, { cache: "reload" });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "analysis_result.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return blob;
    },
    onSuccess: (blob: Blob) => {
      if (excelViewerBlobUrl) {
        window.URL.revokeObjectURL(excelViewerBlobUrl);
      }
      setExcelViewerBlobUrl(window.URL.createObjectURL(blob));
      toast.success("File downloaded successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Failed to download analysis file. Please try again later."
      );
    },
  });

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
        ) : isProcessing || hasResults || analysisData.status === "failed" ? (
          hasResults ? (
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
          )
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
