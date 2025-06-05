// API URL Constants
export const BASE_BACKEND_URL = "http://localhost:8000/api/v1";
export const BASE_TEMP_BACKEND_URL = "http://192.168.1.63:8000"
// export const BASE_TEMP_BACKEND_URL = "http://localhost:8000"
const BASE_AUTH_URL = BASE_BACKEND_URL + "/auth";
const BASE_ORG_URL = BASE_BACKEND_URL + "/organization";
const BASE_USER_DATA = BASE_BACKEND_URL + "/users";
const BASE_TEAMS_URL = BASE_TEMP_BACKEND_URL + "/api/v1/teams";
const BASE_PROJECTS_URL = BASE_BACKEND_URL + "/projects";
// const BASE_FILE_UPLOAD_URL = BASE_BACKEND_URL + "/file-upload";

const BASE_FILE_UPLOAD_URL = BASE_TEMP_BACKEND_URL+"/api/v1/projects";
const BASE_SHEET_UPLOAD_URL = BASE_TEMP_BACKEND_URL+"/api/v1/sheet";
export const USER_AUTH_URL = {
  postGetAccessToken: BASE_AUTH_URL + "/getAccessToken",
  postLogin: BASE_AUTH_URL + "/login",
  postLogout: BASE_AUTH_URL + "/logout",
  postSignup: BASE_AUTH_URL + "/signup",
  resetPassword: BASE_AUTH_URL + "/reset-password",
};

export const USER_DATA_URL = {
  getUserData: BASE_USER_DATA + "/me",
  searchUsers: BASE_USER_DATA + "/search",
  updateUserData: BASE_USER_DATA + "/update",
};

export const ORGANIZATION_ENDPOINTS = {
  postCreateOrganization: BASE_TEMP_BACKEND_URL+  '/api/v1/organizations',
  getAllUserOrganizations: BASE_TEMP_BACKEND_URL+  '/api/v1/organizations',
  getOrganizationDetails: BASE_ORG_URL + "/details",
};

export const TEAM_ENDPOINTS = {
  getOrganizationTeams: BASE_TEAMS_URL + '/organization',
  postCreateTeam: BASE_TEAMS_URL,
  getAllUserOrganizations: BASE_ORG_URL + "/get-all-org",
  getOrganizationDetails: BASE_ORG_URL + "/details",
};

export const PROJECT_ENDPOINTS = {
  getTeamProjects: `${BASE_TEMP_BACKEND_URL}/api/v1/projects`,
  createProject: `${BASE_PROJECTS_URL}`,
  updateProject: `${BASE_TEMP_BACKEND_URL}/api/v1/projects`,
  deleteProject: `${BASE_PROJECTS_URL}`,
} as const;

export const FILE_UPLOAD_ENDPOINTS = {
  // Endpoints to get sheet types and validated sheet types
  getSheetTypes: `${BASE_SHEET_UPLOAD_URL}/get_sheet_types`,
  getValidatedSheetTypes: `${BASE_SHEET_UPLOAD_URL}/file_mapping`,

  // Endpoint to upload files to Digital Ocean
  uploadToSpaces: `${BASE_FILE_UPLOAD_URL}/files/upload`,

  // Endpoint to submit mappings
  submitMappings: `${BASE_SHEET_UPLOAD_URL}/file_mapping`,

  // get mapped sheet types of a project 
  getMappedSheetTypes: `${BASE_SHEET_UPLOAD_URL}/mapped_sheet_types`,
};
