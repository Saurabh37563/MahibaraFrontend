// import NextAuth from "next-auth";

// const ZitadelProvider = {
//   id: "zitadel",
//   name: "Zitadel",
//   type: "oauth",
 
//   // authorization: {
//   //   url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/authorize",
//   //   params: {
//   //     scope: `openid email profile urn:zitadel:iam:org:idp:id:{idp_id}:project:id:${process.env.ZITADEL_PROJECT_ID}:aud`,
//   //     instance_id: "318212027426337769"
//   //   }
//   // },
//   // token: {
//   //   url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/token",
//   //   params: { instance_id: "318212027426337769" }
//   // },
//   // userinfo: {
//   //   url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oidc/v1/userinfo",
//   //   params: { instance_id: "318212027426337769" }
//   // },
//   // end_session: {
//   //   url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oidc/v1/end_session",
//   //   params: { instance_id: "318212027426337769" }
//   // },
//   clientId: process.env.ZITADEL_CLIENT_ID,
//   clientSecret: process.env.ZITADEL_CLIENT_SECRET,
//   checks: ["pkce", "state"],
//   idToken: true,
//   profile(profile) {
//     return {
//       id: profile.sub,
//       name: profile.name,
//       email: profile.email,
//       image: profile.picture,
//     };
//   },
  
//   wellKnown: "https://mab-learn-0arqdk.us1.zitadel.cloud/.well-known/openid-configuration",
//   params: {
//         scope: `openid email profile urn:zitadel:iam:org:idp:id:{idp_id}:project:id:${process.env.ZITADEL_PROJECT_ID}:aud`,
//         instance_id: "318212027426337769"
//       },
//   jwt: {
//     verifyOptions: {
//       ignoreIssuerCheck: true
//     }
//   }
// };

// const handler = NextAuth({
//   providers: [ZitadelProvider],
//   debug: true,
//   pages: {
//     signIn: '/login',  // Updated to match your login page
//     error: '/login',   // Redirect errors to login page
//   },
//   logger: {
//     error(code, metadata) {
//       console.error('Error Here: ', { code, metadata });
//     },
//     warn(code) {
//       console.warn('Warning: ', code);
//     },
//     debug(code, metadata) {
//       console.log('Debug: ', { code, metadata });
//     },
//   },
//   callbacks: {
//     async jwt({ token, account, user }) {
//       if (account && user) {
//         console.log("Initial sign in, storing tokens:", {
//           sub: user.id,
//           email: user.email,
//           hasAccessToken: !!account.access_token
//         });
        
//         return {
//           ...token,
//           accessToken: account.access_token,
//           idToken: account.id_token,
//           refreshToken: account.refresh_token,
//           accessTokenExpires: account.expires_at ? account.expires_at * 1000 : null,
//         };
//       }
      
//       return token;
//     },
    
//     async session({ session, token }) {
//       session.accessToken = token.accessToken;
//       session.idToken = token.idToken;
//       session.user.id = token.sub;
      
//       console.log("Session callback:", { 
//         userId: session.user.id,
//         hasAccessToken: !!session.accessToken
//       });
      
//       return session;
//     },
    
//     async redirect({ url, baseUrl }) {
//       console.log("Redirect callback:", { url, baseUrl });
      
//       if (url.startsWith('/')) {
//         return `${baseUrl}${url}`;
//       } 
//       else if (url.startsWith(baseUrl)) {
//         return url;
//       }
//       return `${baseUrl}/dashboard`;
//     }
//   },
//   events: {
//     async signOut({ token }) {
//       const endSessionUrl = new URL(`https://mab-learn-0arqdk.us1.zitadel.cloud/oidc/v1/end_session`);
//       if (token.idToken) {
//         endSessionUrl.searchParams.set("id_token_hint", token.idToken);
//       } else {
//         endSessionUrl.searchParams.set("client_id", process.env.ZITADEL_CLIENT_ID);
//       }
//       endSessionUrl.searchParams.set(
//         "post_logout_redirect_uri",
//         `${process.env.NEXTAUTH_URL}/login`
//       );
//       await fetch(endSessionUrl.toString(), { method: 'GET', credentials: 'include' });
//     }
//   }
// ,  
//   jwt: {
//     verifyOptions: {
//       ignoreIssuerCheck: false,
//     }
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, 
//   },
// });

// export { handler as GET, handler as POST };

// import NextAuth from "next-auth";
// import ZohoProvider from "next-auth/providers/zoho";

// const handler = NextAuth({
//   debug: true, // Enable debug mode to see detailed logs
//   providers: [
//     ZohoProvider({
//       clientId: process.env.ZOHO_CLIENT_ID,
//       clientSecret: process.env.ZOHO_CLIENT_SECRET,
//       issuer: "https://accounts.zoho.in",
//       authorization: {
//         url: "https://accounts.zoho.in/oauth/v2/auth", // Note .in domain
//         params: {
//           scope: "AaaServer.profile.Read",
//           prompt: "consent"
//         }
//       },
//       token: "https://accounts.zoho.in/oauth/v2/token", // Note .in domain
//       userinfo: "https://accounts.zoho.in/oauth/user/info" // Note .in domain
//     })
    
//     ,
//   ],
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET,
//     maxAge: 60 * 60 * 24 * 30, // 30 days
//   },
//   callbacks: {

//     async jwt({ token, account, profile }) {
//       // Persist the OAuth access_token and refresh_token to the token right after signin
//       if (account) {
//         console.log("JWT callback with account:", { accountType: account.type });
//         token.accessToken = account.access_token;
//         token.refreshToken = account.refresh_token;
//         token.expiresAt = account.expires_at;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // Send properties to the client, like an access_token from a provider
//       session.accessToken = token.accessToken;
//       return session;
//     },
//     async redirect({ url, baseUrl }) {
//       console.log("Redirect callback:", { url, baseUrl });
//       return url.startsWith(baseUrl) ? url : baseUrl;
//     },
//     async signIn({ user, account, profile, email, credentials }) {
//       console.log("SIGNIN CALLBACK:", { 
//         user, 
//         accountType: account?.type,
//         profileData: !!profile 
//       });
//       return true;
//     },
//   },
//   // Add error handling
//   events: {
//     async error(error) {
//       console.error("NextAuth error:", error);
//     },
//   },
// });

// export { handler as GET, handler as POST };


import { handlers } from "@/auth" // Referring to the auth.ts we just created
export const { GET, POST } = handlers