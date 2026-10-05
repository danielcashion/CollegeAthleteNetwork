import axios from "axios";
import bcrypt from "bcryptjs";
import { HttpError, Organizer } from "./session";
import { apiGet, apiSend, varcharEight } from "./upstream";

type MemberRow = {
  member_id: string;
  email: string;
  password?: string;
  athlete_id?: string | null;
  university_affiliation?: string | null;
  member_name?: string | null;
  picture?: string | null;
  onboarded_YN?: number | string | null;
  role?: string | null;
  partner_id?: string | null;
  sport?: string | null;
  subscription_type?: string | null;
};

export function toOrganizer(row: MemberRow): Organizer {
  return {
    id: row.member_id,
    email: row.email,
    member_id: row.member_id,
    athlete_id: row.athlete_id ?? null,
    university_affiliation: row.university_affiliation || "",
    member_name: row.member_name ?? null,
    picture: row.picture ?? null,
    onboarded_YN: Number(row.onboarded_YN ?? 0),
    role: row.role || "",
    partner_id: row.partner_id ?? null,
    sport: row.sport ?? null,
    subscription_type: row.subscription_type ?? null,
  };
}

export async function findMemberByEmail(email: string) {
  const rows = await apiGet<MemberRow>("/members", { email });
  return rows[0] || null;
}

export async function loginWithPassword(email: string, password: string) {
  if (!email || !password) throw new HttpError("Email and password are required", 400);
  const user = await findMemberByEmail(email);
  if (!user?.password) throw new HttpError("No user found with the given email", 401);
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new HttpError("Invalid password", 401);
  return toOrganizer(user);
}

async function upsertOAuthMember(input: {
  email: string;
  name: string;
  image?: string | null;
  subject: string;
  provider: "google" | "linkedin";
}) {
  const existing = await findMemberByEmail(input.email);
  if (existing) return toOrganizer(existing);

  const member_id = varcharEight();
  const [givenName = "", ...rest] = (input.name || "").split(" ");
  const payload: Record<string, unknown> = {
    member_id,
    member_name: input.name || "",
    picture: input.image || null,
    email_verified: "1",
    email: input.email,
    onboarded_YN: 0,
  };
  if (input.provider === "google") {
    payload.google_sub = input.subject;
    payload.given_name = givenName;
    payload.family_name = rest.join(" ");
  } else {
    payload.linkedin_sub = input.subject;
  }
  await apiSend("post", "/members", payload);
  const created = await findMemberByEmail(input.email);
  if (!created) throw new HttpError("Could not create member", 502);
  return toOrganizer(created);
}

export async function loginWithGoogle(idToken: string) {
  if (!idToken) throw new HttpError("Missing Google token", 400);
  const response = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
    params: { id_token: idToken },
  });
  const profile = response.data as {
    aud?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    sub?: string;
  };
  const audiences = [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID].filter(Boolean);
  if (!audiences.length) throw new HttpError("Google sign-in is not configured", 500);
  if (!profile.aud || !audiences.includes(profile.aud)) throw new HttpError("Google token was not issued for this app", 401);
  if (profile.email_verified !== true && profile.email_verified !== "true") {
    throw new HttpError("Google email is not verified", 401);
  }
  if (!profile.email || !profile.sub) throw new HttpError("Google profile is incomplete", 401);
  return upsertOAuthMember({
    email: profile.email,
    name: profile.name || profile.email,
    image: profile.picture,
    subject: profile.sub,
    provider: "google",
  });
}

export async function loginWithLinkedIn(code: string, redirectUri: string, codeVerifier?: string) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new HttpError("LinkedIn sign-in is not configured", 500);
  if (!code || !redirectUri) throw new HttpError("Missing LinkedIn authorization code", 400);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  if (codeVerifier) body.set("code_verifier", codeVerifier);
  const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const accessToken = tokenResponse.data?.access_token as string | undefined;
  if (!accessToken) throw new HttpError("LinkedIn token exchange failed", 401);

  const profileResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = profileResponse.data as { sub?: string; name?: string; email?: string; picture?: string };
  if (!profile.email || !profile.sub) throw new HttpError("LinkedIn profile is incomplete", 401);
  return upsertOAuthMember({
    email: profile.email,
    name: profile.name || profile.email,
    image: profile.picture,
    subject: profile.sub,
    provider: "linkedin",
  });
}
