import axios from 'axios';
import { BASE_TEMP_BACKEND_URL, PROJECT_ENDPOINTS } from '@/constants/endpoints-constant';
import type { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectStatusRequest,
  FilterState 
} from '@/types/project-types';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer test-token`,
  },
});

export const projectApi = {
  getTeamProjects: async (team_id: string, filters?: FilterState): Promise<Project[]> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if(team_id) {
        queryParams.append('team_id', team_id);
      } else {
        throw new Error('Team ID is required to fetch projects.');
      }
      if (filters) {
        // Only add non-default filter values
        if (filters.status && filters.status !== 'all') {
          queryParams.append('status', filters.status);
        }

        if (filters.sortField && filters.sortField !== 'date') {
          queryParams.append('sortField', filters.sortField);
        }

        if (filters.sortOrder && filters.sortOrder !== 'desc') {
          queryParams.append('sortOrder', filters.sortOrder);
        }

        if (filters.dateRange && filters.dateRange !== 'all') {
          queryParams.append('dateRange', filters.dateRange);
        }

        if (filters.search) {
          queryParams.append('search', filters.search.trim());
        }
      }

      // Construct the URL with query parameters
      const url = `${PROJECT_ENDPOINTS.getTeamProjects}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await axiosInstance.get<any>(url);
      return response?.data?.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          'Failed to fetch projects. Please try again.'
        );
      }
      throw error;
    }
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    try {
      const response = await axiosInstance.post<Project>(
        `${BASE_TEMP_BACKEND_URL}/api/v1/projects/create_project`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          'Failed to create project. Please try again.'
        );
      }
      throw error;
    }
  },

  updateProjectStatus: async (
    team_id: string,
    project_id: string,
    data: UpdateProjectStatusRequest
  ): Promise<Project> => {
    try {
      const response = await axiosInstance.patch<any>(
        `${PROJECT_ENDPOINTS.updateProject}/${project_id}/status/${data?.status}`,
        data
      );
      return response.data?.data || {};
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          'Failed to update project status. Please try again.'
        );
      }
      throw error;
    }
  },

  deleteProject: async (team_id: string, project_id: string): Promise<void> => {
    try {
      await axiosInstance.delete(
        `${PROJECT_ENDPOINTS.deleteProject}/${team_id}/projects/${project_id}`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          'Failed to delete project. Please try again.'
        );
      }
      throw error;
    }
  },
};
