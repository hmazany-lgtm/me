import { NextResponse } from "next/server";
import { alerts } from "@/lib/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const centerId = searchParams.get("centerId");
  const type = searchParams.get("type");
  const severity = searchParams.get("severity");
  const unreadOnly = searchParams.get("unreadOnly");

  let result = alerts;
  if (centerId) result = result.filter((a) => a.centerId === centerId);
  if (type) result = result.filter((a) => a.type === type);
  if (severity) result = result.filter((a) => a.severity === severity);
  if (unreadOnly === "true") result = result.filter((a) => !a.isRead);

  return NextResponse.json({ data: result, total: result.length });
}
