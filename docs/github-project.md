# Como usar o GitHub Project

O GitHub Project é o **quadro da equipe**. É nele que vemos o que falta fazer, quem está
fazendo o quê e o que entra em cada sprint.

## A regra de ouro

1. **Toda tarefa vira uma issue.** Sem issue, não tem branch nem PR.
2. **Todo PR referencia sua issue** na descrição, com `Closes #12`.
   Quando o PR entra em `dev` (a branch padrão), o GitHub fecha a issue sozinho.

> Use `Closes`, `Fixes` ou `Resolves` seguido do número. Escrever só "#12" cria um link,
> mas **não** fecha a issue.

---

## Colunas (campo Status)

| Coluna            | O que significa                                       | Quem move                           |
| ----------------- | ----------------------------------------------------- | ----------------------------------- |
| **Backlog**       | Ideias e tarefas ainda não planejadas para a sprint   | Automático ao criar a issue         |
| **A fazer**       | Planejada para a sprint atual, ninguém pegou ainda    | Equipe, no planejamento da sprint   |
| **Em andamento**  | Alguém está trabalhando (tem responsável)             | Quem pegou a tarefa                 |
| **Em revisão**    | PR aberto, aguardando revisão                         | Quem abriu o PR                     |
| **Concluído**     | PR mesclado em `dev` e issue fechada                  | Automático ao fechar a issue        |

Regras práticas:

- Só pegue uma tarefa nova quando terminar (ou travar) a atual.
- Card em **Em andamento** precisa ter **Assignee**.
- Travou? Comente na issue o que está bloqueando e avise a equipe.

---

## Campos

| Campo          | Tipo de campo  | Valores                                                       | Para quê                                 |
| -------------- | -------------- | ------------------------------------------------------------- | ---------------------------------------- |
| **Prioridade** | Seleção única  | Alta, Média, Baixa                                            | Ordem de execução                        |
| **Área**       | Seleção única  | Site público, Admin, Dados, Design, Infra                     | Que parte do projeto a tarefa toca       |
| **Tipo**       | Seleção única  | Feature, Bug, Tarefa                                          | Mesmo tipo do formulário da issue        |
| **Estimativa** | Número         | 1, 2, 3, 5, 8 (pontos)                                        | Tamanho/esforço relativo                 |
| **Sprint**     | Iteração       | Sprint 1, Sprint 2… (duração definida pela equipe)            | Em que sprint a tarefa entra             |

### Como estimar (pontos)

| Pontos | Ideia de tamanho                                          |
| ------ | --------------------------------------------------------- |
| 1      | Muito pequena: texto, ajuste de estilo                    |
| 2      | Pequena: um componente simples                            |
| 3      | Média: uma tela com dados                                 |
| 5      | Grande: feature com schema, service, action e tela        |
| 8      | Muito grande — **divida em issues menores** antes de começar |

### Como usar a Área

- **Site público** — páginas que o visitante vê.
- **Admin** — painel `/admin`.
- **Dados** — banco, Prisma, migrações, Supabase.
- **Design** — layout, identidade visual, protótipos.
- **Infra** — CI, deploy, configurações do repositório.

---

## O ciclo de uma tarefa

```
Issue criada ──► Backlog
                   │ (planejamento da sprint: define Sprint, Prioridade, Estimativa)
                   ▼
                A fazer
                   │ (alguém se atribui e cria a branch)
                   ▼
              Em andamento
                   │ (abre PR com "Closes #N")
                   ▼
               Em revisão
                   │ (PR aprovado e mesclado em dev → issue fecha)
                   ▼
               Concluído
```

---

## Visões sugeridas

Crie algumas visões (abas) no Project para facilitar:

1. **Quadro da sprint** (layout *Board*) — filtro `sprint:@current`, agrupado por Status.
2. **Backlog** (layout *Table*) — filtro `status:Backlog`, ordenado por Prioridade.
3. **Por pessoa** (layout *Board*) — agrupado por Assignees.

---

## Planejamento e revisão de sprint

**No planejamento:**

1. Revisar o Backlog e ordenar por prioridade.
2. Preencher Estimativa nas issues que vão entrar.
3. Definir o campo **Sprint** e mover para **A fazer** o que cabe na sprint.

**Na revisão (fim da sprint):**

1. Mostrar o que está em **Concluído**.
2. Fazer a release `dev` → `main` (veja [CONTRIBUTING.md](../CONTRIBUTING.md#9-release-no-fim-da-sprint)).
3. O que não terminou volta para **A fazer** com a próxima Sprint.
