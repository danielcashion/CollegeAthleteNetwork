import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1C315F] to-[#ED3237] flex items-center justify-center px-4">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-4">That page does not exist.</h2>
        <Link className="text-lg underline" href="/">
          Return to the homepage
        </Link>
      </div>
    </div>
  );
}