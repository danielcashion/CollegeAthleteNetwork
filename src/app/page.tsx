//import CANLogo from "/public/Logos/CANLogo1200x1200.png";
import Image from "next/image";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Logo from "../../public/Logos/CANLogo1200x1200.png";

export default function Home() {
  return (
    <div>
      <div>
        <Navbar />
        <div className="flex flex-col">
          <h1 className="mx-auto text-6xl text-[#ED3237] mt-10"> Coming Soon!</h1>
          <Image
            className="mx-auto"
            src={Logo.src}
            alt="College Athlete Network"
            width={600}
            height={600}
          />
        </div>

        {/* <Image src={CANLogo.src} alt="College Athlete Network"/> */}
      </div>
      <Footer />
    </div>
  );
}
