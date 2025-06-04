'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ViewUniversityPpt() {
  const params = useParams();
  const searchParams = useSearchParams();

  const universityName = params.university_name;
  const file = searchParams.get('file'); // e.g., ?file=custom-slide.pptx
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && universityName) {
      const s3Url = `https://collegeathletenetwork.s3.amazonaws.com/media/ppts/${file}`;
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(s3Url)}`;
      setIframeUrl(viewerUrl);

      // Optional logging
      fetch(`/api/log-ppt-view?file=${file}&university=${universityName}`);
    }
  }, [file, universityName]);

  if (!file) return <p>Missing file parameter.</p>;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl font-semibold mb-4">
        {universityName ? `${universityName} Presentation` : 'Presentation'}
      </h1>
      {iframeUrl ? (
        <iframe
          src={iframeUrl}
          width="100%"
          height="90%"
          frameBorder="0"
          allowFullScreen
          title="PowerPoint Viewer"
        />
      ) : (
          <p>Loading presentation...</p>
          
      )}
    </div>
  );
}

