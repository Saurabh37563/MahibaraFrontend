"use client";

import { useState, useEffect, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import { LuFileSpreadsheet } from "react-icons/lu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { LuChartPie } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import AnalysisView from "./AnalysisView";
import SpreadSheetView from "./SpreadSheetView";
import { z } from "zod";
import FileUploadMapping from "./file-upload";
import { AnalysisSelectionModal } from "./create-analysis";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

// Define Zod schemas (unchanged)
const StatusEnum = z.enum(["success", "warning", "danger", "info", "neutral"]);

const ItemSchema = z.object({
  id: z.number(),
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

// Derive TypeScript types from Zod schemas
type Item = z.infer<typeof ItemSchema>;
type SelectedItem = Item & { type: "sheet" | "analysis" };
type SpreadsheetData = z.infer<typeof SpreadsheetDataSchema>;
type AnalysisData = z.infer<typeof AnalysisDataSchema>;
type DataType = SpreadsheetData | AnalysisData | null;

export default function Project() {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DataType>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<"sheets" | "analysis">(
    "sheets"
  );

  // Check if we're on a mobile device
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

  const sheets: Item[] = [
    { id: 1, name: "PR Register", status: "success" },
    { id: 2, name: "PO Register", status: "warning" },
    { id: 3, name: "GRN Register", status: "danger" },
    { id: 4, name: "Invoice Reg", status: "info" },
    { id: 5, name: "Payment Reg", status: "neutral" },
    { id: 6, name: "Vendor Master", status: "success" },
    { id: 7, name: "Item Master", status: "warning" },
    { id: 8, name: "GRIR Report", status: "danger" },
    { id: 9, name: "Adv To Vendor", status: "info" },
    { id: 10, name: "PO Matrix", status: "neutral" },
  ];

  const analysis: Item[] = [
    { id: 1, name: "Top Vendors (80-20)", status: "success" },
    { id: 2, name: "Top Items (80-20)", status: "warning" },
    { id: 3, name: "PO By Creater", status: "danger" },
    { id: 4, name: "PO By Location", status: "info" },
    { id: 5, name: "PO By Currency", status: "neutral" },
  ];

  const statusDotColors: Record<z.infer<typeof StatusEnum>, string> = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-gray-400",
  };

  useEffect(() => {
    if (selectedItem) {
      fetchData();
    }
  }, [selectedItem]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedItem?.type === "sheet") {
        // Mock spreadsheet data - generate more rows for virtualization
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

        // Validate with Zod
        const validatedData = SpreadsheetDataSchema.parse(sheetData);
        setData(validatedData);
      } else {
        // Mock analysis data
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

        // Validate with Zod
        const validatedData = AnalysisDataSchema.parse(analysisData);
        setData(validatedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: Item, type: "sheet" | "analysis"): void => {
    setSelectedItem({ ...item, type });

    // On mobile, close the sidebar after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mobile sidebar component
  const MobileSidebar = () => (
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
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-sm">Project Explorer</h2>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

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

      {selectedTab === "sheets" ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-3 bg-gray-50">
            <div className="text-xs flex items-center gap-1">
              <span>Sheets</span>
              <span className="text-[12px] mt-[2px] text-muted-foreground">
                ({sheets.length})
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <FileUploadMapping />
              <MdOutlineFileDownload
                className="text-muted-foreground cursor-pointer"
                size={16}
              />
            </div>
          </div>

          <div className="overflow-y-auto py-4">
            {sheets.map((sheet) => (
              <div
                key={sheet.id}
                className={`flex group items-center justify-between rounded-md p-2 mx-1 hover:bg-slate-50 cursor-pointer ${
                  selectedItem?.id === sheet.id &&
                  selectedItem?.type === "sheet"
                    ? "bg-slate-100"
                    : ""
                }`}
                onClick={() => handleItemClick(sheet, "sheet")}
              >
                <div className="text-xs flex items-center gap-2">
                  <LuFileSpreadsheet className="text-gray-400" />
                  <span className="text-gray-950">{sheet.name}</span>
                  <span
                    className={`size-[6px] rounded-full ${
                      statusDotColors[sheet.status] || "bg-gray-300"
                    }`}
                  />
                </div>
                <div className="gap-2 hidden group-hover:flex items-center">
                  <HiOutlineDotsVertical className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-3 bg-gray-50">
            <div className="text-xs flex items-center gap-1">
              <span>Analysis</span>
              <span className="text-[12px] mt-[2px] text-muted-foreground">
                ({analysis.length})
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <AnalysisSelectionModal />
              <MdOutlineFileDownload
                className="text-muted-foreground cursor-pointer"
                size={16}
              />
            </div>
          </div>

          <div className="overflow-y-auto py-4">
            {analysis.map((item) => (
              <div
                key={item.id}
                className={`flex group items-center justify-between rounded-md p-2 mx-1 hover:bg-slate-50 cursor-pointer ${
                  selectedItem?.id === item.id &&
                  selectedItem?.type === "analysis"
                    ? "bg-slate-100"
                    : ""
                }`}
                onClick={() => handleItemClick(item, "analysis")}
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
                <div className="gap-2 hidden group-hover:flex items-center">
                  <HiOutlineDotsVertical className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100dvh-65px)] w-full relative">
      {/* Mobile sidebar toggle button */}
      {/* {isMobile && !sidebarOpen && (
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed top-[60px] left-0 z-50 h-8 w-8 rounded-full p-0"
          onClick={toggleSidebar}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )} */}

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile sidebar */}
      {isMobile && <MobileSidebar />}

      {/* Desktop layout with resizable panels */}
      {!isMobile ? (
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          <ResizablePanel defaultSize={25}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel className="flex flex-col w-full" defaultSize={50}>
                <div className="flex items-center justify-between px-3 bg-gray-50">
                  <div className="text-xs flex items-center gap-1">
                    <span className="">Sheets</span>
                    <span className="text-[12px] mt-[2px] text-muted-foreground">
                      ({sheets.length})
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <FileUploadMapping />
                    <MdOutlineFileDownload
                      className="text-muted-foreground cursor-pointer"
                      size={16}
                    />
                  </div>
                </div>
                <div className="overflow-y-auto py-4 px-2">
                  {sheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      className={`flex group items-center justify-between rounded-sm p-2 hover:bg-slate-50 cursor-pointer ${
                        selectedItem?.id === sheet.id &&
                        selectedItem?.type === "sheet"
                          ? "bg-slate-200 border-l-4  border-primary"
                          : ""
                      }`}
                      onClick={() => handleItemClick(sheet, "sheet")}
                    >
                      <div className="text-xs flex items-center gap-2">
                        <LuFileSpreadsheet className="text-gray-400" />
                        <span className="text-gray-950">{sheet.name}</span>
                        <span
                          className={`size-[6px] rounded-full ${
                            statusDotColors[sheet.status] || "bg-gray-300"
                          }`}
                        />
                      </div>
                      <div className="gap-2 hidden group-hover:flex items-center">
                        <HiOutlineDotsVertical className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel className="flex flex-col w-full" defaultSize={50}>
                <div className="flex items-center justify-between px-3 bg-gray-50">
                  <div className="text-xs flex items-center gap-1">
                    <span className="">Analysis</span>
                    <span className="text-[12px] mt-[2px] text-muted-foreground">
                      ({analysis.length})
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <AnalysisSelectionModal />
                    <MdOutlineFileDownload
                      className="text-muted-foreground cursor-pointer"
                      size={16}
                    />
                  </div>
                </div>
                <div className="overflow-y-auto py-4 px-2">
                  {analysis.map((item) => (
                    <div
                      key={item.id}
                      className={`flex group items-center justify-between rounded-md p-2 hover:bg-slate-50 cursor-pointer ${
                        selectedItem?.id === item.id &&
                        selectedItem?.type === "analysis"
                          ? "bg-slate-200 border-l-4  border-primary"
                          : ""
                      }`}
                      onClick={() => handleItemClick(item, "analysis")}
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
                      <div className="gap-2 hidden group-hover:flex items-center">
                        <HiOutlineDotsVertical className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={75}>
            <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden">
              {/* Content area (identical for both mobile and desktop) */}
              <div
                className="
                  absolute inset-0 
                  [background-size:20px_20px] 
                  [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] 
                  dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]
                "
              />

              <div
                className="
                pointer-events-none 
                absolute inset-0 
                bg-white dark:bg-black 
                [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]
              "
              />

              <div className="relative z-10 h-full">
                {!selectedItem ? (
                  <div
                    className="
                    absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white 
                    rounded-lg shadow-sm p-4 w-fit text-gray-400 z-20 flex flex-col items-center justify-center
                  "
                  >
                    <LuFileSpreadsheet size={40} className="mb-4" />
                    <p className="text-gray-500 text-sm">
                      Select a sheet or analysis to view details
                    </p>
                  </div>
                ) : loading ? (
                  <div className="p-6 h-full">
                    <Skeleton className="h-8 w-1/4 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Skeleton className="h-80 w-full" />
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </div>
                  </div>
                ) : selectedItem.type === "sheet" ? (
                  <SpreadSheetView
                    data={data as SpreadsheetData}
                    title={selectedItem.name}
                  />
                ) : (
                  <AnalysisView
                    data={data as AnalysisData}
                    title={selectedItem.name}
                  />
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // Mobile content view (takes full width when sidebar is closed)
        <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden">
          <div
            className="
              absolute inset-0 
              [background-size:20px_20px] 
              [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] 
              dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]
            "
          />

          <div
            className="
            pointer-events-none 
            absolute inset-0 
            bg-white dark:bg-black 
            [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]
          "
          />

          <div className="relative z-10 h-full">
            {!selectedItem ? (
              <div
                className="
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white 
                rounded-lg shadow-sm p-4 w-fit text-gray-400 z-20 flex flex-col items-center justify-center
              "
              >
                <LuFileSpreadsheet size={40} className="mb-4" />
                <p className="text-gray-500 text-sm text-center">
                  Select a sheet or analysis to view details
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={toggleSidebar}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  <span className="text-xs">Open Explorer</span>
                </Button>
              </div>
            ) : loading ? (
              <div className="p-4 h-full">
                <Skeleton className="h-8 w-1/2 mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-60 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ) : selectedItem.type === "sheet" ? (
              <>
                <div className="w-full pt-2">
                  {isMobile && !sidebarOpen && (
                    <Button
                      variant="outline"
                      className="  py-4 h-8 w-8 rounded-full p-0"
                      onClick={toggleSidebar}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <SpreadSheetView
                  data={data as SpreadsheetData}
                  title={selectedItem.name}
                />
              </>
            ) : (
              <>
                <div className="w-full pt-2  ">
                  {isMobile && !sidebarOpen && (
                    <Button
                      variant="outline"
                      className="  py-4 h-8 w-8 rounded-full p-0"
                      onClick={toggleSidebar}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <AnalysisView
                  data={data as AnalysisData}
                  title={selectedItem.name}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
