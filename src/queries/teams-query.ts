import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TeamsService from '@/services/team-service';
import { Team, TeamCreate } from '@/types/team-types';

export const TEAMS_QUERY_KEYS = {
  all: ['teams'] as const,
  byOrganization: (organizationId: number) => [...TEAMS_QUERY_KEYS.all, 'organization', organizationId] as const,
};

export const useGetTeamsByOrganization = (organizationId: number | null) => {
  return useQuery<Team[], Error>({
    queryKey: TEAMS_QUERY_KEYS.byOrganization(organizationId as number),
    queryFn: () => TeamsService.getTeamsByOrganization(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation<Team, Error, { org_id: number; team: TeamCreate }>({
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
