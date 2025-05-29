import { Team, TeamCreate } from '@/types/team-types';
import teamsApi from './api/team-api';

export class TeamsService {
  static async getTeamsByOrganization(organizationId: number): Promise<Team[]> {
    try {
      const teams = await teamsApi.getTeamsByOrganization(organizationId);
      return teams
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



}

export default TeamsService;
