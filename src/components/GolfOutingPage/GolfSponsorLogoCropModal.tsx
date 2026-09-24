"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
  cropSponsorLogo,
  SPONSOR_LOGO_ASPECT,
  type SponsorLogoIssue,
} from "@/helpers/golfSponsorLogoClient";

const goldButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[#C9A227] px-5 py-2.5 text-sm font-semibold text-[#0B1B3A] transition-colors hover:bg-[#E8D48B] disabled:cursor-not-allowed disabled:opacity-60";
const grayButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-[#1C315F]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#1C315F]/70 transition-colors hover:border-[#1C315F]/30 hover:text-[#1C315F] disabled:cursor-not-allowed disabled:opacity-60";

export default function GolfSponsorLogoCropModal({
  file,
  eventId,
  onClose,
  onComplete,
}: {
  file: File;
  eventId?: string;
  onClose: () => void;
  onComplete: (url: string) => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [issues, setIssues] = useState<SponsorLogoIssue[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !working) {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, working]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function invalidateReview() {
    setReviewed(false);
    setIssues([]);
    setPreviewUrl(null);
  }

  async function reviewCrop() {
    if (!imageSrc || !croppedAreaPixels) return;
    setWorking(true);
    try {
      const result = await cropSponsorLogo(imageSrc, croppedAreaPixels);
      setPreviewUrl(result.dataUrl);
      setIssues(result.issues);
      setReviewed(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not crop logo");
    } finally {
      setWorking(false);
    }
  }

  async function uploadLogo() {
    if (!imageSrc || !croppedAreaPixels) return;
    setWorking(true);
    try {
      const result = await cropSponsorLogo(imageSrc, croppedAreaPixels);
      const body = new FormData();
      body.append("file", result.blob, "logo.png");
      if (eventId) body.append("event_id", eventId);
      const response = await fetch("/api/golf/upload-sponsor-logo", { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Could not upload logo");
      }
      onComplete(data.url as string);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload logo");
    } finally {
      setWorking(false);
    }
  }

  const primaryLabel = !reviewed
    ? working
      ? "Reviewing…"
      : "Review logo"
    : issues.length
      ? working
        ? "Uploading…"
        : "Use this logo anyway"
      : working
        ? "Uploading…"
        : "Save logo";

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#0B1B3A]/55 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sponsor-logo-crop-title"
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden bg-[#0B1B3A] px-6 py-5">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-[#C9A227]" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">Sponsor logo</p>
              <h2 id="sponsor-logo-crop-title" className="mt-1 font-serif text-xl font-bold text-white">
                Crop your logo
              </h2>
              <p className="mt-1 text-sm text-white/70">Pan and zoom so the mark fills the sponsor tile.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={working}
              className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="relative h-72 overflow-hidden rounded-xl bg-[#0B1B3A]">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={SPONSOR_LOGO_ASPECT}
                onCropChange={(next) => {
                  setCrop(next);
                  invalidateReview();
                }}
                onZoomChange={(next) => {
                  setZoom(next);
                  invalidateReview();
                }}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => {
                setZoom(Number(event.target.value));
                invalidateReview();
              }}
              className="mt-2 w-full accent-[#C9A227]"
            />
          </label>

          {previewUrl ? (
            <div className="flex items-center gap-4 rounded-xl border border-[#1C315F]/10 bg-[#f9faf8] p-3">
              <div className="flex h-[96px] w-[176px] shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-[#1C315F]/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Cropped sponsor logo preview" className="h-full w-full object-contain" />
              </div>
              <p className="text-xs text-[#1C315F]/60">Preview on the white carousel tile. Background white is removed automatically.</p>
            </div>
          ) : null}

          {reviewed && issues.length > 0 ? (
            <div className="rounded-xl border border-[#C9A227]/40 bg-[#F6F1E4] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A7014]">Please review</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#0B1B3A]">
                {issues.map((issue) => (
                  <li key={issue.code}>{issue.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-[#1C315F]/10 px-6 py-4">
          <button type="button" className={grayButtonClass} disabled={working} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={goldButtonClass}
            disabled={working || !croppedAreaPixels}
            onClick={reviewed ? uploadLogo : reviewCrop}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
