import { z } from "zod";

// Valida as variáveis de ambiente na inicialização: se faltar algo, o servidor nem sobe.
const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  FRONTEND_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
