#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

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

  if (!includesAll(conduct, ["Contributor Covenant", "agdf@iself.eu", "Arndt Gold", "vertraulich", "erneute Prüfung"])) {
    findings.push(finding("CONDUCT_CONTRACT_INCOMPLETE", "CODE_OF_CONDUCT.md", "Conduct baseline, private reporting, authority or reconsideration is missing."));
  }
  if (!includesAll(security, ["agdf@iself.eu", "nicht in Issues", "aktuell veröffentlichte", "bestem Bemühen", "keine garantierte"])) {
    findings.push(finding("SECURITY_CONTRACT_INCOMPLETE", "SECURITY.md", "Security policy lacks fail-safe reporting or bounded support language."));
  }
  if (NUMERIC_SLA_PATTERN.test(security)) {
    findings.push(finding("NUMERIC_SLA_FORBIDDEN", "SECURITY.md", "Security policy must not promise a numeric response or resolution SLA."));
  }
  if (!includesAll(support, ["Discussions", "Issues", "SECURITY.md", "kein", "garantierten Support", "E-Mail-Adresse ist kein allgemeiner"])) {
    findings.push(finding("SUPPORT_ROUTING_INCOMPLETE", "SUPPORT.md", "Support policy lacks deterministic routing or truthful support boundaries."));
  }
  if (!includesAll(governance, ["alleinigen Maintainer", "Arndt Gold", "@ArndtGold", "CODEOWNERS", "keine Aussage", "Nachfolge"])) {
    findings.push(finding("GOVERNANCE_AUTHORITY_INCOMPLETE", "GOVERNANCE.md", "Governance authority, non-enforcement boundary or succession is missing."));
  }
  if (!includesAll(contributing, ["kein Contributor License Agreement", "DCO", "wesentlich", "KI-Unterstützung", "keine Rohprompts", "create-agdf/generated", "installierte", "keine Repository-Quelle"])) {
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
    ["CODE_OF_CONDUCT.md", conduct],
    ["CONTRIBUTING.md", contributing],
    ["SECURITY.md", security],
    ["SUPPORT.md", support],
    ["GOVERNANCE.md", governance],
    ["README.md", readme],
  ];
  for (const [relativePath, text] of languageFiles) {
    if (!includesAll(text, ["Deutsch", "Englisch"])) {
      findings.push(finding("LANGUAGE_POLICY_DRIFT", relativePath, "German-primary/English-accepted behavior is not explicit."));
    }
  }

  if (!includesAll(registry, ["Public conduct", "GitHub community interaction adapters", "GitHub repository metadata desired state"])) {
    findings.push(finding("SOT_REGISTRY_INCOMPLETE", ".agdf/control/SOT_REGISTRY.md", "Public policy, adapter or metadata ownership is missing."));
  }
  if (!graph.includes("CG-PUBLIC-COMMUNITY-GOVERNANCE")) {
    findings.push(finding("CONTEXT_GRAPH_NODE_MISSING", ".agdf/control/CONTEXT_GRAPH.md", "Durable community-governance node is missing."));
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

export async function validateCommunityHealth(root) {
  const resolvedRoot = path.resolve(root);
  const findings = [];
  await validateRequiredFiles(resolvedRoot, findings);
  if (findings.some((entry) => entry.code.startsWith("REQUIRED_FILE_"))) return findings;

  await validateMetadata(resolvedRoot, findings);
  await validateForms(resolvedRoot, findings);
  await validatePolicyInvariants(resolvedRoot, findings);
  await validateMarkdownLinks(resolvedRoot, findings);
  await validateSocialPreview(resolvedRoot, findings);
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
