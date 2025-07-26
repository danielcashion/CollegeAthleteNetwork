import React from 'react'; // Add this if required by your setup
import CountUp from '../common/Countup';

const OurImpact = () => {
  // const formatNumber = (value) => {
  //   return value.toLocaleString('en-US');
  // };

  // const formatPercentage = (value) => {
  //   return `${value.toFixed(1)}%`;
  // };

  return (
    <section className="bg-gray-200 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold mb-8 text-center text-[#1C315F] small-caps">
          By The Numbers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-5xl font-bold text-blue-600 mb-2">
              <CountUp end={131900} suffix="+" />
            </h3>
            <p className="text-2xl">Athletes Connected</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-5xl font-bold text-blue-600 mb-2">
              <CountUp end={11} />
            </h3>
            <p className="text-2xl">Universities Athletic Programs Currently Covered</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-5xl font-bold text-blue-600 mb-2">
              <CountUp end={97.1} />
            </h3>
            <p className="text-2xl">Athletes Mapped to LinkedIn Profiles</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurImpact;
