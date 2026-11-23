# CLAUDE.md — Regras para o Claude Code neste repositório

Este arquivo é lido automaticamente pelo Claude Code. Ele vale para **todas** as sessões
de IA neste repositório. Se algo aqui conflitar com um pedido, pergunte antes de agir.

Projeto: Site Institucional da ORION (organização GitHub `Startup-ORION`).
Equipe: 7 pessoas, várias iniciantes. Escreva sempre em **português**, de forma simples.

---

## 1. Regras de trabalho (obrigatórias)

1. **Você só escreve e edita arquivos.** Nunca execute comandos: `git`, `npm`, `pnpm`,
   `npx`, `gh`, testes, build, `prisma`, nada.
2. Quando um comando for necessário, **escreva o comando** em um bloco de código para a
   pessoa rodar manualmente, explicando em uma linha o que ele faz.
3. **Trabalhe em etapas:** antes de escrever, apresente a lista de arquivos que vai criar ou
   alterar, com uma linha sobre cada um, e **espere a aprovação**.
4. Toda documentação, comentário de código e mensagem para a equipe em **português**,
   com linguagem simples. Nomes de código (variáveis, funções, arquivos) podem ficar em
   português ou inglês, mas siga o padrão que já existe na feature.
5. Nunca coloque segredos (chaves, senhas, URLs de banco) em arquivos versionados.
   Use `.env.local` (ignorado pelo Git) e documente a variável em `.env.example`.
6. Não altere as decisões abaixo (stack, arquitetura, fluxo Git) sem a equipe pedir.

---

## 2. Stack

Um único app **Next.js + TypeScript** (site público + painel `/admin`), com:
Supabase (Postgres, auth, storage), Prisma, Zod, Tailwind + shadcn/ui, ESLint, Prettier,
Vitest, Playwright. **Node 22** e **pnpm**.

Detalhes e justificativas: [`docs/arquitetura.md`](docs/arquitetura.md).

---

## 3. Arquitetura

```
src/
├── app/                      → rotas FINAS: só recebem a requisição e chamam features
│   ├── (publico)/            → páginas do site público
│   ├── admin/                → painel administrativo
│   └── api/                  → rotas de API (quando necessário)
├── features/
│   └── <feature>/
│       ├── <feature>.schema.ts      → tipos + regras de validação (Zod)
│       ├── <feature>.repository.ts  → ÚNICO arquivo que acessa o Prisma
│       ├── <feature>.service.ts     → casos de uso (regras de negócio)
│       ├── <feature>.actions.ts     → entrada do admin (Server Actions), checa permissão
│       ├── components/              → componentes da feature
│       └── <feature>.test.ts        → testes (Vitest)
└── shared/                   → UI comum, conexão com banco, auth, upload
```

### As 3 regras de dependência

1. **Componente não acessa banco.** O caminho é sempre:
   `tela → action → service → repository`.
   (Páginas públicas que só **leem** dados podem chamar o `service` direto, porque não há
   permissão a checar. Qualquer escrita passa por uma `action`.)
2. **Só o repository usa Prisma.** Nenhum outro arquivo importa o cliente do Prisma.
3. **Uma feature não importa de outra.** Se duas features precisam do mesmo código, ele vai
   para `src/shared/`. O `shared/` nunca importa de `features/`.

Quem pode importar o quê:

| Arquivo em…                | Pode importar de…                         |
| -------------------------- | ----------------------------------------- |
| `src/app/`                 | `features/*` e `shared/`                  |
| `features/<x>/`            | a própria feature `<x>` e `shared/`       |
| `shared/`                  | só `shared/` e bibliotecas externas       |

### Receita de feature nova (sempre nesta ordem)

1. `schema` → tipos e validação com Zod.
2. `repository` → funções de acesso ao banco com Prisma.
3. `service` → casos de uso, usando o repository.
4. `action` → Server Actions do admin, checando permissão e validando com o schema.
5. **telas** → componentes em `components/` e rotas finas em `src/app/`.
6. **teste** → `<feature>.test.ts` cobrindo o service (e o schema).

Exemplo completo com a feature `portfolio`: [`docs/arquitetura.md`](docs/arquitetura.md).

### Combinados para a etapa 2 (criação do app)

- O `package.json` deve ter o campo `"packageManager": "pnpm@<versão>"` e os scripts
  `lint`, `typecheck`, `test` (Vitest em modo `run`) e `build` — o CI depende deles.
- Sugestão: regra de ESLint `no-restricted-imports` para impedir `@prisma/client` fora dos
  `*.repository.ts` e imports entre features.

---

## 4. Fluxo Git e padrão de commits

Resumo (guia completo em [`CONTRIBUTING.md`](CONTRIBUTING.md)):

- `main` = versão publicada. Só recebe PR de `dev` (release) ou de `hotfix/*`.
- `dev` = integração e testes; é a branch padrão.
- Branches de trabalho saem de `dev`, no formato `tipo/<nº-issue>-descricao-curta`,
  com tipo `feature`, `fix`, `docs`, `chore`, `refactor` ou `test`.
  Ex.: `feature/12-secao-portfolio`.
- `hotfix/*` sai de `main` e volta para `main`; depois `main` é sincronizada em `dev` por PR.
- Merge em `dev`: **squash** (o título do PR vira o commit). Merge em `main`: **merge commit**.

### Conventional Commits (commits e títulos de PR)

Formato: `tipo(escopo opcional): descrição em português, no presente, minúscula`

| Tipo       | Quando usar                                   |
| ---------- | --------------------------------------------- |
| `feat`     | funcionalidade nova                           |
| `fix`      | correção de bug                               |
| `docs`     | só documentação                               |
| `chore`    | manutenção, configs, dependências             |
| `refactor` | muda o código sem mudar o comportamento       |
| `test`     | só testes                                     |
| `style`    | formatação, sem mudar lógica                  |
| `perf`     | melhoria de desempenho                        |
| `ci`       | workflows do GitHub Actions                   |
| `build`    | build e empacotamento                         |

Exemplos:

- `feat(portfolio): adiciona listagem de projetos`
- `fix(contato): corrige validação do e-mail`
- `docs: explica como rodar o projeto localmente`

Ao sugerir um commit, escreva os comandos para a pessoa rodar, por exemplo:

```bash
git add src/features/portfolio
```

```bash
git commit -m "feat(portfolio): adiciona listagem de projetos"
```
