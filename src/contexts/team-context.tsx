'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { z } from 'zod';
import { 
  QueryClient, 
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

// Zod schemas
const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
});

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  organizationId: z.string(),
});

const ProjectStatusSchema = z.enum([
  'completed', 'in-progress', 'pending', 'cancelled', 'draft', 'processing'
]);

const TeamMemberSchema = z.object({
  id: z.string(),
  avatar: z.string().optional(),
  name: z.string(),
  status: z.enum(['online', 'offline', 'away', 'busy', 'none']).optional(),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: ProjectStatusSchema,
  progress: z.number(),
  modifiedDate: z.string(),
  teamId: z.string(),
  team: z.array(TeamMemberSchema),
});

// Types
type Organization = z.infer<typeof OrganizationSchema>;
type Team = z.infer<typeof TeamSchema>;
type Project = z.infer<typeof ProjectSchema>;
type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// Mock data
const mockOrganizations: Organization[] = [
  { id: 'org1', name: 'Acme Corporation', avatar: '/acme.png' },
  { id: 'org2', name: 'Globex Industries', avatar: '/globex.png' },
  { id: 'org3', name: 'Initech', avatar: '/initech.png' },
];

const mockTeams: Team[] = [
  { id: 'team1', name: 'Engineering', organizationId: 'org1' },
  { id: 'team2', name: 'Finance', organizationId: 'org1' },
  { id: 'team3', name: 'Marketing', organizationId: 'org1' },
  { id: 'team4', name: 'Product', organizationId: 'org2' },
  { id: 'team5', name: 'HR', organizationId: 'org2' },
  { id: 'team6', name: 'Sales', organizationId: 'org3' },
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: "Q1'24 Audit",
    status: 'completed',
    progress: 100,
    modifiedDate: '12/10/24',
    teamId: 'team1',
    team: [
      { id: '1', avatar: '', name: 'Sarah Johnson', status: 'online' },
      { id: '2', avatar: '', name: 'Mark Thompson', status: 'away' },
    ],
  },
  {
    id: '2',
    name: "Q2'24 Audit",
    status: 'processing',
    progress: 65,
    modifiedDate: '01/11/24',
    teamId: 'team1',
    team: [
      { id: '2', avatar: '', name: 'Mark Thompson', status: 'online' },
      { id: '5', avatar: '', name: 'Emma Wilson', status: 'online' },
    ],
  },
  {
    id: '3',
    name: "Marketing Campaign",
    status: 'draft',
    progress: 30,
    modifiedDate: '15/09/24',
    teamId: 'team3',
    team: [
      { id: '4', avatar: '', name: 'Alex Chen', status: 'busy' },
      { id: '7', avatar: '', name: 'Olivia Davis', status: 'offline' },
    ],
  },
  {
    id: '4',
    name: "Product Launch",
    status: 'in-progress',
    progress: 75,
    modifiedDate: '03/10/24',
    teamId: 'team4',
    team: [
      { id: '8', avatar: '', name: 'James Wilson', status: 'online' },
      { id: '9', avatar: '', name: 'Sophia Miller', status: 'offline' },
    ],
  },
];

// API functions (simulated)
const fetchOrganizations = async (): Promise<Organization[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockOrganizations;
};

const fetchTeamsByOrganization = async (orgId: string): Promise<Team[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockTeams.filter(team => team.organizationId === orgId);
};

const fetchProjectsByTeam = async (teamId: string): Promise<Project[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockProjects.filter(project => project.teamId === teamId);
};

const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    ...project,
    id: `project-${Date.now()}`, // Generate a unique ID
  };
};

// Context type
interface TeamContextType {
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization) => void;
  activeTeam: Team | null;
  setActiveTeam: (team: Team | null) => void;
  organizations: Organization[];
  teams: Team[];
  projects: Project[];
  isLoadingOrgs: boolean;
  isLoadingTeams: boolean;
  isLoadingProjects: boolean;
  createNewProject: (name: string) => Promise<Project>;
  isCreatingProject: boolean;
}

// Create context
const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Context provider
interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch organizations
  const { 
    data: organizations = [], 
    isLoading: isLoadingOrgs 
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    onSuccess: (data) => {
      // Set default active org if none selected
      if (!activeOrg && data.length > 0) {
        setActiveOrg(data[0]);
      }
    }
  });
  
  // Fetch teams by organization
  const { 
    data: teams = [], 
    isLoading: isLoadingTeams 
  } = useQuery({
    queryKey: ['teams', activeOrg?.id],
    queryFn: () => activeOrg?.id ? fetchTeamsByOrganization(activeOrg.id) : Promise.resolve([]),
    enabled: !!activeOrg
  });
  
  // Fetch projects by team
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects 
  } = useQuery({
    queryKey: ['projects', activeTeam?.id],
    queryFn: () => activeTeam?.id ? fetchProjectsByTeam(activeTeam.id) : Promise.resolve([]),
    enabled: !!activeTeam
  });
  
  // Mutation for creating a project
  const {
    mutateAsync: createNewProject,
    isPending: isCreatingProject
  } = useMutation({
    mutationFn: (name: string) => {
      if (!activeTeam) throw new Error("No team selected");
      
      const newProject: Omit<Project, 'id'> = {
        name,
        status: 'draft',
        progress: 0,
        modifiedDate: new Date().toLocaleDateString(),
        teamId: activeTeam.id,
        team: [], // Empty team initially
      };
      
      return createProject(newProject);
    },
    onSuccess: () => {
      // Invalidate the projects query to reload the data
      queryClient.invalidateQueries({ queryKey: ['projects', activeTeam?.id] });
    }
  });
  
  return (
    <TeamContext.Provider
      value={{
        activeOrg,
        setActiveOrg,
        activeTeam,
        setActiveTeam,
        organizations,
        teams,
        projects,
        isLoadingOrgs,
        isLoadingTeams,
        isLoadingProjects,
        createNewProject,
        isCreatingProject
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

// Hook to use the context
export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
};

// Root provider with QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const TeamDashboardProvider: React.FC<TeamProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TeamProvider>{children}</TeamProvider>
    </QueryClientProvider>
  );
};

// Export types for use in other components
export type { Organization, Team, Project, ProjectStatus };