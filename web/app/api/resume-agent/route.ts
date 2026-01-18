import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

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

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

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

function normalizeIntake(raw: any): IntakePayload {
  return {
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
      ? raw.priorRoles
          .map((r: any) => ({
            title: String(r?.title || "").trim(),
            company: String(r?.company || "").trim(),
            startDate: String(r?.startDate || "").trim(),
            endDate: String(r?.endDate || "").trim(),
            highlights: Array.isArray(r?.highlights)
              ? r.highlights.map((x: any) => String(x || "").trim()).filter(Boolean)
              : [],
          }))
          .filter((r: any) => r.title || r.company || r.startDate || r.endDate || (r.highlights?.length ?? 0) > 0)
      : [],
    education: String(raw?.education || "").trim(),
    certifications: String(raw?.certifications || "").trim(),
    skillsAndPlatforms: String(raw?.skillsAndPlatforms || "").trim(),
    targetJobUrl: String(raw?.targetJobUrl || "").trim(),
  };
}

function hasDraftEssentials(intake: IntakePayload): boolean {
  const hasRoleTitle = Boolean(intake.currentRole?.title && intake.currentRole.title.trim().length > 0);
  const hasHighlights = (intake.currentRole?.highlights || []).filter(Boolean).length >= 2;
  const hasSkills = Boolean(intake.skillsAndPlatforms && intake.skillsAndPlatforms.trim().length > 0);
  return hasRoleTitle && hasHighlights && hasSkills;
}

function compactIntakeSummary(intake: IntakePayload): string {
  const lines: string[] = [];

  lines.push(`Name: ${intake.name || "Unknown"}`);
  lines.push(
    `Location: ${[intake.location.city, intake.location.state, intake.location.zip].filter(Boolean).join(", ") || "Unknown"}`
  );
  lines.push(`Desired title: ${intake.desiredTitle || "Unknown"}`);
  if (intake.desiredSalaryRange) lines.push(`Desired salary range: ${intake.desiredSalaryRange}`);

  lines.push("");
  lines.push("Current role:");
  lines.push(`- Title: ${intake.currentRole.title || "Unknown"}`);
  lines.push(`- Company: ${intake.currentRole.company || "Unknown"}`);
  lines.push(`- Dates: ${intake.currentRole.startDate || "?"} to ${intake.currentRole.isCurrent ? "Present" : intake.currentRole.endDate || "?"}`);
  lines.push("- Highlights:");
  if (intake.currentRole.highlights.length) {
    for (const h of intake.currentRole.highlights) lines.push(`  - ${h}`);
  } else {
    lines.push("  - None provided");
  }

  if (intake.priorRoles.length) {
    lines.push("");
    lines.push("Prior roles:");
    intake.priorRoles.slice(0, 6).forEach((r, idx) => {
      lines.push(`${idx + 1}. ${r.title || "Unknown"} at ${r.company || "Unknown"} (${r.startDate || "?"} to ${r.endDate || "?"})`);
      const hs = (r.highlights || []).filter(Boolean);
      if (hs.length) hs.slice(0, 4).forEach((h) => lines.push(`   - ${h}`));
      else lines.push("   - Highlights not provided");
    });
  }

  if (intake.education) {
    lines.push("");
    lines.push("Education:");
    lines.push(intake.education);
  }

  if (intake.certifications) {
    lines.push("");
    lines.push("Certifications:");
    lines.push(intake.certifications);
  }

  if (intake.skillsAndPlatforms) {
    lines.push("");
    lines.push("Skills and platforms:");
    lines.push(intake.skillsAndPlatforms);
  }

  if (intake.targetJobUrl) {
    lines.push("");
    lines.push(`Target job URL: ${intake.targetJobUrl}`);
  }

  return lines.join("\n");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];

  const lastUser = [...messages].reverse().find((m) => m?.role === "user" && typeof m?.content === "string");
  const maybeJson = lastUser?.content ? safeJsonParse(lastUser.content) : null;

  let intake: IntakePayload | null = null;
  if (looksLikeIntake(maybeJson)) intake = normalizeIntake(maybeJson);

  const draftAllowed = intake ? hasDraftEssentials(intake) : false;

  const system = [
    "You are Resume Righting.",
    "No greetings, no generic chat behavior, no offers to help.",
    "Output in this exact order with markdown headings:",
    "## What I understood",
    "Bullets only, short and specific.",
    "## Gaps",
    "Max 5 bullets, only gaps that block strong drafting.",
    "## Follow up questions",
    "Max 5 questions, only the minimum needed to draft strong bullets.",
    "Only include ## Draft if drafting is allowed.",
    "If drafting is allowed, include in this order: Summary, Core competencies, Current role bullets (4 to 6), Prior role bullets (2 to 4 each).",
    "Bullets must lead with outcomes, scale, scope, then how.",
    "Avoid fluff.",
  ].join(" ");

  const injected =
    intake
      ? [
          {
            role: "user" as const,
            content:
              [
                "INTAKE (structured, authoritative):",
                compactIntakeSummary(intake),
                "",
                `Draft allowed: ${draftAllowed ? "Yes" : "No"}`,
                "If Draft allowed is No, do not draft, ask only the minimum questions.",
              ].join("\n"),
          },
        ]
      : [];

  const result = await streamText({
    model: openai("gpt-4.1-mini"),
    system,
    messages: [...messages, ...injected],
    maxSteps: 2,
  });

  return result.toDataStreamResponse();
}
