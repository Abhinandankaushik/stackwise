import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SpendForm } from "@/components/SpendForm";
import { runAudit, type AuditInput } from "@/lib/audit-engine";
import { encodeSharePayload } from "@/lib/storage";

export function WidgetPage() {
  const [searchParams] = useSearchParams();
  const [bgColor, setBgColor] = useState("transparent");
  const [defaultTeamSize, setDefaultTeamSize] = useState(1);
  const [defaultUseCase, setDefaultUseCase] = useState("coding");

  // Read configuration from query params
  useEffect(() => {
    const theme = searchParams.get("theme") ?? "dark";
    if (theme === "dark") {
      setBgColor("rgb(20, 21, 26)");
    } else {
      setBgColor("transparent");
    }

    const size = Number(searchParams.get("teamSize") ?? "1");
    if (!isNaN(size) && size > 0) {
      setDefaultTeamSize(size);
    }

    const useCase = searchParams.get("useCase") ?? "coding";
    setDefaultUseCase(useCase);
  }, [searchParams]);

  function handleSubmit(input: AuditInput) {
    const r = runAudit(input);
    const slug = encodeSharePayload({
      findings: r.findings,
      totals: {
        current: r.totalCurrent,
        recommended: r.totalRecommended,
        savings: r.monthlySavings,
        annual: r.annualSavings,
      },
      state: r.state,
      useCase: input.useCase,
      teamSize: input.teamSize,
      generatedAt: r.generatedAt,
    });

    const shareUrl = `${window.location.origin}/a/${slug}`;

    // If loaded inside an iframe, redirect the parent page. Otherwise, redirect this tab.
    if (window.self !== window.top) {
      window.open(shareUrl, "_top");
    } else {
      window.location.href = shareUrl;
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 antialiased text-foreground"
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full max-w-xl">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary font-semibold">
            Audit Powered by Stackwise
          </div>
        </div>
        {/* We recreate SpendForm with default props or pass initial state if we modify SpendForm */}
        <SpendForm onSubmit={handleSubmit} initialTeamSize={defaultTeamSize} initialUseCase={defaultUseCase} isWidget />
      </div>
    </div>
  );
}
