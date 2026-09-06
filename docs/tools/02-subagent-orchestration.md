# Orquestração de subagentes — versão endurecida

## Princípio

**Comece com um agente.** Subagentes são uma ferramenta de isolamento e especialização, não uma meta de arquitetura.

Use múltiplos agentes quando pelo menos um motivo for verdadeiro:

- **isolamento de contexto**: investigação grande/verbosa poluiria a sessão principal;
- **paralelismo real**: tarefas podem avançar sem esperar resultado umas das outras;
- **especialização genuína**: checklist, ferramentas ou conhecimento específico muda materialmente o resultado.

Se nenhum desses motivos existir, um agente só costuma ser mais barato, simples e fiel ao contexto.

## Sessão principal

A sessão principal é dona do problema. Ela pode:

- entender requisitos;
- planejar;
- implementar trabalho bounded;
- delegar trabalho justificável;
- integrar resultados;
- executar validações finais;
- decidir quando escalar para humano.

“Orchestrator” é um papel, não uma proibição de editar código.

## Especialistas

Mantenha apenas papéis que o projeto realmente usa. Exemplos:

| Agente | Quando usar |
|---|---|
| `code-reviewer` | revisão independente de diff |
| `security-reviewer` | auth, autorização, input não confiável, segredos |
| `database-architect` | schema, migration, índices, consistência |
| `test-engineer` | desenho test-first, edge cases, integração |
| `frontend-specialist` | UI/framework/a11y/performance de render |
| `backend-specialist` | APIs, regras servidor, persistência |
| `debugger` | investigação de causa raiz antes de corrigir |

Evite dois papéis com gatilhos quase idênticos.

## Contrato de tarefa

Toda tarefa delegada deve receber o mínimo de contexto suficiente e um contrato verificável:

```text
ID: T01
Goal: resultado observável
Files: arquivos previstos
Resources: DB/migration/porta/serviço/lockfile compartilhado
Interfaces: contratos consumidos e produzidos
Depends-on: IDs predecessores
Generated-artifacts: snapshots, clientes, schemas, código gerado
Shared-state: qualquer estado mutável comum
Verify: comandos/asserções que provam conclusão
Risk: normal | high
```

Se o escopo não puder ser descrito com confiança, não paralelize ainda.

## Independência real

Duas tarefas podem compartilhar uma onda somente quando:

1. não existe dependência direta ou transitiva;
2. os arquivos escritos são disjuntos **ou estão isolados em worktrees**;
3. não disputam o mesmo recurso mutável;
4. não produzem artefatos com nomes/ordem conflitantes;
5. nenhuma consome uma interface que a outra ainda está modificando.

### Exemplo de falso paralelismo

```text
T01 cria migration 018_add_coupon
T02 cria migration 018_add_index
```

Mesmo se os arquivos forem diferentes, existe conflito de namespace/ordem.

Outro caso:

```text
T01 altera schema
T02 gera cliente a partir do schema
```

Arquivos distintos; dependência semântica clara.

## Política de worktree

- read-only reviewers/explorers: podem compartilhar checkout;
- um escritor: working tree normal;
- 2+ escritores simultâneos: prefira worktrees/branches isoladas;
- estado externo não isolável: execute serialmente.

Se o harness oferece `isolation: worktree`, use esse mecanismo em vez de confiar apenas em disciplina de prompt.

## Commits

Em checkout compartilhado, só um ator deve criar commits. Em worktrees isoladas, cada agente pode commit-ar na própria branch, e o integrador aplica/mergeia em ordem controlada.

Nunca permita dois agentes concorrentes disputando o mesmo index Git.

## Loop de uma onda

1. valide os contratos das tarefas;
2. confirme independência de arquivos **e estado**;
3. crie isolamento quando necessário;
4. dispare os agentes em paralelo;
5. aguarde todos;
6. rode validações por tarefa;
7. integre resultados serialmente;
8. rode validações globais;
9. faça review proporcional ao risco;
10. registre evidência no PR/issue.

## Escolha de modelo

Use o menor nível de capacidade que resolve o trabalho com margem. Trabalho mecânico não precisa do modelo mais caro; decisões arquiteturais difíceis podem precisar. Mas não fixe tiers no documento para sempre: modelos mudam. Registre intenção (“rápido”, “default”, “raciocínio forte”) e ajuste ao harness atual.

## Anti-padrões

- subagente para toda edição;
- dividir por cargo (“um agente por camada”) sem independência real;
- plano, implementação e teste separados quando todos dependem do mesmo contexto;
- paralelizar somente porque os paths diferem;
- compartilhar migration namespace, lockfile, fixtures ou ambiente sem coordenação;
- usar painel de agentes como substituto de testes;
- integrar resultado sem rodar os comandos de verificação.

## Regra de fallback

Se houver dúvida real sobre independência, **serialize**. O pior resultado de serializar demais é latência. O pior resultado de paralelizar estado acoplado é corrupção ou uma integração aparentemente verde, mas semanticamente inconsistente.
