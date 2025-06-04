"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewUniversityPpt() {
  const params = useParams();
  const searchParams = useSearchParams();

  const universityName = params.university_name;
  const file = searchParams.get("file");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && universityName) {
      const s3Url = `https://collegeathletenetwork.s3.us-east-1.amazonaws.com/ppts/${file}`;
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        s3Url
      )}`;
      setIframeUrl(viewerUrl);
    }
  }, [file, universityName]);

  if (!file) return <p>Missing file parameter.</p>;

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white pb-6 pt-24 flex flex-col items-center px-[10%] sm:px-[20%]">
        <h1 className="text-4xl font-bold mb-4">
          {universityName ? `${universityName} Presentation` : "Presentation"}
        </h1>
      </div>

      {iframeUrl ? (
        <iframe
          src={iframeUrl}
          width="835px"
          height="650px"
          frameBorder="0"
          allowFullScreen
          title="PowerPoint Viewer"
          className="mx-auto mt-10 bg-white shadow-lg"
        />
      ) : (
        <p>Loading presentation...</p>
      )}
    </div>
  );
}
