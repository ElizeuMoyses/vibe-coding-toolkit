# Refatorar arquivos acima do budget — por responsabilidade

## Segurança

Execute este prompt localmente a partir de conteúdo revisado ou de um checkout preso a commit/tag. Não busque uma versão mutável de `main` e a execute automaticamente.

## Objetivo

`MAX_LINES` é um trigger para revisar coesão. A meta não é fazer todo arquivo ficar abaixo do número a qualquer custo; é melhorar separação de responsabilidades **sem mudar comportamento**.

## Prompt

```text
Review files reported above this project's file-size budget and refactor ONLY when a natural responsibility seam exists.

Inputs:
- MAX_LINES=[configured review budget]
- BATCH_SIZE=3
- LINT_COMMAND=[canonical]
- TEST_COMMAND=[canonical]
- TYPECHECK_COMMAND=[canonical or none]

1. Ground truth
Run lint now and list every file reported by the size rule with actual line count.

2. Pick a small batch
Take at most BATCH_SIZE files, largest first.

3. Analyze before editing
For each file state:
- current responsibility;
- public exports/interfaces;
- natural seams, if any;
- callers/dependencies affected;
- whether the file is cohesive despite its size.

4. Allowed seams
Prefer real responsibility boundaries such as:
- business/domain logic extracted from UI/route;
- data access moved to repository/adapter;
- repeated UI extracted to focused component;
- coherent domain helpers moved together;
- protocol/parsing concern isolated behind a clear interface.

Never split at an arbitrary line number. Do not create catch-all utils/misc/common modules.

5. Cohesive exception
If no natural seam exists, DO NOT refactor just to satisfy MAX_LINES. Report `no natural seam` and propose a narrow documented exception for human/project policy review.

6. Preserve behavior
Keep public names/signatures stable unless changing the interface is explicitly part of the task.

7. One file at a time
For each actual refactor:
- strengthen/add tests first when behavior could regress;
- make the smallest extraction;
- run typecheck if applicable;
- run tests;
- run lint;
- inspect diff for accidental behavior changes;
- only then move to the next file.

8. Stop on uncertainty
If the extraction requires a product/domain decision, stop and report it instead of guessing.

9. Final report
- files refactored + seam used;
- files intentionally left long + why;
- exceptions proposed;
- commands/results;
- remaining files over budget;
- any new violation introduced (must be zero before completion).
```
