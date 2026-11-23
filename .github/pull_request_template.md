<!--
Título do PR no padrão Conventional Commits, por exemplo:
  feat(portfolio): adiciona listagem de projetos
  fix(contato): corrige validação do e-mail
Em PRs para `dev`, o título vira o commit final (squash).
-->

## O que muda

<!-- Explique em poucas linhas o que este PR faz e por quê. -->

## Issue relacionada

Closes #

<!-- Troque por "Closes #<número>". É isso que fecha a issue automaticamente no merge. -->

## Como testar

<!-- Passo a passo para quem revisa conferir. Exemplo:
1. Rode `pnpm dev`
2. Acesse /portfolio
3. Verifique que aparecem os projetos publicados
-->

1.

## Prints (se tiver tela)

<!-- Arraste imagens aqui. Se mudou uma tela existente, mostre antes e depois. Apague a seção se não houver tela. -->

| Antes | Depois |
| ----- | ------ |
|       |        |

## Checklist

- [ ] Segue a arquitetura (tela → action → service → repository; só o repository usa Prisma; sem import entre features)
- [ ] Adicionei ou atualizei testes (ou expliquei acima por que não precisa)
- [ ] Não há segredos, senhas ou arquivos `.env` no PR
- [ ] Título do PR no padrão Conventional Commits
- [ ] A descrição tem `Closes #<número da issue>`
