import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User, UserUpdateData } from '@/types/user-types';
import { useAuth } from '@/contexts/auth-context';
import { USER_DATA_URL, USER_AUTH_URL } from '@/constants/endpoints-constant';

const transformUserResponse = (userData: Record<string, unknown>): User => {
  const allowedUserTypes = ["USER", "ADMIN", "MANAGER"] as const;
  const userTypeRaw = userData.userType as string;
  const userType = allowedUserTypes.includes(userTypeRaw as (typeof allowedUserTypes)[number])
    ? (userTypeRaw as typeof allowedUserTypes[number])
    : "USER";

  return {
    id: Number(userData.id),
    name: (userData.name as string) ?? "",
    email: (userData.email as string) ?? "",
    image: userData.image as string | null,
    designation: userData.designation as string | null,
    organizationId: userData.organizationId as string | null,
    organizationName: userData.organizationName as string | null,
    userType,
    createdAt: userData.createdAt as string | null,
    updatedAt: userData.updatedAt as string | null
  };
};

export const useUserQueries = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const useUserProfile = () => {
    return useQuery({
      queryKey: ['user-profile'],
      queryFn: async () => {
        if (!token) return Promise.reject('No token');
        // For development/testing, return mock data
        // Replace with axios call for production
        // const response = await axios.get(USER_DATA_URL.getUserData, { headers: { Authorization: `Bearer ${token}` } });
        // return transformUserResponse(response.data.data);
        return transformUserResponse({
          id: 'user-123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          image: 'https://randomuser.me/api/portraits/men/1.jpg',
          organizationId: 'org-456',
          organizationName: 'Acme Corporation',
          userType: 'USER',
          createdAt: '2023-01-15T08:30:00Z',
          updatedAt: '2023-05-20T14:45:00Z',
        });
      },
      enabled: !!token,
      initialData: user || undefined
    });
  };

  const useUpdateUserProfile = () => {
    return useMutation({
      mutationFn: async (userData: UserUpdateData) => {
        if (!token) throw new Error('No authentication token');
        const response = await axios.put(USER_DATA_URL.updateUserData, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return transformUserResponse(response.data.data);
      },
      onSuccess: (updatedUser) => {
        queryClient.setQueryData(['user-profile'], updatedUser);
      }
    });
  };

  const useRequestPasswordReset = () => {
    return useMutation({
      mutationFn: async (email: string) => {
        if (!token) throw new Error('No authentication token');
        await axios.post(USER_AUTH_URL.resetPassword, { email }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    });
  };

  return {
    useUserProfile,
    useUpdateUserProfile,
    useRequestPasswordReset
  };
};
