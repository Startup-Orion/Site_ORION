# Roteiro da demonstração do fluxo (~20 min)

Objetivo: mostrar para a equipe, ao vivo, o caminho completo de uma tarefa:
**issue → branch → commit → PR → revisão → CI → squash em `dev` → release para `main`**.

Tarefa de exemplo: criar o arquivo `docs/equipe.md` com o nome de quem está na equipe.
É simples de propósito: o foco é o **fluxo**, não o código.

---

## Antes da demo (preparação, 5 min antes)

- [ ] Repositório com `main` e `dev` publicados, `dev` como branch padrão e os rulesets
      de `main` e `dev` ativos.
- [ ] GitHub Project criado e ligado ao repositório.
- [ ] Duas pessoas: **apresentador(a)** (abre o PR) e **revisor(a)** (aprova).
- [ ] Terminal aberto na pasta do projeto, em `dev` atualizada.
- [ ] Navegador com abas: repositório, Project, aba de Pull requests.

---

## Bloco 1 — Visão geral (0:00 – 2:00)

Mostre o diagrama de branches do [CONTRIBUTING.md](../CONTRIBUTING.md#1-visão-geral-das-branches)
e diga:

> "`main` é o que está no ar. `dev` é onde juntamos o trabalho. Cada tarefa vira uma branch
> que sai de `dev` e volta para `dev` por PR. No fim da sprint, `dev` vai para `main`."

---

## Bloco 2 — Criar a issue (2:00 – 5:00)

1. No repositório: **Issues → New issue → Tarefa**.
2. Título: `Criar página da equipe na documentação`.
3. Preencha a descrição e o checklist.
4. Mostre que a issue aparece no Project em **Backlog**.
5. Preencha os campos: Prioridade **Média**, Área **Infra**, Tipo **Tarefa**,
   Estimativa **1**, Sprint **atual**.
6. Atribua a você e mova para **Em andamento**.
7. Anote o número. **Neste roteiro usaremos `#1`** — troque pelo número real.

---

## Bloco 3 — Branch e commit (5:00 – 8:00)

```bash
git switch dev
```

```bash
git pull
```

```bash
git switch -c docs/1-pagina-equipe
```

Crie o arquivo `docs/equipe.md` no editor com algo como:

```markdown
# Equipe ORION

- Nome 1 — função
- Nome 2 — função
```

```bash
git status
```

```bash
git add docs/equipe.md
```

```bash
git commit -m "docs: adiciona página da equipe"
```

```bash
git push -u origin docs/1-pagina-equipe
```

Destaque: nome da branch = `tipo/<nº-issue>-descricao`; commit em Conventional Commits.

---

## Bloco 4 — Abrir o PR (8:00 – 11:00)

1. Clique em **Compare & pull request**.
2. Confira **base: `dev`** ← **compare: `docs/1-pagina-equipe`**.
3. Título: `docs: adiciona página da equipe`.
4. Mostre o **template** sendo preenchido; escreva `Closes #1`.
5. Peça revisão ao(à) revisor(a).
6. Mova o card para **Em revisão**.

**Mostre um erro de propósito (30 s):** edite o título para `adicionando equipe` e salve.
O check **`branch-policy`** fica vermelho. Abra **Details** e mostre a mensagem. Volte o
título para `docs: adiciona página da equipe` → o check roda de novo e fica verde.

---

## Bloco 5 — Revisão e CI (11:00 – 14:00)

1. Mostre a aba **Checks**: `ci` e `branch-policy`. Explique:
   - `ci` → instala, roda lint, testes e build (hoje passa direto, pois o app ainda não existe);
   - `branch-policy` → confere nome da branch e título do PR.
2. O(a) revisor(a) abre **Files changed**, comenta em uma linha
   (ex.: "Coloque também o papel de cada pessoa").
3. O(a) apresentador(a) ajusta o arquivo e envia:

```bash
git add docs/equipe.md
```

```bash
git commit -m "docs: inclui papel de cada pessoa"
```

```bash
git push
```

4. O(a) revisor(a) clica em **Resolve conversation** e depois
   **Review changes → Approve**.
5. Mostre que o botão de merge só libera com: 1 aprovação + checks verdes + conversas resolvidas.

---

## Bloco 6 — Squash em `dev` (14:00 – 16:00)

1. Clique em **Squash and merge**. Mostre que a mensagem é o título do PR.
2. Confirme. Mostre:
   - a branch foi apagada automaticamente;
   - a issue `#1` foi fechada e o card foi para **Concluído**;
   - em `dev`, os 2 commits viraram **1 só**: `docs: adiciona página da equipe (#2)`.
3. Limpe a máquina local:

```bash
git switch dev
```

```bash
git pull
```

```bash
git branch -D docs/1-pagina-equipe
```

---

## Bloco 7 — Release para `main` (16:00 – 19:00)

1. **Pull requests → New pull request**, **base: `main`** ← **compare: `dev`**.
2. Título: `chore(release): v0.1.0 (sprint 1)`.
3. Mostre a aba **Commits** com o que vai entrar.
4. Aprovação + checks verdes → **Create a merge commit** (não squash!).
5. Crie a tag:

```bash
git switch main
```

```bash
git pull
```

```bash
git tag -a v0.1.0 -m "Sprint 1"
```

```bash
git push origin v0.1.0
```

6. (Opcional) **Releases → Draft a new release** → tag `v0.1.0` → **Generate release notes**.

Explique: "squash em `dev` deixa um commit por tarefa; merge commit em `main` deixa
marcado no histórico cada release."

---

## Bloco 8 — Perguntas (19:00 – 20:00)

Perguntas comuns para já ter a resposta:

- **"E se o site quebrar em produção?"** → hotfix: branch `hotfix/*` sai de `main`, PR para
  `main`, depois PR de `main` para `dev` (ver CONTRIBUTING, seção 10).
- **"Posso dar push direto em `dev`?"** → Não, as regras bloqueiam. Sempre PR.
- **"Errei o nome da branch."** → Crie uma nova com o nome certo e abra outro PR.
- **"Meu PR tem conflito."** → `git fetch origin` e `git merge origin/dev`, resolva e dê push.
