import Image from "next/image";
import OurSolution from "../AboutUsPage/OurSolution";

const AthleteNetworkPageContent = ({ university }: any) => {
  console.log("university meta info: ", university);
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white pb-12 pt-24 flex flex-col items-center px-[10%] sm:px-[20%]">
        <h1 className="text-4xl font-bold mb-4">
          {university.university_name} {university.mascot} Athlete Network
        </h1>
        <p className="text-lg mb-6">
          Connect with student-athletes, alumni, and supporters from{" "}
          {university.university_name}. Discover jobs, professional
          opportunities, and lifelong connections.
        </p>

        <div className="flex gap-2">
          {[
            university.primary_hex,
            university.secondary_hex,
            university.tertiary_hex,
          ].map((hex) => (
            <div
              key={hex}
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Join Network Section */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex">
              <Image
                src={university.logo_url || "/placeholder.svg"}
                alt={`${university.university_name} athlete network`}
                width={600}
                height={500}
                priority
                className="w-full max-w-[300px] sm:max-w-[400px] max-h-[300px] object-contain m-auto"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: university.primary_hex }}>
                Take your proper place in the {university.university_name} {university.mascot} Athlete
                Network!
              </h2>
               <p className="text-lg text-gray-600 leading-relaxed" style={{ color: university.primary_hex }}>
                Connect with thousands of {university.university_name}{" "}
                student-athletes, alumni, and supporters. Access exclusive
                career opportunities, mentorship programs, and networking events
                designed specifically for the athletic community.
              </p>
              <div className="space-y-2"  style={{ color: university.primary_hex }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: university.primary_hex }}
                  />
                  <span className="text-gray-700">
                    Exclusive job postings from alumni-owned companies
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: university.primary_hex }}
                  />
                  <span className="text-gray-700">
                    One-on-one mentorship with successful graduates
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: university.primary_hex }}
                  />
                  <span className="text-gray-700">
                    Networking events and career development workshops
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: university.primary_hex }}
                  />
                  <span className="text-gray-700">
                    Direct connections with recruiters and hiring managers
                  </span>
                </div>
              </div>
              <div className="pt-4">
                <a
                  href="https://members.collegeathletenetwork.org/sign-up"
                  target="_blank"
                  className="inline-block py-3 px-8 rounded-lg text-white font-semibold text-lg transition-all duration-200 hover:opacity-90 hover:transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: university.primary_hex }}
                  rel="noreferrer"
                >
                  Join Now
                </a>
                <p className="text-sm text-gray-500 mt-3">
                  Already a member?{" "}
                  <a
                    href="https://members.collegeathletenetwork.org/login"
                    target="_blank"
                    className="underline"
                    style={{ color: university.primary_hex }}
                    rel="noreferrer"
                  >
                    Sign in here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"  style={{ color: university.primary_hex }}>
              {university.university_name} {university.mascot} by the Numbers
            </h2>
            <p className="text-lg text-gray-600">
              Join a thriving community of student-athletes and alumni
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start justify-center gap-8">
            {university.num_teams && university.num_teams > 0 && (
              <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <div
                  className="text-4xl lg:text-5xl font-bold mb-2"
                  style={{ color: university.primary_hex }}
                >
                  {university.num_teams}
                </div>
                <div className="text-gray-600 text-lg font-medium">
                  Athletic Teams
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Representing excellence across multiple sports
                </p>
              </div>
            )}

            {university.num_rosters && university.num_rosters > 0 && (
              <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <div
                  className="text-4xl lg:text-5xl font-bold mb-2"
                  style={{ color: university.primary_hex }}
                >
                  {university.num_rosters}
                </div>
                <div className="text-gray-600 text-lg font-medium">
                  Active Rosters
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Current team rosters across all sports
                </p>
              </div>
            )}

            {university.num_athletes && university.num_athletes > 0 && (
              <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <div
                  className="text-4xl lg:text-5xl font-bold mb-2"
                  style={{ color: university.primary_hex }}
                >
                  {university.num_athletes.toLocaleString()}
                </div>
                <div className="text-gray-600 text-lg font-medium">
                  Student-Athletes
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Past and present athletes in our network
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"  style={{ color: university.primary_hex }}>
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to unlock your athletic network potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                style={{ backgroundColor: university.primary_hex }}
              >
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Claim Your Spot
              </h3>
              <p className="text-gray-600">
                Claim your spot on your roster. Confirm your professional profile highlighting your
                athletic achievements and career goals.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                style={{ backgroundColor: university.primary_hex }}
              >
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Connect & Network
              </h3>
              <p className="text-gray-600">
                Connect with alumni, current athletes, and industry
                professionals from your university network.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                style={{ backgroundColor: university.primary_hex }}
              >
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Unlock Opportunities
              </h3>
              <p className="text-gray-600">
                Access exclusive job postings, mentorship programs, and career
                development resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      <OurSolution />

      {/* Features Section */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Exclusive Network Benefits
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to transition from student-athlete to
              professional success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="p-6 bg-white rounded-xl shadow-lg border-l-4"
              style={{ borderLeftColor: university.primary_hex }}
            >
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${university.primary_hex}20` }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: university.primary_hex }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Mentorship Programs
              </h3>
              <p className="text-gray-600">
                Get paired with successful alumni who understand your athletic
                background and career aspirations.
              </p>
            </div>

            <div
              className="p-6 bg-white rounded-xl shadow-lg border-l-4"
              style={{ borderLeftColor: university.primary_hex }}
            >
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${university.primary_hex}20` }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: university.primary_hex }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Exclusive Job Board
              </h3>
              <p className="text-gray-600">
                Access job opportunities specifically posted for{" "}
                {university.university_name} athletes by alumni employers.
              </p>
            </div>

            <div
              className="p-6 bg-white rounded-xl shadow-lg border-l-4"
              style={{ borderLeftColor: university.primary_hex }}
            >
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${university.primary_hex}20` }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: university.primary_hex }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Career Development
              </h3>
              <p className="text-gray-600">
                Attend workshops, webinars, and training sessions designed to
                help athletes transition to professional careers.
              </p>
            </div>

            <div
              className="p-6 bg-white rounded-xl shadow-lg border-l-4"
              style={{ borderLeftColor: university.primary_hex }}
            >
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${university.primary_hex}20` }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: university.primary_hex }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Networking Events
              </h3>
              <p className="text-gray-600">
                Join virtual and in-person events to connect with fellow
                athletes and industry professionals.
              </p>
            </div>

            <div
              className="p-6 bg-white rounded-xl shadow-lg border-l-4"
              style={{ borderLeftColor: university.primary_hex }}
            >
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${university.primary_hex}20` }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: university.primary_hex }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Skills Development
              </h3>
              <p className="text-gray-600">
                Access resources to develop professional skills that complement
                your athletic experience and leadership abilities.
              </p>
            </div>

            <div
              className="p-6 bg-white rounded-xl shadow-lg border-l-4"
              style={{ borderLeftColor: university.primary_hex }}
            >
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${university.primary_hex}20` }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: university.primary_hex }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5zM15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Alumni Support
              </h3>
              <p className="text-gray-600">
                Connect directly with {university.university_name} alumni who
                are eager to help fellow athletes succeed in their careers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Join the{" "}
            <a href={university.base_url || "#"} target="_blank">
              {university.university_name} Athlete Network?
            </a>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Take the next step in your career journey. Connect with thousands of{" "}
            {university.university_name} athletes and alumni who are ready to
            help you succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://members.collegeathletenetwork.org/sign-up"
              target="_blank"
              className="inline-block py-4 px-8 rounded-lg text-white font-semibold text-lg transition-all duration-200 hover:opacity-90 hover:transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: university.primary_hex }}
              rel="noreferrer"
            >
              Join the Network Today
            </a>
            <a
              href="https://members.collegeathletenetwork.org/login"
              target="_blank"
              className="inline-block py-4 px-8 rounded-lg border-2 font-semibold text-lg transition-all duration-200 hover:opacity-90"
              style={{
                borderColor: university.primary_hex,
                color: university.primary_hex,
              }}
              rel="noreferrer"
            >
              Sign In
            </a>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              Join over 101,000+ student-athletes already in The College Athlete
              Network
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AthleteNetworkPageContent;
