'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1C315F] to-[#ED3237] flex items-center justify-center px-4">
      <div className="text-center text-white">
        <h2 className="text-2xl mb-4">We are so sorry, but something went wrong!</h2>
        <button
          className="bg-white text-[#1C315F] px-4 py-2 rounded-md hover:bg-opacity-90"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
} 