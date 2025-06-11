import { z } from 'zod';

// Base User schema with Zod for type safety
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  designation: z.string().nullable(),
  organizationId: z.string().nullable(),
  organizationName: z.string().nullable(),
  userType: z.enum(['ADMIN', 'USER', 'MANAGER']).optional(),
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
  error: z.string().nullable(),
  metadata: z.any().nullable(),
});

export const UserResponseSchema = ApiResponseSchema.extend({
  data: z.array(UserSchema),
});

export type UserApiResponse = z.infer<typeof UserResponseSchema>;
