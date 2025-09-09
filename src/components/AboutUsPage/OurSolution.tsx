import { FaNetworkWired, FaFilter } from "react-icons/fa";

const OurSolution = () => {
  return (
    <section className="bg-[#1C315F] py-16 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('../../public/images/college-athletes-4.jpg')] opacity-5 bg-cover bg-center" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-12 text-white small-caps tracking-wider">
            Our Solutions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-[#1c315f]/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-[#ED3237]/50 transition-all duration-300">
              <div className="flex items-start mb-4 space-x-3">
                <FaNetworkWired className="w-7 h-7 min-w-7 min-h-7 text-[#ED3237] mt-1" />
                <h3 className="font-bold text-2xl text-[#ED3237]">
                  Dynamic Networking
                </h3>
              </div>
              <p className="text-xl mt-2">
                Empower connections with a insightful networking platform
                designed to bring athletes, coaches, and job opportunities
                together quickly & easily.
              </p>
            </div>

            <div className="bg-[#1c315f]/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-[#ED3237]/50 transition-all duration-300">
              <div className="flex items-start mb-4 space-x-3">
                <FaFilter className="w-7 h-7 min-w-7 min-h-7 text-[#ED3237] mt-1" />
                <h3 className="font-bold text-2xl text-[#ED3237]">
                  Advanced Search
                </h3>
              </div>
              <p className="text-xl mt-2">
                  Utilize filtering by city, state, industry, sport, 
                company, industry, graduation year, etc., to find the best
                people within your Universities Network for your next big role.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurSolution;
