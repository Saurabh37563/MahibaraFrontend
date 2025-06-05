import { z } from 'zod';

// User schema with Zod for type safety
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  image: z.string().url().nullable(),
  organizationId: z.string().nullable(),
  organizationName: z.string().nullable(),
  userType: z.enum(['ADMIN', 'USER', 'MANAGER']),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

export type User = z.infer<typeof UserSchema>;
export interface UserUpdateData {
  name?: string;
  email?: string;
  image?: string;
  password?: string;
  currentPassword?: string;
}

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const UserResponseSchema = ApiResponseSchema.extend({
  data: UserSchema.optional(),
});

export const PasswordResetSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});
