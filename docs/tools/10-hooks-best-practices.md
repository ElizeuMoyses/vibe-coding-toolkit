# Hooks — práticas seguras

Hooks executam automaticamente e, por isso, merecem o mesmo rigor de scripts de produção.

## Contrato de entrada

Não assuma que `JSON.parse` devolve um objeto. JSON válido também pode ser:

```json
null
42
true
"texto"
[]
```

O helper deste fork só aceita **objeto não-array** como evento válido:

```js
export function parseHookEvent(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    return null;
  }

  return parsed;
}
```

Depois disso, valide os campos que o hook realmente exige. “É objeto” não significa “tem o schema correto”.

## Fail-open vs fail-closed

Use **fail-open** para melhorias opcionais: banners, dicas, compressão de saída, enriquecimento de contexto.

Use **fail-closed** ou confirmação explícita para controles de segurança onde permitir a ação durante falha seria pior que bloquear: proteção de segredos, comandos destrutivos, políticas de publicação, mutações irreversíveis.

A decisão deve ser escrita no próprio hook.

## Princípios

- leia stdin de forma defensiva;
- trate JSON inválido, `null`, scalar e array;
- use optional chaining em campos opcionais;
- limite stdout/stderr ao necessário;
- nunca exponha secrets no log;
- mantenha hooks rápidos;
- evite rede no caminho crítico quando não for indispensável;
- teste exit codes esperados;
- faça pin/review de qualquer dependência executada pelo hook.

## Exemplo de proteção de `.env`

```js
#!/usr/bin/env node
import { readStdinRaw, parseHookEvent } from "./hook-io.mjs";

const event = parseHookEvent(readStdinRaw());
if (event === null) process.exit(0);

const filePath = event?.tool_input?.file_path;
if (typeof filePath !== "string") process.exit(0);

if (/\.env(\..+)?$/.test(filePath)) {
  console.error(`Bloqueado: ${filePath} parece conter segredos.`);
  process.exit(2);
}

process.exit(0);
```

Confirme na documentação do seu harness o significado dos exit codes. Não copie códigos de bloqueio entre ferramentas assumindo compatibilidade.

## Teste local

Teste pelo menos:

```text
JSON inválido
null
42
[]
{}
evento normal
entrada sensível
```

Este repositório automatiza esses casos para `parseHookEvent` em `scripts/validate-toolkit.mjs`.

## Supply chain

Um hook pode transformar uma dependência comprometida em execução automática. Não execute scripts remotos de branch mutável. Prefira código local versionado e dependências pinadas quando possível.
