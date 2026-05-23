import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.MONGODB_URI ?? process.env.DATABASE_URL ?? "",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "Stackwise <audits@stackwise.app>",
  siteUrl: process.env.SITE_URL ?? process.env.FRONTEND_URL ?? "http://localhost:5173",
};

export function hasDatabase() {
  return Boolean(env.databaseUrl) && (env.databaseUrl.startsWith("mongodb://") || env.databaseUrl.startsWith("mongodb+srv://"));
}

export function hasGemini() {
  return Boolean(env.geminiApiKey) && env.geminiApiKey !== "AIzaSy..." && !env.geminiApiKey.includes("...");
}

export function hasResend() {
  return Boolean(env.resendApiKey);
}
