#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { validateCommunityHealth } from "./check-community-health.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturePaths = [
  "README.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "GOVERNANCE.md",
  ".github",
  "assets/github-social-preview.png",
  ".agdf/control/SOT_REGISTRY.md",
  ".agdf/control/CONTEXT_GRAPH.md",
];

async function makeFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "agdf-community-health-"));
  for (const relativePath of fixturePaths) {
    const source = path.join(repositoryRoot, relativePath);
    const target = path.join(root, relativePath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.cp(source, target, { recursive: true });
  }
  return root;
}

async function withFixture(mutator, expectedCode) {
  const root = await makeFixture();
  try {
    await mutator(root);
    const findings = await validateCommunityHealth(root);
    assert.ok(
      findings.some((entry) => entry.code === expectedCode),
      `Expected ${expectedCode}; observed ${JSON.stringify(findings)}`,
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

async function replace(root, relativePath, from, to) {
  const target = path.join(root, relativePath);
  const content = await fs.readFile(target, "utf8");
  assert.ok(content.includes(from), `Fixture source text not found in ${relativePath}: ${from}`);
  await fs.writeFile(target, content.replace(from, to));
}

const baseline = await validateCommunityHealth(repositoryRoot);
assert.deepEqual(baseline, [], `Repository baseline must pass: ${JSON.stringify(baseline)}`);

const yamlFiles = [
  "bug_report.yml",
  "runtime_compatibility.yml",
  "documentation.yml",
  "feature_proposal.yml",
  "config.yml",
];
for (const fileName of yamlFiles) {
  const content = await fs.readFile(path.join(repositoryRoot, ".github/ISSUE_TEMPLATE", fileName), "utf8");
  const document = parseDocument(content, { uniqueKeys: true });
  assert.equal(document.errors.length, 0, `${fileName} must parse without YAML errors`);
}

await withFixture(
  (root) => fs.rm(path.join(root, "SECURITY.md")),
  "REQUIRED_FILE_MISSING",
);

await withFixture(
  (root) => fs.writeFile(path.join(root, ".github/ISSUE_TEMPLATE/bug_report.yml"), "name: [invalid"),
  "YAML_INVALID",
);

await withFixture(
  (root) => replace(root, ".github/ISSUE_TEMPLATE/bug_report.yml", "id: observed", "id: expected"),
  "FORM_ID_DUPLICATE",
);

await withFixture(
  (root) => replace(root, ".github/ISSUE_TEMPLATE/config.yml", "blank_issues_enabled: false", "blank_issues_enabled: true"),
  "BLANK_ISSUES_ENABLED",
);

await withFixture(
  (root) => replace(root, ".github/repository-metadata.json", "https://agdf.iself.eu", "https://example.invalid"),
  "METADATA_DRIFT",
);

await withFixture(
  (root) => fs.writeFile(path.join(root, "assets/github-social-preview.png"), Buffer.from("not a png")),
  "SOCIAL_PREVIEW_INVALID",
);

await withFixture(
  (root) => replace(root, "SECURITY.md", "[agdf@iself.eu](mailto:agdf@iself.eu)", "kein privater Kontakt"),
  "SECURITY_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => fs.appendFile(path.join(root, "SECURITY.md"), "\nAntwort innerhalb von 24 Stunden.\n"),
  "NUMERIC_SLA_FORBIDDEN",
);

await withFixture(
  (root) => replace(root, ".github/CODEOWNERS", "* @ArndtGold", "* @someone-else"),
  "CODEOWNERS_OWNER_MISMATCH",
);

await withFixture(
  (root) => replace(root, "README.md", "(SUPPORT.md)", "(DOES_NOT_EXIST.md)"),
  "MARKDOWN_LINK_BROKEN",
);

await withFixture(
  (root) => replace(root, "README.md", "(SUPPORT.md)", "(../../outside.md)"),
  "MARKDOWN_LINK_ESCAPE",
);

await withFixture(
  (root) => replace(root, "CONTRIBUTING.md", "keine Rohprompts", "vollständige Rohprompts"),
  "CONTRIBUTION_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => replace(root, ".agdf/control/CONTEXT_GRAPH.md", "CG-PUBLIC-COMMUNITY-GOVERNANCE", "CG-REMOVED"),
  "CONTEXT_GRAPH_NODE_MISSING",
);

await withFixture(
  (root) => replace(root, ".github/ISSUE_TEMPLATE/documentation.yml", "Deutsch oder Englisch", "nur Deutsch"),
  "FORM_LANGUAGE_MISSING",
);

console.log("community-health-test: pass (baseline + 14 negative contracts)");
