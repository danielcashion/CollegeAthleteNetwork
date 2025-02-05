import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          console.log("user:", user, "\naccount:", account);
          return true;
        } catch (error) {
          console.error("Error during OAuth login:", error);
          return false;
        }
      }
      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
