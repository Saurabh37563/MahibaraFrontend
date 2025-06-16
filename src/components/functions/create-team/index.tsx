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
  initialValues?: Partial<CreateTeamFormValues> & { id?: string | number };
  children?: React.ReactNode;
}

const CreateTeam: React.FC<CreateTeamProps> = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  mode = "create",
  initialValues,
  children,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { activeOrg } = useTeamContext();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  const isPending =
    mode === "update"
      ? updateTeamMutation.isPending
      : createTeamMutation.isPending;

  const handleSubmit = async (values: CreateTeamFormValues) => {
    if (!activeOrg?.id) {
      toast.error("Please select an organization first.");
      return;
    }
    try {
      if (mode === "update") {
        const teamId = initialValues?.id;
        if (!teamId) {
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
        const result = await updateTeamMutation.mutateAsync(updatePayload);
        toast.success(
          result.success ? result.message : "Team updated successfully."
        );
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
      await createTeamMutation.mutateAsync({
        org_id: activeOrg.id,
        team: teamData,
      });
      toast.success("Team created successfully.");
      onOpenChange(false);
    } catch (error: unknown) {
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

  // Reset form state if needed when dialog closes (future-proof)
  React.useEffect(() => {
    if (!open && mode === "create") {
      // Reset form state if needed
    }
  }, [open, mode]);

  const TriggerButton = () =>
    children ? (
      isDesktop ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DrawerTrigger asChild>{children}</DrawerTrigger>
      )
    ) : !controlledOpen ? (
      isDesktop ? (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            tabIndex={0}
            aria-label="Create Team"
          >
            <Plus className="size-3" />
            <span className="sr-only">Create Team</span>
          </Button>
        </DialogTrigger>
      ) : (
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            tabIndex={0}
            aria-label="Create Team"
          >
            <Plus className="size-3" />
            <span className="sr-only">Create Team</span>
          </Button>
        </DrawerTrigger>
      )
    ) : null;

  const TeamForm = () => (
    <CreateTeamForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isDesktop={isDesktop}
      isPending={isPending}
      mode={mode}
      initialValues={initialValues}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <TriggerButton />
        <DialogContent className="max-h-screen !rounded-none !max-w-screen h-full w-full flex flex-col overflow-hidden p-0 gap-0">
          <DialogHeader className="border-b p-4 shrink-0">
            <DialogTitle>
              {mode === "update" ? "Edit Team" : "Create New Team"}
            </DialogTitle>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <TeamForm />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <TriggerButton />
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
          <TeamForm />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateTeam;
