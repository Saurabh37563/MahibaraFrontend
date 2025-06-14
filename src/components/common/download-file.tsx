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
import axios from "axios";
import { saveAs } from "file-saver";
import { toast } from "sonner";

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

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });
      saveAs(response.data, filename);
      return { success: true };
    } catch (error: unknown) {
      // Type guard for error object with message and response
      if (typeof error === "object" && error !== null && "message" in error) {
        const err = error as {
          message?: string;
          response?: { status?: number; headers?: unknown };
        };
        console.error("Download failed:", {
          message: err.message,
          status: err.response?.status,
          headers: err.response?.headers,
        });
      } else {
        console.error("Download failed:", error);
      }
      throw error;
    }
  };

  const handleDownload = async () => {
    if (!fileUrl) return;

    setLoading(true);
    setError(null);
    onDownloadStart?.();

    try {
      const finalFileName =
        fileName || extractFilenameFromUrl(fileUrl) || "downloaded-file";
      await downloadFile(fileUrl, finalFileName);
      toast.success("File downloaded successfully.");
      onDownloadComplete?.();
      setOpen(false);
    } catch (error: unknown) {
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as Record<string, unknown>).message === "string"
      ) {
        errorMessage = String((error as Record<string, unknown>).message);
      }
      setError(`Failed to download file: ${errorMessage}`);
      toast.error(`Failed to download file: ${errorMessage}`);
      onDownloadError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setLoading(false);
    }
  };

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

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setError(null);
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
