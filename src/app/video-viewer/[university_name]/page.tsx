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

      <div className="bg-gray-50 flex flex-col items-center pb-3">
        <div className="w-full bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pt-12 pb-6 text-center shadow-md px-4 sm:px-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wider">
            {`The ${displayedUniversityName} Athlete Network Video Library`}
          </h1>

          <p className="text-base sm:text-2xl mt-3 max-w-3xl mx-auto font-bold text-white/80">
            Delivering the sophistication, engagement, and convenience of
          </p>
          <p className="text-base sm:text-2xl mt-2 max-w-3xl mx-auto font-bold text-white/80">
            The College Athlete Network to
            the <strong>{displayedUniversityName} Athlete Network</strong>.
          </p>
        </div>

        <div className="w-full max-w-screen-lg px-4 sm:px-8 mt-4">
          <div className="relative w-full pb-[56.25%] rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-200 bg-white overflow-hidden">
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

        <div className="mt-4 px-4 text-[#1c315f] text-lg sm:text-xl font-semibold text-center">
          Ready to engage with your <strong>{displayedUniversityName} Athlete Network</strong>?
        </div>
        <div className="mt-3 mb-2 flex w-full flex-row flex-wrap items-center justify-center gap-3 px-4">
          <a
            href="https://members.collegeathletenetwork.org/login"
            className="w-full max-w-sm bg-[#1C315F] text-[#FFFFFF] font-semibold px-5 py-2 rounded-full shadow hover:bg-[#ED3237] transition text-sm sm:text-base text-center"
            rel="noreferrer"
          >
            Login Now
          </a>
        </div>
      </div>
    </>
  );
}
