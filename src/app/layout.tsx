import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { NextWebVitalsMetric } from "next/app";
import LogUserIP from "@/components/UserAudit/LogUserIP";
import CanVideoModal from "@/components/Modals/CanVideoModal";
import GoogleAnalyticsClient from "@/components/GoogleAnalytics/GoogleAnalyticsClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The College Athlete Network",
  description:
    "Generating your school&apos;s network for athletes and employers",
  keywords:
    "college athletes, athlete recruitment, athlete network, college sports, college recruitment, college athlete network, college athlete recruitment",
  openGraph: {
    title: "The College Athlete Network",
    description:
      "We power the athletes, alumns, and professional opportunities network for college Athletic Programs.",
    type: "website",
    locale: "en_US",
    url: "https://www.collegeathletenetwork.org",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip Links for Accessibility */}
        <nav aria-label="Skip links">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:bg-[#ED3237] focus:text-white focus:rounded focus:p-2 focus:z-50" tabIndex={0}>
            Skip to Main Content
          </a>
          <a href="#site-navigation" className="sr-only focus:not-sr-only focus:bg-[#ED3237] focus:text-white focus:rounded focus:p-2 focus:z-50" tabIndex={0}>
            Skip to Navigation
          </a>
          <a href="#site-footer" className="sr-only focus:not-sr-only focus:bg-[#ED3237] focus:text-white focus:rounded focus:p-2 focus:z-50" tabIndex={0}>
            Skip to Footer
          </a>
        </nav>
  <nav id="site-navigation" aria-label="Site navigation" tabIndex={-1}>
    <Navbar />
  </nav>
        <main id="main-content" aria-label="Main content" role="main">{children}</main>
        <footer id="site-footer" aria-label="Site footer" role="contentinfo">
          <Footer />
        </footer>
        <CanVideoModal />
        <LogUserIP />
        <Analytics />
        <GoogleAnalyticsClient />
        {/* WebKit/Safari/Chrome skip link focus fix */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                document.querySelectorAll('a[href^="#"]').forEach(function(link) {
                  link.addEventListener('click', function(e) {
                    var target = document.getElementById(this.getAttribute('href').substring(1));
                    if (target) {
                      target.setAttribute('tabindex', '-1');
                      target.focus();
                    }
                  });
                });
              });
            `,
          }}
        />
      </body>
    </html>
  );
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
}
