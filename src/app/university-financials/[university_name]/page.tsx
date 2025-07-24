"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function ViewUniversityModel() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawUniversityName: any = params.university_name || "";

  const decodedName = decodeURIComponent(rawUniversityName);
  const displayedUniversityName = decodedName.replace(/-/g, " ");

  
  return (
    <>
      <Head>
        <title>
          Financial Model Details for the {displayedUniversityName} Athlete Network
        </title>
        <meta
          name="description"
          content={`Financial Model Details for the ${displayedUniversityName} Athletic Department`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pt-20 pb-5 text-center shadow-md">
          <h1 className="text-3xl mt-2 sm:text-4xl font-extrabold tracking-tight">
            {`Financial Model Viewer for The ${displayedUniversityName} Athlete Network`}
          </h1>
          <p className="text-3xl mt-4 max-w-2xl mx-auto font-bold text-white/80">
            Financials Details:
          </p>
          <p className="text-2xl mt-2 max-w-3xl mx-auto font-bold text-white/80">
            Details the unique value proposition The College Athlete Network brings to
            the {displayedUniversityName} Athletic Department & the{" "}
            {displayedUniversityName} Athlete Network.
          </p>
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
