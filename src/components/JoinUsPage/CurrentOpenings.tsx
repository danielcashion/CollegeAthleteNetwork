import JobOpeningsTable from "@/components/JoinUsPage/JobOpeningsTable";

const jobs = [
  {
    position: "University Partnerships Lead",
    location: "Remote",
    description:
      "Build relationships with athletic departments in The Big 10, SEC, and ACC Conferences.",
  },
  {
    position: "University Partnerships Lead",
    location: "Remote",
    description:
      "Build relationships with athletic departments in The Big East, Ivy, and NESCAC Conferences.",
  },
  {
    position: "UX/UI Designer",
    location: "New York, NY",
    description: "Assist with digital campaigns focused on athlete outreach.",
  },
  {
    position: "Data Analyst",
    location: "New York, NY",
    description: "Assist with data QA and cleaning algorithms.",
  },
];

export default function CurrentOpenings() {
  return (
    <main className="p-8 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold mb-2 text-blueMain">
          Current Job Openings
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          We&apos;re growing fast and looking for people who care deeply about
          athlete success. Explore open roles below.
        </p>
      </div>

      <div className="max-w-[80%] mx-auto w-full">
        <JobOpeningsTable jobs={jobs} />
      </div>
    </main>
  );
}
