import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Team, TeamCreate } from '@/types/team-types';
import { TEAM_ENDPOINTS } from '@/constants/endpoints-constant';

export const TEAMS_QUERY_KEYS = {
  all: ['teams'] as const,
  byOrganization: (organizationId: number) => [...TEAMS_QUERY_KEYS.all, 'organization', organizationId] as const,
};

export const useGetTeamsByOrganization = (organizationId: number | string | null) => {
  const orgId = Number(organizationId);
  return useQuery<Team[], Error>({
    queryKey: TEAMS_QUERY_KEYS.byOrganization(orgId),
    queryFn: async () => {
      try {
        const response = await axios.get(`${TEAM_ENDPOINTS?.getOrganizationTeams}/${orgId}`, {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`
          }
        });
        return response.data?.data || [];
      } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
    },
    enabled: !!orgId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ team }: { org_id: number; team: TeamCreate }) => {
      try {
        const response = await axios.post(
          `${TEAM_ENDPOINTS?.postCreateTeam}`,
          team,
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`
            }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error creating team:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, teamData }: { 
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
      try {
        const updatePayload = {
          name: teamData.name,
          org_id: teamData.org_id,
          description: teamData.description,
          is_active: true,
          members: teamData.members,
        };
        const response = await axios.put(
          TEAM_ENDPOINTS.updateTeam(teamId),
          updatePayload,
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`,
              'Content-Type': 'application/json'
            }
          }
        );
        return {
          success: true,
          message: "Team updated successfully",
          data: response.data
        };
      } catch (error: unknown) {
        console.error("Update team error:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to update team"
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error("Update team error:", error);
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: number) => {
      try {
        const response = await axios.delete(TEAM_ENDPOINTS.deleteTeam(teamId), {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`
          }
        });
        return response.data;
      } catch (error) {
        console.error("Delete team error:", error);
        throw error;
      }
    },
    onSuccess: () => {
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
