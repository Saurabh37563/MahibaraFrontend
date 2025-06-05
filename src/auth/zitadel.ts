// auth/zitadel.ts
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

 interface ZitadelProfile {
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
    issuer: "https://auth.southguild.tech",
    wellKnown: "https://auth.southguild.tech/.well-known/openid-configuration",
    authorization: {
      url: "https://auth.southguild.tech/oauth/v2/authorize",
      params: {
        scope: "openid email profile",
      }
    },
    token: {
      url: "https://auth.southguild.tech/oauth/v2/token",
    },
    userinfo: {
      url: "https://auth.southguild.tech/oauth/v2/token",
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
