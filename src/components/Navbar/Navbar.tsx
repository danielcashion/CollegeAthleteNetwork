import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from "../../../public/Logos/CANLogo1200x1200White.png"

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#1C315F] text-white">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src={Logo.src}
            alt="College Athlete Network"
            width={150}
            height={150}
          />
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex space-x-6">
          <Link href="/">
            <p className="hover:text-gray-300">Home</p>
          </Link>
          <Link href="/about-us">
            <p className="hover:text-gray-300">About Us</p>
          </Link>
          <Link href="/contact-us">
            <p className="hover:text-gray-300">Contact Us</p>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-gray-300 focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
