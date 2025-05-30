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
        form.reset();
        setMappings([]);
        setStep(1);
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
    setIsOpen(open);
    if (!open) {
      form.reset({ mappings: [] });
      setMappings([]);
      setStep(1);
    }
  };

  // Only enable "Process" if all files are either completed or error
  const allFilesProcessed =
    uploadedFiles.length > 0 &&
    uploadedFiles.every(
      (file) => file.status === "completed" || file.status === "error"
    );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant={"ghost"}>
          <IoMdAdd className="text-muted-foreground cursor-pointer" size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-dvh px-0">
        <DialogHeader className="border-b pb-2 px-2">
          <DialogTitle>
            {step === 1 ? "Upload Files" : "Map Sheets"}
          </DialogTitle>
        </DialogHeader>
        <Card className="w-full border-0 px-0 shadow-none">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                {form.formState.errors.root && (
                  <div className="text-sm font-medium text-destructive">
                    {form.formState.errors.root.message}
                  </div>
                )}

                {step === 1 ? <FileUploader /> : <SheetMapper form={form} />}
              </CardContent>
            </form>
          </Form>
        </Card>

        <DialogFooter className="flex px-2 justify-between">
          {step === 1 ? (
            <div className="flex justify-end w-full">
              <Button
                type="button"
                onClick={nextStep}
                className="bg-green-900 hover:bg-green-800"
                disabled={!allFilesProcessed}
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
