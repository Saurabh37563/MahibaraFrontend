import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { DownloadButtonProps } from "@/types/project-types";

const DownloadFile = ({
  fileUrl,
  isDisabled,
  fileName,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}: DownloadButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modern download function using fetch with better error handling
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Check if browser supports the newer showSaveFilePicker API
      if ("showSaveFilePicker" in window) {
        try {
          // Modern File System Access API (Chrome 86+, Edge 86+)
          type ShowSaveFilePickerType = (
            options: SaveFilePickerOptions
          ) => Promise<FileSystemFileHandle>;
          interface SaveFilePickerOptions {
            suggestedName?: string;
            types?: Array<{
              description?: string;
              accept: Record<string, string[]>;
            }>;
          }
          const maybeWindow = window as unknown as {
            showSaveFilePicker?: ShowSaveFilePickerType;
          };
          if (typeof maybeWindow.showSaveFilePicker === "function") {
            const fileHandle = await maybeWindow.showSaveFilePicker({
              suggestedName: filename,
              types: [
                {
                  description: "Downloaded file",
                  accept: { "*/*": [] },
                },
              ],
            });

            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            return { success: true, cancelled: false };
          }
        } catch (fsError: unknown) {
          // Check if user cancelled the save dialog
          const errorObj = fsError as { name?: string; message?: string };
          if (
            errorObj?.name === "AbortError" ||
            errorObj?.message?.includes("aborted")
          ) {
            console.log("User cancelled the save dialog");
            return { success: false, cancelled: true };
          }

          // API not supported or other error, fall back to traditional method
          console.log(
            "File System Access API not available or error occurred, using fallback:",
            errorObj?.message
          );
          // Continue to fallback method below
        }
      }

      // Fallback to traditional download method
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;

      // Ensure the link is hidden and temporary
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      return { success: true, cancelled: false };
    } catch (error: unknown) {
      console.error("Download failed:", error);
      throw error;
    }
  };

  const handleDownload = async () => {
    if (!fileUrl) return;

    setLoading(true);
    setError(null);
    onDownloadStart?.();

    try {
      // Extract filename from URL if not provided
      const finalFileName =
        fileName || extractFilenameFromUrl(fileUrl) || "downloaded-file";

      const result = await downloadFile(fileUrl, finalFileName);

      // Handle the result properly
      if (result && result.cancelled) {
        // User cancelled the download, just close the modal without showing error
        console.log("Download was cancelled by user");
        setOpen(false);
        return;
      }

      // Download was successful
      onDownloadComplete?.();
      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to download file: ${errorMessage}`);
      onDownloadError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract filename from URL
  const extractFilenameFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split("/").pop();
      return filename && filename.includes(".") ? filename : null;
    } catch {
      return null;
    }
  };

  // Handle modal close - reset states
  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setError(null);
      // Don't reset loading state immediately to prevent flashing
      if (!loading) {
        setLoading(false);
      }
    }
  };

  const isButtonDisabled = loading || isDisabled || !fileUrl;

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isButtonDisabled}
          title={fileUrl ? "Download File" : "File not available"}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Download</DialogTitle>
          <DialogDescription>
            {fileName || extractFilenameFromUrl(fileUrl || "")
              ? `Are you sure you want to download "${
                  fileName || extractFilenameFromUrl(fileUrl || "")
                }"?`
              : "Are you sure you want to download this file?"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              "Download"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadFile;
