import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TeamsService from '@/services/team-service';
import { Team, TeamCreate } from '@/types/team-types';

export const TEAMS_QUERY_KEYS = {
  all: ['teams'] as const,
  byOrganization: (organizationId: string) => [...TEAMS_QUERY_KEYS.all, 'organization', organizationId] as const,
};

export const useGetTeamsByOrganization = (organizationId: string | null) => {
  return useQuery<Team[], Error>({
    queryKey: TEAMS_QUERY_KEYS.byOrganization(organizationId || ''),
    queryFn: () => TeamsService.getTeamsByOrganization(organizationId!),
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation<Team, Error, { org_id: string; team: TeamCreate }>({
    mutationFn: ({ org_id, team }) => 
      TeamsService.createTeam(org_id, team),
    onSuccess: (newTeam, { org_id }) => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEYS.byOrganization(org_id) });
      queryClient.setQueryData<Team[]>(
        TEAMS_QUERY_KEYS.byOrganization(org_id),
        (oldTeams = []) => [...oldTeams, newTeam]
      );
    },
  });
};

export default {
  useGetTeamsByOrganization,
  useCreateTeam,
};
