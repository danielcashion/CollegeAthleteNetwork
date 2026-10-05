import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

export type Organizer = {
  id: string;
  email: string;
  member_id: string;
  athlete_id: string | null;
  university_affiliation: string;
  member_name: string | null;
  picture: string | null;
  onboarded_YN: number;
  role: string;
  partner_id: string | null;
  sport: string | null;
  subscription_type: string | null;
};

export type DoorPass = {
  purpose: "door";
  eventId: string;
  memberId: string;
};

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new HttpError("AUTH_SECRET is not set", 500);
  return new TextEncoder().encode(value);
}

export async function signDoorPass(eventId: string, memberId: string) {
  const payload: DoorPass = { purpose: "door", eventId, memberId };
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(eventId)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function readDoorPass(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError("Unauthorized", 401);
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== "door" || typeof payload.eventId !== "string" || typeof payload.memberId !== "string") {
      throw new HttpError("Unauthorized", 401);
    }
    return payload as unknown as DoorPass;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError("Unauthorized", 401);
  }
}

export function assertDoorEvent(pass: DoorPass, eventId: string) {
  if (pass.eventId.toUpperCase() !== eventId.toUpperCase()) throw new HttpError("Forbidden", 403);
}
