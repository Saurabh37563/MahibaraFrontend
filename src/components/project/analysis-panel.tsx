"use client";

import { LuChartPie } from "react-icons/lu";
import { AnalysisSelectionModal } from "./create-analysis";
import { useProject } from "@/contexts/project-context";
import type { Analysis } from "./create-analysis";

type StatusEnum =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "uploaded";

interface SelectedItem {
  index: number;
  type: "sheet" | "analysis";
}

interface AnalysisPanelProps {
  analysis: Analysis[];
  selectedItem: SelectedItem | null;
  onItemClick: (
    item: Analysis,
    type: "sheet" | "analysis",
    index: number
  ) => void;
  statusDotColors: Record<StatusEnum, string>;
  onAnalysisCreate: (selectedAnalyses: Analysis[]) => void;
  createdAnalysisTemplateIds: string[];
}

export default function AnalysisPanel({
  analysis,
  selectedItem,
  onItemClick,
  statusDotColors,
  onAnalysisCreate,
  createdAnalysisTemplateIds,
}: AnalysisPanelProps) {
  const { isAnalysisLoading, mapStatusToUI } = useProject(); // <-- get mapStatusToUI

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
        <div className="text-xs flex items-center gap-1">
          <span>Analysis</span>
          <span className="text-[12px] mt-[2px] text-muted-foreground">
            ({analysis.length})
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <AnalysisSelectionModal
            onAnalysisCreate={onAnalysisCreate}
            createdAnalysisTemplateIds={createdAnalysisTemplateIds}
          />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto py-4 px-2 flex-1">
        {isAnalysisLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-8 w-full rounded"
              />
            ))}
          </div>
        ) : analysis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <LuChartPie className="text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-sm mb-2">
              No analysis created yet
            </p>
            <p className="text-gray-400 text-xs">
              Click the + button to add your first analysis
            </p>
          </div>
        ) : (
          analysis.map((item, index) => {
            const statusKey = mapStatusToUI(item.status ?? "");
            return (
              <div
                key={`analysis-${item.working_id ?? index}`}
                className={`flex group items-center justify-between rounded-md p-2 hover:bg-slate-50 cursor-pointer ${
                  selectedItem?.index === index &&
                  selectedItem?.type === "analysis"
                    ? "bg-green-500/10 border-l-4 border-primary"
                    : ""
                }`}
                onClick={() => onItemClick(item, "analysis", index)}
              >
                <div className="text-xs flex items-center gap-2">
                  <LuChartPie className="text-gray-400" />
                  <span className="text-gray-950">{item.working_name}</span>
                  <span
                    className={`size-[6px] rounded-full ${
                      statusDotColors[statusKey] || "bg-gray-300"
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
