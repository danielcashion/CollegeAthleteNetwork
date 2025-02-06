// Navbar.tsx
"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { GoogleOneTapContext } from "@/providers/GoogleOneTapProvider";
import Logo from "../../../public/Logos/CANLogo-horizontal-white.png";
import { MdOutlineLogout } from "react-icons/md";

interface CustomUser {
  id: string;
  member_id: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
  role: string;
}

interface CustomSession {
  user: CustomUser;
  expires: string;
}

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const { triggerOneTap } = useContext(GoogleOneTapContext);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSession, setActiveSession] = useState<CustomSession | null>(
    null
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (session) {
      console.log("Session user: ", session);
      setActiveSession(session as CustomSession);
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
          {activeSession ? (
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={activeSession.user.picture}
                alt="user"
                width={45}
                height={45}
                className="object-cover rounded-full cursor-pointer"
                unoptimized
              />
              {showDropdown && (
                <div className="pt-2">
                  <div className="absolute right-0 w-[220px] bg-white text-black rounded shadow-lg py-2">
                    <p className="px-4 font-medium line-clamp-1">
                      {activeSession.user.name}
                    </p>
                    <p className="px-4 text-sm line-clamp-1">
                      {activeSession.user.email}
                    </p>
                    <button
                      onClick={() => signOut()}
                      className="mt-2 text-sm w-full text-left px-4 py-1"
                    >
                      <div className="bg-gradient-to-br from-[#1C315F] to-[#ED3237] text-white p-2 rounded flex flex-row items-center gap-2">
                        <MdOutlineLogout size={20} />
                        Sign Out
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={triggerOneTap}
              className="py-[6px] px-6 rounded bg-[#1C315F] text-white"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-300 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
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
