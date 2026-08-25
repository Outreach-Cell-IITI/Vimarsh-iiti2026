"use client";

import Image from "next/image";
import { useState } from "react";

const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "People", id: "people" },
  { label: "Events", id: "events" },
  { label: "Institute Colloquium", id: "colloquium" },
  { label: "Departmental Outreach", id: "outreach" },
];

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const HEADER_HEIGHT = 80;

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });

    setActiveSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 py-3 md:px-8 md:py-4">
          {/* Left Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/pics/IITI-logo.png"
              alt="IIT Indore Logo"
              width={50}
              height={50}
              priority
              className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain transition-transform hover:scale-110 duration-300"
            />
          </div>

          {/* Title */}
          <div className="flex-grow text-left px-2 sm:px-4">
            <h1 className="text-sm sm:text-lg md:text-xl lg:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
              Institute Seminars and Outreach
            </h1>
            <div className="h-0.5 bg-black w-full max-w-md my-2" />{" "}
            <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
              Indian Institute of Technology Indore
            </p>
          </div>

          {/* Right Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/pics/vimarsh.png"
              alt="Vimarsh Logo"
              width={50}
              height={50}
              priority
              className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain transition-transform hover:scale-110 duration-300"
            />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden ml-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative w-full">
        <section className="relative w-full h-[calc(100vh-72px)] sm:h-[calc(100vh-80px)] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/pics/Home.png"
              alt="IIT Indore Abhinandan Bhavan"
              fill
              priority
              className="object-cover sm:object-cover object-center w-full h-full"
              sizes="100vw"
            />
            <div className="absolute inset-0" />
          </div>

          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block absolute right-0 top-0 h-full z-30">
            <nav className="  shadow-sm h-full w-184 ">
              <ul className="flex flex-row py-2 pointer-cursor">
                {navItems.map((item) => (
                  <li key={item.id} className="group">
                    <button
                      onClick={() => handleScroll(item.id)}
                      className={`w-full text-left px-6 py-4 font-semibold transition-all cursor-pointer duration-300 ease-in-out  ${
                        activeSection === item.id
                          ? " text-blue-700 border-blue-600"
                          : "text-gray-700  hover:bg-gray-50 hover:border-gray-100"
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Mobile Navigation Dropdown */}
          <div
            className={`lg:hidden fixed top-26 right-0 h-[calc(100vh-80px)] w-64 bg-gray-100 shadow-xl z-50 transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <nav className="max-h-[calc(100vh-80px)] overflow-y-auto">
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li key={item.id} className="group">
                    <button
                      onClick={() => handleScroll(item.id)}
                      className={`w-full text-left px-6 py-4 cursor-pointer font-semibold transition-all duration-200 border-l-4 ${
                        activeSection === item.id
                          ? "bg-blue-50 text-blue-700 text-lg cursor-pointer border-blue-600"
                          : "text-gray-700 border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
