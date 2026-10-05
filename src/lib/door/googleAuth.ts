import axios from "axios";
import { SignJWT, jwtVerify } from "jose";
import { HttpError } from "./session";

const APP_SCHEMES = new Set(["canevents:", "exp+can-events:"]);

function key() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new HttpError("AUTH_SECRET is not set", 500);
  return new TextEncoder().encode(value);
}

/** Only return the browser to this app's login URL. */
export function safeAppRedirect(value: string | null): string {
  const fallback = "canevents://login";
  if (!value) return fallback;
  try {
    const url = new URL(value);
    if (!APP_SCHEMES.has(url.protocol)) return fallback;
    return `${url.protocol}//login`;
  } catch {
    return fallback;
  }
}

export function googleRedirectUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/auth/google/callback`;
}

export async function signGoogleState(appRedirect: string) {
  return new SignJWT({ purpose: "google-oauth", appRedirect })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(key());
}

export async function readGoogleState(state: string) {
  try {
    const { payload } = await jwtVerify(state, key());
    if (payload.purpose !== "google-oauth" || typeof payload.appRedirect !== "string") {
      throw new HttpError("Google sign-in expired", 401);
    }
    return { appRedirect: safeAppRedirect(payload.appRedirect) };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError("Google sign-in expired", 401);
  }
}

export function googleAuthUrl(origin: string, state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError("Google sign-in is not configured", 500);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", googleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleCode(origin: string, code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new HttpError("Google sign-in is not configured", 500);
  if (!code) throw new HttpError("Missing Google authorization code", 400);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: googleRedirectUri(origin),
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await axios.post("https://oauth2.googleapis.com/token", body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const idToken = response.data?.id_token as string | undefined;
  if (!idToken) throw new HttpError("Google token exchange failed", 401);
  return idToken;
}

export function redirectToApp(target: string) {
  return new Response(null, { status: 302, headers: { Location: target } });
}
