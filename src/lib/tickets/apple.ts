import { readFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { PKPass } from "passkit-generator";
import type { TicketRow } from "./gateway";
import { passFields } from "./fields";
import { ticketUrl } from "./token";

function pem(name: string) {
  return (process.env[name] || "").replace(/\\n/g, "\n").trim();
}

function rgb(hex: string) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

async function sourceImage(url: string | null) {
  if (url && /^https:\/\//i.test(url)) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (response.ok) return Buffer.from(await response.arrayBuffer());
    } catch {
      // Fall back to the CAN mark.
    }
  }
  return readFile(join(process.cwd(), "public/Logos/CANLogo1200X1200Color.png"));
}

async function fitted(input: Buffer, width: number, height: number) {
  return sharp(input)
    .resize(width, height, { fit: "contain", background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .png()
    .toBuffer();
}

export async function buildPkPass(row: TicketRow) {
  const fields = passFields(row);
  const publicId = String(row.public_id || "");
  const image = await sourceImage(fields.logoUrl);
  const [icon, icon2x, logo, logo2x] = await Promise.all([
    fitted(image, 29, 29),
    fitted(image, 58, 58),
    fitted(image, 160, 50),
    fitted(image, 320, 100),
  ]);
  const pass = new PKPass(
    {
      "icon.png": icon,
      "icon@2x.png": icon2x,
      "logo.png": logo,
      "logo@2x.png": logo2x,
    },
    {
      wwdr: pem("APPLE_WWDR_PEM"),
      signerCert: pem("APPLE_PASS_CERT_PEM"),
      signerKey: pem("APPLE_PASS_KEY_PEM"),
      signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
    },
    {
      serialNumber: publicId,
      description: fields.eventName,
      organizationName: fields.universityName,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
      teamIdentifier: process.env.APPLE_TEAM_ID,
      logoText: fields.universityName,
      backgroundColor: rgb(fields.background),
      foregroundColor: rgb(fields.foreground),
      labelColor: rgb(fields.label),
    }
  );
  pass.type = "eventTicket";
  if (fields.relevantDate) pass.setRelevantDate(new Date(fields.relevantDate));
  pass.headerFields.push({ key: "university", label: "UNIVERSITY", value: fields.universityName });
  pass.primaryFields.push({ key: "event", label: "EVENT", value: fields.eventName });
  pass.secondaryFields.push({
    key: "assignment",
    label: fields.assignmentKind === "TABLE" ? "TABLE" : "HOLE",
    value: fields.assignment,
  });
  pass.auxiliaryFields.push(
    { key: "when", label: "WHEN", value: fields.whenLabel },
    { key: "where", label: "WHERE", value: fields.venue }
  );
  pass.backFields.push(
    { key: "guest", label: "GUEST", value: fields.holderName },
    { key: "confirmation", label: "CONFIRMATION", value: fields.confirmationCode },
    { key: "payment", label: "PAYMENT", value: fields.paidLabel },
    { key: "support", label: "SUPPORT", value: fields.support },
    { key: "platform", label: "PLATFORM", value: "Powered by The College Athlete Network" }
  );
  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: ticketUrl(publicId),
    messageEncoding: "iso-8859-1",
    altText: fields.confirmationCode,
  });
  return pass.getAsBuffer();
}
