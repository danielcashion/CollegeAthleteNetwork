import Image from "next/image";
import Link from "next/link";
import { AthleteChecklistItems } from "@/utils/AthleteChecklist";

import AthleteImage1 from "../../../public/images/athlete-1.jpg";
import AthleteImage2 from "../../../public/images/athletes-3.png";

export default function AthleteChecklist() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white pb-12 pt-24 flex flex-col items-center px-[10%] sm:px-[20%]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Athlete Checklist
        </h1>
        <h2 className="text-3xl font-semibold mb-4">
          Unlocking Your Career Potential with Your College Athlete Network
        </h2>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 flex">
            <Image
              src={AthleteImage1}
              alt="college athlete network logo"
              width={600}
              height={300}
              quality={100}
              className="mx-auto object-cover rounded-lg"
            />
          </div>
          <div className="md:w-1/2 md:pl-8">
            <p className="text-lg mb-4 text-center md:text-left">
              As a college athlete, you&apos;ve spent years mastering teamwork,
              discipline, and perseverance—qualities that employers value
              highly. Now, it&apos;s time to leverage those strengths and the
              powerful network of fellow college athletes to secure your dream
              job. Follow these steps to make the most of your College Athlete
              Network and land the opportunity you deserve.
            </p>
            <p className="text-lg text-center md:text-left">
              We saw an opportunity to make a difference. By introducing a
              professional workflow, we&apos;ve taken the burden of maintaining
              and updating these networks off the shoulders of university
              administrations and placed it in the hands of a trusted partner —
              us.
            </p>
          </div>
        </div>

        <div className="relative my-20 mx-auto max-w-4xl">
          <div className="hidden md:block absolute left-0 h-full w-[4px] bg-gradient-to-b from-[#1C315F] to-[#ED3237] rounded-full"></div>

          <div className="md:hidden absolute left-8 top-0 h-full w-[4px] bg-gradient-to-b from-[#1C315F] to-[#ED3237] rounded-full"></div>

          <div className="space-y-16">
            {AthleteChecklistItems.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col group transition-all duration-300 "
              >
                <div
                  className="hidden md:flex absolute left-[3px] transform -translate-x-1/2 -top-4 w-20 h-20 
                              rounded-full bg-white shadow-xl items-center justify-center z-10
                              border-4 border-transparent group-hover:border-[#1C315F] transition-all duration-300"
                >
                  <div className="text-2xl group-hover:scale-125 transition-all duration-300">
                    {step.icon}
                  </div>
                </div>

                <div
                  className="md:hidden absolute left-8 transform -translate-x-1/2 w-16 h-16 
                              rounded-full bg-white shadow-xl flex items-center justify-center z-10
                              border-2 border-transparent group-hover:border-[#1C315F] transition-all"
                >
                  {step.icon}
                </div>

                <div className="w-full pl-20 md:pl-16">
                  <div className="bg-white p-8 rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-bold text-[#1C315F] mb-4 flex flex-col sm:flex-row items-center">
                      <span
                        className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white rounded-full 
                                  w-10 min-w-10 h-10 min-h-10 flex items-center justify-center mr-4 shadow-md"
                      >
                        {step.id}
                      </span>
                      {step.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {step.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mt-16 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-[60%] pr-10">
            <h3 className="text-3xl font-bold text-[#1C315F] mb-4">
              Conclusion
            </h3>
            <p className="mb-10 text-lg text-gray-700 leading-relaxed">
              Your college athlete status is more than a title—it&apos;s a
              powerful advantage in the job market. By strategically using your
              College Athlete Network, you can create meaningful connections,
              open doors to new opportunities, and position yourself for career
              success. Start today, and let your athlete network work for you!
            </p>
            <Link
              href={"https://members.collegeathletenetwork.org/"}
              target="_blank"
              className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
            >
              Join Your College Athlete Network Today
            </Link>
          </div>
          <div className="w-full md:w-[40%]">
            <Image
              src={AthleteImage2}
              alt="Career Success"
              width={600}
              height={400}
              className="rounded-lg shadow-md mx-auto w-full mt-10 md:mt-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
