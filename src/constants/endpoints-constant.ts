export const BASE_BACKEND_URL=process.env.BACKEND_URL

const BASE_AUTH_URL=  BASE_BACKEND_URL + '/auth/v1'
export const USER_AUTH_URL={
    postGetAccessToken: BASE_AUTH_URL + '/getAccessToken',
    postLogin: BASE_AUTH_URL +  '/login',
    postLogout: BASE_AUTH_URL +   '/logout',
    postSignup: BASE_AUTH_URL +  '/signup',
    getUserData: BASE_AUTH_URL +  '/me'
}