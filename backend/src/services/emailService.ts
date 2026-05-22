import { env, hasResend } from "../config/env.js";
import { auditConfirmationHtml } from "../views/emailTemplates.js";

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

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.resendFromEmail,
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
