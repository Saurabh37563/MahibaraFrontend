import { projectApi } from './api/project-api';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectStatusRequest,
  FilterState
} from '@/types/project-types';

interface ProjectService {
  getTeamProjects: (team_id: string, filters?: FilterState) => Promise<Project[]>;
  createProject: (projectData: CreateProjectRequest) => Promise<Project>;
  updateProjectStatus: (
    team_id: string,
    project_id: string,
    status: UpdateProjectStatusRequest
  ) => Promise<Project>;
  deleteProject: (team_id: string, project_id: string) => Promise<void>;
}

const projectService: ProjectService = {
  getTeamProjects: async (team_id: string, filters?: FilterState): Promise<Project[]> => {
    try {
      // Validate filters before passing them to the API
      const validatedFilters: FilterState = {
        status: filters?.status || 'all',
        sortField: filters?.sortField || 'date',
        sortOrder: filters?.sortOrder || 'desc',
        dateRange: filters?.dateRange || 'all',
        search: filters?.search || '',
      };

      // Log for debugging
      console.log("Fetching projects for team:", team_id, "with filters:", validatedFilters);
      
      const response = await projectApi.getTeamProjects(team_id, validatedFilters);
      return response;
    } catch (error) {
      console.error("Error fetching team projects:", error);
      throw error; // Re-throw to be handled by the query error boundary
    }
  },

  createProject: async (projectData: CreateProjectRequest): Promise<Project> => {
    try {
      const response = await projectApi.createProject(projectData);
      return response;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  updateProjectStatus: async (
    team_id: string,
    project_id: string,
    status: UpdateProjectStatusRequest
  ): Promise<Project> => {
    try {
      const response = await projectApi.updateProjectStatus(team_id, project_id, status);
      return response;
    } catch (error) {
      console.error("Error updating project status:", error);
      throw error;
    }
  },

  deleteProject: async (team_id: string, project_id: string): Promise<void> => {
    try {
      await projectApi.deleteProject(team_id, project_id);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },
};

export default projectService;
