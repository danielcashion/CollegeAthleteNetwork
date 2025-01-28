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
          <h2 className="text-5xl font-bold mb-4 small-caps text-[#ED3237] text-center md:text-left">
            Our Story
          </h2>
          <p className="text-lg mb-4 text-center md:text-left">
            At The College Athlete Network, we believe in empowering college
            athletes to succeed beyond the field, court, or track. Our journey
            began when we noticed a glaring problem: universities were relying
            on outdated, manual processes to connect their athletes with alumni
            for career opportunities.
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
    </section>
  );
};

export default OurStory;
