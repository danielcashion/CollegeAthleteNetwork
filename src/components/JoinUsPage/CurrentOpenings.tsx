import JobOpeningsTable from "@/components/JoinUsPage/JobOpeningsTable";
import { jobs } from "@/utils/jobs";

export default function CurrentOpenings() {
  return (
    <div className="w-full flex px-6 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2 text-blueMain">
            Current Job Openings
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We&apos;re growing fast and looking for people who care deeply about
            athlete success. Explore open roles below.
          </p>
        </div>

        <div className="w-full">
          <JobOpeningsTable jobs={jobs} />
        </div>
      </div>
    </div>
  );
}
