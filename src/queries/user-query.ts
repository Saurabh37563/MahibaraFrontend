import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user-service';
import {  UserUpdateData } from '@/types/user-types';
import { useAuth } from '@/contexts/auth-context';

export const useUserQueries = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const useUserProfile = () => {
    return useQuery({
      queryKey: ['user-profile'],
      queryFn: () => token ? UserService.getUserData() : Promise.reject('No token'),
      enabled: !!token,
      initialData: user || undefined
    });
  };

  const useUpdateUserProfile = () => {
    return useMutation({
      mutationFn: (userData: UserUpdateData) => {
        if (!token) throw new Error('No authentication token');
        return UserService.updateUserData(token, userData);
      },
      onSuccess: (updatedUser) => {
        queryClient.setQueryData(['user-profile'], updatedUser);
      }
    });
  };

  const useRequestPasswordReset = () => {
    return useMutation({
      mutationFn: (email: string) => {
        if (!token) throw new Error('No authentication token');
        return UserService.requestPasswordReset(token, email);
      }
    });
  };

  return {
    useUserProfile,
    useUpdateUserProfile,
    useRequestPasswordReset
  };
};
