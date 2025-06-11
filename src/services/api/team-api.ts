import axios from 'axios';
import { Team, TeamCreate } from '@/types/team-types';
import { TEAM_ENDPOINTS } from '@/constants/endpoints-constant';

type DeleteTeamResponse = {
  success: boolean;
  message: string;
};

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
  },

  updateTeam: async (teamId: number, teamData: { 
    name: string; 
    org_id: number; 
    description: string; 
    is_active: boolean;
    members: Array<{
      id: number;
      modulePermissions: {
        projects: string;
        analytics: string;
        file_processing: string;
      };
    }>;
  }): Promise<Team> => {
    try {
      console.log("API Layer - Update team payload:", teamData);
      
      const response = await axios.put(
        TEAM_ENDPOINTS.updateTeam(teamId),
        teamData,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("API Layer - Update team response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Layer - Update team error:", error);
      throw error;
    }
  },

  deleteTeam: async (teamId: number): Promise<DeleteTeamResponse> => {
    try {
      const response = await axios.delete(TEAM_ENDPOINTS.deleteTeam(teamId), {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default teamsApi;
