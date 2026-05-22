import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Share2, Mail, Copy } from "lucide-react";
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
}

export function ResultsView({
  result,
  useCase,
  shareUrl,
  auditId,
  isPublic,
  teamSize = 1,
}: Props) {
  const [summary, setSummary] = useState<string>("Generating your summary…");
  const [source, setSource] = useState<"ai" | "template" | "loading">("loading");

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

  return (
    <div className="space-y-8" aria-live="polite" aria-atomic="false">
      <HeroSavings result={result} />
      <SummaryCard text={summary} source={source} />
      <FindingsList result={result} />
      <ShareCard shareUrl={shareUrl} />
      {!isPublic && (
        <LeadCapture
          auditId={auditId}
          state={result.state}
          result={result}
          useCase={useCase}
          teamSize={teamSize}
          shareUrl={shareUrl}
        />
      )}
      <Benchmark result={result} />
    </div>
  );
}

function HeroSavings({ result }: { result: AuditResult }) {
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
        <div className="text-5xl md:text-7xl font-bold tracking-tight font-mono text-primary">
          ${result.monthlySavings.toLocaleString()}
          <span className="text-2xl md:text-3xl text-muted-foreground font-sans"> /mo</span>
        </div>
        <div className="text-xl md:text-2xl text-foreground/80 font-mono">
          ${result.annualSavings.toLocaleString()} <span className="text-sm text-muted-foreground">/year</span>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Current spend <span className="text-foreground font-mono">${result.totalCurrent.toLocaleString()}/mo</span>
        {" → "}
        recommended <span className="text-foreground font-mono">${result.totalRecommended.toLocaleString()}/mo</span>
      </div>
      {result.state === "high_savings" && (
        <a
          href="https://credex.rocks"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 font-semibold hover:opacity-90"
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

function FindingsList({ result }: { result: AuditResult }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
        Per-tool breakdown
      </div>
      <ul>
        {result.findings.map((f, i) => (
          <li
            key={i}
            className="px-6 py-5 border-b border-border last:border-b-0 grid md:grid-cols-12 gap-3 items-start"
          >
            <div className="md:col-span-3">
              <div className="font-semibold">{f.toolName}</div>
              <div className="text-xs text-muted-foreground">{f.planLabel}</div>
            </div>
            <div className="md:col-span-3 font-mono text-sm">
              <span className={f.monthlySavings > 0 ? "line-through text-muted-foreground" : "text-foreground"}>
                ${f.currentMonthly}/mo
              </span>
              {f.monthlySavings > 0 && (
                <span className="ml-2 text-primary">→ ${f.recommendedMonthly}/mo</span>
              )}
            </div>
            <div className="md:col-span-6">
              <div className="flex items-center gap-2">
                {f.severity === "ok" ? (
                  <Check size={16} className="text-primary" />
                ) : (
                  <span
                    className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      f.severity === "major"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {f.severity}
                  </span>
                )}
                <span className="font-medium">{f.action}</span>
                {f.monthlySavings > 0 && (
                  <span className="ml-auto font-mono text-primary text-sm">
                    -${f.monthlySavings}/mo
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{f.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShareCard({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-wrap items-center gap-4">
      <Share2 size={20} className="text-primary" />
      <div className="flex-1 min-w-[200px]">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Public share link</div>
        <div className="font-mono text-xs md:text-sm truncate text-foreground/80">{shareUrl}</div>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex items-center gap-2 rounded-md bg-secondary border border-border px-3 py-2 text-sm hover:border-primary/50"
      >
        <Copy size={14} /> {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just audited my AI tool stack with Stackwise →")}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-3 py-2 text-sm font-semibold"
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
  result: AuditResult;
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
          findings: result.findings.map((f) => ({
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
      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
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
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-3">
        <Mail size={16} className="text-primary" />
        <h3 className="font-semibold">
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
          className="rounded-md bg-input border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-md bg-input border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="text"
          placeholder="Role (optional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md bg-input border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="number"
          placeholder="Team size (optional)"
          value={leadTeamSize ?? ""}
          onChange={(e) =>
            setLeadTeamSize(e.target.value ? Number(e.target.value) : undefined)
          }
          className="rounded-md bg-input border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
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
        className="mt-4 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold w-full md:w-auto disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Email me the report"}
      </button>
    </form>
  );
}

function Benchmark({ result }: { result: AuditResult }) {
  const ratio = result.perDeveloperSpend / Math.max(1, result.benchmarkPerDeveloper);
  const verdict =
    ratio > 1.4 ? "well above" : ratio > 1.1 ? "above" : ratio < 0.7 ? "below" : "in line with";
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        Benchmark vs. peer startups
      </div>
      <p className="mt-2 text-foreground/90">
        Your AI spend per developer is <span className="font-mono font-semibold">${result.perDeveloperSpend}/mo</span>.
        That's <span className="font-semibold">{verdict}</span> the
        <span className="font-mono"> ${result.benchmarkPerDeveloper}/mo</span> average for
        2–20 person teams we've audited.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Want this on your blog? See{" "}
        <Link to="/" className="underline text-primary">embeddable widget</Link>.
      </p>
    </div>
  );
}