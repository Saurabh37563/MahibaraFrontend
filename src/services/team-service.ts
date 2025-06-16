import axios from 'axios';
import { Team, TeamCreate } from '@/types/team-types';
import { TEAM_ENDPOINTS } from '@/constants/endpoints-constant';

// Define response types
type UpdateTeamResponse = {
  success: boolean;
  message: string;
  data?: Team;
};

type DeleteTeamResponse = {
  success: boolean;
  message: string;
};

const AUTH_HEADER = {
  Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`
};

export class TeamsService {
  static async getTeamsByOrganization(organizationId: number): Promise<Team[]> {
    try {
      const response = await axios.get(`${TEAM_ENDPOINTS?.getOrganizationTeams}/${organizationId}`, {
        headers: AUTH_HEADER
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  static async createTeam(organizationId: number, teamData: TeamCreate): Promise<Team> {
    try {
      const response = await axios.post(
        `${TEAM_ENDPOINTS?.postCreateTeam}`,
        teamData,
        { headers: AUTH_HEADER }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  static async updateTeam(
    teamId: number,
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
  ): Promise<UpdateTeamResponse> {
    try {
      const updatePayload = {
        name: teamData.name,
        org_id: teamData.org_id,
        description: teamData.description,
        is_active: true,
        members: teamData.members,
      };

      console.log("Service Layer - Update team payload:", updatePayload);
      console.log("Service Layer - Members data:", teamData.members);

      const response = await axios.put(
        TEAM_ENDPOINTS.updateTeam(teamId),
        updatePayload,
        {
          headers: {
            ...AUTH_HEADER,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Service Layer - Update team response:", response.data);

      return {
        success: true,
        message: "Team updated successfully",
        data: response.data as Team
      };
    } catch (error: unknown) {
      console.error('Service Layer - Error updating team:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update team"
      };
    }
  }

  static async deleteTeam(teamId: number): Promise<DeleteTeamResponse> {
    try {
      const response = await axios.delete(TEAM_ENDPOINTS.deleteTeam(teamId), {
        headers: AUTH_HEADER
      });

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data?.message || "Failed to delete team");
      }
    } catch (error: unknown) {
      console.error('Error deleting team:', error);
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to delete team");
      }
      throw new Error("Failed to delete team");
    }
  }
}

export const deleteTeamService = (teamId: number) => TeamsService.deleteTeam(teamId);

export default TeamsService;
