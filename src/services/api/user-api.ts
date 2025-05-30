import axios from 'axios';
import { UserUpdateData } from '@/types/user-types';
import { USER_DATA_URL, USER_AUTH_URL } from '@/constants/endpoints-constant';

export const userApi = {
  getUserData: async () => {
    // For development/testing, return mock data
    return Promise.resolve({
      data: {
        success: true,
        data: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          image: 'https://randomuser.me/api/portraits/men/1.jpg',
          organizationId: 'org-456',
          organizationName: 'Acme Corporation',
          userType: 'USER',
          createdAt: '2023-01-15T08:30:00Z',
          updatedAt: '2023-05-20T14:45:00Z',
        }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as Record<string, unknown>
    });

    // When ready for production, uncomment this:
    // return axios.get(USER_DATA_URL.getUserData, {
    //   headers: {
    //     Authorization: `Bearer ${token}`
    //   }
    // });
  },

  updateUserData: async (token: string, userData: UserUpdateData) => {
    return axios.put(USER_DATA_URL.updateUserData, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  requestPasswordReset: async (token: string, email: string) => {
    return axios.post(USER_AUTH_URL.resetPassword, { email }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default userApi;
