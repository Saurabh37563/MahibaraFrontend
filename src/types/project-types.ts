import { z } from "zod";
export interface Analysis extends BaseItem {
  working_id: string;
  working_name: string;
  status: string;
  summary: string;
  id: string;
  name: string;
}

// Add import at the top of the file
import { UseFormReturn } from "react-hook-form";

// Status Enums
export type StatusEnum =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "uploaded"
  | "processed"
  | "processing"
  | "running";

// Project Status Types
export const ProjectStatusEnum = {
  COMPLETED: "completed",
  IN_PROGRESS: "in-progress",
  PENDING: "pending",
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  ERROR: "error",
} as const;

export const ProjectStatusSchema = z.enum([
  ProjectStatusEnum.COMPLETED,
  ProjectStatusEnum.IN_PROGRESS,
  ProjectStatusEnum.PENDING,
  ProjectStatusEnum.DRAFT,
  ProjectStatusEnum.ACTIVE,
  ProjectStatusEnum.ARCHIVED,
  ProjectStatusEnum.ERROR,
]);

 type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// Project Schema
export const ProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().optional(),
  status: ProjectStatusSchema,
});

export type ProjectType = z.infer<typeof ProjectSchema>;

// Filter Types
export type StatusOption =
  | "all"
  | "active"
  | "completed"
  | "archived"
  | "pending"
  | "error";
export type SortField = "title" | "date" | "priority" | "status";
export type SortOrder = "asc" | "desc";
export type DateRange = "all" | "today" | "week" | "month" | "quarter" | "year";

export interface FilterState {
  status: StatusOption;
  sortField: SortField;
  sortOrder: SortOrder;
  dateRange: DateRange;
  page?: number; // Optional for pagination
  search: string;
}

// Sheet Types
export interface Sheet {
  id: string;
  name: string;
}

// File Upload Types
export interface UploadedFileInfo {
  id: string;
  file_id: number;
  file_name: string;
  file_link: string;
  sheets: Sheet[];
  progress: number;
  status: FileStatus;
}

 type FileStatus = "uploading" | "completed" | "error";

export interface UploadProgress {
  fileId: string;
  progress: number;
}

export interface UploadResponse {
  success: boolean;
  file_id: number;
  file_link: string;
  file_name: string;
  message?: string;
}

// API Response Types
export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    file_id: number;
    filename: string;
    storage_path: string;
    file_size: number;
    content_type: string;
    project_id: number;
    message: string;
  };
  error: null | string;
  metadata: null | Record<string, unknown>;
}

// Sheet Types
export interface SheetType {
  name: string;
  isValidated: boolean;
}

// Sheet Mapping Types
export interface SheetMapping {
  fileId: string;
  sheetId: string;
  sheetType: string;
  sheetIndex: number; // Add this line
}

// Form Types
export interface FormValues {
  mappings: SheetMapping[];
}

// Form Validation Schemas
export const formSchema = z.object({
  mappings: z
    .array(
      z.object({
        fileId: z.string().min(1, "File selection is required"),
        sheetId: z.string().min(1, "Sheet selection is required"),
        sheetType: z.string().min(1, "Sheet type selection is required"),
        // sheetName: z.string().min(1, "Sheet name is required").optional(),
        sheetIndex: z.number().min(0, "Sheet index is required"),
      }),
    )
    .min(1, "At least one mapping is required"),
});

export const MappingSchema = z.object({
  id: z.string(),
  fileId: z.string().min(1, "File is required"),
  sheetId: z.string().min(1, "Sheet is required"),
  sheetType: z.string().min(1, "Sheet type is required"),
  mappings: z.record(z.string(), z.string()),
});

 type MappingType = z.infer<typeof MappingSchema>;

// API Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  modified_date: string;
  team_id: string;
  priority?: number;
}

// API Request Types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  status: ProjectStatus;
  team_id: string;
}

export interface UpdateProjectStatusRequest {
  status: ProjectStatus;
}

 interface ProcessFilesRequest {
  files: UploadedFileInfo[];
  mappings: MappingType[];
}

// Helper Functions
export const mapFormToApiRequest = (
  formData: ProjectType,
  teamId: string,
): CreateProjectRequest => ({
  name: formData.projectName,
  description: formData.projectDescription,
  status: formData.status,
  team_id: teamId,
});

export const mapFileUploadToApiRequest = (
  formData: FormValues,
  files: UploadedFileInfo[],
): ProcessFilesRequest => ({
  files,
  mappings: formData.mappings.map((mapping) => ({
    id: mapping.fileId,
    fileId: mapping.fileId,
    sheetId: mapping.sheetId,
    // sheetName: mapping.sheetName,
    sheetType: mapping.sheetType,
    mappings: {},
  })),
});

export interface FileMetadata {
  file_id: number;
  file_link: string;
  file_name: string;
  status: FileStatus;
}

// Update the error handling types
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message: string;
}


// Base interface for all items
export interface BaseItem {
  [key: string]: unknown; // changed from any to unknown for type safety
  id?: string;
  name: string;
  status: string;
}

// Analysis interface extending BaseItem
export interface SheetItem extends BaseItem {
  status: StatusEnum;
}

// Update Panel Props types
export interface AnalysisPanelProps {
  analysis: Analysis[];
  selectedItem: SelectedItem | null;
  onItemClick: (item: Analysis, type: "analysis", index: number) => void;  // Made type more specific
  statusDotColors: Record<StatusEnum, string>;
  onAnalysisCreate: (selectedAnalyses: Analysis[]) => void;
  createdAnalysisTemplateIds: string[];
}

export interface SheetsPanelProps {
  sheets: SheetItem[];
  selectedItem: SelectedItem | null;
  onItemClick: (item: SheetItem, type: "sheet", index: number) => void;  // Made type more specific
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
  isLoading?: boolean;
  refetchSheets?: () => void;
  clearSelectedSheet?: () => void;
}

// Mobile Sidebar Props
export interface MobileSidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedTab: "sheets" | "analysis";
  setSelectedTab: (tab: "sheets" | "analysis") => void;
  sheets: SheetItem[];
  analysis: Analysis[];
  selectedItem: { index: number; type: "sheet" | "analysis" } | null;
  onItemClick: (
    item: Analysis | SheetItem,
    type: "sheet" | "analysis",
    index: number
  ) => void;
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
  onAnalysisCreate: (selectedAnalyses: Analysis[]) => void;
  createdAnalysisTemplateIds: string[];
  refetchSheets?: () => void;
  clearSelectedSheet?: () => void;
}

// Sheet Type View Types
export interface ApiResponse {
  success: boolean;
  message: string;
  data: SheetApiResponse;
  error: null | string;
  metadata: Record<string, unknown> | null;
}

export interface SheetApiResponse {
  fileId: string;
  fileUrl: string;
  status: "pending" | "processing" | "completed" | "validated" | "failed";
  taskId: string;
  message?: string;
  progress?: number;
  stage?: string;
  type?: string;
  timestamp?: string;
  projectId?: string;
  sheetType?: string;
  resultUrl?: string;
  createdAt?: string;
  completedAt?: string;
  metadata: {
    fileName: string;
    fileSize: string;
    sheetIndex?: number;
    sheetType: string;
    lastModified: string;
  };
}

export interface SpreadsheetViewProps {
  title?: string;
  sheetType: string;
  onError?: (error: Error) => void;
  onFileLoad?: (sheetNames: string[]) => void;
  onFileUpload?: (file: File) => void;
  onDelete?: () => void;
  enableSSE?: boolean;
  onClearSelection?: () => void;
}

export interface DownloadButtonProps {
  fileUrl?: string;
  isDisabled?: boolean;
  fileName?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

export interface DeleteFileProps {
  projectId: string;
  sheetType: string;
  isDisabled?: boolean;
  fileName?: string;
  onDeleteStart?: () => void;
  onDeleteComplete?: () => void;
  onDeleteError?: (error: Error) => void;
}

// File Upload Related Types
export interface FileUploaderProps {
  onUploadComplete?: (file: File) => void;
  onUploadError?: (error: Error) => void;
}

export interface SheetRow {
  fileId: string;
  fileName: string;
  sheetId: string;
  sheetName: string;
  sheetIndex: number;
  mappingIndex?: number;
  isEmpty?: boolean;
}

export interface SheetMapperProps {
  form: UseFormReturn<FormValues>;
}

export interface FileUploadMappingProps {
  refetchSheets?: () => void;
  clearSelectedSheet?: () => void;
}


// Create Analysis props :
// API response mapping types
export interface ApiAnalysis {
  id?: string;
  name?: string;
  summary?: string;
}

export interface ApiSubSection {
  id?: string;
  name?: string;
  analyses?: ApiAnalysis[];
}

export interface ApiSection {
  id?: string;
  name?: string;
  subSections?: ApiSubSection[];
}

export interface Section {
  id: string;
  name: string;
  subSections: SubSection[];
}

export interface SubSection {
  id: string;
  name: string;
  analyses: Analysis[];
}

// --- Analysis View Types Centralized ---

export interface AnalysisApiResponse {
  analysisId: string;
  fileUrl: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "not_started"
    | "not_mapped"
    | "draft"
    | "running";
  message?: string;
  progress?: number;
  lastAnalysisDate?: string;
  sourceFileLastModified?: string;
  isSourceFileChanged?: boolean;
  fileMappingStatus?: boolean;
  isColumnMapped?: boolean;
  metadata?: {
    fileName?: string;
    fileSize?: string;
    recordCount?: number;
    analysisParameters?: {
      threshold?: string;
      dateRange?: string;
    };
    sourceFileName?: string;
  };
  sourceFileId?: string;
  sourceFileName?: string;
}

export interface SourceFile {
  id: string;
  name: string;
}

// Define API error response type for analysis view
export interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export interface AnalysisViewProps {
  title?: string;
  analysisType: string;
  onError?: (error: Error) => void;
  onAnalysisComplete?: () => void;
  enableSSE?: boolean;
  onClose?: () => void;
}

export interface AnalysisStatusViewProps {
  analysisData: AnalysisApiResponse;
  projectId: string;
  analysisType: string;
  onTriggerAnalysis: () => void;
  isTriggering: boolean;
  onRerunAnalysis?: () => void;
  rerunLoading?: boolean;
}

// Column Mapping Dialog Types
export interface ColumnMappingSourceColumn {
  id: string;
  name: string;
  required: boolean;
  summary?: string;
}

export interface ColumnMappingTargetColumn {
  id: string;
  name: string;
  required: boolean;
}

export interface ColumnMappingDialogProps {
  projectId: string;
  analysisType: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  children?: React.ReactNode;
}

// --- Project Context Types ---

// Item type used in context
export type Item = {
  id?: string;
  name?: string;
  status?: string;
  summary?: string;
  templateId?: string;
  [x: string]: unknown;
};

// SelectedItem type for context
export type SelectedItem = Item & {
  type: "sheet" | "analysis";
  index: number;
};

// AnalysisAPIItem type for context
export type AnalysisAPIItem = {
  working_id: string;
  working_name: string;
  status: string;
};

// ProjectContextType interface
export interface ProjectContextType {
  // States
  selectedItem: SelectedItem | null;
  sheets: Item[];
  analysis: AnalysisAPIItem[];
  loading: boolean;
  isMobile: boolean;
  sidebarOpen: boolean;
  selectedTab: "sheets" | "analysis";
  projectId: string;

  // Actions
  setSelectedItem: (item: SelectedItem | null) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedTab: (tab: "sheets" | "analysis") => void;
  toggleSidebar: () => void;
  handleClearSelection: () => void;

  // Data actions
  handleItemClick: (
    item: Item,
    type: "sheet" | "analysis",
    index: number
  ) => void;
  handleAnalysisCreate: (selectedAnalyses: Analysis[]) => void;

  // Query states and actions
  isSheetsLoading: boolean;
  isAnalysisLoading: boolean;
  refetchSheets: () => void;

  // Utility functions
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
  normalizeSheet: (item: Item) => { name: string; status: StatusEnum };
  toAnalysisItem: (item: Analysis | AnalysisAPIItem | Item) => Analysis;
  getCreatedAnalysisTemplateIds: () => string[];
}

// AI Column Mapping Response Type
export interface AiColumnMappingResponse {
  success: boolean;
  message: string;
  data: {
    project_id: number;
    working_type_id: number;
    working_type_name: string;
    working_type_key: string;
    required_files: string[];
    mappings: Record<string, Record<string, string>>;
    analysis_results: Record<
      string,
      {
        status: string;
        mappings_found: number;
        total_required: number;
        file_url: string;
      }
    >;
    total_files_analyzed: number;
  };
  error: string | null;
  metadata: Record<string, unknown> | null;
}

// New type for sheet type mapping state
export type SheetTypeMappingState = {
  [sheetType: string]: {
    sourceColumns: ColumnMappingSourceColumn[];
    targetColumns: ColumnMappingTargetColumn[];
    columnMappingQuery: { data: Record<string, string> };
    approvedMappings: Set<string>;
  };
};
