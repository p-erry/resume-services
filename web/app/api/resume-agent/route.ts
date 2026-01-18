import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { tool } from "ai";

export const runtime = "nodejs";

type IntakePayload = {
  name: string;
  location: { city: string; state: string; zip: string };
  desiredTitle: string;
  desiredSalaryRange: string;
  currentRole: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    highlights: string[];
  };
  priorRoles: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }>;
  education: string;
  certifications: string;
  skillsAndPlatforms: string;
  targetJobUrl: string;
};

const parseIntake = tool({
  description: "Normalize raw resume intake JSON into the canonical Resume Righting intake shape.",
  parameters: z.object({
    raw: z.any(),
  }),
  run: async ({ raw }) => {
    const intake: IntakePayload = {
      name: String(raw?.name || "").trim(),
      location: {
        city: String(raw?.location?.city || "").trim(),
        state: String(raw?.location?.state || "").trim(),
        zip: String(raw?.location?.zip || "").trim(),
      },
      desiredTitle: String(raw?.desiredTitle || "").trim(),
      desiredSalaryRange: String(raw?.desiredSalaryRange || "").trim(),
      currentRole: {
        title: String(raw?.currentRole?.title || "").trim(),
        company: String(raw?.currentRole?.company || "").trim(),
        startDate: String(raw?.currentRole?.startDate || "").trim(),
        endDate: String(raw?.currentRole?.endDate || "").trim(),
        isCurrent: Boolean(raw?.currentRole?.isCurrent),
        highlights: Array.isArray(raw?.currentRole?.highlights)
          ? raw.currentRole.highlights.map((x: any) => String(x || "").trim()).filter(Boolean)
          : [],
      },
      priorRoles: Array.isArray(raw?.priorRoles)
        ? raw.priorRoles.map((r: any) => ({
            title: String(r?.title || "").trim(),
            company: String(r?.company || "").trim(),
            startDate: String(r?.startDate || "").trim(),
            endDate: String(r?.endDate || "").trim(),
            highlights: Array.isArray(r?.highlights)
              ? r.highlights.map((x: any) => String(x || "").trim()).filter(Boolean)
              : [],
          }))
        : [],
      education: String(raw?.education || "").trim(),
      certifications: String(raw?.certifications || "").trim(),
      skillsAndPlatforms: String(raw?.skillsAndPlatforms || "").trim(),
      targetJobUrl: String(raw?.targetJobUrl || "").trim(),
    };

    return intake;
  },
});

function safeJsonParse(input: string): any | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function looksLikeIntake(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  if (!("name" in obj)) return false;
  if (!("location" in obj)) return false;
  if (!("desiredTitle" in obj)) return false;
  if (!("currentRole" in obj)) return false;
  return true;
}

function hasDraftEssentials(intake: IntakePayload): boolean {
  const hasHighlights = (intake.currentRole?.highlights || []).filter(Boolean).length >= 2;
  const hasSkills = Boolean(intake.skillsAndPlatforms && intake.skillsAndPlatforms.trim().length > 0);
  const hasRole = Boolean(intake.currentRole?.title && intake.currentRole.title.trim().length > 0);
  return hasRole && hasHighlights && hasSkills;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const messages = Array.isArray(body?.messages) ? body.messages : [];

  const lastUser = [...messages].reverse().find((m: any) => m?.role === "user" && typeof m?.content === "string");
  const maybeJson = lastUser?.content ? safeJsonParse(lastUser.content) : null;
  const intakePresent = looksLikeIntake(maybeJson);

  const system = [
    "You are Resume Righting.",
    "No greetings, no generic chat behavior, no offers to help.",
    "If intake JSON is present, call parseIntake first, then proceed.",
    "Output in this exact order:",
    "## What I understood",
    "Bullets only, short and specific.",
    "## Gaps",
    "Max 5 bullets, only gaps that block strong drafting.",
    "## Follow up questions",
    "Max 5 questions, only the minimum needed to draft strong bullets.",
    "If and only if enough information exists, then include:",
    "## Draft",
    "Include sections in this order: Summary, Core competencies, Current role bullets (4 to 6), Prior role bullets (2 to 4 each).",
    "Bullets must lead with outcomes, scale, scope, then how.",
    "Avoid fluff.",
    "If essentials are missing, do not draft, ask only the minimum questions.",
  ].join(" ");

  const augmentedMessages = intakePresent
    ? [
        ...messages,
        {
          role: "user",
          content: `Intake essentials check, draft is allowed only if current role title is present, current role has at least two highlights, and skillsAndPlatforms is present. Intake JSON was provided.`,
        },
      ]
    : messages;

  const result = await streamText({
    model: openai("gpt-4.1-mini"),
    system,
    messages: augmentedMessages,
    tools: { parseIntake },
    maxSteps: 6,
  });

  return result.toDataStreamResponse();
}
