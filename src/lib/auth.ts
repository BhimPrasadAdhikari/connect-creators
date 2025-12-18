import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Enhanced OAuth security
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          securityVersion: user.securityVersion,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours - session expires after this
    updateAge: 60 * 60, // 1 hour - rotate token every hour
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in - store user data in token
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "FAN";
        token.securityVersion = (user as { securityVersion?: number }).securityVersion || 1;
      }

      // On token refresh, validate security version hasn't changed
      if (trigger === "update" || !user) {
        // Periodically check if security version is still valid
        // This runs on session access, not every request (performance optimization)
        if (token.id && typeof token.securityVersion === "number") {
          try {
            const currentUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { securityVersion: true, role: true },
            });

            // If user doesn't exist or security version changed, invalidate
            if (!currentUser || currentUser.securityVersion !== token.securityVersion) {
              // Return empty token to force re-authentication
              return { ...token, error: "SecurityVersionMismatch" };
            }

            // Update role in case it changed
            token.role = currentUser.role;
          } catch {
            // On error, allow token to continue (fail-open for availability)
            // Consider fail-closed for higher security environments
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If there's a security error, don't provide session
      if (token.error === "SecurityVersionMismatch") {
        return { ...session, error: "SessionInvalidated" };
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Additional security options
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
