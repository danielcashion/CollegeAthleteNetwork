// pages/join-us.tsx (or similar)
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
      <h1 className="text-3xl text-[#1C315F]  ml-10 font-bold">
        Current Job Openings
      </h1>
      <p className="text-[#1C315F] text-lg font-semibold">
        We’re growing fast and looking for people who care deeply about athlete
        success. Explore open roles below.
      </p>
      <div className="max-w-[80%] mx-auto w-full">
        <JobOpeningsTable jobs={jobs} />
      </div>
    </main>
  );
}
