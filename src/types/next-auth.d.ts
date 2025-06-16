// eslint-disable-next-line
import NextAuth from "next-auth"; 

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName?: string;
      lastName?: string;
    };
  }

  interface User {
    accessToken?: string;
    firstName?: string;
    lastName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
