"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  useCreateOrganization,
  useUpdateOrganization,
} from "@/queries/organization-query";
import {
  OrganizationForm,
  type OrganizationFormValues,
} from "./organization-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CreateOrganizationProps {
  mode?: "create" | "edit";
  defaultValues?: OrganizationFormValues;
  onEdit?: (values: OrganizationFormValues) => Promise<void>;
  onCreateSuccess?: () => void;
  onCreateOpen?: () => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  organizationId?: number;
}

export default function CreateOrganization({
  mode = "create",
  defaultValues,
  onEdit,
  onCreateSuccess,
  onCreateOpen,
  trigger,
  children,
  organizationId,
}: CreateOrganizationProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const queryClient = useQueryClient();

  // Debug pending states
  console.log("CreateOrganization component - mode:", mode);
  console.log(
    "CreateOrganization component - createOrganization.isPending:",
    createOrganization.isPending
  );
  console.log(
    "CreateOrganization component - updateOrganization.isPending:",
    updateOrganization.isPending
  );

  // Reset mutation states when dialog opens
  React.useEffect(() => {
    if (open) {
      if (createOrganization.isPending || updateOrganization.isPending) {
        console.log(
          "Organization dialog opened with pending mutations, this might cause disabled fields"
        );
      }
    }
  }, [open, createOrganization.isPending, updateOrganization.isPending]);

  const handleCreate = React.useCallback(
    async (values: OrganizationFormValues) => {
      try {
        console.log("Creating organization with values:", values);

        if (!values.organization_admin?.id) {
          throw new Error("Organization admin is required");
        }

        const newOrg = await createOrganization.mutateAsync({
          name: values.name,
          description: values.description || "",
          organization_owner: values.organization_admin.id,
        });

        // Only invalidate queries if we successfully created the organization
        if (newOrg) {
          await queryClient.invalidateQueries({
            queryKey: ["organizations", 10],
          });
          await queryClient.invalidateQueries({ queryKey: ["organizations"] });
        }

        setOpen(false);

        // Show success toast
        toast.success("Organization created successfully!", {
          description: `${values.name} has been created and added to your organizations.`,
          duration: 3000,
        });

        if (onCreateSuccess) {
          onCreateSuccess();
        }
      } catch (error) {
        console.error("Failed to create organization:", error);

        // Show error toast
        toast.error("Failed to create organization", {
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          duration: 4000,
        });

        throw error;
      }
    },
    [createOrganization, onCreateSuccess, queryClient]
  );

  const handleUpdate = React.useCallback(
    async (values: OrganizationFormValues) => {
      try {
        console.log("Updating organization with values:", values);

        if (onEdit) {
          console.log("Calling onEdit function");
          await onEdit(values);
        } else if (organizationId) {
          console.log("Calling updateOrganization API");
          const updatePayload: {
            id: string;
            name: string;
            description: string;
            organisation_admin?: number;
          } = {
            id: organizationId.toString(),
            name: values.name,
            description: values.description || "",
          };

          if (values.organization_admin?.id) {
            updatePayload.organisation_admin = values.organization_admin.id;
          }

          await updateOrganization.mutateAsync(updatePayload);

          await queryClient.invalidateQueries({
            queryKey: ["organizations", 10],
          });
          await queryClient.invalidateQueries({ queryKey: ["organizations"] });

          if (onCreateSuccess) {
            onCreateSuccess();
          }
        }

        setOpen(false);

        toast.success("Organization updated successfully!", {
          description: `${values.name} has been updated.`,
          duration: 3000,
        });
      } catch (error) {
        console.error("Failed to update organization:", error);

        toast.error("Failed to update organization", {
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          duration: 4000,
        });

        throw error;
      }
    },
    [onEdit, organizationId, updateOrganization, queryClient, onCreateSuccess]
  );

  const handleCancel = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      console.log("Dialog open state changed:", newOpen);
      setOpen(newOpen);
      if (newOpen && onCreateOpen) {
        onCreateOpen();
      }
    },
    [onCreateOpen]
  );

  // Memoize the form component to prevent unnecessary re-renders
  const content = React.useMemo(
    () => (
      <OrganizationForm
        onSubmit={handleCreate}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        defaultValues={defaultValues}
        isLoading={createOrganization.isPending}
        isUpdating={updateOrganization.isPending} // Pass isUpdating prop
        mode={mode}
      />
    ),
    [
      handleCreate,
      handleUpdate,
      handleCancel,
      defaultValues,
      createOrganization.isPending,
      updateOrganization.isPending,
      mode,
    ]
  );

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="relative w-full text-gray-600 flex justify-start p-2"
    >
      <Plus className="size-5 border p-[2px] border-gray-800 rounded-sm" />
      {mode === "create" ? "Create Organization" : "Edit Organization"}
    </Button>
  );

  // Use children as trigger if provided, otherwise use trigger prop, otherwise use default
  const triggerElement = children || trigger || defaultTrigger;

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
          <DialogTrigger asChild>{triggerElement}</DialogTrigger>
          <DialogContent
            className="flex my-auto  flex-col  overflow-y-auto pointer-events-auto"
            onPointerDownOutside={(e) => e.preventDefault()} // Prevent all pointer down outside events
            onInteractOutside={(e) => e.preventDefault()} // Prevent all interactions outside
          >
            <DialogHeader className="border-b pb-4">
              <DialogTitle>
                {mode === "create"
                  ? "Create New Organization"
                  : "Edit Organization"}
              </DialogTitle>
            </DialogHeader>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            {content}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>{triggerElement}</DrawerTrigger>
          <DrawerContent
            className="px-4"
            onInteractOutside={(e) => {
              // Allow interactions with dropdowns in mobile drawer
              const target = e.target as Element;
              if (
                target.closest('[role="combobox"]') ||
                target.classList.contains("absolute") ||
                target.closest(".absolute") ||
                target.closest("[data-radix-popover-content]") ||
                target.closest("[data-radix-select-content]") ||
                target.closest('[role="listbox"]')
              ) {
                e.preventDefault();
              }
            }}
          >
            <DrawerHeader>
              <DrawerTitle>
                {mode === "create"
                  ? "Create New Organization"
                  : "Edit Organization"}
              </DrawerTitle>
              <DrawerDescription>
                {mode === "create"
                  ? "Create a new Organization and add members to collaborate with."
                  : "Edit the organization details."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 overflow-y-auto max-h-[65vh] pb-2">
              {content}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
