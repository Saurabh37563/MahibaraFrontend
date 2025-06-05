import React, { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { AlertTriangle, Link2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ColumnMappingDialog from "./analysis-settings";
import { AnalysisApiResponse } from ".";

interface AnalysisStatusViewProps {
  analysisData: AnalysisApiResponse;
  projectId: string;
  analysisType: string;
  onTriggerAnalysis: () => void;
  isTriggering: boolean;
}

const AnalysisStatusView: React.FC<AnalysisStatusViewProps> = ({
  analysisData,
  projectId,
  analysisType,
  onTriggerAnalysis,
  isTriggering,
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
              Map Source File
            </Button>
          </ColumnMappingDialog>
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

  // Processing state
  if (["pending", "processing"].includes(analysisData.status)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analysis in Progress
          </h3>
          <p className="text-gray-600 mb-2">
            {analysisData.message || "Processing your analysis..."}
          </p>
          {analysisData.progress !== undefined && analysisData.progress > 0 && (
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
