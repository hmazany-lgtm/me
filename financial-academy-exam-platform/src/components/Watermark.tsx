"use client";
import { useSession } from "@/lib/session";

/**
 * Security watermark for sensitive screens. Tiles the viewer's name, email,
 * timestamp and IP diagonally across the viewport so any screenshot/photo of
 * secure content is traceable to the person who accessed it.
 */
export function Watermark({ children, active = true }: { children: React.ReactNode; active?: boolean }) {
  const { user, ip } = useSession();
  if (!active) return <>{children}</>;
  const stamp = `${user.fullName}  ·  ${user.email}  ·  ${ip}  ·  ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`;
  const tile = Array.from({ length: 6 }, () => stamp).join("      ");
  const watermark = Array.from({ length: 40 }, () => tile).join("\n");
  return (
    <div className="tfa-watermark relative" data-watermark={watermark}>
      {children}
    </div>
  );
}
