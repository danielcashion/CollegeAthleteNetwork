import { NextRequest, NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const to_address = process.env.EMAIL_TO || "daniel.cashion.nyc@gmail.com";
const from_address =
  process.env.EMAIL_FROM || "admin@collegeathletenetwork.org";

export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json(
      { message: "Access denied. Please try again." },
      { status: 403 }
    );
  }

  if (!to_address || !from_address) {
    console.error("Missing EMAIL_TO or EMAIL_FROM environment variables");
    return NextResponse.json(
      { message: "Server email configuration is missing." },
      { status: 500 }
    );
  }

  let payload: {
    jobInfo: {
      position: string;
      location: string;
      shortDescription?: string;
      longDescription?: string;
      requirements?: string;
    };
    fullName: string;
    location: string;
    email: string;
    phone: string;
    aboutYou: string;
    linkedinProfile?: string;
    coverLetter: string;
    otherInfo?: string;
  };

  try {
    payload = await request.json();
  } catch (e) {
    console.error("Invalid JSON:", e);
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  const {
    jobInfo,
    fullName,
    location,
    email,
    phone,
    aboutYou,
    linkedinProfile = "",
    coverLetter,
    otherInfo = "",
  } = payload;

  // Basic validation
  if (
    !jobInfo?.position ||
    !fullName.trim() ||
    !email.trim() ||
    !phone.trim() ||
    !aboutYou.trim() ||
    !coverLetter.trim()
  ) {
    return NextResponse.json(
      { message: "Required fields are missing or empty." },
      { status: 400 }
    );
  }

  // Build the email body
  const bodyLines = [
    `New Job Application for "${jobInfo.position}- ${jobInfo.shortDescription}"`,
    `Job Location: ${jobInfo.location}`,
    "",
    `Applicant Name: ${fullName}`,
    `Location: ${location}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    linkedinProfile ? `LinkedIn: ${linkedinProfile}` : "",
    "",
    "About You:",
    aboutYou,
    "",
    "Cover Letter:",
    coverLetter,
    "",
    otherInfo ? `Other Info:\n${otherInfo}` : "",
  ].filter(Boolean);

  const emailParams = {
    Source: `College Athlete Network <${from_address}>`,
    Destination: { ToAddresses: [to_address] },
    Message: {
      Subject: {
        Data: `Job Application: ${jobInfo.position} - ${fullName}`,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: bodyLines.join("\n"),
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(emailParams));
    return NextResponse.json(
      { message: "Application submitted." },
      { status: 200 }
    );
  } catch (err) {
    console.error("SES send error:", err);
    return NextResponse.json(
      { message: "Failed to send application email." },
      { status: 500 }
    );
  }
}
