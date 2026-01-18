"use client";

import { useMemo, useState } from "react";

type IntakePayload = {
  name: string;
  linkedinUrl?: string;
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

type RoleForm = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  highlights: string[];
};

function cleanHighlights(items: string[]) {
  return items.map((s) => s.trim()).filter(Boolean);
}

function safeUrl(value: string) {
  return value.trim();
}

export default function IntakePage() {
  const [name, setName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [desiredTitle, setDesiredTitle] = useState("");
  const [desiredSalaryRange, setDesiredSalaryRange] = useState("");

  const [currentTitle, setCurrentTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentStartDate, setCurrentStartDate] = useState("");
  const [currentEndDate, setCurrentEndDate] = useState("");
  const [currentIsCurrent, setCurrentIsCurrent] = useState(true);
  const [currentHighlights, setCurrentHighlights] = useState<string[]>(["", ""]);

  const [priorRoles, setPriorRoles] = useState<RoleForm[]>([
    { title: "", company: "", startDate: "", endDate: "", highlights: ["", ""] },
  ]);

  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [skillsAndPlatforms, setSkillsAndPlatforms] = useState("");
  const [targetJobUrl, setTargetJobUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");

  const debugEnabled =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";

  const payload = useMemo<IntakePayload>(() => {
    const linkedIn = safeUrl(linkedinUrl);
    return {
      name: name.trim(),
      linkedinUrl: linkedIn ? linkedIn : undefined,
      location: {
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
      },
      desiredTitle: desiredTitle.trim(),
      desiredSalaryRange: desiredSalaryRange.trim(),
      currentRole: {
        title: currentTitle.trim(),
        company: currentCompany.trim(),
        startDate: currentStartDate.trim(),
        endDate: currentIsCurrent ? "" : currentEndDate.trim(),
        isCurrent: currentIsCurrent,
        highlights: cleanHighlights(currentHighlights),
      },
      priorRoles: priorRoles.map((r) => ({
        title: r.title.trim(),
        company: r.company.trim(),
        startDate: r.startDate.trim(),
        endDate: r.endDate.trim(),
        highlights: cleanHighlights(r.highlights),
      })),
      education: education.trim(),
      certifications: certifications.trim(),
      skillsAndPlatforms: skillsAndPlatforms.trim(),
      targetJobUrl: safeUrl(targetJobUrl),
    };
  }, [
    name,
    linkedinUrl,
    city,
    state,
    zip,
    desiredTitle,
    desiredSalaryRange,
    currentTitle,
    currentCompany,
    currentStartDate,
    currentEndDate,
    currentIsCurrent,
    currentHighlights,
    priorRoles,
    education,
    certifications,
    skillsAndPlatforms,
    targetJobUrl,
  ]);

  const canSubmit = useMemo(() => {
    const hasName = name.trim().length > 0;
    const hasDesiredTitle = desiredTitle.trim().length > 0;
    const hasCurrentTitle = currentTitle.trim().length > 0;
    const hasCurrentCompany = currentCompany.trim().length > 0;
    const hasTwoHighlights = cleanHighlights(currentHighlights).length >= 2;
    const hasSkills = skillsAndPlatforms.trim().length > 0;
    return hasName && hasDesiredTitle && hasCurrentTitle && hasCurrentCompany && hasTwoHighlights && hasSkills;
  }, [name, desiredTitle, currentTitle, currentCompany, currentHighlights, skillsAndPlatforms]);

  function updateCurrentHighlight(index: number, value: string) {
    setCurrentHighlights((prev) => prev.map((h, i) => (i === index ? value : h)));
  }

  function addCurrentHighlight() {
    setCurrentHighlights((prev) => [...prev, ""]);
  }

  function removeCurrentHighlight(index: number) {
    setCurrentHighlights((prev) => prev.filter((_, i) => i !== index));
  }

  function addPriorRole() {
    setPriorRoles((prev) => [...prev, { title: "", company: "", startDate: "", endDate: "", highlights: ["", ""] }]);
  }

  function removePriorRole(index: number) {
    setPriorRoles((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePriorRoleField(index: number, field: keyof Omit<RoleForm, "highlights">, value: string) {
    setPriorRoles((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function updatePriorRoleHighlight(roleIndex: number, highlightIndex: number, value: string) {
    setPriorRoles((prev) =>
      prev.map((r, i) => {
        if (i !== roleIndex) return r;
        const next = r.highlights.map((h, j) => (j === highlightIndex ? value : h));
        return { ...r, highlights: next };
      })
    );
  }

  function addPriorRoleHighlight(roleIndex: number) {
    setPriorRoles((prev) =>
      prev.map((r, i) => {
        if (i !== roleIndex) return r;
        return { ...r, highlights: [...r.highlights, ""] };
      })
    );
  }

  function removePriorRoleHighlight(roleIndex: number, highlightIndex: number) {
    setPriorRoles((prev) =>
      prev.map((r, i) => {
        if (i !== roleIndex) return r;
        return { ...r, highlights: r.highlights.filter((_, j) => j !== highlightIndex) };
      })
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStreamedText("");
    setLoading(true);

    try {
      const res = await fetch("/api/resume-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: JSON.stringify(payload) }],
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
        if (chunk) setStreamedText((prev) => prev + chunk);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <section className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold">Resume Righting Intake</h1>
          <p className="mt-2 text-sm md:text-base text-gray-300">
            Minimal fields, high signal. You are building a product, not listing a history.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow">
              <h2 className="text-xl font-semibold">Identity</h2>
              <p className="mt-1 text-sm text-gray-400">Who you are, where you are.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1" htmlFor="linkedin">
                    LinkedIn URL
                  </label>
                  <input
                    id="linkedin"
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-handle"
                    inputMode="url"
                    autoComplete="url"
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional, paste the full profile link.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1" htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                    />
