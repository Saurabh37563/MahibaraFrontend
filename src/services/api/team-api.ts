import axios from 'axios';
import { Team, TeamCreate } from '@/types/team-types';
import { TEAM_ENDPOINTS } from '@/constants/endpoints-constant';

export const teamsApi = {
  getTeamsByOrganization: async (organizationId: string): Promise<Team[]> => {
    try {
      const response = await axios.get(`${TEAM_ENDPOINTS?.getOrganizationTeams}/${organizationId}`, {
      headers: {
        Authorization: `Bearer test-token`
      }
    });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTeam: async (organizationId: string, teamData: TeamCreate): Promise<Team> => {
    try {
      const response = await axios.post(
        `${TEAM_ENDPOINTS?.getOrganizationTeams}/${organizationId}`,
        teamData, {
      headers: {
        Authorization: `Bearer test-token`
      }
    }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default teamsApi;
