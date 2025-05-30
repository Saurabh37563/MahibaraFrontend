"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import SheetsPanel from "./sheets-panel";
import AnalysisPanel from "./analysis-panel";

// Remove the runtime z.enum and use a TypeScript type instead
type StatusEnum =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "uploaded";

type Item = {
  name: string;
  status: StatusEnum;
};

interface MobileSidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedTab: "sheets" | "analysis";
  setSelectedTab: (tab: "sheets" | "analysis") => void;
  sheets: Item[];
  analysis: Item[];
  selectedItem: { index: number; type: "sheet" | "analysis" } | null;
  onItemClick: (
    item: Record<string, unknown>,
    type: "sheet" | "analysis",
    index: number
  ) => void;
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
}

export default function MobileSidebar({
  sidebarOpen,
  toggleSidebar,
  selectedTab,
  setSelectedTab,
  sheets,
  analysis,
  selectedItem,
  onItemClick,
  statusDotColors,
  mapStatusToUI,
}: MobileSidebarProps) {
  return (
    <div
      className={`
        fixed inset-y-0 left-0
        w-[280px] max-w-[80vw]
        bg-white
        z-50
        overflow-hidden
        flex flex-col
        border-r border-gray-200
        shadow-xl
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-sm">Project Explorer</h2>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-xs font-medium ${
            selectedTab === "sheets"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("sheets")}
        >
          Sheets ({sheets.length})
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium ${
            selectedTab === "analysis"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("analysis")}
        >
          Analysis ({analysis.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedTab === "sheets" ? (
          <SheetsPanel
            sheets={sheets}
            selectedItem={selectedItem}
            onItemClick={onItemClick}
            statusDotColors={statusDotColors}
            mapStatusToUI={mapStatusToUI}
          />
        ) : (
          <AnalysisPanel
            analysis={analysis}
            selectedItem={selectedItem}
            onItemClick={onItemClick}
            statusDotColors={statusDotColors}
            onAnalysisCreate={() => {}} // Provide a no-op handler for mobile
            createdAnalysisTemplateIds={[]} // Provide an empty array for mobile
          />
        )}
      </div>
    </div>
  );
}
