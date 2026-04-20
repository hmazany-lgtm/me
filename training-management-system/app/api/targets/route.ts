import { NextResponse } from "next/server";
import { targets } from "@/lib/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const centerId = searchParams.get("centerId");
  const status = searchParams.get("status");

  let result = targets;
  if (centerId) result = result.filter((t) => t.centerId === centerId);
  if (status) result = result.filter((t) => t.status === status);

  return NextResponse.json({ data: result, total: result.length });
}
