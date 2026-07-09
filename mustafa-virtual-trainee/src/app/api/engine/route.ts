import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai/provider";
import type { EngineInput } from "@/lib/types";

// POST /api/engine — returns Mustafa's engagement suggestions for the given
// session context. Uses the configured AI provider (deterministic engine by
// default; hosted model if an API key is present).
export async function POST(req: Request) {
  try {
    const input = (await req.json()) as EngineInput;
    if (!input?.programme) {
      return NextResponse.json({ error: "programme is required" }, { status: 400 });
    }
    const provider = getProvider();
    const result = await provider.generate(input);
    return NextResponse.json({ provider: provider.name, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: "engine_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
