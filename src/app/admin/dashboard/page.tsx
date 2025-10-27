"use client";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        aria-label="Main content"
        role="main"
      >
        <div className="w-full py-32 flex flex-col gap-6 items-center justify-center">
          <p className="text-xl">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} aria-label="Main content" role="main">
      <div className="w-full py-32 flex flex-col gap-6 items-center justify-center px-4">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

        {session && (
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Welcome!
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Email:</span>{" "}
                {session.user?.email}
              </p>
              <p>
                <span className="font-medium">Admin ID:</span>{" "}
                {session.user?.id}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
