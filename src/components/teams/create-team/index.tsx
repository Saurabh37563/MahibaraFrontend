"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { useTeamContext } from "@/contexts/team-context";
import { useCreateTeam } from "@/queries/teams-query";
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

export default function CreateTeam() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { activeOrg } = useTeamContext();
  const createTeamMutation = useCreateTeam();

  const handleSubmit = async (values: CreateTeamFormValues) => {
    if (!activeOrg?.id) {
      toast("Error", {
        description: "Please select an organization first.",
      });
      return;
    }

    try {
      const teamData: TeamCreate = {
        name: values.name,
        description: values.description || "",
        org_id: activeOrg.id,
        members: values.members.map((member) => ({
          id: member.id,
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
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create team. Please try again.");
      console.error("Failed to create team:", error);
    }
  };

  const handleCancel = () => setOpen(false);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Plus className="size-3" />
            <span className="sr-only">Create Team</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-screen !rounded-none !max-w-screen h-full w-full flex flex-col overflow-hidden p-0 gap-0">
          {/* Header */}
          <DialogHeader className="border-b p-4 shrink-0">
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>

          {/* Close button (optional positioning tweak) */}
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
              isPending={createTeamMutation.isPending}
            />
          </div>

          {/* Optional Footer (if you plan to add actions later) */}
          {/* <div className="shrink-0 border-t px-4 py-2">
    <Button type="submit">Submit</Button>
  </div> */}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Plus className="size-3" />
          <span className="sr-only">Create Team</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-4">
        <DrawerHeader>
          <DrawerTitle>Create New Team</DrawerTitle>
          <DrawerDescription>
            Create a new team and add members to collaborate with.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto max-h-[65vh] pb-2">
          <CreateTeamForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isDesktop={isDesktop}
            isPending={createTeamMutation.isPending}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
