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
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { GrValidate } from "react-icons/gr";

type ValidateFileProps = {
  sheet_type: string;
  file_id: string;
  project_id: string;
  isDisabled?: boolean;
  fileName?: string;
  onValidateStart?: () => void;
  onValidateComplete?: () => void;
  onValidateError?: (error: Error) => void;
  onRefetchData?: () => void; // Function to trigger query call in parent
};

const ValidateFile = ({
  sheet_type,
  file_id,
  project_id,
  isDisabled,
  fileName,
  onValidateStart,
  onValidateComplete,
  onValidateError,
  onRefetchData,
}: ValidateFileProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message?: string;
    warnings?: string[];
  } | null>(null);

  // File validation function with proper API integration
  const validateFile = async (
    sheet_type: string,
    file_id: string,
    project_id: string
  ) => {
    try {
      const response = await fetch(`/api/files/${file_id}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheet_type,
          project_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Validation failed:", error);
      throw error;
    }
  };

  const handleValidate = async () => {
    if (!sheet_type || !file_id || !project_id) return;

    setLoading(true);
    setError(null);
    setValidationResult(null);
    onValidateStart?.();

    try {
      const result = await validateFile(sheet_type, file_id, project_id);

      setValidationResult({
        success: result.success || true,
        message: result.message,
        warnings: result.warnings,
      });

      onValidateComplete?.();

      // Trigger parent component to refetch data
      onRefetchData?.();

      // Auto-close if successful and no warnings
      if (
        result.success &&
        (!result.warnings || result.warnings.length === 0)
      ) {
        setTimeout(() => setOpen(false), 2000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Validation failed: ${errorMessage}`);
      onValidateError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled =
    loading || isDisabled || !sheet_type || !file_id || !project_id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isButtonDisabled}
          title={
            sheet_type && file_id && project_id
              ? "Validate File Data"
              : "Cannot validate file"
          }
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <GrValidate size={14} />
          )}
          Validate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validate File</DialogTitle>
          <DialogDescription>
            {fileName ? (
              <>
                Validate data integrity and format for{" "}
                <strong>&quot;{fileName}&apos;</strong>
                <br />
                <span className="text-sm text-gray-500 mt-1 block">
                  File ID: {file_id} • Sheet: {sheet_type} • Project:{" "}
                  {project_id}
                </span>
              </>
            ) : (
              <>
                This will validate the file data integrity and format
                compliance.
                <br />
                <span className="text-sm text-gray-500 mt-1 block">
                  File ID: {file_id} • Sheet: {sheet_type} • Project:{" "}
                  {project_id}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {validationResult && (
          <div
            className={`p-3 border rounded-md ${
              validationResult.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-2">
              {validationResult.success ? (
                <CheckCircle
                  size={16}
                  className="text-green-600 mt-0.5 flex-shrink-0"
                />
              ) : (
                <AlertCircle
                  size={16}
                  className="text-red-600 mt-0.5 flex-shrink-0"
                />
              )}
              <div className="text-sm">
                <div
                  className={`font-medium ${
                    validationResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {validationResult.success
                    ? "Validation Successful"
                    : "Validation Failed"}
                </div>
                {validationResult.message && (
                  <div
                    className={`mt-1 ${
                      validationResult.success
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {validationResult.message}
                  </div>
                )}
                {validationResult.warnings &&
                  validationResult.warnings.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-amber-800">
                        Warnings:
                      </div>
                      <ul className="mt-1 text-amber-700 text-xs">
                        {validationResult.warnings.map((warning, index) => (
                          <li key={index} className="ml-2">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setError(null);
              setValidationResult(null);
            }}
            disabled={loading}
          >
            {validationResult ? "Close" : "Cancel"}
          </Button>
          {!validationResult && (
            <Button onClick={handleValidate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                <>Validate</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValidateFile;
