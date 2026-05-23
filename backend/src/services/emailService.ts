import { auditConfirmationHtml } from "../views/emailTemplates.js";

export function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendAuditConfirmationEmail(params: {
  to: string;
  monthlySavings: number;
  annualSavings: number;
  auditState: string;
  shareUrl?: string;
}) {
  if (!hasResend()) {
    console.warn("[stackwise] RESEND_API_KEY missing — skipping email");
    return { sent: false as const, reason: "not_configured" };
  }

  const high = params.auditState === "high_savings";
  const subject = high
    ? `Your Stackwise audit: ~$${params.monthlySavings}/mo in potential savings`
    : `Your Stackwise AI spend audit is saved`;

  const resendApiKey = process.env.RESEND_API_KEY ?? "";
  const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? "Stackwise <audits@stackwise.app>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [params.to],
      subject,
      html: auditConfirmationHtml(params),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend failed (${res.status}): ${await res.text()}`);
  }

  return { sent: true as const };
}

