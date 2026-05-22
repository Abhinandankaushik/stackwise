import { Router } from "express";
import { createLeadHandler } from "../controllers/leadsController.js";
import { createSummaryHandler } from "../controllers/summaryController.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "stackwise-api" });
});

router.post(
  "/api/public/leads",
  rateLimit(5, 60_000, "leads"),
  createLeadHandler,
);

router.post(
  "/api/summary",
  rateLimit(20, 60_000, "summary"),
  createSummaryHandler,
);

export default router;
