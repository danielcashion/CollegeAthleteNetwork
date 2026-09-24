import { NextRequest, NextResponse } from "next/server";
import { assertPublishedOuting, clientKey, rateLimit } from "@/app/api/golf/_public";
import {
  isAllowedSponsorLogoType,
  SPONSOR_LOGO_MAX_FILE_BYTES,
} from "@/helpers/golfSponsorLogo";
import { uploadGolfSponsorLogo } from "@/helpers/s3FileFunctions";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  if (!rateLimit(`sponsor-logo:${clientKey(req)}`)) {
    return NextResponse.json({ error: "Too many logo uploads. Try again shortly." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const eventId = String(formData.get("event_id") || "").trim();
    if (!eventId) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 });
    }
    const outing = await assertPublishedOuting(eventId);
    if (!outing) {
      return NextResponse.json({ error: "Outing not found" }, { status: 404 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }
    if (file.size > SPONSOR_LOGO_MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Images must be 8 MB or smaller" }, { status: 400 });
    }
    if (!isAllowedSponsorLogoType(file.type)) {
      return NextResponse.json({ error: "Use a PNG or JPEG logo" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const format = (await sharp(buffer).metadata()).format?.toLowerCase();
    if (format !== "png" && format !== "jpeg" && format !== "jpg") {
      return NextResponse.json({ error: "Use a PNG or JPEG logo" }, { status: 400 });
    }

    const url = await uploadGolfSponsorLogo(buffer);
    return NextResponse.json({ url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload sponsor logo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
