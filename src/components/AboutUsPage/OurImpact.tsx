import CountUp from "../common/Countup";

const OurImpact = () => {
  return (
    <section className="bg-gray-200 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold mb-8 text-center text-[#1C315F] small-caps">
          Our Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-5xl font-bold text-blue-600 mb-2">
              <CountUp end={1000} suffix="+" />
            </h3>
            <p className="text-2xl">Athletes Connected</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-5xl font-bold text-blue-600 mb-2">
              <CountUp end={50} suffix="+" />
            </h3>
            <p className="text-2xl">Partner Universities</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-5xl font-bold text-blue-600 mb-2">
              <CountUp end={91} suffix="%" />
            </h3>
            <p className="text-2xl">Career Placement Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurImpact;
