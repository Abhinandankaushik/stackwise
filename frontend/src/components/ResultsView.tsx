import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Share2, Mail, Copy, Printer, Code, X } from "lucide-react";
import type { AuditResult, UseCase } from "@/lib/audit-engine";
import { generateSummary } from "@/lib/summary";
import { submitLead } from "@/lib/storage";

interface Props {
  result: AuditResult;
  useCase: UseCase;
  shareUrl: string;
  auditId: string;
  isPublic?: boolean;
  teamSize?: number;
  onOpenWidgetModal: () => void;
}

export function ResultsView({
  result,
  useCase,
  shareUrl,
  auditId,
  isPublic,
  teamSize = 1,
  onOpenWidgetModal,
}: Props) {
  const [summary, setSummary] = useState<string>("Generating your summary…");
  const [source, setSource] = useState<"ai" | "template" | "loading">("loading");

  // Savings Simulator: Tracks checked/unchecked optimizations by index
  const [activeFindings, setActiveFindings] = useState<Record<number, boolean>>({});

  // Initialize all findings with savings to active (true) on result change
  useEffect(() => {
    const init: Record<number, boolean> = {};
    result.findings.forEach((_, idx) => {
      init[idx] = true;
    });
    setActiveFindings(init);
  }, [result]);

  // Query Gemini API summary based on original results
  useEffect(() => {
    let mounted = true;
    generateSummary(result, useCase).then((s) => {
      if (!mounted) return;
      setSummary(s.text);
      setSource(s.source);
    });
    return () => {
      mounted = false;
    };
  }, [result, useCase]);

  // Recalculate simulator values dynamically
  const simulatedResult = useMemo(() => {
    const findings = result.findings.map((f, idx) => {
      const active = activeFindings[idx] !== false; // defaults to true
      const recommendedMonthly = active ? f.recommendedMonthly : f.currentMonthly;
      const monthlySavings = f.currentMonthly - recommendedMonthly;
      return {
        ...f,
        recommendedMonthly,
        monthlySavings,
        active,
      };
    });

    const totalCurrent = result.totalCurrent;
    const totalRecommended = findings.reduce((sum, f) => sum + f.recommendedMonthly, 0);
    const monthlySavings = totalCurrent - totalRecommended;
    const annualSavings = monthlySavings * 12;
    const perDeveloperSpend = teamSize > 0 ? Math.round(totalCurrent / teamSize) : totalCurrent;

    let state: AuditResult["state"] = "optimal";
    if (monthlySavings >= 500) state = "high_savings";
    else if (monthlySavings >= 100) state = "some_savings";

    return {
      ...result,
      findings,
      totalCurrent,
      totalRecommended,
      monthlySavings,
      annualSavings,
      perDeveloperSpend,
      state,
    };
  }, [result, activeFindings, teamSize]);

  function handleToggleFinding(idx: number) {
    setActiveFindings((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

  return (
    <div className="space-y-8" aria-live="polite" aria-atomic="false">
      <HeroSavings result={simulatedResult} />
      <SummaryCard text={summary} source={source} />
      <FindingsList
        result={simulatedResult}
        activeFindings={activeFindings}
        onToggleFinding={handleToggleFinding}
      />
      <ShareCard shareUrl={shareUrl} />
      {!isPublic && (
        <LeadCapture
          auditId={auditId}
          state={simulatedResult.state}
          result={simulatedResult}
          useCase={useCase}
          teamSize={teamSize}
          shareUrl={shareUrl}
        />
      )}
      <Benchmark result={simulatedResult} onOpenWidgetModal={onOpenWidgetModal} />
    </div>
  );
}

function HeroSavings({ result }: { result: any }) {
  const positive = result.monthlySavings > 0;
  return (
    <div
      className="rounded-3xl border border-border p-8 md:p-10 relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {positive ? "Estimated savings" : "Audit verdict"}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div className="text-5xl md:text-7xl font-bold tracking-tight font-mono text-primary transition-all duration-300">
          ${result.monthlySavings.toLocaleString()}
          <span className="text-2xl md:text-3xl text-muted-foreground font-sans"> /mo</span>
        </div>
        <div className="text-xl md:text-2xl text-foreground/80 font-mono transition-all duration-300">
          ${result.annualSavings.toLocaleString()} <span className="text-sm text-muted-foreground">/year</span>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Current spend <span className="text-foreground font-mono">${result.totalCurrent.toLocaleString()}/mo</span>
        {" → "}
        recommended <span className="text-foreground font-mono transition-all duration-300">${result.totalRecommended.toLocaleString()}/mo</span>
      </div>
      {result.state === "high_savings" && (
        <a
          href="https://credex.rocks"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 font-semibold hover:opacity-90 no-print"
        >
          Book a Credex consultation <ArrowUpRight size={16} />
        </a>
      )}
    </div>
  );
}

function SummaryCard({ text, source }: { text: string; source: string }) {
  const loading = source === "loading";
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Personalized read</div>
        <span className="text-[10px] text-muted-foreground">
          {source === "ai" ? "AI" : source === "template" ? "rules-based" : "…"}
        </span>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse" aria-busy="true">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-4/6" />
        </div>
      ) : (
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">{text}</p>
      )}
    </div>
  );
}

function FindingsList({
  result,
  activeFindings,
  onToggleFinding,
}: {
  result: any;
  activeFindings: Record<number, boolean>;
  onToggleFinding: (idx: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Per-tool breakdown
        </span>
        <span className="text-[10px] text-muted-foreground no-print hidden sm:inline">
          Check/uncheck to simulate savings
        </span>
      </div>
      <ul>
        {result.findings.map((f: any, i: number) => {
          const hasSavings = f.currentMonthly > f.recommendedMonthly || f.monthlySavings > 0;
          return (
            <li
              key={i}
              className={`px-6 py-5 border-b border-border last:border-b-0 grid grid-cols-12 gap-3 items-start transition-all duration-200 ${
                !f.active ? "opacity-40 bg-muted/5 line-through decoration-muted-foreground" : ""
              }`}
            >
              {/* Checkbox selector for Simulator (only on findings with savings) */}
              <div className="col-span-1 flex items-center justify-center pt-1 no-print">
                {hasSavings ? (
                  <input
                    type="checkbox"
                    checked={f.active !== false}
                    onChange={() => onToggleFinding(i)}
                    className="simulator-checkbox"
                    aria-label={`Simulate savings for ${f.toolName}`}
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                    <Check size={8} className="text-primary/40" />
                  </div>
                )}
              </div>

              <div className="col-span-11 grid md:grid-cols-11 gap-3 items-start">
                <div className="md:col-span-3">
                  <div className="font-semibold">{f.toolName}</div>
                  <div className="text-xs text-muted-foreground">{f.planLabel}</div>
                </div>
                <div className="md:col-span-3 font-mono text-sm">
                  <span className={f.monthlySavings > 0 ? "line-through text-muted-foreground" : "text-foreground"}>
                    ${f.currentMonthly}/mo
                  </span>
                  {f.monthlySavings > 0 && f.active && (
                    <span className="ml-2 text-primary font-bold">→ ${f.recommendedMonthly}/mo</span>
                  )}
                </div>
                <div className="md:col-span-5">
                  <div className="flex items-center gap-2">
                    {f.severity === "ok" ? (
                      <Check size={16} className="text-primary" />
                    ) : (
                      <span
                        className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ${
                          f.severity === "major"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-accent/20 text-accent"
                        }`}
                      >
                        {f.severity}
                      </span>
                    )}
                    <span className="font-medium text-sm md:text-base">{f.action}</span>
                    {f.monthlySavings > 0 && f.active && (
                      <span className="ml-auto font-mono text-primary text-sm font-semibold">
                        -${f.monthlySavings}/mo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{f.reason}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ShareCard({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-wrap items-center gap-4">
      <Share2 size={20} className="text-primary no-print" />
      <div className="flex-1 min-w-[200px]">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Public share link</div>
        <div className="font-mono text-xs md:text-sm truncate text-foreground/80">{shareUrl}</div>
      </div>
      
      {/* Copy link */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex items-center gap-2 rounded-md bg-secondary border border-border px-3 py-2 text-sm hover:border-primary/50 cursor-pointer no-print"
      >
        <Copy size={14} /> {copied ? "Copied" : "Copy link"}
      </button>

      {/* PDF Export trigger */}
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-md bg-secondary border border-border px-3 py-2 text-sm hover:border-primary/50 cursor-pointer no-print"
      >
        <Printer size={14} /> Print / Save PDF
      </button>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just audited my AI tool stack with Stackwise →")}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-3 py-2 text-sm font-semibold no-print"
      >
        Share on X
      </a>
    </div>
  );
}

function LeadCapture({
  auditId,
  state,
  result,
  useCase,
  teamSize,
  shareUrl,
}: {
  auditId: string;
  state: AuditResult["state"];
  result: any;
  useCase: UseCase;
  teamSize: number;
  shareUrl: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [leadTeamSize, setLeadTeamSize] = useState<number | undefined>(teamSize);
  const [hp, setHp] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) return;
    if (!email.includes("@")) return;
    setSubmitting(true);
    setError(null);
    const res = await submitLead({
      email,
      company: company || undefined,
      role: role || undefined,
      teamSize: leadTeamSize,
      auditId,
      honeypot: hp,
      monthlySavings: result.monthlySavings,
      annualSavings: result.annualSavings,
      auditState: state,
      shareUrl,
      auditPayload: {
        useCase,
        teamSize,
        monthlySavings: result.monthlySavings,
        payload: {
          findings: result.findings.map((f: any) => ({
            toolName: f.toolName,
            planLabel: f.planLabel,
            currentMonthly: f.currentMonthly,
            recommendedMonthly: f.recommendedMonthly,
            monthlySavings: f.monthlySavings,
            action: f.action,
            reason: f.reason,
          })),
          totals: {
            current: result.totalCurrent,
            recommended: result.totalRecommended,
            savings: result.monthlySavings,
            annual: result.annualSavings,
          },
          state,
        },
      },
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Could not save. Try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 no-print">
        <div className="font-semibold">Saved. Check your inbox for the audit confirmation.</div>
        <p className="text-sm text-muted-foreground mt-1">
          {state === "high_savings"
            ? "Credex will reach out within 1 business day about high-impact savings."
            : "We'll ping you only when a new optimization applies to your stack."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 no-print">
      <div className="flex items-center gap-2 mb-3">
        <Mail size={16} className="text-primary" />
        <h3 className="font-semibold text-sm md:text-base">
          {state === "high_savings"
            ? "Get the full report + Credex consultation"
            : "Notify me when new optimizations apply to my stack"}
        </h3>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <input
          required
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
        />
        <input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-md bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
        />
        <input
          type="text"
          placeholder="Role (optional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
        />
        <input
          type="number"
          placeholder="Team size (optional)"
          value={leadTeamSize ?? ""}
          onChange={(e) =>
            setLeadTeamSize(e.target.value ? Number(e.target.value) : undefined)
          }
          className="rounded-md bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
        />
        {/* honeypot — hidden from real users */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold w-full md:w-auto disabled:opacity-60 cursor-pointer"
      >
        {submitting ? "Sending…" : "Email me the report"}
      </button>
    </form>
  );
}

function Benchmark({ result, onOpenWidgetModal }: { result: any; onOpenWidgetModal: () => void }) {
  const ratio = result.perDeveloperSpend / Math.max(1, result.benchmarkPerDeveloper);
  const verdict =
    ratio > 1.4 ? "well above" : ratio > 1.1 ? "above" : ratio < 0.7 ? "below" : "in line with";
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        Benchmark vs. peer startups
      </div>
      <p className="mt-2 text-foreground/90">
        Your current AI spend per developer is <span className="font-mono font-semibold">${result.perDeveloperSpend}/mo</span>.
        That's <span className="font-semibold">{verdict}</span> the
        <span className="font-mono"> ${result.benchmarkPerDeveloper}/mo</span> average for
        2–20 person teams we've audited.
      </p>
      <p className="mt-3 text-xs text-muted-foreground no-print">
        Want this on your blog? See{" "}
        <button
          onClick={onOpenWidgetModal}
          className="underline text-primary font-medium cursor-pointer bg-transparent border-none p-0 inline hover:opacity-85"
        >
          embeddable widget
        </button>.
      </p>
    </div>
  );
}