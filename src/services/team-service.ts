import { Team, TeamCreate } from '@/types/team-types';
import teamsApi from './api/team-api';

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

export class TeamsService {
  static async getTeamsByOrganization(organizationId: number): Promise<Team[]> {
    try {
      const teams = await teamsApi.getTeamsByOrganization(organizationId);
      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  static async createTeam(organizationId: number, teamData: TeamCreate): Promise<Team> {
    try {
      const team = await teamsApi.createTeam(organizationId, teamData);
      return team;
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

      const result = await teamsApi.updateTeam(teamId, updatePayload);

      console.log("Service Layer - Update team response:", result);

      return {
        success: true,
        message: "Team updated successfully",
        data: result as Team
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
      const response: DeleteTeamResponse = await teamsApi.deleteTeam(teamId);

      if (response.success) {
        return {
          success: true,
          message: response.message,
        };
      } else {
        throw new Error(response.message || "Failed to delete team");
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
