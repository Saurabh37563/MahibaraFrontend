import NextAuth from "next-auth"
import Zoho from "next-auth/providers/zoho"
import Zitadel from '@/auth/zitadel'
import { Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Account } from "next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Zitadel({
      clientId: "321878730312098023",
      clientSecret: process.env.AUTH_ZITADEL_SECRET!,
    }),
    Zoho({
      clientId: process.env.AUTH_ZOHO_ID!,
      clientSecret: process.env.AUTH_ZOHO_SECRET!,
      issuer: "https://accounts.zoho.in", 
      authorization: {
        params: {
          scope: "AaaServer.profile.Read", 
          prompt: "consent"
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
    async jwt({ token, account }: { token: JWT; account?: Account | null }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Extend session with access token
      if ((token as JWT & { accessToken?: string }).accessToken) {
        (session as Session & { accessToken?: string }).accessToken = (token as JWT & { accessToken?: string }).accessToken;
      }
      return session;
    },
  }
})