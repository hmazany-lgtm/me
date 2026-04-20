import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TrainIQ — AI Training Management System",
  description: "Executive AI-powered training organization management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#0a0f1e] text-slate-200 antialiased flex">
        <Sidebar />
        <main className="flex-1 overflow-auto ml-64">{children}</main>
      </body>
    </html>
  );
}
