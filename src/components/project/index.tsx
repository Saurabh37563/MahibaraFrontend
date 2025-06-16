"use client";

import { useEffect, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LuFileSpreadsheet } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import AnalysisView from "./analysis-view";
import SpreadSheetView from "./source-files-view";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";

// Import the new components
import SheetsPanel from "./sheets-panel";
import AnalysisPanel from "./analysis-panel";
import MobileSidebar from "./mobile-sidebar";
import { ProjectProvider, useProject } from "@/contexts/project-context";
import type { Analysis, SheetItem } from "@/types/project-types";

// Extract the main content to a separate component that uses the context
function ProjectContent() {
  const {
    selectedItem,
    sheets,
    analysis,
    loading,
    isMobile,
    sidebarOpen,
    selectedTab,
    setLoading,
    setSelectedTab,
    toggleSidebar,
    handleClearSelection,
    handleItemClick,
    handleAnalysisCreate,
    isSheetsLoading,
    isAnalysisLoading,
    refetchSheets,
    statusDotColors,
    mapStatusToUI,
    normalizeSheet,
    toAnalysisItem,
    getCreatedAnalysisTemplateIds,
  } = useProject();

  // Memoize fetchData to fix useEffect dependency warning
  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Data fetching logic if needed
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Fetch data when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      fetchData();
    }
  }, [selectedItem, fetchData]);

  const handleError = (error: Error) => {
    console.error("Spreadsheet error:", error);
  };

  const handleFileLoad = (sheets: string[]) => {
    console.log("Loaded sheets:", sheets);
  };

  const handleDelete = () => {
    console.log("Delete requested");
  };

  // Type guard for objects with working_id
  function hasWorkingId(obj: unknown): obj is { working_id: string } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "working_id" in obj &&
      typeof (obj as { working_id: unknown }).working_id === "string"
    );
  }

  // Content component for consistency
  const renderContent = () => {
    if (!selectedItem) {
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-sm p-4 w-fit text-gray-400 z-20 flex flex-col items-center justify-center">
          <LuFileSpreadsheet size={40} className="mb-4" />
          <p className="text-gray-500 text-sm text-center">
            Select a sheet or analysis to view details
          </p>
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4 mr-2" />
              <span className="text-xs">Open Explorer</span>
            </Button>
          )}
        </div>
      );
    }

    if (loading || isAnalysisLoading) {
      return (
        <div className={`${isMobile ? "p-4" : "p-6"} h-full`}>
          <Skeleton className="h-8 w-1/2 mb-6" />
          <div
            className={
              isMobile ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-2 gap-6"
            }
          >
            <Skeleton className={isMobile ? "h-60 w-full" : "h-80 w-full"} />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className={isMobile ? "h-20 w-full" : "h-24 w-full"} />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              {!isMobile && (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return selectedItem.type === "sheet" ? (
      <SpreadSheetView
        title="Financial Data"
        sheetType={selectedItem.name ?? ""}
        onClearSelection={handleClearSelection}
        onError={handleError}
        onFileLoad={handleFileLoad}
        onDelete={handleDelete}
      />
    ) : (
      <AnalysisView
        title={selectedItem.name ?? "Analysis"}
        analysisType={
          hasWorkingId(selectedItem)
            ? selectedItem.working_id
            : selectedItem.id ?? ""
        }
        onError={(error) => console.error(error)}
        onAnalysisComplete={() => console.log("Analysis completed")}
      />
    );
  };

  // Update mobile sidebar props
  const mobileSidebarProps = {
    sidebarOpen,
    toggleSidebar,
    selectedTab,
    setSelectedTab,
    sheets: sheets.map(normalizeSheet),
    analysis: analysis.map(toAnalysisItem),
    selectedItem,
    onItemClick: handleItemClick as (
      item: Analysis | SheetItem,
      type: "sheet" | "analysis",
      index: number
    ) => void,
    statusDotColors,
    mapStatusToUI,
    onAnalysisCreate: handleAnalysisCreate,
    createdAnalysisTemplateIds: getCreatedAnalysisTemplateIds(),
  };

  // Main render
  return (
    <div className="h-[calc(100dvh-65px)] w-full relative">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <MobileSidebar
          {...mobileSidebarProps}
          onAnalysisCreate={handleAnalysisCreate}
          refetchSheets={refetchSheets}
          clearSelectedSheet={handleClearSelection}
        />
      )}

      {/* Desktop layout */}
      {!isMobile ? (
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          <ResizablePanel defaultSize={25}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50}>
                <SheetsPanel
                  sheets={sheets.map(normalizeSheet)}
                  selectedItem={selectedItem}
                  onItemClick={handleItemClick}
                  statusDotColors={statusDotColors}
                  mapStatusToUI={mapStatusToUI}
                  isLoading={isSheetsLoading}
                  refetchSheets={refetchSheets}
                  clearSelectedSheet={handleClearSelection}
                />
              </ResizablePanel>
              <ResizableHandle className="resize-handle" />
              <ResizablePanel defaultSize={50}>
                <AnalysisPanel
                  analysis={analysis.map(toAnalysisItem)}
                  selectedItem={
                    selectedItem?.type === "analysis"
                      ? {
                          index: selectedItem.index,
                          type: "analysis",
                        }
                      : null
                  }
                  onItemClick={(
                    item: Analysis,
                    type: "analysis",
                    index: number
                  ) => {
                    handleItemClick(item, type, index);
                  }}
                  statusDotColors={statusDotColors}
                  onAnalysisCreate={handleAnalysisCreate}
                  createdAnalysisTemplateIds={getCreatedAnalysisTemplateIds()}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle className="resize-handle" />
          <ResizablePanel defaultSize={75}>
            {/* Content Area */}
            <div className="relative h-full w-full  dark:bg-black overflow-hidden">
              <div className="absolute inset-0 [background-size:20px_20px] [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]" />
              <div className="pointer-events-none absolute inset-0 bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
              <div className="relative z-10 h-full">{renderContent()}</div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // Mobile content view
        <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden">
          <div className="absolute inset-0 [background-size:20px_20px] [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]" />
          <div className="pointer-events-none absolute inset-0 bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="relative z-10 h-full">
            {!sidebarOpen && selectedItem && (
              <div className="w-full pt-2 pl-2">
                <Button
                  variant="outline"
                  className="py-4 h-8 w-8 rounded-full p-0"
                  onClick={toggleSidebar}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Project component with provider
export default function Project() {
  return (
    <ProjectProvider>
      <ProjectContent />
    </ProjectProvider>
  );
}
