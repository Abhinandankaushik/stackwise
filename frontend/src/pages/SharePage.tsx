import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { decodeSharePayload } from "@/lib/storage";
import type { AuditResult, UseCase } from "@/lib/audit-engine";
import { ResultsView } from "@/components/ResultsView";
import { WidgetModal } from "@/components/WidgetModal";

interface SharePayload {
  findings: AuditResult["findings"];
  totals: { current: number; recommended: number; savings: number; annual: number };
  state: AuditResult["state"];
  useCase: UseCase;
  teamSize: number;
  generatedAt: string;
}

export function SharePage() {
  const { slug = "" } = useParams();
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);
  const payload = useMemo(() => decodeSharePayload<SharePayload>(slug), [slug]);

  if (!payload) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground p-8 text-center">
        <div>
          <h1 className="text-3xl font-bold">Audit not found</h1>
          <p className="mt-2 text-muted-foreground">The link is invalid or corrupted.</p>
          <Link to="/" className="mt-4 inline-block underline text-primary">
            Run a new audit
          </Link>
        </div>
      </div>
    );
  }

  const result: AuditResult = {
    findings: payload.findings,
    totalCurrent: payload.totals.current,
    totalRecommended: payload.totals.recommended,
    monthlySavings: payload.totals.savings,
    annualSavings: payload.totals.annual,
    perDeveloperSpend:
      payload.teamSize > 0
        ? Math.round(payload.totals.current / payload.teamSize)
        : payload.totals.current,
    benchmarkPerDeveloper: 55,
    state: payload.state,
    generatedAt: payload.generatedAt,
  };

  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">
              S
            </div>
            <span className="font-semibold tracking-tight">Stackwise</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWidgetModalOpen(true)}
              className="text-sm rounded-md bg-secondary text-foreground px-3 py-1.5 border border-border hover:border-primary/50 cursor-pointer hidden sm:inline-block"
            >
              Embed widget
            </button>
            <Link
              to="/"
              className="text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 font-semibold"
            >
              Run my own audit
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Public audit · {new Date(payload.generatedAt).toLocaleDateString()}
        </div>
        <ResultsView
          result={result}
          useCase={payload.useCase}
          shareUrl={shareUrl}
          auditId={slug}
          teamSize={payload.teamSize}
          onOpenWidgetModal={() => setWidgetModalOpen(true)}
          isPublic
        />
      </main>

      {/* Widget Creator Modal Overlay */}
      <WidgetModal
        isOpen={widgetModalOpen}
        onClose={() => setWidgetModalOpen(false)}
        initialTeamSize={payload.teamSize}
        initialUseCase={payload.useCase}
      />
    </div>
  );
}
