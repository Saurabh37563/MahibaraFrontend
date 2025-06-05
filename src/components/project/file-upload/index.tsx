"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUploader } from "./file-uploader";
import { SheetMapper } from "./sheet-mapper";
import { ApiError, formSchema, type FormValues } from "@/types/project-types";
import { IoMdAdd } from "react-icons/io";
import { toast } from "sonner";
import {
  FileUploadProvider,
  useFileUpload,
} from "@/contexts/file-upload-context";
import axios from "axios";
import { FILE_UPLOAD_ENDPOINTS } from "@/constants/endpoints-constant";
import { useParams } from "next/navigation";

type FileUploadMappingProps = {
  refetchSheets?: () => void;
  clearSelectedSheet?: () => void;
};

export function FileUploadMappingWrapper(props: FileUploadMappingProps) {
  const params = useParams();
  const projectId = params?.id as string;
  return (
    <FileUploadProvider projectId={projectId}>
      <FileUploadMapping {...props} />
    </FileUploadProvider>
  );
}

function FileUploadMapping({
  refetchSheets,
  clearSelectedSheet,
}: FileUploadMappingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const {
    uploadedFiles,
    mappings,
    setMappings,
    error: contextError,
    setError,
    setUploadedFiles,
  } = useFileUpload();
  const params = useParams();
  const projectId = params?.id as string;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mappings: [],
    },
  });

  useEffect(() => {
    if (mappings.length > 0) {
      form.setValue("mappings", mappings, {
        shouldValidate: true,
      });
    }
  }, [mappings, form]);

  useEffect(() => {
    if (contextError) {
      toast.error("Error", {
        description: contextError,
      });
    }
  }, [contextError]);

  const nextStep = () => {
    if (uploadedFiles.length === 0) {
      toast.error("Error", {
        description: "Please upload at least one file before proceeding",
      });
      return;
    }

    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const clearAllStates = () => {
    form.reset({ mappings: [] }); // Reset form
    setMappings([]); // Reset mappings in context
    setStep(1); // Reset step
    setIsLoading(false); // Reset loading state
    setUploadedFiles([]); // Clear uploaded files from context
    setError(null); // Clear any errors in context
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      if (!data.mappings || data.mappings.length === 0) {
        toast.error("Error", {
          description:
            "Please complete at least one mapping before submitting.",
        });
        return;
      }

      const response = await axios.post(FILE_UPLOAD_ENDPOINTS.submitMappings, {
        project_id: projectId, // use dynamic projectId from params
        mappings: data.mappings.map((mapping) => {
          const file = uploadedFiles.find((f) => f.id === mapping.fileId);
          if (!file)
            throw new Error(`File not found for mapping: ${mapping.fileId}`);

          return {
            file_id: file.file_id,
            file_name: file.file_name,
            sheet_type: mapping.sheetType,
            sheet_index: mapping.sheetIndex, // Add this line
          };
        }),
      });

      if (response.data.success) {
        clearAllStates();
        setIsOpen(false);
        toast.success("Sheet mappings submitted successfully!");
        if (refetchSheets) refetchSheets(); // Invalidate mapped sheets
        if (clearSelectedSheet) clearSelectedSheet(); // Clear selected sheet
      } else {
        throw new Error(response.data.message || "Failed to submit mappings");
      }
    } catch (error: unknown) {
      console.error("Error submitting mappings:", error);
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message ||
          apiError.message ||
          "Failed to submit mappings. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      clearAllStates();
    }
    setIsOpen(open);
  };

  useEffect(() => {
    return () => {
      clearAllStates(); // Cleanup on component unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant={"ghost"}>
          <IoMdAdd className="text-muted-foreground cursor-pointer" size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-screen !rounded-none !max-w-screen h-full w-full flex flex-col overflow-hidden p-0 gap-0">
        {/* Header */}
        <DialogHeader className="border-b p-4 shrink-0">
          <DialogTitle>
            {step === 1 ? "Upload Files" : "Map Sheets"}
          </DialogTitle>
        </DialogHeader>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Card className="w-full border-0 shadow-none">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="p-0">
                  {form.formState.errors.root && (
                    <div className="text-sm font-medium text-destructive mb-2">
                      {form.formState.errors.root.message}
                    </div>
                  )}
                  {step === 1 ? <FileUploader /> : <SheetMapper form={form} />}
                </CardContent>
              </form>
            </Form>
          </Card>
        </div>

        {/* Footer - fixed at bottom */}
        <DialogFooter className="border-t px-4 py-2 shrink-0 flex justify-between">
          {step === 1 ? (
            <div className="flex justify-end w-full">
              <Button
                type="button"
                onClick={nextStep}
                className="bg-green-900 hover:bg-green-800"
                disabled={uploadedFiles.length === 0}
              >
                Process
              </Button>
            </div>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button
                type="submit"
                className="bg-green-900 hover:bg-green-800"
                disabled={isLoading || mappings.length === 0}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FileUploadMappingWrapper;
