# Arquitetura

Este documento explica **como o código é organizado** e **por quê**. A ideia é inspirada em
Clean Architecture, mas sem formalismo: poucas regras, fáceis de seguir e de revisar.

---

## 1. Stack e por que escolhemos cada item

| Tecnologia              | Para quê                         | Por quê                                                                                     |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| **Next.js**             | site público + painel `/admin`   | Um app só para as duas coisas; páginas rápidas e boas para SEO; Server Actions simplificam o admin. |
| **TypeScript**          | linguagem                        | Erros aparecem no editor antes de chegar ao usuário; autocompletar ajuda iniciantes.        |
| **Supabase**            | Postgres, login e arquivos       | Banco, autenticação e storage prontos, com plano gratuito; menos infraestrutura para manter. |
| **Prisma**              | acesso ao banco                  | Consultas com tipos do TypeScript e migrações versionadas no Git.                           |
| **Zod**                 | validação                        | Uma regra escrita uma vez gera o tipo TypeScript **e** valida os dados do formulário.       |
| **Tailwind + shadcn/ui**| visual                           | Estilo direto no componente; componentes acessíveis prontos e editáveis.                    |
| **ESLint + Prettier**   | qualidade e formatação           | Código com o mesmo estilo para todos; menos discussão no PR.                                |
| **Vitest**              | testes de unidade                | Rápido e com a mesma sintaxe do Jest (muito material de estudo).                            |
| **Playwright**          | testes ponta a ponta             | Simula um navegador de verdade para testar fluxos completos.                                |
| **Node 22 + pnpm**      | ambiente                         | Versão LTS do Node; pnpm instala rápido e ocupa menos disco.                                |

---

## 2. Estrutura de pastas

```
src/
├── app/                          ← ROTAS (finas)
│   ├── (publico)/                ← site público (o "(publico)" não aparece na URL)
│   │   ├── page.tsx              ← home  →  /
│   │   └── portfolio/
│   │       └── page.tsx          ←  /portfolio
│   ├── admin/                    ← painel  →  /admin
│   │   └── portfolio/
│   │       └── page.tsx          ←  /admin/portfolio
│   └── api/                      ← rotas de API (só se precisar)
│
├── features/                     ← UMA PASTA POR ASSUNTO DO NEGÓCIO
│   └── portfolio/
│       ├── portfolio.schema.ts       ← tipos + validação (Zod)
│       ├── portfolio.repository.ts   ← acesso ao banco (Prisma) — o ÚNICO
│       ├── portfolio.service.ts      ← casos de uso (regras)
│       ├── portfolio.actions.ts      ← entrada do admin, checa permissão
│       ├── components/               ← componentes desta feature
│       │   ├── lista-projetos.tsx
│       │   └── form-projeto.tsx
│       └── portfolio.test.ts         ← testes
│
└── shared/                       ← CÓDIGO COMUM A VÁRIAS FEATURES
    ├── ui/                       ← botões, inputs, cards (shadcn/ui)
    ├── db/                       ← cliente do Prisma
    ├── auth/                     ← sessão e permissões (Supabase Auth)
    └── upload/                   ← envio de arquivos (Supabase Storage)
```

### O papel de cada camada

| Camada         | Faz                                                          | Não faz                                   |
| -------------- | ------------------------------------------------------------ | ----------------------------------------- |
| `app/` (rota)  | Recebe a requisição, monta a página com componentes          | Regra de negócio, acesso ao banco         |
| `components/`  | Mostra dados e formulários                                   | Acessar banco, chamar repository          |
| `actions`      | Checa permissão, valida entrada com Zod, chama o service     | Consultas Prisma                          |
| `service`      | Regras de negócio (ex.: "slug não pode repetir")             | Saber de tela, requisição ou Prisma       |
| `repository`   | Ler e gravar no banco com Prisma                             | Regra de negócio, checar permissão        |
| `schema`       | Define a forma dos dados e as regras de validação            | Qualquer efeito (banco, rede)             |

---

## 3. As 3 regras

### Regra 1 — Componente não acessa banco

O caminho é sempre: **tela → action → service → repository**.

```
[Formulário no /admin] → portfolio.actions.ts → portfolio.service.ts → portfolio.repository.ts → banco
```

Páginas **públicas** que só **leem** dados (Server Components) podem chamar o service
diretamente, porque não há permissão a checar:

```
[app/(publico)/portfolio/page.tsx] → portfolio.service.ts → portfolio.repository.ts → banco
```

Qualquer **escrita** (criar, editar, apagar) passa obrigatoriamente por uma action.

### Regra 2 — Só o repository usa Prisma

```ts
// ✅ portfolio.repository.ts
import { prisma } from "@/shared/db/prisma";

// ❌ portfolio.service.ts, page.tsx, componentes...
import { prisma } from "@/shared/db/prisma"; // proibido aqui
```

Assim, se um dia trocarmos a forma de acessar o banco, mexemos só nos repositories.

### Regra 3 — Uma feature não importa de outra

```ts
// ❌ dentro de features/portfolio/
import { buscarCliente } from "@/features/clientes/clientes.service";

// ✅ se as duas precisam, o código vai para shared/
import { formatarData } from "@/shared/utils/datas";
```

Quem junta duas features é a **rota** em `src/app/`, que pode importar de várias.

Resumo de quem importa o quê:

| Arquivo em…        | Pode importar de…                   |
| ------------------ | ----------------------------------- |
| `src/app/`         | `features/*` e `shared/`            |
| `features/<x>/`    | a própria feature `<x>` e `shared/` |
| `shared/`          | só `shared/` e bibliotecas externas |

---

## 4. Receita de feature nova

Sempre nesta ordem:

1. **schema** — o que é um "projeto"? Quais campos e regras?
2. **repository** — como ler/gravar no banco?
3. **service** — quais são os casos de uso e regras de negócio?
4. **action** — quem pode chamar? Valida a entrada e chama o service.
5. **telas** — componentes em `components/` e rotas finas em `src/app/`.
6. **teste** — testa o service (e o schema) com Vitest.

Seguir a ordem evita retrabalho: cada passo usa o anterior.

---

## 5. Exemplo completo: feature `portfolio`

> Os trechos abaixo são **ilustrativos** para mostrar o padrão. Os nomes exatos de funções
> do `shared/` serão definidos na etapa 2.

### 5.0 Modelo no Prisma (`prisma/schema.prisma`)

```prisma
model Projeto {
  id        String   @id @default(cuid())
  titulo    String
  slug      String   @unique
  resumo    String
  imagemUrl String?
  publicado Boolean  @default(false)
  criadoEm  DateTime @default(now())
}
```

### 5.1 Schema — `portfolio.schema.ts`

```ts
import { z } from "zod";

export const projetoSchema = z.object({
  titulo: z.string().min(3, "O título precisa ter pelo menos 3 letras"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Use só letras minúsculas, números e hífen"),
  resumo: z.string().max(300, "Máximo de 300 caracteres"),
  imagemUrl: z.string().url().optional(),
  publicado: z.boolean().default(false),
});

// O tipo TypeScript sai da própria regra: escrevemos uma vez só.
export type NovoProjeto = z.infer<typeof projetoSchema>;
```

### 5.2 Repository — `portfolio.repository.ts`

```ts
import { prisma } from "@/shared/db/prisma";
import type { NovoProjeto } from "./portfolio.schema";

export const portfolioRepository = {
  listarPublicados() {
    return prisma.projeto.findMany({
      where: { publicado: true },
      orderBy: { criadoEm: "desc" },
    });
  },

  buscarPorSlug(slug: string) {
    return prisma.projeto.findUnique({ where: { slug } });
  },

  criar(dados: NovoProjeto) {
    return prisma.projeto.create({ data: dados });
  },
};
```

### 5.3 Service — `portfolio.service.ts`

```ts
import { portfolioRepository } from "./portfolio.repository";
import type { NovoProjeto } from "./portfolio.schema";

export async function listarProjetosPublicados() {
  return portfolioRepository.listarPublicados();
}

export async function criarProjeto(dados: NovoProjeto) {
  // Regra de negócio: não pode haver dois projetos com o mesmo slug.
  const existente = await portfolioRepository.buscarPorSlug(dados.slug);
  if (existente) {
    throw new Error("Já existe um projeto com esse endereço (slug).");
  }
  return portfolioRepository.criar(dados);
}
```

### 5.4 Action — `portfolio.actions.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/shared/auth";
import { projetoSchema } from "./portfolio.schema";
import { criarProjeto } from "./portfolio.service";

export async function criarProjetoAction(formData: FormData) {
  // 1. Permissão: só admin pode criar.
  await exigirAdmin();

  // 2. Validação com o schema.
  const resultado = projetoSchema.safeParse({
    titulo: formData.get("titulo"),
    slug: formData.get("slug"),
    resumo: formData.get("resumo"),
    publicado: formData.get("publicado") === "on",
  });
  if (!resultado.success) {
    return { ok: false, erros: resultado.error.flatten().fieldErrors };
  }

  // 3. Caso de uso.
  await criarProjeto(resultado.data);

  // 4. Atualiza as páginas que mostram projetos.
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
  return { ok: true };
}
```

### 5.5 Telas

Componente — `components/lista-projetos.tsx` (só mostra dados recebidos):

```tsx
type Props = { projetos: { id: string; titulo: string; resumo: string }[] };

export function ListaProjetos({ projetos }: Props) {
  if (projetos.length === 0) return <p>Nenhum projeto publicado ainda.</p>;
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {projetos.map((p) => (
        <li key={p.id} className="rounded-lg border p-4">
          <h2 className="font-semibold">{p.titulo}</h2>
          <p className="text-sm text-muted-foreground">{p.resumo}</p>
        </li>
      ))}
    </ul>
  );
}
```

Componente — `components/form-projeto.tsx` (chama a action):

```tsx
import { criarProjetoAction } from "../portfolio.actions";

export function FormProjeto() {
  return (
    <form action={criarProjetoAction} className="space-y-3">
      <input name="titulo" placeholder="Título" />
      <input name="slug" placeholder="endereco-do-projeto" />
      <textarea name="resumo" placeholder="Resumo" />
      <label>
        <input type="checkbox" name="publicado" /> Publicado
      </label>
      <button type="submit">Salvar</button>
    </form>
  );
}
```

Rota pública (fina) — `src/app/(publico)/portfolio/page.tsx`:

```tsx
import { listarProjetosPublicados } from "@/features/portfolio/portfolio.service";
import { ListaProjetos } from "@/features/portfolio/components/lista-projetos";

export default async function PortfolioPage() {
  const projetos = await listarProjetosPublicados();
  return <ListaProjetos projetos={projetos} />;
}
```

Rota do admin (fina) — `src/app/admin/portfolio/page.tsx`:

```tsx
import { FormProjeto } from "@/features/portfolio/components/form-projeto";

export default function AdminPortfolioPage() {
  return (
    <section>
      <h1>Novo projeto</h1>
      <FormProjeto />
    </section>
  );
}
```

### 5.6 Teste — `portfolio.test.ts`

Testamos o service "fingindo" o repository (mock), sem precisar de banco:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarProjeto } from "./portfolio.service";
import { portfolioRepository } from "./portfolio.repository";
import { projetoSchema } from "./portfolio.schema";

vi.mock("./portfolio.repository", () => ({
  portfolioRepository: {
    buscarPorSlug: vi.fn(),
    criar: vi.fn(),
    listarPublicados: vi.fn(),
  },
}));

const dados = {
  titulo: "Site da Padaria",
  slug: "site-da-padaria",
  resumo: "Site institucional",
  publicado: true,
};

describe("portfolio", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria projeto quando o slug é novo", async () => {
    vi.mocked(portfolioRepository.buscarPorSlug).mockResolvedValue(null);
    await criarProjeto(dados);
    expect(portfolioRepository.criar).toHaveBeenCalledWith(dados);
  });

  it("recusa slug repetido", async () => {
    vi.mocked(portfolioRepository.buscarPorSlug).mockResolvedValue({ id: "1" } as never);
    await expect(criarProjeto(dados)).rejects.toThrow("Já existe");
  });

  it("schema recusa slug com maiúsculas", () => {
    const r = projetoSchema.safeParse({ ...dados, slug: "Site-Padaria" });
    expect(r.success).toBe(false);
  });
});
```

### 5.7 Commits sugeridos para essa feature

Uma branch `feature/12-secao-portfolio`, com commits como:

- `feat(portfolio): adiciona schema e repository de projetos`
- `feat(portfolio): adiciona service e action de criação`
- `feat(portfolio): adiciona telas pública e do admin`
- `test(portfolio): cobre criação e slug repetido`

E o título do PR (que vira o commit em `dev`): `feat(portfolio): adiciona seção de portfólio`.
