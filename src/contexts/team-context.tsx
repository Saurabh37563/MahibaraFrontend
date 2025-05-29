"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  memo,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { z } from "zod";

// Zod schemas
const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string().optional(),
});

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  organizationId: z.string(),
  members: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
      image: z.string().optional(),
      designation: z.string().optional(),
    })
  ),
});

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
type Team = z.infer<typeof TeamSchema>;
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
