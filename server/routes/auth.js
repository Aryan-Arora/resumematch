import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ email: req.userEmail, orgId: req.orgId });
});

export default router;
