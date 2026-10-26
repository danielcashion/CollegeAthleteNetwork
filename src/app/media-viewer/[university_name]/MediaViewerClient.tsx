"use client";

import { useEffect, useState } from "react";

type Props = {
  displayedUniversityName: string;
  file: string | null;
};

export default function MediaViewerClient({
  displayedUniversityName,
  file,
}: Props) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const s3MediaDomain = "https://d38njvi41lhhq.cloudfront.net";
      const s3Url = `${s3MediaDomain}/${file}`;
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        s3Url
      )}&wdPrint=0`;
      setIframeUrl(viewerUrl);
    }
  }, [file]);

  if (!file) {
    return (
      <p className="p-8 text-center">
        We&apos;re sorry, but the file you&apos;re looking for is not available.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pt-20 pb-5 text-center shadow-md">
        <h1 className="text-3xl mt-2 sm:text-4xl font-extrabold tracking-tight">
          {`Custom Media Viewer for The ${displayedUniversityName} Athlete Network`}
        </h1>
        <p className="text-3xl mt-4 max-w-2xl mx-auto font-bold text-white/80">
          Current Topic:
        </p>
        <p className="text-2xl mt-2 max-w-3xl mx-auto font-bold text-white/80">
          Summarizing the unique value The College Athlete Network brings to the{" "}
          {displayedUniversityName} Athletic Department & the{" "}
          {displayedUniversityName} Athlete Network.
        </p>
      </div>

      <div className="w-full max-w-screen-lg px-4 sm:px-8 mt-5">
        {iframeUrl ? (
          <div className="relative w-full pb-[75%] rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden">
            <iframe
              src={iframeUrl}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              title="PowerPoint Viewer"
            />
          </div>
        ) : (
          <p className="text-center text-lg text-gray-600 mt-10">
            Loading presentation...
          </p>
        )}
      </div>
      <a
        href="/contact-us"
        className="mt-6 bg-[#1C315F] text-[#FFFFFF] font-semibold px-6 py-2 rounded-full mb-10 shadow hover:bg-[#ED3237] transition"
      >
        Get in Touch
      </a>
    </div>
  );
}
