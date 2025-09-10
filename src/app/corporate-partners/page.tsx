import Image from "next/image";
import Link from "next/link";
import AthletesImage from "../../../public/images/athletes-2.jpg";
import {
  FaCrown,
  FaArrowsTurnToDots,
  FaClockRotateLeft,
} from "react-icons/fa6";
import { FaBalanceScale } from "react-icons/fa";

export default function CorporatePartnersPage() {
  return (
    <div className="min-h-screen flex flex-col">
  <div className="flex-grow">
        {/* Hero Section */}
        <section className="text-white pt-28 bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16">
          <div className="container mx-auto px-4 text-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 mx-auto w-full max-w-[800px] ">
              Directly Hire College Athletes: Resilient, Driven, Team-Oriented
              Talent
            </h1>
            <p className="text-xl mb-12">
              Tap into an exclusive network of current and former college
              athletes and alumni to find top-tier talent for your company.
            </p>
            <div className="flex flex-col md:flex-row mx-auto gap-4">
              <Link
                href="/contact-us"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-200"
              >
                Join Our Employer Network
              </Link>
              <Link
                href="/contact-us"
                className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
              >
                Post a Job Today
              </Link>
            </div>
          </div>
        </section>

        {/* Why College Athletes Make Exceptional Employees */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-8 text-center text-[#1c315f]" role="heading" aria-level={2}>
              College Athletes Make Exceptional Employees
            </h2>
            <p className="text-xl ml-5 mr-5 mb-6 text-center text-[#1c315f]">
              Athletes are high-achievers who bring leadership, discipline, and
              teamwork into the workplace. Hiring from this pool gives companies
              a competitive edge in attracting resilient professionals.
            </p>
            <div className="grid md:grid-cols-2 text-[#1c315f] lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Work Ethic",
                  description:
                    "Commitment to rigorous training and improvement.",
                  icon: <FaBalanceScale size={40} />,
                },
                {
                  title: "Leadership & Teamwork",
                  description: "Effective in collaborative environments.",
                  icon: <FaCrown size={40} />,
                },
                {
                  title: "Resilience & Adaptability",
                  description: "Thrives under pressure and problem-solving.",
                  icon: <FaArrowsTurnToDots size={40} />,
                },
                {
                  title: "Time Management",
                  description: "Excels at balancing priorities effectively.",
                  icon: <FaClockRotateLeft size={40} />,
                },
              ].map((trait, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="mb-2 text-[#1c315f]"> {trait.icon}</div>

                  <h3 className="text-xl font-semibold mb-2" role="heading" aria-level={3}>{trait.title}</h3>
                  <p>{trait.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alumni-Driven Hiring */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4 text-center text-[#1c315f]" role="heading" aria-level={2}>
              Alumni: Help Build the Next Generation of Leaders
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg mb-4 text-[#1c315f]">
                Alumni play a crucial role in mentoring and hiring athletes from
                their alma mater. Companies with alumni in leadership roles can
                actively recruit like-minded talent with shared values, creating
                a powerful network of high-achievers.
              </p>
              <p className="text-lg mb-6 text-[#1c315f]">
                We&apos;ve seen numerous success stories of alumni hiring fellow
                athletes at their firms, fostering a culture of excellence and
                mutual understanding.
              </p>
              <div className="text-center mt-6">
                <Link
                  href="/contact-us"
                  className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
                >
                  Start Hiring from Your Alma Mater
                </Link>
              </div>

              <Image
                src={AthletesImage}
                alt="athletes"
                className="w-full mt-10 mx-auto rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Exclusive Network for Corporate Partner Firms */}
        <section className="pb-8 pt-4 bg-gray-100">
          <div className="container mx-auto px-4">
            <FaCrown size={60} className="mx-auto text-[#1c315f] mb-2" />
            <h2 className="text-3xl font-bold mb-4 text-center text-[#1c315f]" role="heading" aria-level={2}>
              Connect with a Network of Like-Minded Leaders
            </h2>
            <div className="max-w-3xl mx-auto">
              <ul className="text-[#1c315f] list-disc pl-6 mb-6 space-y-2 text-lg">
                <li>
                  Partner firms gain direct access to a talent pool of
                  disciplined and driven individuals.
                </li>
                <li>
                  Build long-term hiring pipelines with top student-athletes.
                </li>
                <li>
                  Networking opportunities with other firms that prioritize
                  hiring high-achieving talent.
                </li>
              </ul>
              <div className="text-center">
                <Link
                  href="/contact-us"
                  className="bg-[#ED3237] text-white pt-2 text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
                >
                  Become a Hiring Partner
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-[#1c315f] text-5xl font-bold mb-8 text-center" role="heading" aria-level={2}>
              How It Works
            </h2>
            <div className="grid md:grid-cols-5 gap-8 md:gap-12 text-[#1c315f]">
              {[
                {
                  title: "Join Our Network",
                  description:
                    "Contact us or your corporate lead at your partner universities. We then quickly & easily onboard your firm to The College Athlete Network.",
                },
                {
                  title: 'Post an "Opportunity"',
                  description:
                    "Post your company's openings to university network(s), specifically targeting profiles (Universities, sports, etc.) in our network of universities.",
                },
                {
                  title: 'Browse Our Pool of Athlete "Availabilities"',
                  description:
                    "Search profiles based on school, sport, skills, and location. We match great people with great firms!",
                },
                {
                  title: "Hire Exceptional Talent",
                  description:
                    "Engage with candidates and bring them onto your team. Hiring from the network significantly reduces large recruiter fees.",
                },
                {
                  title: "Contribute Back to Your Athletic Department",
                  description:
                    "By avoiding head hunting fees, we ask you to make a contribution to your athletic department. Optional, encouraged, and tax-deductible.",
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-[#ED3237] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-semibold mb-2" role="heading" aria-level={3}>{step.title}</h3>
                  <p className="text-lg">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-[#1c315f] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6" role="heading" aria-level={2}>
              Start Hiring Today & Gain Access to Elite Talent
            </h2>
            <div className="space-x-4">
              <Link
                href="/contact-us"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-300"
              >
                Join the Network
              </Link>
            </div>
            <p className="mt-4 text-xl">
              For alumni and employers who are ready to hire from an exceptional
              talent pool
            </p>
          </div>
        </section>
  </div>
    </div>
  );
}
