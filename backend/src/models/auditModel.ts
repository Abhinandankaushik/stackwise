import { query } from "../config/database.js";

export interface AuditRecord {
  id: string;
  payload: unknown;
  use_case: string;
  team_size: number;
  monthly_savings: number;
}

export async function createAudit(row: AuditRecord) {
  await query(
    `insert into audits (id, payload, use_case, team_size, monthly_savings)
     values ($1, $2::jsonb, $3, $4, $5)
     on conflict (id) do update set
       payload = excluded.payload,
       use_case = excluded.use_case,
       team_size = excluded.team_size,
       monthly_savings = excluded.monthly_savings`,
    [row.id, JSON.stringify(row.payload), row.use_case, row.team_size, row.monthly_savings],
  );
}
