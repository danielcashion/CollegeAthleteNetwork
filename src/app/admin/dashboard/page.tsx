"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/admin");
  };

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

            <button
              onClick={handleSignOut}
              className="mt-6 w-full bg-gradient-to-r from-blueMain to-redMain text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        )}

        <p className="text-gray-600 mt-4">
          Dashboard Page - Under Construction
        </p>
      </div>
    </main>
  );
}
