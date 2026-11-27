// Cliente HTTP único para conversar com o backend.
// Componentes e páginas usam estas funções em vez de chamar fetch direto.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    throw new Error(`Erro ${res.status} ao acessar ${path}`);
  }
  return res.json() as Promise<T>;
}
