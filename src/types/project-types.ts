import { z } from "zod";

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

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

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

export type FileStatus = "uploading" | "completed" | "error";

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
  metadata: null | any;
}

// Sheet Types
export interface SheetType {
  name: string;
  isValidated: boolean;
}

export interface SheetData {
  name: string;
  headers: string[];
  rows: Record<string, any>[];
}

export interface StandardSheet {
  id: string;
  name: string;
  fields: string[];
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

export type MappingType = z.infer<typeof MappingSchema>;

// API Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  modifiedDate: string;
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

export interface ProcessFilesRequest {
  files: UploadedFileInfo[];
  mappings: MappingType[];
}

export interface FileProcessingResult {
  success: boolean;
  fileId: string;
  processedRecords: number;
  errors?: string[];
}

export interface SheetMappingSubmitRequest {
  project_id: string;
  mappings: Array<{
    file_id: number;
    file_name: string;
    sheet_id: string;
    sheet_name: string;
    sheet_type: string;
    sheet_index: number; // Add this line
  }>;
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
