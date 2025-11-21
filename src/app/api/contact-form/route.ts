import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY ||
      "",
  },
});

const to_address = "daniel.cashion.nyc@gmail.com" // process.env.EMAIL_TO;
const from_address = "admin@collegeathletenetwork.org" //process.env.EMAIL_FROM;

export async function POST(request: NextRequest) {
  if (!to_address || !from_address) {
    console.error("Missing EMAIL_TO or EMAIL_FROM environment variables");
    return NextResponse.json(
      { message: "Emails in configuration are not defined." },
      { status: 500 }
    );
  }

  let formData: {
    name: string;
    email: string;
    university_name: string;
    message: string;
    recaptchaToken?: string;
  };

  try {
    formData = await request.json();
  } catch (error) {
    console.error("Invalid JSON:", error);
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  const { name, email, message, university_name, recaptchaToken } = formData;

  // Verify reCAPTCHA token
  if (!recaptchaToken) {
    return NextResponse.json(
      { message: "reCAPTCHA verification required" },
      { status: 400 }
    );
  }

  try {
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      }
    );

    const recaptchaResult = await recaptchaResponse.json();

    if (!recaptchaResult.success) {
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

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    typeof university_name !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim() ||
    !university_name.trim()
  ) {
    return NextResponse.json(
      { message: "All fields are required and must be valid strings" },
      { status: 400 }
    );
  }

  const emailParams = {
    Source: `College Athlete Network Admin <${from_address}>`,
    Destination: {
      ToAddresses: [to_address],
    },
    Message: {
      Subject: {
        Data: `New Contact Request from ${name}`,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: `Name: ${name}\nEmail: ${email}\nUniversity: ${university_name}\nMessage: ${message}`,
          Charset: "UTF-8",
        },
      },
    },
  };

  const command = new SendEmailCommand(emailParams);

  try {
    await sesClient.send(command);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
