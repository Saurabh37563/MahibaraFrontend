import { userApi } from './api/user-api';
import { User, UserUpdateData } from '@/types/user-types';

export class UserService {
  static async getUserData(): Promise<User> {
    try {
      const response = await userApi.getUserData();
      return this.transformUserResponse(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  static async updateUserData(token: string, userData: UserUpdateData): Promise<User> {
    try {
      const response = await userApi.updateUserData(token, userData);
      return this.transformUserResponse(response.data.data);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  static async requestPasswordReset(token: string, email: string): Promise<void> {
    try {
      await userApi.requestPasswordReset(token, email);
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
