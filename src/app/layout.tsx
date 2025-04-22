import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { NextWebVitalsMetric } from 'next/app';
import LogUserIP from "@/components/UserAudit/LogUserIP";

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
        <Navbar />
        {children}
        <Footer />
        <LogUserIP />
      </body>
    </html>
  );
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
}
