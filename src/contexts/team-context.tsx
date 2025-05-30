"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { z } from "zod";

// Zod schemas
const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string().optional(),
  image: z.string().nullable().optional(), // <-- allow null here
});

const TeamSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    organizationId: z.string().optional(),
    organization_id: z.string().optional(),
    members: z.array(
      z.object({
        id: z.union([z.string(), z.number()]),
        name: z.string().optional(),
        email: z.string().optional(),
        image: z.string().optional(),
        designation: z.string().optional(),
        modulePermissions: z
          .object({
            projects: z.enum(["no_access", "view", "edit", "manage"]),
            analytics: z.enum(["no_access", "view", "edit", "manage"]),
            file_processing: z.enum(["no_access", "view", "edit", "manage"]),
          })
          .optional(),
      })
    ),
    org_id: z.number().optional(),
    description: z.string().optional(),
  })
  .refine((team) => !!(team.organizationId || team.organization_id), {
    message: "Either organizationId or organization_id must be present",
    path: ["organizationId"],
  })
  .transform((team) => ({
    ...team,
    organizationId: team.organizationId ?? team.organization_id ?? "",
  }));

// Make sure Team type always has organizationId as string
type Team = z.infer<typeof TeamSchema> & { organizationId: string };

const ProjectStatusSchema = z.enum([
  "completed",
  "in-progress",
  "pending",
  "draft",
]);

const TeamMemberSchema = z.object({
  id: z.string(),
  avatar: z.string().optional(),
  name: z.string(),
  status: z.enum(["online", "offline", "away", "busy", "none"]).optional(),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: ProjectStatusSchema,
  modifiedDate: z.string(),
});

// Types
type Organization = z.infer<typeof OrganizationSchema>;
type Project = z.infer<typeof ProjectSchema>;
type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// Context type
interface TeamContextType {
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization | null) => void;
  activeTeam: Team | null;
  setActiveTeam: (team: Team | null) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const contextValue: TeamContextType = {
    activeOrg,
    setActiveOrg,
    activeTeam,
    setActiveTeam,
    projects,
    setProjects,
  };

  return (
    <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>
  );
};

export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeamContext must be used within a TeamProvider");
  }
  return context;
};

export const TeamContextProvider: React.FC<TeamProviderProps> = ({
  children,
}) => {
  return <TeamProvider>{children}</TeamProvider>;
};

// Export types for use in other components
export type { Organization, Team, Project, ProjectStatus };

// Export schemas for validation in other components
export {
  OrganizationSchema,
  TeamSchema,
  ProjectSchema,
  ProjectStatusSchema,
  TeamMemberSchema,
};
