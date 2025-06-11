import { useQuery, useMutation, UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query'
import organizationService from '@/services/organization-service'
import { User, Organization } from '@/types/organization-types'
import { BASE_TEMP_BACKEND_URL } from '@/constants/endpoints-constant';
export interface UpdateOrganizationParams {
  id: string;
  name: string;
  description?: string;
  organisation_admin?: number;
}

// Search Users
export function useSearchUsers(query: string): UseQueryResult<User[], Error> {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => organizationService.searchUsers(query),
    enabled: !!query,
  })
}

interface CreateOrganizationParams {
  name: string
  description?: string
  organization_owner: number 
}

// Create Organization
export function useCreateOrganization(): UseMutationResult<
  Organization,
  Error,
  CreateOrganizationParams
> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, description, organization_owner }) =>
      organizationService.createOrganization(name, description, organization_owner),
    onSuccess: (newOrg, variables) => {
      console.log("New Org data:", newOrg);
      // Invalidate organizations for the user who created the org
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.organization_owner] });
      // Also invalidate general organizations query
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useGetAllUserOrganizations(user_id: number): UseQueryResult<Organization[], Error> {
  return useQuery({
    queryKey: ['organizations', user_id],
    queryFn: () => organizationService.getAllUserOrganizations(user_id),
    enabled: !!user_id,
  });
}

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orgId: number) => {
      const response = await fetch(`${BASE_TEMP_BACKEND_URL}/api/v1/organizations/${orgId}?permanent=false`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU4MTIxNzU2fQ.er7ojWsABIKpq_DqnK0EnZFK6r41bU8zHzxBrVLkNSs',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete organization: ${response.status} ${errorData}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch organizations list
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => {
      console.error('Error deleting organization:', error);
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateOrganizationParams) => {
      console.log('Updating organization with data:', data);
      
      const { id, ...updatePayload } = data;
      
      const response = await fetch(`${BASE_TEMP_BACKEND_URL}/api/v1/organizations/${id}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU4MTIxNzU2fQ.er7ojWsABIKpq_DqnK0EnZFK6r41bU8zHzxBrVLkNSs',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update organization: ${response.status} ${errorData}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => {
      console.error('Error updating organization:', error);
    },
  });
};

