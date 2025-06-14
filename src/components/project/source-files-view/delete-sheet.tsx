import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { DeleteFileProps } from "@/types/project-types";
import { BASE_TEMP_BACKEND_URL } from "@/constants/endpoints-constant";

const DeleteSheet = ({
  projectId,
  sheetType,
  isDisabled,
  fileName,
  onDeleteStart,
  onDeleteComplete,
  onDeleteError,
}: DeleteFileProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserFriendlyMessage = (
    status: number | null,
    defaultMsg: string
  ) => {
    switch (status) {
      case 400:
        return "Invalid request. Please contact support.";
      case 401:
        return "You are not authorized. Please log in again.";
      case 403:
        return "You don't have permission to delete this file.";
      case 404:
        return "File not found. It may have already been deleted.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return defaultMsg;
    }
  };

  const deleteFile = async (projectId: string, sheetType: string) => {
    try {
      const response = await axios.delete(
        `${BASE_TEMP_BACKEND_URL}/api/projects/${projectId}/files/${sheetType}`
      );
      return response.data;
    } catch (err: unknown) {
      // err is unknown, so we need to narrow its type
      const axiosError = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = axiosError?.response?.status ?? null;
      const message = getUserFriendlyMessage(
        status,
        axiosError?.response?.data?.message || "Failed to delete the file."
      );
      throw new Error(message);
    }
  };

  const handleDelete = async () => {
    if (!projectId || !sheetType) return;

    setLoading(true);
    setError(null);
    onDeleteStart?.();

    try {
      await deleteFile(projectId, sheetType);
      onDeleteComplete?.();
      setOpen(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      onDeleteError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || isDisabled || !projectId || !sheetType;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isButtonDisabled}
          title={projectId && sheetType ? "Delete File" : "Cannot delete file"}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm File Deletion</DialogTitle>
          <DialogDescription>
            {fileName ? (
              <>
                Are you sure you want to delete
                <strong>&quot;{fileName}&quot;</strong>?
                <br />
                <span className="text-sm text-gray-500 mt-1 block">
                  Project: {projectId} • Type: {sheetType}
                </span>
              </>
            ) : (
              <>
                Are you sure you want to delete this file?
                <br />
                <span className="text-sm text-gray-500 mt-1 block">
                  Project: {projectId} • Type: {sheetType}
                </span>
              </>
            )}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={16}
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                />
                <div className="text-sm text-amber-800">
                  <strong>Warning:</strong> This action cannot be undone. The
                  file will be permanently deleted from the system.
                </div>
              </div>
            </div>
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} className="mr-2" />
                Delete File
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSheet;
