import axios from 'axios';
import { Team, TeamCreate } from '@/types/team-types';
import { TEAM_ENDPOINTS } from '@/constants/endpoints-constant';

export const teamsApi = {
  getTeamsByOrganization: async (organizationId: number): Promise<Team[]> => {
    try {
      const response = await axios.get(`${TEAM_ENDPOINTS?.getOrganizationTeams}/${organizationId}`, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`
      }
    });
      return response.data?.data || [];
    } catch (error) {
      throw error;
    }
  },

  createTeam: async (organizationId: number, teamData: TeamCreate): Promise<Team> => {
    try {
      const response = await axios.post(
        `${TEAM_ENDPOINTS?.postCreateTeam}`,
        teamData, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`
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
