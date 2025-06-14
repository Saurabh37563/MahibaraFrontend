import axios from 'axios';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectStatusRequest,
  FilterState
} from '@/types/project-types';
import { BASE_TEMP_BACKEND_URL, PROJECT_ENDPOINTS } from '@/constants/endpoints-constant';

export interface PaginatedProjectsResponse {
  success: boolean;
  message: string;
  data: Project[];
  error: unknown;
  metadata: {
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer test-token`,
  },
});

interface ProjectService {
  getTeamProjects: (team_id: string, filters?: FilterState) => Promise<PaginatedProjectsResponse>;
  createProject: (projectData: CreateProjectRequest) => Promise<Project>;
  updateProjectStatus: (
    team_id: string,
    project_id: string,
    status: UpdateProjectStatusRequest
  ) => Promise<Project>;
  deleteProject: (team_id: string, project_id: string) => Promise<void>;
}

const projectService: ProjectService = {
  getTeamProjects: async (team_id: string, filters?: FilterState): Promise<PaginatedProjectsResponse> => {
    try {
      const validatedFilters: FilterState = {
        status: filters?.status || 'all',
        sortField: filters?.sortField || 'date',
        sortOrder: filters?.sortOrder || 'desc',
        dateRange: filters?.dateRange || 'all',
        search: filters?.search || '',
        page: filters?.page || 1,
      };

      // Build query parameters
      const queryParams = new URLSearchParams();

      if(team_id) {
        queryParams.append('team_id', team_id);
      } else {
        throw new Error('Team ID is required to fetch projects.');
      }
      if (validatedFilters) {
        if (validatedFilters.status && validatedFilters.status !== 'all') {
          queryParams.append('status', validatedFilters.status);
        }
        if (validatedFilters.sortField && validatedFilters.sortField !== 'date') {
          queryParams.append('sortField', validatedFilters.sortField);
        }
        if (validatedFilters.sortOrder && validatedFilters.sortOrder !== 'desc') {
          queryParams.append('sortOrder', validatedFilters.sortOrder);
        }
        if (validatedFilters.dateRange && validatedFilters.dateRange !== 'all') {
          queryParams.append('dateRange', validatedFilters.dateRange);
        }
        if (validatedFilters.search) {
          queryParams.append('search', validatedFilters.search.trim());
        }
        if (validatedFilters.page) {
          queryParams.append('page', String(validatedFilters.page));
        }
      }

      const url = `${PROJECT_ENDPOINTS.getTeamProjects}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await axiosInstance.get<PaginatedProjectsResponse>(url);
      return response?.data || { data: [], metadata: {}, success: false, message: '', error: null };
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

  createProject: async (projectData: CreateProjectRequest): Promise<Project> => {
    try {
      const response = await axiosInstance.post<Project>(
        `${BASE_TEMP_BACKEND_URL}/api/v1/projects/create_project`,
        projectData
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
    status: UpdateProjectStatusRequest
  ): Promise<Project> => {
    try {
      const response = await axiosInstance.patch<Project>(
        `${PROJECT_ENDPOINTS.updateProject}/${project_id}/status/${typeof status.status === "string" ? status.status : ""}`,
        status
      );
      return response.data as Project || {};
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
        `${BASE_TEMP_BACKEND_URL}/api/v1/projects/${project_id}`
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

export default projectService;
