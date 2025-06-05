"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useCreateOrganization } from "@/queries/organization-query";
import {
  OrganizationForm,
  type OrganizationFormValues,
} from "./organization-form";

interface CreateOrganizationProps {
  mode?: "create" | "edit";
  defaultValues?: OrganizationFormValues;
  onEdit?: (values: OrganizationFormValues) => Promise<void>;
  trigger?: React.ReactNode;
}

export default function CreateOrganization({
  mode = "create",
  defaultValues,
  onEdit,
  trigger,
}: CreateOrganizationProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const createOrganization = useCreateOrganization();

  async function onSubmit(values: OrganizationFormValues) {
    try {
      if (mode === "edit" && onEdit) {
        await onEdit(values);
      } else {
        await createOrganization.mutateAsync({
          name: values.name,
          description: values.description,
          owner_id: 10, // TODO: Get from context
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to handle organization:", error);
    }
  }

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

  const content = (
    <OrganizationForm
      onSubmit={onSubmit}
      onCancel={() => setOpen(false)}
      defaultValues={defaultValues}
      isLoading={createOrganization.isPending}
      submitLabel={
        mode === "create" ? "Create Organization" : "Update Organization"
      }
    />
  );

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
          <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {mode === "create"
                  ? "Create New Organization"
                  : "Edit Organization"}
              </DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "Create a new organization and add members to collaborate with."
                  : "Edit the organization details."}
              </DialogDescription>
            </DialogHeader>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            {content}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{trigger ?? defaultTrigger}</DrawerTrigger>
          <DrawerContent className="px-4">
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
