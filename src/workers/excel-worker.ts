import * as XLSX from "xlsx";
import type {
  ProcessMessage,
  SheetData,
  CellData,
  WorkerMessage,
} from "@/types/common-types";

// Helper: extend CellData for internal use
type InternalCellData = Omit<CellData, "type"> & { type: CellData["type"] };

// Optimized batch sizes for better performance
const PROCESSING_BATCH_SIZE = 200; // Process rows in smaller batches
const YIELD_FREQUENCY = 50; // Yield control every 50 rows

// Only allow CellData.type values
function formatCellValue(cell: XLSX.CellObject | undefined): InternalCellData {
  if (!cell || cell.v === undefined) {
    return {
      displayValue: "",
      value: null,
      type: "empty",
    };
  }

  const value = cell.v;
  const type = cell.t || "general";

  switch (type) {
    case "n":
      // Only allow 'number' as type, not 'percentage'
      if (cell.z && typeof cell.z === "string" && cell.z.includes("%")) {
        return {
          displayValue: ((value as number) * 100).toFixed(2) + "%",
          value,
          type: "number",
        };
      }
      return {
        displayValue:
          typeof value === "number" ? value.toString() : String(value),
        value,
        type: "number",
      };
    case "d":
      return {
        displayValue:
          value instanceof Date ? value.toLocaleDateString() : String(value),
        value,
        type: "date",
      };
    case "b":
      return {
        displayValue: value ? "TRUE" : "FALSE",
        value,
        type: "boolean",
      };
    case "s":
    default:
      return {
        displayValue: String(value),
        value,
        type: "string",
      };
  }
}

async function processExcelInWorker(buffer: ArrayBuffer, maxRows: number) {
  try {
    self.postMessage({ type: "progress", progress: 10 });

    const workbook = XLSX.read(buffer, {
      type: "array",
      cellStyles: true,
      cellFormula: true,
      cellDates: true,
      sheetStubs: false,
    });

    self.postMessage({ type: "progress", progress: 30 });

    const totalSheets = workbook.SheetNames.length;

    for (let i = 0; i < workbook.SheetNames.length; i++) {
      const sheetName = workbook.SheetNames[i];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet["!ref"]) {
        // Send empty sheet immediately
        const emptySheet: SheetData = {
          name: sheetName,
          data: [],
          range: "A1",
          rowCount: 0,
          colCount: 0,
          headers: [],
        };

        self.postMessage({
          type: "sheet-data",
          sheet: emptySheet,
          sheetIndex: i,
          totalSheets,
        } as WorkerMessage);
        continue;
      }

      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const actualRowCount = Math.min(range.e.r - range.s.r + 1, maxRows);

      // Update progress for sheet start
      const sheetStartProgress = 30 + (i / workbook.SheetNames.length) * 60;
      self.postMessage({
        type: "progress",
        progress: sheetStartProgress,
      });

      const data: CellData[][] = [];
      const headers: string[] = [];

      if (actualRowCount > 0) {
        // Process header row
        const headerRow: InternalCellData[] = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
          const cell = worksheet[cellAddress];
          const cellData = formatCellValue(cell);
          headerRow.push(cellData);
          headers.push(cellData.displayValue || `Column ${col + 1}`);
        }
        data.push(headerRow);

        // Process data rows in optimized batches
        let processedRowCount = 1; // Start at 1 since header is already processed

        for (
          let startRow = range.s.r + 1;
          startRow <= Math.min(range.e.r, range.s.r + maxRows - 1);
          startRow += PROCESSING_BATCH_SIZE
        ) {
          const endRow = Math.min(
            startRow + PROCESSING_BATCH_SIZE - 1,
            range.e.r,
            range.s.r + maxRows - 1,
          );

          // Process batch of rows
          const batchData: CellData[][] = [];
          for (let row = startRow; row <= endRow; row++) {
            const rowData: InternalCellData[] = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = worksheet[cellAddress];
              rowData.push(formatCellValue(cell));
            }
            batchData.push(rowData);

            // Yield control frequently to prevent UI blocking
            if ((row - startRow) % YIELD_FREQUENCY === 0) {
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }

          // Add batch to main data array
          data.push(...batchData);
          processedRowCount += batchData.length;

          // Calculate and send progress update
          const rowProgress = (processedRowCount - 1) / (actualRowCount - 1);
          const sheetProgress =
            sheetStartProgress +
            rowProgress * (60 / workbook.SheetNames.length);

          self.postMessage({
            type: "progress",
            progress: Math.min(sheetProgress, 85),
          });
        }
      }

      // Send processed sheet immediately to reduce memory usage and transfer time
      const processedSheet: SheetData = {
        name: sheetName,
        data,
        range: worksheet["!ref"] || "A1",
        rowCount: actualRowCount,
        colCount: range.e.c - range.s.c + 1,
        headers,
      };

      self.postMessage({
        type: "sheet-data",
        sheet: processedSheet,
        sheetIndex: i,
        totalSheets,
      } as WorkerMessage);
    }

    // Send completion message
    self.postMessage({
      type: "complete",
      progress: 100,
    } as WorkerMessage);
  } catch (error) {
    self.postMessage({
      type: "error",
      error:
        error instanceof Error ? error.message : "Failed to process Excel file",
    });
  }
}

self.onmessage = (e: MessageEvent<ProcessMessage>) => {
  const { type, buffer, maxRows } = e.data;
  if (type === "process") {
    processExcelInWorker(buffer, maxRows);
  }
};
