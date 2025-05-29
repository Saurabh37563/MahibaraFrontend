"use client";

import { MdOutlineFileDownload } from "react-icons/md";
import { LuChartPie } from "react-icons/lu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { AnalysisSelectionModal } from "./create-analysis";
import { z } from "zod";

// Define Zod schemas
const StatusEnum = z.enum([
  "success",
  "warning",
  "danger",
  "info",
  "neutral",
  "uploaded",
]);

const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: StatusEnum,
  summary: z.string().optional(),
  templateId: z.string().optional(), // Add templateId to track original template
});

type Item = z.infer<typeof ItemSchema>;

interface AnalysisPanelProps {
  analysis: Item[];
  selectedItem: any;
  onItemClick: (item: Item, type: "sheet" | "analysis", index: number) => void;
  statusDotColors: Record<z.infer<typeof StatusEnum>, string>;
  onAnalysisCreate: (selectedAnalysisIds: string[]) => void;
  createdAnalysisTemplateIds: string[]; // Track which template IDs have been used
}

export default function AnalysisPanel({
  analysis,
  selectedItem,
  onItemClick,
  statusDotColors,
  onAnalysisCreate,
  createdAnalysisTemplateIds,
}: AnalysisPanelProps) {
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
        {analysis.length === 0 ? (
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
          analysis.map((item, index) => (
            <div
              key={`analysis-${item.id}`}
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
                <span className="text-gray-950">{item.name}</span>
                <span
                  className={`size-[6px] rounded-full ${
                    statusDotColors[item.status] || "bg-gray-300"
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
