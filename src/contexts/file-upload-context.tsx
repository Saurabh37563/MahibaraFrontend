"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type {
  UploadedFileInfo,
  SheetType,
  SheetMapping,
  Sheet,
  FileMetadata,
} from "@/types/project-types";
import axios from "axios";
import { FILE_UPLOAD_ENDPOINTS } from "@/constants/endpoints-constant";

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
  const [sheetTypes, setSheetTypes] = useState<SheetType[]>([]);
  const [mappings, setMappings] = useState<SheetMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSheetTypes() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          FILE_UPLOAD_ENDPOINTS?.getSheetTypes, // use projectId
          {
            headers: {
              Authorization: `Bearer test-token`,
            },
          }
        );
        const dummySheetTypes = response?.data?.data;
        const reponseValidatedTypes = await axios.get(
          FILE_UPLOAD_ENDPOINTS?.getValidatedSheetTypes + "/" + projectId, // use projectId
          {
            headers: {
              Authorization: `Bearer test-token`,
            },
          }
        );

        const dummyValidatedSheets = reponseValidatedTypes?.data?.data;

        // Simulate network delay
        await new Promise((res) => setTimeout(res, 500));

        const allSheetTypes = dummySheetTypes.map((type: string) => ({
          name: type,
          isValidated: dummyValidatedSheets.includes(type),
        }));

        setSheetTypes(allSheetTypes);
      } catch (err) {
        console.error("Error fetching sheet types:", err);
        setError("Failed to load sheet types. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchSheetTypes();
    }
  }, [projectId]);

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
