import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/auth/check", requireAuth, (req, res) => {
  res.json({ ok: true });
});

export default router;
