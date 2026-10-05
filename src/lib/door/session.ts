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

export type PayToken = {
  purpose: "pay";
  paypalOrderId: string;
  eventId: string;
  registrantId: string;
  amountCents: number;
  kind: "golf" | "event";
  golfOrderId: number | null;
  eventName: string;
  purchaserName: string;
  purchaserEmail: string;
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

export async function signOrganizer(user: Organizer) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.member_id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function signPayToken(payload: PayToken) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.registrantId)
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret());
}

export async function readOrganizer(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError("Unauthorized", 401);
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose === "pay" || payload.purpose === "door") throw new HttpError("Unauthorized", 401);
    return payload as unknown as Organizer;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError("Unauthorized", 401);
  }
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

export async function readPayToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== "pay") throw new HttpError("Invalid payment session", 401);
    return payload as unknown as PayToken;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError("Invalid payment session", 401);
  }
}

export function assertOrganizer(user: Organizer) {
  if (user.role !== "admin") throw new HttpError("Admin access required", 403);
  if (Number(user.onboarded_YN) === 0) {
    throw new HttpError("Finish onboarding on the members site before using this app", 403);
  }
  if (!user.university_affiliation) throw new HttpError("No university affiliation", 403);
}
