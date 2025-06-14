import { useQuery, useMutation, UseMutationResult, UseQueryResult, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Project, CreateProjectRequest, UpdateProjectStatusRequest, FilterState } from '@/types/project-types';
import { queryClient } from '@/providers/query-provider';
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

// Get all projects for a team with filters
export function useGetTeamProjects(
  team_id: string,
  filters?: FilterState
): UseQueryResult<PaginatedProjectsResponse, Error> {
  return useQuery({
    queryKey: ['projects', team_id, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (team_id) {
        queryParams.append('team_id', team_id);
      } else {
        throw new Error('Team ID is required to fetch projects.');
      }
      if (filters) {
        if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
        if (filters.sortField && filters.sortField !== 'date') queryParams.append('sortField', filters.sortField);
        if (filters.sortOrder && filters.sortOrder !== 'desc') queryParams.append('sortOrder', filters.sortOrder);
        if (filters.dateRange && filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
        if (filters.search) queryParams.append('search', filters.search.trim());
        if (filters.page) queryParams.append('page', String(filters.page));
      }
      const url = `${PROJECT_ENDPOINTS.getTeamProjects}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      try {
        const response = await axiosInstance.get<PaginatedProjectsResponse>(url);
        return response?.data || { data: [], metadata: {}, success: false, message: '', error: null };
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch projects. Please try again.');
        }
        throw error;
      }
    },
    enabled: !!team_id,
  });
}

// Create project
export function useCreateProject(): UseMutationResult<
  Project,
  Error,
  CreateProjectRequest
> {
  return useMutation({
    mutationFn: async (projectData) => {
      try {
        const response = await axiosInstance.post<Project>(
          `${BASE_TEMP_BACKEND_URL}/api/v1/projects/create_project`,
          projectData
        );
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to create project. Please try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'projects' ||
          query.queryKey[0] === 'projects-infinite',
      });
    },
  });
}

// Update project status
export function useUpdateProjectStatus(): UseMutationResult<
  Project,
  Error,
  { team_id: string; project_id: string; status: UpdateProjectStatusRequest }
> {
  return useMutation({
    mutationFn: async ({ project_id, status }) => {
      try {
        const response = await axiosInstance.patch<Project>(
          `${PROJECT_ENDPOINTS.updateProject}/${project_id}/status/${typeof status.status === "string" ? status.status : ""}`,
          status
        );
        return response.data as Project || {};
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to update project status. Please try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'projects',
      });
    },
  });
}

// Delete project
export function useDeleteProject(): UseMutationResult<
  void,
  Error,
  { team_id: string; project_id: string }
> {
  return useMutation({
    mutationFn: async ({ project_id }) => {
      try {
        await axiosInstance.delete(
          `${BASE_TEMP_BACKEND_URL}/api/v1/projects/${project_id}`
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to delete project. Please try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'projects',
      });
    },
  });
}

// Infinite query for team projects (for infinite scroll)
export function useGetTeamProjectsInfinite(
  team_id: string,
  filters?: Omit<FilterState, "page">
) {
  return useInfiniteQuery<PaginatedProjectsResponse, Error>({
    queryKey: ['projects-infinite', team_id, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams();
      if (team_id) {
        queryParams.append('team_id', team_id);
      } else {
        throw new Error('Team ID is required to fetch projects.');
      }
      if (filters) {
        if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
        if (filters.sortField && filters.sortField !== 'date') queryParams.append('sortField', filters.sortField);
        if (filters.sortOrder && filters.sortOrder !== 'desc') queryParams.append('sortOrder', filters.sortOrder);
        if (filters.dateRange && filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
        if (filters.search) queryParams.append('search', filters.search.trim());
      }
      queryParams.append('page', String(pageParam));
      const url = `${PROJECT_ENDPOINTS.getTeamProjects}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      try {
        const response = await axiosInstance.get<PaginatedProjectsResponse>(url);
        return response?.data || { data: [], metadata: {}, success: false, message: '', error: null };
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch projects. Please try again.');
        }
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.metadata?.has_next) {
        return (lastPage.metadata.current_page || 1) + 1;
      }
      return undefined;
    },
    enabled: !!team_id,
    initialPageParam: 1, // <-- Fix: required by react-query v5+
  });
}
