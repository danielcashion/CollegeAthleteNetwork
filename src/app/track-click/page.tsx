'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TrackClickPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const university_name = searchParams.get('university_name');
    const filename = searchParams.get('filename');// URL for each university_name
    const row_id = searchParams.get('row_id');
    
    if (university_name && row_id && filename) {
      fetch(`/api/log-click?row_id=${row_id}&university=${university_name}&filename=${filename}`);

      setTimeout(() => {
        router.push(`/view-ppt/?file=${filename}`);
      }, 300);
    }
  }, [searchParams, router]);

  return <p className="text-center text-lg font-semibold mt-10 mb-10 text-gray-500 animate-pulse ">Loading your custom media...</p>;
}
