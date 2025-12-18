import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
    error?: string; // For security version mismatch
  }

  interface User extends DefaultUser {
    role: string;
    securityVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    securityVersion?: number;
    error?: string;
  }
}
