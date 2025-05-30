import axios from 'axios'
import { USER_DATA_URL, ORGANIZATION_ENDPOINTS } from '@/constants/endpoints-constant'
import { User, CreateOrganizationRequest, Organization } from '@/types/organization-types' 


export const organizationApi = {
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await axios.get(USER_DATA_URL?.searchUsers, {
      params: { query },
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`,
      },
    })
    return response.data
  },

  getAllUserOrganizations: async (user_id: number): Promise<Organization[]> => {
    const response = await axios.get(ORGANIZATION_ENDPOINTS?.getAllUserOrganizations, {
      params: { user_id }, 
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`,
      },
    })
    return response.data?.data
  },

  createOrganization: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await axios.post(ORGANIZATION_ENDPOINTS?.postCreateOrganization, data, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU3MTY2MTQ5fQ.FbbxmSgW6Zs61Ucv731PO3eN2xufGsM5r84GYX2B2nA`,
      },
    })
    return response.data?.data
  },
}
