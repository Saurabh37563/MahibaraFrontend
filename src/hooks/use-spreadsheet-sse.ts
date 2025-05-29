import { useSSEContext } from "@/contexts/sse-context";
import { useEffect, useState } from "react";
import { FileStatusEvent } from "@/lib/sse-client";

interface SpreadsheetSSEOptions {
  projectId: string;
  sheetType: string;
  onStatusChange?: (status: FileStatusEvent["data"]) => void;
}

export function useSpreadsheetSSE({
  projectId,
  sheetType,
  onStatusChange,
}: SpreadsheetSSEOptions) {
  const { addEventListener, fileStatuses } = useSSEContext();
  const [status, setStatus] = useState<FileStatusEvent["data"] | null>(null);

  // Generate a unique event identifier for this spreadsheet
  const spreadsheetEventId = `${projectId}:${sheetType}`;

  useEffect(() => {
    // Listen for file status events specific to this spreadsheet
    const unsubscribe = addEventListener("file_status", (event) => {
      // Check if this event is for our spreadsheet
      if (event.data.fileId === spreadsheetEventId) {
        setStatus(event.data);
        onStatusChange?.(event.data);
      }
    });

    // Check if we already have a status for this spreadsheet
    const existingStatus = fileStatuses[spreadsheetEventId];
    if (existingStatus) {
      setStatus(existingStatus);
      onStatusChange?.(existingStatus);
    }

    return () => {
      unsubscribe();
    };
  }, [addEventListener, fileStatuses, spreadsheetEventId, onStatusChange]);

  return {
    status,
    isProcessing: status?.status === "processing",
    isComplete:
      status?.status === "completed" || status?.status === "validated",
    hasError: status?.status === "failed",
  };
}
