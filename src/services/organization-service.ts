import axios from 'axios'
import { ORGANIZATION_ENDPOINTS } from '@/constants/endpoints-constant'
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
      const response = await axios.get(ORGANIZATION_ENDPOINTS?.getAllUserOrganizations, {
        params: { user_id },
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6NDEwMjQ0NDgwMH0.1p2oi1RTDHROIWDEeoXOgTN11w6-5GBecf9GPoDgj70`,
        },
      })
      return response.data?.data
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
      const response = await axios.post(
        ORGANIZATION_ENDPOINTS?.postCreateOrganization,
        { name, description, organisation_admin: owner_id },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6NDEwMjQ0NDgwMH0.1p2oi1RTDHROIWDEeoXOgTN11w6-5GBecf9GPoDgj70`,
          },
        }
      )
      return response.data?.data
    } catch (error) {
      const msg = getErrorMessage(error, "Error creating organization")
      console.error(msg)
      throw error
    }
  }
}

export default organizationService
