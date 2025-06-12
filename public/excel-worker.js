// Import XLSX library - you'll need to include it in your public folder
// or use a CDN version that works in workers
importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

// Helper function to format cell values (copied from your main code)
function formatCellValue(cell) {
  if (!cell || cell.v === undefined) {
    return {
      displayValue: '',
      rawValue: null,
      type: 'empty'
    };
  }

  const value = cell.v;
  const type = cell.t || 'general';

  switch (type) {
    case 'n': // number
      if (cell.z && cell.z.includes('%')) {
        return {
          displayValue: (value * 100).toFixed(2) + '%',
          rawValue: value,
          type: 'percentage'
        };
      }
      return {
        displayValue: typeof value === 'number' ? value.toString() : String(value),
        rawValue: value,
        type: 'number'
      };
    case 'd': // date
      return {
        displayValue: value instanceof Date ? value.toLocaleDateString() : String(value),
        rawValue: value,
        type: 'date'
      };
    case 'b': // boolean
      return {
        displayValue: value ? 'TRUE' : 'FALSE',
        rawValue: value,
        type: 'boolean'
      };
    case 's': // string
    case 'str': // formula string
    default:
      return {
        displayValue: String(value),
        rawValue: value,
        type: 'string'
      };
  }
}

// Main processing function
async function processExcelInWorker(buffer, maxRows) {
  try {
    // Send progress update
    self.postMessage({ type: 'progress', progress: 10 });

    const workbook = XLSX.read(buffer, {
      type: "array",
      cellStyles: true,
      cellFormula: true,
      cellDates: true,
      sheetStubs: false,
    });

    self.postMessage({ type: 'progress', progress: 30 });

    const processedSheets = [];

    for (let i = 0; i < workbook.SheetNames.length; i++) {
      const sheetName = workbook.SheetNames[i];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet["!ref"]) {
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

      self.postMessage({
        type: 'progress',
        progress: 30 + (i / workbook.SheetNames.length) * 50
      });

      const data = [];
      const headers = [];

      // Process header row
      if (actualRowCount > 0) {
        const headerRow = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
          const cell = worksheet[cellAddress];
          const cellData = formatCellValue(cell);
          headerRow.push(cellData);
          headers.push(cellData.displayValue || `Column ${col + 1}`);
        }
        data.push(headerRow);

        // Process data rows in batches
        const batchSize = 1000;
        for (
          let startRow = range.s.r + 1;
          startRow <= Math.min(range.e.r, range.s.r + maxRows - 1);
          startRow += batchSize
        ) {
          const endRow = Math.min(startRow + batchSize - 1, range.e.r);

          for (let row = startRow; row <= endRow; row++) {
            const rowData = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = worksheet[cellAddress];
              rowData.push(formatCellValue(cell));
            }
            data.push(rowData);
          }

          // Send progress update
          const progress = 30 + (i / workbook.SheetNames.length) * 50 +
            ((startRow - range.s.r) / actualRowCount) * (50 / workbook.SheetNames.length);
          self.postMessage({ 
            type: 'progress', 
            progress: Math.min(progress, 80) 
          });

          // Yield control periodically
          await new Promise(resolve => setTimeout(resolve, 0));
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

    self.postMessage({ 
      type: 'success', 
      sheets: processedSheets,
      progress: 100 
    });

  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error.message || 'Failed to process Excel file' 
    });
  }
}

// Listen for messages from main thread
self.onmessage = function(e) {
  const { type, buffer, maxRows } = e.data;
  
  if (type === 'process') {
    processExcelInWorker(buffer, maxRows);
  }
};
