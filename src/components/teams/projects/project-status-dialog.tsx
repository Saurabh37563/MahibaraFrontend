import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUpdateProjectStatus } from "@/queries/project-query";
import { Project } from "@/types/project-types";
import { Check, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FiLoader } from "react-icons/fi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProjectStatusDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StatusOption = {
  value: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

const statusOptions: StatusOption[] = [
  {
    value: "completed",
    label: "Completed",
    color: "text-emerald-700",
    bgColor: "bg-emerald-700/10",
    borderColor: "border-emerald-700",
  },
  {
    value: "in-progress",
    label: "In Progress",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    borderColor: "border-blue-600",
  },
  {
    value: "pending",
    label: "Pending",
    color: "text-amber-600",
    bgColor: "bg-amber-600/10",
    borderColor: "border-amber-600",
  },
  {
    value: "draft",
    label: "Draft",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500",
  },
];

export function ProjectStatusDialog({
  project,
  open,
  onOpenChange,
}: ProjectStatusDialogProps) {
  const [status, setStatus] = useState<string | any>(project.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateStatusMutation = useUpdateProjectStatus();

  // Reset status when dialog opens
  useEffect(() => {
    if (open) {
      setStatus(project.status);
      setIsSubmitting(false);
    }
  }, [open, project.status]);

  const handleUpdateStatus = async () => {
    if (status === project.status) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateStatusMutation.mutateAsync({
        team_id: project.team_id,
        project_id: project.id,
        status: { status },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Project Status</DialogTitle>
          <DialogDescription>
            Change the status for project &quot;{project.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setStatus(option?.value)}
                disabled={isSubmitting || project?.status === "completed"}
                variant={"ghost"}
                className={cn(
                  "flex  items-center justify-between px-4 py-3 rounded-lg border-2 transition-all",
                  status === option.value
                    ? `${option.borderColor} ${option.bgColor} shadow-sm`
                    : "border-transparent hover:border-gray-200 bg-gray-100 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800",
                  // Removed all focus:ring classes
                  "focus:outline-none focus:ring-0 focus:ring-offset-0"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    status === option.value
                      ? option.color
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {option.label}
                </span>

                {status === option.value && (
                  <span className={cn("rounded-full", option.color)}>
                    <Check className="h-5 w-5" />
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
        {project?.status === "completed" ? (
          <Alert className="border-blue-200 bg-blue-50">
            <Info color="blue" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              You can not change status of a completed project.
            </AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDialogClose}
            disabled={isSubmitting}
            className="mr-2"
          >
            Cancel
          </Button>

          <Button
            onClick={handleUpdateStatus}
            disabled={
              project?.status === "completed" ||
              isSubmitting ||
              status === project.status
            }
            className={cn("relative", isSubmitting && "text-transparent")}
          >
            {isSubmitting ? (
              <>
                <span className="text-transparent">Updating Status</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <FiLoader className="animate-spin" />
                </span>
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
