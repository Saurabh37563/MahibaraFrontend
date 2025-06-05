import { z } from 'zod';

// Basic types
export type AccessLevel = "no_access" | "view" | "edit" | "manage";
export type ModuleType = "projects" | "analytics" | "file_processing";

// Base Team Member Schema
export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  position: z.string(),
  avatarUrl: z.string().nullable().optional(),
});

// Team Member with Permissions Schema
export const TeamMemberWithPermissionSchema = TeamMemberSchema.extend({
  permission: z.enum(["view", "edit"]),
  modulePermissions: z
  .object({
    projects: z.enum(["no_access", "view", "edit", "manage"]),
    analytics: z.enum(["no_access", "view", "edit", "manage"]),
    file_processing: z.enum(["no_access", "view", "edit", "manage"]),
  })
  .optional()

});

// Team Creation Schema
export const TeamCreateSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().optional(),
  org_id:z.number(),
  members: z.array(z.object({
    id: z.number(),
    modulePermissions: z.object({
      projects: z.enum(["no_access", "view", "edit", "manage"]),
      analytics: z.enum(["no_access", "view", "edit", "manage"]),
      file_processing: z.enum(["no_access", "view", "edit", "manage"]),
    }),
  })),
});

// Complete Team Schema
export const TeamSchema = TeamCreateSchema.extend({
  id: z.string(),
  organization_id: z.string(),
});

// Inferred Types
export type TeamMemberWithPermission = z.infer<typeof TeamMemberWithPermissionSchema>;
export type TeamCreate = z.infer<typeof TeamCreateSchema>;
export type Team = z.infer<typeof TeamSchema>;

// Form Schema
export const TeamFormSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  org_id:z.string(),
  members: z.array(
    z.object({
      id: z.string(),
      permission: z.enum(["view", "edit"]),
      modulePermissions: z.object({
        projects: z.enum(["no_access", "view", "edit", "manage"]),
        analytics: z.enum(["no_access", "view", "edit", "manage"]),
        file_processing: z.enum(["no_access", "view", "edit", "manage"]),
      }),
    })
  ).min(1, {
    message: "Please select at least one team member.",
  }),
});

// Default Values
export const defaultTeamMember: TeamMemberWithPermission = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  position: 'Developer',
  avatarUrl: null,
  permission: 'view',
  modulePermissions: {
    projects: 'view',
    analytics: 'view',
    file_processing: 'no_access',
  },
};

export default Team;
