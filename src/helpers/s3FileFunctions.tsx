import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const S3_BUCKET = "collegeathletenetwork";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function getImageFormat(imageData: Buffer): Promise<string | null> {
  try {
    const metadata = await sharp(imageData).metadata();
    return metadata.format ? metadata.format.toLowerCase() : null;
  } catch (error) {
    console.error("Error detecting image format:", error);
    return null;
  }
}

const getImage = async (imageUrl: string) => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    if (response.status !== 200) {
      throw new Error(
        `Failed to download image: status code ${response.status}`
      );
    }

    return Buffer.from(response.data);
  } catch (e) {
    console.error("Error downloading image:", e);
    return null;
  }
};

/**
 * Downloads an image from the given URL, detects its extension,
 * and then uploads it to your S3 bucket under a randomly generated filename using uuid.
 *
 * @param imageUrl   The direct link to the image file (e.g. from a third-party API)
 * @param s3Folder   (Optional) folder path in your S3 bucket. Default is "images/"
 * @returns          The public S3 URL of the uploaded image
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  s3Folder = "images/"
): Promise<string> {
  try {
    const imageData = await getImage(imageUrl);
    if (!imageData) {
      return "Error: Image url expired";
    }
    const format = await getImageFormat(imageData);
    if (!format) {
      // throw new Error("Could not determine image format");
      return "Error: Not available to determine image format";
    }

    const uniqueFilename = `${uuidv4()}.${format}`;

    const s3Key = `${s3Folder}${uniqueFilename}`;

    const putObjectCmd = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: imageData,
      //   ACL: "public-read",
      ContentType: `image/${format}`,
    });

    await s3Client.send(putObjectCmd);

    return `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
  } catch (error) {
    throw new Error(`Error uploading image to S3: ${error}`);
  }
}

const allowedContentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function getExtension(str: string) {
  const lastDotIndex = str.lastIndexOf(".");
  return lastDotIndex !== -1 ? str.slice(lastDotIndex + 1) : "";
}

function getFileName(str: string) {
  const lastDotIndex = str.lastIndexOf(".");
  return lastDotIndex !== -1 ? str.slice(0, lastDotIndex) : "";
}

export async function generateUploadUrl(
  filename: string,
  contentType: string,
  fileBuffer: Buffer
) {
  if (!allowedContentTypes.includes(contentType)) {
    throw new Error("Invalid file type.");
  }

  const fileExtension = getExtension(filename);
  const fileNameWithoutExtension = getFileName(filename);

  const bucketName = S3_BUCKET;
  const oppFolderName = "Opportunities"; // The folder name in your S3 bucket
  const key = `${oppFolderName}/${fileNameWithoutExtension}-${Date.now()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
    return { fileUrl };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
}

export async function generateUploadUrlforAvailabilities(
  filename: string,
  contentType: string,
  fileBuffer: Buffer
) {
  if (!allowedContentTypes.includes(contentType)) {
    throw new Error("Invalid file type.");
  }

  const fileExtension = getExtension(filename);
  const fileNameWithoutExtension = getFileName(filename);

  const bucketName = S3_BUCKET;
  const uploadFolderName = "Availabilities"; // The folder name in your S3 bucket
  const key = `${uploadFolderName}/${fileNameWithoutExtension}-${Date.now()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
    return { fileUrl };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
}

export async function uploadDocument(
  filename: string,
  contentType: string,
  fileBuffer: Buffer
) {
  if (!allowedContentTypes.includes(contentType)) {
    throw new Error("Invalid file type.");
  }

  const fileExtension = getExtension(filename);
  const fileNameWithoutExtension = getFileName(filename);

  const bucketName = S3_BUCKET;
  const uploadFolderName = "Documents"; // The folder name in your S3 bucket
  const key = `${uploadFolderName}/${fileNameWithoutExtension}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
    return { fileUrl };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
}

export async function uploadHtmlTemplateToS3(
  htmlContent: string,
  key: string,
  bucket: string = S3_BUCKET
): Promise<{
  success: boolean;
  statusCode: number;
  url?: string;
  error?: string;
}> {
  try {
    const fullKey = `email_templates/${key}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fullKey,
      Body: htmlContent,
      ContentType: "text/html",
    });

    const result = await s3Client.send(command);
    const statusCode = result.$metadata.httpStatusCode || 200;
    const url = `https://${bucket}.s3.amazonaws.com/${fullKey}`;
    return { success: statusCode === 200, statusCode, url };
  } catch (error) {
    console.error("Error uploading HTML to S3:", error);
    return { success: false, statusCode: 500, error: (error as Error).message };
  }
}
