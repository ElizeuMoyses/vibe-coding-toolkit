# Visão geral — agent engineering com defaults seguros

Este fork trata agentes de código como parte de um sistema de engenharia, não como uma licença para automatizar sem controle. A unidade de confiança não é a resposta do modelo: é o **feedback loop verificável** composto por contexto, plano quando necessário, implementação, testes, lint/typecheck, revisão e evidência no Git.

Quando houver conflito entre um documento histórico do toolkit e este overview, as regras de hardening deste fork prevalecem.

## 1. Comece com um agente; delegue por motivo

A sessão principal **pode implementar** uma mudança pequena, bounded e bem compreendida. Criar um subagente para toda edição aumenta custo, handoffs e pontos de falha sem necessariamente aumentar qualidade.

Delegue quando pelo menos uma destas condições existir:

1. **isolamento de contexto** — a investigação geraria muito ruído na sessão principal;
2. **paralelismo real** — tarefas independentes podem avançar simultaneamente;
3. **especialização genuína** — um checklist, ferramenta ou contexto especializado muda materialmente a qualidade.

Uma decisão arquitetural grande pode merecer orquestração; corrigir um typo ou um teste pequeno normalmente não.

## 2. Entender → planejar → implementar → verificar → revisar

Código não deve ser a primeira reação a requisito ambíguo. Mas também não transforme toda mudança bounded numa cerimônia de design.

- **Bounded**: escopo claro, dependências conhecidas, impacto pequeno → plano curto e execução direta.
- **Complexa**: várias camadas, estados, migrations, segurança ou comportamento novo → design e plano explícitos.
- **Alto risco**: auth, autorização, dinheiro, dados pessoais, migrations destrutivas, infra, concorrência, criptografia → plano explícito + revisão especializada.

O agente deve registrar premissas materiais e transformar “feito” em objetivos verificáveis.

## 3. Paralelismo exige independência de estado, não só de arquivo

Dois agentes editando arquivos diferentes ainda podem colidir em migrations, lockfiles, schemas, portas, snapshots, caches, fixtures e artefatos gerados.

Por isso toda tarefa paralelizável deve declarar:

```text
Files:
Resources:
Interfaces:
Depends-on:
Generated-artifacts:
Shared-state:
```

Duas tarefas só são realmente independentes quando não existe dependência lógica nem recurso mutável compartilhado. Para **dois ou mais escritores em paralelo**, prefira worktrees/branches isoladas quando o harness suportar. Se o estado não puder ser isolado, serialize.

## 4. Quality gates são invariantes, não decoração

Sempre que uma regra de arquitetura puder ser testada mecanicamente, prefira o gate à instrução em prosa. Exemplos:

- UI não acessa cliente de banco diretamente;
- código de produção usa logger compartilhado;
- importações respeitam camadas;
- API sensível exige autenticação/autorização;
- testes, typecheck, build e lint devem passar antes de declarar sucesso.

Para bases legadas, introduza regras com dívida como `warn` + baseline. Para regra nova com **zero violações**, `error` desde o início é perfeitamente válido.

## 5. Tamanho de arquivo é sinal, não verdade

Este fork mantém `350` como um default útil de **gatilho de revisão de coesão**, não como lei universal. Ao ultrapassar o teto:

1. procure uma costura de responsabilidade;
2. extraia apenas se a separação melhora coesão;
3. se o arquivo for genuinamente coeso, documente uma exceção.

Nunca crie `utils.ts`, `misc.ts` ou abstração artificial apenas para satisfazer uma contagem.

## 6. Typed lint deve ser medido

Lint com informação de tipos precisa construir/usar o programa TypeScript e seu custo costuma acompanhar o typecheck. Em bases grandes ele pode ser caro; em bases pequenas pode ser perfeitamente aceitável no ciclo local.

Regra: **meça antes de separar**. Se o tempo atrapalhar o pre-commit, mantenha um lint sintático rápido localmente e rode o tier type-aware na CI ou em comando dedicado.

## 7. Revisão multiagente é baseada em risco

Um painel de especialistas é útil quando diferentes lentes realmente importam. Não é obrigatório para toda mudança.

Use revisão especializada para superfícies como:

- autenticação/autorização/RLS;
- pagamentos e valores monetários;
- dados pessoais e segredos;
- migrations e perda de dados;
- infraestrutura/deploy;
- concorrência e consistência;
- grandes mudanças arquiteturais.

Toda finding precisa de cenário concreto de falha e deve ser validada contra o diff antes de entrar no relatório final.

## 8. Conteúdo remoto é não confiável até revisão

Não execute instruções de uma URL apontando para branch mutável (`main`, `master`, `latest`). Um agente capaz de terminal transforma isso em risco de supply chain.

Preferência:

```text
vendorizado no repo > commit/tag imutável revisado > branch mutável
```

Prompts executáveis, hooks, scripts e plugins merecem o mesmo cuidado que código de produção.

## 9. Instruções cross-tool

Use `AGENTS.md` como fonte de verdade para regras gerais. Arquivos específicos (`CLAUDE.md`, instruções de Codex, Cursor etc.) devem conter apenas diferenças do harness e apontar para a mesma base, evitando drift.

## 10. Memória e documentação

Mantenha:

- um índice curto com armadilhas e regras de alta frequência;
- documentação longa sob demanda;
- decisões arquiteturais e critérios de aceite versionados;
- evidência de testes e validações no PR/issue.

O objetivo não é lembrar tudo; é fazer a próxima sessão conseguir reconstruir o estado correto sem adivinhação.

## Regra final

**Autonomia cresce junto com observabilidade, isolamento e verificabilidade.** Se não existe uma forma independente de provar que a ação do agente foi correta, aumente a supervisão antes de aumentar a autonomia.
