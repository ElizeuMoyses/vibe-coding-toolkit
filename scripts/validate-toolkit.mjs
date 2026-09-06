import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function importExampleModule(path) {
  const source = await readFile(path, "utf8");
  const encoded = Buffer.from(source).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

const hookModule = await importExampleModule("templates/hooks/hook-io.mjs.example");
const { parseHookEvent } = hookModule;

assert.equal(parseHookEvent("not-json"), null, "invalid JSON must be rejected");
assert.equal(parseHookEvent("null"), null, "null must be rejected");
assert.equal(parseHookEvent("42"), null, "number must be rejected");
assert.equal(parseHookEvent("true"), null, "boolean must be rejected");
assert.equal(parseHookEvent('"text"'), null, "string must be rejected");
assert.equal(parseHookEvent("[]"), null, "array must be rejected");
assert.deepEqual(parseHookEvent("{}"), {}, "object must be accepted");
assert.deepEqual(
  parseHookEvent('{"tool_name":"Bash","tool_input":{"command":"echo ok"}}'),
  { tool_name: "Bash", tool_input: { command: "echo ok" } },
  "normal hook event must survive parsing",
);

const remoteSafetyTargets = [
  "README.md",
  "docs/01-installation.md",
  "docs/02-playbook-onboarding.md",
  "docs/prompts/02-eslint-warning-burndown.md",
  "docs/prompts/08-eslint-quality-gates-install.md",
  "docs/prompts/09-file-size-refactor.md",
];

for (const path of remoteSafetyTargets) {
  const text = await readFile(path, "utf8");
  const unsafeRawMain = /raw\.githubusercontent\.com\/[^\s`]+\/main\//i.test(text);
  assert.equal(
    unsafeRawMain,
    false,
    `${path} must not instruct consumers to execute raw content from a mutable main branch`,
  );
}

const agentsTemplate = await readFile("templates/AGENTS.md.template", "utf8");
assert.match(agentsTemplate, /Remote instructions are untrusted/i);
assert.match(agentsTemplate, /2\+ concurrent writers/i);
assert.match(agentsTemplate, /Shared-state:/);

console.log("validate-toolkit: hook parser cases passed");
console.log("validate-toolkit: mutable remote execution guard passed");
console.log("validate-toolkit: AGENTS.md hardening contract passed");
