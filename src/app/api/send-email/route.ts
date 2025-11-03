import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const fromAddress = process.env.EMAIL_FROM || "";
const defaultRecipient = "daniel.cashion.nyc@gmail.com";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, isHtml } = await request.json();

    const recipient = to?.trim() || defaultRecipient;

    if (!subject || !body) {
      return NextResponse.json(
        { message: "Fields `subject` and `body` are required." },
        { status: 400 }
      );
    }
    if (!emailRegex.test(recipient)) {
      return NextResponse.json(
        { message: "Invalid recipient email address." },
        { status: 400 }
      );
    }
    if (!fromAddress) {
      console.error("EMAIL_FROM is not configured.");
      return NextResponse.json(
        { message: "Server misconfiguration." },
        { status: 500 }
      );
    }

    // Prepare email body based on isHtml flag
    const emailBody: any = {};

    if (isHtml) {
      // Send as HTML email
      emailBody.Html = {
        Data: body,
        Charset: "UTF-8",
      };
      // Also include a text version by stripping HTML tags
      emailBody.Text = {
        Data: body.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " "),
        Charset: "UTF-8",
      };
    } else {
      // Send as plain text email
      emailBody.Text = {
        Data: body,
        Charset: "UTF-8",
      };
    }

    const emailParams = {
      Source: `The College Athlete Network <${fromAddress}>`,
      Destination: { ToAddresses: [recipient] },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: emailBody,
      },
    };

    await sesClient.send(new SendEmailCommand(emailParams));

    return NextResponse.json({
      message: `Email sent successfully to ${recipient}.`,
    });
  } catch (err: any) {
    console.error("Error in /api/send-email:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
