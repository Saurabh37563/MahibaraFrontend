import { z } from "zod";

// Define the status enum first
export const ProjectStatusEnum = {
  COMPLETED: "completed",
  IN_PROGRESS: "in-progress",
  PENDING: "pending",
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  ERROR: "error",
} as const;

// Create the Zod schema for status
export const ProjectStatusSchema = z.enum([
  ProjectStatusEnum.COMPLETED,
  ProjectStatusEnum.IN_PROGRESS,
  ProjectStatusEnum.PENDING,
  ProjectStatusEnum.DRAFT,
  ProjectStatusEnum.ACTIVE,
  ProjectStatusEnum.ARCHIVED,
  ProjectStatusEnum.ERROR,
]);

// Create the Project schema
export const ProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().optional(),
  status: ProjectStatusSchema,
});

// Filter types
export type StatusOption = "all" | "active" | "completed" | "archived" | "pending" | "error";
export type SortField = "title" | "date" | "priority" | "status";
export type SortOrder = "asc" | "desc";
export type DateRange = "all" | "today" | "week" | "month" | "quarter" | "year";

export interface FilterState {
  status: StatusOption;
  sortField: SortField;
  sortOrder: SortOrder;
  dateRange: DateRange;
  search: string;
}

// File Upload & Mapping Types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  data?: ArrayBuffer;
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

// Mapping schema for connecting uploaded files to standard sheets
export const MappingSchema = z.object({
  id: z.string(),
  fileId: z.string().min(1, "File is required"),
  sheetName: z.string().min(1, "Sheet is required"),
  mappings: z.record(z.string(), z.string()),
});

// Form schema for the entire file upload and mapping form
export const formSchema = z.object({
  mappings: z.array(MappingSchema),
});

// Form Types (used in React components)
export type ProjectType = z.infer<typeof ProjectSchema>;
export type MappingType = z.infer<typeof MappingSchema>;
export type FormValues = z.infer<typeof formSchema>;

// API Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: z.infer<typeof ProjectStatusSchema>;
  modifiedDate: string;
  team_id: string;
  priority?: number;
}

// API Request Types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  status: z.infer<typeof ProjectStatusSchema>;
  team_id: string;
}

export interface UpdateProjectStatusRequest {
  status: z.infer<typeof ProjectStatusSchema>;
}

// File Processing API Request Types
export interface ProcessFilesRequest {
  files: UploadedFile[];
  mappings: MappingType[];
}

export interface FileProcessingResult {
  success: boolean;
  fileId: string;
  processedRecords: number;
  errors?: string[];
}

// Type mapping helper for form to API conversion
export const mapFormToApiRequest = (
  formData: ProjectType,
  teamId: string
): CreateProjectRequest => ({
  name: formData.projectName,
  description: formData.projectDescription,
  status: formData.status,
  team_id: teamId,
});

// Helper for mapping file upload form submissions
export const mapFileUploadToApiRequest = (
  formData: FormValues
): ProcessFilesRequest => ({
  files: [], // This would be populated from your uploadedFiles state
  mappings: formData.mappings,
});

// Re-export ProjectStatus type from context for convenience
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;


export interface FilterState {
  status: StatusOption;
  sortField: SortField;
  sortOrder: SortOrder;
  dateRange: DateRange;
  search: string;
}