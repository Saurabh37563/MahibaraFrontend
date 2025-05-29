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
        id: z.number(),
        permission: z.enum(["view", "edit"]),
        modulePermissions: z
          .record(z.enum(["no_access", "view", "edit", "manage"]))
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
}

export function CreateTeamForm({
  onSubmit,
  onCancel,
  isDesktop,
  isPending,
}: CreateTeamFormProps) {
  const [selectedMembers, setSelectedMembers] = React.useState<
    TeamMemberWithPermission[]
  >([]);

  const form = useForm<CreateTeamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
    },
  });

  const handleMembersChange = (members: TeamMemberWithPermission[]) => {
    setSelectedMembers(members);
    form.setValue(
      "members",
      members.map((member) => ({
        id: member.id,
        permission: member.permission,
        modulePermissions: member.modulePermissions || {
          projects: "view",
          analytics: "view",
          file_processing: "no_access",
        },
      })),
      { shouldValidate: true }
    );
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 overflow-x-hidden"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter team name" {...field} />
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

        {isDesktop ? (
          <div className="flex justify-end gap-2 mt-6">
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
                  Creating...
                </>
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
                  Creating...
                </>
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
      </form>
    </Form>
  );
}
