import express from "express";
import cors from "cors";
import { env } from "./shared/config/env.js";
import { errorHandler } from "./shared/http/error-handler.js";
import { healthRoutes } from "./features/health/health.routes.js";

export const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

// Rotas: cada feature registra o seu Router aqui.
app.use("/api/health", healthRoutes);

app.use(errorHandler);
