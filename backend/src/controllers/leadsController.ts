import type { Request, Response } from "express";
import { hasDatabase } from "../config/database.js";
import { createAudit } from "../models/auditModel.js";
import { createLead } from "../models/leadModel.js";
import { sendAuditConfirmationEmail } from "../services/emailService.js";

export async function createLeadHandler(req: Request, res: Response) {
  const body = req.body;

  if (body.honeypot) {
    return res.json({ ok: true, skipped: "honeypot" });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }
  if (!body.auditId) {
    return res.status(400).json({ error: "auditId required" });
  }

  let stored = false;

  if (hasDatabase()) {
    await createLead({
      email,
      company: body.company ?? null,
      role: body.role ?? null,
      team_size: body.teamSize ?? null,
      audit_id: body.auditId,
      monthly_savings: body.monthlySavings ?? null,
      audit_state: body.auditState ?? null,
    });

    if (body.auditPayload) {
      await createAudit({
        id: body.auditId,
        payload: body.auditPayload.payload,
        use_case: body.auditPayload.useCase,
        team_size: body.auditPayload.teamSize,
        monthly_savings: body.auditPayload.monthlySavings ?? 0,
      });
    }
    stored = true;
  } else {
    console.warn("[stackwise] DATABASE_URL missing — lead not persisted:", email);
  }

  let emailSent = false;
  try {
    const out = await sendAuditConfirmationEmail({
      to: email,
      monthlySavings: body.monthlySavings ?? 0,
      annualSavings: body.annualSavings ?? 0,
      auditState: body.auditState ?? "some_savings",
      shareUrl: body.shareUrl,
    });
    emailSent = out.sent === true;
  } catch (err) {
    console.error("[stackwise] Resend error:", err);
  }

  return res.json({
    ok: true,
    stored,
    emailSent,
    message: stored
      ? "Lead saved. Check your inbox for the audit confirmation."
      : "Lead accepted (set DATABASE_URL to persist to Neon).",
  });
}
