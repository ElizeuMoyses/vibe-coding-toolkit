# Setup completo de ESLint — versão endurecida

## Quando usar

Use para configurar ou modernizar ESLint em um projeto JavaScript/TypeScript. Não aplique esta receita cegamente: primeiro descubra stack, versão instalada, convenções e dívida existente.

Para copiar as regras locais deste toolkit, prefira [`08-eslint-quality-gates-install.md`](08-eslint-quality-gates-install.md). Para zerar avisos acumulados, use [`02-eslint-warning-burndown.md`](02-eslint-warning-burndown.md).

## Princípios

1. **Invariantes podem bloquear.** Bugs reais, fronteiras arquiteturais e políticas de segurança podem ser `error` quando a regra é confiável e não existe dívida conhecida.
2. **Dívida não deve quebrar o baseline.** Regra adequada com violações existentes começa em `warn` + baseline explícito e pode ser promovida depois de zerada **se for intencionalmente um invariant bloqueante**.
3. **Heurísticas continuam heurísticas.** Complexidade, profundidade e tamanho de arquivo podem permanecer `warn` mesmo com zero violações. Zero ocorrências não transforma uma métrica proxy em verdade arquitetural.
4. **350 linhas é budget de revisão de coesão**, não uma lei. Arquivo longo e coeso pode ter exceção estreita e documentada.
5. **Typed lint é medido.** Não assuma que deve ficar sempre fora do lint principal nem que deve sempre ser bloqueante. Meça latência/memória e escolha o tier apropriado.
6. **Formatação é separada de corretude.** Prettier/Biome/dprint podem cuidar de estilo. Regras semânticas como `eqeqeq` não são “formatação” e devem ser avaliadas pela política de corretude do projeto.
7. **Menos ferramentas, responsabilidades claras.** Não duplique a mesma regra entre ESLint e formatter/linter secundário.

## Prompt

```text
Configure/review ESLint for this repository using measured, project-specific quality gates.

0. Discover before editing
Report:
- package manager;
- ESLint version and config format;
- JS/TS/frameworks actually present;
- tsconfig/project references;
- source/test/generated roots;
- existing formatter/linter;
- canonical lint/typecheck/test/build commands;
- current lint baseline by rule.

Do not install framework/ORM plugins that the repository does not use.

1. Composition
Use ESLint flat config supported by the installed version. Prefer published rules before writing local ones. Keep formatting ownership separate and avoid duplicate enforcement.

2. Severity policy
For each candidate rule classify it:
- correctness/security/architecture invariant;
- advisory refactoring heuristic;
- existing debt;
- likely noisy/false-positive-prone.

Choose severity from that classification, not from a universal table:
- reliable invariant + zero baseline violations -> `error` is allowed;
- reliable invariant + existing debt -> `warn` + exact baseline, then burn down;
- advisory heuristic -> normally `warn`, even when currently clean;
- noisy/non-actionable rule -> scope/fix/skip instead of teaching the team to ignore it.

3. File-size policy
Use MAX_LINES=[350 or project budget] as a cohesion review trigger.
- generated/declaration/barrel files may be excluded;
- tests may use a different budget;
- do not split a cohesive file only to satisfy the number;
- any exception must be narrow and justified;
- promote file-size to blocking only if the project explicitly chooses it as an invariant, not merely because the current count is zero.

4. Architecture/domain rules
Encode high-value boundaries mechanically when static analysis can actually prove them, for example:
- presentation layer cannot import the raw DB client;
- destructive ORM operation must have a guard/where clause when a trustworthy plugin supports it;
- application code uses the shared logger;
- restricted dependencies flow through project wrappers.

Do not claim a rule proves more than its AST analysis can establish.

5. Type-aware lint
Use `parserOptions.projectService: true` when supported by the installed typescript-eslint stack.
Measure type-aware lint and typecheck.
- If latency is acceptable, a single canonical lint/check path may be simpler.
- If it materially slows local feedback or exhausts CI memory, keep a separate `lint:types` tier and run it in CI/on demand.
- Rules may be `error` or `warn` according to baseline and intent; typed does not automatically mean non-blocking.

6. Tests and globs
Keep the declared language scope consistent. If the project supports JS and TS, test/source globs must not accidentally cover only `ts/tsx`.
Relax complexity/size rules in tests only where they create measured noise; do not blanket-disable correctness/security rules.

7. Verify
Run, with literal results:
- lint;
- type-aware lint if configured;
- typecheck if applicable;
- relevant tests;
- build if config integration can affect it.

If local rules are installed from this toolkit, run `templates/eslint/verify.mjs` (or the vendored equivalent) against them.

8. Report
- dependencies/config changed;
- rules added/skipped and why;
- baseline per rule;
- severity decisions;
- typed-lint timing decision;
- file-size exceptions;
- commands and results;
- remaining debt.
```

## Referência do template

Os exemplos em [`../../templates/eslint/`](../../templates/eslint/) são um ponto de partida, não configuração pronta para qualquer stack. Adapte paths, aliases, globals e fronteiras à base consumidora.
