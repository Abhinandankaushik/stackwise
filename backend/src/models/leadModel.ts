import mongoose, { Schema } from "mongoose";

export interface LeadRecord {
  email: string;
  company?: string | null;
  role?: string | null;
  team_size?: number | null;
  audit_id: string;
  monthly_savings?: number | null;
  audit_state?: string | null;
  created_at?: Date;
}

const LeadSchema = new Schema<LeadRecord>({
  email: { type: String, required: true, index: true },
  company: { type: String, default: null },
  role: { type: String, default: null },
  team_size: { type: Number, default: null },
  audit_id: { type: String, required: true },
  monthly_savings: { type: Number, default: null },
  audit_state: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

LeadSchema.index({ created_at: -1 });

export const Lead = mongoose.models.Lead || mongoose.model<LeadRecord>("Lead", LeadSchema);

export async function createLead(row: LeadRecord) {
  const newLead = new Lead(row);
  await newLead.save();
}
