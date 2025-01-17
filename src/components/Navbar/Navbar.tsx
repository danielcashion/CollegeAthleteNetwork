import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../public/Logos/CANLogo1200x1200White.png";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-[#1C315F] to-[#3A5F85] text-white">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            className="hover:scale-130 transition-transform duration-300"
            src={Logo.src}
            alt="College Athlete Network"
            width={80}
            height={80}
          />
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <p className="hover:text-gray-300 transition-colors duration-300">
              Home
            </p>
          </Link>
          <Link href="/about-us">
            <p className="hover:text-gray-300 transition-colors duration-300">
              About Us
            </p>
          </Link>
          <Link href="/contact-us">
            <p className="hover:text-gray-300 transition-colors duration-300">
              Contact Us
            </p>
          </Link>
          <Link href="/signup">
            <button className="bg-[#F25C54] text-white px-4 py-2 rounded hover:bg-[#f0807f] transition-colors duration-300">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="hidden md:flex space-x-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook
              className="text-gray-300 hover:text-white transition-colors duration-300"
              size={20}
            />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter
              className="text-gray-300 hover:text-white transition-colors duration-300"
              size={20}
            />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram
              className="text-gray-300 hover:text-white transition-colors duration-300"
              size={20}
            />
          </a>
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
