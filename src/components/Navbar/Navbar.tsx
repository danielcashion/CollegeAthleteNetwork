"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../public/Logos/CANLogo-horizontal-white.png";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 z-20 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#ED3237]/70 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-2 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            className="hover:scale-110 transition-transform duration-300 object-contain"
            src={Logo.src}
            priority
            alt="College Athlete Network"
            width={200}
            height={200}
          />
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-6 text-lg text-white">
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
            <button
              className={`text-white px-4 py-2 rounded  transition-colors duration-300 ${
                isScrolled
                  ? "bg-[#1C315F] hover:bg-[#f0807f]"
                  : "bg-[#F25C54] hover:bg-[#f0807f]"
              }`}
            >
              Sign Up
            </button>
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="hidden md:flex space-x-4">
          <a href="#" rel="noopener noreferrer">
            <FaFacebook
              className="text-gray-300 hover:text-white transition-colors duration-300"
              size={25}
            />
          </a>
          <a href="#" rel="noopener noreferrer">
            <FaTwitter
              className="text-gray-300 hover:text-white transition-colors duration-300"
              size={25}
            />
          </a>
          <a href="#" rel="noopener noreferrer">
            <FaInstagram
              className="text-gray-300 hover:text-white transition-colors duration-300"
              size={25}
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
