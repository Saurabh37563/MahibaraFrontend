"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LuFileSpreadsheet } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import AnalysisView from "./analysis-view";
import SpreadSheetView from "./sheet-type-view";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
import axios from "axios";
import {
  BASE_TEMP_BACKEND_URL,
  FILE_UPLOAD_ENDPOINTS,
} from "@/constants/endpoints-constant";
import { useParams } from "next/navigation";

// Import the new components
import SheetsPanel from "./sheets-panel";
import AnalysisPanel from "./analysis-panel";
import MobileSidebar from "./mobile-sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
// Convert StatusEnum to a type and a union string literal
type StatusEnum =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "uploaded";

// Sample analysis data for reference

// Add this type definition above the Project component
type AnalysisPanelItem = {
  id?: string;
  name?: string;
  status?: string;
  summary?: string;
  templateId?: string;
  [x: string]: unknown;
};

// Add these type definitions at the top (after imports, before StatusEnum)
type Item = {
  id?: string;
  name?: string;
  status?: string;
  summary?: string;
  templateId?: string;
  [x: string]: unknown;
};

type SelectedItem = Item & {
  type: "sheet" | "analysis";
  index: number;
};

// Add this type for fetched analysis
type AnalysisAPIItem = {
  working_id: string;
  working_name: string;
  status: string;
};

// import type { Analysis } from "./create-analysis";
import type { Analysis } from "./create-analysis";

// Define a union type for all possible analysis-like objects
type AnalysisLike = Analysis | AnalysisPanelItem | AnalysisAPIItem;

// Helper to convert AnalysisPanelItem/AnalysisAPIItem to AnalysisItem (for AnalysisPanel)
const toAnalysisItem = (item: AnalysisLike): Analysis => ({
  working_id:
    (item as Analysis).working_id ?? (item as AnalysisPanelItem).id ?? "",
  working_name:
    (item as Analysis).working_name ?? (item as AnalysisPanelItem).name ?? "",
  status: item.status ?? "",
  // Add other fields if needed
});

export default function Project() {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [sheets, setSheets] = useState<Item[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisAPIItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<"sheets" | "analysis">(
    "sheets"
  );

  const params = useParams();
  const projectId = params?.id as string;

  const statusDotColors: Record<StatusEnum, string> = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-gray-400",
    uploaded: "bg-purple-500",
  };

  const mapStatusToUI = (status: string): StatusEnum => {
    switch (status.toLowerCase()) {
      case "validated":
      case "completed":
        return "success";
      case "pending":
        return "info";
      case "processing":
        return "warning";
      case "failed":
      case "error":
        return "danger";
      case "uploaded":
        return "uploaded";
      default:
        return "neutral";
    }
  };

  const handleError = (error: Error) => {
    console.error("Spreadsheet error:", error);
  };

  const handleFileLoad = (sheets: string[]) => {
    console.log("Loaded sheets:", sheets);
  };

  const handleDelete = () => {
    console.log("Delete requested");
  };

  // Fetch created analyses using react-query
  const { data: analysisData, isLoading: isAnalysisLoading } = useQuery<
    AnalysisAPIItem[]
  >({
    queryKey: ["projectAnalyses", projectId],
    queryFn: async () => {
      const response = await axios.get(
        BASE_TEMP_BACKEND_URL + `/api/v1/projects/get_analysis/${projectId}`
      );
      // Expecting response.data?.data to be AnalysisAPIItem[]
      return response.data?.data || [];
    },
    enabled: !!projectId,
  });

  // Keep local state in sync with react-query data
  useEffect(() => {
    if (Array.isArray(analysisData)) setAnalysis(analysisData);
  }, [analysisData]);

  // Mutation for updating analyses
  const saveProjectAnalyses = useMutation({
    mutationFn: async (selectedAnalyses: string[]) => {
      await axios.post(
        BASE_TEMP_BACKEND_URL + `/api/v1/projects/create_analysis/`,
        {
          project_id: projectId,
          working_id: selectedAnalyses, // array of analysis IDs
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectAnalyses", projectId],
      });
    },
  });

  // Handle analysis creation and removal
  const handleAnalysisCreate = (selectedAnalyses: Analysis[]): void => {
    // Only send array of IDs
    const analysisIds = selectedAnalyses
      .map((item) => item.working_id)
      .filter(Boolean) as string[];
    saveProjectAnalyses
      .mutateAsync(analysisIds)
      .then(() => {
        console.log(
          `Successfully updated analysis list with ${analysisIds.length} items`
        );
      })
      .catch((e) => {
        console.error("Failed to update analyses", e);
      });
  };

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // React Query for mapped sheets
  const {
    data: mappedSheets,
    isLoading: isSheetsLoading,
    refetch: refetchSheets,
  } = useQuery<Item[]>({
    queryKey: ["mappedSheets", projectId], // use projectId from params
    queryFn: async () => {
      const response = await axios.get(
        FILE_UPLOAD_ENDPOINTS?.getMappedSheetTypes + "/" + projectId // use projectId from params
      );
      return (response?.data?.data?.sheet_types as Item[]) || [];
    },
    enabled: !!projectId,
  });

  // Update sheets state when query data changes
  useEffect(() => {
    if (mappedSheets) setSheets(mappedSheets);
  }, [mappedSheets]);

  // Memoize fetchData to fix useEffect dependency warning
  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedItem?.type === "sheet") {
        // Remove unused columns and rows assignments
      } else {
        // Remove unused labels and values assignments
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedItem]); // Add selectedItem as dependency

  // Fetch data when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      fetchData();
    }
  }, [selectedItem, fetchData]); // Add fetchData to dependency array

  const handleItemClick = (
    item: Item,
    type: "sheet" | "analysis",
    index: number
  ): void => {
    setSelectedItem({
      ...item,
      type,
      index,
      status: item.status,
    });
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handler to clear selected item (sheet)
  const handleClearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Helper to normalize sheet objects for components that require name/status as string
  const normalizeSheet = (
    item: Item
  ): { name: string; status: StatusEnum } => ({
    name: item.name ?? "",
    status: mapStatusToUI(item.status ?? ""),
  });

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
        sheetType={selectedItem.name ?? ""} // Ensure string
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

  // Add this function inside the Project component
  const getCreatedAnalysisTemplateIds = (): string[] => {
    return analysis.map((a) => a.working_id);
  };

  // Update mobile sidebar props to include correct analysis data
  const mobileSidebarProps = {
    sidebarOpen,
    toggleSidebar,
    selectedTab,
    setSelectedTab,
    sheets: sheets.map(normalizeSheet),
    analysis: analysis.map(toAnalysisItem), // Map to correct format
    selectedItem,
    onItemClick: handleItemClick,
    statusDotColors,
    mapStatusToUI,
    onAnalysisCreate: handleAnalysisCreate, // Required prop
    createdAnalysisTemplateIds: getCreatedAnalysisTemplateIds(), // Required prop
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
                  sheets={sheets.map(normalizeSheet)} // Ensure correct type
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
                  analysis={analysis.map(toAnalysisItem)} // now Analysis[]
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
                    type: "sheet" | "analysis",
                    index: number
                  ) => {
                    if (type === "analysis") {
                      setSelectedItem({
                        ...item,
                        id: item.working_id,
                        name: item.working_name,
                        type,
                        index,
                        status: item.status,
                      });
                      if (isMobile) {
                        setSidebarOpen(false);
                      }
                    }
                    // If type is "sheet", do nothing (AnalysisPanel should never call with "sheet")
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
            <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden">
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
