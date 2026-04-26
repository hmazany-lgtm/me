export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  return NextResponse.json({
    user: { id: user.sub, name: user.name, email: user.email, role: user.role },
  });
}
