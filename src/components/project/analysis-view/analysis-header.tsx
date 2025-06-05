import React, { useMemo, useState } from "react";
import { FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Clock,
  Play,
  RotateCcw,
  Link2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalysisSettings from "./analysis-settings";
import { AnalysisApiResponse } from ".";

interface AnalysisHeaderProps {
  title: string;
  analysisData?: AnalysisApiResponse;
  isLoading: boolean;
  isTriggering: boolean;
  isProcessing: boolean;
  hasResults: boolean;
  projectId: string;
  analysisType: string;
  onTriggerAnalysis: () => void;
  onDownload: () => void;
  downloadLoading: boolean;
  triggerLoading: boolean;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  title,
  analysisData,
  isLoading,
  isTriggering,
  isProcessing,
  hasResults,
  projectId,
  analysisType,
  onTriggerAnalysis,
  onDownload,
  downloadLoading,
  triggerLoading,
}) => {
  const [columnMappingDialogOpen, setColumnMappingDialogOpen] = useState(false);

  const statusBadgeConfig = useMemo(
    () => ({
      not_started: {
        icon: Clock,
        styles: "text-gray-800 bg-gray-100",
        label: "Not Started",
      },
      draft: {
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
      not_mapped: {
        icon: Link2,
        styles: "text-gray-800 bg-gray-100",
        label: "Not Mapped",
      },
    }),
    []
  );

  const renderStatusBadge = useMemo(() => {
    if (!analysisData || isLoading) return null;

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
  }, [analysisData, statusBadgeConfig, isLoading]);

  const showSourceFileChanged = useMemo(
    () =>
      !!analysisData?.isSourceFileChanged &&
      ["completed", "failed"].includes(analysisData.status),
    [analysisData]
  );

  const showRetriggerButton = useMemo(
    () => showSourceFileChanged || analysisData?.status === "failed",
    [showSourceFileChanged, analysisData?.status]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col p-4 border-b bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-gray-400" />
            <div className="flex flex-col items-start">
              <h2 className="text-[14px] font-medium">{title}</h2>
              <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 border-b bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-gray-400" />
          <div className="flex flex-col items-start">
            <h2 className="text-[14px] font-medium">{title}</h2>
            {renderStatusBadge}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Trigger/Re-trigger Analysis Button */}
          {showRetriggerButton && (
            <Button
              onClick={onTriggerAnalysis}
              disabled={isTriggering || isProcessing || triggerLoading}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={
                showSourceFileChanged
                  ? "Source file has changed. Re-run analysis to get updated results."
                  : "Retry Analysis"
              }
            >
              {isTriggering || triggerLoading ? (
                <FiRefreshCw size={14} className="animate-spin" />
              ) : showSourceFileChanged ? (
                <RotateCcw size={14} />
              ) : (
                <Play size={14} />
              )}
              {showSourceFileChanged ? "Re-run" : "Retry"} Analysis
            </Button>
          )}

          {/* Download Results Button */}
          {hasResults && (
            <Button
              onClick={onDownload}
              disabled={isProcessing || downloadLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Download and reload analysis result"
            >
              {downloadLoading ? (
                <FiRefreshCw size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
            </Button>
          )}

          {/* Analysis Settings */}
          <AnalysisSettings
            projectId={projectId}
            analysisType={analysisType}
            open={columnMappingDialogOpen}
            setOpen={setColumnMappingDialogOpen}
          >
            {/* No custom trigger, so pass nothing or null as children */}
            {null}
          </AnalysisSettings>
        </div>
      </div>

      {/* File Change Warning */}
      {showSourceFileChanged && (
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

      {/* Analysis Info */}
      {analysisData && (
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
          {analysisData.metadata?.sourceFileName && (
            <span>Source File: {analysisData.metadata.sourceFileName}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default AnalysisHeader;
