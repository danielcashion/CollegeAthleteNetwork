import Image from "next/image";
import AthletesImage from "../../../public/images/college-athletes-4.jpg";

const OurMission = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-[1060px] flex flex-col items-center">
        <div className="w-full">
          <h2 className="text-5xl text-center font-bold mb-4 small-caps text-[#ED3237]">
            Our Mission
          </h2>
          <p className="text-lg text-center mb-4">
            Our mission is to empower student-athletes by providing them with
            the resources, mentorship, and opportunities they need to excel both
            on and off the field. We are dedicated to bridging the gap between
            collegiate athletics and professional careers, equipping athletes
            with the tools to succeed academically, athletically, and
            professionally.
          </p>
          <p className="text-lg text-center">
            We believe in fostering a community that champions teamwork,
            leadership, and personal growth, ensuring that every student-athlete
            is prepared to thrive in their future endeavors. By connecting
            athletes with alumni and creating a strong support network, we aim
            to build lasting relationships that inspire success and drive
            meaningful impact.
          </p>
        </div>

        <Image
          src={AthletesImage}
          alt="athletes image"
          className="w-full max-w-[600px] rounded-xl mt-8 shadow-lg"
        />
      </div>
    </section>
  );
};

export default OurMission;
