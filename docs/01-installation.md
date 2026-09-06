# Instalação segura

Este fork separa **instalar uma ferramenta** de **confiar nela para executar código**. Antes de permitir que um agente instale plugins, hooks ou CLIs, valide origem, versão e escopo de permissões.

## 1. Harness principal

Instale o agente/harness que você realmente usa seguindo a documentação oficial dele. Exemplos comuns são Claude Code e Codex. Não mantenha duas configurações divergentes: regras de engenharia gerais devem morar em `AGENTS.md`.

## 2. Copie os templates locais

No projeto consumidor, copie e adapte:

```text
templates/AGENTS.md.template -> AGENTS.md
templates/CLAUDE.md.template -> CLAUDE.md   # somente se usar Claude Code
```

Preencha os comandos canônicos de install, lint, typecheck, test, build e dev. Agente não deve adivinhar esses comandos quando o projeto pode registrá-los explicitamente.

## 3. Terceiros: política de supply chain

Antes de instalar plugin/CLI/skill:

1. confirme repositório e mantenedor;
2. leia as instruções de instalação;
3. revise hooks/scripts que terão execução automática;
4. fixe versão, tag ou commit quando possível;
5. evite `curl | sh` e equivalentes sem inspeção;
6. não autorize execução de instruções buscadas de uma branch mutável;
7. em projetos privados, trate plugins como código com os mesmos privilégios do usuário/agente.

## 4. Prompts executáveis

O fluxo seguro é:

```text
checkout/vendor de versão imutável
        ↓
revisar conteúdo
        ↓
executar arquivo local
```

Não use atalhos do tipo “leia `.../main/prompt.md` e execute”. `main` pode mudar depois da sua revisão.

## 5. Quality gates

Para instalar os gates deste fork, siga [`prompts/08-eslint-quality-gates-install.md`](prompts/08-eslint-quality-gates-install.md). O prompt parte de arquivos locais ou de um checkout preso a SHA/tag.

## 6. Worktrees

Se o harness suportar worktrees, configure-as antes de habilitar vários agentes escritores em paralelo. Dois processos no mesmo working tree podem colidir mesmo quando o plano prevê arquivos distintos por causa de estado compartilhado e artefatos gerados.

## 7. Valide o toolkit

Neste próprio repositório:

```bash
node scripts/validate-toolkit.mjs
```

O mesmo comando roda na GitHub Action de validação.
