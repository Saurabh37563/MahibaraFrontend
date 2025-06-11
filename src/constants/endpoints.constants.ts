export const API_BASE_URL = 'http://192.168.1.63:8000/api/v1';

export const ENDPOINTS = {
  USERS: {
    SEARCH: `${API_BASE_URL}/teams/user-info`,
  },
};

export const TEAMS_ENDPOINTS = {
  DELETE_TEAM: (teamId: number) => `/teams/${teamId}`,
} as const;
