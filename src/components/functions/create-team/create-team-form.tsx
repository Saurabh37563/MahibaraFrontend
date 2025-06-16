"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TeamMemberSelector } from "./team-member-select";
import type { TeamMemberWithPermission } from "@/types/team-types";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  members: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        position: z.string(),
        permission: z.enum(["view", "edit"]),
        avatarUrl: z.string().optional().nullable(),
        modulePermissions: z
          .object({
            projects: z.enum(["no_access", "view", "edit", "manage"]),
            analytics: z.enum(["no_access", "view", "edit", "manage"]),
            file_processing: z.enum(["no_access", "view", "edit", "manage"]),
          })
          .optional(),
      })
    )
    .min(1, {
      message: "Please select at least one team member.",
    }),
});

export type CreateTeamFormValues = z.infer<typeof formSchema>;

interface CreateTeamFormProps {
  onSubmit: (values: CreateTeamFormValues) => Promise<void>;
  onCancel: () => void;
  isDesktop: boolean;
  isPending: boolean;
  initialValues?: Partial<CreateTeamFormValues>;
  mode?: "create" | "update";
}

export function CreateTeamForm({
  onSubmit,
  onCancel,
  isDesktop,
  isPending,
  initialValues,
  mode = "create",
}: CreateTeamFormProps) {
  const [selectedMembers, setSelectedMembers] = React.useState<
    TeamMemberWithPermission[]
  >([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [formKey, setFormKey] = React.useState(0); // Add form key for re-mounting

  const form = useForm<CreateTeamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
    },
    mode: "onBlur", // Change validation mode to prevent aggressive validation
  });

  // Initialize form with proper values
  React.useEffect(() => {
    const initializeForm = () => {
      setIsInitialized(false); // Reset initialization state

      if (initialValues && mode === "update") {
        const processedMembers = (initialValues.members || []).map(
          (member) => ({
            ...member,
            id: member.id?.toString() || "",
            name: member.name || "",
            email: member.email || "",
            position: member.position || "No designation",
            permission: (member.permission as "view" | "edit") || "view",
            avatarUrl: member.avatarUrl || null,
            modulePermissions: member.modulePermissions || {
              projects: "view" as const,
              analytics: "view" as const,
              file_processing: "no_access" as const,
            },
          })
        );

        const formValues = {
          name: initialValues.name || "",
          description: initialValues.description || "",
          members: processedMembers,
        };

        // Clear all errors first
        form.clearErrors();

        // Reset form with new values
        form.reset(formValues, {
          keepErrors: false,
          keepDirty: false,
          keepTouched: false,
        });

        setSelectedMembers(processedMembers);

        // Mark as initialized after form reset
        setTimeout(() => {
          setIsInitialized(true);
        }, 150);
      } else if (mode === "create") {
        const emptyValues = {
          name: "",
          description: "",
          members: [],
        };

        form.clearErrors();
        form.reset(emptyValues, {
          keepErrors: false,
          keepDirty: false,
          keepTouched: false,
        });
        setSelectedMembers([]);
        setIsInitialized(true);
      }
    };

    initializeForm();
    // Update form key to force re-mount when initialValues change
    setFormKey((prev) => prev + 1);
  }, [initialValues, mode, form]);

  const handleMembersChange = (members: TeamMemberWithPermission[]) => {
    const processedMembers = members.map((member) => ({
      ...member,
      id: member.id?.toString() || "",
      permission: (member.permission as "view" | "edit") || "view",
      modulePermissions: member.modulePermissions || {
        projects: "view" as const,
        analytics: "view" as const,
        file_processing: "no_access" as const,
      },
    }));

    setSelectedMembers(processedMembers);

    if (isInitialized) {
      form.setValue("members", processedMembers, {
        shouldValidate: false, // Don't validate immediately
        shouldDirty: true,
      });
    }
  };

  // Don't render form until properly initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Add debug logging for isPending
  console.log("CreateTeamForm - isPending:", isPending);
  console.log("CreateTeamForm - mode:", mode);

  return (
    <Form {...form}>
      <form
        key={formKey}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter team name"
                    {...field}
                    disabled={false} // Explicitly set to false
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter team description"
                    className="resize-none min-h-[100px]"
                    disabled={false} // Explicitly set to false
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="members"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Team Members</FormLabel>
                <FormControl>
                  <TeamMemberSelector
                    selectedMembers={selectedMembers}
                    onMembersChange={handleMembersChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sticky footer actions */}
        <div className="shrink-0 mt-4 border-t pt-4 bg-background sticky bottom-0 z-10">
          {isDesktop ? (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-900 hover:bg-green-800"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "update" ? "Updating..." : "Creating..."}
                  </>
                ) : mode === "update" ? (
                  "Update Team"
                ) : (
                  "Create Team"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="bg-green-900 hover:bg-green-800"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "update" ? "Updating..." : "Creating..."}
                  </>
                ) : mode === "update" ? (
                  "Update Team"
                ) : (
                  "Create Team"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
