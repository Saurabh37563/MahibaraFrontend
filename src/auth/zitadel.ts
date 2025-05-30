// auth/zitadel.ts
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

export interface ZitadelProfile {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email: string;
  email_verified?: boolean;
  locale?: string;
  preferred_username?: string;
  picture?: string;
}

export default function Zitadel(options: OAuthUserConfig<ZitadelProfile>): OAuthConfig<ZitadelProfile> {
  return {
    id: "zitadel",
    name: "Zitadel",
    type: "oauth",
    issuer: "https://mab-learn-0arqdk.us1.zitadel.cloud",
    wellKnown: "https://mab-learn-0arqdk.us1.zitadel.cloud/.well-known/openid-configuration",
    authorization: {
      url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/authorize",
      params: {
        scope: "openid email profile",
        instance_id: "318212027426337769"
      }
    },
    token: {
      url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/token",
    },
    userinfo: {
      url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oidc/v1/userinfo",
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
        email: profile.email,
        image: profile.picture,
      };
    },
  
    options,
  };
}
