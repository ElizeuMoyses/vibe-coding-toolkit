# Hooks — práticas seguras

Hooks executam automaticamente e merecem o mesmo rigor de scripts de produção. O parser, o schema do evento, o exit behavior e a política de falha fazem parte do controle de segurança.

## Contrato de entrada

`JSON.parse` pode devolver JSON válido que não é um objeto de evento:

```json
null
42
true
"texto"
[]
```

O helper deste fork aceita somente **objeto não-array**:

```js
export function parseHookEvent(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  return parsed;
}
```

Isso é apenas a primeira camada. Depois valide os campos obrigatórios do evento. “É objeto” não significa “tem o schema correto”.

## Fail-open vs fail-closed

Use **fail-open** somente quando perder o hook é aceitável: banner, dica, compactação de saída, telemetria opcional ou enriquecimento de contexto.

Use **fail-closed** para controles de segurança quando permitir a operação durante falha seria pior que bloquear: proteção de segredos, comandos destrutivos, publicação, deploy, mutações irreversíveis e políticas de acesso.

A política deve ser explícita no próprio hook e testada.

## Exemplo: Claude Code `PreToolUse` protegendo `.env`

No Claude Code, `PreToolUse` pode bloquear uma chamada de ferramenta. Neste exemplo de **controle de segurança**, payload inválido ou schema incompleto também bloqueiam; não existe bypass por erro de parsing.

```js
#!/usr/bin/env node
import { readStdinRaw, parseHookEvent } from "./hook-io.mjs";

const event = parseHookEvent(readStdinRaw());
if (event === null) {
  console.error("Bloqueado: evento do hook inválido.");
  process.exit(2);
}

const filePath = event?.tool_input?.file_path;
if (typeof filePath !== "string") {
  console.error("Bloqueado: file_path ausente ou inválido.");
  process.exit(2);
}

if (/(^|\/)\.env(\..+)?$/.test(filePath)) {
  console.error(`Bloqueado: ${filePath} parece conter segredos.`);
  process.exit(2);
}

process.exit(0);
```

O `exit 2` acima é específico do contrato atual de hooks do Claude Code. Outros harnesses podem usar outro código ou JSON estruturado; confirme a documentação da ferramenta antes de copiar o mecanismo de bloqueio.

## Princípios

- leia stdin de forma defensiva;
- rejeite JSON inválido, `null`, scalar e array;
- valide schema/campos antes de decidir;
- escolha fail-open/fail-closed de acordo com o risco;
- nunca exponha secrets no log;
- limite stdout/stderr ao necessário;
- mantenha hooks rápidos e evite rede no caminho crítico quando possível;
- teste o caminho permitido **e** o caminho bloqueado;
- faça pin/review de dependências executadas pelo hook;
- mantenha código de hook local e versionado.

## Casos mínimos de teste

```text
JSON inválido
null
42
[]
{}
evento normal
evento sem campo obrigatório
entrada sensível
```

Este repositório automatiza os casos básicos do parser em `scripts/validate-toolkit.mjs`.

## Supply chain

Um hook pode transformar uma dependência comprometida em execução automática. Prefira código local revisado e versões resolvidas por digest/commit SHA. Não execute scripts vindos diretamente de branch mutável.
