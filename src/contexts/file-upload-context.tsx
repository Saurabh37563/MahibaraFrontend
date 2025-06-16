"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type {
  UploadedFileInfo,
  SheetType,
  SheetMapping,
  Sheet,
  FileMetadata,
} from "@/types/project-types";
import { useSheetTypesWithValidation } from "@/queries/file-upload-query";

interface FileUploadContextType {
  uploadedFiles: UploadedFileInfo[];
  setUploadedFiles: (files: UploadedFileInfo[]) => void;
  sheetTypes: SheetType[];
  mappings: SheetMapping[];
  addFiles: (files: UploadedFileInfo[]) => void;
  updateFileProgress: (fileId: string, progress: number) => void;
  updateFileStatus: (
    fileId: string,
    status: "uploading" | "completed" | "error"
  ) => void;
  updateFileSheets: (fileId: string, sheets: Sheet[]) => void;
  updateFileMetadata: (fileId: string, metadata: FileMetadata) => void;
  removeFile: (fileId: string) => void;
  setMappings: (mappings: SheetMapping[]) => void;
  addMapping: (mapping: SheetMapping) => void;
  removeMapping: (index: number) => void;
  updateMapping: (index: number, mapping: SheetMapping) => void;
  isSheetTypeMapped: (sheetType: string) => boolean;
  isSheetTypeValidated: (sheetType: string) => boolean;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(
  undefined
);

interface FileUploadProviderProps {
  children: ReactNode;
  projectId: string;
}

export function FileUploadProvider({
  children,
  projectId,
}: FileUploadProviderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [mappings, setMappings] = useState<SheetMapping[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use React Query to fetch sheet types and validated sheet types
  const {
    data: sheetTypes = [],
    isLoading: loading,
    error: queryError,
  } = useSheetTypesWithValidation(projectId);

  // Sync query error with context error
  if (queryError && !error) {
    setError("Failed to load sheet types. Please try again.");
  }

  const addFiles = (files: UploadedFileInfo[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const updateFileProgress = (fileId: string, progress: number) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, progress } : file))
    );
  };

  const updateFileStatus = (
    fileId: string,
    status: "uploading" | "completed" | "error"
  ) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, status } : file))
    );
  };

  const updateFileSheets = (fileId: string, sheets: Sheet[]) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, sheets } : file))
    );
  };

  const updateFileMetadata = (fileId: string, metadata: FileMetadata) => {
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              file_id: metadata.file_id,
              file_link: metadata.file_link,
              file_name: metadata.file_name,
              status: metadata.status,
            }
          : file
      )
    );
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    setMappings((prev) => prev.filter((mapping) => mapping.fileId !== fileId));
  };

  const addMapping = (mapping: SheetMapping) => {
    setMappings((prev) => [...prev, mapping]);
  };

  const removeMapping = (index: number) => {
    setMappings((prev) => {
      const newMappings = [...prev];
      newMappings.splice(index, 1);
      return newMappings;
    });
  };

  const updateMapping = (index: number, mapping: SheetMapping) => {
    setMappings((prev) => {
      const newMappings = [...prev];
      newMappings[index] = mapping;
      return newMappings;
    });
  };

  const isSheetTypeMapped = (sheetType: string) => {
    return mappings.some((mapping) => mapping.sheetType === sheetType);
  };

  const isSheetTypeValidated = (sheetType: string) => {
    const type = sheetTypes.find((t) => t.name === sheetType);
    return type?.isValidated || false;
  };

  return (
    <FileUploadContext.Provider
      value={{
        uploadedFiles,
        setUploadedFiles,
        sheetTypes,
        mappings,
        addFiles,
        updateFileProgress,
        updateFileStatus,
        updateFileSheets,
        updateFileMetadata,
        removeFile,
        setMappings,
        addMapping,
        removeMapping,
        updateMapping,
        isSheetTypeMapped,
        isSheetTypeValidated,
        loading,
        error,
        setError,
      }}
    >
      {children}
    </FileUploadContext.Provider>
  );
}

export function useFileUpload() {
  const context = useContext(FileUploadContext);
  if (context === undefined) {
    throw new Error("useFileUpload must be used within a FileUploadProvider");
  }
  return context;
}
