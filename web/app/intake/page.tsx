"use client";

import { useMemo, useState } from "react";

type Role = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  highlights: string[];
};

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

const emptyRole = (): Role => ({
  title: "",
  company: "",
  startDate: "",
  endDate: "",
  highlights: ["", ""],
});

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function IntakePage() {
  const [loading, setLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [zip, setZip] = useState("");

  const [desiredTitle, setDesiredTitle] = useState("");
  const [desiredSalaryRange, setDesiredSalaryRange] = useState("");

  const [currentTitle, setCurrentTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentStartDate, setCurrentStartDate] = useState("");
  const [currentEndDate, setCurrentEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(true);
  const [currentHighlights, setCurrentHighlights] = useState<string[]>(["", ""]);

  const [priorRoles, setPriorRoles] = useState<Role[]>([emptyRole(), emptyRole()]);

  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [skillsAndPlatforms, setSkillsAndPlatforms] = useState("");
  const [targetJobUrl, setTargetJobUrl] = useState("");

  const payload: IntakePayload = useMemo(() => {
    return {
      name: name.trim(),
      location: { city: city.trim(), state: stateValue.trim(), zip: zip.trim() },
      desiredTitle: desiredTitle.trim(),
      desiredSalaryRange: desiredSalaryRange.trim(),
      currentRole: {
        title: currentTitle.trim(),
        company: currentCompany.trim(),
        startDate: currentStartDate.trim(),
        endDate: isCurrent ? "" : currentEndDate.trim(),
        isCurrent,
        highlights: currentHighlights.map((h) => h.trim()).filter(Boolean),
      },
      priorRoles: priorRoles
        .map((r) => ({
          title: r.title.trim(),
          company: r.company.trim(),
          startDate: r.startDate.trim(),
          endDate: r.endDate.trim(),
          highlights: r.highlights.map((h) => h.trim()).filter(Boolean),
        }))
        .filter((r) => r.title || r.company || r.startDate || r.endDate || r.highlights.length > 0),
      education: education.trim(),
      certifications: certifications.trim(),
      skillsAndPlatforms: skillsAndPlatforms.trim(),
      targetJobUrl: targetJobUrl.trim(),
    };
  }, [
    name,
    city,
    stateValue,
    zip,
    desiredTitle,
    desiredSalaryRange,
    currentTitle,
    currentCompany,
    currentStartDate,
    currentEndDate,
    isCurrent,
    currentHighlights,
    priorRoles,
    education,
    certifications,
    skillsAndPlatforms,
    targetJobUrl,
  ]);

  const updateRole = (idx: number, patch: Partial<Role>) => {
    setPriorRoles((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const updateRoleHighlight = (idx: number, hIdx: number, value: string) => {
    setPriorRoles((prev) => {
      const next = [...prev];
      const role = next[idx];
      const highlights = [...role.highlights];
      highlights[hIdx] = value;
      next[idx] = { ...role, highlights };
      return next;
    });
  };

  const addPriorRole = () => setPriorRoles((prev) => [...prev, emptyRole()]);

  const removePriorRole = (idx: number) =>
    setPriorRoles((prev) => prev.filter((_, i) => i !== idx));

  const addCurrentHighlight = () => setCurrentHighlights((prev) => [...prev, ""]);

  const updateCurrentHighlight = (idx: number, value: string) =>
    setCurrentHighlights((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });

  const removeCurrentHighlight = (idx: number) =>
    setCurrentHighlights((prev) => prev.filter((_, i) => i !== idx));

  async function handleSubmit(e: React.FormEvent) {
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
      if (!res.body) throw new Error("No response body returned");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
        if (chunk) setStreamedText((prev) => prev + chunk);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Resume Righting Intake
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-300">
            Minimal fields, high signal. You are building a product, not listing a history.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Section title="Identity" subtitle="Who you are, where you are.">
              <Row>
                <Field label="Name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="First Last" />
                </Field>
              </Row>

              <Row3>
                <Field label="City">
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Atlanta" />
                </Field>
                <Field label="State">
                  <Input value={stateValue} onChange={(e) => setStateValue(e.target.value)} placeholder="GA" />
                </Field>
                <Field label="Zip">
                  <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="30301" />
                </Field>
              </Row3>
            </Section>

            <Section
              title="Targeting"
              subtitle="Aim one level up. If it feels slightly spicy, it is probably right."
            >
              <Row>
                <Field label="Desired title" hint="Nudge: pick the role one rung above your current scope.">
                  <Input
                    value={desiredTitle}
                    onChange={(e) => setDesiredTitle(e.target.value)}
                    placeholder="Senior Program Manager"
                  />
                </Field>
              </Row>

              <Row>
                <Field label="Desired salary range" hint="Optional but recommended, it calibrates positioning.">
                  <Input
                    value={desiredSalaryRange}
                    onChange={(e) => setDesiredSalaryRange(e.target.value)}
                    placeholder="160 to 190"
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Recent work" subtitle="The last role is the trailer. Make it watchable.">
              <Row>
                <Field label="Current or last role title">
                  <Input value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="IT Program Manager" />
                </Field>
              </Row>

              <Row>
                <Field label="Company">
                  <Input value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} placeholder="Company name" />
                </Field>
              </Row>

              <Row3>
                <Field label="Start date">
                  <Input value={currentStartDate} onChange={(e) => setCurrentStartDate(e.target.value)} placeholder="2022-06" />
                </Field>

                <Field label="End date" hint={isCurrent ? "Disabled while Still employed is on." : ""}>
                  <Input
                    value={currentEndDate}
                    onChange={(e) => setCurrentEndDate(e.target.value)}
                    placeholder="2026-01"
                    disabled={isCurrent}
                  />
                </Field>

                <Field label="Still employed">
                  <Toggle checked={isCurrent} onChange={setIsCurrent} />
                </Field>
              </Row3>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <Label>Impact highlights</Label>
                  <button
                    type="button"
                    onClick={addCurrentHighlight}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1 text-xs hover:bg-gray-800"
                  >
                    Add highlight
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {currentHighlights.map((h, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Textarea
                        value={h}
                        onChange={(e) => updateCurrentHighlight(idx, e.target.value)}
                        placeholder={`Highlight ${idx + 1}, outcome first, then how.`}
                      />
                      {currentHighlights.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => removeCurrentHighlight(idx)}
                          className="h-10 shrink-0 rounded-lg border border-gray-700 bg-gray-900 px-3 text-xs hover:bg-gray-800"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Prior roles</h3>
                    <p className="text-xs text-gray-400">2 to 4 roles from the last 5 to 10 years.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addPriorRole}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1 text-xs hover:bg-gray-800"
                  >
                    Add role
                  </button>
                </div>

                <div className="mt-4 space-y-6">
                  {priorRoles.map((role, idx) => (
                    <div key={idx} className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold">Role {idx + 1}</div>
                          <div className="text-xs text-gray-400">Two impact bullets minimum.</div>
                        </div>

                        {priorRoles.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removePriorRole(idx)}
                            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1 text-xs hover:bg-gray-800"
                          >
                            Remove role
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-4 space-y-4">
                        <Row>
                          <Field label="Title">
                            <Input
                              value={role.title}
                              onChange={(e) => updateRole(idx, { title: e.target.value })}
                              placeholder="Senior Project Manager"
                            />
                          </Field>
                        </Row>

                        <Row>
                          <Field label="Company">
                            <Input
                              value={role.company}
                              onChange={(e) => updateRole(idx, { company: e.target.value })}
                              placeholder="Company name"
                            />
                          </Field>
                        </Row>

                        <Row2>
                          <Field label="Start date">
                            <Input
                              value={role.startDate}
                              onChange={(e) => updateRole(idx, { startDate: e.target.value })}
                              placeholder="2019-03"
                            />
                          </Field>
                          <Field label="End date">
                            <Input
                              value={role.endDate}
                              onChange={(e) => updateRole(idx, { endDate: e.target.value })}
                              placeholder="2022-05"
                            />
                          </Field>
                        </Row2>

                        <div className="space-y-3">
                          <Label>Impact highlights</Label>
                          <Textarea
                            value={role.highlights[0] || ""}
                            onChange={(e) => updateRoleHighlight(idx, 0, e.target.value)}
                            placeholder="Highlight 1, measurable outcome, scope, stakeholders."
                          />
                          <Textarea
                            value={role.highlights[1] || ""}
                            onChange={(e) => updateRoleHighlight(idx, 1, e.target.value)}
                            placeholder="Highlight 2, delivery, change, risk, systems."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Credibility" subtitle="Enough to trust you, not enough to bore them.">
              <Row>
                <Field label="Education">
                  <Textarea value={education} onChange={(e) => setEducation(e.target.value)} placeholder="School, degree, year, optional notes." />
                </Field>
              </Row>

              <Row>
                <Field label="Certifications">
                  <Textarea value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="PMP, Prosci, SAFe, etc." />
                </Field>
              </Row>

              <Row>
                <Field label="Skills and platforms">
                  <Textarea
                    value={skillsAndPlatforms}
                    onChange={(e) => setSkillsAndPlatforms(e.target.value)}
                    placeholder="Smartsheet, Power BI, Jira, ServiceNow, SAP, SQL, APIs, governance, migrations."
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Optional LTV" subtitle="If you have a target job, we can tune the story to it.">
              <Row>
                <Field label="Target job URL">
                  <Input value={targetJobUrl} onChange={(e) => setTargetJobUrl(e.target.value)} placeholder="https://company.com/jobs/..." />
                </Field>
              </Row>
            </Section>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "mt-2 inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition",
                  loading ? "bg-gray-800 text-gray-300" : "bg-white text-black hover:bg-gray-200"
                )}
              >
                {loading ? "Generating..." : "Generate Resume Draft"}
              </button>

              {error ? (
                <div className="mt-3 rounded-lg border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <details className="mt-4 rounded-lg border border-gray-800 bg-gray-950 p-3">
                <summary className="cursor-pointer text-xs text-gray-400">
                  Debug payload JSON
                </summary>
                <pre className="mt-3 max-h-64 overflow-auto text-xs text-gray-200">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </details>
            </div>
          </form>

          <aside className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
            <div className="mb-3">
              <h2 className="text-sm font-semibold">Resume Readiness</h2>
              <p className="mt-1 text-xs text-gray-400">
                Streaming output from the agent.
              </p>
            </div>

            <div className="min-h-[520px] whitespace-pre-wrap rounded-xl border border-gray-800 bg-black p-4 text-sm text-gray-100">
              {streamedText ? streamedText : "Submit the intake to generate a structured first draft."}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Section(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{props.title}</h2>
        {props.subtitle ? <p className="mt-1 text-sm text-gray-400">{props.subtitle}</p> : null}
      </div>
      {props.children}
    </section>
  );
}

function Row(props: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4">{props.children}</div>;
}

function Row2(props: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{props.children}</div>;
}

function Row3(props: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{props.children}</div>;
}

function Field(props: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{props.label}</Label>
      {props.hint ? <div className="mt-1 text-xs text-gray-400">{props.hint}</div> : null}
      <div className="mt-2">{props.children}</div>
    </div>
  );
}

function Label(props: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-gray-300">{props.children}</div>;
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-gray-800 bg-black px-3 text-sm text-white outline-none",
        "focus:border-gray-600",
        props.disabled && "bg-gray-900 text-gray-400",
        props.className
      )}
    />
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }
) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[44px] w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white outline-none",
        "focus:border-gray-600",
        props.className
      )}
    />
  );
}

function Toggle(props: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => props.onChange(!props.checked)}
      className={cn(
        "h-10 w-full rounded-md border px-3 text-sm transition",
        props.checked ? "border-white bg-white text-black" : "border-gray-800 bg-black text-white hover:bg-gray-950"
      )}
      aria-pressed={props.checked}
    >
      {props.checked ? "Yes" : "No"}
    </button>
  );
}
