import NextAuth from "next-auth"
import Zoho from "next-auth/providers/zoho"
 import Zitadel from '@/auth/zitadel'
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
     Zitadel({
      clientId: "321878730312098023",
      // clientSecret: process.env.AUTH_ZITADEL_SECRET!,
    }),
    Zoho({
      clientId: process.env.AUTH_ZOHO_ID,
      clientSecret: process.env.AUTH_ZOHO_SECRET,
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
  async jwt({ token, account, profile }) {
    if (account) {
      token.accessToken = account.access_token;
    }
    return token;
  },
  async session({ session, token }: any) {
    session.accessToken = token.accessToken;
    return session;
  },
  // async signIn({ profile, account }) {
  //   console.log("Zoho Profile:", profile);

  //   const email = profile?.Email;

  //   const allowedDomain = "southguild.tech";

  //   // if (typeof email === "string" && email.toLowerCase().endsWith(`@${allowedDomain}`)) {
  //   //   return true;
  //   // }

  //   return false; 
  // }

}

})
