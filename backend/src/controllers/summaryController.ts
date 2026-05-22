import type { Request, Response } from "express";
import { generateSummary } from "../services/summaryService.js";

export async function createSummaryHandler(req: Request, res: Response) {
  const { result, useCase } = req.body ?? {};
  if (!result || !useCase) {
    return res.status(400).json({ error: "result and useCase required" });
  }
  const out = await generateSummary(result, useCase);
  return res.json(out);
}
