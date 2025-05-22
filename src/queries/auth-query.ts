import { useMutation } from '@tanstack/react-query';
import authService from '@/services/auth-service';

// register user mutation :
export function useRegisterUser() {
  return useMutation({
    mutationFn: (userData: any) => authService.registerUser(userData)
  });
}