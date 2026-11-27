import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

// Tratamento central de erros: toda rota pode lançar erro e ele cai aqui.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ erro: "Dados inválidos", detalhes: err.issues });
    return;
  }
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
};
