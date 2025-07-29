import { getUniversityTeams } from "@/services/UniversityTeams";
import UniversityFinancialsData from "@/components/UniversityFinancialsPage/UniversityFinancialsData";
import { redirect } from "next/navigation";

import Link from "next/link";

export default async function UniversityFinancials({
  params,
}: {
  params: Promise<{ "university-name": string }>;
}) {
  const { "university-name": encodedName } = await params;
  const universityName = decodeURIComponent(encodedName);
  const teams = await getUniversityTeams({ universityName });

  if (!teams || teams.length < 1) {
    redirect("/404");
  }

  return (
    <div>
      <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white pb-12 pt-24 flex flex-col items-center px-[10%] sm:px-[20%]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Financial Contributions Model for{" "}
          <span className="capitalize">{universityName}</span>
        </h1>
        <h2 className="text-3xl font-semibold mb-0 ml-20 mr-20">
          Does <span className="capitalize">{universityName}</span> receive any
          direct financial benefit
        </h2>
        <h2 className="text-3xl font-semibold mb-2 ml-20 mr-20">
          when their Athlete Network hires from within?
        </h2>
        <h2 className="text-xl font-semibold mb-0">
          By using The College Athlete Network to facilitate Athlete Network
          hiring and job activity,
        </h2>
        <h2 className="text-xl font-semibold mb-2">
          what levels of additional financial contributions back to the Athletic
          Department could be achieved?
        </h2>
        {teams[0]?.university_name === "Typical University" && (
          <h2 className="text-md mb-2 mt-2">
            * We have not mapped your university&apos;s data. Below are the averages for all universities in our datasets. Please{" "}
            <Link href="/contact-us" className="underline font-bold">
              Contact Us
            </Link>{" "}
            if you want to us to load your university&apos;s Athlete Network data.
          </h2>
        )}
      </div>

      <UniversityFinancialsData teams={teams} />
    </div>
  );
}
