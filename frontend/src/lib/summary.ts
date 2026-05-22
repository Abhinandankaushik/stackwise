import { templatedSummary, type AuditResult, type UseCase } from "./audit-engine";
import { apiPath } from "./api";

export async function generateSummary(
  result: AuditResult,
  useCase: UseCase,
): Promise<{ text: string; source: "ai" | "template" }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(apiPath("/api/summary"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result, useCase }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { text?: string; source?: "ai" | "template" };
    if (!data.text) throw new Error("empty");
    return { text: data.text, source: data.source ?? "ai" };
  } catch {
    return { text: templatedSummary(result, useCase), source: "template" };
  }
}
