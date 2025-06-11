import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TeamsService from '@/services/team-service';
import { Team, TeamCreate } from '@/types/team-types';

export const TEAMS_QUERY_KEYS = {
  all: ['teams'] as const,
  byOrganization: (organizationId: number) => [...TEAMS_QUERY_KEYS.all, 'organization', organizationId] as const,
};

export const useGetTeamsByOrganization = (organizationId: number | string | null) => {
  const orgId = Number(organizationId); // Convert to number
  return useQuery<Team[], Error>({
    queryKey: TEAMS_QUERY_KEYS.byOrganization(orgId),
    queryFn: () => TeamsService.getTeamsByOrganization(orgId),
    enabled: !!orgId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ org_id, team }: { org_id: number; team: TeamCreate }) => 
      TeamsService.createTeam(org_id, team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, teamData }: { 
      teamId: number; 
      teamData: { 
        name: string; 
        org_id: number; 
        description: string;
        members: Array<{
          id: number;
          modulePermissions: {
            projects: string;
            analytics: string;
            file_processing: string;
          };
        }>;
      } 
    }) => {
      console.log("Query Layer - Update team mutation called with:", { teamId, teamData });
      return TeamsService.updateTeam(teamId, teamData);
    },
    onSuccess: (data) => {
      console.log("Query Layer - Update team success:", data);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error("Query Layer - Update team error:", error);
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => TeamsService.deleteTeam(teamId),
    onSuccess: () => {
      // Invalidate teams queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEYS.all });
    },
    onError: (error: unknown) => {
      console.error("Delete team error:", error);
      throw error;
    },
  });
};

const teamsQueryExports = {
  useGetTeamsByOrganization,
  useCreateTeam,
};

export default teamsQueryExports;
