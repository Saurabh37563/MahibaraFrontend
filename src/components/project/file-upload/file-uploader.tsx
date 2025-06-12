"use client";

import type React from "react";
import { useState, useRef } from "react";
import { FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { uploadToDigitalOcean } from "@/utils/storage-utils";
import { useFileUpload } from "@/contexts/file-upload-context";
import { toast } from "sonner";
import type { Sheet } from "@/types/project-types";
import { useParams } from "next/navigation";

const extractSheetsFromExcel = async (file: File): Promise<Sheet[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheets = workbook.SheetNames.map((name) => ({
          id: `${name}-${uuidv4()}`,
          name,
        }));
        resolve(sheets);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        reject([{ id: `Sheet1-${uuidv4()}`, name: "Sheet1" }]); // Fallback
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      reject([{ id: `Sheet1-${uuidv4()}`, name: "Sheet1" }]); // Fallback
    };

    reader.readAsArrayBuffer(file);
  });
};

export function FileUploader() {
  const {
    uploadedFiles,
    addFiles,
    removeFile,
    updateFileProgress,
    updateFileStatus,
    updateFileSheets,
    updateFileMetadata,
  } = useFileUpload();

  const params = useParams();
  const projectId = params?.id as string;
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList: FileList) => {
    try {
      setUploadError(null);
      const files = Array.from(fileList);

      const validFileTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      const invalidFiles = files.filter(
        (file) => !validFileTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        setUploadError("Only Excel and CSV files are allowed");
        return;
      }

      // Initialize new files in state
      const newFilesInfo = files.map((file) => ({
        id: `file-${uuidv4()}`,
        file_id: 0,
        file_name: file.name,
        file_link: "",
        sheets: [],
        progress: 0,
        status: "uploading" as const,
      }));

      addFiles(newFilesInfo);

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileInfo = newFilesInfo[i];

        try {
          // Extract sheets first
          let sheets: Sheet[] = [];
          if (file.type.includes("sheet") || file.type.includes("excel")) {
            sheets = await extractSheetsFromExcel(file);
          } else if (file.type === "text/csv") {
            sheets = [
              {
                id: `Data-${uuidv4()}`,
                name: `Data (${file.name.split(".")[0]})`,
              },
            ];
          }

          // Update file info with sheets
          updateFileSheets(fileInfo.id, sheets);

          // Upload to Digital Ocean
          // Always send hardcoded project id 38
          const uploadResult = await uploadToDigitalOcean(
            file,
            fileInfo.id,
            ({ fileId, progress }) => {
              updateFileProgress(fileId, progress);
            },
            projectId ? parseInt(projectId) : 38
          );

          if (!uploadResult.success) {
            throw new Error(uploadResult.message);
          }

          // Update file with response data
          updateFileMetadata(fileInfo.id, {
            file_id: uploadResult.file_id,
            file_link: uploadResult.file_link,
            file_name: uploadResult.file_name,
            status: "completed" as const,
          });
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          updateFileStatus(fileInfo.id, "error");
          toast.error(`Failed to process file ${file.name}`);
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error processing files:", err);
      toast.error(err.message || "Failed to process files");
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          "hover:border-green-800/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
          accept=".xlsx,.xls,.csv,.xlsb"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="bg-green-800/5 p-4 rounded-full">
            <FileText className="text-green-900 size-8" />
          </div>
          <p className="font-medium text-sm">
            Drag & drop files here or{" "}
            <span className="text-amber-800/60">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: .xlsx, .xls, .csv
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="rounded-md p-2 bg-green-700/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-900" />
                    <div>
                      <p className="font-medium text-sm">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.status === "completed"
                          ? "Uploaded"
                          : file.status === "error"
                          ? "Error"
                          : "Uploading..."}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-2">
                  <Progress value={file.progress} className="h-2" />
                  <p className="text-xs text-right mt-1 text-muted-foreground">
                    {file.status === "uploading"
                      ? `${file.progress}%`
                      : file.status === "completed"
                      ? "Uploaded"
                      : "Failed"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
