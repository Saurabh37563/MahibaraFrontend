import jwt from 'jsonwebtoken';
import axios from 'axios';
import { getErrorMessage } from '@/utils/getErrorMassage';

export const zitadelApi = {
  getToken: async (): Promise<string> => {
    const ZITADEL_ISSUER = 'https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/token';

    if (
      !process.env.NEXT_PUBLIC_ZITADEL_SA_PRIVATE_KEY ||
      !process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID
    ) {
      throw new Error('Missing required environment variables');
    }

    const privateKey = process.env.NEXT_PUBLIC_ZITADEL_SA_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .trim();
    
    try {
      const payload = {
        aud: ZITADEL_ISSUER,
        iss: process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID,
        sub: process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      };

      const token = jwt.sign(
        payload,
        privateKey,
        { algorithm: 'RS256' }
      );
      
      console.log("Generated JWT successfully");

      const tokenResponse = await axios.post(
        `${ZITADEL_ISSUER}/oauth/v2/token`,
        new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          scope: 'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud',
          assertion: token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log("Successfully exchanged JWT for access token");
      return tokenResponse.data.access_token;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to get ZITADEL token");
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  createUser: async (
    userData: {
      name: string;
      email: string;
      password: string;
    },
    token: string
  ): Promise<{ userId: string }> => {
    const [firstName, ...lastNameParts] = userData.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const response = await axios.post(
      'https://mab-learn-0arqdk.us1.zitadel.cloud/v2/users/human',
      {
        username: userData.email,
        profile: {
          givenName: firstName,
          familyName: lastName,
          displayName: userData.name,
          preferredLanguage: 'en',
        },
        email: {
          email: userData.email,
          isVerified: true,
        },
        password: {
          password: userData.password,
          changeRequired: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  },
};
