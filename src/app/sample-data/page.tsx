import axios from "axios";
import SampleDataTopSection from "@/components/SampleDataPage/SampleDataTopSection";
import DataTables from "@/components/SampleDataPage/DataTables";

const SampleDataPage = async () => {
  try {
    const response = await axios.get(
      `https://api.tourneymaster.org/publicprod/sport_coverage`
    );

    const universityData = response.data;

    return (
      <div className="flex flex-col">
        <SampleDataTopSection />
        <DataTables data={universityData} />
        <h2 className="flex text-lg justify-center mb-3 text-[#1C315F]" role="heading" aria-level={2}>
          The only representations we make regarding the above data is that it
          is accurate.
        </h2>
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);

    return (
      <div className="flex flex-col">
        <SampleDataTopSection />
        <div className="w-full py-32 flex flex-col gap-6 items-center justify-center">
          <p className="text-3xl font-semibold">Error Fetching Data</p>
        </div>
      </div>
    );
  }
};

export default SampleDataPage;
