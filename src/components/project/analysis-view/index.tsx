"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiPlay,
  FiAlertTriangle,
} from "react-icons/fi";
import { IoMdCheckmark } from "react-icons/io";
import { LuFileSpreadsheet } from "react-icons/lu";
import { IoWarningOutline } from "react-icons/io5";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileX,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSSE } from "@/hooks/useSSE";
import AnalysisSettings from "./analysis-settings";
import DownloadFile from "@/components/project/sheet-type-view/download-sheet";
import ExcelViewer from "@/components/common/excel-file-viewer";

interface AnalysisViewProps {
  title?: string;
  analysisType: string; // Required for API calls
  onError?: (error: Error) => void;
  onAnalysisComplete?: () => void;
  enableSSE?: boolean;
}

// Analysis API response structure
interface AnalysisApiResponse {
  analysisId: string;
  fileUrl: string; // URL to the Excel file with analysis results
  status: "pending" | "processing" | "completed" | "failed" | "not_started";
  message?: string;
  progress?: number;
  lastAnalysisDate?: string;
  sourceFileLastModified?: string;
  isSourceFileChanged?: boolean;
  metadata?: {
    fileName?: string;
    fileSize?: string;
    recordCount?: number;
    analysisParameters?: {
      threshold?: string;
      dateRange?: string;
    };
  };
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
  title = "Analysis",
  analysisType,
  onError,
  onAnalysisComplete,
  enableSSE = true,
}) => {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  // State management
  const [analysisData, setAnalysisData] = useState<AnalysisApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noDataFound, setNoDataFound] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Refs to prevent unnecessary re-renders
  const dataFetchedRef = useRef(false);

  // Define final statuses that should stop SSE connection
  const FINAL_STATUSES = ["completed", "failed"];

  // Determine if SSE should be active
  const shouldConnectSSE = useMemo(() => {
    if (!enableSSE || !projectId || !analysisData) return false;
    return !FINAL_STATUSES.includes(analysisData.status);
  }, [enableSSE, projectId, analysisData]);

  // SSE connections
  const sseUrl = useMemo(() => {
    if (!projectId) return "";
    return `http://localhost:8000/api/v1/sse/events?project_id=${projectId}&&token=test-token`;
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
      not_started: {
        icon: Clock,
        styles: "text-gray-800 bg-gray-100",
        label: "Not Started",
      },
      pending: {
        icon: Clock,
        styles: "text-yellow-800 bg-yellow-100",
        label: "Pending",
      },
      processing: {
        icon: FiRefreshCw,
        styles: "text-blue-800 bg-blue-100",
        label: "Processing",
      },
      completed: {
        icon: CheckCircle,
        styles: "text-green-800 bg-green-100",
        label: "Completed",
      },
      failed: {
        icon: AlertTriangle,
        styles: "text-red-800 bg-red-100",
        label: "Failed",
      },
    }),
    []
  );

  // Simulated API call for fetching analysis data
  const fetchAnalysisData = async (
    projectId: string,
    analysisType: string
  ): Promise<AnalysisApiResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate different scenarios based on projectId for testing
    if (projectId === "no-analysis") {
      throw new Error("NO_DATA_FOUND");
    }

    if (projectId === "error-test") {
      throw new Error("Failed to fetch analysis data");
    }

    // Simulate analysis that hasn't been run
    if (projectId === "not-started") {
      return {
        analysisId: `analysis_${projectId}_${analysisType}`,
        fileUrl: "",
        status: "not_started",
        message: "Analysis has not been started yet",
        metadata: {
          analysisParameters: {
            threshold: "85%",
            dateRange: "Last 30 days",
          },
        },
      };
    }

    // Simulate successful response with completed analysis
    return {
      analysisId: `analysis_${projectId}_${analysisType}`,
      fileUrl: "/SOB_PO_test.xlsx", // Local file in public folder
      status: "completed",
      message: "Analysis completed successfully",
      progress: 100,
      lastAnalysisDate: new Date().toISOString(),
      sourceFileLastModified: new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString(), // 1 day ago
      isSourceFileChanged: Math.random() > 0.7, // 30% chance of file being changed
      metadata: {
        fileName: `${analysisType}_analysis_results.xlsx`,
        fileSize: "3.2 MB",
        recordCount: 1250,
        analysisParameters: {
          threshold: "85%",
          dateRange: "Last 30 days",
        },
      },
    };
  };

  // Simulated API call for triggering analysis
  const triggerAnalysis = async (
    projectId: string,
    analysisType: string
  ): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate starting the analysis
    setAnalysisData((prev) => ({
      ...prev,
      analysisId: `analysis_${projectId}_${analysisType}`,
      status: "pending",
      message: "Analysis has been queued",
      progress: 0,
      isSourceFileChanged: false,
    }));
  };

  // Initial data fetch
  useEffect(() => {
    const loadAnalysisData = async () => {
      if (!projectId || !analysisType || dataFetchedRef.current) return;

      try {
        setIsLoading(true);
        setError(null);
        setNoDataFound(false);
        dataFetchedRef.current = true;

        const data = await fetchAnalysisData(projectId, analysisType);
        setAnalysisData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load analysis data";

        if (errorMessage === "NO_DATA_FOUND") {
          setNoDataFound(true);
          setError(null);
        } else {
          setError(errorMessage);
          onError?.(new Error(errorMessage));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!dataFetchedRef.current) {
      loadAnalysisData();
    }
  }, [projectId, analysisType, onError]);

  // Reset data fetch flag when projectId or analysisType changes
  useEffect(() => {
    dataFetchedRef.current = false;
    setAnalysisData(null);
    setError(null);
    setNoDataFound(false);
  }, [projectId, analysisType]);

  // Handle SSE events
  useEffect(() => {
    if (!shouldConnectSSE) return;

    console.log("[SSE] Setting up event listeners for analysis:", projectId);

    const unsubscribeAnalysisStatus = addEventListener(
      "analysis_status",
      (event) => {
        try {
          const eventData =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;

          console.log("[SSE] Analysis status update:", eventData);

          const actualData = eventData?.data || eventData;

          if (
            (actualData.projectId === projectId ||
              actualData.analysisId === projectId) &&
            actualData.analysisType === analysisType
          ) {
            setAnalysisData((prev) => {
              if (!prev) return prev;

              return {
                ...prev,
                status: actualData.status,
                message: actualData.message,
                progress: actualData.progress,
                fileUrl: actualData.fileUrl || prev.fileUrl,
                metadata: {
                  ...prev.metadata,
                  ...actualData.metadata,
                },
              };
            });

            if (FINAL_STATUSES.includes(actualData.status)) {
              console.log(
                "[SSE] Analysis completed with status:",
                actualData.status
              );
              if (actualData.status === "completed") {
                onAnalysisComplete?.();
              }
              setTimeout(() => {
                disconnectSSE();
              }, 2000);
            }
          }
        } catch (error) {
          console.warn("[SSE] Failed to parse analysis status event:", error);
        }
      }
    );

    return () => {
      unsubscribeAnalysisStatus();
    };
  }, [
    shouldConnectSSE,
    addEventListener,
    projectId,
    analysisType,
    disconnectSSE,
    onAnalysisComplete,
  ]);

  // Handle trigger analysis
  const handleTriggerAnalysis = useCallback(async () => {
    if (!projectId || !analysisType) return;

    try {
      setIsTriggering(true);
      setError(null);
      await triggerAnalysis(projectId, analysisType);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to trigger analysis";
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setIsTriggering(false);
    }
  }, [projectId, analysisType, onError]);

  // Handle retry function
  const handleRetry = useCallback(() => {
    dataFetchedRef.current = false;
    setError(null);
    setNoDataFound(false);
    setAnalysisData(null);
    window.location.reload();
  }, []);

  // Render status badge
  const renderStatusBadge = useMemo(() => {
    if (!analysisData) return null;

    const config =
      statusBadgeConfig[analysisData.status] || statusBadgeConfig.pending;
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <span
          className={`${config.styles} text-[10px] capitalize rounded-full px-2 py-[2px] flex items-center gap-1`}
        >
          <Icon
            className={
              analysisData?.status === "processing" ? "animate-spin" : ""
            }
            size={12}
          />
          <span>{config.label}</span>
          {analysisData.progress !== undefined && analysisData.progress > 0 && (
            <span className="ml-1">({analysisData.progress}%)</span>
          )}
        </span>
      </div>
    );
  }, [analysisData, statusBadgeConfig]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {analysisType} analysis...</p>
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
            No Analysis Found
          </h3>
          <p className="text-gray-600 mb-4">
            No {analysisType} analysis found for this project.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Project ID: {projectId}</p>
            <p>Analysis Type: {analysisType}</p>
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
            Error Loading Analysis
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Project ID: {projectId}</p>
            <p>Analysis Type: {analysisType}</p>
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

  if (!analysisData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No analysis data available</p>
        </div>
      </div>
    );
  }

  // Check if analysis needs to be started
  const needsAnalysis =
    analysisData.status === "not_started" || !analysisData.fileUrl;
  const isProcessing = ["pending", "processing"].includes(analysisData.status);
  const hasResults =
    analysisData.status === "completed" && analysisData.fileUrl;

  return (
    <div className="h-full max-md:h-[95%] flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col p-4 border-b bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-center gap-2">
            <FileSpreadsheet size={20} className="text-gray-400" />
            <div className="flex flex-col items-start justify-center">
              <h2 className="text-[14px] font-medium">{title}</h2>
              {renderStatusBadge}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Trigger/Re-trigger Analysis Button */}
            {(needsAnalysis || analysisData.isSourceFileChanged) && (
              <Button
                onClick={handleTriggerAnalysis}
                disabled={isTriggering || isProcessing}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  analysisData.isSourceFileChanged
                    ? "Source file has changed. Re-run analysis to get updated results."
                    : "Start Analysis"
                }
              >
                {isTriggering ? (
                  <FiRefreshCw size={14} className="animate-spin" />
                ) : analysisData.isSourceFileChanged ? (
                  <RotateCcw size={14} />
                ) : (
                  <Play size={14} />
                )}
                {analysisData.isSourceFileChanged ? "Re-run" : "Start"} Analysis
              </Button>
            )}

            {/* Download Results Button */}
            {hasResults && (
              <DownloadFile
                fileUrl={analysisData.fileUrl}
                fileName={analysisData.metadata?.fileName}
                isDisabled={isProcessing}
                onDownloadStart={() => console.log("Download started")}
                onDownloadComplete={() => console.log("Download completed")}
                onDownloadError={(error) =>
                  console.error("Download failed:", error)
                }
              />
            )}

            {/* Analysis Settings */}
            <AnalysisSettings />
          </div>
        </div>

        {/* File Change Warning */}
        {analysisData.isSourceFileChanged && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2">
              <FiAlertTriangle
                size={14}
                className="text-amber-600 mt-0.5 flex-shrink-0"
              />
              <div className="text-xs text-amber-800">
                <strong>Source file has been updated</strong> since the last
                analysis. Re-run the analysis to get results based on the latest
                data.
              </div>
            </div>
          </div>
        )}

        <p className="flex flex-wrap gap-2 text-[10px] text-gray-500 font-medium mt-2">
          {analysisData.lastAnalysisDate && (
            <span>
              Last Analysis:{" "}
              {new Date(analysisData.lastAnalysisDate).toLocaleDateString()}
            </span>
          )}

          {analysisData.metadata?.analysisParameters?.threshold && (
            <span>
              Threshold: {analysisData.metadata.analysisParameters.threshold}
            </span>
          )}
          {analysisData.metadata?.analysisParameters?.dateRange && (
            <span>
              Range: {analysisData.metadata.analysisParameters.dateRange}
            </span>
          )}
        </p>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-hidden overflow-x-hidden p-0">
        {needsAnalysis ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <Play size={48} className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analysis Not Started
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Start Analysis" to begin the {analysisType} analysis for
                this project.
              </p>
              <Button
                onClick={handleTriggerAnalysis}
                disabled={isTriggering}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {isTriggering ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-2" size={16} />
                    Starting Analysis...
                  </>
                ) : (
                  <>
                    <Play className="mr-2" size={16} />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analysis in Progress
              </h3>
              <p className="text-gray-600 mb-2">{analysisData.message}</p>
              {analysisData.progress !== undefined && (
                <div className="w-64 mx-auto">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisData.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {analysisData.progress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : hasResults ? (
          <ExcelViewer fileUrl={analysisData.fileUrl} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analysis Failed
              </h3>
              <p className="text-gray-600 mb-4">
                {analysisData.message || "The analysis could not be completed."}
              </p>
              <Button
                onClick={handleTriggerAnalysis}
                disabled={isTriggering}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Retry Analysis
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
