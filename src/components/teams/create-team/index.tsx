"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { useTeamContext } from "@/contexts/team-context";
import { useCreateTeam, useUpdateTeam } from "@/queries/teams-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { CreateTeamForm, CreateTeamFormValues } from "./create-team-form";
import type { TeamCreate } from "@/types/team-types";

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
interface CreateTeamProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "create" | "update";
  initialValues?: Partial<CreateTeamFormValues> & { id?: string | number }; // <-- Add id here
  children?: React.ReactNode; // custom trigger
}

export default function CreateTeam(props: CreateTeamProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { activeOrg } = useTeamContext();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const open = props.open !== undefined ? props.open : internalOpen;
  const onOpenChange = props.onOpenChange || setInternalOpen;
  const mode = props.mode || "create";
  const initialValues = props.initialValues;
  const children = props.children;

  // Debug the pending states with more detail
  const isPending =
    mode === "update"
      ? updateTeamMutation.isPending
      : createTeamMutation.isPending;

  console.log("=== CreateTeam Debug ===");
  console.log("CreateTeam component - mode:", mode);
  console.log("CreateTeam component - open:", open);
  console.log(
    "CreateTeam component - createTeamMutation.isPending:",
    createTeamMutation.isPending
  );
  console.log(
    "CreateTeam component - updateTeamMutation.isPending:",
    updateTeamMutation.isPending
  );
  console.log("CreateTeam component - final isPending:", isPending);
  console.log(
    "CreateTeam component - createTeamMutation.status:",
    createTeamMutation.status
  );
  console.log(
    "CreateTeam component - updateTeamMutation.status:",
    updateTeamMutation.status
  );
  console.log("=========================");

  // Reset mutation states when dialog opens
  React.useEffect(() => {
    if (open) {
      if (createTeamMutation.isPending || updateTeamMutation.isPending) {
        console.log(
          "Dialog opened with pending mutations - this might cause disabled fields"
        );
      }
    }
  }, [open, createTeamMutation.isPending, updateTeamMutation.isPending]);

  const handleSubmit = async (values: CreateTeamFormValues) => {
    if (!activeOrg?.id) {
      toast.error("Please select an organization first.");
      return;
    }

    console.log("Form submission - mode:", mode);
    console.log("Form submission - initialValues:", initialValues);
    console.log("Form submission - values:", values);
    console.log("Form submission - members count:", values.members.length);
    console.log("Form submission - members data:", values.members);

    try {
      if (mode === "update") {
        const teamId = initialValues?.id;
        console.log("Team ID for update:", teamId);

        if (!teamId) {
          console.error("No team ID found in initialValues:", initialValues);
          toast.error("No team selected for update.");
          return;
        }

        const processedMembers = values.members.map((member) => ({
          id: Number(member.id),
          modulePermissions: {
            projects: member.modulePermissions?.projects || "view",
            analytics: member.modulePermissions?.analytics || "view",
            file_processing:
              member.modulePermissions?.file_processing || "no_access",
          },
        }));

        const updatePayload = {
          teamId: typeof teamId === "string" ? parseInt(teamId, 10) : teamId,
          teamData: {
            name: values.name,
            description: values.description || "",
            org_id: activeOrg.id,
            members: processedMembers,
          },
        };

        console.log("Component Layer - Update team payload:", updatePayload);
        console.log("Component Layer - Processed members:", processedMembers);

        const result = await updateTeamMutation.mutateAsync(updatePayload);

        console.log("Component Layer - Update result:", result);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.success("Team updated successfully.");
        }

        onOpenChange(false);
        return;
      }

      // Create mode
      const teamData: TeamCreate = {
        name: values.name,
        description: values.description || "",
        org_id: activeOrg.id,
        members: values.members.map((member) => ({
          id: Number(member.id),
          modulePermissions: {
            projects: member.modulePermissions?.projects || "view",
            analytics: member.modulePermissions?.analytics || "view",
            file_processing:
              member.modulePermissions?.file_processing || "no_access",
          },
        })),
      };

      console.log("Component Layer - Create team payload:", teamData);

      await createTeamMutation.mutateAsync({
        org_id: activeOrg.id,
        team: teamData,
      });

      toast.success("Team created successfully.");
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Component Layer - Submit error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as ApiError)?.message || "An unexpected error occurred";

      toast.error(
        mode === "update"
          ? `Failed to update team: ${errorMessage}`
          : `Failed to create team: ${errorMessage}`
      );
    }
  };

  const handleCancel = () => onOpenChange(false);

  // Reset form when dialog closes to prevent state issues
  React.useEffect(() => {
    if (!open && mode === "create") {
      // Reset any form state when closing create mode
    }
  }, [open, mode]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children ? (
          <DialogTrigger asChild>{children}</DialogTrigger>
        ) : !props.open ? (
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Plus className="size-3" />
              <span className="sr-only">Create Team</span>
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent className="max-h-screen !rounded-none !max-w-screen h-full w-full flex flex-col overflow-hidden p-0 gap-0">
          {/* Header */}
          <DialogHeader className="border-b p-4 shrink-0">
            <DialogTitle>
              {mode === "update" ? "Edit Team" : "Create New Team"}
            </DialogTitle>
          </DialogHeader>

          {/* Close button */}
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <CreateTeamForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isDesktop={isDesktop}
              isPending={isPending}
              mode={mode}
              initialValues={initialValues}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children ? (
        <DrawerTrigger asChild>{children}</DrawerTrigger>
      ) : !props.open ? (
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Plus className="size-3" />
            <span className="sr-only">Create Team</span>
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent className="px-4">
        <DrawerHeader>
          <DrawerTitle>
            {mode === "update" ? "Edit Team" : "Create New Team"}
          </DrawerTitle>
          <DrawerDescription>
            {mode === "update"
              ? "Update team details and members."
              : "Create a new team and add members to collaborate with."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto max-h-[65vh] pb-2">
          <CreateTeamForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isDesktop={isDesktop}
            isPending={isPending}
            mode={mode}
            initialValues={initialValues}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
