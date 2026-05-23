import { GoogleGenerativeAI } from "@google/generative-ai";

export function hasGemini(): boolean {
  const geminiKey = process.env.GEMINI_API_KEY ?? "";
  return Boolean(geminiKey) && geminiKey !== "AIzaSy..." && !geminiKey.includes("...");
}

const SYSTEM_PROMPT = `You are a finance-literate engineering coach writing for a startup founder.
Rules:
- 80–110 words. One paragraph. No bullets.
- Lead with the single biggest savings opportunity by name.
- Cite exact dollar amounts from the input.
- No marketing speak ("leverage", "synergy", "unlock").
- If no savings, say so honestly. Don't manufacture wins.
- Mention Credex once, only if monthly savings > $500.
- End on a concrete next action this week.`;

export interface AuditResultPayload {
  findings: {
    toolName: string;
    action: string;
    monthlySavings: number;
    reason: string;
  }[];
  totalCurrent: number;
  totalRecommended: number;
  monthlySavings: number;
  annualSavings: number;
  state: string;
}

function buildUserPrompt(result: AuditResultPayload, useCase: string): string {
  const top = [...result.findings]
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 3)
    .map((f) => `${f.toolName}: ${f.action} (save $${f.monthlySavings}/mo) — ${f.reason}`)
    .join("\n");

  return `Team use case = ${useCase}
Current: $${result.totalCurrent}/mo across ${result.findings.length} tools
Recommended: $${result.totalRecommended}/mo
Savings: $${result.monthlySavings}/mo ($${result.annualSavings}/yr)
Top findings:
${top}`;
}

export function templatedSummary(result: AuditResultPayload, useCase: string): string {
  if (result.state === "optimal") {
    return `Your stack looks tight. Across ${result.findings.length} tools you're spending ~$${result.totalCurrent}/mo with no obvious overspend for a ${useCase}-focused team. Watch API usage — discounted credits usually compound by month six. We'll ping you when a new rule applies.`;
  }
  const top = [...result.findings].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  return `You're spending ~$${result.totalCurrent}/mo on AI tools. The biggest leak is ${top.toolName}: ${top.action.toLowerCase()} saves ~$${top.monthlySavings}/mo. Stacking recommendations cuts ~$${result.monthlySavings}/mo (≈$${result.annualSavings}/yr) for your ${useCase} workload. ${result.state === "high_savings" ? "At this scale, discounted credits via Credex is the obvious next move." : "Worth doing before the next renewal."}`;
}

export async function generateSummary(result: AuditResultPayload, useCase: string) {
  if (hasGemini()) {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY ?? "";
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          maxOutputTokens: 220,
          temperature: 0.7,
        },
      });

      const response = await model.generateContent(buildUserPrompt(result, useCase));
      const text = response.response.text()?.trim();
      if (!text) throw new Error("empty response");
      return { text, source: "ai" as const };
    } catch (err) {
      console.error("[stackwise] Gemini failed:", err);
      return { text: templatedSummary(result, useCase), source: "template" as const };
    }
  }

  return { text: templatedSummary(result, useCase), source: "template" as const };
}

