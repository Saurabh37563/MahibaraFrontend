import React, { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import {
  AlertTriangle,
  Link2,
  Play,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ColumnMappingDialog from "./analysis-settings";
import { AnalysisApiResponse } from ".";

interface AnalysisStatusViewProps {
  analysisData: AnalysisApiResponse;
  projectId: string;
  analysisType: string;
  onTriggerAnalysis: () => void;
  isTriggering: boolean;
  onRerunAnalysis?: () => void;
  rerunLoading?: boolean;
}

const AnalysisStatusView: React.FC<AnalysisStatusViewProps> = ({
  analysisData,
  projectId,
  analysisType,
  onTriggerAnalysis,
  isTriggering,
  onRerunAnalysis,
  rerunLoading,
}) => {
  const [columnMappingDialogOpen, setColumnMappingDialogOpen] = useState(false);

  // Not mapped state
  if (analysisData.fileMappingStatus === false) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <Link2 size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Source File Not Mapped
          </h3>
          <p className="text-gray-600 mb-4">
            No source file is mapped to this analysis. Please map a source file
            to proceed.
          </p>
          {/* <ColumnMappingDialog
            projectId={projectId}
            analysisType={analysisType}
            open={columnMappingDialogOpen}
            setOpen={setColumnMappingDialogOpen}
          >
            <Button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => setColumnMappingDialogOpen(true)}
            >
              Map Source File
            </Button>
          </ColumnMappingDialog> */}
        </div>
      </div>
    );
  }

  // Column mapping required but file mapping is true
  if (
    analysisData.fileMappingStatus === true &&
    analysisData.isColumnMapped === false
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Column Mapping Required
          </h3>
          <p className="text-gray-600 mb-4">
            File mapping is complete, but columns must be mapped before analysis
            can start.
          </p>
          <ColumnMappingDialog
            projectId={projectId}
            analysisType={analysisType}
            open={columnMappingDialogOpen}
            setOpen={setColumnMappingDialogOpen}
          >
            <Button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => setColumnMappingDialogOpen(true)}
            >
              Map Columns
            </Button>
          </ColumnMappingDialog>
        </div>
      </div>
    );
  }

  // Processing state (unified with sheet-type view)
  if (["pending", "processing", "running"].includes(analysisData.status)) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white p-6">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="mt-8 flex flex-col items-center">
            <FileSpreadsheet className="h-16 w-16 text-gray-200 mb-3" />
            <p className="text-xs text-gray-400">
              Your analysis will be available when processing completes
            </p>
          </div>
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">
                Processing
              </span>
              <span className="text-sm font-medium text-emerald-800">
                {analysisData.progress || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-emerald-800 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, analysisData.progress || 0)
                  )}%`,
                }}
              />
            </div>
          </div>
          {/* {analysisData.stage && (
            <div className="flex items-center gap-2 mb-3 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm">{analysisData.stage}</span>
            </div>
          )} */}
          {analysisData.message && (
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {analysisData.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Failed state
  if (analysisData.status === "failed") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analysis Failed
          </h3>
          <p className="text-gray-600 mb-4">
            {analysisData.message || "The analysis could not be completed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onTriggerAnalysis}
              disabled={isTriggering}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isTriggering ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" size={16} />
                  Retrying...
                </>
              ) : (
                "Retry Analysis"
              )}
            </Button>
            {onRerunAnalysis && (
              <Button
                onClick={onRerunAnalysis}
                disabled={rerunLoading}
                className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 disabled:opacity-50"
              >
                {rerunLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-2" size={16} />
                    Re-running...
                  </>
                ) : (
                  "Re-run Analysis"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Draft/Not started states
  if (["draft", "not_started"].includes(analysisData.status)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <Play size={48} className="text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analysis Not Started
          </h3>
          <p className="text-gray-600 mb-4">
            {analysisData.status === "draft"
              ? `Click "Start Analysis" to begin the ${analysisType} analysis for this project.`
              : 'This analysis has never been run before. Click "Start Analysis" to begin.'}
          </p>
          <Button
            onClick={onTriggerAnalysis}
            disabled={isTriggering}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
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
    );
  }

  // Fallback for unknown states
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Unknown Status
        </h3>
        <p className="text-gray-600 mb-4">
          Analysis status: {analysisData.status}
        </p>
        <Button
          onClick={onTriggerAnalysis}
          disabled={isTriggering}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
};

export default AnalysisStatusView;
