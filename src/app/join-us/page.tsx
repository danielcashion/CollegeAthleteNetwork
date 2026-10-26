import type React from "react";
import { marketingMetadata } from "@/lib/seo/metadata";
import JoinUsTopSection from "@/components/JoinUsPage/JoinUsTopSection";

export const metadata = marketingMetadata({
  title: "Join Us",
  description:
    "Join The College Athlete Network and connect with athletes, alumni, and career opportunities at your university.",
  path: "/join-us",
});
import OurStory from "@/components/JoinUsPage/WhyUs";
import CurrentOpenings from "@/components/JoinUsPage/CurrentOpenings";
import CantFindJob from "@/components/JoinUsPage/CantFindJob";
import Testimonials from "@/components/JoinUsPage/Testimonials";
import FAQ from "@/components/JoinUsPage/Faq";

const JoinUsPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#F9FAFB" }}>
      <JoinUsTopSection />
      <OurStory />
      <CurrentOpenings />
      <Testimonials />
      <FAQ />
      <CantFindJob />
    </div>
  );
};

export default JoinUsPage;
