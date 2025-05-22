import { Team, TeamCreate } from '@/types/team-types';
import teamsApi from './api/team-api';

export class TeamsService {
  static async getTeamsByOrganization(organizationId: string): Promise<Team[]> {
    try {
      const teams = await teamsApi.getTeamsByOrganization(organizationId);
      return this.transformTeamsResponse(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  static async createTeam(organizationId: string, teamData: TeamCreate): Promise<Team> {
    try {
      const team = await teamsApi.createTeam(organizationId, teamData);
      return this.transformTeamResponse(team);
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  private static transformTeamsResponse(teams: any[]): Team[] {
    return teams.map(team => this.transformTeamResponse(team));
  }

  private static transformTeamResponse(team: any): Team {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      members: team.members,
      organization_id: team.organization_id
    };
  }
}

export default TeamsService;
