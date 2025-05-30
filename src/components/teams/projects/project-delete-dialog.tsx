import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteProject } from "@/queries/project-query";
import { Project } from "@/types/project-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectDeleteDialogProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDeleteDialog({
  project,
  open,
  onOpenChange,
}: ProjectDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteProjectMutation = useDeleteProject();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Important: reset the deleting state when dialog closes
      // This fixes the UI becoming unresponsive issue
      setIsDeleting(false);
    }
  }, [open]);

  const handleDelete = async () => {
    if (isDeleting) return; // Prevent multiple clicks

    setIsDeleting(true);
    try {
      console.log("Deleting project:", project);
      await deleteProjectMutation.mutateAsync({
        team_id: project.team_id,
        project_id: project.id,
      });

      // Allow animation to complete before closing
      setTimeout(() => {
        onOpenChange(false);
      }, 300);
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false); // Only reset state on error
    }
  };

  const handleDialogClose = () => {
    // Only allow closing if not in the middle of deleting
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            project &quot;{project.name}&quot; and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            disabled={isDeleting}
            className="mt-0"
            onClick={() => {
              if (!isDeleting) {
                onOpenChange(false);
              }
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={(e) => {
              e.preventDefault(); // Important to prevent default action
              handleDelete();
            }}
            disabled={isDeleting}
            variant="destructive"
            className={cn("relative", isDeleting && "text-transparent")}
          >
            {isDeleting ? (
              <>
                <span className="text-transparent">Deleting...</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              </>
            ) : (
              "Delete Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
