import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { InstitutionProvider } from "../lib/institution-context";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SPORTRISE (खेल उत्थान) | Grassroots Indian Youth Sports & School/College Event Management",
  description:
    "Digitizing athlete profiles, Olympic rulebook guidance, AI scorecard verification, and multi-match verified athlete rankings for school and college events across India.",
  keywords: [
    "SportRise",
    "Khelo India",
    "School Events",
    "College Tournaments",
    "Sports Authority of India",
    "Athlete ID",
    "Olympic Sports",
    "AI Scorecard Verification",
    "Multi-Match Rankings",
    "Event Management",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased`}>
        <AuthProvider>
          <InstitutionProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </InstitutionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
