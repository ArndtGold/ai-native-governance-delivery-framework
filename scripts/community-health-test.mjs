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
  "assets/intro.png",
  ".agdf/control/SOT_REGISTRY.md",
  ".agdf/control/CONTEXT_GRAPH.md",
  ".agdf/control/artefacts/agdf-request-activation-boundary/INSTRUCTION_FOOTPRINT_AUDIT.md",
  "docs/agenten-handbuch",
  "docs/handbook",
  "docs/compatibility",
  "docs/00-manifest.md",
  "docs/01-framework-ueberblick.md",
  "docs/02-gates.md",
  "docs/03-artefakte.md",
  "docs/04-wissen-nutzbar-halten.md",
  "docs/05-vom-mythos-zur-pruefung.md",
  "docs/06-vom-notizzettel-zum-delivery-lagebild.md",
  "docs/07-domain-driven-delivery.md",
  "docs/glossar.md",
  "examples/sample-banking-flow.md",
  "examples/sample-delivery-flow.md",
  "INSTALL.md",
  "PRIVACY.md",
  "TERMS.md",
  "TRADEMARKS.md",
  "LICENSE",
  "NOTICE",
  "plugin/meta/agdf-runtime-contract.md",
  "plugin/control/README.md",
  "agdf/README.md",
];

async function makeFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "agdf-community-health-"));
  for (const relativePath of fixturePaths) {
    const source = path.join(repositoryRoot, relativePath);
    const target = path.join(root, relativePath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.cp(source, target, { recursive: true });
  }
  const englishHandbookRoot = path.join(root, "docs/handbook/en");
  for (const fileName of await fs.readdir(englishHandbookRoot)) {
    if (!fileName.endsWith(".md")) continue;
    const target = path.join(englishHandbookRoot, fileName);
    const content = await fs.readFile(target, "utf8");
    await fs.writeFile(target, content.replace("translation_status: candidate", "translation_status: reviewed"));
  }
  return root;
}

async function withFixture(mutator, expectedCode) {
  const root = await makeFixture();
  try {
    await mutator(root);
    const findings = await validateCommunityHealth(root, { checkCompatibility: () => ({ status: "pass" }) });
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

const baselineRoot = await makeFixture();
try {
  const baseline = await validateCommunityHealth(baselineRoot, { checkCompatibility: () => ({ status: "pass" }) });
  assert.deepEqual(baseline, [], `Reviewed fixture baseline must pass: ${JSON.stringify(baseline)}`);
  const missingCompatibility = await validateCommunityHealth(baselineRoot);
  assert.ok(missingCompatibility.some(entry => entry.code === "HOST_COMPATIBILITY_INVALID"), "the default read-only check rejects missing source/evidence inputs");
} finally {
  await fs.rm(baselineRoot, { recursive: true, force: true });
}

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
  (root) => replace(root, "SECURITY.md", "[agdf@iself.eu](mailto:agdf@iself.eu)", "no private contact"),
  "SECURITY_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => fs.appendFile(path.join(root, "SECURITY.md"), "\nResponse within 24 hours.\n"),
  "NUMERIC_SLA_FORBIDDEN",
);

await withFixture(
  (root) => replace(root, "SUPPORT.md", "English or German", "English only"),
  "LANGUAGE_POLICY_DRIFT",
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
  (root) => replace(root, "CONTRIBUTING.md", "Do not submit raw prompts", "Submit complete prompts"),
  "CONTRIBUTION_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => replace(root, "GOVERNANCE.md", "sole maintainer", "shared maintainers"),
  "GOVERNANCE_AUTHORITY_INCOMPLETE",
);

await withFixture(
  (root) => replace(root, "CODE_OF_CONDUCT.md", "request a review", "accept no further review"),
  "CONDUCT_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => replace(
    root,
    "docs/handbook/de/04-mehrere-runs.md",
    "Ein Run ersetzt keine Git- oder Worktree-Strategie",
    "Ein Run isoliert automatisch jede Datei",
  ),
  "HANDBOOK_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => replace(root, "docs/handbook/de/README.md", "AGDF in fünf Minuten", "AGDF für Fachleute"),
  "HANDBOOK_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => replace(root, "docs/handbook/de/04-mehrere-runs.md", "Die Run-Auswahl bestimmt nur, welchen AGDF-Kontrollzustand", "Die Run-Auswahl wechselt automatisch den Git-Branch"),
  "HANDBOOK_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => replace(root, "docs/handbook/de/06-fehlerbehebung.md", "agdf doctor --all-active", "doctor --all-active"),
  "HANDBOOK_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => replace(root, "docs/handbook/de/04-mehrere-runs.md", "Das Plugin und die CLI sind getrennte Installationen", "Das Plugin installiert die CLI automatisch"),
  "HANDBOOK_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => fs.appendFile(path.join(root, "docs/handbook/de/01-schnellstart.md"), "\nSource changed.\n"),
  "AGDF_HANDBOOK_TRANSLATION_STALE",
);

await withFixture(
  (root) => fs.writeFile(path.join(root, "docs/handbook/de/unowned.md"), "# Unowned chapter\n"),
  "AGDF_HANDBOOK_INVENTORY_INVALID",
);

await withFixture(
  (root) => replace(root, "docs/handbook/en/README.md", "chapter_role: index", "chapter_role: quickstart"),
  "AGDF_HANDBOOK_TRANSLATION_METADATA_INVALID",
);

await withFixture(
  (root) => replace(root, "docs/handbook/en/01-quickstart.md", "Approval: <GateName>", "Approval: ANY"),
  "AGDF_HANDBOOK_PARITY_INVALID",
);

await withFixture(
  (root) => fs.appendFile(path.join(root, "docs/handbook/en/04-multiple-runs.md"), "\nChanges in one run do not affect other runs.\n"),
  "HANDBOOK_TRANSLATION_CONTRACT_INCOMPLETE",
);

await withFixture(
  (root) => fs.appendFile(path.join(root, "docs/agenten-handbuch/README.md"), "\nApproval: <GateName>\n"),
  "AGDF_HANDBOOK_COMPATIBILITY_INVALID",
);

await withFixture(
  (root) => replace(root, "docs/handbook/en/README.md", "translation_status: reviewed", "translation_status: candidate"),
  "AGDF_HANDBOOK_TRANSLATION_UNREVIEWED",
);

await withFixture(
  (root) => replace(root, ".agdf/control/CONTEXT_GRAPH.md", "CG-PUBLIC-COMMUNITY-GOVERNANCE", "CG-REMOVED"),
  "CONTEXT_GRAPH_NODE_MISSING",
);

await withFixture(
  (root) => replace(root, ".github/ISSUE_TEMPLATE/documentation.yml", "Deutsch oder Englisch", "nur Deutsch"),
  "FORM_LANGUAGE_MISSING",
);

console.log("community-health-test: pass (reviewed baseline + 29 negative contracts)");
