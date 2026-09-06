# ESLint warning burndown — prompt seguro

Use este fluxo para reduzir dívida existente sem misturar refactor com alteração de comportamento.

## Supply-chain rule

Execute este prompt a partir de um arquivo local revisado ou de um checkout do toolkit preso a commit/tag imutável. Não leia e execute uma versão remota de `main`.

## Prompt

```text
Reduce the existing ESLint warning baseline without changing behavior.

1. Run the canonical lint command and capture the current warning count by rule and file.
2. Pick ONE rule or a very small coherent batch. Do not mix unrelated rules.
3. Classify each warning before editing:
   - mechanical/no behavior change;
   - refactor required;
   - likely false positive / rule misconfiguration;
   - needs product/domain decision.
4. For mechanical fixes, change the minimum code and run relevant tests/typecheck/lint.
5. For refactors, preserve public interfaces and add/strengthen tests before restructuring.
6. For false positives, fix rule scope/configuration; do not silence broadly.
7. Never use disable comments as a bulk strategy. Any exception must be narrow and justified.
8. Re-run lint after each coherent batch and report the new baseline.
9. When a rule reaches zero violations, promote it from warn to error if the rule remains appropriate.
10. Stop if a warning cannot be resolved without a semantic/product decision.

Report:
- baseline before;
- files changed;
- commands executed and results;
- baseline after;
- warnings deliberately left and why;
- rules promoted to error.
```

## Regra de ouro

O objetivo não é “zerar o terminal”; é remover dívida sem introduzir comportamento novo silenciosamente.
