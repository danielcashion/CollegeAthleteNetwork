"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CgSpinner } from "react-icons/cg";

export default function TrackClickPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const university_name = searchParams.get("university_name");
    const filename = searchParams.get("file_name");
    const row_id = searchParams.get("row_id");

    if (university_name && row_id && filename) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/log-click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          row_id,
          university: university_name,
          filename,
        }),
      }).catch((err) => {
        console.error("Failed to log click:", err);
      });

      setTimeout(() => {
        router.push(`/media-viewer/${university_name}?file=${filename}`);
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
