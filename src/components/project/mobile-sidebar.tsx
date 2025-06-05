"use client";

import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import React from "react";

// Status types and color mapping
type StatusEnum =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "uploaded";

type Analysis = {
  working_id: string;
  working_name: string;
  status: string;
  // Add other fields if needed
};

type Item = {
  name: string;
  status: StatusEnum;
  // ...other fields if needed
};

interface MobileSidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedTab: "sheets" | "analysis";
  setSelectedTab: (tab: "sheets" | "analysis") => void;
  sheets: Item[];
  analysis: Analysis[]; // changed from Record<string, unknown>[]
  selectedItem: { index: number; type: "sheet" | "analysis" } | null;
  onItemClick: (
    item: Item | Analysis, // changed from Record<string, unknown>
    type: "sheet" | "analysis",
    index: number
  ) => void;
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
  onAnalysisCreate?: (selectedAnalyses: Analysis[]) => void; // changed from Record<string, unknown>[]
  createdAnalysisTemplateIds?: string[];
}

// SheetsPanel component
function SheetsPanel({
  sheets,
  selectedItem,
  onItemClick,
  statusDotColors,
  mapStatusToUI,
}: {
  sheets: Item[];
  selectedItem: { index: number; type: "sheet" | "analysis" } | null;
  onItemClick: (item: Item, type: "sheet", index: number) => void;
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
}) {
  return (
    <div className="overflow-y-auto h-full">
      {sheets.length === 0 ? (
        <div className="text-xs text-gray-400 p-4">No sheets found.</div>
      ) : (
        <ul>
          {sheets.map((sheet, idx) => (
            <li
              key={sheet.name + idx}
              className={`flex items-center px-4 py-2 cursor-pointer ${
                selectedItem?.type === "sheet" && selectedItem?.index === idx
                  ? "bg-gray-100"
                  : ""
              }`}
              onClick={() => onItemClick(sheet, "sheet", idx)}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  statusDotColors[mapStatusToUI(sheet.status)]
                }`}
              />
              <span className="truncate text-xs">{sheet.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// AnalysisPanel component
function AnalysisPanel({
  analysis,
  selectedItem,
  onItemClick,
  statusDotColors,
  onAnalysisCreate,
  createdAnalysisTemplateIds,
}: {
  analysis: Analysis[]; // changed from Record<string, unknown>[]
  selectedItem: { index: number; type: "sheet" | "analysis" } | null;
  onItemClick: (item: Analysis, type: "analysis", index: number) => void;
  statusDotColors: Record<StatusEnum, string>;
  onAnalysisCreate?: (selectedAnalyses: Analysis[]) => void; // changed from Record<string, unknown>[]
  createdAnalysisTemplateIds?: string[];
}) {
  return (
    <div className="overflow-y-auto h-full">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-medium">Analysis</span>
        {onAnalysisCreate && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAnalysisCreate(analysis)}
            title="Create Analysis"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {analysis.length === 0 ? (
        <div className="text-xs text-gray-400 p-4">No analysis found.</div>
      ) : (
        <ul>
          {analysis.map((item, idx) => (
            <li
              key={String(item.working_id ?? item.working_name ?? idx)}
              className={`flex items-center px-4 py-2 cursor-pointer ${
                selectedItem?.type === "analysis" && selectedItem?.index === idx
                  ? "bg-gray-100"
                  : ""
              }`}
              onClick={() => onItemClick(item, "analysis", idx)}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  statusDotColors[(item.status as StatusEnum) || "neutral"]
                }`}
              />
              <span className="truncate text-xs">
                {String(item.working_name ?? "")}
              </span>
              {createdAnalysisTemplateIds &&
                createdAnalysisTemplateIds.includes(
                  String(item.working_id ?? item.working_name ?? "")
                ) && (
                  <span className="ml-2 text-[10px] text-green-500 font-semibold">
                    New
                  </span>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
  onAnalysisCreate,
  createdAnalysisTemplateIds = [],
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
            onAnalysisCreate={onAnalysisCreate}
            createdAnalysisTemplateIds={createdAnalysisTemplateIds}
          />
        )}
      </div>
    </div>
  );
}
