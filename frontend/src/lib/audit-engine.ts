import { TOOLS, getTool, getPlan, type ToolId } from "./pricing";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolEntry {
  toolId: ToolId;
  planId: string;
  seats: number;
  monthlySpend: number; // user-reported, used when plan is API/usage-based
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export type Severity = "ok" | "minor" | "major";

export interface ToolFinding {
  toolId: ToolId;
  toolName: string;
  planLabel: string;
  currentMonthly: number;
  recommendedMonthly: number;
  monthlySavings: number;
  action: string;
  reason: string;
  severity: Severity;
  credexEligible: boolean; // true when buying credits / switching to API saves real money
}

export interface AuditResult {
  findings: ToolFinding[];
  totalCurrent: number;
  totalRecommended: number;
  monthlySavings: number;
  annualSavings: number;
  perDeveloperSpend: number;
  benchmarkPerDeveloper: number; // industry-ish benchmark
  state: "high_savings" | "some_savings" | "optimal";
  generatedAt: string;
}

// Rough industry benchmark per developer per month (coding-heavy teams).
const BENCHMARK_PER_DEV = 55;

/**
 * Defensible audit rules. Each rule returns null if not applicable, or a
 * ToolFinding describing the recommended action and savings.
 *
 * Math is deliberately conservative — we'd rather under-promise.
 */
function evaluateEntry(entry: ToolEntry, input: AuditInput): ToolFinding {
  const tool = getTool(entry.toolId);
  const plan = getPlan(entry.toolId, entry.planId);
  const seats = Math.max(1, entry.seats);
  const current = plan.isApi ? entry.monthlySpend : plan.pricePerSeat * seats;

  // Default = on the right plan.
  let finding: ToolFinding = {
    toolId: tool.id,
    toolName: tool.name,
    planLabel: plan.label,
    currentMonthly: round(current),
    recommendedMonthly: round(current),
    monthlySavings: 0,
    action: "Keep current plan",
    reason: "Your plan fits your team size and usage.",
    severity: "ok",
    credexEligible: false,
  };

  // RULE 1 — Team / Business plan for tiny teams is overkill.
  // Cursor Business at $40 vs Pro at $20 with <3 seats.
  if (tool.id === "cursor" && plan.id === "business" && seats < 3) {
    const proPrice = getPlan("cursor", "pro").pricePerSeat * seats;
    finding = {
      ...finding,
      recommendedMonthly: round(proPrice),
      monthlySavings: round(current - proPrice),
      action: `Downgrade to Cursor Pro`,
      reason: `Business adds SSO + admin tools you don't need below ~3 seats. Pro has the same model access.`,
      severity: "major",
      credexEligible: true,
    };
  }

  // ChatGPT Team requires min 2 seats; on small teams Plus is cheaper.
  if (tool.id === "chatgpt" && plan.id === "team" && seats <= 2) {
    const plusPrice = getPlan("chatgpt", "plus").pricePerSeat * seats;
    finding = {
      ...finding,
      recommendedMonthly: round(plusPrice),
      monthlySavings: round(current - plusPrice),
      action: "Move 1–2 seats to ChatGPT Plus",
      reason: `Team's admin console isn't worth $10/seat extra for ≤2 users.`,
      severity: "minor",
      credexEligible: false,
    };
  }

  // Claude Team for tiny teams: Pro is cheaper.
  if (tool.id === "claude" && plan.id === "team" && seats <= 2) {
    const proPrice = getPlan("claude", "pro").pricePerSeat * seats;
    finding = {
      ...finding,
      recommendedMonthly: round(proPrice),
      monthlySavings: round(current - proPrice),
      action: "Use Claude Pro instead of Team",
      reason: `Team only matters above 2–3 seats for shared projects + central billing.`,
      severity: "minor",
      credexEligible: false,
    };
  }

  // Claude Max — usually overkill unless heavy coding usage.
  if (tool.id === "claude" && plan.id === "max" && input.useCase !== "coding") {
    const proPrice = getPlan("claude", "pro").pricePerSeat * seats;
    finding = {
      ...finding,
      recommendedMonthly: round(proPrice),
      monthlySavings: round(current - proPrice),
      action: "Downgrade Claude Max → Pro",
      reason: `Max's 5–20× usage is only worth it for sustained Claude Code workflows. For ${input.useCase}, Pro is enough.`,
      severity: "major",
      credexEligible: true,
    };
  }

  // Copilot Business vs Individual when team is small + no compliance needs.
  if (tool.id === "copilot" && plan.id === "business" && seats < 5) {
    const indiv = getPlan("copilot", "individual").pricePerSeat * seats;
    finding = {
      ...finding,
      recommendedMonthly: round(indiv),
      monthlySavings: round(current - indiv),
      action: "Use Copilot Individual seats",
      reason: `Business adds policy controls + audit logs that small teams rarely use. Same model.`,
      severity: "minor",
      credexEligible: false,
    };
  }

  // Gemini Ultra is almost always overkill unless Veo / heavy multimodal.
  if (tool.id === "gemini" && plan.id === "ultra") {
    const proPrice = getPlan("gemini", "pro").pricePerSeat * seats;
    finding = {
      ...finding,
      recommendedMonthly: round(proPrice),
      monthlySavings: round(current - proPrice),
      action: "Downgrade Gemini Ultra → Pro",
      reason: `Ultra's Veo 3 + Deep Think only matters for video / research-heavy use. Pro covers 2.5 Pro chat.`,
      severity: "major",
      credexEligible: true,
    };
  }

  // RULE 2 — Cross-tool overlap: paying for Cursor Pro + Copilot Individual = redundant AI coding.
  // We don't return inside the per-entry loop; handled in `runAudit`.

  // RULE 3 — API direct + retail subscription. If user reports high API spend,
  // they're a candidate for Credex credits.
  if (plan.isApi && current >= 300) {
    const credexDiscount = 0.25; // ~25% effective via discounted credits
    const recommended = current * (1 - credexDiscount);
    finding = {
      ...finding,
      recommendedMonthly: round(recommended),
      monthlySavings: round(current - recommended),
      action: `Switch ${tool.name} usage to discounted credits via Credex`,
      reason: `At $${Math.round(current)}/mo in API spend, discounted credits typically clear ~25% off retail.`,
      severity: "major",
      credexEligible: true,
    };
  }

  return finding;
}

function round(n: number): number {
  return Math.max(0, Math.round(n));
}

export function runAudit(input: AuditInput): AuditResult {
  const findings = input.tools.map((e) => evaluateEntry(e, input));

  // Cross-tool overlap: Cursor (paid) + Copilot (paid) for same user-base.
  const hasPaidCursor = findings.find(
    (f) => f.toolId === "cursor" && f.currentMonthly > 0,
  );
  const copilotFinding = findings.find(
    (f) => f.toolId === "copilot" && f.currentMonthly > 0,
  );
  if (hasPaidCursor && copilotFinding && copilotFinding.monthlySavings === 0) {
    copilotFinding.recommendedMonthly = 0;
    copilotFinding.monthlySavings = copilotFinding.currentMonthly;
    copilotFinding.action = "Drop GitHub Copilot — overlaps with Cursor";
    copilotFinding.reason = `You're paying twice for AI code completion. Pick one. Cursor's tab model is competitive with Copilot in 2025.`;
    copilotFinding.severity = "major";
    copilotFinding.credexEligible = true;
  }

  const totalCurrent = findings.reduce((s, f) => s + f.currentMonthly, 0);
  const totalRecommended = findings.reduce((s, f) => s + f.recommendedMonthly, 0);
  const monthlySavings = totalCurrent - totalRecommended;
  const perDev = input.teamSize > 0 ? totalCurrent / input.teamSize : totalCurrent;

  let state: AuditResult["state"] = "optimal";
  if (monthlySavings >= 500) state = "high_savings";
  else if (monthlySavings >= 100) state = "some_savings";

  return {
    findings,
    totalCurrent: round(totalCurrent),
    totalRecommended: round(totalRecommended),
    monthlySavings: round(monthlySavings),
    annualSavings: round(monthlySavings * 12),
    perDeveloperSpend: round(perDev),
    benchmarkPerDeveloper: BENCHMARK_PER_DEV,
    state,
    generatedAt: new Date().toISOString(),
  };
}

export function templatedSummary(result: AuditResult, useCase: UseCase): string {
  if (result.state === "optimal") {
    return `Your stack looks tight. Across ${result.findings.length} tools you're spending ~$${result.totalCurrent}/mo with no obvious overspend for a ${useCase}-focused team. The one thing to watch: as you grow, switching API usage to discounted credits usually compounds into real money by month six. We'll ping you when a new rule applies to your stack.`;
  }
  const top = [...result.findings].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  return `You're spending ~$${result.totalCurrent}/mo on AI tools across ${result.findings.length} vendors. The biggest leak is ${top.toolName}: ${top.action.toLowerCase()} alone saves ~$${top.monthlySavings}/mo. Stacking every recommendation here cuts roughly $${result.monthlySavings}/mo (≈$${result.annualSavings}/yr) without losing capability for your ${useCase} workload. ${result.state === "high_savings" ? "At this scale, sourcing the rest through discounted credits is the obvious next move." : "Small wins, but worth doing before the next renewal."}`;
}