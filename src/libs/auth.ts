// AUTH STACK: intentionally on next-auth v4 (not Auth.js v5).
// Decision (2026-06): v5 was evaluated during the Next.js 16 upgrade and deferred.
// v5's benefits here are mostly ergonomic (universal `auth()`, simpler config) and do
// not justify the cost given (1) v5 is still beta, (2) it would require an Edge/Node
// config split because our Credentials `authorize` uses bcrypt + mysql2 (not Edge-safe),
// and (3) our needs are limited to one credentials provider with JWT sessions.
// v4 runs on Next 16 via `legacy-peer-deps=true` in .npmrc (peer range is advisory).
// Revisit when Auth.js v5 is stable or when we need a feature v4 lacks; on migration,
// remove the .npmrc workaround.
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getInternalMemberByEmail } from "@/services/InternalMemberApis";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        try {
          // Fetch the internal member by email
          const members = await getInternalMemberByEmail(credentials.email);

          if (!members || members.length === 0) {
            throw new Error("Invalid email or password");
          }

          const member = members[0];

          // Check if the account is active
          if (member.is_active_YN !== 1) {
            throw new Error(
              "Your account is inactive. Please contact support."
            );
          }

          // Verify the password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            member.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          // Return user object (without password)
          return {
            id: member.admin_id,
            email: member.email_address,
            name: member.email_address,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
