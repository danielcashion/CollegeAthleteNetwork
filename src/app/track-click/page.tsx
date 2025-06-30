"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CgSpinner } from "react-icons/cg";

export default function TrackClickPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const university_name = searchParams.get("university_name");
    const destination = searchParams.get("destination");
    const file_name = searchParams.get("file_name") || null; // Optional, can be null
    const row_id = searchParams.get("row_id");
    const campaign_id = searchParams.get("campaign_id") || null; // Optional, can be null
    const survey_id = searchParams.get("survey_id") || null; // Optional, can be null

    const created_by = "admin";
    const created_datetime = new Date().toISOString();

    // If essential params are missing, move to home
    if (!university_name || !row_id || !destination) {
      router.push("/");
      return;
    }

    if (destination === "surveys" && !survey_id) {
      router.push("/");
      return;
    }

    if (destination === "media-viewer" && !file_name) {
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
        file_name: survey_id || null,
        campaign_id: campaign_id || null,
        created_by: created_by,
        created_datetime: created_datetime,
      }),
    }).catch((err) => {
      console.error("Failed to log click:", err);
    });

    // Routing
    setTimeout(() => {
      if (destination === "surveys") {
        router.push(`/surveys/${university_name}?survey_id=${survey_id}`);
      } else if (destination === "media-viewer") {
        router.push(`/media-viewer/${university_name}?file=${file_name}`);
      } else {
        router.push("/");
      }
    }, 300);
  }, [searchParams, router]);

  return (
    <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] min-h-screen text-white pb-12 pt-24 flex flex-col justify-center items-center px-[10%] sm:px-[20%]">
      <CgSpinner size={80} className="animate-spin" />
      <h1 className="text-3xl font-semibold mb-2 mt-4">
        Loading your custom media...
      </h1>
      <p className="text-lg">
        Just give us a moment while we get everything ready for you
      </p>
    </div>
  );
}
