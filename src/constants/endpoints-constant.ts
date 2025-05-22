// API URL Constants
export const BASE_BACKEND_URL = 'http://localhost:8000/api/v1';

const BASE_AUTH_URL = BASE_BACKEND_URL + '/auth';
const BASE_ORG_URL = BASE_BACKEND_URL + '/organization';
const BASE_USER_DATA = BASE_BACKEND_URL + '/users';
const BASE_TEAMS_URL = BASE_BACKEND_URL + '/teams'
const BASE_PROJECTS_URL = BASE_BACKEND_URL + '/projects'
export const USER_AUTH_URL = {
  postGetAccessToken: BASE_AUTH_URL + '/getAccessToken',
  postLogin: BASE_AUTH_URL + '/login',
  postLogout: BASE_AUTH_URL + '/logout',
  postSignup: BASE_AUTH_URL + '/signup',
  resetPassword: BASE_AUTH_URL + '/reset-password',
};

export const USER_DATA_URL = {
  getUserData: BASE_USER_DATA + '/me',
  searchUsers: BASE_USER_DATA + '/search',
  updateUserData: BASE_USER_DATA + '/update',
};

export const ORGANIZATION_ENDPOINTS = {
  postCreateOrganization: BASE_ORG_URL + '/create',
  getAllUserOrganizations:BASE_ORG_URL + '/get-all-org',
  getOrganizationDetails: BASE_ORG_URL + '/details',
};

export const TEAM_ENDPOINTS = {
  getOrganizationTeams: BASE_TEAMS_URL,
  getAllUserOrganizations:BASE_ORG_URL + '/get-all-org',
  getOrganizationDetails: BASE_ORG_URL + '/details',
};

export const PROJECT_ENDPOINTS = {
  getTeamProjects: `${BASE_PROJECTS_URL}`,
  createProject: `${BASE_PROJECTS_URL}`,
  updateProject: `${BASE_PROJECTS_URL}`,
  deleteProject: `${BASE_PROJECTS_URL}`,
} as const;
