#!/usr/bin/env node

import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { checkComparison } from "./host-compatibility/run.mjs";

const EXPECTED_METADATA = Object.freeze({
  schema_version: 1,
  description: "Kontrollorientiertes Governance- und Delivery-Framework für KI-gestützte Softwareentwicklung mit Codex, Claude Code, OpenCode und GitHub Copilot.",
  homepage: "https://agdf.iself.eu",
  topics: [
    "ai-governance",
    "agentic-software-development",
    "software-delivery",
    "brownfield",
    "codex",
    "claude-code",
    "opencode",
    "github-copilot",
    "npm",
  ],
  social_preview_source: "assets/github-social-preview.png",
  expected_features: {
    issues: true,
    discussions: true,
    private_vulnerability_reporting: true,
  },
});

const REQUIRED_FILES = Object.freeze([
  "README.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "GOVERNANCE.md",
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/runtime_compatibility.yml",
  ".github/ISSUE_TEMPLATE/documentation.yml",
  ".github/ISSUE_TEMPLATE/feature_proposal.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/pull_request_template.md",
  ".github/repository-metadata.json",
  "assets/github-social-preview.png",
  ".agdf/control/SOT_REGISTRY.md",
  ".agdf/control/CONTEXT_GRAPH.md",
  "docs/handbook/README.md",
  "docs/handbook/de/README.md",
  "docs/handbook/de/01-schnellstart.md",
  "docs/handbook/de/02-gates-und-freigaben.md",
  "docs/handbook/de/03-typische-arbeitsablaeufe.md",
  "docs/handbook/de/04-mehrere-runs.md",
  "docs/handbook/de/05-abschluss-und-auslieferung.md",
  "docs/handbook/de/06-fehlerbehebung.md",
  "docs/handbook/en/README.md",
  "docs/handbook/en/01-quickstart.md",
  "docs/handbook/en/02-gates-and-approvals.md",
  "docs/handbook/en/03-common-workflows.md",
  "docs/handbook/en/04-multiple-runs.md",
  "docs/handbook/en/05-closeout-and-delivery.md",
  "docs/handbook/en/06-troubleshooting.md",
  "docs/agenten-handbuch/README.md",
  "docs/agenten-handbuch/01-schnellstart.md",
  "docs/agenten-handbuch/02-gates-und-freigaben.md",
  "docs/agenten-handbuch/03-typische-arbeitsablaeufe.md",
  "docs/agenten-handbuch/04-mehrere-runs.md",
  "docs/agenten-handbuch/05-abschluss-und-auslieferung.md",
  "docs/agenten-handbuch/06-fehlerbehebung.md",
]);

const LEGACY_HANDBOOK_FILES = Object.freeze(REQUIRED_FILES.filter((entry) => entry.startsWith("docs/agenten-handbuch/")));
const GERMAN_HANDBOOK_FILES = Object.freeze(REQUIRED_FILES.filter((entry) => entry.startsWith("docs/handbook/de/")));
const ENGLISH_HANDBOOK_FILES = Object.freeze(REQUIRED_FILES.filter((entry) => entry.startsWith("docs/handbook/en/")));
const HANDBOOK_FILES = Object.freeze([
  "docs/handbook/README.md",
  ...GERMAN_HANDBOOK_FILES,
  ...ENGLISH_HANDBOOK_FILES,
  ...LEGACY_HANDBOOK_FILES,
]);

const HANDBOOK_CHAPTERS = Object.freeze([
  ["index", "docs/handbook/de/README.md", "docs/handbook/en/README.md"],
  ["quickstart", "docs/handbook/de/01-schnellstart.md", "docs/handbook/en/01-quickstart.md"],
  ["gates_and_approvals", "docs/handbook/de/02-gates-und-freigaben.md", "docs/handbook/en/02-gates-and-approvals.md"],
  ["common_workflows", "docs/handbook/de/03-typische-arbeitsablaeufe.md", "docs/handbook/en/03-common-workflows.md"],
  ["multiple_runs", "docs/handbook/de/04-mehrere-runs.md", "docs/handbook/en/04-multiple-runs.md"],
  ["closeout_and_delivery", "docs/handbook/de/05-abschluss-und-auslieferung.md", "docs/handbook/en/05-closeout-and-delivery.md"],
  ["troubleshooting", "docs/handbook/de/06-fehlerbehebung.md", "docs/handbook/en/06-troubleshooting.md"],
]);

const FORM_CONTRACTS = Object.freeze({
  "bug_report.yml": [
    "agdf_version",
    "surface",
    "environment",
    "reproduction",
    "expected",
    "observed",
    "evidence",
    "safety",
  ],
  "runtime_compatibility.yml": [
    "surface",
    "agdf_version",
    "host_version",
    "install_scope",
    "activation",
    "expected_capability",
    "observed_degradation",
    "reproduction",
    "status_evidence",
    "safety",
  ],
  "documentation.yml": [
    "location",
    "current_statement",
    "expected_correction",
    "user_impact",
    "classification",
  ],
  "feature_proposal.yml": [
    "problem",
    "users",
    "evidence",
    "proposed_outcome",
    "scope",
    "compatibility",
    "discussion",
    "readiness",
  ],
});

const MARKDOWN_LINK_PATTERN = /!?\[[^\]]*]\(([^)]+)\)/g;
const NUMERIC_SLA_PATTERN = /\b\d+\s*(?:stunden?|hours?|tage?|days?)\b/iu;

async function read(root, relativePath) {
  return fs.readFile(path.join(root, relativePath));
}

async function readText(root, relativePath) {
  return (await read(root, relativePath)).toString("utf8");
}

function finding(code, relativePath, message) {
  return { code, path: relativePath, message };
}

function includesAll(text, values) {
  const normalized = text.toLocaleLowerCase("de");
  return values.every((value) => normalized.includes(value.toLocaleLowerCase("de")));
}

function includesAny(text, values) {
  const normalized = text.toLocaleLowerCase("de");
  return values.some((value) => normalized.includes(value.toLocaleLowerCase("de")));
}

async function validateRequiredFiles(root, findings) {
  for (const relativePath of REQUIRED_FILES) {
    try {
      const stat = await fs.stat(path.join(root, relativePath));
      if (!stat.isFile() || stat.size === 0) {
        findings.push(finding("REQUIRED_FILE_EMPTY", relativePath, "Required file is empty or not a regular file."));
      }
    } catch {
      findings.push(finding("REQUIRED_FILE_MISSING", relativePath, "Required community-health file is missing."));
    }
  }
}

async function validateMetadata(root, findings) {
  const relativePath = ".github/repository-metadata.json";
  let value;
  try {
    value = JSON.parse(await readText(root, relativePath));
  } catch (error) {
    findings.push(finding("METADATA_JSON_INVALID", relativePath, error.message));
    return;
  }

  if (!isDeepStrictEqual(value, EXPECTED_METADATA)) {
    findings.push(finding("METADATA_DRIFT", relativePath, "Desired repository metadata differs from the approved exact values."));
  }
}

function parseYaml(content, relativePath, findings) {
  const document = parseDocument(content, { uniqueKeys: true });
  if (document.errors.length > 0) {
    for (const error of document.errors) {
      findings.push(finding("YAML_INVALID", relativePath, error.message));
    }
    return null;
  }
  return document.toJS();
}

async function validateForms(root, findings) {
  const formDirectory = ".github/ISSUE_TEMPLATE";

  for (const [fileName, expectedIds] of Object.entries(FORM_CONTRACTS)) {
    const relativePath = `${formDirectory}/${fileName}`;
    let form;
    try {
      form = parseYaml(await readText(root, relativePath), relativePath, findings);
    } catch {
      continue;
    }
    if (!form) continue;

    if (typeof form.name !== "string" || !form.name.trim()
      || typeof form.description !== "string" || !form.description.trim()
      || !Array.isArray(form.body) || form.body.length === 0) {
      findings.push(finding("FORM_METADATA_INVALID", relativePath, "Issue Form requires non-empty name, description and body."));
      continue;
    }

    const ids = form.body.map((entry) => entry?.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) {
      findings.push(finding("FORM_ID_DUPLICATE", relativePath, "Issue Form field IDs must be unique."));
    }

    for (const expectedId of expectedIds) {
      if (!ids.includes(expectedId)) {
        findings.push(finding("FORM_FIELD_MISSING", relativePath, `Required field ID is missing: ${expectedId}.`));
      }
    }

    const text = JSON.stringify(form);
    if (!includesAll(text, ["Deutsch", "Englisch"])) {
      findings.push(finding("FORM_LANGUAGE_MISSING", relativePath, "Issue Form must accept German and English submissions."));
    }
    if (!includesAll(text, ["Secret", "SECURITY.md"])) {
      findings.push(finding("FORM_SAFETY_COPY_MISSING", relativePath, "Issue Form must warn about secrets and route security reports."));
    }

    for (const entry of form.body) {
      if (entry?.type === "markdown") {
        if (typeof entry.attributes?.value !== "string" || !entry.attributes.value.trim()) {
          findings.push(finding("FORM_ELEMENT_INVALID", relativePath, "Markdown elements require non-empty attributes.value."));
        }
        continue;
      }
      if (!entry?.id || !["input", "textarea", "dropdown", "checkboxes"].includes(entry.type)) {
        findings.push(finding("FORM_ELEMENT_INVALID", relativePath, "Non-markdown elements require a supported type and stable ID."));
        continue;
      }
      if (typeof entry.attributes?.label !== "string" || !entry.attributes.label.trim()) {
        findings.push(finding("FORM_ELEMENT_INVALID", relativePath, `Field requires a non-empty label: ${entry.id}.`));
      }
      if (entry.type === "dropdown") {
        const options = entry.attributes?.options;
        if (!Array.isArray(options) || options.length === 0 || new Set(options).size !== options.length) {
          findings.push(finding("FORM_ELEMENT_INVALID", relativePath, `Dropdown requires non-empty, unique options: ${entry.id}.`));
        }
      }
      if (entry.type === "checkboxes") {
        const options = entry.attributes?.options;
        if (!Array.isArray(options) || options.length === 0
          || options.some((option) => typeof option?.label !== "string" || !option.label.trim())) {
          findings.push(finding("FORM_ELEMENT_INVALID", relativePath, `Checkbox group requires labeled options: ${entry.id}.`));
        }
      }
      const explicitlyOptional = ["evidence", "status_evidence", "discussion"].includes(entry.id);
      const checkboxOptionsRequired = entry.type === "checkboxes"
        && entry.attributes?.options?.every((option) => option.required === true);
      if (!explicitlyOptional && entry.validations?.required !== true && !checkboxOptionsRequired) {
        findings.push(finding("FORM_REQUIRED_VALIDATION_MISSING", relativePath, `Required field lacks fail-closed validation: ${entry.id}.`));
      }
    }
  }

  const configPath = `${formDirectory}/config.yml`;
  let config;
  try {
    config = parseYaml(await readText(root, configPath), configPath, findings);
  } catch {
    return;
  }
  if (!config) return;

  if (config.blank_issues_enabled !== false) {
    findings.push(finding("BLANK_ISSUES_ENABLED", configPath, "Blank issues must remain disabled."));
  }
  const links = Array.isArray(config.contact_links) ? config.contact_links : [];
  const urls = links.map((entry) => entry?.url).filter(Boolean);
  if (!urls.some((url) => url.endsWith("/discussions"))) {
    findings.push(finding("DISCUSSIONS_ROUTE_MISSING", configPath, "Issue chooser must route support and early ideas to Discussions."));
  }
  if (!urls.some((url) => url.endsWith("/blob/main/SECURITY.md"))) {
    findings.push(finding("SECURITY_ROUTE_MISSING", configPath, "Issue chooser must route security reports through SECURITY.md."));
  }
}

async function validatePolicyInvariants(root, findings) {
  const [
    conduct,
    contributing,
    security,
    support,
    governance,
    readme,
    pullRequest,
    codeowners,
    registry,
    graph,
  ] = await Promise.all([
    readText(root, "CODE_OF_CONDUCT.md"),
    readText(root, "CONTRIBUTING.md"),
    readText(root, "SECURITY.md"),
    readText(root, "SUPPORT.md"),
    readText(root, "GOVERNANCE.md"),
    readText(root, "README.md"),
    readText(root, ".github/pull_request_template.md"),
    readText(root, ".github/CODEOWNERS"),
    readText(root, ".agdf/control/SOT_REGISTRY.md"),
    readText(root, ".agdf/control/CONTEXT_GRAPH.md"),
  ]);

  if (!includesAll(conduct, ["Contributor Covenant", "agdf@iself.eu", "Arndt Gold", "confidential"])
    || !includesAny(conduct, ["reconsideration", "request a review"])) {
    findings.push(finding("CONDUCT_CONTRACT_INCOMPLETE", "CODE_OF_CONDUCT.md", "Conduct baseline, private reporting, authority or reconsideration is missing."));
  }
  if (!includesAll(security, ["agdf@iself.eu", "Do not publish", "best-effort", "no guaranteed"])
    || !includesAny(security, ["currently published", "current published"])) {
    findings.push(finding("SECURITY_CONTRACT_INCOMPLETE", "SECURITY.md", "Security policy lacks fail-safe reporting or bounded support language."));
  }
  if (NUMERIC_SLA_PATTERN.test(security)) {
    findings.push(finding("NUMERIC_SLA_FORBIDDEN", "SECURITY.md", "Security policy must not promise a numeric response or resolution SLA."));
  }
  if (!includesAll(support, ["Discussions", "Issues", "SECURITY.md", "no paid or guaranteed support", "email address is not a general private support channel"])) {
    findings.push(finding("SUPPORT_ROUTING_INCOMPLETE", "SUPPORT.md", "Support policy lacks deterministic routing or truthful support boundaries."));
  }
  if (!includesAll(governance, ["sole maintainer", "Arndt Gold", "@ArndtGold", "CODEOWNERS", "Succession"])
    || !includesAny(governance, ["does not indicate", "does not prove"])) {
    findings.push(finding("GOVERNANCE_AUTHORITY_INCOMPLETE", "GOVERNANCE.md", "Governance authority, non-enforcement boundary or succession is missing."));
  }
  if (!includesAll(contributing, ["No Contributor License Agreement", "DCO", "AI assistance", "Do not submit raw prompts", "create-agdf/generated", "Installed", "not a repository source"])
    || !includesAny(contributing, ["materially", "significant effect"])) {
    findings.push(finding("CONTRIBUTION_CONTRACT_INCOMPLETE", "CONTRIBUTING.md", "Contribution ownership, sign-off or AI disclosure contract is incomplete."));
  }
  if (!includesAll(pullRequest, ["keine AGDF-Freigabe", "KI-Unterstützung", "Keine Rohprompts", "kein CLA", "DCO", "kanonisch", "sichtbare"])) {
    findings.push(finding("PULL_REQUEST_CONTRACT_INCOMPLETE", ".github/pull_request_template.md", "Pull-request evidence or AI disclosure boundary is incomplete."));
  }
  if (!/^\*\s+@ArndtGold\s*$/mu.test(codeowners)) {
    findings.push(finding("CODEOWNERS_OWNER_MISMATCH", ".github/CODEOWNERS", "Default owner must match the approved sole maintainer."));
  }
  if (!includesAll(readme, ["Community und Beiträge", "CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "SECURITY.md", "SUPPORT.md", "GOVERNANCE.md", "Discussions"])) {
    findings.push(finding("README_ROUTING_INCOMPLETE", "README.md", "README does not expose every public policy and interaction route."));
  }

  const languageFiles = [
    ["CODE_OF_CONDUCT.md", conduct, ["Contributions and reports in English or German are welcome"]],
    ["CONTRIBUTING.md", contributing, ["Contributions in English or German are welcome"]],
    ["SECURITY.md", security, ["Security reports in English or German are welcome"]],
    ["SUPPORT.md", support, ["Questions and reports in English or German are welcome"]],
    ["GOVERNANCE.md", governance, ["Governance is primarily conducted in German", "requests in English are", "accepted"]],
    ["README.md", readme, ["Deutsch ist die primäre Projektsprache", "Beiträge auf Englisch sind ebenfalls willkommen"]],
  ];
  for (const [relativePath, text, requiredLanguageMeaning] of languageFiles) {
    if (!includesAll(text, requiredLanguageMeaning)) {
      findings.push(finding("LANGUAGE_POLICY_DRIFT", relativePath, "English/German participation is not explicit."));
    }
  }

  if (!includesAll(registry, ["Public conduct", "GitHub community interaction adapters", "GitHub repository metadata desired state"])) {
    findings.push(finding("SOT_REGISTRY_INCOMPLETE", ".agdf/control/SOT_REGISTRY.md", "Public policy, adapter or metadata ownership is missing."));
  }
  if (!graph.includes("CG-PUBLIC-COMMUNITY-GOVERNANCE")) {
    findings.push(finding("CONTEXT_GRAPH_NODE_MISSING", ".agdf/control/CONTEXT_GRAPH.md", "Durable community-governance node is missing."));
  }
}

async function validateHandbookInvariants(root, findings) {
  const expectedGermanNames = GERMAN_HANDBOOK_FILES.map((entry) => path.basename(entry)).sort();
  const expectedEnglishNames = ENGLISH_HANDBOOK_FILES.map((entry) => path.basename(entry)).sort();
  let observedGermanNames;
  let observedEnglishNames;
  try {
    observedGermanNames = (await fs.readdir(path.join(root, "docs/handbook/de"))).filter((entry) => entry.endsWith(".md")).sort();
    observedEnglishNames = (await fs.readdir(path.join(root, "docs/handbook/en"))).filter((entry) => entry.endsWith(".md")).sort();
  } catch {
    return;
  }
  if (!isDeepStrictEqual(observedGermanNames, expectedGermanNames)
    || !isDeepStrictEqual(observedEnglishNames, expectedEnglishNames)) {
    findings.push(finding("AGDF_HANDBOOK_INVENTORY_INVALID", "docs/handbook/", "Handbook must contain exactly the seven declared German and English chapter roles."));
  }

  const requiredChapterPaths = [...GERMAN_HANDBOOK_FILES, ...ENGLISH_HANDBOOK_FILES];
  try {
    await Promise.all(requiredChapterPaths.map((relativePath) => fs.access(path.join(root, relativePath))));
  } catch {
    return;
  }

  const german = Object.fromEntries(await Promise.all(GERMAN_HANDBOOK_FILES.map(async (relativePath) => [
    relativePath,
    await readText(root, relativePath),
  ])));
  const english = Object.fromEntries(await Promise.all(ENGLISH_HANDBOOK_FILES.map(async (relativePath) => [
    relativePath,
    await readText(root, relativePath),
  ])));
  const germanCombined = Object.values(german).join("\n");
  const englishCombined = Object.values(english).join("\n");
  const selector = await readText(root, "docs/handbook/README.md");
  if (!includesAll(selector, ["de/README.md", "en/README.md", "German", "canonical", "English", "derived translation"])) {
    findings.push(finding("AGDF_HANDBOOK_INVENTORY_INVALID", "docs/handbook/README.md", "Neutral selector must expose both editions and their authority relationship."));
  }
  const requiredGermanMeaning = [
    "AGDF in fünf Minuten",
    "Ein Run ist kein Git-Branch",
    "Die Run-Auswahl bestimmt nur, welchen AGDF-Kontrollzustand",
    "wichtige Übergänge benötigen deine bewusste Freigabe",
    "Approval: <GateName>",
    "Pre-Implementation Brownfield Analysis",
    "Code Review",
    "verified_change",
    "structured_slice",
    "structured_delivery",
    "Ein Run ersetzt keine Git- oder Worktree-Strategie",
    "Das Plugin und die CLI sind getrennte Installationen",
    "command -v agdf",
    "npm install --global @agdf/cli",
    "npm view @agdf/cli version",
    "npm list --global --depth=0 @agdf/cli",
    "node -p \"require('./agdf/package.json').version\"",
    "npx --yes @agdf/cli@latest gate-check --run payment-limit-fix",
    "kann hinter dem Stand eines lokalen Repository-Checkouts liegen",
    "agdf gate-check --run payment-limit-fix",
    "AGDF_RUN_ID=payment-limit-fix agdf gate-check",
    "agdf doctor --all-active",
    "agdf status --surface codex",
    "agdf doctor --run payment-limit-fix --json",
    "agdf run-migrate --run payment-limit-fix",
    "Repository-Evidenz beweist keine externe Ausführung",
  ];
  const requiredEnglishMeaning = [
    "AGDF in five minutes",
    "A run is not a Git branch",
    "Run selection determines only which AGDF control state",
    "important transitions require your deliberate approval",
    "Approval: <GateName>",
    "Pre-Implementation Brownfield Analysis",
    "Code Review",
    "verified_change",
    "structured_slice",
    "structured_delivery",
    "A run does not replace a Git or worktree strategy",
    "The plugin and the CLI are separate installations",
    "command -v agdf",
    "npm install --global @agdf/cli",
    "npm view @agdf/cli version",
    "npm list --global --depth=0 @agdf/cli",
    "node -p \"require('./agdf/package.json').version\"",
    "npx --yes @agdf/cli@latest gate-check --run payment-limit-fix",
    "may be behind a local repository checkout",
    "agdf gate-check --run payment-limit-fix",
    "AGDF_RUN_ID=payment-limit-fix agdf gate-check",
    "agdf doctor --all-active",
    "agdf status --surface codex",
    "agdf doctor --run payment-limit-fix --json",
    "agdf run-migrate --run payment-limit-fix",
    "Repository evidence does not prove external execution",
  ];
  const forbiddenGermanDrift = [
    "Grundsätzlich gibt es zwei Wege",
    "Umsetzung und Tests dürfen beginnen",
    "entferne die alte Datei",
    "Änderungen eines Runs beeinflussen die anderen nicht",
  ];
  const forbiddenEnglishDrift = [
    "There are generally two paths",
    "Implementation and tests may begin",
    "remove the old file",
    "Changes in one run do not affect other runs",
    "AGDF enforces every gate in every host",
    "Repository readiness proves publication",
  ];

  if (!includesAll(germanCombined, requiredGermanMeaning) || includesAny(germanCombined, forbiddenGermanDrift)) {
    findings.push(finding(
      "HANDBOOK_CONTRACT_INCOMPLETE",
      "docs/handbook/de/",
      "Canonical German handbook lacks current delivery paths, gate boundaries, run-isolation limits or safe recovery guidance.",
    ));
  }
  if (!includesAll(englishCombined, requiredEnglishMeaning) || includesAny(englishCombined, forbiddenEnglishDrift)) {
    findings.push(finding(
      "HANDBOOK_TRANSLATION_CONTRACT_INCOMPLETE",
      "docs/handbook/en/",
      "English handbook lacks required meanings or strengthens a protected authority, host or release claim.",
    ));
  }

  const roles = new Set();
  for (const [expectedRole, germanPath, englishPath] of HANDBOOK_CHAPTERS) {
    const content = english[englishPath];
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/u);
    if (!frontmatterMatch) {
      findings.push(finding("AGDF_HANDBOOK_TRANSLATION_METADATA_INVALID", englishPath, "English chapter lacks machine-readable translation metadata."));
      continue;
    }
    const document = parseDocument(frontmatterMatch[1], { uniqueKeys: true });
    if (document.errors.length > 0) {
      findings.push(finding("AGDF_HANDBOOK_TRANSLATION_METADATA_INVALID", englishPath, "English translation metadata is not valid unique-key YAML."));
      continue;
    }
    const metadata = document.toJS();
    const expectedTranslationOf = path.relative(path.dirname(englishPath), germanPath);
    const sourceBytes = await read(root, germanPath);
    const expectedRevision = `sha256:${createHash("sha256").update(sourceBytes).digest("hex")}`;
    if (metadata.language !== "en"
      || metadata.chapter_role !== expectedRole
      || metadata.translation_of !== expectedTranslationOf
      || typeof metadata.source_revision !== "string"
      || !/^sha256:[a-f0-9]{64}$/u.test(metadata.source_revision)) {
      findings.push(finding("AGDF_HANDBOOK_TRANSLATION_METADATA_INVALID", englishPath, "English translation metadata does not match its declared chapter role and German source."));
    }
    if (roles.has(metadata.chapter_role)) {
      findings.push(finding("AGDF_HANDBOOK_TRANSLATION_METADATA_INVALID", englishPath, "English chapter role is duplicated."));
    }
    roles.add(metadata.chapter_role);
    if (metadata.source_revision !== expectedRevision) {
      findings.push(finding("AGDF_HANDBOOK_TRANSLATION_STALE", englishPath, `Declared source revision does not match ${germanPath}.`));
    }
    if (metadata.translation_status !== "reviewed") {
      findings.push(finding("AGDF_HANDBOOK_TRANSLATION_UNREVIEWED", englishPath, "English translation is not marked reviewed after human semantic review."));
    }

    const fencedBlocks = (text) => [...text.matchAll(/^```[^\n]*\n[\s\S]*?^```\s*$/gmu)].map((match) => match[0]);
    const inlineValues = (text) => [...new Set([...text.matchAll(/`([^`\n]+)`/gu)].map((match) => match[1]))].sort();
    if (!isDeepStrictEqual(fencedBlocks(german[germanPath]), fencedBlocks(content))
      || !inlineValues(german[germanPath]).every((value) => inlineValues(content).includes(value))) {
      findings.push(finding("AGDF_HANDBOOK_PARITY_INVALID", englishPath, "Protected fenced blocks or inline normative values differ from the German source."));
    }
  }

  for (const relativePath of LEGACY_HANDBOOK_FILES) {
    const content = await readText(root, relativePath);
    const links = [...content.matchAll(MARKDOWN_LINK_PATTERN)];
    if (content.length > 700 || !content.includes("Kompatibilitätsverweis") || links.length < 1
      || includesAny(content, requiredGermanMeaning)) {
      findings.push(finding("AGDF_HANDBOOK_COMPATIBILITY_INVALID", relativePath, "Legacy handbook file must contain navigation only and no duplicate handbook semantics."));
    }
  }
}

function localLinkTarget(relativePath, rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "");
  if (!target || target.startsWith("#") || /^[a-z]+:/iu.test(target)) return null;
  const withoutAnchor = target.split("#", 1)[0].split("?", 1)[0];
  if (!withoutAnchor) return null;
  try {
    return path.normalize(path.join(path.dirname(relativePath), decodeURIComponent(withoutAnchor)));
  } catch {
    return { invalid: true, raw: rawTarget };
  }
}

async function validateMarkdownLinks(root, findings) {
  const markdownFiles = [
    "README.md",
    "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "SUPPORT.md",
    "GOVERNANCE.md",
    ".github/pull_request_template.md",
    ...HANDBOOK_FILES,
  ];

  for (const relativePath of markdownFiles) {
    const content = await readText(root, relativePath);
    for (const match of content.matchAll(MARKDOWN_LINK_PATTERN)) {
      const target = localLinkTarget(relativePath, match[1]);
      if (!target) continue;
      if (typeof target !== "string") {
        findings.push(finding("MARKDOWN_LINK_INVALID", relativePath, `Relative link is not valid URI syntax: ${match[1]}.`));
        continue;
      }
      const resolvedTarget = path.resolve(root, target);
      if (resolvedTarget !== root && !resolvedTarget.startsWith(`${root}${path.sep}`)) {
        findings.push(finding("MARKDOWN_LINK_ESCAPE", relativePath, `Relative link escapes the repository: ${match[1]}.`));
        continue;
      }
      try {
        await fs.access(resolvedTarget);
      } catch {
        findings.push(finding("MARKDOWN_LINK_BROKEN", relativePath, `Relative link does not resolve: ${match[1]}.`));
      }
    }
  }
}

async function validateSocialPreview(root, findings) {
  const relativePath = EXPECTED_METADATA.social_preview_source;
  let image;
  try {
    image = await read(root, relativePath);
  } catch {
    return;
  }
  const pngSignature = "89504e470d0a1a0a";
  const isPng = image.length >= 24 && image.subarray(0, 8).toString("hex") === pngSignature;
  const width = isPng ? image.readUInt32BE(16) : 0;
  const height = isPng ? image.readUInt32BE(20) : 0;
  if (!isPng || width !== 1280 || height !== 640 || image.length >= 1_000_000) {
    findings.push(finding("SOCIAL_PREVIEW_INVALID", relativePath, `Expected PNG 1280x640 below 1 MB; observed ${width}x${height}, ${image.length} bytes.`));
  }
}

export async function validateCommunityHealth(root, { checkCompatibility = checkComparison } = {}) {
  const resolvedRoot = path.resolve(root);
  const findings = [];
  await validateRequiredFiles(resolvedRoot, findings);
  if (findings.some((entry) => entry.code.startsWith("REQUIRED_FILE_"))) return findings;

  await validateMetadata(resolvedRoot, findings);
  await validateForms(resolvedRoot, findings);
  await validatePolicyInvariants(resolvedRoot, findings);
  await validateHandbookInvariants(resolvedRoot, findings);
  await validateMarkdownLinks(resolvedRoot, findings);
  await validateSocialPreview(resolvedRoot, findings);
  const compatibility = checkCompatibility(resolvedRoot);
  if (compatibility.status !== "pass") findings.push(finding("HOST_COMPATIBILITY_INVALID", "docs/compatibility/HOST_COMPATIBILITY.md", compatibility.diagnostic));
  return findings;
}

async function main() {
  const root = process.argv[2] ?? process.cwd();
  const findings = await validateCommunityHealth(root);
  if (findings.length === 0) {
    console.log(`community-health: pass (${REQUIRED_FILES.length} required files, ${Object.keys(FORM_CONTRACTS).length} issue forms)`);
    return;
  }

  console.error(`community-health: fail (${findings.length} finding${findings.length === 1 ? "" : "s"})`);
  for (const entry of findings) {
    console.error(`[${entry.code}] ${entry.path}: ${entry.message}`);
  }
  process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main();
}
