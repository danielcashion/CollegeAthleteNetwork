"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

import Logo from "../../../public/Logos/CANLogo-horizontal-white.png";
import { MdOutlineLogout } from "react-icons/md";

const Navbar: React.FC = () => {
  const { data: session } = useSession();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (session) {
      console.log("Sesssion user: ", session);
    }
  }, [session]);

  // Handlers for dropdown visibility on hover
  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

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
          <Link href="/">
            <Image
              className="hover:scale-110 transition-transform duration-300 object-contain"
              src={Logo.src}
              priority
              alt="College Athlete Network"
              width={200}
              height={200}
            />
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="hidden lg:flex items-center space-x-6 text-lg text-white">
          <Link href="/">
            <p className="hover:text-gray-300 transition-colors duration-300">
              Home
            </p>
          </Link>
          <Link href="/sample-data">
            <p className="hover:text-gray-300 transition-colors duration-300">
              Sample Data
            </p>
          </Link>
          <Link href="/about-us">
            <p className="hover:text-gray-300 transition-colors duration-300">
              About Us
            </p>
          </Link>
          <Link href="/corporate-partners">
            <p className="hover:text-gray-300 transition-colors duration-300">
              Corporate Partners
            </p>
          </Link>
          <Link href="/contact-us">
            <p className="hover:text-gray-300 transition-colors duration-300">
              Contact Us
            </p>
          </Link>
          {session && (
            // Wrap the profile image in a container that listens for hover events.
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={(session.user as any).picture}
                alt="user"
                width={45}
                height={45}
                className="object-cover rounded-full cursor-pointer"
                unoptimized
              />
              {showDropdown && (
                <div className="pt-2">
                  <div className="absolute right-0 w-48 bg-white text-black rounded shadow-lg py-2">
                    <p className="px-4 font-medium">
                      {(session.user as any).name}
                    </p>
                    <p className="px-4 text-sm">
                      {(session.user as any).email}
                    </p>
                    <button
                      onClick={() => signOut()}
                      className="mt-2 text-sm w-full text-left px-4 py-1 hover:bg-gray-200"
                    >
                      <div className="flex flex-row items-center gap-2">
                        <MdOutlineLogout size={20} />
                        Sign Out
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* <Link href="/signup">
            <button
              className={`text-white px-4 py-2 rounded transition-colors duration-300 ${
                isScrolled
                  ? "bg-[#1C315F] hover:bg-[#f0807f]"
                  : "bg-[#F25C54] hover:bg-[#f0807f]"
              }`}
            >
              Sign Up
            </button>
          </Link> */}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-300 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              // Close Icon
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
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
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#ED3237] transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } z-30 lg:hidden`}
      >
        <div className="flex flex-col items-start space-y-4 p-6">
          <Link href="/">
            <p
              onClick={closeMobileMenu}
              className="text-white text-lg hover:text-gray-300 transition-colors duration-300 cursor-pointer"
            >
              Home
            </p>
          </Link>
          <Link href="/sample-data">
            <p
              onClick={closeMobileMenu}
              className="text-white text-lg hover:text-gray-300 transition-colors duration-300 cursor-pointer"
            >
              Sample Data
            </p>
          </Link>
          <Link href="/about-us">
            <p
              onClick={closeMobileMenu}
              className="text-white text-lg hover:text-gray-300 transition-colors duration-300 cursor-pointer"
            >
              About Us
            </p>
          </Link>
          <Link href="/corporate-partners">
            <p
              onClick={closeMobileMenu}
              className="text-white text-lg hover:text-gray-300 transition-colors duration-300 cursor-pointer"
            >
              Corporate Partners
            </p>
          </Link>
          <Link href="/contact-us">
            <p
              onClick={closeMobileMenu}
              className="text-white text-lg hover:text-gray-300 transition-colors duration-300 cursor-pointer"
            >
              Contact Us
            </p>
          </Link>
          {/* <Link href="/signup">
            <button
              onClick={closeMobileMenu}
              className={`text-white px-4 py-2 rounded transition-colors duration-300 ${
                isScrolled
                  ? "bg-[#1C315F] hover:bg-[#f0807f]"
                  : "bg-[#F25C54] hover:bg-[#f0807f]"
              }`}
            >
              Sign Up
            </button>
          </Link> */}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
