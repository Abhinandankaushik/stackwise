// PRICING DATA — see PRICING_DATA.md for sources and verification dates.
// Every number here must trace back to an official vendor pricing page.

export type ToolId =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export interface Plan {
  id: string;
  label: string;
  pricePerSeat: number; // monthly USD per seat; for API plans, 0 (usage-based)
  isApi?: boolean;
}

export interface ToolDef {
  id: ToolId;
  name: string;
  vendor: string;
  category: "coding" | "chat" | "api" | "mixed";
  plans: Plan[];
  url: string;
}

export const TOOLS: ToolDef[] = [
  {
    id: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    category: "coding",
    url: "https://cursor.com/pricing",
    plans: [
      { id: "hobby", label: "Hobby (Free)", pricePerSeat: 0 },
      { id: "pro", label: "Pro", pricePerSeat: 20 },
      { id: "business", label: "Business", pricePerSeat: 40 },
      { id: "enterprise", label: "Enterprise", pricePerSeat: 60 },
    ],
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    vendor: "GitHub",
    category: "coding",
    url: "https://github.com/features/copilot/plans",
    plans: [
      { id: "individual", label: "Individual", pricePerSeat: 10 },
      { id: "business", label: "Business", pricePerSeat: 19 },
      { id: "enterprise", label: "Enterprise", pricePerSeat: 39 },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    category: "chat",
    url: "https://www.anthropic.com/pricing",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0 },
      { id: "pro", label: "Pro", pricePerSeat: 20 },
      { id: "max", label: "Max", pricePerSeat: 100 },
      { id: "team", label: "Team", pricePerSeat: 30 },
      { id: "enterprise", label: "Enterprise", pricePerSeat: 60 },
      { id: "api", label: "API direct", pricePerSeat: 0, isApi: true },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    category: "chat",
    url: "https://openai.com/chatgpt/pricing",
    plans: [
      { id: "plus", label: "Plus", pricePerSeat: 20 },
      { id: "team", label: "Team", pricePerSeat: 30 },
      { id: "enterprise", label: "Enterprise", pricePerSeat: 60 },
      { id: "api", label: "API direct", pricePerSeat: 0, isApi: true },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    vendor: "Anthropic",
    category: "api",
    url: "https://www.anthropic.com/pricing#api",
    plans: [{ id: "api", label: "Usage-based", pricePerSeat: 0, isApi: true }],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    vendor: "OpenAI",
    category: "api",
    url: "https://openai.com/api/pricing/",
    plans: [{ id: "api", label: "Usage-based", pricePerSeat: 0, isApi: true }],
  },
  {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    category: "chat",
    url: "https://gemini.google/subscriptions/",
    plans: [
      { id: "pro", label: "Pro (AI Pro)", pricePerSeat: 20 },
      { id: "ultra", label: "Ultra", pricePerSeat: 250 },
      { id: "api", label: "API direct", pricePerSeat: 0, isApi: true },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    vendor: "Codeium",
    category: "coding",
    url: "https://windsurf.com/pricing",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0 },
      { id: "pro", label: "Pro", pricePerSeat: 15 },
      { id: "teams", label: "Teams", pricePerSeat: 30 },
    ],
  },
];

export function getTool(id: ToolId): ToolDef {
  const t = TOOLS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown tool: ${id}`);
  return t;
}

export function getPlan(toolId: ToolId, planId: string): Plan {
  const t = getTool(toolId);
  const p = t.plans.find((pl) => pl.id === planId);
  if (!p) throw new Error(`Unknown plan ${planId} for ${toolId}`);
  return p;
}