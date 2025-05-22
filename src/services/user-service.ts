import { userApi } from './api/user-api';
import { User, UserUpdateData } from '@/types/user-types';

export class UserService {
  static async getUserData(token: string): Promise<User> {
    try {
      const response = await userApi.getUserData(token);
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

  private static transformUserResponse(userData: any): User {
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      organizationId: userData.organizationId,
      organizationName: userData.organizationName,
      userType: userData.userType,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };
  }
}

export default UserService;
