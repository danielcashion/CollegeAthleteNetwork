import Link from "next/link";

import {
  FaShieldAlt,
  FaUserGraduate,
  FaFootballBall,
  FaUserTie,
  FaCheckCircle,
  FaHandshake,
  FaTrophy,
  FaNetworkWired,
  FaChartLine,
} from "react-icons/fa";

export default function DataTransparency() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pb-16 pt-28 flex flex-col items-center px-6 sm:px-[15%]">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center leading-tight">
          Data Transparency & Compliance
        </h1>
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-2xl text-white text-center">
            At <strong>The College Athlete Network</strong>, we are committed to
            supporting universities and their athletes with integrity,
            transparency, and respect for compliance boundaries.
          </p>
          <p className="text-2xl text-white mt-5 text-center">
            We understand that Athletic Departments must operate with care and
            accountability. That&apos;s why we&apos;ve structured our platform
            to be <strong>100% compliant, hands-off, and worry-free</strong> for
            our university partners.
          </p>
        </div>

        <div className="flex justify-center mt-10">
          <div className="w-20 h-1 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-16">
          <div className="flex items-center justify-center mb-2">
            <FaShieldAlt size={80} className="text-5xl text-[#1C315F]" />
          </div>
          <p className="text-center text-[#1C315F] text=bold text-2xl max-w-3xl mx-auto">
            Our platform operates with complete independence from universities
            while supporting athlete career development. We maintain strict data
            boundaries that protect institutions from compliance concerns.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 ">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#1C315F]" role="heading" aria-level={2}>
          For University Stakeholders
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
            <div className="bg-[#1C315F] p-4 flex justify-center">
              <FaUserGraduate className="text-4xl text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-[#1C315F]" role="heading" aria-level={3}>
                For Compliance Officers
              </h3>
              <p className="text-gray-700">
                While universities publish roster data publicly, we never
                request it, and never store it on your behalf. All data is
                sourced independently from public channels. This separation
                ensures that your institution is not responsible for our data in
                any way — and that there are no FERPA, custodial, or legal
                obligations.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
            <div className="bg-[#ED3237] p-4 flex justify-center">
              <FaFootballBall className="text-4xl text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-[#ED3237]" role="heading" aria-level={3}>
                For Athletic Directors
              </h3>
              <p className="text-gray-700">
                Yes — rosters are posted by your university, and we respect
                that. But we never ask for your data, and you never share it
                with us. Everything we do is based on public info we gather
                ourselves. That&apos;s how we support your athletes without
                creating work, responsibility, or compliance concerns for your
                staff.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
            <div className="bg-[#1C315F] p-4 flex justify-center">
              <FaUserTie className="text-4xl text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-[#1C315F]" role="heading" aria-level={3}>
                For University Leadership
              </h3>
              <p className="text-gray-700">
                We operate entirely independently of the university. While
                roster data is publicly available through your websites, we do
                not ask for it, and we never imply any institutional ownership
                of it on our platform. That clear boundary protects your brand, avoids
                compliance complexities, and enables you to champion your Athlete Network
                without assuming additional responsibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-8 my-16 mb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#1C315F] flex items-center justify-center mr-4">
              <FaCheckCircle className="text-2xl text-white" />
            </div>
            <h2 className="text-4xl font-bold text-[#1C315F]" role="heading" aria-level={2}>
              Key Compliance Assurances
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-10">
            {/* All boxes with consistent styling */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#1C315F] h-full flex">
              <div className="flex items-start">
                <FaCheckCircle className="text-[#1C315F] text-xl mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-xl text-[#1C315F] mb-2" role="heading" aria-level={3}>
                    All Data is Public
                  </h3>
                  <p className="text-gray-700">
                    We use only publicly available data sources, such as
                    official team rosters, alumni publications, media guides,
                    and publicly available professional bios.
                    <span className="block mt-2 italic text-gray-600">
                      No private, FERPA-protected, or internal university data
                      is ever used.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#1C315F] h-full flex">
              <div className="flex items-start">
                <FaCheckCircle className="text-[#1C315F] text-xl mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-xl text-[#1C315F] mb-2" role="heading" aria-level={3}>
                    No Data Sharing or Transfers
                  </h3>
                  <p className="text-gray-700">
                    Universities are never sent any copies or parts of the data. All data is
                    hosted and maintained on our platform solely by our team in
                    our secured environment. Your institution remains completely
                    separate from our data collection and data custody.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#1C315F] h-full flex">
              <div className="flex items-start">
                <FaCheckCircle className="text-[#1C315F] text-xl mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-xl text-[#1C315F] mb-2" role="heading" aria-level={3}>
                    Universities Never Take Possession of Data
                  </h3>
                  <p className="text-gray-700">
                    Our university partners do not provide, upload, or store any
                    athlete or alumni data. All content is sourced and managed
                    independently by our platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#1C315F] h-full flex">
              <div className="flex items-start">
                <FaCheckCircle className="text-[#1C315F] text-xl mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-xl text-[#1C315F] mb-2" role="heading" aria-level={3}>
                    No Legal or Operational Burden
                  </h3>
                  <p className="text-gray-700">
                    Our structure is specifically designed to ensure
                    universities face no compliance, legal, or operational
                    obligations. There is nothing for you to monitor, store, or
                    report.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#1C315F] mb-4" role="heading" aria-level={2}>
            Why Universities Partner With The College Athlete Network?
          </h2>
          <div className="w-[75%] h-1 bg-[#ED3237] mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform transition duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-[#1C315F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTrophy className="text-2xl text-[#1C315F]" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-[#1C315F]" role="heading" aria-level={3}>
              Upwardly Manage Your School&apos;s Athlete Network
            </h3>
            <p className="text-gray-700">
              Our platform <strong className="text-[#ED3237]">productionalizes</strong> the incredible career journeys of your
              current and former athletes — a powerful tool for recruiting, fundraising, and
              school pride.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform transition duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-[#ED3237]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaNetworkWired className="text-2xl text-[#ED3237]" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-[#ED3237]" role="heading" aria-level={3}>
              Drive the Outcomes Within Your Athlete Network
            </h3>
            <p className="text-gray-700">
              Student-athletes and alumni use the network to connect, share <strong className="text-[#ED3237]">job
              opportunities &amp; availabilities</strong>, and solidifies professional bridges within your
              athlete network.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform transition duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-[#1C315F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaChartLine className="text-2xl text-[#1C315F]" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-[#1C315F]" role="heading" aria-level={3}>
              Drive Engagement With no Internal Effort or Compliance Complexities
            </h3>
            <p className="text-gray-700">
              You get all the upside — visibility, engagement, career impact —
              with <strong className="text-[#ED3237]">zero administrative headache, risk or responsibility.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <FaHandshake className="text-5xl" />
          </div>
          <h2 className="text-4xl font-bold mb-6" role="heading" aria-level={2}>Ready to Partner With Us?</h2>
          <p className="text-xl mb-8">
            Join the growing network of universities supporting their
            athletes&apos; career journeys with zero compliance risk.
          </p>
          <Link
            href={"/contact-us"}
            className="bg-white text-[#1C315F] font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Contact Us Today
          </Link>
        </div>
      </div>
    </div>
  );
}
