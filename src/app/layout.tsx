import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { NextWebVitalsMetric } from 'next/app';

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
  description: "Generating your network for teams and employers",
  keywords:
    "college athletes, universities, sports recruitment, athlete network",
  openGraph: {
    title: "College Athlete Network",
    description:
      "Connect with college athletes, universities and opportunities across the nation",
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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
  // You can send this data to your analytics service
}
