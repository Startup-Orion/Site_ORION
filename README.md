# Site Institucional da ORION

Site público da ORION e painel administrativo (`/admin`) para a equipe gerenciar o
conteúdo (portfólio, textos, imagens etc.), tudo em **um único app**.

> **Status:** etapa 1 — estrutura de colaboração (documentação, templates e CI).
> O app Next.js será criado na etapa 2.

## Stack

| Parte                | Tecnologia                                   |
| -------------------- | -------------------------------------------- |
| App (site + admin)   | Next.js + TypeScript                         |
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

Instruções serão adicionadas na etapa 2, quando o app for criado. Você vai precisar de:

- Node 22 (o arquivo `.nvmrc` já indica a versão; com nvm, rode `nvm use`)
- pnpm
