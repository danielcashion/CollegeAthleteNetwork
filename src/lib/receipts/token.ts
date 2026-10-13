import { SignJWT, jwtVerify } from "jose";

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function receiptPageUrl(orderId: number, method?: string | null) {
  const token = await new SignJWT({
    purpose: "receipt",
    orderId,
    method: String(method || ""),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(orderId))
    .setIssuedAt()
    .setExpirationTime("5y")
    .sign(secret());
  const origin = (process.env.CAN_PUBLIC_SITE_URL || "https://www.collegeathletenetwork.org").replace(/\/$/, "");
  return `${origin}/receipt/${token}`;
}

export async function readReceiptToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== "receipt") return null;
    const orderId = Number(payload.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) return null;
    return { orderId, method: typeof payload.method === "string" ? payload.method : "" };
  } catch {
    return null;
  }
}
