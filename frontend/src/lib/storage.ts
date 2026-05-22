import type { AuditInput } from "./audit-engine";
import { apiPath } from "./api";

const FORM_KEY = "stackwise.form.v1";

export function saveFormDraft(input: Partial<AuditInput>) {
  localStorage.setItem(FORM_KEY, JSON.stringify(input));
}

export function loadFormDraft(): Partial<AuditInput> | null {
  try {
    const raw = localStorage.getItem(FORM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export interface SubmitLeadPayload {
  email: string;
  company?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  honeypot?: string;
  monthlySavings: number;
  annualSavings: number;
  auditState: string;
  shareUrl?: string;
  auditPayload?: {
    useCase: string;
    teamSize: number;
    monthlySavings: number;
    payload: unknown;
  };
}

export async function submitLead(payload: SubmitLeadPayload): Promise<{
  ok: boolean;
  stored?: boolean;
  emailSent?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(apiPath("/api/public/leads"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      stored?: boolean;
      emailSent?: boolean;
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, error: data.error ?? `Request failed (${res.status})` };
    }
    return { ok: true, stored: data.stored, emailSent: data.emailSent };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export function encodeSharePayload(payload: object): string {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeSharePayload<T = unknown>(slug: string): T | null {
  try {
    const b64 = slug.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
