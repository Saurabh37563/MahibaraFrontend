"use client";

import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LuFileSpreadsheet } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import AnalysisView from "./analysis-view";
import SpreadSheetView from "./sheet-type-view";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
import axios from "axios";
import { FILE_UPLOAD_ENDPOINTS } from "@/constants/endpoints-constant";

// Import the new components
import SheetsPanel from "./sheets-panel";
import AnalysisPanel from "./analysis-panel";
import MobileSidebar from "./mobile-sidebar";

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
  name: z.string(),
  status: StatusEnum,
});

const SpreadsheetColumnSchema = z.object({
  key: z.string(),
  name: z.string(),
  width: z.number(),
});

const SpreadsheetRowSchema = z.object({
  id: z.number(),
  reference: z.string(),
  date: z.string(),
  vendor: z.string(),
  amount: z.string(),
  status: z.string(),
});

const SpreadsheetDataSchema = z.object({
  lastModified: z.string(),
  size: z.string(),
  records: z.number(),
  columns: z.array(SpreadsheetColumnSchema),
  rows: z.array(SpreadsheetRowSchema),
  status: z.enum(["validated", "pending", "error"]),
});

const AnalysisDataSchema = z.object({
  status: z.enum(["completed", "running", "deleted"]),
  threshold: z.string(),
  dateRange: z.string(),
  chartType: z.enum(["bar", "line", "pie"]),
  labels: z.array(z.string()),
  values: z.array(z.number()),
  summary: z.string(),
  keyPoints: z.array(z.string()),
});

// Types
type Item = z.infer<typeof ItemSchema>;
type SelectedItem = Item & {
  type: "sheet" | "analysis";
  index: number;
  status: string;
};

type SpreadsheetData = z.infer<typeof SpreadsheetDataSchema>;
type AnalysisData = z.infer<typeof AnalysisDataSchema>;
type DataType = SpreadsheetData | AnalysisData | null;

// Sample analysis data for reference
const analysisTemplates = [
  {
    id: "a1",
    name: "Credit Risk",
    summary: "Assess credit risk exposure across portfolio",
  },
  {
    id: "a2",
    name: "Market Risk",
    summary: "Analyze market volatility and potential impacts",
  },
  {
    id: "a3",
    name: "Operational Risk",
    summary: "Evaluate operational processes and risk factors",
  },
  {
    id: "a4",
    name: "ROI Analysis",
    summary: "Calculate return on investment across projects",
  },
  {
    id: "a5",
    name: "Profit Margin Analysis",
    summary: "Track profit margins by product and service",
  },
  {
    id: "a6",
    name: "Liquidity Analysis",
    summary: "Monitor cash flow and liquidity positions",
  },
  {
    id: "a7",
    name: "SWOT Analysis",
    summary: "Strengths, weaknesses, opportunities, and threats assessment",
  },
  {
    id: "a8",
    name: "Porter's Five Forces",
    summary: "Industry competitiveness analysis framework",
  },
  {
    id: "a9",
    name: "Market Share Analysis",
    summary: "Track market positioning and share trends",
  },
  {
    id: "a10",
    name: "Demographic Analysis",
    summary: "Customer demographic patterns and trends",
  },
  {
    id: "a11",
    name: "Behavior Analysis",
    summary: "Customer behavior and purchasing patterns",
  },
  {
    id: "a12",
    name: "Satisfaction Survey",
    summary: "Customer satisfaction metrics and feedback",
  },
  {
    id: "a13",
    name: "Growth Opportunities",
    summary: "Identify and evaluate growth opportunities",
  },
  {
    id: "a14",
    name: "Partnership Analysis",
    summary: "Assess potential partnerships and alliances",
  },
  {
    id: "a15",
    name: "Expansion Strategy",
    summary: "Geographic and market expansion planning",
  },
  {
    id: "a16",
    name: "Budget Analysis",
    summary: "Budget allocation and optimization analysis",
  },
  {
    id: "a17",
    name: "Personnel Distribution",
    summary: "Human resource allocation and planning",
  },
  {
    id: "a18",
    name: "Asset Utilization",
    summary: "Asset efficiency and utilization metrics",
  },
];

export default function Project() {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [sheets, setSheets] = useState<Item[]>([]);
  const [analysis, setAnalysis] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DataType>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<"sheets" | "analysis">(
    "sheets"
  );

  const statusDotColors: Record<z.infer<typeof StatusEnum>, string> = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-gray-400",
    uploaded: "bg-purple-500",
  };

  const mapStatusToUI = (status: string): z.infer<typeof StatusEnum> => {
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

  // Get list of template IDs that have already been used to create analyses
  const getCreatedAnalysisTemplateIds = (): string[] => {
    return analysis
      .map((item) => item.templateId)
      .filter((id): id is string => id !== undefined);
  };

  // Only showing the updated handleAnalysisCreate function - rest of the file remains the same

  // Handle analysis creation and removal
  const handleAnalysisCreate = (selectedAnalysisIds: string[]) => {
    console.log("Updating analyses with IDs:", selectedAnalysisIds);

    // Get the analysis details from the templates for new analyses
    const newAnalyses: Item[] = selectedAnalysisIds.map((id) => {
      const template = analysisTemplates.find((t) => t.id === id);
      if (template) {
        return {
          id: `user-${id}-${Date.now()}`, // Create unique ID for user's analysis
          name: template.name,
          status: "info" as const, // New analysis starts as "info" (pending)
          summary: template.summary,
          templateId: id, // Store the original template ID
        };
      }
      return {
        id: `unknown-${Date.now()}`,
        name: "Unknown Analysis",
        status: "neutral" as const,
        summary: "Analysis template not found",
        templateId: id,
      };
    });

    // Replace the entire analysis list with the new selection
    // This handles both adding new analyses and removing unselected ones
    setAnalysis(newAnalyses);

    console.log(
      `Successfully updated analysis list with ${newAnalyses.length} items`
    );
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

  // Fetch mapped sheets
  const getMappedSheetForProject = async () => {
    try {
      const response = await axios.get(
        FILE_UPLOAD_ENDPOINTS?.getMappedSheetTypes + "/38"
      );
      const sheetsData = response?.data?.data?.sheet_types as Item[];
      setSheets(sheetsData);
    } catch (error) {
      console.error("Error fetching mapped sheets:", error);
      setSheets([]);
    }
  };

  useEffect(() => {
    getMappedSheetForProject();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      fetchData();
    }
  }, [selectedItem]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedItem?.type === "sheet") {
        const columns = [
          { key: "id", name: "ID", width: 100 },
          { key: "reference", name: "Reference", width: 165 },
          { key: "date", name: "Date", width: 165 },
          { key: "vendor", name: "Vendor", width: 165 },
          { key: "amount", name: "Amount", width: 165 },
          { key: "status", name: "Status", width: 165 },
        ];

        const rows = Array(10000)
          .fill(0)
          .map((_, i) => ({
            id: i + 1,
            reference: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
            date: new Date(
              Date.now() - Math.random() * 10000000000
            ).toLocaleDateString(),
            vendor: [
              "ABC Corp",
              "XYZ Ltd",
              "Global Solutions",
              "Tech Innovations",
            ][Math.floor(Math.random() * 4)],
            amount: `$${(1000 + Math.random() * 9000).toFixed(2)}`,
            status: ["Pending", "Approved", "Rejected", "In Progress"][
              Math.floor(Math.random() * 4)
            ],
          }));

        const fileStatuses = ["validated", "pending", "error"] as const;
        const randomStatus =
          fileStatuses[Math.floor(Math.random() * fileStatuses.length)];

        const sheetData = {
          lastModified: "Jan 15, 2024",
          size: "2.4 MB",
          records: 234,
          columns,
          rows,
          status: randomStatus,
        };

        const validatedData = SpreadsheetDataSchema.parse(sheetData);
        setData(validatedData);
      } else {
        const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const values = Array(6)
          .fill(0)
          .map(() => Math.floor(Math.random() * 100));

        const chartTypes = ["bar", "line", "pie"] as const;
        const analysisStatuses = ["completed", "running", "deleted"] as const;

        const analysisData = {
          status: analysisStatuses[Math.floor(Math.random() * 3)],
          threshold: "20%",
          dateRange: "Q3 2024",
          chartType: chartTypes[Math.floor(Math.random() * 3)],
          labels,
          values,
          summary: `This analysis shows the distribution of ${selectedItem?.name} across different periods.`,
          keyPoints: [
            "Point 1: Significant increase in Q2",
            "Point 2: ABC Corp is the top vendor",
            "Point 3: 80% of purchases come from 20% of vendors",
          ],
        };

        const validatedData = AnalysisDataSchema.parse(analysisData);
        setData(validatedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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

    if (loading) {
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
        sheetType="financial-data"
        onError={handleError}
        onFileLoad={handleFileLoad}
        onDelete={handleDelete}
      />
    ) : (
      <AnalysisView
        title="Financial Analysis"
        analysisType="financial-analysis"
        onError={(error) => console.error(error)}
        onAnalysisComplete={() => console.log("Analysis completed")}
      />
    );
  };

  // Update mobile sidebar props to include analysis
  const mobileSidebarProps = {
    sidebarOpen,
    toggleSidebar,
    selectedTab,
    setSelectedTab,
    sheets,
    analysis, // Add analysis to mobile sidebar
    selectedItem,
    onItemClick: handleItemClick,
    statusDotColors,
    mapStatusToUI,
    onAnalysisCreate: handleAnalysisCreate, // Add analysis creation handler
    createdAnalysisTemplateIds: getCreatedAnalysisTemplateIds(), // Add created template IDs
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
      {isMobile && <MobileSidebar {...mobileSidebarProps} />}

      {/* Desktop layout */}
      {!isMobile ? (
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          <ResizablePanel defaultSize={25}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50}>
                <SheetsPanel
                  sheets={sheets}
                  selectedItem={selectedItem}
                  onItemClick={handleItemClick}
                  statusDotColors={statusDotColors}
                  mapStatusToUI={mapStatusToUI}
                />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={50}>
                <AnalysisPanel
                  analysis={analysis}
                  selectedItem={selectedItem}
                  onItemClick={handleItemClick}
                  statusDotColors={statusDotColors}
                  onAnalysisCreate={handleAnalysisCreate}
                  createdAnalysisTemplateIds={getCreatedAnalysisTemplateIds()}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
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
