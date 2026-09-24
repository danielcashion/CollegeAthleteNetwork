"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
  isAllowedSponsorLogoFile,
  SPONSOR_LOGO_ACCEPT,
  SPONSOR_LOGO_MAX_FILE_BYTES,
} from "@/helpers/golfSponsorLogoClient";

const GolfSponsorLogoCropModal = dynamic(() => import("./GolfSponsorLogoCropModal"), { ssr: false });

export default function GolfSponsorLogoField({
  value,
  eventId,
  onChange,
}: {
  value: string;
  eventId: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  function pickFile(next: File | undefined) {
    if (!next) return;
    if (!isAllowedSponsorLogoFile(next)) {
      toast.error("Use a PNG or JPEG logo");
      return;
    }
    if (next.size > SPONSOR_LOGO_MAX_FILE_BYTES) {
      toast.error("Images must be 8 MB or smaller");
      return;
    }
    setFile(next);
  }

  return (
    <div className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">Sponsor logo</span>
      <input
        ref={inputRef}
        type="file"
        accept={SPONSOR_LOGO_ACCEPT}
        className="hidden"
        onChange={(event) => {
          pickFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {value ? (
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <div className="flex h-[96px] w-[176px] items-center justify-center rounded-xl bg-white ring-1 ring-[#1C315F]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Uploaded sponsor logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-[#1C315F]/15 bg-white px-3 py-2 text-sm font-semibold text-[#1C315F] hover:border-[#C9A227]"
              onClick={() => inputRef.current?.click()}
            >
              Change
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[#1C315F]/60 hover:text-[#ED3237]"
              onClick={() => onChange("")}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center rounded-xl border border-dashed border-[#1C315F]/20 bg-[#f9faf8] px-4 py-6 text-sm font-semibold text-[#1C315F] hover:border-[#C9A227] hover:bg-white"
          onClick={() => inputRef.current?.click()}
        >
          Choose PNG or JPEG
        </button>
      )}
      <p className="mt-1 text-xs text-[#1C315F]/50">Used on the public outing page when this package includes a logo.</p>
      {file ? (
        <GolfSponsorLogoCropModal
          file={file}
          eventId={eventId}
          onClose={() => setFile(null)}
          onComplete={(url) => {
            onChange(url);
            setFile(null);
          }}
        />
      ) : null}
    </div>
  );
}
