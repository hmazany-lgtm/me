import { NextResponse } from "next/server";
import { centers } from "@/lib/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const status = searchParams.get("status");

  let result = centers;
  if (region) result = result.filter((c) => c.region === region);
  if (status) result = result.filter((c) => c.status === status);

  return NextResponse.json({ data: result, total: result.length });
}
