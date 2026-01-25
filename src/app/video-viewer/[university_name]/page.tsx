"use client";

import { useParams, useSearchParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";

const defaultVideoId = "PPH7AQRz_Jc";

function getSafeVideoId(rawValue: string | null) {
  if (!rawValue) return defaultVideoId;
  return /^[\w-]{11}$/.test(rawValue) ? rawValue : defaultVideoId;
}

export default function VideoViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawUniversityName = params.university_name;
  const decodedName = decodeURIComponent(String(rawUniversityName || ""));
  const displayedUniversityName = decodedName.replace(/-/g, " ");
  const videoId = getSafeVideoId(searchParams.get("video_id"));
  const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
  const watchUrl = `https://youtu.be/${videoId}`;

  return (
    <>
      <Head>
        <title>
          Video Viewer for the {displayedUniversityName} Athlete Network
        </title>
        <meta
          name="description"
          content={`Video viewer for the ${displayedUniversityName} Athletic Department`}
        />
      </Head>

      <div className="bg-gray-50 flex flex-col items-center pb-4">
        <div className="w-full bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pt-16 pb-5 text-center shadow-md">
          <h1 className="text-3xl mt-2 sm:text-4xl font-extrabold tracking-tight">
            {`The ${displayedUniversityName} Athlete Network Video Library`}
          </h1>

          <p className="text-2xl mt-2 max-w-3xl mx-auto font-bold text-white/80">
            Delivering the simplicity, engagement, and convenience of The College Athlete Network to
            the {displayedUniversityName} Athlete Network.
          </p>
        </div>

        <div className="w-full max-w-screen-lg px-4 sm:px-8 mt-5">
          <div className="relative w-full pb-[56.25%] rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden">
            <iframe
              src={videoUrl}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="College Athlete Network Video"
              aria-label="College Athlete Network video player"
            />
          </div>
          <div className="mt-3 text-center text-[#1c315f]/80 text-sm">
            Dedicated engagement for the {displayedUniversityName} Athlete Network.
          </div>
          <div className="mt-2 text-center">
            <a
              href={watchUrl}
              className="text-sm font-semibold text-[#1C315F] hover:text-[#ED3237] transition"
              target="_blank"
              rel="noreferrer"
            >
              Watch on YouTube
            </a>
          </div>
        </div>

        <div className="mt-5 text-[#1c315f] font-semibold">
          Ready to engage with the {displayedUniversityName} Athlete Network?
        </div>
        <div className="mt-3 mb-2 flex flex-row flex-wrap items-center justify-center gap-4">
            <a
            href="https://members.collegeathletenetwork.org/login"
            className="bg-[#1C315F] text-[#FFFFFF] font-semibold px-6 py-2 rounded-full shadow hover:bg-[#ED3237] transition"
            rel="noreferrer"
            >
            Login Now
            </a>
        </div>
      </div>
    </>
  );
}
