export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface CellData {
  displayValue: string;
  rawValue: number | string | Date | boolean | null;
  type: 'empty' | 'number' | 'percentage' | 'date' | 'boolean' | 'string';
}

export interface SheetData {
  name: string;
  data: CellData[][];
  range: string;
  rowCount: number;
  colCount: number;
  headers: string[];
}

export interface ProcessMessage {
  type: 'process';
  buffer: ArrayBuffer;
  maxRows: number;
}

export type WorkerMessage =
  | { type: 'progress'; progress: number }
  | { type: 'success'; sheets: SheetData[]; progress: number }
  | { type: 'error'; error: string };