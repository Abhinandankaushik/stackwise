import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { TOOLS, type ToolId } from "@/lib/pricing";
import type { AuditInput, ToolEntry, UseCase } from "@/lib/audit-engine";
import { saveFormDraft, loadFormDraft } from "@/lib/storage";

interface Props {
  onSubmit: (input: AuditInput) => void;
  initialTeamSize?: number;
  initialUseCase?: string;
  isWidget?: boolean;
}

const USE_CASES: { id: UseCase; label: string }[] = [
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "data", label: "Data" },
  { id: "research", label: "Research" },
  { id: "mixed", label: "Mixed" },
];

function emptyEntry(toolId: ToolId = "cursor"): ToolEntry {
  const t = TOOLS.find((x) => x.id === toolId)!;
  return { toolId, planId: t.plans[1]?.id ?? t.plans[0].id, seats: 1, monthlySpend: 0 };
}

export function SpendForm({
  onSubmit,
  initialTeamSize = 1,
  initialUseCase = "coding",
  isWidget = false,
}: Props) {
  const [entries, setEntries] = useState<ToolEntry[]>([emptyEntry()]);
  const [teamSize, setTeamSize] = useState(initialTeamSize);
  const [useCase, setUseCase] = useState<UseCase>(initialUseCase as UseCase);

  // hydrate from localStorage
  useEffect(() => {
    if (isWidget) {
      setTeamSize(initialTeamSize);
      setUseCase(initialUseCase as UseCase);
      return;
    }
    const draft = loadFormDraft();
    if (draft) {
      if (draft.tools?.length) setEntries(draft.tools);
      if (draft.teamSize) setTeamSize(draft.teamSize);
      if (draft.useCase) setUseCase(draft.useCase);
    }
  }, [isWidget, initialTeamSize, initialUseCase]);

  // persist
  useEffect(() => {
    if (!isWidget) {
      saveFormDraft({ tools: entries, teamSize, useCase });
    }
  }, [entries, teamSize, useCase, isWidget]);

  const estimated = useMemo(() => {
    return entries.reduce((sum, e) => {
      const tool = TOOLS.find((t) => t.id === e.toolId);
      const plan = tool?.plans.find((p) => p.id === e.planId);
      if (!plan) return sum;
      return sum + (plan.isApi ? e.monthlySpend : plan.pricePerSeat * e.seats);
    }, 0);
  }, [entries]);

  function updateEntry(i: number, patch: Partial<ToolEntry>) {
    setEntries((prev) =>
      prev.map((e, idx) => {
        if (idx !== i) return e;
        const next = { ...e, ...patch };
        if (patch.toolId && patch.toolId !== e.toolId) {
          const t = TOOLS.find((x) => x.id === patch.toolId)!;
          next.planId = t.plans[1]?.id ?? t.plans[0].id;
        }
        return next;
      }),
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ tools: entries.filter((x) => x.toolId), teamSize, useCase });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 md:p-8 shadow-[var(--shadow-glow)]"
      aria-label="AI tool spend input"
    >
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Team size</span>
          <input
            type="number"
            min={1}
            value={teamSize}
            onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded-lg bg-input text-foreground border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Primary use case</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {USE_CASES.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => setUseCase(u.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  useCase === u.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry, i) => {
          const tool = TOOLS.find((t) => t.id === entry.toolId)!;
          const plan = tool.plans.find((p) => p.id === entry.planId);
          return (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 items-end rounded-xl border border-border bg-background/40 p-3"
            >
              <label className="col-span-12 md:col-span-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Tool</span>
                <select
                  value={entry.toolId}
                  onChange={(e) => updateEntry(i, { toolId: e.target.value as ToolId })}
                  className="mt-1 w-full rounded-md bg-input border border-border px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {TOOLS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <label className="col-span-7 md:col-span-3">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Plan</span>
                <select
                  value={entry.planId}
                  onChange={(e) => updateEntry(i, { planId: e.target.value })}
                  className="mt-1 w-full rounded-md bg-input border border-border px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {tool.plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </label>
              <label className="col-span-5 md:col-span-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Seats</span>
                <input
                  type="number"
                  min={1}
                  value={entry.seats}
                  onChange={(e) => updateEntry(i, { seats: Math.max(1, Number(e.target.value)) })}
                  className="mt-1 w-full rounded-md bg-input border border-border px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/50"
                />
              </label>
              <label className="col-span-9 md:col-span-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {plan?.isApi ? "API $/mo" : "Auto"}
                </span>
                <input
                  type="number"
                  min={0}
                  disabled={!plan?.isApi}
                  value={plan?.isApi ? entry.monthlySpend : (plan?.pricePerSeat ?? 0) * entry.seats}
                  onChange={(e) => updateEntry(i, { monthlySpend: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md bg-input border border-border px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                />
              </label>
              <button
                type="button"
                onClick={() => setEntries((p) => p.filter((_, idx) => idx !== i))}
                aria-label="Remove tool"
                className="col-span-3 md:col-span-1 h-9 rounded-md bg-secondary border border-border hover:border-destructive/60 hover:text-destructive flex items-center justify-center"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setEntries((p) => [...p, emptyEntry()])}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-secondary border border-border hover:border-primary/50"
        >
          <Plus size={14} /> Add tool
        </button>
        <div className="text-sm text-muted-foreground">
          Current monthly: <span className="text-foreground font-mono font-semibold">${estimated.toLocaleString()}</span>
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3.5 font-semibold hover:opacity-95 transition shadow-[var(--shadow-glow)]"
      >
        <Sparkles size={18} /> Run my audit <ArrowRight size={16} />
      </button>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        No login. No email until you've seen the result.
      </p>
    </form>
  );
}