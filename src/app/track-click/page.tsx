"use client";


// Example of URL -> 
// www.collegeathletenetwork.org/track-click?row_id=aacc6762-3d84-11f0-b73f-06f633821df3&university_name=Yale&campaign_id=New%20User&file_name=CollegeAthleteNetworkIntroduction-Yale.pptx

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CgSpinner } from "react-icons/cg";

export default function TrackClickPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const university_name = searchParams.get("university_name");
    const file_name = searchParams.get("file_name");
    const row_id = searchParams.get("row_id");
    const campaign_id = searchParams.get("campaign_id");

    if (university_name && row_id && file_name) {
      const is_active_YN = 1;
      const created_by = 'admin';
      const created_datetime = new Date().toISOString();
      console.log(university_name, row_id, file_name, campaign_id, is_active_YN, created_by, created_datetime)

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/publicprod/track_click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          row_id,
          university_name: university_name,
          file_name: file_name,
          campaign_id: campaign_id || null, // Optional, can be null
          is_active_YN: is_active_YN,
          created_by: created_by,
          created_datetime: created_datetime,
        }),

      }).catch((err) => {
        console.error("Failed to log click:", err);
      });

      setTimeout(() => {
        router.push(`/media-viewer/${university_name}?file=${file_name}`);
      }, 300);
    } else {
      router.push("/");
    }
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
