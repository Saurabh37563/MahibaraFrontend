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
export type Team = z.infer<typeof TeamSchema> & { organizationId: string };

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
export type Organization = z.infer<typeof OrganizationSchema>;
type Project = z.infer<typeof ProjectSchema>;

// Context type
// Add projectName to context
interface TeamContextType {
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization | null) => void;
  activeTeam: Team | null;
  setActiveTeam: (team: Team | null) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  projectName: string | null;
  setProjectName: (name: string | null) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  // Initialize with safe defaults (no localStorage access here)
  const [activeOrg, setActiveOrgState] = useState<Organization | null>(null);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectNameState] = useState<string | null>(null);

  // On mount, sync state with localStorage (client only)
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedOrg = localStorage.getItem("activeOrg");
      if (storedOrg) setActiveOrgState(JSON.parse(storedOrg));
      const storedTeam = localStorage.getItem("activeTeam");
      if (storedTeam) setActiveTeamState(JSON.parse(storedTeam));
      const storedProjectName = localStorage.getItem("projectName");
      if (storedProjectName) setProjectNameState(storedProjectName);
    }
  }, []);

  // Persist to localStorage on change (client only)
  const setActiveOrg = (org: Organization | null) => {
    setActiveOrgState(org);
    if (typeof window !== "undefined" && window.localStorage) {
      if (org) {
        localStorage.setItem("activeOrg", JSON.stringify(org));
      } else {
        localStorage.removeItem("activeOrg");
      }
    }
  };
  const setActiveTeam = (team: Team | null) => {
    setActiveTeamState(team);
    if (typeof window !== "undefined" && window.localStorage) {
      if (team) {
        localStorage.setItem("activeTeam", JSON.stringify(team));
      } else {
        localStorage.removeItem("activeTeam");
      }
    }
  };
  const setProjectName = (name: string | null) => {
    setProjectNameState(name);
    if (typeof window !== "undefined" && window.localStorage) {
      if (name) {
        localStorage.setItem("projectName", name);
      } else {
        localStorage.removeItem("projectName");
      }
    }
  };

  const contextValue: TeamContextType = {
    activeOrg,
    setActiveOrg,
    activeTeam,
    setActiveTeam,
    projects,
    setProjects,
    projectName,
    setProjectName,
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
// Export schemas for validation in other components
export {
  OrganizationSchema,
  TeamSchema,
  ProjectSchema,
  ProjectStatusSchema,
  TeamMemberSchema,
};
