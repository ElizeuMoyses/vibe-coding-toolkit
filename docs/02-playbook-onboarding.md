# Playbook de onboarding — do zero a um fluxo agent-first seguro

Este playbook é a rota recomendada do fork.

## Passo 1 — registre a verdade operacional

Crie `AGENTS.md` a partir de `templates/AGENTS.md.template` e preencha:

- stack e package manager;
- comandos canônicos;
- limites de segurança;
- convenções arquiteturais;
- superfícies de alto risco;
- critérios de conclusão.

Se usar Claude Code, adicione `CLAUDE.md` pequeno, importando `AGENTS.md` e contendo apenas regras específicas do harness.

## Passo 2 — classifique a tarefa

Antes de editar:

### Bounded
Escopo pequeno, comportamento conhecido, sem nova arquitetura e sem superfície sensível. O agente principal pode implementar diretamente.

### Complexa
Cruza camadas, introduz comportamento novo, exige migration, altera interfaces compartilhadas ou tem dependências não óbvias. Escreva plano explícito.

### Alto risco
Auth/autorização, RLS, dinheiro, PII, segredos, migrations destrutivas, infraestrutura, concorrência ou criptografia. Além do plano, reserve revisão especializada.

## Passo 3 — decida se subagentes agregam valor

Delegue somente por:

- isolamento de contexto;
- paralelismo real;
- especialização genuína.

Se nenhuma condição existir, mantenha um agente. Menos handoffs significa menos perda de contexto.

## Passo 4 — escreva o contrato de tarefas paralelas

Para cada tarefa:

```text
ID:
Goal:
Files:
Resources:
Interfaces:
Depends-on:
Generated-artifacts:
Shared-state:
Verify:
```

`Resources` cobre migrations, portas, banco, filas, lockfiles ou serviços externos. `Interfaces` registra contratos produzidos/consumidos. `Generated-artifacts` cobre clientes, snapshots e arquivos derivados. `Shared-state` torna explícito o que pode causar corrida.

## Passo 5 — escolha isolamento

- revisão/read-only: mesmo checkout normalmente basta;
- um escritor: working tree normal;
- 2+ escritores paralelos: prefira worktrees/branches isoladas;
- estado não isolável: serialize.

Arquivos disjuntos são necessários, mas não suficientes.

## Passo 6 — implemente com feedback curto

Para cada unidade:

1. reproduza o comportamento/bug quando aplicável;
2. escreva ou ajuste teste;
3. implemente o mínimo necessário;
4. rode verificação relevante;
5. inspecione o diff;
6. registre concerns explicitamente.

Não espere o fim de um lote grande para descobrir que o primeiro passo já quebrou o sistema.

## Passo 7 — gates

No mínimo, escolha entre:

```text
lint
typecheck
tests
build
security/static checks
```

Use os comandos canônicos do projeto. “Parece certo” não substitui execução.

## Passo 8 — revisão proporcional ao risco

Mudança normal → code reviewer independente.

Mudança de alto risco → painel com as lentes realmente aplicáveis, por exemplo segurança + banco + framework. Toda finding precisa de cenário concreto de falha.

## Passo 9 — GitHub como memória de execução

Issue/PR deve registrar:

- contexto e objetivo;
- decisões importantes;
- testes/comandos executados;
- resultados;
- riscos/pendências;
- arquivos/áreas afetadas.

A conversa do agente é transitória; o histórico do trabalho precisa ficar no repositório.

## Passo 10 — supply chain

Nunca execute automaticamente conteúdo remoto mutável. Prompts e scripts devem ser vendorizados ou referenciados por SHA/tag imutável após revisão.

## Checklist de conclusão

- [ ] requisito atendido;
- [ ] premissas materiais registradas;
- [ ] testes relevantes passando;
- [ ] lint/typecheck/build quando aplicáveis;
- [ ] nenhuma regressão conhecida criada;
- [ ] revisão proporcional ao risco concluída;
- [ ] evidência registrada no PR/issue;
- [ ] nenhum conteúdo remoto mutável executado sem revisão.
