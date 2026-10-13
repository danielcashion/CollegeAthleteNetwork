function envValue(name: string) {
  return process.env[name] || "";
}

export function getPayPalEnv(): "live" | "sandbox" {
  const explicit = (envValue("NEXT_PUBLIC_PAYPAL_ENV") || envValue("PAYPAL_ENV")).toLowerCase();
  if (explicit === "live" || explicit === "sandbox") return explicit;
  return process.env.NODE_ENV === "production" ? "live" : "sandbox";
}

export function getPayPalConfig() {
  const live = getPayPalEnv() === "live";
  return {
    "client-id": live
      ? envValue("NEXT_PUBLIC_PAYPAL_LIVE_API_KEY") || envValue("NEXT_PUBLIC_PAYPAL_CLIENT_ID")
      : envValue("NEXT_PUBLIC_PAYPAL_SANDBOX_API_KEY") || envValue("NEXT_PUBLIC_PAYPAL_CLIENT_ID"),
    currency: "USD",
    intent: "capture",
    secret: live ? envValue("PAYPAL_LIVE_SECRET") || envValue("PAYPAL_SECRET") : envValue("PAYPAL_SANDBOX_SECRET") || envValue("PAYPAL_SECRET"),
    url: live
      ? envValue("PAYPAL_LIVE_URL") || envValue("PAYPAL_URL") || "https://api-m.paypal.com"
      : envValue("PAYPAL_SANDBOX_URL") || envValue("PAYPAL_URL") || "https://api-m.sandbox.paypal.com",
  };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  const config = getPayPalConfig();
  if (!config["client-id"] || !config.secret) {
    throw new Error("PayPal credentials are not configured");
  }
  const auth = Buffer.from(`${config["client-id"]}:${config.secret}`).toString("base64");
  const response = await fetch(`${config.url}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.error_description;
    throw new Error(typeof message === "string" && message ? message : "PayPal authentication failed");
  }
  const expiresIn = Number(data.expires_in || 0);
  cachedToken = {
    token: data.access_token as string,
    expiresAt: Date.now() + Math.max(60, expiresIn - 120) * 1000,
  };
  return cachedToken.token;
}

export async function createPayPalOrder(input: {
  amountCents: number;
  invoiceId: string;
  description: string;
  customId: string;
}) {
  const accessToken = await getAccessToken();
  const config = getPayPalConfig();
  const response = await fetch(`${config.url}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: (input.amountCents / 100).toFixed(2) },
          description: input.description,
          custom_id: input.customId,
          invoice_id: input.invoiceId,
        },
      ],
      application_context: {
        brand_name: "The College Athlete Network",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: "https://www.collegeathletenetwork.org",
        cancel_url: "https://www.collegeathletenetwork.org",
      },
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal create order failed", response.status, errorText);
    throw new Error("Failed to create PayPal order");
  }
  return (await response.json()) as PayPalOrder;
}

function paypalFailure(data: { message?: string; details?: { issue?: string; description?: string }[]; debug_id?: string }, status: number) {
  const detail = data?.details?.[0];
  const issue = detail?.issue || "";
  const description = detail?.description || data?.message || "";
  const summary = [issue, description].filter(Boolean).join(": ") || `PayPal request failed (${status})`;
  console.error("PayPal request failed", status, issue, description, data?.debug_id || "");
  const error = new Error(summary);
  (error as Error & { issue?: string }).issue = issue;
  return error;
}

export async function capturePayPalOrder(orderID: string) {
  const accessToken = await getAccessToken();
  const config = getPayPalConfig();
  const response = await fetch(`${config.url}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const captureData = await response.json().catch(() => ({}));
  const issue = captureData?.details?.[0]?.issue || "";
  if (!response.ok) {
    if (issue === "ORDER_ALREADY_CAPTURED") {
      const again = await readPayPalOrder(orderID);
      return { captureId: again.captureId || orderID, raw: captureData };
    }
    throw paypalFailure(captureData, response.status);
  }
  if (captureData.status !== "COMPLETED") throw paypalFailure(captureData, response.status);
  const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
  return { captureId: (capture?.id as string | undefined) || orderID, raw: captureData };
}

export function paymentMethod(value?: string | null) {
  return ["venmo", "card", "applepay", "paypal"].includes(String(value || "")) ? String(value) : "paypal";
}

type PayPalOrder = {
  id: string;
  status?: string;
  links?: { rel: string; href: string }[];
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
    phone?: { phone_number?: { national_number?: string } };
  };
  payment_source?: {
    apple_pay?: {
      name?: string;
      email_address?: string;
      phone_number?: { national_number?: string };
    };
  };
  purchase_units?: {
    custom_id?: string;
    invoice_id?: string;
    amount?: { value?: string };
    payments?: { captures?: { id?: string }[] };
  }[];
};

export type CardInput = {
  number: string;
  expiry: string;
  securityCode: string;
  name: string;
};

async function paypal<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();
  const config = getPayPalConfig();
  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.details?.[0]?.description || data?.message;
    throw new Error(typeof detail === "string" && detail ? detail : "PayPal request failed");
  }
  return data as T;
}

function purchaseUnit(input: { amountCents: number; invoiceId: string; description: string; customId: string }) {
  return {
    amount: { currency_code: "USD", value: (input.amountCents / 100).toFixed(2) },
    description: input.description,
    custom_id: input.customId,
    invoice_id: input.invoiceId,
  };
}

function captureIdOf(order: PayPalOrder) {
  return order.purchase_units?.[0]?.payments?.captures?.[0]?.id || order.id;
}

export async function chargeCard(
  input: { amountCents: number; invoiceId: string; description: string; customId: string },
  card: CardInput
) {
  const order = await paypal<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [purchaseUnit(input)],
      payment_source: {
        card: {
          number: card.number,
          expiry: card.expiry,
          security_code: card.securityCode,
          name: card.name,
        },
      },
    }),
  });
  if (order.status === "COMPLETED") return { orderId: order.id, captureId: captureIdOf(order) };
  const captured = await capturePayPalOrder(order.id);
  return { orderId: order.id, captureId: captured.captureId };
}

export function venmoPayLink(amountCents: number, note: string) {
  const username = envValue("VENMO_HANDLE").replace(/^@/, "").trim();
  if (!username) throw new Error("Set VENMO_HANDLE to the Venmo account that should receive these payments");
  const params = new URLSearchParams({
    txn: "pay",
    amount: (amountCents / 100).toFixed(2),
    note,
  });
  return { qrUrl: `https://venmo.com/${encodeURIComponent(username)}?${params.toString()}`, username, note };
}

export async function readPayPalOrder(orderID: string) {
  const order = await paypal<PayPalOrder>(`/v2/checkout/orders/${orderID}`);
  const apple = order.payment_source?.apple_pay;
  const unit = order.purchase_units?.[0];
  const fullName = String(apple?.name || "").trim().split(/\s+/).filter(Boolean);
  const amount = Number(unit?.amount?.value);
  return {
    status: order.status || "",
    captureId: unit?.payments?.captures?.[0]?.id,
    email: apple?.email_address || order.payer?.email_address || "",
    firstName: order.payer?.name?.given_name || fullName[0] || "",
    lastName: order.payer?.name?.surname || fullName.slice(1).join(" ") || "",
    phone: apple?.phone_number?.national_number || order.payer?.phone?.phone_number?.national_number || "",
    customId: unit?.custom_id || "",
    invoiceId: unit?.invoice_id || "",
    amountCents: Number.isFinite(amount) ? Math.round(amount * 100) : 0,
  };
}

export async function captureApplePay(orderID: string, token: unknown) {
  const confirmed = await paypal<PayPalOrder>(`/v2/checkout/orders/${orderID}/confirm-payment-source`, {
    method: "POST",
    body: JSON.stringify({ payment_source: { apple_pay: { token } } }),
  });
  if (confirmed.status === "COMPLETED") return { orderId: orderID, captureId: captureIdOf(confirmed) };
  const captured = await capturePayPalOrder(orderID);
  return { orderId: orderID, captureId: captured.captureId };
}
