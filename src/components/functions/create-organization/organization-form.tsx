"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import UserSearch from "./user-search";
import { User } from "@/types/user-types";

// Schema definition
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  organization_admin: z.custom<User>().nullable(),
});

export type OrganizationFormValues = z.infer<typeof formSchema>;

export interface OrganizationFormProps {
  onSubmit: (values: OrganizationFormValues) => void;
  onUpdate?: (values: OrganizationFormValues) => void;
  onCancel: () => void;
  defaultValues?: OrganizationFormValues;
  isLoading: boolean;
  isUpdating?: boolean; // Add this property
  mode?: "create" | "edit";
}

export function OrganizationForm({
  onSubmit,
  onUpdate,
  onCancel,
  defaultValues = {
    name: "",
    description: "",
    organization_admin: null,
  },
  isLoading = false,
  mode = "create",
}: OrganizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [selectedUser, setSelectedUser] = React.useState<User | null>(
    defaultValues.organization_admin
  );

  React.useEffect(() => {
    console.log("Default values:", defaultValues);
    console.log("Mode:", mode);
  }, [defaultValues, mode]);

  const handleUserSelect = (user: User | null) => {
    console.log("User selected:", user);
    setSelectedUser(user);
    setValue("organization_admin", user);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onCancel();
  };

  const handleFormSubmit = React.useCallback(
    async (values: OrganizationFormValues) => {
      console.log("Form submitted with values:", values);
      console.log("Mode:", mode);

      if (mode === "create") {
        console.log("Calling onSubmit (create)");
        await onSubmit(values);
      } else if (mode === "edit" && onUpdate) {
        console.log("Calling onUpdate (edit)");
        await onUpdate(values);
      } else {
        console.error("Invalid mode or missing onUpdate function");
      }
    },
    [onSubmit, onUpdate, mode]
  );

  return (
    <div className="relative z-50">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Organization Name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="block w-full mt-1 border rounded-md px-3 py-2"
            placeholder="Enter organization name"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="block w-full mt-1 border rounded-md px-3 py-2"
            placeholder="Enter organization description"
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Organization Admin Field */}
        <div>
          <label className="block text-sm font-medium">
            Organization Admin
          </label>
          <UserSearch
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelClick}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Submitting..."
              : mode === "create"
              ? "Create"
              : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
