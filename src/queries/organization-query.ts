import { useQuery, useMutation, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import organizationService from '@/services/organization-service'
import { User, Organization } from '@/types/organization-types'
import { queryClient } from '@/providers/query-provider'

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
  owner_id: number
}

// Create Organization
export function useCreateOrganization(): UseMutationResult<
  Organization,
  Error,
  CreateOrganizationParams
> {
  return useMutation({
    mutationFn: ({ name, description, owner_id }) =>
      organizationService.createOrganization(name, description, owner_id),
    onSuccess: (newOrg) => {
      console.log("New Org data:", newOrg);
      // variables.owner_id holds the user_id passed to mutation
      queryClient.invalidateQueries({ queryKey: ['organizations', newOrg.organisation_admin] });
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
