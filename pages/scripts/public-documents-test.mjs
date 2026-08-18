import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pagesRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = resolve(pagesRoot, "..");
const read = (path) => readFileSync(resolve(repoRoot, path), "utf8");
const prose = (path) => read(path).replace(/\s+/g, " ");

const documents = {
  privacy: "PRIVACY.md",
  terms: "TERMS.md",
  support: "SUPPORT.md",
};

for (const document of Object.values(documents)) {
  assert.equal(existsSync(resolve(repoRoot, document)), true, `${document} must exist at repository root`);
}

const privacy = prose("PRIVACY.md");
assert.match(privacy, /Skills-only distribution/);
assert.match(privacy, /does not include an AGDF-operated MCP server/);
assert.match(privacy, /does not receive your prompts, conversations, repository contents or plugin usage/);
assert.match(privacy, /OpenAI and other platforms/);
assert.match(privacy, /Do not place secrets, credentials, identity documents/);

const terms = prose("TERMS.md");
for (const required of ["Apache License, Version 2.0", "not an OpenAI product", "not endorsed or certified by OpenAI", "not a legal, regulatory, security, privacy, financial or professional assessment", "no service-level agreement"]) {
  assert.equal(terms.includes(required), true, `TERMS.md must preserve boundary: ${required}`);
}

const routeSource = read("pages/src/data/publicDocuments.ts");
const indexSource = read("pages/src/pages/index.astro");
for (const [route, document] of Object.entries(documents)) {
  const target = `https://github.com/arndtgold/ai-native-governance-delivery-framework/blob/main/${document}`;
  assert.equal(routeSource.includes(target), true, `/${route} must target canonical ${document}`);
  assert.equal(indexSource.includes(`href=\"/${route}\"`), true, `footer must expose /${route}`);

  const builtRoute = resolve(pagesRoot, "dist", route, "index.html");
  assert.equal(existsSync(builtRoute), true, `built /${route} route must exist`);
  assert.equal(readFileSync(builtRoute, "utf8").includes(target), true, `built /${route} must resolve to canonical ${document}`);
}

assert.match(read("pages/astro.config.mjs"), /site:\s*['"]https:\/\/agdf\.iself\.eu['"]/);
assert.match(read("pages/src/data/site.ts"), /domain:\s*["']agdf\.iself\.eu["']/);
for (const phrase of ["Skills-only public candidate", "without adding an AGDF-operated MCP server", "Advisory until verified", "Installation alone does not prove enforcement", "OpenAI owns verified publisher identity", "not an OpenAI product"]) {
  assert.equal(`${read("pages/src/data/site.ts")}\n${indexSource}`.includes(phrase), true, `public plugin positioning must preserve: ${phrase}`);
}

console.log("Public document and route tests passed");
