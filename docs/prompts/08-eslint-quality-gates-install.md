# Instalar quality gates de ESLint — fluxo seguro

## Antes de executar

Não use este prompt por meio de uma URL mutável de `main`. Faça uma destas duas coisas:

1. copie/vendor este prompt e `templates/eslint/` para o projeto consumidor e revise o diff; ou
2. faça checkout deste toolkit em um commit/tag imutável, revise e use o caminho local.

Prompts executáveis e regras de lint são código operacional.

## Defaults

- `MAX_LINES=350` é **gatilho de revisão de coesão**, não verdade universal;
- regra com dívida existente começa em `warn` + baseline;
- regra sem violações pode começar em `error`;
- não instale regra que não corresponde à arquitetura real do projeto.

## Prompt

```text
Install this project's ESLint quality gates from a REVIEWED LOCAL toolkit checkout/vendor directory.
Do not fetch executable rule files from a mutable branch.

Inputs:
- TOOLKIT_DIR=[LOCAL_PATH]
- MAX_LINES=350 (tune only with an explicit architectural reason)

0. Read before editing
Report:
- package manager and ESLint version;
- JS/TS and tsconfig aliases;
- source root;
- presentation/route layers;
- data-access module, if one exists;
- logging adapter, if one exists;
- canonical lint/typecheck/test commands.

1. Copy the rule implementation from:
[TOOLKIT_DIR]/templates/eslint/

Copy source rule files byte-for-byte first. Adapt only the config examples to the target project.

2. Adapt to the actual project
- files globs;
- ignored/generated paths;
- import boundaries;
- data module names/bindings;
- logger exception paths;
- runtime globals;
- framework-specific rules only when that framework exists.

If there is no data-access layer, do not invent one just to enable a rule.

3. File-size policy
Treat MAX_LINES as a review budget. Exempt generated/declaration/barrel files as appropriate. For a cohesive long file, prefer a narrow documented exception over an artificial split.

4. Type-aware lint
Measure the project's type-aware lint/typecheck cost. Keep a separate lint:types tier only if the local latency justifies it.

5. Verify rule implementation
Run the toolkit's provided verification script or equivalent tests before trusting violation counts.

6. Measure baseline
Run lint and report count per rule.
- zero existing violations -> error is allowed;
- existing violations -> warn + exact baseline;
- never hide broad debt with global disable comments.

7. Do not refactor yet
Installing/measuring gates is one change. Fixing violations is separate work.

8. Report
- rules installed/skipped and why;
- baseline per rule;
- severities chosen;
- files above MAX_LINES sorted by size;
- commands executed and results;
- any exception added and justification.
```

Depois da medição, use [`09-file-size-refactor.md`](09-file-size-refactor.md) apenas para arquivos onde existe uma costura real de responsabilidade.
