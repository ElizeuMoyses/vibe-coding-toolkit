# Hardening deste fork

Este documento registra as decisões que diferenciam `ElizeuMoyses/vibe-coding-toolkit` do upstream. O objetivo não é desautorizar a metodologia original; é torná-la mais segura para bases privadas, CI, múltiplos agentes e diferentes harnesses.

## Decisão 1 — single-agent first

**Antes:** a sessão principal era descrita como orquestradora e não implementadora.

**Agora:** a sessão principal pode implementar tarefas bounded. Delegação precisa justificar o custo por isolamento de contexto, paralelismo real ou especialização genuína.

**Por quê:** handoffs perdem contexto e multiagente adiciona custo e novos modos de falha.

## Decisão 2 — independência semântica

**Antes:** dependência + conjuntos de arquivos disjuntos eram a principal regra das ondas.

**Agora:** o contrato inclui também recursos, interfaces, artefatos gerados e estado compartilhado.

**Por quê:** migrations, schemas, lockfiles, snapshots e serviços compartilhados podem colidir sem editar o mesmo arquivo.

## Decisão 3 — worktrees cedo para escritores concorrentes

**Antes:** worktree aparecia como válvula de escape.

**Agora:** 2+ agentes escritores em paralelo devem preferir worktrees/branches isoladas quando o harness suportar.

**Por quê:** é isolamento estrutural; disciplina de prompt não elimina corrida de estado.

## Decisão 4 — 350 linhas como trigger

**Antes:** `350` aparecia com frequência como teto padrão.

**Agora:** é gatilho de revisão de coesão. Arquivo longo e coeso pode ser explicitamente isento.

**Por quê:** contagem de linhas é proxy, não medida de arquitetura.

## Decisão 5 — warn/error por baseline

**Antes:** a narrativa sugeria que regra nova deveria começar em `warn`.

**Agora:** se há dívida existente, `warn` + baseline; se há zero violações e a regra é válida, `error` imediatamente.

## Decisão 6 — typed lint por medição

**Antes:** typed lint era descrito como drasticamente mais lento por definição.

**Agora:** tratamos seu custo como semelhante ao typecheck e medimos no projeto. Só separamos o tier quando a latência local realmente justificar.

## Decisão 7 — review multiagente por risco

**Antes:** painel era recomendado para toda mudança não trivial.

**Agora:** painel para superfícies de risco; review simples para mudanças normais.

## Decisão 8 — trust boundaries explícitas

“Inexistente/impossível” só é aceitável para invariantes internos comprovados. Dados externos, usuário, rede, banco, filesystem, fila, webhook e dependências cruzam fronteiras de confiança e exigem validação/tratamento proporcional ao risco.

## Decisão 9 — prompts remotos imutáveis

Este fork não recomenda executar `raw.githubusercontent.com/.../main/...`. Prompt executável é código operacional. Vendor ou pin por SHA/tag e revise antes.

## Decisão 10 — AGENTS.md como base portátil

`AGENTS.md` contém as regras gerais. Arquivos específicos de ferramenta só adaptam mecanismo, permissões, hooks e sintaxe do harness.

## Critério de sucesso

O fork atinge o objetivo quando um agente novo consegue entrar num projeto e descobrir:

1. qual é o objetivo;
2. quais comandos provam que está correto;
3. quando pode agir sozinho;
4. quando precisa delegar ou isolar;
5. quais fronteiras não pode cruzar;
6. como registrar evidência;
7. que conteúdo remoto não é confiável por padrão.
