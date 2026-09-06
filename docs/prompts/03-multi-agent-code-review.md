# Code review multiagente — baseado em risco

Um painel de revisores custa mais contexto e tokens. Use quando várias lentes independentes realmente mudam o risco da mudança.

## Quando usar

Recomendado para mudanças que tocam uma ou mais destas superfícies:

- autenticação, autorização, RLS e sessão;
- pagamentos, preço, saldo ou arredondamento;
- dados pessoais, secrets e criptografia;
- migrations, deleção ou transformação de dados;
- concorrência, filas e consistência distribuída;
- infraestrutura, deploy e permissões;
- mudança arquitetural grande;
- release crítico.

Para mudança comum, um reviewer independente + testes/gates costuma bastar.

## Prompt

```text
Review [DIFF/PR/BRANCH] with only the specialist lenses that materially apply to this change.

Do not create reviewers just to fill a panel. Use at most the relevant lenses from:
- general correctness and test coverage;
- security/auth/trust boundaries;
- database/data-loss/migration safety;
- language type/concurrency correctness;
- framework-specific behavior/a11y/performance;
- infrastructure/deployment safety.

Each reviewer works independently and reports findings in this exact shape:
`file:line — severity — claim — concrete failure scenario — evidence`.

Rules for reviewers:
- no failure scenario = drop the finding;
- no evidence in the diff/code = drop the finding;
- style preference without correctness/maintainability impact = LOW or drop;
- do not assume another reviewer will validate your claim.

Synthesis step:
1. deduplicate findings by root cause;
2. verify every surviving finding against the actual diff/code;
3. discard already-handled or speculative findings;
4. rank CRITICAL/HIGH/MEDIUM/LOW;
5. identify which reviewer(s) independently agreed;
6. state explicitly when no CRITICAL/HIGH finding survives.

Target: [DIFF/PR/BRANCH]
Stack: [LANGUAGE / FRAMEWORK]
Risk surface: [WHY MULTI-AGENT REVIEW IS JUSTIFIED]
```

## Observação

Painel de agentes complementa testes e análise estática; não os substitui.
