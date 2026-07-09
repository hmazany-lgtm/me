import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppFrame } from "@/components/app-frame";

export const metadata: Metadata = {
  title: "مصطفى | Mustafa – Virtual Trainee Engagement Agent",
  description:
    "Mustafa is an intelligent virtual trainee for The Financial Academy — enriching online training sessions, activating participation, and supporting trainers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
