import { organizationApi } from '@/services/api/organization-api'
import { Organization, User } from '@/types/organization-types'
import { getErrorMessage } from '@/utils/getErrorMassage'

export const MOCK_USERS: User[] = [/* same as yours */]

interface OrganizationService {
  searchUsers: (query: string) => Promise<User[]>
  createOrganization: (name: string, description: string | undefined, organizationHeadId: number) => Promise<Organization>
  getAllUserOrganizations: (user_id: number) => Promise<Organization[]>
}

const organizationService: OrganizationService = {
  searchUsers: async (query: string): Promise<User[]> => {
    try {
      console.log("Searching users with query:", query)
      await new Promise(resolve => setTimeout(resolve, 500))

      if (!query || query.length < 2) return []
      return MOCK_USERS.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error("Error searching users:", error)
      return []
    }
  },

  getAllUserOrganizations: async (user_id: number): Promise<Organization[]> => {
    try {
      console.log("Fetching organizations for user:", user_id)
      const response = await organizationApi.getAllUserOrganizations(user_id)
      return response
    } catch (error) {
      const msg = getErrorMessage(error, "Error fetching organizations")
      console.error(msg)
      return []
    }
  },

  createOrganization: async (
    name: string,
    description: string | undefined,
    owner_id: number
  ): Promise<Organization> => {
    try {
      const response = await organizationApi.createOrganization({ name, description, organisation_admin: owner_id })
      return response
    } catch (error) {
      const msg = getErrorMessage(error, "Error creating organization")
      console.error(msg)
      throw error
    }
  }
}

export default organizationService
