// import Image from "next/image";
import "../styles/customStyles.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
// import Logo from "../../public/Logos/CANLogo1200x1200White.png";

export default function Home() {
  return (
    <div className="bg-[#CCCBCB] min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white text-center py-12">
          <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Powering College Athletes Networks
            </h1>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              By Providing their Data Needs
            </h1>
            <p className="text-lg md:text-2xl font-light">
              Your School&apos;s Current & Historic Athletic Team Rosters,
              merged with updated LinkedIn Experience Data. You building a
              Stronger School Network.
            </p>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#ED3237] tracking-wider small-caps">
            What Do We Do?
          </h2>
          <p className="text-justify text-xl leading-relaxed text-[#1C315F]">
            We bridge the gap between athlete rosters and professional networks.
            By sourcing college roster data from public platforms, researching
            and linking athletes&apos; LinkedIn profiles, and merging this
            information into a single, curated database, we provide partner
            universities with an up-to-date knowledge base of their athlete
            network. Our platform tracks the geographical locations and
            professional journeys (past and present) of your college athletes,
            creating a living map of their careers.
          </p>
          {/* <Image
            src="/images/athlete-network.jpg" // Replace with actual image path
            alt="Athlete Network"
            className="rounded-lg shadow-lg mx-auto"
            width={800}
            height={400}
          /> */}
        </section>

        {/* Why Is It Hard? Section */}
        <section className="bg-[#1C315F] py-12 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#ED3237] small-caps">
              Why Is It Hard?
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              Athletes change jobs frequently—on average, every 3.1 years in the
              first 15 years after graduation. For a network of 225 athletes,
              this means tracking and updating data for around 70 individuals
              annually.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-2 text-[#ED3237] ">
                  If You&apos;re Using a Spreadsheet:
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>It quickly becomes outdated.</li>
                  <li>
                    Confusion arises from multiple versions of the same
                    document.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-[#ED3237]">
                  If You&apos;re Using a Generic App:
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Most vendors leave data management to the school.</li>
                  <li>But staying up to date is the hardest part!</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Network Section */}
        <section className="py-12 bg-gradient-to-r from-[#ED3237] to-[#1C315F] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 small-caps">
              Build a Unified, Enduring Athlete Network
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              Our platform connects athletes across all sports at your
              university, creating a robust, institution-wide professional
              network. Here&apos;s why this matters:
            </p>
            <ul className="list-disc list-inside text-left max-w-3xl mx-auto">
              <li>
                <strong>Resilience:</strong> Coaches come and go, but your
                school&apos;s network remains intact and growing.
              </li>
              <li>
                <strong>Cross-Sport Connections:</strong> Athletes connect with
                peers and alumni from other sports, unlocking mentorship and
                career opportunities.
              </li>
              <li>
                <strong>Institutional Memory:</strong> Your school—not an
                individual—owns the data, ensuring long-term benefits.
              </li>
            </ul>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#ED3237] small-caps">
            Why Choose College Athlete Network?
          </h2>
          <p className="text-lg leading-relaxed mb-8 text-[#1C315F] text-center">
            Maintaining athlete data is a time-consuming, complex challenge that
            demands specialized skills and effort. That&apos;s where we come in:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-bold text-xl mb-2 text-[#ED3237]">
                Decades of Expertise
              </h3>
              <p style={{ color: "#1C315F", textAlign: "center" }}>
                With 30 years of experience, we&apos;ve perfected the art of
                data curation.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-2 text-[#ED3237]">
                Proven Algorithms
              </h3>
              <p style={{ color: "#1C315F" }}>
                Our advanced algorithms ensure your network stays accurate and
                up-to-date.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-2 text-[#ED3237]">
                Effortless Access
              </h3>
              <p style={{ color: "#1C315F" }}>
                We deliver critical information in a simple, user-friendly
                format.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
