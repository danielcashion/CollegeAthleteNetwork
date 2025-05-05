import Image from "next/image";
import CANColorLogo from "../../../public/Logos/CANLogo1200X1200Color.png";

const OurStory = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-[1060px] flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0 flex">
          <Image
            src={CANColorLogo}
            alt="college athlete network logo"
            width={400}
            height={200}
            className="mx-auto"
          />
        </div>
        <div className="md:w-1/2 md:pl-8">
          {/* <h2 className="text-5xl font-bold mb-4 small-caps text-[#ED3237] text-center md:text-left">
            Join Us!
          </h2> */}
          <p className="text-xl mb-4 text-[#1C315F] text-center md:text-right">
            At The College Athlete Network, we&apos;re not just building a
            platform — we’re building a movement. Our mission is to transform
            the way college athletes navigate their lives after sports by giving
            them the connections, opportunities, and recognition they deserve.
            If you&apos;re passionate about doing something impactful  and 
            helping athletes and universities build their legacy, you belong
            here.
          </p>
          <p className="text-xl text-[#1C315F] text-center md:text-right">
            We&apos;re a purpose-driven team of builders, thinkers, and former
            athletes who understand the power of personal connections. Every day, we work
            to unlock career opportunities for student-athletes and alumni by making
            professional networks more accessible and tailored to their unique
            universities. When you join us, you&apos;re not just taking a job —
            you&apos;re joining a cause that helps talented individuals thrive
            long after the final whistle.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
