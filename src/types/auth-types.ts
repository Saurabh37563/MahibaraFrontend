export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
