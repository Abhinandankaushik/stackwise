import { query } from "../config/database.js";

export interface LeadRecord {
  email: string;
  company?: string | null;
  role?: string | null;
  team_size?: number | null;
  audit_id: string;
  monthly_savings?: number | null;
  audit_state?: string | null;
}

export async function createLead(row: LeadRecord) {
  await query(
    `insert into leads (email, company, role, team_size, audit_id, monthly_savings, audit_state)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      row.email,
      row.company ?? null,
      row.role ?? null,
      row.team_size ?? null,
      row.audit_id,
      row.monthly_savings ?? null,
      row.audit_state ?? null,
    ],
  );
}
