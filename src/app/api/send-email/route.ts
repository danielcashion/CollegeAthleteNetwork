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

const defaultRecipient = "daniel.cashion.nyc@gmail.com";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json(
      { message: "Access denied. Please try again." },
      { status: 403 }
    );
  }

  try {
    const { to, subject, body, isHtml, fromName, fromAddress } = await request.json();

    const recipient = to?.trim() || defaultRecipient;
    
    // Use provided fromAddress or fall back to environment variable
    const senderAddress = fromAddress?.trim() || process.env.EMAIL_FROM || "";
    
    // Use provided fromName or fall back to default
    const senderName = fromName?.trim() || "The College Athlete Network";

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
    if (!senderAddress) {
      console.error("No sender email address provided and EMAIL_FROM is not configured.");
      return NextResponse.json(
        { message: "Server misconfiguration." },
        { status: 500 }
      );
    }

    // Validate sender email format
    if (!emailRegex.test(senderAddress)) {
      return NextResponse.json(
        { message: "Invalid sender email address." },
        { status: 400 }
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
      Source: `${senderName} <${senderAddress}>`,
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
