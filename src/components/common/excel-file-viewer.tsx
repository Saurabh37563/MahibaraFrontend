import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  memo,
} from "react";
import * as XLSX from "xlsx";
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

// Types
interface ExcelViewerProps {
  fileUrl?: string | null;
  fileBuffer?: ArrayBuffer | null;
  fileName?: string;
  onError?: (error: Error) => void;
  onLoad?: (sheets: string[]) => void;
  className?: string;
  height?: number;
  enableSearch?: boolean;
  maxRows?: number; // Limit for performance
  autoLoadFile?: boolean;
}

interface CellData {
  value: any;
  type: "string" | "number" | "boolean" | "date" | "formula" | "empty";
  style?: any;
  formula?: string;
  displayValue?: string;
}

interface SheetData {
  name: string;
  data: CellData[][];
  range: string;
  rowCount: number;
  colCount: number;
  headers: string[];
}

interface ViewerState {
  sheets: SheetData[];
  activeSheetIndex: number;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  columnWidths: number[];
  processingProgress: number;
}

// Virtual Cell Component - Memoized for performance
const VirtualCell = memo<{
  cellData: CellData | null;
  columnIndex: number;
  rowIndex: number;
  width: number;
  searchTerm: string;
  isHeader: boolean;
}>(({ cellData, columnIndex, rowIndex, width, searchTerm, isHeader }) => {
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
  fileName = "Spreadsheet",
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

  // Format cell value for display
  const formatCellValue = useCallback((cell: any): CellData => {
    if (!cell) {
      return { value: "", type: "empty", displayValue: "" };
    }

    let cellData: CellData = {
      value: cell.v,
      type: "empty",
      displayValue: "",
    };

    try {
      if (cell.f) {
        cellData.type = "formula";
        cellData.formula = cell.f;
        cellData.value = cell.v;
        cellData.displayValue = cell.v?.toString() || "";
      } else if (cell.t === "n") {
        cellData.type = "number";
        cellData.value = cell.v;
        // Format numbers with appropriate precision
        cellData.displayValue =
          typeof cell.v === "number"
            ? cell.v.toLocaleString(undefined, { maximumFractionDigits: 6 })
            : cell.v?.toString() || "";
      } else if (
        cell.t === "d" ||
        (cell.t === "n" && cell.z && cell.z.includes("d"))
      ) {
        cellData.type = "date";
        cellData.value = cell.v;
        // Format dates
        if (cell.v instanceof Date) {
          cellData.displayValue = cell.v.toLocaleDateString();
        } else if (typeof cell.v === "number") {
          const date = XLSX.SSF.parse_date_code(cell.v);
          cellData.displayValue = new Date(
            date.y,
            date.m - 1,
            date.d
          ).toLocaleDateString();
        } else {
          cellData.displayValue = cell.v?.toString() || "";
        }
      } else if (cell.t === "b") {
        cellData.type = "boolean";
        cellData.value = cell.v;
        cellData.displayValue = cell.v ? "TRUE" : "FALSE";
      } else {
        cellData.type = "string";
        cellData.value = cell.v || "";
        cellData.displayValue = cell.v?.toString() || "";
      }

      if (cell.s) {
        cellData.style = cell.s;
      }
    } catch (error) {
      console.warn("Error formatting cell:", error);
      cellData.displayValue = cell.v?.toString() || "";
    }

    return cellData;
  }, []);

  // Process Excel file with progress tracking
  const processExcelFile = useCallback(
    async (buffer: ArrayBuffer) => {
      // Cancel any ongoing processing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        updateState({ loading: true, error: null, processingProgress: 0 });

        // Check if processing was cancelled
        if (signal.aborted) return;

        updateState({ processingProgress: 10 });

        const workbook = XLSX.read(buffer, {
          type: "array",
          cellStyles: true,
          cellFormula: true,
          cellDates: true,
          sheetStubs: false, // Don't create empty cells
        });

        if (signal.aborted) return;
        updateState({ processingProgress: 30 });

        const processedSheets: SheetData[] = [];

        for (let i = 0; i < workbook.SheetNames.length; i++) {
          if (signal.aborted) return;

          const sheetName = workbook.SheetNames[i];
          const worksheet = workbook.Sheets[sheetName];

          if (!worksheet["!ref"]) {
            // Empty sheet
            processedSheets.push({
              name: sheetName,
              data: [],
              range: "A1",
              rowCount: 0,
              colCount: 0,
              headers: [],
            });
            continue;
          }

          const range = XLSX.utils.decode_range(worksheet["!ref"]);
          const actualRowCount = Math.min(range.e.r - range.s.r + 1, maxRows);

          updateState({
            processingProgress: 30 + (i / workbook.SheetNames.length) * 50,
          });

          const data: CellData[][] = [];
          const headers: string[] = [];

          // Process header row first
          if (actualRowCount > 0) {
            const headerRow: CellData[] = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({
                r: range.s.r,
                c: col,
              });
              const cell = worksheet[cellAddress];
              const cellData = formatCellValue(cell);
              headerRow.push(cellData);
              headers.push(cellData.displayValue || `Column ${col + 1}`);
            }
            data.push(headerRow);

            // Process data rows in batches for better performance
            const batchSize = 1000;
            for (
              let startRow = range.s.r + 1;
              startRow <= Math.min(range.e.r, range.s.r + maxRows - 1);
              startRow += batchSize
            ) {
              if (signal.aborted) return;

              const endRow = Math.min(startRow + batchSize - 1, range.e.r);

              for (let row = startRow; row <= endRow; row++) {
                const rowData: CellData[] = [];
                for (let col = range.s.c; col <= range.e.c; col++) {
                  const cellAddress = XLSX.utils.encode_cell({
                    r: row,
                    c: col,
                  });
                  const cell = worksheet[cellAddress];
                  rowData.push(formatCellValue(cell));
                }
                data.push(rowData);
              }

              // Update progress
              const progress =
                30 +
                (i / workbook.SheetNames.length) * 50 +
                ((startRow - range.s.r) / actualRowCount) *
                  (50 / workbook.SheetNames.length);
              updateState({ processingProgress: Math.min(progress, 80) });

              // Allow UI to update
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }

          processedSheets.push({
            name: sheetName,
            data,
            range: worksheet["!ref"] || "A1",
            rowCount: actualRowCount,
            colCount: range.e.c - range.s.c + 1,
            headers,
          });
        }

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
        onLoad?.(processedSheets.map((s) => s.name));
      } catch (err) {
        if (signal.aborted) return;

        const errorMessage =
          err instanceof Error ? err.message : "Failed to process Excel file";
        updateState({ error: errorMessage });
        onError?.(new Error(errorMessage));
      } finally {
        if (!signal.aborted) {
          updateState({ loading: false, processingProgress: 0 });
        }
      }
    },
    [formatCellValue, maxRows, onError, onLoad, updateState]
  );

  // Calculate optimal column widths
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
  const { filteredData, totalFilteredRows, paginatedData } = useMemo(() => {
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <span className="mb-2">Processing spreadsheet...</span>
        {state.processingProgress > 0 && (
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
  const tableHeight = height - headerHeight - tabsHeight - paginationHeight;

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
