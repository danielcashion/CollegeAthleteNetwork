import Link from "next/link";

const CantFindJob = () => {
  return (
    <div className="w-full flex px-4 mb-10">
      <div className="container mx-auto rounded-2xl bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white p-10 flex flex-col items-center justify-center gap-4">
        <h3 className="text-3xl font-bold">Can&apos;t find your Role?</h3>
        <p className="text-lg">
          Let us know if you&apos;re a great fit — We&apos;re always looking for
          talent
        </p>
        <Link
          href={"/contact-us"}
          className="bg-white py-2 px-6 text-lg text-center rounded-lg text-black hover:bg-transparent hover:text-white transitions duration-200"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
};

export default CantFindJob;
