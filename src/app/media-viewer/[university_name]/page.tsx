"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function ViewUniversityPpt() {
  const params = useParams();
  const searchParams = useSearchParams();

  const universityName = params.university_name;
  const file = searchParams.get("file");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && universityName) {
      const s3_Media_Domain = "https://d38njvi41lhhq.cloudfront.net" // process.env.NEXT_PUBLIC_CLOUDFRONT_S3_CAN_DOMAIN; // 
      console.log("s3_Media_Domain: ", s3_Media_Domain);
      const s3Url = `${s3_Media_Domain}/${file}`;
      console.log("s3Url: ", s3Url);
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        s3Url
      )}`;
      setIframeUrl(viewerUrl);
    }
  }, [file, universityName]);

  if (!file) return <p>We are sorry, but the file you are looking for is not available.</p>;

  return (
    <>
      <Head>
        <title>{`Media Viewer for the ${universityName} Athlete Network`}</title>
        <meta
          name="description"
          content={`Media Viewer for the ${universityName} Athletic Department`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pt-20 pb-5 text-center shadow-md">
          <h1 className="text-3xl mt-2 sm:text-4xl font-extrabold tracking-tight">
            {universityName
              ? `Custom Media Viewer for The ${universityName} Athlete Network`
              : "Media Viewer"}
          </h1>
          <p className="text-3xl mt-4 max-w-2xl mx-auto font-bold text-white/80">
            Current Topic:
          </p>
          <p className="text-2xl mt-2 max-w-3xl mx-auto font-bold text-white/80">
            Summarizing the unique value The College Athlete
            Network brings to the {universityName} Athletic Department & the{" "}
            {universityName} Athlete Network.
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
        <button
          onClick={() => (window.location.href = "/contact-us")}
          className="mt-6 bg-[#1C315F] text-[#FFFFFF] font-semibold px-6 py-2 rounded-full mb-10 shadow hover:bg-[#ED3237] transition"
        >
          Get in Touch
        </button>
      </div>
    </>
  );
}
