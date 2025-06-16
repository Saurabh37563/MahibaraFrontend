"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";
import FileUploadMapping from "./file-upload";
import { AnalysisSelectionModal } from "./create-analysis";
import { useProject } from "@/contexts/project-context";
import type {
  MobileSidebarProps,
  SheetItem,
  StatusEnum,
  SelectedItem,
} from "@/types/project-types";
import { Analysis } from "@/types/project-types";

function SheetsPanel({
  sheets,
  selectedItem,
  onItemClick,
  statusDotColors,
  mapStatusToUI,
  refetchSheets,
  clearSelectedSheet,
}: {
  sheets: SheetItem[];
  selectedItem: SelectedItem | null;
  onItemClick: (item: SheetItem, type: "sheet", index: number) => void;
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
  refetchSheets?: () => void;
  clearSelectedSheet?: () => void;
}) {
  const { isSheetsLoading } = useProject();

  return (
    <div className="overflow-y-auto h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs font-medium">Source Files</span>
        <div className="flex gap-2">
          <FileUploadMapping
            refetchSheets={refetchSheets}
            clearSelectedSheet={clearSelectedSheet}
          />
        </div>
      </div>
      {isSheetsLoading ? (
        <div className="p-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-8 w-full rounded mb-2"
            />
          ))}
        </div>
      ) : sheets.length === 0 ? (
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

function AnalysisPanel({
  analysis,
  selectedItem,
  onItemClick,
  statusDotColors,
  onAnalysisCreate,
  createdAnalysisTemplateIds = [], // Provide default empty array
}: {
  analysis: Analysis[];
  selectedItem: { index: number; type: "sheet" | "analysis" } | null;
  onItemClick: (item: Analysis, type: "analysis", index: number) => void;
  statusDotColors: Record<StatusEnum, string>;
  onAnalysisCreate: (selectedAnalyses: Analysis[]) => void; // Remove optional
  createdAnalysisTemplateIds: string[]; // Remove optional
}) {
  const { isAnalysisLoading } = useProject();

  return (
    <div className="overflow-y-auto h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs font-medium">Analysis</span>
        <div className="flex gap-2">
          <AnalysisSelectionModal
            onAnalysisCreate={onAnalysisCreate}
            createdAnalysisTemplateIds={createdAnalysisTemplateIds}
          />
        </div>
      </div>
      {isAnalysisLoading ? (
        <div className="p-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-8 w-full rounded mb-2"
            />
          ))}
        </div>
      ) : analysis.length === 0 ? (
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
  createdAnalysisTemplateIds,
  refetchSheets,
  clearSelectedSheet,
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
            refetchSheets={refetchSheets}
            clearSelectedSheet={clearSelectedSheet}
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
