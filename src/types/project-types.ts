import { z } from "zod";


export const ProjectSchema = z.object({
  projectName: z
    .string()
    .min(3, { message: "Project name must be at least 3 characters" })
    .max(100, { message: "Project name must not exceed 100 characters" }),
  projectDescription: z
    .string()
    .min(10, { message: "Project description must be at least 10 characters" })
    .max(1000, { message: "Project description must not exceed 1000 characters" }),
});


export type ProjectType = z.infer<typeof ProjectSchema>;

// types for files upload :
export const mappingSchema = z.object({
  standardSheetId: z.string(),
  fileId: z.string(),
  sheetName: z.string(),
})

export const formSchema = z.object({
  mappings: z.array(mappingSchema),
})

export type FormValues = z.infer<typeof formSchema>

export type FileStatus = "uploading" | "completed" | "error"

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: FileStatus
  file: File
  sheets: string[]
}

export interface StandardSheet {
  id: string
  name: string
}

export interface SheetMapping {
  standardSheetId: string
  fileId: string
  sheetName: string
}
