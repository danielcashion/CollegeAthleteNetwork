import { createSign } from "crypto";
import { GoogleAuth } from "google-auth-library";
import type { TicketRow } from "./gateway";
import { passFields } from "./fields";
import { ticketUrl } from "./token";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

const WALLET = "https://walletobjects.googleapis.com/walletobjects/v1";

function serviceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON || "";
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as ServiceAccount;
  }
}

function issuerId() {
  return String(process.env.GOOGLE_WALLET_ISSUER_ID || "").trim();
}

export function googleClassId(eventId: string) {
  return `${issuerId()}.can_${eventId}`;
}

export function googleObjectId(publicId: string) {
  return `${issuerId()}.can_${publicId}`;
}

function signJwt(payload: object, privateKey: string) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${header}.${body}`;
  const signature = createSign("RSA-SHA256").update(data).sign(privateKey).toString("base64url");
  return `${data}.${signature}`;
}

async function client() {
  const credentials = serviceAccount();
  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });
  return { http: await auth.getClient(), credentials };
}

function statusOf(error: unknown) {
  const response = (error as { response?: { status?: number } }).response;
  return response?.status || 0;
}

function localized(value: string) {
  return { defaultValue: { language: "en-US", value } };
}

function classBody(row: TicketRow) {
  const fields = passFields(row);
  const logo = /^https:\/\//i.test(fields.logoUrl || "")
    ? fields.logoUrl
    : "https://www.collegeathletenetwork.org/Logos/CANLogo1200X1200Color.png";
  return {
    id: googleClassId(String(row.golf_event_id || "")),
    issuerName: fields.universityName,
    reviewStatus: "UNDER_REVIEW",
    eventName: localized(fields.eventName),
    venue: {
      name: localized(fields.venue),
    },
    hexBackgroundColor: fields.background,
    logo: {
      sourceUri: { uri: logo },
      contentDescription: localized(fields.universityName),
    },
    ...(fields.relevantDate ? { dateTime: { start: fields.relevantDate } } : {}),
  };
}

function objectBody(row: TicketRow) {
  const fields = passFields(row);
  const publicId = String(row.public_id || "");
  return {
    id: row.google_object_id || googleObjectId(publicId),
    classId: row.google_class_id || googleClassId(String(row.golf_event_id || "")),
    state: "ACTIVE",
    ticketHolderName: fields.holderName,
    ticketNumber: fields.confirmationCode,
    hexBackgroundColor: fields.background,
    seatInfo: {
      section: localized(fields.assignmentKind === "TABLE" ? "Table" : "Hole"),
      seat: localized(fields.seatValue),
    },
    barcode: {
      type: "QR_CODE",
      value: ticketUrl(publicId),
      alternateText: fields.confirmationCode,
    },
    textModulesData: [
      { header: "Payment", body: fields.paidLabel, id: "payment" },
      { header: "Platform", body: "Powered by The College Athlete Network", id: "platform" },
    ],
  };
}

async function ensureClass(row: TicketRow) {
  const { http } = await client();
  const body = classBody(row);
  try {
    await http.request({ url: `${WALLET}/eventTicketClass`, method: "POST", data: body });
  } catch (error) {
    if (statusOf(error) !== 409) throw error;
    await http.request({
      url: `${WALLET}/eventTicketClass/${encodeURIComponent(body.id)}`,
      method: "PUT",
      data: body,
    });
  }
  return body.id;
}

export async function upsertGoogleObject(row: TicketRow) {
  const classId = await ensureClass(row);
  const { http, credentials } = await client();
  const body = { ...objectBody(row), classId };
  try {
    await http.request({ url: `${WALLET}/eventTicketObject`, method: "POST", data: body });
  } catch (error) {
    if (statusOf(error) !== 409) throw error;
    await http.request({
      url: `${WALLET}/eventTicketObject/${encodeURIComponent(body.id)}`,
      method: "PUT",
      data: body,
    });
  }
  const token = signJwt(
    {
      iss: credentials.client_email,
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      origins: ["https://www.collegeathletenetwork.org", "https://members.collegeathletenetwork.org"],
      payload: { eventTicketObjects: [{ id: body.id }] },
    },
    credentials.private_key
  );
  return {
    classId,
    objectId: body.id,
    saveUrl: `https://pay.google.com/gp/v/save/${token}`,
  };
}

export async function patchGoogleObject(row: TicketRow) {
  if (!row.google_object_id) return;
  const { http } = await client();
  const body = objectBody({ ...row, google_object_id: row.google_object_id, google_class_id: row.google_class_id });
  await http.request({
    url: `${WALLET}/eventTicketObject/${encodeURIComponent(body.id)}`,
    method: "PATCH",
    data: {
      seatInfo: body.seatInfo,
      textModulesData: body.textModulesData,
    },
  });
}
