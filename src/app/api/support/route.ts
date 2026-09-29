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

const toAddress = "daniel.cashion.nyc@gmail.com";
const fromAddress = "admin@collegeathletenetwork.org";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json(
      { message: "Access denied. Please try again." },
      { status: 403 }
    );
  }

  let formData: {
    name?: string;
    email?: string;
    organization?: string;
    topic?: string;
    question?: string;
    recaptchaToken?: string;
  };

  try {
    formData = await request.json();
  } catch (error) {
    console.error("Invalid JSON:", error);
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const name = singleLine(formData.name || "");
  const email = singleLine(formData.email || "");
  const organization = singleLine(formData.organization || "");
  const topic = singleLine(formData.topic || "");
  const question = (formData.question || "").trim();
  const recaptchaToken = formData.recaptchaToken;

  if (!recaptchaToken) {
    return NextResponse.json(
      { message: "reCAPTCHA verification required" },
      { status: 400 }
    );
  }

  try {
    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      }
    );
    const recaptchaResult = await recaptchaResponse.json();

    if (!recaptchaResult.success) {
      console.warn("reCAPTCHA verification failed", recaptchaResult["error-codes"]);
      return NextResponse.json(
        { message: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return NextResponse.json(
      { message: "reCAPTCHA verification error" },
      { status: 500 }
    );
  }

  if (!name || !email || !question) {
    return NextResponse.json(
      { message: "Name, email, and question are required." },
      { status: 400 }
    );
  }

  if (
    !emailRegex.test(email) ||
    name.length > 200 ||
    question.length > 5000 ||
    organization.length > 200 ||
    topic.length > 80
  ) {
    return NextResponse.json(
      { message: "Please check the form and try again." },
      { status: 400 }
    );
  }

  const command = new SendEmailCommand({
    Source: `College Athlete Network Admin <${fromAddress}>`,
    Destination: { ToAddresses: [toAddress] },
    ReplyToAddresses: [email],
    Message: {
      Subject: {
        Data: topic ? `Support question from ${name}: ${topic}` : `Support question from ${name}`,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Topic: ${topic || "(not specified)"}`,
            `Organization: ${organization || "(none)"}`,
            "",
            "Question:",
            question,
          ].join("\n"),
          Charset: "UTF-8",
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending support email:", error);
    return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
  }
}
