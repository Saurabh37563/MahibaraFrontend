import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  memo,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  Search,
  Loader2,
  AlertCircle,
  X,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import {
  ExcelViewerProps,
  CellData,
  SheetData,
  ViewerState,
} from "@/types/common-types";

// Virtual Cell Component - Memoized for performance
const VirtualCell = memo<{
  cellData: CellData | null;
  columnIndex: number;
  rowIndex: number;
  width: number;
  searchTerm: string;
  isHeader: boolean;
}>(({ cellData, width, searchTerm, isHeader }) => {
  if (!cellData) {
    return (
      <div
        className="border-r border-b border-gray-300 bg-white flex items-center px-2 py-1"
        style={{ width, height: 32, minWidth: width }}
      />
    );
  }

  const cellValue = cellData.displayValue || cellData.value?.toString() || "";
  const isHighlighted =
    searchTerm && cellValue.toLowerCase().includes(searchTerm.toLowerCase());

  const getCellClasses = () => {
    const baseClasses =
      "border-r border-b border-gray-300 px-2 py-1 text-sm truncate flex items-center hover:bg-gray-50 cursor-default";

    if (isHeader)
      return `${baseClasses} bg-gray-100  sticky top-0 z-10 text-green-800`;
    if (isHighlighted) return `${baseClasses} bg-yellow-100`;
    if (cellData.type === "number")
      return `${baseClasses} text-gray-800 text-right`;
    if (cellData.type === "date") return `${baseClasses} text-gray-800`;
    if (cellData.type === "formula") return `${baseClasses} text-purple-600`;
    return `${baseClasses} text-gray-800`;
  };

  return (
    <div
      className={getCellClasses()}
      style={{ width, height: 32, minWidth: width }}
      title={cellValue}
    >
      {cellData.formula && <span className="text-purple-500 mr-1">f=</span>}
      <span className="truncate">{cellValue}</span>
    </div>
  );
});

VirtualCell.displayName = "VirtualCell";

// Main Excel Viewer Component
const ExcelViewer: React.FC<ExcelViewerProps> = ({
  fileUrl,
  fileBuffer,
  onError,
  onLoad,
  className = "",
  height = 600,
  enableSearch = true,
  maxRows = 100000,
  autoLoadFile = true,
}) => {
  // State management
  const [state, setState] = useState<ViewerState>({
    sheets: [],
    activeSheetIndex: 0,
    loading: false,
    error: null,
    searchTerm: "",
    currentPage: 1,
    pageSize: 100,
    columnWidths: [],
    processingProgress: 0,
  });

  // Refs
  const parentRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Safe state updates
  const updateState = useCallback((updates: Partial<ViewerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const calculateColumnWidths = useCallback(
    (sheet: SheetData) => {
      if (!parentRef.current) return;

      const containerWidth = parentRef.current.offsetWidth;
      const widths: number[] = [];
      const maxWidth = 300;
      const minWidth = 120;

      // Calculate initial widths based on content
      for (let col = 0; col < sheet.colCount; col++) {
        let maxLength = 0;

        // Check first 100 rows for performance
        const rowsToCheck = Math.min(sheet.rowCount, 100);
        for (let row = 0; row < rowsToCheck; row++) {
          const cellValue = sheet.data[row]?.[col]?.displayValue || "";
          maxLength = Math.max(maxLength, cellValue.length);
        }

        const width = Math.min(
          Math.max(maxLength * 8 + 20, minWidth),
          maxWidth
        );
        widths.push(width);
      }

      // If total width is less than container, distribute extra space
      const totalWidth = widths.reduce((sum, width) => sum + width, 0);
      if (totalWidth < containerWidth && widths.length > 0) {
        const extraSpace = containerWidth - totalWidth;
        const additionalWidthPerColumn = extraSpace / widths.length;

        for (let i = 0; i < widths.length; i++) {
          widths[i] = Math.min(widths[i] + additionalWidthPerColumn, maxWidth);
        }
      }

      updateState({ columnWidths: widths });
    },
    [updateState]
  );

  // Process Excel file with progress tracking
  const workerRef = useRef<Worker | null>(null);

  const processExcelFile = useCallback(
    async (buffer: ArrayBuffer) => {
      // Cancel any ongoing processing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Terminate existing worker if any
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      try {
        updateState({ loading: true, error: null, processingProgress: 0 });

        if (signal.aborted) return;

        // Create new worker using the imported worker constructor
        workerRef.current = new Worker(
          new URL("@/workers/excel-worker.ts", import.meta.url),
          { type: "module" }
        );

        // Handle worker messages
        const workerPromise = new Promise<SheetData[]>((resolve, reject) => {
          if (!workerRef.current) {
            reject(new Error("Worker not available"));
            return;
          }

          workerRef.current.onmessage = (e: MessageEvent) => {
            const { type, progress, sheets, error } = e.data;

            if (signal.aborted) {
              workerRef.current?.terminate();
              return;
            }

            switch (type) {
              case "progress":
                updateState({ processingProgress: progress });
                break;

              case "success":
                if (Array.isArray(sheets)) {
                  resolve(sheets as SheetData[]);
                } else {
                  reject(new Error("Invalid sheet data from worker"));
                }
                break;

              case "error":
                reject(new Error(error));
                break;
            }
          };

          workerRef.current.onerror = (error) => {
            reject(new Error("Worker error: " + error.message));
          };

          // Send data to worker
          workerRef.current.postMessage({
            type: "process",
            buffer: buffer,
            maxRows: maxRows,
          });
        });

        const processedSheets = await workerPromise;

        if (signal.aborted) return;

        updateState({
          sheets: processedSheets,
          activeSheetIndex: 0,
          processingProgress: 90,
        });

        if (processedSheets.length > 0) {
          calculateColumnWidths(processedSheets[0]);
        }

        updateState({ processingProgress: 100 });
        onLoad?.(processedSheets.map((s: SheetData) => s.name));
      } catch (err) {
        if (signal.aborted) return;

        const errorMessage =
          err instanceof Error ? err.message : "Failed to process Excel file";
        updateState({ error: errorMessage });
        onError?.(new Error(errorMessage));
      } finally {
        if (!signal.aborted) {
          updateState({ loading: false, processingProgress: 0 });
          workerRef.current?.terminate();
          workerRef.current = null;
        }
      }
    },
    [maxRows, onError, onLoad, updateState, calculateColumnWidths]
  );

  // Add cleanup in useEffect
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Load file effect with proper error handling
  useEffect(() => {
    if (!autoLoadFile) return;

    const loadFile = async () => {
      try {
        if (fileBuffer) {
          await processExcelFile(fileBuffer);
        } else if (fileUrl) {
          updateState({ loading: true, error: null });
          const response = await axios.get<ArrayBuffer>(fileUrl, {
            responseType: "arraybuffer",
          });

          await processExcelFile(response.data);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch file";
        updateState({ error: errorMessage, loading: false });
        onError?.(new Error(errorMessage));
      }
    };

    loadFile();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    fileUrl,
    fileBuffer,
    processExcelFile,
    onError,
    autoLoadFile,
    updateState,
  ]);

  // Recalculate widths when container size changes
  useEffect(() => {
    const handleResize = () => {
      if (state.sheets[state.activeSheetIndex]) {
        calculateColumnWidths(state.sheets[state.activeSheetIndex]);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [state.sheets, state.activeSheetIndex, calculateColumnWidths]);

  // Get current sheet with null safety
  const currentSheet = useMemo(() => {
    return state.sheets[state.activeSheetIndex] || null;
  }, [state.sheets, state.activeSheetIndex]);

  // Filter data based on search and pagination
  const { totalFilteredRows, paginatedData } = useMemo(() => {
    if (!currentSheet)
      return { filteredData: [], totalFilteredRows: 0, paginatedData: [] };

    let data = currentSheet.data;

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      const header = data[0]; // Keep header
      const filteredRows = data
        .slice(1)
        .filter((row) =>
          row.some((cell) =>
            cell.displayValue?.toLowerCase().includes(searchLower)
          )
        );
      data = [header, ...filteredRows];
    }

    // Apply pagination
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;

    // Always include header row, then add paginated data
    const header = data[0];
    const dataRows = data.slice(1);
    const paginatedRows = dataRows.slice(startIndex, endIndex);

    return {
      filteredData: data,
      totalFilteredRows: dataRows.length, // Don't count header in total
      paginatedData: header ? [header, ...paginatedRows] : paginatedRows,
    };
  }, [currentSheet, state.searchTerm, state.currentPage, state.pageSize]);

  // Pagination calculations
  const totalPages = Math.ceil(totalFilteredRows / state.pageSize);

  // Virtualization setup
  const rowVirtualizer = useVirtualizer({
    count: paginatedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });

  // Reset component
  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      sheets: [],
      activeSheetIndex: 0,
      loading: false,
      error: null,
      searchTerm: "",
      currentPage: 1,
      pageSize: 100,
      columnWidths: [],
      processingProgress: 0,
    });
  }, []);

  // Calculate total width for horizontal scrolling
  const totalWidth = useMemo(() => {
    const calculatedWidth = state.columnWidths.reduce(
      (sum, width) => sum + width,
      0
    );
    return Math.max(calculatedWidth, parentRef.current?.offsetWidth || 0);
  }, [state.columnWidths]);

  // Page size options
  const pageSizeOptions = [10, 100, 500, 1000];

  // Loading state
  if (state.loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ height }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-2" />
        <span className="mb-2">Loading spreadsheet...</span>
        {state.processingProgress > 0 && (
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.processingProgress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ height }}
      >
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <p className="text-red-600 text-center mb-4">{state.error}</p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    );
  }

  // No data state
  if (!currentSheet) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ height }}
      >
        <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-600 text-center mb-4">
          No spreadsheet data available
        </p>
      </div>
    );
  }

  const headerHeight = 60;
  const tabsHeight = state.sheets.length > 1 ? 40 : 0;
  const paginationHeight = 60;

  return (
    <div className={`flex flex-col ${className} h-full  overflow-hidden `}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0"
        style={{ height: headerHeight }}
      >
        <div className="flex items-center space-x-4">
          <span> Sheet Data</span>
        </div>

        <div className="flex items-center space-x-2">
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={state.searchTerm}
                onChange={(e) =>
                  updateState({ searchTerm: e.target.value, currentPage: 1 })
                }
                className="pl-10 pr-4 py-2 border rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state.searchTerm && (
                <button
                  onClick={() =>
                    updateState({ searchTerm: "", currentPage: 1 })
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sheet Tabs */}
      {state.sheets.length > 1 && (
        <div
          className="flex border-b bg-white overflow-x-auto flex-shrink-0"
          style={{ height: tabsHeight }}
        >
          {state.sheets.map((sheet, index) => (
            <button
              key={sheet.name}
              onClick={() =>
                updateState({
                  activeSheetIndex: index,
                  currentPage: 1,
                  searchTerm: "",
                })
              }
              className={`px-4 py-2 text-sm whitespace-nowrap border-r transition-colors ${
                index === state.activeSheetIndex
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {sheet.name}
              {sheet.rowCount >= maxRows && (
                <span className="ml-1 text-xs text-orange-500">*</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto bg-white border border-gray-300"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: totalWidth,
            position: "relative",
            minWidth: "100%",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowData = paginatedData[virtualRow.index];
            if (!rowData) return null;

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: totalWidth,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex"
              >
                {rowData.map((cellData, columnIndex) => (
                  <VirtualCell
                    key={`${virtualRow.index}-${columnIndex}`}
                    cellData={cellData}
                    columnIndex={columnIndex}
                    rowIndex={virtualRow.index}
                    width={state.columnWidths[columnIndex] || 120}
                    searchTerm={state.searchTerm}
                    isHeader={virtualRow.index === 0}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div
        className="flex items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0"
        style={{ height: paginationHeight }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <div className="relative">
              <select
                value={state.pageSize}
                onChange={(e) =>
                  updateState({
                    pageSize: Number(e.target.value),
                    currentPage: 1,
                  })
                }
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateState({ currentPage: 1 })}
            disabled={state.currentPage === 1}
            className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              updateState({ currentPage: Math.max(1, state.currentPage - 1) })
            }
            disabled={state.currentPage === 1}
            className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-sm bg-white border rounded">
            Page {state.currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              updateState({
                currentPage: Math.min(totalPages, state.currentPage + 1),
              })
            }
            disabled={state.currentPage === totalPages || totalPages === 0}
            className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => updateState({ currentPage: totalPages })}
            disabled={state.currentPage === totalPages || totalPages === 0}
            className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;
