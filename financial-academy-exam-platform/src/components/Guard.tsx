"use client";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";
import type { PermissionKey } from "@/lib/types";
import { Restricted } from "./ui";

/**
 * Wraps a screen (or section) that requires a permission. If the active role
 * lacks it, a restricted placeholder is shown instead of the sensitive content.
 */
export function Guard({ perm, children, message }: { perm: PermissionKey; children: React.ReactNode; message?: string }) {
  const { user } = useSession();
  if (!can(user.roleKey, perm)) {
    return <Restricted message={message} />;
  }
  return <>{children}</>;
}
