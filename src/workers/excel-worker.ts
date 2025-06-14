import * as XLSX from 'xlsx';
import type { ProcessMessage, SheetData, CellData } from '@/types/common-types';

// Helper: extend CellData for internal use to include rawValue
type InternalCellData = Omit<CellData, "type"> & { rawValue?: unknown; type: CellData["type"] };

// Only allow CellData.type values
function formatCellValue(cell: XLSX.CellObject | undefined): InternalCellData {
  if (!cell || cell.v === undefined) {
    return {
      displayValue: '',
      value: null,
      type: 'empty'
    };
  }

  const value = cell.v;
  const type = cell.t || 'general';

  switch (type) {
    case 'n':
      // Only allow 'number' as type, not 'percentage'
      if (cell.z && typeof cell.z === 'string' && cell.z.includes('%')) {
        return {
          displayValue: ((value as number) * 100).toFixed(2) + '%',
          value,
          rawValue: value,
          type: 'number'
        };
      }
      return {
        displayValue: typeof value === 'number' ? value.toString() : String(value),
        value,
        rawValue: value,
        type: 'number'
      };
    case 'd':
      return {
        displayValue: value instanceof Date ? value.toLocaleDateString() : String(value),
        value,
        rawValue: value,
        type: 'date'
      };
    case 'b':
      return {
        displayValue: value ? 'TRUE' : 'FALSE',
        value,
        rawValue: value,
        type: 'boolean'
      };
    case 's':
    default:
      return {
        displayValue: String(value),
        value,
        rawValue: value,
        type: 'string'
      };
  }
}

async function processExcelInWorker(buffer: ArrayBuffer, maxRows: number) {
  try {
    self.postMessage({ type: 'progress', progress: 10 });

    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellStyles: true,
      cellFormula: true,
      cellDates: true,
      sheetStubs: false,
    });

    self.postMessage({ type: 'progress', progress: 30 });

    const processedSheets: SheetData[] = [];

    for (let i = 0; i < workbook.SheetNames.length; i++) {
      const sheetName = workbook.SheetNames[i];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet['!ref']) {
        processedSheets.push({
          name: sheetName,
          data: [],
          range: 'A1',
          rowCount: 0,
          colCount: 0,
          headers: [],
        });
        continue;
      }

      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const actualRowCount = Math.min(range.e.r - range.s.r + 1, maxRows);

      self.postMessage({
        type: 'progress',
        progress: 30 + (i / workbook.SheetNames.length) * 50
      });

      const data: CellData[][] = [];
      const headers: string[] = [];

      if (actualRowCount > 0) {
        const headerRow: InternalCellData[] = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
          const cell = worksheet[cellAddress];
          const cellData = formatCellValue(cell);
          headerRow.push(cellData);
          headers.push(cellData.displayValue || `Column ${col + 1}`);
        }
        // Remove rawValue before pushing to data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data.push(headerRow.map(({ rawValue, ...rest }) => rest));

        const batchSize = 1000;
        for (
          let startRow = range.s.r + 1;
          startRow <= Math.min(range.e.r, range.s.r + maxRows - 1);
          startRow += batchSize
        ) {
          const endRow = Math.min(startRow + batchSize - 1, range.e.r);
          for (let row = startRow; row <= endRow; row++) {
            const rowData: InternalCellData[] = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = worksheet[cellAddress];
              rowData.push(formatCellValue(cell));
            }
            // Remove rawValue before pushing to data
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            data.push(rowData.map(({ rawValue, ...rest }) => rest));
          }

          const progress =
            30 +
            (i / workbook.SheetNames.length) * 50 +
            ((startRow - range.s.r) / actualRowCount) * (50 / workbook.SheetNames.length);
          self.postMessage({
            type: 'progress',
            progress: Math.min(progress, 80)
          });

          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      processedSheets.push({
        name: sheetName,
        data,
        range: worksheet['!ref'] || 'A1',
        rowCount: actualRowCount,
        colCount: range.e.c - range.s.c + 1,
        headers,
      });
    }

    self.postMessage({
      type: 'success',
      sheets: processedSheets,
      progress: 100
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Failed to process Excel file'
    });
  }
}

self.onmessage = (e: MessageEvent<ProcessMessage>) => {
  const { type, buffer, maxRows } = e.data;
  if (type === 'process') {
    processExcelInWorker(buffer, maxRows);
  }
};