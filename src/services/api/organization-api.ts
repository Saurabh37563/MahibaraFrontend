import axios from 'axios'
import { USER_DATA_URL, ORGANIZATION_ENDPOINTS } from '@/constants/endpoints-constant'
import { User, CreateOrganizationRequest, Organization } from '@/types/organization-types' 
import http from '@/lib/http'

export const organizationApi = {
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await axios.get(USER_DATA_URL?.searchUsers, {
      params: { query },
      headers: {
        Authorization: `Bearer test-token`,
      },
    })
    return response.data
  },

  getAllUserOrganizations: async (user_id: string): Promise<any[]> => {
    const response = await axios.get(ORGANIZATION_ENDPOINTS?.getAllUserOrganizations, {
      params: { user_id }, 
      headers: {
        Authorization: `Bearer test-token`,
      },
    })
    return response.data
  },

  createOrganization: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await axios.post(ORGANIZATION_ENDPOINTS?.postCreateOrganization, data, {
      headers: {
        Authorization: `Bearer test-token`,
      },
    })
    return response.data
  },
}
