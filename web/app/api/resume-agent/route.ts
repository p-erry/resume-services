import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { tool } from "ai";

export const runtime = "edge";

const parseIntake = tool({
  description: "Normalize raw resume intake into a canonical profile object.",
  parameters: z.object({
    raw: z.any(),
  }),
  execute: async ({ raw }) => {
    return {
      name: raw?.name ?? null,
      location: raw?.location ?? null,
      targetTitle: raw?.targetTitle ?? raw?.desiredTitle ?? null,
      experience: raw?.experience ?? [],
      education: raw?.education ?? [],
      skills: raw?.skills ?? [],
    };
  },
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4.1-mini"),
    system: [
      "You are Resume Righting, a senior resume operator.",
      "You do not write generic resumes.",
      "You ask only the highest leverage follow up questions, max five.",
      "If the user provides intake JSON, call parseIntake, then summarize what you understood, then ask for missing essentials.",
    ].join(" "),
    messages,
    tools: { parseIntake },
    maxSteps: 6,
  });

  return result.toDataStreamResponse();
}
