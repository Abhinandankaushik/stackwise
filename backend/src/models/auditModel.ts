import mongoose, { Schema } from "mongoose";

export interface AuditRecord {
  id: string; // The base64 URL slug
  payload: unknown;
  use_case: string;
  team_size: number;
  monthly_savings: number;
  created_at?: Date;
}

const AuditSchema = new Schema<AuditRecord>({
  id: { type: String, required: true, unique: true }, // The slug acts as primary key ID
  payload: { type: Schema.Types.Mixed, required: true },
  use_case: { type: String, required: true },
  team_size: { type: Number, required: true },
  monthly_savings: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export const Audit = mongoose.models.Audit || mongoose.model<AuditRecord>("Audit", AuditSchema);

export async function createAudit(row: AuditRecord) {
  // Insert or update on conflict (id)
  await Audit.findOneAndUpdate(
    { id: row.id },
    row,
    { upsert: true, new: true }
  );
}
