import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TFA Training Landscape Study 2025 | الأكاديمية المالية",
  description:
    "Shape the future of financial training in Saudi Arabia. Participate in the TFA 2025 Training Landscape Study.",
  keywords: ["TFA", "Financial Academy", "Training", "Saudi Arabia", "Survey"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
