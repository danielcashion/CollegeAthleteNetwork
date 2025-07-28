import { getUniversityTeams } from "@/services/UniversityTeams";
import UniversityFinancialsData from "@/components/UniversityFinancialsPage/UniversityFinancialsData";

export default async function UniversityFinancials({
  params,
}: {
  params: { "university-name": string };
}) {
  const universityName = params["university-name"];
  const teams = await getUniversityTeams({ universityName });
  console.log("University Teams:", teams);
  return (
    <div>
      <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white pb-12 pt-24 flex flex-col items-center px-[10%] sm:px-[20%]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          University Financials for {universityName}
        </h1>
        <h2 className="text-3xl font-semibold mb-4">
          Get the complete financial information for {universityName} and its
          teams for different years, ranges and categories.
        </h2>
      </div>

      <UniversityFinancialsData teams={teams} />
    </div>
  );
}
