# Quality gates de lint — versão endurecida

Quality gate serve para transformar uma regra importante em algo que a máquina consegue verificar. O objetivo não é maximizar a quantidade de regras; é reduzir espaço para regressões relevantes.

## Uma ou duas ferramentas?

ESLint + Biome é uma combinação legítima quando existe separação clara de responsabilidade. Não é automaticamente melhor que uma ferramenta só.

Escolha o menor conjunto que cubra:

- regras sintáticas rápidas;
- regras type-aware quando necessárias;
- regras específicas do framework;
- fronteiras de arquitetura;
- formatação, se o projeto decidir automatizá-la.

Evite duplicar a mesma regra em duas ferramentas.

## Warn → error depende do baseline

Para uma base existente:

```text
violações > 0 → warn + baseline explícito
violações = 0 → error
```

Para projeto novo ou regra introduzida sem dívida, `error` desde o primeiro commit é válido.

O importante é não criar um gate vermelho sobre dívida antiga e então ensinar o time a ignorá-lo.

## 350 linhas: budget de revisão

`350` continua sendo um default útil, mas como **gatilho para revisar coesão**. Ajuste à linguagem e ao tipo de arquivo.

Quando um arquivo excede o budget:

1. procure responsabilidades separáveis;
2. avalie se a extração reduz acoplamento e melhora legibilidade;
3. preserve a interface pública;
4. se não houver costura natural, documente exceção.

Nunca aumente o número só para fazer o gate sumir, mas também não fragmente código coeso apenas para satisfazer a métrica.

Arquivos gerados, declarations, barrels, fixtures e alguns testes podem precisar de regra diferente.

## Complexidade

Métricas como `complexity`, `max-depth`, `max-statements` e tamanho de função são **sinais**. Elas ajudam a localizar áreas difíceis de manter, mas devem ser calibradas com falsos positivos reais do projeto.

## Fronteiras de arquitetura

Esse é o uso mais valioso do lint customizado: impedir dependências que a arquitetura não permite.

Exemplos:

```text
UI -> banco direto: proibido
feature -> infraestrutura interna de outra feature: proibido
rota de mutação sem auth guard: proibido quando detectável estaticamente
```

Antes de escrever regra própria, procure plugins existentes. Regra customizada compensa quando o invariant é realmente específico do projeto.

## Type-aware lint

Typed lint usa informação do programa TypeScript e seu custo costuma ficar na mesma ordem de grandeza do typecheck. Meça.

Se a latência for aceitável, um único `lint` simplifica o fluxo. Se o custo prejudicar commits/feedback local, separe:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:types": "eslint --config eslint.typed.config.mjs ."
  }
}
```

Rode `lint:types` na CI e, quando útil, localmente. Não separe por dogma; separe por medição.

## Formatter em legado

Ativar formatter num projeto grande e nunca formatado pode criar diff massivo. Uma migração segura pode:

1. introduzir formatter para arquivos novos/tocados;
2. fazer commit isolado de formatação global quando o time estiver pronto;
3. depois bloquear regressões.

Em projeto novo, formatter desde o início é normalmente simples.

## Quality gate e segurança

Lint não substitui:

- testes de autorização;
- secret scanning;
- dependency scanning;
- testes de integração;
- revisão humana/agente de alto risco.

Use lint para propriedades que ele realmente consegue provar.

## Processo recomendado

1. descubra stack e configuração atual;
2. escolha poucos invariants de alto valor;
3. rode para obter baseline;
4. `warn` somente onde existe dívida;
5. registre baseline;
6. reduza a dívida em mudanças separadas;
7. promova a `error` quando zerar;
8. mantenha exceções pequenas, explícitas e justificadas.

Veja também [`../prompts/08-eslint-quality-gates-install.md`](../prompts/08-eslint-quality-gates-install.md) e [`../prompts/09-file-size-refactor.md`](../prompts/09-file-size-refactor.md).
