export const SPONSOR_LOGO_MAX_FILE_BYTES = 8 * 1024 * 1024;
export const SPONSOR_LOGO_MAX_SIDE = 400;
export const SPONSOR_LOGO_ASPECT = 176 / 96;
export const SPONSOR_LOGO_WHITE = 245;
export const SPONSOR_LOGO_MIN_LONG_SIDE = 200;
export const SPONSOR_LOGO_ACCEPT = "image/png,image/jpeg";

export type SponsorLogoIssueCode = "white_lettering" | "low_ink" | "low_contrast" | "low_resolution";

export type SponsorLogoIssue = {
  code: SponsorLogoIssueCode;
  message: string;
};

export type CropArea = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export function isAllowedSponsorLogoFile(file: File) {
  const type = (file.type || "").toLowerCase();
  return type === "image/png" || type === "image/jpeg" || type === "image/jpg";
}

function isNearWhite(r: number, g: number, b: number) {
  return r >= SPONSOR_LOGO_WHITE && g >= SPONSOR_LOGO_WHITE && b >= SPONSOR_LOGO_WHITE;
}

export function knockOutEdgeWhite(pixels: Uint8ClampedArray, width: number, height: number) {
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const canFlood = (idx: number) => {
    const i = idx * 4;
    if (pixels[i + 3] === 0) return true;
    return isNearWhite(pixels[i], pixels[i + 1], pixels[i + 2]);
  };

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx] || !canFlood(idx)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  for (let qi = 0; qi < queue.length; qi += 1) {
    const idx = queue[qi];
    const i = idx * 4;
    if (isNearWhite(pixels[i], pixels[i + 1], pixels[i + 2])) {
      pixels[i + 3] = 0;
    }
    const x = idx % width;
    const y = Math.floor(idx / width);
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }
}

export function analyzeSponsorLogoPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): SponsorLogoIssue[] {
  const total = width * height;
  let ink = 0;
  let interiorWhite = 0;
  let inkLuma = 0;

  for (let idx = 0; idx < total; idx += 1) {
    const i = idx * 4;
    const alpha = pixels[i + 3];
    if (alpha === 0) continue;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (isNearWhite(r, g, b)) {
      interiorWhite += 1;
      continue;
    }
    ink += 1;
    inkLuma += 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const issues: SponsorLogoIssue[] = [];
  const visible = ink + interiorWhite;

  if (interiorWhite >= 80 && interiorWhite / Math.max(visible, 1) >= 0.08) {
    issues.push({
      code: "white_lettering",
      message: "White lettering or interior white will be hard to see on the light carousel tile.",
    });
  }
  if (ink / Math.max(total, 1) < 0.04) {
    issues.push({
      code: "low_ink",
      message: "This crop looks mostly blank. Try zooming in so the mark fills more of the frame.",
    });
  }
  if (ink > 0 && inkLuma / ink > 210) {
    issues.push({
      code: "low_contrast",
      message: "The mark is very light and may fade into the white sponsor tile.",
    });
  }
  if (Math.max(width, height) < SPONSOR_LOGO_MIN_LONG_SIDE) {
    issues.push({
      code: "low_resolution",
      message: "This crop is low resolution and may look soft on the outing page.",
    });
  }
  return issues;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.src = url;
  });
}

export async function cropSponsorLogo(imageSrc: string, pixelCrop: CropArea) {
  const image = await createImage(imageSrc);
  const scale = Math.min(1, SPONSOR_LOGO_MAX_SIDE / Math.max(pixelCrop.width, pixelCrop.height));
  const width = Math.max(1, Math.round(pixelCrop.width * scale));
  const height = Math.max(1, Math.round(pixelCrop.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to crop logo");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  );

  const imageData = ctx.getImageData(0, 0, width, height);
  knockOutEdgeWhite(imageData.data, width, height);
  ctx.putImageData(imageData, 0, 0);
  const issues = analyzeSponsorLogoPixels(imageData.data, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Could not create PNG"))), "image/png");
  });

  return {
    blob,
    dataUrl: canvas.toDataURL("image/png"),
    width,
    height,
    issues,
  };
}
