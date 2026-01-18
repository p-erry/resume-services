"use client";

import { useMemo, useState } from "react";

type RoleForm = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  highlights: string[];
};

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

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function cleanHighlights(items: string[]) {
  return items.map((s) => s.trim()).filter(Boolean);
}

function safeUrl(value: string) {
  const v = value.trim();
  return v;
}

export default function IntakePage() {
  const [name, setName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
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

  const debugPayload = useMemo<IntakePayload>(() => {
    return {
      name: name.trim(),
      linkedinUrl: safeUrl(linkedinUrl) || undefined,
      location: {
        city: city.trim(),
        state: stateValue.trim(),
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
    stateValue,
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
    return (
      hasName &&
      hasDesiredTitle &&
      hasCurrentTitle &&
      hasCurrentCompany &&
      hasTwoHighlights &&
      hasSkills
    );
  }, [
    name,
    desiredTitle,
    currentTitle,
    currentCompany,
    currentHighlights,
    skillsAndPlatforms,
  ]);

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
    setPriorRoles((prev) => [
      ...prev,
      { title: "", company: "", startDate: "", endDate: "", highlights: ["", ""] },
    ]);
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
          messages: [{ role: "user", content: JSON.stringify(debugPayload) } as ChatMessage],
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
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1" htmlFor="state">
                      State
                    </label>
                    <input
                      id="state"
                      className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                      value={stateValue}
                      onChange={(e) => setStateValue(e.target.value)}
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1" htmlFor="zip">
                      Zip
                    </label>
                    <input
                      id="zip"
                      className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="Zip"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow">
              <h2 className="text-xl font-semibold">Targeting</h2>
              <p className="mt-1 text-sm text-gray-400">Aim one level up.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1" htmlFor="desiredTitle">
                    Desired title
                  </label>
                  <input
                    id="desiredTitle"
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                    value={desiredTitle}
                    onChange={(e) => setDesiredTitle(e.target.value)}
                    placeholder="Role title you want"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Nudge, pick the role one rung above your current scope.</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1" htmlFor="salary">
                    Desired salary range
                  </label>
                  <input
                    id="salary"
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                    value={desiredSalaryRange}
                    onChange={(e) => setDesiredSalaryRange(e.target.value)}
                    placeholder="Optional"
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional but recommended, it calibrates positioning.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow">
              <h2 className="text-xl font-semibold">Recent work</h2>
              <p className="mt-1 text-sm text-gray-400">The last role is the trailer. Make it watchable.</p>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1" htmlFor="currentTitle">
                      Current or last role title
                    </label>
                    <input
                      id="currentTitle"
                      className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      placeholder="Role title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1" htmlFor="currentCompany">
                      Company
                    </label>
                    <input
                      id="currentCompany"
                      className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      placeholder="Company"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1" htmlFor="currentStart">
                      Start date
                    </label>
                    <input
                      id="currentStart"
                      className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                      value={currentStartDate}
                      onChange={(e) => setCurrentStartDate(e.target.value)}
                      placeholder="YYYY-MM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1" htmlFor="currentEnd">
                      End date
                    </label>
                    <input
                      id="currentEnd"
                      className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white disabled:opacity-50"
                      value={currentEndDate}
                      onChange={(e) => setCurrentEndDate(e.target.value)}
                      placeholder="YYYY-MM"
                      disabled={currentIsCurrent}
                    />
                    <p className="mt-1 text-xs text-gray-500">Disabled while still employed is on.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="isCurrent"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={currentIsCurrent}
                      onChange={(e) => setCurrentIsCurrent(e.target.checked)}
                    />
                    <label htmlFor="isCurrent" className="text-sm text-gray-300">
                      Still employed
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-sm text-gray-300 mb-1">Impact highlights</label>
                    <button
                      type="button"
                      onClick={addCurrentHighlight}
                      className="text-xs rounded-md border border-gray-700 px-2 py-1 hover:bg-gray-900"
                    >
                      Add highlight
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentHighlights.map((h, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          className="flex-1 rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                          value={h}
                          onChange={(e) => updateCurrentHighlight(idx, e.target.value)}
                          placeholder="Outcome first, then how."
                        />
                        {currentHighlights.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => removeCurrentHighlight(idx)}
                            className="rounded-md border border-gray-700 px-3 py-2 text-xs hover:bg-gray-900"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Prior roles</label>
                      <p className="text-xs text-gray-500">Two to four roles from the last five to ten years.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addPriorRole}
                      className="text-xs rounded-md border border-gray-700 px-2 py-1 hover:bg-gray-900"
                    >
                      Add role
                    </button>
                  </div>

                  <div className="mt-3 space-y-4">
                    {priorRoles.map((role, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-800 bg-black p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">Role {idx + 1}</h3>
                            <p className="text-xs text-gray-500">Two impact bullets minimum.</p>
                          </div>
                          {priorRoles.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removePriorRole(idx)}
                              className="text-xs rounded-md border border-gray-700 px-2 py-1 hover:bg-gray-900"
                            >
                              Remove role
                            </button>
                          ) : null}
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Title</label>
                            <input
                              className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                              value={role.title}
                              onChange={(e) => updatePriorRoleField(idx, "title", e.target.value)}
                              placeholder="Role title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Company</label>
                            <input
                              className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                              value={role.company}
                              onChange={(e) => updatePriorRoleField(idx, "company", e.target.value)}
                              placeholder="Company"
                            />
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Start date</label>
                            <input
                              className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                              value={role.startDate}
                              onChange={(e) => updatePriorRoleField(idx, "startDate", e.target.value)}
                              placeholder="YYYY-MM"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-300 mb-1">End date</label>
                            <input
                              className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                              value={role.endDate}
                              onChange={(e) => updatePriorRoleField(idx, "endDate", e.target.value)}
                              placeholder="YYYY-MM"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between gap-3">
                            <label className="block text-sm text-gray-300 mb-1">Impact highlights</label>
                            <button
                              type="button"
                              onClick={() => addPriorRoleHighlight(idx)}
                              className="text-xs rounded-md border border-gray-700 px-2 py-1 hover:bg-gray-900"
                            >
                              Add highlight
                            </button>
                          </div>

                          <div className="space-y-2">
                            {role.highlights.map((h, hIdx) => (
                              <div key={hIdx} className="flex gap-2">
                                <input
                                  className="flex-1 rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                                  value={h}
                                  onChange={(e) => updatePriorRoleHighlight(idx, hIdx, e.target.value)}
                                  placeholder="Measurable outcome, scope, stakeholders."
                                />
                                {role.highlights.length > 2 ? (
                                  <button
                                    type="button"
                                    onClick={() => removePriorRoleHighlight(idx, hIdx)}
                                    className="rounded-md border border-gray-700 px-3 py-2 text-xs hover:bg-gray-900"
                                  >
                                    Remove
                                  </button>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow">
              <h2 className="text-xl font-semibold">Credibility</h2>
              <p className="mt-1 text-sm text-gray-400">Enough to trust you, not enough to bore them.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Education</label>
                  <textarea
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                    rows={3}
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="School, degree, year, optional notes."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Certifications</label>
                  <textarea
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                    rows={2}
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="PMP, SAFe, Prosci, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Skills and platforms</label>
                  <textarea
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                    rows={3}
                    value={skillsAndPlatforms}
                    onChange={(e) => setSkillsAndPlatforms(e.target.value)}
                    placeholder="Tools, platforms, domains, systems."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow">
              <h2 className="text-xl font-semibold">Optional LTV</h2>
              <p className="mt-1 text-sm text-gray-400">If you have a target job, we can tune the story to it.</p>

              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-1">Target job URL</label>
                <input
                  className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-white"
                  value={targetJobUrl}
                  onChange={(e) => setTargetJobUrl(e.target.value)}
                  placeholder="https://company.com/jobs/..."
                  inputMode="url"
                  autoComplete="url"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Resume Draft"}
              </button>

              <span className="text-xs text-gray-500">
                Required, name, desired title, current role title and company, two highlights, skills.
              </span>
            </div>

            <details className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
              <summary className="cursor-pointer text-sm text-gray-300">Debug payload JSON</summary>
              <pre className="mt-3 overflow-auto text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(debugPayload, null, 2)}
              </pre>
            </details>
          </form>

          <aside className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow lg:sticky lg:top-8">
            <h2 className="text-xl font-semibold">Resume Readiness</h2>
            <p className="mt-1 text-sm text-gray-400">Streaming output from the agent.</p>

            <div className="mt-4 rounded-xl border border-gray-800 bg-black p-4 min-h-[420px]">
              {streamedText ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-100">{streamedText}</pre>
              ) : (
                <p className="text-sm text-gray-400">Submit the intake to generate a structured first draft.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
