"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaAngleDown } from "react-icons/fa6";
import { IoMenu, IoClose } from "react-icons/io5";
import Logo from "../../../public/Logos/CANLogo-horizontal-white.png";
import { NavItem, navbarItems } from "../../utils/navbarItems";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleSubMenu = (name: string) =>
    setOpenSubMenus((prev) => ({ ...prev, [name]: !prev[name] }));

  const renderDesktopItem = (item: NavItem) => {
    const commonProps = {
      target: item.target,
      rel: item.target === "_blank" ? "noopener noreferrer" : undefined,
    };

    if (item.type === "link") {
      return (
        <Link key={item.name} href={item.link!} {...commonProps}>
          <p className="hover:text-gray-300 transition-colors duration-300 cursor-pointer">
            {item.name}
          </p>
        </Link>
      );
    }

    if (item.type === "button") {
      return (
        <Link key={item.name} href={item.link!} {...commonProps}>
          <button
            onClick={closeMobileMenu}
            className={`text-white px-4 py-2 rounded transition-colors duration-300 ${
              isScrolled
                ? "bg-[#1C315F] hover:bg-[#f0807f]"
                : "bg-[#F25C54] hover:bg-[#f0807f]"
            }`}
          >
            {item.name}
          </button>
        </Link>
      );
    }

    return (
      <div key={item.name} className="relative group">
        <button className="flex items-center gap-1 hover:text-gray-300 transition-colors duration-300">
          {item.name} <FaAngleDown />
        </button>
        <div className="absolute left-0 w-[200px] bg-[#ED3237]/90 backdrop-blur-md rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-opacity duration-300">
          {item.subItems?.map((sub) => (
            <Link
              key={sub.name}
              href={sub.link!}
              target={sub.target}
              rel={sub.target === "_blank" ? "noopener noreferrer" : undefined}
            >
              <p
                onClick={closeMobileMenu}
                className="block px-4 py-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                {sub.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 z-20 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#ED3237] lg:bg-[#ED3237]/70 lg:backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-2 px-6">
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

        <div className="hidden lg:flex items-center space-x-6 text-lg text-white">
          {navbarItems.map(renderDesktopItem)}
        </div>

        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-300 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <IoClose className="w-6 h-6" />
            ) : (
              <IoMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-[#ffffff44] backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
      />

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[#ED3237] transform transition-transform duration-300 ease-in-out z-30 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start space-y-4 p-6 text-white">
          {navbarItems.map((item) => (
            <div key={item.name} className="w-full">
              {item.subItems && item.subItems.length > 0 ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className="w-full flex items-center justify-between font-medium py-2 hover:text-gray-300 transition-colors duration-300"
                  >
                    <span>{item.name}</span>
                    <FaAngleDown
                      className={`transform transition-transform duration-200 ${
                        openSubMenus[item.name] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`w-full pl-4 space-y-2 overflow-hidden transition-max-height duration-300 ease-in-out ${
                      openSubMenus[item.name] ? "max-h-40" : "max-h-0"
                    }`}
                  >
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.link!}
                        onClick={closeMobileMenu}
                        className="block py-1 hover:text-gray-300 transition-colors duration-300"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.link!}
                  onClick={closeMobileMenu}
                  className="block font-medium py-2 hover:text-gray-300 transition-colors duration-300"
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
