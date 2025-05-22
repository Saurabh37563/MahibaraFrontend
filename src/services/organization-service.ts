import { organizationApi } from '@/services/api/organization-api'
import { Organization, User } from '@/types/organization-types'

export const MOCK_USERS: User[] = [/* same as yours */]

interface OrganizationService {
  searchUsers: (query: string) => Promise<User[]>
  createOrganization: (name: string, description: string | undefined, organizationHeadId: string) => Promise<Organization>
  getAllUserOrganizations: (user_id: string) => Promise<any[]>
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

  getAllUserOrganizations: async (user_id: string): Promise<any[]> => {
    try {
      console.log("Fetching organizations for user:", user_id)
      const response = await organizationApi.getAllUserOrganizations(user_id)
      return response
    } catch (error) {
      console.error("Error fetching organizations:", error)
      return []
    }
  },

  createOrganization: async (
    name: string,
    description: string | undefined,
    owner_id: string
  ): Promise<Organization> => {
    try {
      const response = await organizationApi.createOrganization({ name, description, owner_id })
      return response
    } catch (error) {
      console.error("Error creating organization:", error)
      throw error
    }
  }
}

export default organizationService
