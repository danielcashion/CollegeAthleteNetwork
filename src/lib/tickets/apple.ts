import { readFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { PKPass } from "passkit-generator";
import type { TicketRow } from "./gateway";
import { passFields } from "./fields";
import { ticketUrl } from "./token";

function pem(name: string) {
  const env = process.env as Record<string, string | undefined>;
  let text = env[name] || "";
  text = text.replace(/^\uFEFF/, "").trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }
  while (text.includes("\\n") || text.includes("\\r")) {
    text = text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n");
  }
  text = text.replace(/\r\n/g, "\n");
  const match = text.match(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/);
  if (!match) {
    throw new Error(`${name} is not a PEM block. Paste the file including the BEGIN and END lines.`);
  }
  const body = match[2].replace(/[^A-Za-z0-9+/=]/g, "");
  const lines = body.match(/.{1,64}/g) || [];
  return `-----BEGIN ${match[1]}-----\n${lines.join("\n")}\n-----END ${match[1]}-----\n`;
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

async function mark(input: Buffer, size: number) {
  const fitted = () =>
    sharp(input)
      .resize(size, size, { fit: "contain", background: { r: 247, g: 243, b: 234, alpha: 0 } })
      .png()
      .toBuffer();
  try {
    return await sharp(input)
      .trim({ background: "#F7F3EA", threshold: 28 })
      .resize(size, size, { fit: "contain", background: { r: 247, g: 243, b: 234, alpha: 0 } })
      .png()
      .toBuffer();
  } catch {
    return fitted();
  }
}

export async function buildPkPass(row: TicketRow) {
  const fields = passFields(row);
  const publicId = String(row.public_id || "");
  const image = await sourceImage(fields.logoUrl);
  const [icon, icon2x, logo, logo2x] = await Promise.all([
    mark(image, 29),
    mark(image, 58),
    mark(image, 50),
    mark(image, 100),
  ]);
  const signerKey = pem("APPLE_PASS_KEY_PEM");
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
      signerKey,
      signerKeyPassphrase: signerKey.includes("ENCRYPTED")
        ? process.env.APPLE_PASS_KEY_PASSPHRASE || undefined
        : undefined,
    },
    {
      serialNumber: publicId,
      description: fields.eventName,
      organizationName: fields.universityName,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
      teamIdentifier: process.env.APPLE_TEAM_ID,
      logoText: fields.universityName,
      backgroundColor: rgb("#F7F3EA"),
      foregroundColor: rgb("#1C315F"),
      labelColor: rgb("#8A734B"),
    }
  );
  pass.type = "eventTicket";
  if (fields.relevantDate) pass.setRelevantDate(new Date(fields.relevantDate));
  pass.headerFields.push({ key: "date", label: "DATE", value: fields.dateLabel });
  pass.primaryFields.push({
    key: "assignment",
    label: fields.assignmentKind === "TABLE" ? "TABLE" : "HOLE",
    value: fields.seatValue,
  });
  pass.secondaryFields.push({ key: "event", label: "EVENT", value: fields.eventName });
  pass.auxiliaryFields.push(
    { key: "guest", label: "GUEST", value: fields.holderName },
    { key: "where", label: "VENUE", value: fields.venue }
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
