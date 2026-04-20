import { NextResponse } from "next/server";
import { programs } from "@/lib/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const centerId = searchParams.get("centerId");
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  let result = programs;
  if (centerId) result = result.filter((p) => p.centerId === centerId);
  if (status) result = result.filter((p) => p.status === status);
  if (category) result = result.filter((p) => p.category === category);

  return NextResponse.json({ data: result, total: result.length });
}
