# Site Institucional da ORION

Site público da ORION e painel administrativo (`/admin`) para a equipe gerenciar o
conteúdo (portfólio, textos, imagens etc.).

O repositório é um **monorepo pnpm** com duas pastas:

```
Site_ORION/
├── frontend/   ← Next.js: site público e painel /admin (porta 3000)
│   └── src/
│       ├── app/        ← rotas (páginas)
│       ├── features/   ← uma pasta por assunto do negócio
│       └── shared/     ← código comum (ex.: api/client.ts fala com o backend)
├── backend/    ← API Node + Express: regras de negócio e banco (porta 3333)
│   ├── prisma/         ← schema do banco e migrações
│   └── src/
│       ├── features/   ← uma pasta por assunto (routes, service, repository, schema, testes)
│       └── shared/     ← config, cliente do Prisma, tratamento de erros
├── docs/
└── package.json + pnpm-workspace.yaml
```

> **Status:** etapa 2 — estrutura inicial do frontend e do backend criada.

## Stack

| Parte                | Tecnologia                                   |
| -------------------- | -------------------------------------------- |
| Frontend (site + admin) | Next.js + TypeScript                      |
| Backend (API)        | Node + Express + TypeScript                  |
| Banco, login, upload | Supabase (Postgres, Auth, Storage)           |
| Acesso ao banco      | Prisma                                       |
| Validação            | Zod                                          |
| Visual               | Tailwind CSS + shadcn/ui                     |
| Qualidade            | ESLint, Prettier                             |
| Testes               | Vitest (unidade) e Playwright (ponta a ponta) |
| Ambiente             | Node 22 e pnpm                               |

## Como trabalhamos (resumo)

1. Toda tarefa é uma **issue** no GitHub Project.
2. Você cria uma branch a partir de `dev`: `tipo/<nº-issue>-descricao`
   (ex.: `feature/12-secao-portfolio`).
3. Faz commits no padrão **Conventional Commits** (ex.: `feat(portfolio): adiciona listagem`).
4. Abre um **PR para `dev`** com `Closes #12` na descrição.
5. Uma pessoa revisa, o CI fica verde e o PR entra em `dev` por **squash**.
6. No fim da sprint, um PR de **`dev` → `main`** publica a versão (`v0.<sprint>.0`).

Branches principais:

- `main` → versão publicada.
- `dev` → integração e testes (branch padrão).

## Documentação

- [Guia de contribuição (passo a passo com comandos)](CONTRIBUTING.md)
- [Arquitetura do código](docs/arquitetura.md)
- [Como usar o GitHub Project](docs/github-project.md)
- [Roteiro da demonstração do fluxo](docs/demo-fluxo.md)
- [Regras para o Claude Code](CLAUDE.md)

## Rodando localmente

Você vai precisar de:

- Node 22 (o arquivo `.nvmrc` já indica a versão; com nvm, rode `nvm use`)
- pnpm (`corepack enable` ou `npm i -g pnpm`)

```bash
pnpm install                              # instala frontend e backend
cp backend/.env.example backend/.env      # preencha DATABASE_URL do Supabase
cp frontend/.env.example frontend/.env.local
pnpm dev                                  # sobe os dois juntos
```

- Frontend: http://localhost:3000
- API: http://localhost:3333/api/health

Outros comandos: `pnpm dev:frontend`, `pnpm dev:backend`, `pnpm test`, `pnpm build`.
