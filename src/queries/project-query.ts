import { useQuery, useMutation, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import projectService from '@/services/project-service';
import { Project, CreateProjectRequest, UpdateProjectStatusRequest, FilterState } from '@/types/project-types';
import { queryClient } from '@/providers/query-provider';

// Get all projects for a team with filters
export function useGetTeamProjects(
  team_id: string,
  filters?: FilterState
): UseQueryResult<Project[], Error> {
  return useQuery({
    queryKey: ['projects', team_id, filters],
    queryFn: () => projectService.getTeamProjects(team_id, filters),
    enabled: !!team_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
// Create project
export function useCreateProject(): UseMutationResult<
  Project,
  Error,
  CreateProjectRequest
> {
  return useMutation({
    mutationFn: (projectData) => projectService.createProject(projectData),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ 
        queryKey: ['projects', newProject.team_id] 
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
    mutationFn: ({ team_id, project_id, status }) =>
      projectService.updateProjectStatus(team_id, project_id, status),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ 
        queryKey: ['projects', updatedProject.team_id] 
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
    mutationFn: ({ team_id, project_id }) =>
      projectService.deleteProject(team_id, project_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['projects', variables.team_id] 
      });
    },
  });
}
