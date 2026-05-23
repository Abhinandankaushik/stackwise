import { useState } from "react";
import { Sparkles, TrendingDown, ShieldCheck, Zap } from "lucide-react";
import { SpendForm } from "@/components/SpendForm";
import { ResultsView } from "@/components/ResultsView";
import { runAudit, type AuditInput, type AuditResult } from "@/lib/audit-engine";
import { encodeSharePayload } from "@/lib/storage";
import { WidgetModal } from "@/components/WidgetModal";

export function IndexPage() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [input, setInput] = useState<AuditInput | null>(null);
  const [slug, setSlug] = useState("");
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);

  function handleSubmit(i: AuditInput) {
    const r = runAudit(i);
    const shareSlug = encodeSharePayload({
      findings: r.findings,
      totals: {
        current: r.totalCurrent,
        recommended: r.totalRecommended,
        savings: r.monthlySavings,
        annual: r.annualSavings,
      },
      state: r.state,
      useCase: i.useCase,
      teamSize: i.teamSize,
      generatedAt: r.generatedAt,
    });
    setInput(i);
    setResult(r);
    setSlug(shareSlug);
    history.replaceState(null, "", `#audit-${shareSlug.slice(0, 8)}`);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  const shareUrl = result && slug ? `${window.location.origin}/a/${slug}` : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onOpenWidgetModal={() => setWidgetModalOpen(true)} />
      <main className="max-w-5xl mx-auto px-5 md:px-8 pt-14 pb-24">
        <Hero />
        <section id="form" className="mt-12">
          <SpendForm onSubmit={handleSubmit} />
        </section>
        {result && input && (
          <section id="results" className="mt-16 scroll-mt-16">
            <ResultsView
              result={result}
              useCase={input.useCase}
              shareUrl={shareUrl}
              auditId={slug}
              teamSize={input.teamSize}
              onOpenWidgetModal={() => setWidgetModalOpen(true)}
            />
          </section>
        )}
        <SocialProof />
        <FAQ onOpenWidgetModal={() => setWidgetModalOpen(true)} />
      </main>
      <Footer />

      {/* Standalone Widget Creator Modal */}
      <WidgetModal
        isOpen={widgetModalOpen}
        onClose={() => setWidgetModalOpen(false)}
        initialTeamSize={input?.teamSize ?? 1}
        initialUseCase={input?.useCase ?? "coding"}
      />
    </div>
  );
}

function Header({ onOpenWidgetModal }: { onOpenWidgetModal: () => void }) {
  return (
    <header className="border-b border-border/60">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">
            S
          </div>
          <span className="font-semibold tracking-tight">Stackwise</span>
          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
            by <a href="https://credex.rocks" className="underline">Credex</a>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWidgetModal}
            className="text-sm rounded-md bg-secondary text-foreground px-3 py-1.5 border border-border hover:border-primary/50 cursor-pointer hidden sm:inline-block"
          >
            Embed widget
          </button>
          <a
            href="#form"
            className="text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 font-semibold hover:opacity-90 cursor-pointer"
          >
            Run an audit
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="text-center pt-10">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground bg-secondary border border-border px-3 py-1 rounded-full">
        <Sparkles size={12} className="text-primary" /> Free · No login · 60 seconds
      </div>
      <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
        Mint for your <span className="text-primary">AI tool spend</span>.
      </h1>
      <p className="mt-5 max-w-2xl mx-auto text-lg text-muted-foreground">
        Tell us what you pay for. We tell you where you're leaking money on Cursor, Claude, Copilot,
        ChatGPT and the rest — with reasoning a finance person would actually agree with.
      </p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
        <Feature icon={<TrendingDown size={16} />} title="Real numbers">
          Every recommendation traces to a vendor pricing URL.
        </Feature>
        <Feature icon={<Zap size={16} />} title="Instant">
          Audit math is rules-based. Results in milliseconds.
        </Feature>
        <Feature icon={<ShieldCheck size={16} />} title="Honest">
          If your stack's already tight, we say so.
        </Feature>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 text-primary text-sm font-semibold">
        {icon} {title}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function SocialProof() {
  const logos = ["Acme.ai", "Northwind", "Loopkit", "Vector", "Brevity", "Sundial"];
  return (
    <section className="mt-24 text-center">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        Used by builders at <span className="italic">(mocked)</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 justify-center opacity-70">
        {logos.map((l) => (
          <span key={l} className="font-mono text-sm">{l}</span>
        ))}
      </div>
    </section>
  );
}

function FAQ({ onOpenWidgetModal }: { onOpenWidgetModal: () => void }) {
  const items = [
    {
      q: "How do you know what I should be paying?",
      a: "We maintain a pricing table sourced from every vendor's official pricing page. See PRICING_DATA.md in the repo.",
    },
    {
      q: "Is my data sent anywhere?",
      a: "Spend inputs stay in your browser until you opt in to email — then only email + audit summary go to our API (Neon Postgres). Public share links never include company name or email.",
    },
    {
      q: "Why is this free?",
      a: "Built by Credex, which sells discounted AI infrastructure credits. High-savings audits may route to a Credex consultation.",
    },
    {
      q: "Will it tell me to drop tools I love?",
      a: "No — right-sizing plans and removing overlap, not loyalty tests.",
    },
    {
      q: "Can I embed this on my blog?",
      a: (
        <span>
          Yes, you can customize and embed a mini Stackwise calculator on your website or blog.{" "}
          <button
            onClick={onOpenWidgetModal}
            className="underline text-primary font-medium cursor-pointer bg-transparent border-none p-0 inline hover:opacity-85"
          >
            Click here to open the Widget Creator
          </button>{" "}
          to customize the form style and copy your iframe embed code.
        </span>
      ),
    },
  ];
  return (
    <section className="mt-20">
      <h2 className="text-2xl font-bold">FAQ</h2>
      <div className="mt-4 divide-y divide-border border border-border rounded-xl overflow-hidden">
        {items.map((it, i) => (
          <details key={i} className="group bg-card text-foreground">
            <summary className="cursor-pointer list-none p-4 flex justify-between items-center select-none">
              <span className="font-medium">{it.q}</span>
              <span className="text-muted-foreground group-open:rotate-45 transition">+</span>
            </summary>
            <div className="px-4 pb-4 text-muted-foreground text-sm">{it.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="max-w-5xl mx-auto px-5 md:px-8 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} Stackwise · Built for Credex</span>
        <span>Pricing verified weekly · Neon Postgres · Express API</span>
      </div>
    </footer>
  );
}
