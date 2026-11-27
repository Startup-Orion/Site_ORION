import { apiGet } from "@/shared/api/client";

async function statusDaApi() {
  try {
    const { status } = await apiGet<{ status: string }>("/health", { cache: "no-store" });
    return status;
  } catch {
    return "fora do ar";
  }
}

export default async function HomePage() {
  const status = await statusDaApi();
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">ORION</h1>
      <p className="mt-2 text-gray-600">Site institucional em construção.</p>
      <p className="mt-6 text-sm">
        Status da API: <strong>{status}</strong>
      </p>
    </main>
  );
}
