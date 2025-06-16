import axios from 'axios';
import { User, UserUpdateData } from '@/types/user-types';
import { USER_DATA_URL, USER_AUTH_URL } from '@/constants/endpoints-constant';

export class UserService {
  static async getUserData(): Promise<User> {
    try {
      // For development/testing, return mock data
      // Uncomment below for production API call
      // const response = await axios.get(USER_DATA_URL.getUserData, {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // });
      const response = await Promise.resolve({
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
        }
      });
      return this.transformUserResponse(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  static async updateUserData(token: string, userData: UserUpdateData): Promise<User> {
    try {
      const response = await axios.put(USER_DATA_URL.updateUserData, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return this.transformUserResponse(response.data.data);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  static async requestPasswordReset(token: string, email: string): Promise<void> {
    try {
      await axios.post(USER_AUTH_URL.resetPassword, { email }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  private static transformUserResponse(userData: Record<string, unknown>): User {
    const allowedUserTypes = ["USER", "ADMIN", "MANAGER"] as const;
    const userTypeRaw = userData.userType as string;
    const userType = allowedUserTypes.includes(userTypeRaw as (typeof allowedUserTypes)[number])
      ? (userTypeRaw as typeof allowedUserTypes[number])
      : "USER";

    return {
      id: Number(userData.id),
      name: (userData.name as string) ?? "", // Ensure name is always a string
      email: (userData.email as string) ?? "", // Ensure email is always a string
      image: userData.image as string | null,
      designation: userData.designation as string | null, // Add missing designation field
      organizationId: userData.organizationId as string | null,
      organizationName: userData.organizationName as string | null,
      userType,
      createdAt: userData.createdAt as string | null,
      updatedAt: userData.updatedAt as string | null
    };
  }
}

export default UserService;
