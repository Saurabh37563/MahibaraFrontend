"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MdOutlineFileDownload } from "react-icons/md";
import { Loader2 } from "lucide-react";
import FileUploadMapping from "./file-upload";
import { Button } from "@/components/ui/button";
import { LuFileSpreadsheet } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
// import axios from "axios";

// const StatusEnum = z.enum([
//   "success",
//   "warning",
//   "danger",
//   "info",
//   "neutral",
//   "uploaded",
// ]);

type StatusEnum =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "uploaded";

type Item = {
  name: string;
  status: StatusEnum;
};

interface SelectedItem {
  index: number;
  type: "sheet" | "analysis";
}

interface SheetsPanelProps {
  sheets: Item[];
  selectedItem: SelectedItem | null;
  onItemClick: (item: Item, type: "sheet" | "analysis", index: number) => void;
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
  isLoading?: boolean; // <-- add this
  refetchSheets?: () => void; // <-- add this
  clearSelectedSheet?: () => void; // <-- add this
}

export default function SheetsPanel({
  sheets,
  selectedItem,
  onItemClick,
  statusDotColors,
  mapStatusToUI,
  isLoading,
  refetchSheets,
  clearSelectedSheet,
}: SheetsPanelProps) {
  const params = useParams();
  const { id: projectId } = params as { id: string };
  const [isDownloading, setIsDownloading] = useState(false);

  // Dummy download function
  const handleDownload = async () => {
    if (isDownloading) return; // Prevent multiple downloads

    setIsDownloading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a dummy zip file content
      const dummyContent =
        "PK\x03\x04\x14\x00\x00\x00\x08\x00dummy zip file content";
      const blob = new Blob([dummyContent], {
        type: "application/zip",
      });

      const filename = `project_${projectId}_sheets_dummy.zip`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      console.log("Dummy download completed");
    } catch (error) {
      console.error("Download failed:", error);
      alert("An unexpected error occurred during download.");
    } finally {
      setIsDownloading(false);
    }
  };

  /* COMMENTED OUT - REAL API DOWNLOAD FUNCTION
  const handleDownload = async () => {
    if (isDownloading) return; // Prevent multiple downloads

    setIsDownloading(true);

    try {
      // For production: Use actual backend endpoint
      const response = await axios.get(
        `/api/projects/${projectId}/files/export`,
        {
          responseType: "blob",
          // Optional: Add progress tracking
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Download progress: ${percentCompleted}%`);
            }
          },
          // Add timeout to prevent hanging
          timeout: 300000, // 5 minutes
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/zip",
      });

      // Get filename from response headers or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `project_${projectId}_sheets.zip`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);

      // Handle different error types
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          alert("Download timeout. Please try again.");
        } else if (error.response?.status === 404) {
          alert("File not found. Please check if the project exists.");
        } else if (error.response?.status === 403) {
          alert("You don't have permission to download this file.");
        } else {
          alert(
            `Download failed: ${error.response?.data?.message || error.message}`
          );
        }
      } else {
        alert("An unexpected error occurred during download.");
      }
    } finally {
      setIsDownloading(false);
    }
  };
  */

  /* COMMENTED OUT - ALTERNATIVE DIRECT DOWNLOAD METHOD
  // Alternative method for direct file URL download (if backend provides direct links)
  const handleDirectDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      // Get download URL from backend
      const response = await axios.get(
        `/api/projects/${projectId}/files/download-url`
      );
      const { downloadUrl, filename } = response.data;

      // Create hidden link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        filename || `project_${projectId}_sheets.zip`
      );
      link.target = "_blank"; // Open in new tab for direct URLs

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Direct download failed:", error);
      alert("Failed to get download link.");
    } finally {
      setIsDownloading(false);
    }
  };
  */

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
        <div className="text-xs flex items-center gap-1">
          <span>Source Files</span>
          <span className="text-[12px] mt-[2px] text-muted-foreground">
            ({sheets.length})
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <FileUploadMapping
            refetchSheets={refetchSheets}
            clearSelectedSheet={clearSelectedSheet}
          />

          {/* Download Button with Loading State */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading || sheets.length === 0}
            title={
              sheets.length === 0
                ? "No sheets to download"
                : "Download Dummy ZIP File"
            }
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MdOutlineFileDownload
                className={`text-muted-foreground ${
                  sheets.length === 0
                    ? "opacity-50"
                    : "cursor-pointer hover:text-gray-700"
                }`}
                size={16}
              />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto py-4 px-2 flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded" />
            ))}
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <LuFileSpreadsheet className="text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-sm mb-2">No sheets available</p>
            <p className="text-gray-400 text-xs">
              Click the + button to add source files
            </p>
          </div>
        ) : (
          sheets.map((sheet, index) => (
            <div
              key={`sheet-${index}`}
              className={`flex group items-center justify-between rounded-sm p-2 hover:bg-slate-50 cursor-pointer transition-colors ${
                selectedItem?.index === index && selectedItem?.type === "sheet"
                  ? "bg-green-500/10 border-l-4 border-primary"
                  : ""
              }`}
              onClick={() => onItemClick(sheet, "sheet", index)}
            >
              <div className="text-xs flex items-center gap-2">
                <LuFileSpreadsheet className="text-gray-400" />
                <span className="text-gray-950 truncate">{sheet.name}</span>
                <span
                  className={`size-[6px] rounded-full flex-shrink-0 ${
                    statusDotColors[mapStatusToUI(sheet.status)]
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
