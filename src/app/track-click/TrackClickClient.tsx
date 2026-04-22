"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CgSpinner } from "react-icons/cg";

export type TrackClickQuery = {
  university_name: string | null;
  destination: string | null;
  file_name: string | null;
  video_id: string | null;
  row_id: string | null;
  campaign_id: string | null;
  survey_id: string | null;
  email_address: string | null;
};

export default function TrackClickClient({
  university_name,
  destination,
  file_name,
  video_id,
  row_id,
  campaign_id,
  survey_id,
  email_address,
}: TrackClickQuery) {
  const router = useRouter();

  useEffect(() => {
    const created_by = "admin";
    const created_datetime = new Date().toISOString();

    if (!university_name || !row_id || !destination) {
      router.push("/");
      return;
    }

    if (destination === "surveys" && !survey_id) {
      router.push("/");
      return;
    }

    if (destination === "university-financials" && !university_name) {
      router.push("/");
      return;
    }

    if (destination === "media-viewer" && !file_name) {
      router.push("/");
      return;
    }

    if (destination === "video-viewer" && !university_name) {
      router.push("/");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/publicprod/track_click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        row_id,
        university_name: university_name,
        destination: destination || null,
        file_name: file_name || video_id || null,
        video_id: video_id || null,
        campaign_id: campaign_id || null,
        created_by: created_by,
        created_datetime: created_datetime,
      }),
    }).catch((err) => {
      console.error("Failed to log click:", err);
    });

    setTimeout(() => {
      if (destination === "surveys") {
        router.push(`/surveys/${university_name}?survey_id=${survey_id}`);
      } else if (destination === "media-viewer") {
        router.push(`/media-viewer/${university_name}?file=${file_name}`);
      } else if (destination === "video-viewer") {
        router.push(`/video-viewer/${university_name}?video_id=${video_id}`);
      } else if (destination === "login" && email_address) {
        const encoded = encodeURIComponent(email_address);
        router.push(
          `https://members.collegeathletenetwork.org/login?email_address=${encoded}`
        );
      } else if (destination === "login" && !email_address) {
        router.push(`https://members.collegeathletenetwork.org/login`);
      } else if (destination === "university-financials") {
        router.push(`/university-financials/${university_name}`);
      } else {
        router.push("/");
      }
    }, 300);
  }, [
    university_name,
    destination,
    file_name,
    video_id,
    row_id,
    campaign_id,
    survey_id,
    email_address,
    router,
  ]);

  return (
    <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] min-h-screen text-white pb-12 pt-24 flex flex-col justify-center items-center px-[10%] sm:px-[20%]">
      <CgSpinner size={80} className="animate-spin" />
      <h1 className="text-3xl font-semibold mb-2 mt-4">
        Loading things now...
      </h1>
      <p className="text-lg">
        Just give us a moment while we get everything ready for you
      </p>
    </div>
  );
}
