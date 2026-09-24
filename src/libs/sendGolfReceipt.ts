import { readFile } from "fs/promises";
import { join } from "path";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { formatCents } from "@/components/GolfOutingPage/golfOutingDisplay";
import { getPublicGolfOrderItems, type GolfOutingPublic } from "@/services/getGolfOutingPublic";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fill(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (html, [key, value]) => html.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value),
    template
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function categoryLabel(category?: string | null) {
  switch (String(category || "").toUpperCase()) {
    case "REGISTRATION":
      return "registration";
    case "SPONSORSHIP":
      return "sponsorship";
    case "AUCTION":
      return "auction payment";
    default:
      return "golf outing payment";
  }
}

function paymentMethodLabel(method?: string | null) {
  switch (String(method || "").toLowerCase()) {
    case "venmo":
      return "Venmo";
    case "card":
      return "Debit or credit card";
    default:
      return "PayPal";
  }
}

function lineItemHtml(description: string, quantity: number, amountCents: number) {
  return `<tr>
    <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-size: 14px; color: #1C315F;">${escapeHtml(description)}</td>
    <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-size: 14px; color: #1C315F; text-align: right;">${quantity}</td>
    <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-size: 16px; color: #1C315F; font-weight: 700; text-align: right;">${formatCents(amountCents)}</td>
  </tr>`;
}

export async function sendGolfPaymentReceipt(input: {
  orderId: number;
  event: GolfOutingPublic;
  purchaserName?: string | null;
  purchaserEmail?: string | null;
  totalCents: number;
  category?: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  fallbackDescription?: string | null;
}) {
  const to = String(input.purchaserEmail || "").trim();
  if (!emailRegex.test(to)) {
    throw new Error("Receipt email is missing or invalid");
  }

  const senderAddress = process.env.EMAIL_FROM?.trim() || "admin@collegeathletenetwork.org";
  const items = await getPublicGolfOrderItems(input.orderId);
  const lineItems =
    items.length > 0
      ? items
          .map((item) =>
            lineItemHtml(
              item.description || item.item_type || "Golf outing item",
              Number(item.quantity || 1),
              Number(item.line_total_cents ?? item.unit_price_cents ?? 0)
            )
          )
          .join("")
      : lineItemHtml(input.fallbackDescription || "Golf outing payment", 1, input.totalCents);

  const outingUrl = `https://www.collegeathletenetwork.org/golf-outing/${input.event.public_url_slug}`;
  const support = input.event.contact_email
    ? `Contact ${input.event.contact_name ? `${input.event.contact_name} at ` : ""}${input.event.contact_email} with questions about this outing.`
    : "Contact admin@collegeathletenetwork.org if you have questions about this receipt.";

  const template = await readFile(
    join(process.cwd(), "src", "app", "htmlTemplates", "golf", "golf-payment-receipt.html"),
    "utf-8"
  );
  const html = fill(template, {
    university_name: escapeHtml(input.event.university_name || ""),
    event_name: escapeHtml(input.event.event_name || "Golf outing"),
    email_address: escapeHtml(to),
    purchaser_name_suffix: input.purchaserName?.trim() ? `, ${escapeHtml(input.purchaserName.trim())}` : "",
    category_label: categoryLabel(input.category),
    line_items_html: lineItems,
    total_amount: formatCents(input.totalCents),
    order_id: String(input.orderId),
    payment_date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date()),
    payment_method: paymentMethodLabel(input.paymentMethod),
    transaction_id: escapeHtml(input.transactionId || "—"),
    support_blurb: escapeHtml(support),
    outing_url: outingUrl,
    year: String(new Date().getFullYear()),
  });

  await sesClient.send(
    new SendEmailCommand({
      Source: `The College Athlete Network <${senderAddress}>`,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: {
          Data: `Receipt for ${input.event.event_name} — Order #${input.orderId}`,
          Charset: "UTF-8",
        },
        Body: {
          Html: { Data: html, Charset: "UTF-8" },
          Text: {
            Data: html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
            Charset: "UTF-8",
          },
        },
      },
    })
  );
}
