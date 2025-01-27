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
const from_address = "Admin@clublacrosse.org" //process.env.EMAIL_FROM;

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

  const { name, email, message, university_name } = formData;

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
    console.log("Email sent successfully");
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
