# Parallel wave dispatch — contrato endurecido

## Quando usar

Use somente depois de existir uma lista de tarefas suficientemente entendida para declarar dependências e estado compartilhado. O objetivo não é maximizar o número de agentes; é paralelizar **apenas unidades semanticamente independentes**.

Arquivos disjuntos são úteis, mas não provam independência. Tarefas também podem colidir em migrations, schema, lockfile, porta, banco, fila, fixture, snapshot, cliente gerado, namespace e interface compartilhada.

## Prompt

```text
Break [FEATURE/PLAN/TASK LIST] into safe execution waves.

Start single-agent. Create a parallel wave only when concurrent execution has a concrete benefit and independence can be demonstrated.

## 1. Contract for every task
For every unit write:
- ID: stable ID (T01, T02, ...)
- Goal: observable result
- Files: files/globs expected to be written
- Resources: DB, migration namespace, lockfile, port, queue, service or other mutable resource
- Interfaces: contracts consumed and produced
- Depends-on: predecessor task IDs or none
- Generated-artifacts: generated clients, snapshots, schemas, lockfiles or derived outputs
- Shared-state: any mutable state shared with another task
- Verify: exact command/assertion that proves completion
- Risk: normal | high
- Owner: specialist only when specialization actually helps

If any field that affects independence is uncertain, do not parallelize that task yet.

## 2. Determine semantic independence
Two tasks may share a wave only when ALL are true:
1. no direct or transitive dependency exists;
2. neither consumes an interface the other is still changing;
3. they do not mutate the same external/shared resource;
4. generated artifacts cannot collide by path, name, ordering or source;
5. their write sets are either disjoint OR physically isolated in separate worktrees;
6. integration order cannot change the meaning of either result.

Different filenames alone are never sufficient evidence.

## 3. Choose isolation
- read-only reviewers/explorers may share a checkout;
- one writer may use the normal working tree;
- 2+ concurrent writers should prefer separate worktrees, each on its own branch, when supported;
- if external mutable state cannot be isolated, serialize.

Do not run multiple writing agents against the same Git index.

## 4. Execute each wave
For every wave:
1. create/confirm an isolated workspace for each concurrent writer;
2. dispatch all independent tasks;
3. each task runs its own Verify check and reports exact changes/results;
4. integrate results serially into the target branch;
5. run global lint/typecheck/tests/build that apply;
6. inspect the combined diff;
7. run independent review proportional to risk;
8. record commands, results, risks and remaining work in the PR/issue.

If integration reveals a hidden dependency, stop parallel execution and re-plan/serialize the affected tasks.

## 5. Output
Show:
- task contract table;
- why every same-wave pair is independent in files AND state;
- isolation strategy;
- wave order;
- verification per task and global verification;
- any task intentionally serialized and why.

Plan/task list: [FEATURE/PLAN/TASK LIST]
```

## Exemplo de falso paralelismo

```text
T01: cria 018_add_coupon.sql
T02: cria 018_add_index.sql
```

Os paths são diferentes, mas disputam o namespace/ordem de migrations. Serialize ou coordene a numeração antes de executar.

Outro exemplo:

```text
T01: altera schema OpenAPI
T02: regenera cliente a partir do schema
```

Arquivos escritos podem ser diferentes, mas T02 consome a interface produzida por T01: há dependência semântica.

## Regra de fallback

Se a independência não puder ser demonstrada, **serialize**. Paralelismo é otimização, não critério de qualidade.
