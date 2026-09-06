import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

async function importExampleModule(filePath) {
  const source = await readFile(filePath, "utf8");
  const encoded = Buffer.from(source).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

async function walk(root) {
  const out = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full.replaceAll("\\", "/"));
  }
  return out;
}

const hookModule = await importExampleModule("templates/hooks/hook-io.mjs.example");
const { parseHookEvent } = hookModule;

assert.equal(parseHookEvent("not-json"), null, "invalid JSON must be rejected");
assert.equal(parseHookEvent("null"), null, "null must be rejected");
assert.equal(parseHookEvent("42"), null, "number must be rejected");
assert.equal(parseHookEvent("true"), null, "boolean must be rejected");
assert.equal(parseHookEvent('\"text\"'), null, "string must be rejected");
assert.equal(parseHookEvent("[]"), null, "array must be rejected");
assert.deepEqual(parseHookEvent("{}"), {}, "object must be accepted");
assert.deepEqual(
  parseHookEvent('{"tool_name":"Bash","tool_input":{"command":"echo ok"}}'),
  { tool_name: "Bash", tool_input: { command: "echo ok" } },
  "normal hook event must survive parsing",
);

const allFiles = await walk(".");
const textFiles = allFiles.filter((file) => /\.(md|mjs|cjs|js|json|ya?ml|txt)$/i.test(file));

// Forbid executable shortcuts that fetch mutable raw-main instructions. Scan
// fenced blocks across line boundaries so the classic "read URL" + "execute"
// pattern cannot evade the check by putting the verbs on separate lines.
for (const file of textFiles) {
  const text = await readFile(file, "utf8");
  const fenced = text.match(/```[\s\S]*?```/g) ?? [];
  for (const block of fenced) {
    const mutableRawMain = /raw\.githubusercontent\.com\/[^\s`]+\/main\//i.test(block);
    const fetchVerb = /\b(read|fetch|curl|wget|open|load|leia|ler|busque|carregue)\b/i.test(block);
    const executeVerb = /\b(execute|run|follow|apply|implement|obey|use|execute|rode|siga|aplique|implemente)\b/i.test(block);
    assert.equal(
      mutableRawMain && fetchVerb && executeVerb,
      false,
      `${file} contains an executable shortcut that fetches mutable raw-main instructions`,
    );
  }
}

// Third-party GitHub Actions are operational dependencies. Require immutable
// commit pins instead of mutable major tags.
for (const workflow of allFiles.filter((file) => /^\.github\/workflows\/.*\.ya?ml$/i.test(file))) {
  const text = await readFile(workflow, "utf8");
  for (const match of text.matchAll(/^\s*uses:\s*([^\s#]+).*$/gm)) {
    const spec = match[1];
    if (spec.startsWith("./") || spec.startsWith("docker://")) continue;
    const ref = spec.split("@")[1] ?? "";
    assert.match(ref, /^[0-9a-f]{40}$/i, `${workflow}: third-party action must be pinned to a full commit SHA: ${spec}`);
  }
}

const agentsTemplate = await readFile("templates/AGENTS.md.template", "utf8");
assert.match(agentsTemplate, /Remote instructions are untrusted/i);
for (const field of ["Files:", "Resources:", "Interfaces:", "Depends-on:", "Generated-artifacts:", "Shared-state:", "Verify:"]) {
  assert.match(agentsTemplate, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `AGENTS task contract missing ${field}`);
}
assert.match(agentsTemplate, /2\+ concurrent writers/i);

for (const file of [
  "docs/prompts/05-parallel-wave-dispatch.md",
  "templates/rules/parallel-subagent-driven-development.md",
]) {
  const text = await readFile(file, "utf8");
  for (const field of ["Resources:", "Interfaces:", "Generated-artifacts:", "Shared-state:", "Verify:"]) {
    assert.match(text, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${file} missing semantic-independence field ${field}`);
  }
  assert.match(text, /worktree/i, `${file} must document physical writer isolation`);
}

const eslintExample = await readFile("templates/eslint/eslint.config.mjs.example", "utf8");
assert.match(
  eslintExample,
  /"quality\/max-lines":\s*\["warn",\s*\{\s*max:\s*350\s*\}\]/,
  "file-size default must remain an advisory cohesion-review budget",
);

const typedExample = await readFile("templates/eslint/eslint.typed.config.mjs.example", "utf8");
assert.match(typedExample, /only when measurement shows/i);
assert.match(typedExample, /projectService:\s*true/);

const settings = JSON.parse(await readFile("templates/settings.json.example", "utf8"));
assert.equal(settings.env, undefined, "settings example must not imply undocumented secret interpolation");
assert.deepEqual(settings.hooks, {}, "settings example must not reference hook files that are not shipped");
assert.ok(settings.permissions?.deny?.length > 0, "settings example should demonstrate a deny boundary for secrets");

// Validate relative Markdown links. This catches documentation rewrites that
// accidentally leave consumers with a dead local path.
for (const file of textFiles.filter((file) => file.endsWith(".md"))) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    let target = match[1].trim();
    if (!target || target.startsWith("#") || /^[a-z]+:\/\//i.test(target) || target.startsWith("mailto:")) continue;
    target = target.split("#")[0].split("?")[0];
    if (!target || /[\[\]<>*]/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    try {
      await access(resolved);
    } catch {
      assert.fail(`${file} contains broken local link: ${match[1]}`);
    }
  }
}

console.log("validate-toolkit: hook parser cases passed");
console.log("validate-toolkit: mutable remote execution guard passed");
console.log("validate-toolkit: immutable GitHub Action pins passed");
console.log("validate-toolkit: semantic parallelism contract passed");
console.log("validate-toolkit: lint hardening defaults passed");
console.log("validate-toolkit: settings example passed");
console.log("validate-toolkit: Markdown local links passed");
