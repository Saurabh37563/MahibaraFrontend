import { z } from 'zod';

// User type
export interface User {
  id: string
  name: string
  email: string
  position: string
  avatarUrl: string | null
}

// Organization type
export interface Organization {
  id: number
  name: string
  description?: string
  image?: string | null
  owner_id: string
  organisation_admin?: number
  createdAt?: string
  updatedAt?: string
}

// Request to create an organization
export interface CreateOrganizationRequest {
  name: string
  description?: string
  organisation_admin: number
}

export const CreateOrganizationSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  organization_owner: z.number(),
});

export type CreateOrganizationParams = z.infer<typeof CreateOrganizationSchema>;
