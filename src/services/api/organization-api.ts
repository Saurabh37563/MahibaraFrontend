import axios from 'axios'
import {  ORGANIZATION_ENDPOINTS } from '@/constants/endpoints-constant'
import { User, CreateOrganizationRequest, Organization } from '@/types/organization-types' 


export const organizationApi = {
  searchUsers: async (): Promise<User[]> => {
    const response = await axios.get(ORGANIZATION_ENDPOINTS?.getAllUserOrganizations, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6NDEwMjQ0NDgwMH0.1p2oi1RTDHROIWDEeoXOgTN11w6-5GBecf9GPoDgj70`,
      },
    })
    return response.data?.data
  },

  getAllUserOrganizations: async (user_id: number): Promise<Organization[]> => {
    const response = await axios.get(ORGANIZATION_ENDPOINTS?.getAllUserOrganizations, {
      params: { user_id }, 
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6NDEwMjQ0NDgwMH0.1p2oi1RTDHROIWDEeoXOgTN11w6-5GBecf9GPoDgj70`,
      },
    })
    return response.data?.data
  },

  createOrganization: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await axios.post(ORGANIZATION_ENDPOINTS?.postCreateOrganization, data, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6NDEwMjQ0NDgwMH0.1p2oi1RTDHROIWDEeoXOgTN11w6-5GBecf9GPoDgj70`,
      },
    })
    return response.data?.data
  },
}
