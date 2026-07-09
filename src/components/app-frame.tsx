
import { usePathname, useRouter } from "@/lib/router";
import { useEffect, useState } from "react";
import { useAuth } from "./providers";
import { AppShell } from "./shell";

const PUBLIC_ROUTES = ["/", "/login"];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isPublic && !user) {
      router.replace("/login");
    }
  }, [mounted, isPublic, user, router]);

  if (isPublic) return <>{children}</>;

  if (!mounted || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
