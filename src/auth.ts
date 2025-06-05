import NextAuth from "next-auth"
import Zoho from "next-auth/providers/zoho"
import { Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Account } from "next-auth"
import Zitadel from "next-auth/providers/zitadel"

// Define a generic profile type for dynamic keys
type GenericProfile = Record<string, unknown>;

// Define a user type for session
interface SessionUser {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  loginName?: string;
  image?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Zitadel({
      issuer: "https://auth.southguild.tech",
      clientId: "322713790250549254",
      authorization: {
        params: {
          scope: `openid email profile offline_access urn:zitadel:iam:org:id:322159618136473606`,
          prompt: "login",
        },
      },
      token: "https://auth.southguild.tech/oauth/v2/token", // Explicit token endpoint
      userinfo: "https://auth.southguild.tech/oidc/v1/userinfo", // Explicit userinfo endpoint
      async profile(profile: GenericProfile): Promise<SessionUser> {
        // Fallbacks for Google IDP image keys
        const image =
          (profile.picture as string) ||
          (profile.avatar as string) ||
          (profile.photo as string) ||
          "";

        return {
          id: profile.sub as string,
          name: (profile.name as string) || (profile["urn:zitadel:iam:user:resourceowner:name"] as string) || "",
          firstName: (profile.given_name as string) || "",
          lastName: (profile.family_name as string) || "",
          email: (profile.email as string) || "",
          loginName: (profile.preferred_username as string) || "",
          image,
        };
      },
    }),
    Zoho({
      clientId: process.env.AUTH_ZOHO_ID!,
      clientSecret: process.env.AUTH_ZOHO_SECRET!,
      issuer: "https://accounts.zoho.in", 
      authorization: {
        params: {
          scope: "AaaServer.profile.Read", 
          prompt: "consent", 
        }
      },
      token: "https://accounts.zoho.in/oauth/v2/token", 
      userinfo: "https://accounts.zoho.in/oauth/user/info" 
    })
  ],
  debug: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({
      token,
      account,
      user,
      profile,
    }: {
      token: JWT;
      user?: import("next-auth").User | import("next-auth/adapters").AdapterUser;
      account?: Account | null;
      profile?: import("next-auth").Profile;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: unknown;
    }) {
      // For Zitadel, user info is in profile on first login
      if (account && account.provider === "zitadel" && profile) {
        const p = profile as GenericProfile;
        token.accessToken = account.access_token;
        const image =
          (p.picture as string) ||
          (p.avatar as string) ||
          (p.photo as string) ||
          "";
        token.user = {
          id: p.sub as string,
          name: (p.name as string) || (p["urn:zitadel:iam:user:resourceowner:name"] as string) || "",
          firstName: (p.given_name as string) || "",
          lastName: (p.family_name as string) || "",
          email: (p.email as string) || "",
          loginName: (p.preferred_username as string) || "",
          image,
        };
      } else if (account && user) {
        // For Zoho and other providers
        token.accessToken = account.access_token;
        token.user = mapUserToSessionUser(user);
      } else if (token.user) {
        // Persist user info across sessions
        token.user = token.user;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { user?: SessionUser; accessToken?: string };
    }) {
      // Extend session with access token
      if (token.accessToken) {
        (session as Session & { accessToken?: string }).accessToken = token.accessToken;
      }
      // Always add full user info to session
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  }
})

function mapUserToSessionUser(user: import("next-auth").User | import("next-auth/adapters").AdapterUser): SessionUser {
  // Use optional chaining and string conversion for safety
  return {
    id: typeof user.id === "string" ? user.id : user.id,
    name: "name" in user ? (user as { name?: string }).name : undefined,
    firstName: "firstName" in user ? (user as { firstName?: string }).firstName : undefined,
    lastName: "lastName" in user ? (user as { lastName?: string }).lastName : undefined,
    email: "email" in user ? (user as { email?: string }).email : undefined,
    loginName: "loginName" in user ? (user as { loginName?: string }).loginName : undefined,
    image: "image" in user ? (user as { image?: string }).image : undefined,
  };
}
