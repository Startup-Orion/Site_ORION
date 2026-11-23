# Guia de contribuição

Este guia mostra, passo a passo, como levar uma tarefa do quadro até o site publicado.
Os comandos aparecem em blocos separados para você copiar um de cada vez.

Sumário:

1. [Visão geral das branches](#1-visão-geral-das-branches)
2. [Preparação (uma vez só)](#2-preparação-uma-vez-só)
3. [Pegar uma tarefa no Project](#3-pegar-uma-tarefa-no-project)
4. [Criar a branch](#4-criar-a-branch)
5. [Commitar](#5-commitar)
6. [Abrir o PR](#6-abrir-o-pr)
7. [Revisar um PR](#7-revisar-um-pr)
8. [Merge](#8-merge)
9. [Release no fim da sprint](#9-release-no-fim-da-sprint)
10. [Hotfix](#10-hotfix)
11. [Problemas comuns](#11-problemas-comuns)

---

## 1. Visão geral das branches

```
main   ●────────────────●───────────●──────  versão publicada (tags v0.1.0, v0.2.0...)
        \              / (merge     |\
dev      ●──●──●──●──●   commit)    | ●───  integração e testes (branch padrão)
            ↑  ↑  ↑                 |
          squash de cada PR      hotfix/* sai de main e volta para main
```

| Branch                                   | Sai de | Volta para | Como entra            |
| ---------------------------------------- | ------ | ---------- | --------------------- |
| `feature/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/` | `dev`  | `dev`      | PR com **squash**     |
| `dev` (release)                          | —      | `main`     | PR com **merge commit** |
| `hotfix/*`                               | `main` | `main`     | PR com **merge commit** |
| `main` (sincronizar hotfix)              | —      | `dev`      | PR com **merge commit** |

Regras que valem para **todo** PR:

- 1 aprovação de outra pessoa;
- CI verde (checks `ci` e `branch-policy`);
- todas as conversas resolvidas.

Ninguém faz push direto em `main` ou `dev`.

### Nome da branch

Formato: `tipo/<nº-issue>-descricao-curta`, tudo em **minúsculas**, palavras separadas por
hífen, sem acentos.

- ✅ `feature/12-secao-portfolio`
- ✅ `fix/31-link-quebrado-rodape`
- ❌ `feature/secao-portfolio` (falta o número da issue)
- ❌ `Feature/12-Seção_Portfolio` (maiúsculas, acento e `_`)

### Título do PR e commits

Padrão **Conventional Commits**: `tipo(escopo): descrição em português`.

- `feat(portfolio): adiciona listagem de projetos`
- `fix(contato): corrige validação do e-mail`
- `docs: atualiza guia de contribuição`

Tipos aceitos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`, `ci`,
`build`. O título do PR é **obrigatório** nesse padrão, porque ele vira o commit em `dev`.

---

## 2. Preparação (uma vez só)

Clone o repositório:

```bash
git clone https://github.com/Startup-ORION/Site_ORION.git
```

```bash
cd Site_ORION
```

Configure seu nome e e-mail no Git (se ainda não fez):

```bash
git config --global user.name "Seu Nome"
```

```bash
git config --global user.email "seu-email@exemplo.com"
```

Use a versão certa do Node (com [nvm](https://github.com/nvm-sh/nvm)):

```bash
nvm use
```

---

## 3. Pegar uma tarefa no Project

1. Abra o GitHub Project da equipe (veja [docs/github-project.md](docs/github-project.md)).
2. Na coluna **A fazer**, escolha uma issue da sprint atual (de preferência a de maior prioridade).
3. Atribua a issue a você (**Assignees → você**).
4. Mova o card para **Em andamento**.
5. Anote o número da issue (ex.: `#12`).

Não existe tarefa sem issue. Se a tarefa não existe, crie a issue antes (botão **New issue**
e escolha um dos formulários).

---

## 4. Criar a branch

Vá para `dev` e traga as últimas mudanças:

```bash
git switch dev
```

```bash
git pull
```

Crie sua branch a partir de `dev`:

```bash
git switch -c feature/12-secao-portfolio
```

---

## 5. Commitar

Veja o que mudou:

```bash
git status
```

Adicione os arquivos (prefira adicionar só o que é da tarefa):

```bash
git add src/features/portfolio
```

Faça o commit no padrão:

```bash
git commit -m "feat(portfolio): adiciona listagem de projetos"
```

Envie a branch para o GitHub (na primeira vez use `-u`):

```bash
git push -u origin feature/12-secao-portfolio
```

Nos próximos envios da mesma branch, basta:

```bash
git push
```

Dicas:

- Faça commits pequenos e frequentes. Como o merge em `dev` é por squash, os commits da sua
  branch viram um só no final — então não se preocupe em deixá-los perfeitos.
- **Nunca** commite `.env`, `.env.local` ou senhas. O `.gitignore` já ajuda, mas confira o
  `git status` antes.

### Atualizar sua branch com o que entrou em `dev`

Se `dev` mudou enquanto você trabalhava (ou o PR mostra conflito):

```bash
git fetch origin
```

```bash
git merge origin/dev
```

Se houver conflito, o Git mostra os arquivos. Abra cada um, resolva os trechos marcados com
`<<<<<<<` e `>>>>>>>`, e então:

```bash
git add .
```

```bash
git commit -m "chore: resolve conflitos com dev"
```

```bash
git push
```

---

## 6. Abrir o PR

1. No GitHub, aparece o aviso **Compare & pull request** — clique nele.
   (Ou vá em **Pull requests → New pull request**.)
2. Confira: **base: `dev`** ← **compare: sua branch**.
3. **Título** no padrão Conventional Commits: `feat(portfolio): adiciona listagem de projetos`.
4. Preencha o template da descrição. Obrigatório: `Closes #12` (fecha a issue no merge).
5. Em **Reviewers**, peça revisão a uma pessoa.
6. Mova o card no Project para **Em revisão**.

Se o check `branch-policy` falhar, leia o log: ele diz se o problema é o nome da branch ou o
título. Título dá para corrigir editando o PR. Nome de branch errado exige criar uma branch
nova com o nome certo e abrir outro PR.

---

## 7. Revisar um PR

Quem revisa:

1. Abre a aba **Files changed** e lê as mudanças.
2. Confere o checklist do template (arquitetura, testes, sem segredos, título).
3. Se quiser testar na sua máquina:

   ```bash
   git fetch origin
   ```

   ```bash
   git switch feature/12-secao-portfolio
   ```

4. Comenta nas linhas (botão **+** ao lado da linha). Seja gentil e específico.
5. Clica em **Review changes** e escolhe:
   - **Approve** → pode entrar;
   - **Request changes** → precisa ajustar;
   - **Comment** → só dúvidas ou sugestões.

Quem abriu o PR:

- Responde aos comentários, faz os ajustes, commita e dá `git push` (o PR atualiza sozinho).
- Quem fez o comentário clica em **Resolve conversation** quando estiver resolvido.

---

## 8. Merge

Quando houver 1 aprovação, CI verde e conversas resolvidas:

1. No PR para `dev`, use **Squash and merge**.
2. Confira se o título do commit é o título do PR e clique em confirmar.
3. A branch é apagada automaticamente no GitHub e a issue é fechada pelo `Closes #12`.
4. O card vai para **Concluído**.

Na sua máquina, limpe a branch local:

```bash
git switch dev
```

```bash
git pull
```

```bash
git branch -D feature/12-secao-portfolio
```

> Usamos `-D` (maiúsculo) porque, com squash, o Git não reconhece a branch como "mesclada".

---

## 9. Release no fim da sprint

Feito na revisão de sprint, por quem a equipe definir como responsável pela release.

1. Confirme que `dev` está estável (CI verde, testes manuais ok).
2. Abra um PR com **base: `main`** ← **compare: `dev`**.
   - Título: `chore(release): v0.3.0 (sprint 3)`
   - Descrição: lista dos PRs/issues que entram (o GitHub mostra os commits na aba **Commits**).
3. Revisão (1 aprovação) e CI verde.
4. Merge com **Create a merge commit** (não use squash aqui).
5. Crie a tag da versão:

```bash
git switch main
```

```bash
git pull
```

```bash
git tag -a v0.3.0 -m "Sprint 3"
```

```bash
git push origin v0.3.0
```

6. (Opcional) Em **Releases → Draft a new release**, escolha a tag `v0.3.0` e clique em
   **Generate release notes**.

Versão: `v0.<número da sprint>.0`. Hotfix incrementa o último número (`v0.3.1`, `v0.3.2`...).

---

## 10. Hotfix

Para um erro **urgente** no site publicado que não pode esperar a próxima release.

1. Crie a issue do bug (formulário **Bug**) com prioridade **Alta**.
2. Crie a branch a partir de `main`:

```bash
git switch main
```

```bash
git pull
```

```bash
git switch -c hotfix/45-corrige-link-contato
```

3. Corrija, commite e envie:

```bash
git add .
```

```bash
git commit -m "fix(contato): corrige link do WhatsApp"
```

```bash
git push -u origin hotfix/45-corrige-link-contato
```

4. Abra PR com **base: `main`**, título `fix(contato): corrige link do WhatsApp`, com `Closes #45`.
5. Após aprovação e CI verde: merge com **Create a merge commit**.
6. Crie a tag do hotfix:

```bash
git switch main
```

```bash
git pull
```

```bash
git tag -a v0.3.1 -m "Hotfix: link do WhatsApp"
```

```bash
git push origin v0.3.1
```

7. **Sincronize `main` em `dev`:** abra PR com **base: `dev`** ← **compare: `main`**,
   título `chore: sincroniza hotfix v0.3.1 em dev`. Faça o merge com
   **Create a merge commit** (não use squash aqui, senão `dev` e `main` ficam com históricos
   diferentes e a próxima release terá conflitos).

---

## 11. Problemas comuns

**"Fiz commit na branch errada (ex.: em `dev`)."**
Se ainda não deu push, crie a branch certa a partir daí e volte `dev` para o estado do GitHub:

```bash
git switch -c feature/12-secao-portfolio
```

```bash
git branch -f dev origin/dev
```

**"Meu push foi recusado."**
Alguém enviou algo para a mesma branch. Traga as mudanças e envie de novo:

```bash
git pull
```

```bash
git push
```

**"Commitei um arquivo `.env` sem querer."**
Avise a equipe imediatamente: a chave precisa ser **trocada** no Supabase, mesmo que você
apague o arquivo depois. Apagar não basta, porque ele fica no histórico.

**"O check `ci` falhou."**
Clique em **Details** ao lado do check, veja qual passo falhou (lint, testes ou build),
corrija na sua máquina e dê `git push`.
