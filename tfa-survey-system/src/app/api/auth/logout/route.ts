export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { buildClearCookie } from "@/lib/auth";

export async function POST() {
  return NextResponse.json(
    { success: true },
    { headers: { "Set-Cookie": buildClearCookie() } }
  );
}
