import { IconType } from "react-icons";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Excel Viewer Types

export interface ExcelViewerProps {
  fileUrl?: string | null;
  fileBuffer?: ArrayBuffer | null;
  fileName?: string;
  onError?: (error: Error) => void;
  onLoad?: (sheets: string[]) => void;
  className?: string;
  height?: number;
  enableSearch?: boolean;
  maxRows?: number;
  autoLoadFile?: boolean;
}

export interface CellData {
  value: string | number | boolean | Date | null | undefined;
  type: "string" | "number" | "boolean" | "date" | "formula" | "empty";
  style?: Record<string, unknown>;
  formula?: string;
  displayValue?: string;
}

export interface SheetData {
  name: string;
  data: CellData[][];
  range: string;
  rowCount: number;
  colCount: number;
  headers: string[];
}

export interface ViewerState {
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

// Worker message types (if needed elsewhere)
export interface ProcessMessage {
  type: 'process';
  buffer: ArrayBuffer;
  maxRows: number;
}

export type WorkerMessage =
  | { type: 'progress'; progress: number }
  | { type: 'success'; sheets: SheetData[]; progress: number }
  | { type: 'error'; error: string };

// Other types
export type Agent = {
  id: string;
  name: string;
  icon: IconType;
  info: string;
  comingSoon: boolean;
  path: string;
};