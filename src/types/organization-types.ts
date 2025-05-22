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
  id: string
  name: string
  description?: string
  owner_id: string
  createdAt?: string
  updatedAt?: string
}

// Request to create an organization
export interface CreateOrganizationRequest {
  name: string
  description?: string
  owner_id: string
}

// For query parameters (example)
export interface GetAllUserOrganizationsParams {
  user_id: string
}
