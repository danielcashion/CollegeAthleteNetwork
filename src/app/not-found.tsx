'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after a short delay
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1C315F] to-[#ED3237] flex items-center justify-center px-4">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-4">Humm, that page does not exist.</h2>
        <p className="text-lg">Hang tight, we are going to redirect you back to a safe place...</p>
      </div>
    </div>
  );
} 