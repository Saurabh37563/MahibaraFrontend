import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useDeleteOrganization } from "@/queries/organization-query";
import { toast } from "sonner";

interface DeleteOrgModalProps {
  orgId: number;
  orgName?: string;
  onDeleted?: () => void;
  children?: React.ReactNode; // DropdownMenuItem as trigger
}

type ChildrenWithOnSelect = React.ReactElement & {
  props: {
    onSelect?: (e: Event) => void;
  };
};

const DeleteOrgModal: React.FC<DeleteOrgModalProps> = ({
  orgId,
  orgName,
  onDeleted,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const deleteOrganization = useDeleteOrganization();

  const handleOpenChange = (value: boolean) => setOpen(value);

  const handleDelete = async () => {
    try {
      console.log("Deleting organization with ID:", orgId);
      await deleteOrganization.mutateAsync(orgId);

      toast.success(`Organization "${orgName}" deleted successfully!`);
      setOpen(false);

      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error("Failed to delete organization:", error);
      toast.error("Failed to delete organization", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  };

  // Clone the child to attach the open handler
  const trigger =
    children && React.isValidElement(children)
      ? React.cloneElement(children as ChildrenWithOnSelect, {
          onSelect: (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);

            // Close any parent dropdown menu by triggering a click outside
            setTimeout(() => {
              document.dispatchEvent(
                new MouseEvent("mousedown", {
                  bubbles: true,
                })
              );
            }, 10);

            // Call the original onSelect if it exists
            const originalOnSelect = (children as ChildrenWithOnSelect).props
              .onSelect;
            if (originalOnSelect) originalOnSelect(e);
          },
        })
      : null;

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the organization{" "}
              <span className="font-semibold">{orgName}</span>? This action
              cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleteOrganization.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteOrganization.isPending}
            >
              {deleteOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteOrgModal;
