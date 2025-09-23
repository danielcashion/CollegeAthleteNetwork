import Image from "next/image";
import "../styles/customStyles.css";
import Carousel from "@/components/LandingPage/Carousel";
import AthleteImage from "../../public/images/college-athletes-7.jpg"

import {
  FaDatabase,
  FaHandshakeSimple,
  FaArrowRight,
  FaCode,
} from "react-icons/fa6";
import {
  FaUsers,
  FaUser,
FaShieldAlt,
  FaLinkedin,
  FaSitemap,
  FaCheckSquare,
} from "react-icons/fa";
import {
  BsFileEarmarkSpreadsheetFill,
  BsFillFileEarmarkSpreadsheetFill,
} from "react-icons/bs";
import { TbAppWindowFilled } from "react-icons/tb";

export default function Home() {
  return (
    <div className="bg-[#e8e8e8] overflow-x-hidden">
      <main>
        {/* Hero Section */}
        <section className=" bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pb-12 pt-32 flex flex-col lg:flex-row gap-10 lg:gap-0 items-center px-[5%] sm:px-[10%]">
          <div className="w-full lg:w-[50%] mx-auto px-4 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Powering The Professional Networks of Collegiate Athletes
            </h1>
            <h2
              className="text-3xl font-semibold mb-4"
              role="heading"
              aria-level={4}
            >
              We Provide All Their Data Fuel
            </h2>
            <p className="text-lg md:text-xl text-right mb-6 font-light">
              Your School&apos;s Athletic Team Rosters, merged and continuously
              updated with Professional Experience Data (including LinkedIn).
            </p>
            <p className="text-lg md:text-xl text-right font-light">
              Empower your athletes. Strengthen your school. Future-proof your
              school&apos;s network.
            </p>
          </div>
          <div className="w-full lg:w-[40%]">
            <Image
              src={AthleteImage}
              alt="College Athletes"
              className="rounded-lg w-full object-cover"
            />
          </div>
        </section>

        {/* What We Do Section */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-[#ED3237] tracking-wider small-caps">
            What We Do
          </h2>
          <p className="text-justify text-xl leading-relaxed text-[#1C315F]">
            We bridge the gap between athlete rosters and professional networks.
            By sourcing college roster data from public platforms, researching
            and linking athletes&apos; LinkedIn profiles, and merging this
            information into a single, user-friendly workflow, we provide
            partner universities and their athletes with an up-to-date knowledge
            graph of their athlete network. Our platform curates and organizes
            the geographical locations and professional journeys data (past
            &amp; present) of your college&apos; athletes, creating an
            actionable network for your university.
          </p>
          <div className="w-full flex flex-col sm:flex-row gap-10 sm:gap-20 justify-center items-start mt-8 mb-4">
            <div className="flex flex-col gap-2 mx-auto sm:mx-0">
              <BsFileEarmarkSpreadsheetFill
                size={70}
                className="mx-auto text-[#1C315F]"
              />
              <p
                role="heading"
                aria-level={4}
                className="text-center text-xl text-[#ED3237] font-medium"
              >
                We Source Current & Historic Public Athlete Rosters
              </p>
            </div>
            <div className="flex flex-col gap-2 mx-auto sm:mx-0">
              <FaLinkedin size={70} className="mx-auto text-[#1C315F]" />
              <p
                role="heading"
                aria-level={4}
                className="text-center text-xl text-[#ED3237] font-medium"
              >
                We Map these Athletes to 3rd Party Public datasets we purchase,
                including LinkedIn
              </p>
            </div>
            <div className="flex flex-col gap-2 mx-auto sm:mx-0">
              <FaDatabase size={70} className="mx-auto text-[#1C315F]" />
              <p
                role="heading"
                aria-level={4}
                className="text-center text-xl text-[#ED3237] font-medium"
              >
                We Refresh Athlete Employers, Titles, Locations every 60 days
              </p>
            </div>
            <div className="flex flex-col gap-2 mx-auto sm:mx-0">
              <FaHandshakeSimple size={70} className="mx-auto text-[#1C315F]" />
              <p
                role="heading"
                aria-level={4}
                className="text-center text-xl text-[#ED3237] font-medium"
              >
                We Actively Partner with Athletic Directors, Teams, & Employers
              </p>
            </div>
          </div>
        </section>

        {/* Why Is It Hard? Section */}
        <section className="bg-[#1C315F] py-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('../../public/images/college-athletes-3.jpg')] opacity-5 bg-cover bg-center" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#ED3237] small-caps tracking-wider">
                Why Is It Hard?
              </h2>

              <div className="flex items-start justify-center mb-12 space-x-4">
                <FaUsers className="w-8 h-8 min-w-8 min-h-8 text-[#ED3237]" />
                <p
                  role="heading"
                  aria-level={4}
                  className="text-xl leading-relaxed"
                >
                  After Graduating, athletes change jobs, on average, every{" "}
                  <span className="text-[#ED3237] font-semibold">
                    3.1 years
                  </span>{" "}
                  in the first 15 years after graduation. For a network of{" "}
                  <span className="text-[#ED3237] font-semibold">
                    3,000 athletes
                  </span>
                  (a relatively small school network), this means tracking and
                  updating data for around
                  <span className="text-[#ED3237] font-semibold">
                    {" "}
                    1,200 individuals{" "}
                  </span>
                  annually.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-[#1c315f]/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-[#ED3237]/50 transition-all duration-300">
                  <div className="flex items-start mb-4 space-x-3">
                    <BsFillFileEarmarkSpreadsheetFill className="w-7 h-7 min-w-7 min-h-7 text-[#ED3237] mt-1" />
                    <h3
                      className="font-bold text-2xl text-[#ED3237]"
                      role="heading"
                      aria-level={4}
                    >
                      If Your Alumni &quot;Database&quot; is actually a simple
                      and stale Spreadsheet:
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <FaArrowRight className="w-4 h-4 min-w-4 min-h-4 text-white mt-1" />
                      <span className="text-lg">
                        It quickly becomes outdated. Nobody wants to own
                        updating it.
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <FaArrowRight className="w-4 h-4 min-w-4 min-h-4 text-white mt-1" />
                      <span className="text-lg">
                        Confusion arises from multiple versions of the same
                        document.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#1c315f]/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-[#ED3237]/50 transition-all duration-300">
                  <div className="flex items-start mb-4 space-x-3">
                    <TbAppWindowFilled className="w-7 h-7 min-w-7 min-h-7 text-[#ED3237] mt-1" />
                    <h3
                      className="font-bold text-2xl text-[#ED3237]"
                      role="heading"
                      aria-level={4}
                    >
                      If You&apos;re Using an App where YOU supply the Data:
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <FaArrowRight className="w-4 h-4 min-w-4 min-h-4 text-white mt-1" />
                      <span className="text-lg">
                        Data curation is 99% of the problem. Other vendors
                        delegate it to you.
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <FaArrowRight className="w-4 h-4 min-w-4 min-h-4 text-white mt-1" />
                      <span className="text-lg">
                        The curation of the data is what makes the network work
                        and we own the delivery, not you!
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Network Section */}
        <section className="py-12 bg-gradient-to-r from-[#ED3237] to-[#1C315F] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 small-caps">
              Build a Unified, Enduring Athlete Network
            </h2>
            <p className="text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
              Our platform connects athletes across all sports at your
              university, creating a robust, institution-wide professional
              network. Here&apos;s why this matters:
            </p>
            <div className="grid gap-6 max-w-3xl mx-auto text-left">
              <div className="flex items-start space-x-4">
                <FaShieldAlt className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Resilience:</span> Coaches
                  come and go, but your school&apos;s network remains intact and
                  growing.
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaUser className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">
                    Cross-Sport Connections:
                  </span>{" "}
                  Athletes connect with peers and alumni from other sports,
                  unlocking mentorship and career opportunities.
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaDatabase className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Institutional Memory:</span>{" "}
                  Your school—not an individual—owns the data, ensuring
                  long-term benefits.
                </div>
              </div>
            </div>

            <div className="w-full max-w-7xl mx-auto mt-8">
              <Carousel />
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="container mx-auto px-4 pt-16 pb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-1 text-[#ED3237] small-caps">
            Why Choose The
          </h2>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#ED3237] small-caps">
            CollegeAthleteNetwork.org?
          </h2>
          <p
            role="heading"
            aria-level={4}
            className="text-2xl md:text-3xl leading-relaxed mb-4 text-[#1C315F] text-center max-w-3xl mx-auto"
          >
            Maintaining professional data on your athletes is a time-consuming,
            never-ending headache that demands continuous effort.
          </p>

          <p
            role="heading"
            aria-level={4}
            className="text-2xl leading-relaxed mb-2 text-[#1C315F] text-center max-w-2xl mx-auto tracking-wide"
          >
            This is where we become your trusted teammate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto mt-6">
            <div className="text-center">
              <FaSitemap size={60} className="text-[#1C315F] mx-auto mb-4" />
              <h3
                className="font-bold text-2xl mb-2 text-[#ED3237]"
                role="heading"
                aria-level={4}
              >
                Serious Expertise
              </h3>
              <p className="text-[#1C315F] text-xl text-center">
                With 30 years of experience, we&apos;ve perfected the art of
                data curation. We know this is hard, which is why we have
                productionalized the process.
              </p>
            </div>
            <div className="text-center">
              <FaCode size={60} className="text-[#1C315F] mx-auto mb-4" />
              <h3
                className="font-bold text-2xl mb-2 text-[#ED3237]"
                role="heading"
                aria-level={4}
              >
                Repeatable & Dependable
              </h3>
              <p className="text-[#1C315F] text-xl text-center">
                Our proven algorithms & ongoing sanity checks ensure your
                network stays accurate and up-to-date.
              </p>
            </div>
            <div className="text-center">
              <FaCheckSquare
                size={60}
                className="text-[#1C315F] mx-auto mb-4"
              />
              <h3
                className="font-bold text-2xl mb-2 text-[#ED3237]"
                role="heading"
                aria-level={4}
              >
                Providing an Exceptional Experience
              </h3>
              <p className="text-[#1C315F] text-xl text-center">
                Your athletes work hard. They deserve to benefit from the
                network your university can provide.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export const metadata = {
  title: 'The College Athlete Network - Home',
  description: 'Discover and connect with athletes from your university',
};
