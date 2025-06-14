import { useQuery, useMutation, UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {  Organization } from '@/types/organization-types'
import { BASE_TEMP_BACKEND_URL, ORGANIZATION_ENDPOINTS } from '@/constants/endpoints-constant'
export interface UpdateOrganizationParams {
  id: string;
  name: string;
  description?: string;
  organisation_admin?: number;
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
    mutationFn: async ({ name, description, organization_owner }) => {
      const response = await axios.post(
        ORGANIZATION_ENDPOINTS.postCreateOrganization,
        { name, description, organisation_admin: organization_owner },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6NDEwMjQ0NDgwMH0.1p2oi1RTDHROIWDEeoXOgTN11w6-5GBecf9GPoDgj70`,
          },
        }
      );
      return response.data?.data;
    },
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
    queryFn: async () => {
      const response = await axios.get(ORGANIZATION_ENDPOINTS.getAllUserOrganizations, {
        params: { user_id },
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6NDEwMjQ0NDgwMH0.1p2oi1RTDHROIWDEeoXOgTN11w6-5GBecf9GPoDgj70`,
        },
      });
      return response.data?.data;
    },
    enabled: !!user_id,
  });
}

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orgId: number) => {
      const response = await axios.delete(
        `${BASE_TEMP_BACKEND_URL}/api/v1/organizations/${orgId}`,
        {
          params: { permanent: false },
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU4MTIxNzU2fQ.er7ojWsABIKpq_DqnK0EnZFK6r41bU8zHzxBrVLkNSs',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
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
      const { id, ...updatePayload } = data;
      const response = await axios.put(
        `${BASE_TEMP_BACKEND_URL}/api/v1/organizations/${id}`,
        updatePayload,
        {
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU4MTIxNzU2fQ.er7ojWsABIKpq_DqnK0EnZFK6r41bU8zHzxBrVLkNSs',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => {
      console.error('Error updating organization:', error);
    },
  });
};

