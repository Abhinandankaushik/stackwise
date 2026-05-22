import { describe, it, expect } from "vitest";
import { runAudit, templatedSummary } from "./audit-engine";

describe("audit-engine", () => {
  it("flags Cursor Business as overkill for 2 seats", () => {
    const r = runAudit({
      tools: [{ toolId: "cursor", planId: "business", seats: 2, monthlySpend: 0 }],
      teamSize: 2,
      useCase: "coding",
    });
    expect(r.monthlySavings).toBeGreaterThan(0);
    expect(r.findings[0].action).toMatch(/Pro/i);
    expect(r.findings[0].severity).toBe("major");
  });

  it("leaves Cursor Pro alone for a small coding team", () => {
    const r = runAudit({
      tools: [{ toolId: "cursor", planId: "pro", seats: 3, monthlySpend: 0 }],
      teamSize: 3,
      useCase: "coding",
    });
    expect(r.monthlySavings).toBe(0);
    expect(r.state).toBe("optimal");
  });

  it("detects Cursor + Copilot redundancy and drops Copilot", () => {
    const r = runAudit({
      tools: [
        { toolId: "cursor", planId: "pro", seats: 5, monthlySpend: 0 },
        { toolId: "copilot", planId: "individual", seats: 5, monthlySpend: 0 },
      ],
      teamSize: 5,
      useCase: "coding",
    });
    const copilot = r.findings.find((f) => f.toolId === "copilot")!;
    expect(copilot.recommendedMonthly).toBe(0);
    expect(copilot.action).toMatch(/Drop/i);
  });

  it("recommends Credex credits for high API spend", () => {
    const r = runAudit({
      tools: [{ toolId: "anthropic_api", planId: "api", seats: 1, monthlySpend: 2400 }],
      teamSize: 4,
      useCase: "coding",
    });
    expect(r.findings[0].credexEligible).toBe(true);
    expect(r.monthlySavings).toBeGreaterThan(200);
    expect(r.state).toBe("high_savings");
  });

  it("downgrades Claude Max for non-coding use cases", () => {
    const r = runAudit({
      tools: [{ toolId: "claude", planId: "max", seats: 1, monthlySpend: 0 }],
      teamSize: 1,
      useCase: "writing",
    });
    expect(r.findings[0].action).toMatch(/Pro/);
    expect(r.monthlySavings).toBe(80); // 100 - 20
  });

  it("annual savings = monthly × 12 and never negative", () => {
    const r = runAudit({
      tools: [{ toolId: "gemini", planId: "ultra", seats: 1, monthlySpend: 0 }],
      teamSize: 1,
      useCase: "research",
    });
    expect(r.annualSavings).toBe(r.monthlySavings * 12);
    expect(r.monthlySavings).toBeGreaterThanOrEqual(0);
  });

  it("templated summary handles optimal state gracefully", () => {
    const r = runAudit({
      tools: [{ toolId: "cursor", planId: "pro", seats: 2, monthlySpend: 0 }],
      teamSize: 2,
      useCase: "coding",
    });
    const s = templatedSummary(r, "coding");
    expect(s.length).toBeGreaterThan(50);
    expect(s).toMatch(/tight|spending well|optimal|stack/i);
  });
});