// import NextAuth from "next-auth";
// const ZitadelProvider = {
//   id: "zitadel",
//   name: "Zitadel",
//   type: "oauth",
  
//   authorization: {
//     url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/authorize",
//     params: {
//       scope: `openid email profile urn:zitadel:iam:org:project:id:${process.env.ZITADEL_PROJECT_ID}:aud`,
//       instance_id: "318212027426337769"
//     }
//   },
//   token: {
//     url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/token",
//     params: { instance_id: "318212027426337769" }
//   },
//   userinfo: {
//     url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oidc/v1/userinfo",
//     params: { instance_id: "318212027426337769" }
//   },
  
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
// };

// const handler = NextAuth({
//   providers: [ZitadelProvider],
//   debug: true,
//   logger: {
//     error(code, metadata) {
//       console.error('Error Here : ')
//       console.error( { code, metadata });
//     },
//   },
//   callbacks: {
//     async jwt({ token, account, user }) {
//       console.log("JWT Callback:", { tokenSub: token?.sub, account, userEmail: user?.email });
      
//       if (account) {
//         token.accessToken = account.access_token;
//         token.idToken = account.id_token; 
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken;
//       session.user.id = token.sub; 
//       return session;
//     },
//   },
// });

// export { handler as GET, handler as POST };

// import NextAuth from "next-auth";

// // Create a custom provider using standard OAuth pattern
// const ZitadelProvider = {
//   id: "zitadel",
//   name: "Zitadel",
//   type: "oauth",
  
//   // Explicitly define all endpoints
//   authorization: {
//     url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/authorize",
//     params: {
//       scope: `openid email profile urn:zitadel:iam:org:project:id:${process.env.ZITADEL_PROJECT_ID}:aud`,
//       instance_id: "318212027426337769"
//     }
//   },
//   token: {
//     url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/token",
//     params: { instance_id: "318212027426337769" }
//   },
//   userinfo: {
//     url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oidc/v1/userinfo",
//     params: { instance_id: "318212027426337769" }
//   },
  
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
// };

// const handler = NextAuth({
//   providers: [ZitadelProvider],
//   debug: true,

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
//       // Initial sign in
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
//           accessTokenExpires: account.expires_at ? account.expires_at * 1000 : null, // Convert to milliseconds
//         };
//       }
      
//       // Return previous token if not expired
//       console.log("Returning existing token");
//       return token;
//     },
    
//     async session({ session, token }) {
//       // Send properties to the client
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
      
//       // If the URL is relative, prepend the base URL
//       if (url.startsWith('/')) {
//         return `${baseUrl}${url}`;
//       } 
//       // If it's already an absolute URL with your domain, allow it
//       else if (url.startsWith(baseUrl)) {
//         return url;
//       }
//       // Default to dashboard after login, or use homepage if preferred
//       return `${baseUrl}/dashboard`;
//     }
//   },
//   // Add additional security options
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt", // Use JWT for sessions
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
// });

// // Export the GET and POST handlers
// export { handler as GET, handler as POST };

import NextAuth from "next-auth";

// Create a custom provider using standard OAuth pattern
const ZitadelProvider = {
  id: "zitadel",
  name: "Zitadel",
  type: "oauth",
  
  // Explicitly define all endpoints
  authorization: {
    url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/authorize",
    params: {
      scope: `openid email profile urn:zitadel:iam:org:project:id:${process.env.ZITADEL_PROJECT_ID}:aud`,
      instance_id: "318212027426337769"
    }
  },
  token: {
    url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oauth/v2/token",
    params: { instance_id: "318212027426337769" }
  },
  userinfo: {
    url: "https://mab-learn-0arqdk.us1.zitadel.cloud/oidc/v1/userinfo",
    params: { instance_id: "318212027426337769" }
  },
  
  clientId: process.env.ZITADEL_CLIENT_ID,
  clientSecret: process.env.ZITADEL_CLIENT_SECRET,
  checks: ["pkce", "state"],
  idToken: true,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
  // Add this to specify the allowed issuer
  wellKnown: "https://mab-learn-0arqdk.us1.zitadel.cloud/.well-known/openid-configuration",
  // Ensure that JWT validation is configured correctly
  // Skip issuer validation as an alternative approach
  jwt: {
    verifyOptions: {
      ignoreIssuerCheck: true
    }
  }
};

const handler = NextAuth({
  providers: [ZitadelProvider],
  debug: true,
  pages: {
    signIn: '/login',  // Updated to match your login page
    error: '/login',   // Redirect errors to login page
  },
  logger: {
    error(code, metadata) {
      console.error('Error Here: ', { code, metadata });
    },
    warn(code) {
      console.warn('Warning: ', code);
    },
    debug(code, metadata) {
      console.log('Debug: ', { code, metadata });
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        console.log("Initial sign in, storing tokens:", {
          sub: user.id,
          email: user.email,
          hasAccessToken: !!account.access_token
        });
        
        return {
          ...token,
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : null,
        };
      }
      
      return token;
    },
    
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.user.id = token.sub;
      
      console.log("Session callback:", { 
        userId: session.user.id,
        hasAccessToken: !!session.accessToken
      });
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });
      
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } 
      else if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    }
  },
  jwt: {
    verifyOptions: {
      ignoreIssuerCheck: false,
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

// Export the GET and POST handlers
export { handler as GET, handler as POST };