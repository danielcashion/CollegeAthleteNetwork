export function normalizePhone(value?: string | null) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+") && digits.length >= 11) return digits;
  const only = digits.replace(/\D/g, "");
  if (only.length === 10) return `+1${only}`;
  if (only.length === 11 && only.startsWith("1")) return `+${only}`;
  return "";
}

export function twilioConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

export async function sendSms(to: string, body: string) {
  if (!twilioConfigured()) return { sent: false as const, reason: "unconfigured" as const };
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  const from = process.env.TWILIO_FROM_NUMBER || "";
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  const data = (await response.json().catch(() => ({}))) as { code?: number; message?: string };
  if (response.ok) return { sent: true as const };
  if (Number(data.code) === 21610) return { sent: false as const, reason: "opt-out" as const };
  return { sent: false as const, reason: "failed" as const, detail: data.message || `Twilio ${response.status}` };
}
