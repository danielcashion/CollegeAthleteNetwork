import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { PinpointSMSVoiceV2Client, SendTextMessageCommand } from "@aws-sdk/client-pinpoint-sms-voice-v2";

const COLLEGE_ATHLETE_NETWORK_RCS_AGENT = "rcs-0b5739dbb75944b7a667995d28011e8b";

let cachedOrigination: string | null = null;

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

function awsCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
  const region = process.env.AWS_SMS_REGION || process.env.AWS_REGION || "";
  if (!accessKeyId || !secretAccessKey || !region) return null;
  return { accessKeyId, secretAccessKey, region };
}

export function smsConfigured() {
  return Boolean(awsCredentials());
}

async function originationIdentity(region: string, credentials: { accessKeyId: string; secretAccessKey: string }) {
  const configured = process.env.AWS_SMS_ORIGINATION_IDENTITY?.trim();
  if (configured) return configured;
  if (cachedOrigination) return cachedOrigination;
  const agentId = process.env.AWS_RCS_AGENT_ID?.trim() || COLLEGE_ATHLETE_NETWORK_RCS_AGENT;
  if (agentId.startsWith("arn:")) {
    cachedOrigination = agentId;
    return agentId;
  }
  const account = await new STSClient({ region, credentials }).send(new GetCallerIdentityCommand({}));
  if (!account.Account) throw new Error("AWS account could not be resolved for texting");
  cachedOrigination = `arn:aws:sms-voice:${region}:${account.Account}:rcs-agent/${agentId}`;
  return cachedOrigination;
}

export async function sendSms(to: string, body: string) {
  const aws = awsCredentials();
  if (!aws) return { sent: false as const, reason: "unconfigured" as const };
  try {
    const client = new PinpointSMSVoiceV2Client({
      region: aws.region,
      credentials: { accessKeyId: aws.accessKeyId, secretAccessKey: aws.secretAccessKey },
    });
    await client.send(
      new SendTextMessageCommand({
        DestinationPhoneNumber: to,
        OriginationIdentity: await originationIdentity(aws.region, aws),
        MessageBody: body.slice(0, 3072),
        MessageType: "TRANSACTIONAL",
      })
    );
    return { sent: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Text could not be sent";
    if (/opt.?out/i.test(message)) return { sent: false as const, reason: "opt-out" as const };
    return { sent: false as const, reason: "failed" as const, detail: message };
  }
}
