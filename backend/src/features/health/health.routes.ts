import { Router } from "express";

export const healthRoutes = Router();

// GET /api/health → usado para saber se a API está no ar.
healthRoutes.get("/", (_req, res) => {
  res.json({ status: "ok" });
});
