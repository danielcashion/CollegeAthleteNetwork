import { NextRequest, NextResponse } from "next/server";
import { uploadHtmlTemplateToS3 } from "@/helpers/s3FileFunctions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { htmlContent, templateId } = body;

    // Validate required fields
    if (!htmlContent || !templateId) {
      return NextResponse.json(
        {
          success: false,
          error: "Both htmlContent and templateId are required",
        },
        { status: 400 }
      );
    }

    // Upload the HTML template to S3
    const result = await uploadHtmlTemplateToS3(htmlContent, templateId);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Error in upload-html-template API:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
