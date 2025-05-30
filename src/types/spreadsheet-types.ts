export interface SpreadsheetMetadata {
    fileName: string;
    fileSize: string;
    lastModified: string;
    recordCount: number;
    sheetCount: number;
  }
  
  export interface SpreadsheetData {
    id: string;
    projectId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'validated';
    metadata: SpreadsheetMetadata;
    fileUrl?: string;
    message?: string;
    progress?: number;
  }
  
  export interface SSEEvent {
  type: string;
  data: {
    projectId: string;
    status: string;
    message?: string;
    progress?: number;
    fileUrl?: string;
    metadata?: Partial<SpreadsheetMetadata>;
  } | Record<string, unknown>;
  }
  
  export interface APIResponse {
    success: boolean;
    data: SpreadsheetData;
  }
