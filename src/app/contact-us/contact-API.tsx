import type { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";

AWS.config.update({
  region: "us-east-1",
});

const to_address = process.env.EMAIL_TO;
const from_address = process.env.EMAIL_FROM;

const ses = new AWS.SES();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Validate environment variables
  if (!to_address || !from_address) {
    console.error("Missing EMAIL_TO or EMAIL_FROM environment variables");
    return res.status(500).json({ message: "Server configuration error" });
  }

  const { name, email, message, university_name } = req.body;

  // Validate request body
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
    return res
      .status(400)
      .json({ message: "All fields are required and must be valid strings" });
  }

  const params = {
    Source: from_address,
    Destination: {
      ToAddresses: [to_address],
    },
    Message: {
      Subject: {
        Data: `New Contact Request from ${name}`,
      },
      Body: {
        Text: {
          Data: `Name: ${name}\nEmail: ${email}\nUniversity: ${university_name}\nMessage: ${message}`,
        },
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
}
