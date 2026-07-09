import type { EngineInput, EngineResult } from "../types";
import { runEngine } from "./engine";
import { MUSTAFA_SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

// ---------------------------------------------------------------------------
// AI provider abstraction.
//
// The product ships with a deterministic engine that runs with zero external
// dependencies (great for demos and offline use). If an API key is present,
// this layer is where a Claude / OpenAI-compatible call would be wired in.
// The interface is intentionally provider-agnostic.
// ---------------------------------------------------------------------------

export interface AIProvider {
  name: string;
  generate(input: EngineInput): Promise<EngineResult>;
}

// Default provider: local deterministic engine.
export const localProvider: AIProvider = {
  name: "local-engine",
  async generate(input) {
    return runEngine(input);
  },
};

// Example scaffold for a hosted model (Claude-compatible). Not called unless a
// key is configured; kept here to document the integration point.
export const hostedProvider: AIProvider = {
  name: "hosted-model",
  async generate(input) {
    const apiKey = import.meta.env?.VITE_AI_API_KEY;
    if (!apiKey) return runEngine(input);
    // Integration point:
    //   const res = await fetch("https://api.anthropic.com/v1/messages", {
    //     method: "POST",
    //     headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    //     body: JSON.stringify({
    //       model: "claude-opus-4-8",
    //       max_tokens: 1024,
    //       system: MUSTAFA_SYSTEM_PROMPT,
    //       messages: [{ role: "user", content: buildUserPrompt(input) }],
    //     }),
    //   });
    // Parse JSON interventions and merge with engine scoring.
    // For now we fall back to the deterministic engine (with the same framing).
    void MUSTAFA_SYSTEM_PROMPT;
    void buildUserPrompt;
    return runEngine(input);
  },
};

export function getProvider(): AIProvider {
  const key = import.meta.env?.VITE_AI_API_KEY;
  return key ? hostedProvider : localProvider;
}
