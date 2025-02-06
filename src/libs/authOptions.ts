/* eslint-disable @typescript-eslint/no-explicit-any */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
import type { NextAuthOptions } from "next-auth";
import type { User } from "next-auth";

import { getVarcharEight } from "@/helpers/getVarcharEight";

interface CustomUser extends User {
  member_id: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  role: string;
}

const googleClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Google One Tap",
      credentials: {
        credential: { label: "Google One Tap Credential", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.credential) {
          throw new Error("No credential provided");
        }
        const { credential } = credentials;

        let ticket;
        try {
          ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          });
        } catch (error) {
          console.error("Error verifying Google token:", error);
          throw new Error("Invalid token");
        }

        const payload = ticket.getPayload();

        if (!payload) {
          throw new Error("No payload found");
        }

        const googleSub = payload.sub;
        let memberData;
        try {
          const res = await fetch(
            `${process.env.MEMBERS_API_ENDPOINT}?email=${payload.email}`
          );
          const data = await res.json();
          memberData = data && data.length ? data[0] : null;
        } catch (err) {
          console.error("Error fetching from members API:", err);
        }

        if (!memberData) {
          const newMemberId = getVarcharEight();
          const newMemberPayload = {
            member_id: newMemberId,
            google_sub: googleSub,
            member_name: payload.name,
            given_name: payload.given_name,
            family_name: payload.family_name,
            picture: payload.picture,
            email_verified: "1",
            role: "user",
            email: payload.email,
            created_datetime: new Date().toISOString(),
          };

          try {
            const createRes = await fetch(
              `${process.env.MEMBERS_API_ENDPOINT}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newMemberPayload),
              }
            );

            if (!createRes.ok) {
              console.error(
                "Error creating new member:",
                await createRes.text()
              );
              throw new Error("Error creating new member");
            } else {
              memberData = await createRes.json();
            }
          } catch (createErr) {
            console.error("Error during user creation:", createErr);
            throw new Error("Error during user creation");
          }
        }

        const user: CustomUser = {
          id: memberData?.member_id || payload.sub,
          member_id: memberData?.member_id || payload.sub,
          name: memberData?.member_name || payload.name,
          given_name: memberData?.given_name || payload.given_name,
          family_name: memberData?.family_name || payload.family_name,
          email: memberData?.email || payload.email,
          picture: memberData?.picture || payload.picture,
          role: memberData?.role || "user",
        };

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
