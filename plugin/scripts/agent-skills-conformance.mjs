import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

const FINDING_ORDER = ["code", "classification", "severity", "skillPath", "resource", "message", "remediation"];
const VALID_CLASSIFICATIONS = new Set(["standard_strict", "upstream_advisory", "agdf_policy"]);
const RELATIVE_MARKDOWN_TOKEN = /`((?:\.\.?\/)+[^`\r\n]+\.md)`/g;
const RESOURCE_BULLET = /^\s*-\s+`([^`\r\n]+\.md)`\s*$/;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isFile(path) {
  try { return statSync(path).isFile(); } catch { return false; }
}

function isDirectory(path) {
  try { return statSync(path).isDirectory(); } catch { return false; }
}

function codePointLength(value) {
  return [...value].length;
}

function within(root, candidate) {
  const path = relative(root, candidate);
  return path === "" || (!path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path));
}

function stablePath(root, path) {
  const value = relative(root, path).replaceAll("\\", "/");
  return value || ".";
}

function finding({ code, classification, severity = "error", skillPath = "", resource = "", message, remediation }) {
  return Object.fromEntries(FINDING_ORDER.map((key) => [key, ({
    code,
    classification,
    severity,
    skillPath,
    resource,
    message,
    remediation,
  })[key]]));
}

function policyFinding(code, message, remediation = "Correct the canonical Agent Skills conformance policy.") {
  return finding({ code, classification: "agdf_policy", message, remediation });
}

function validatePolicy(policy) {
  const findings = [];
  if (policy?.schemaVersion !== 1) findings.push(policyFinding("AGDF_SKILL_POLICY_SCHEMA_UNSUPPORTED", "Conformance policy schemaVersion must be 1."));
  if (typeof policy?.policyVersion !== "string" || !policy.policyVersion) findings.push(policyFinding("AGDF_SKILL_POLICY_VERSION_MISSING", "Conformance policyVersion must be a non-empty string."));
  if (policy?.baseline?.id !== "agent-skills-core-format" || !policy?.baseline?.specificationUrl || !policy?.baseline?.reviewedAt) {
    findings.push(policyFinding("AGDF_SKILL_POLICY_BASELINE_INVALID", "Conformance policy must declare the reviewed Agent Skills core-format baseline."));
  }
  if (!Array.isArray(policy?.classifications)
      || policy.classifications.length !== VALID_CLASSIFICATIONS.size
      || new Set(policy.classifications).size !== VALID_CLASSIFICATIONS.size
      || policy.classifications.some((value) => !VALID_CLASSIFICATIONS.has(value))) {
    findings.push(policyFinding("AGDF_SKILL_POLICY_CLASSIFICATIONS_INVALID", "Conformance policy must declare the three supported finding classifications exactly once."));
  }
  for (const field of ["requiredFields", "allowedFields", "scalarStyles"]) {
    if (!Array.isArray(policy?.frontmatterProfile?.[field]) || policy.frontmatterProfile[field].length === 0) {
      findings.push(policyFinding("AGDF_SKILL_POLICY_FRONTMATTER_PROFILE_INVALID", `frontmatterProfile.${field} must be a non-empty array.`));
    }
  }
  try {
    new RegExp(policy?.strictRules?.namePattern);
  } catch {
    findings.push(policyFinding("AGDF_SKILL_POLICY_NAME_PATTERN_INVALID", "strictRules.namePattern must be a valid regular expression."));
  }
  if (!Number.isInteger(policy?.strictRules?.nameMaxCodePoints) || policy.strictRules.nameMaxCodePoints < 1
      || !Number.isInteger(policy?.strictRules?.descriptionMaxCodePoints) || policy.strictRules.descriptionMaxCodePoints < 1
      || !Number.isInteger(policy?.advisoryRules?.skillMdMaxLines) || policy.advisoryRules.skillMdMaxLines < 1) {
    findings.push(policyFinding("AGDF_SKILL_POLICY_LIMIT_INVALID", "Strict and advisory limits must be positive integers."));
  }
  if (typeof policy?.agdfRules?.descriptionStartsWith !== "string" || !policy.agdfRules.descriptionStartsWith
      || policy?.agdfRules?.requiresRuntimeContractResource !== true) {
    findings.push(policyFinding("AGDF_SKILL_POLICY_LOCAL_RULES_INVALID", "AGDF-owned description and Runtime Contract rules must be explicit."));
  }
  if (!policy?.surfaces || typeof policy.surfaces !== "object" || Array.isArray(policy.surfaces)) {
    findings.push(policyFinding("AGDF_SKILL_POLICY_SURFACES_INVALID", "Conformance policy must declare surface descriptors."));
  }
  return findings;
}

function parseScalar(raw) {
  if (raw === "") return { ok: true, value: "", style: "plain" };
  if (raw.startsWith('"')) {
    if (!raw.endsWith('"') || raw.length < 2) return { ok: false };
    try {
      const value = JSON.parse(raw);
      return typeof value === "string" ? { ok: true, value, style: "double_quoted" } : { ok: false };
    } catch {
      return { ok: false };
    }
  }
  if (raw.startsWith("'")) {
    if (!raw.endsWith("'") || raw.length < 2) return { ok: false };
    const inner = raw.slice(1, -1);
    if (/(^|[^'])'(?!')/.test(inner)) return { ok: false };
    return { ok: true, value: inner.replaceAll("''", "'"), style: "single_quoted" };
  }
  if (/^[#\[\]{}&*!|>@`]/.test(raw)
      || /^(?:~|null|true|false)$/i.test(raw)
      || /^[-+]?(?:0|[1-9][0-9_]*)(?:\.[0-9_]+)?(?:e[-+]?[0-9]+)?$/i.test(raw)
      || /^0(?:x[0-9a-f_]+|o[0-7_]+)$/i.test(raw)
      || /^[-+]?\.(?:inf|nan)$/i.test(raw)
      || raw.includes(": ")
      || raw.includes(" #")) return { ok: false };
  return { ok: true, value: raw, style: "plain" };
}

function parseFrontmatter(content, skillPath, policy) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  if (lines[0] !== "---") {
    findings.push(finding({
      code: "AGENT_SKILLS_FRONTMATTER_MISSING",
      classification: "standard_strict",
      skillPath,
      message: "SKILL.md must begin with YAML frontmatter.",
      remediation: "Add an opening and closing --- frontmatter block at the start of SKILL.md.",
    }));
    return { fields: new Map(), findings };
  }
  const end = lines.indexOf("---", 1);
  if (end < 0) {
    findings.push(finding({
      code: "AGENT_SKILLS_FRONTMATTER_UNCLOSED",
      classification: "standard_strict",
      skillPath,
      message: "SKILL.md frontmatter has no closing delimiter.",
      remediation: "Close the initial YAML frontmatter block with an exact --- line.",
    }));
    return { fields: new Map(), findings };
  }

  const fields = new Map();
  const allowedFields = new Set(policy.frontmatterProfile.allowedFields);
  const allowedStyles = new Set(policy.frontmatterProfile.scalarStyles);
  for (const line of lines.slice(1, end)) {
    if (line === "" || /^\s*#/.test(line)) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s+(.*)|\s*)$/);
    if (!match) {
      findings.push(finding({
        code: "AGDF_SKILL_FRONTMATTER_PROFILE_UNSUPPORTED",
        classification: "agdf_policy",
        skillPath,
        message: "Frontmatter uses syntax outside the dependency-free AGDF scalar profile.",
        remediation: "Use unique, unindented top-level scalar fields with plain, single-quoted, or double-quoted values.",
      }));
      continue;
    }
    const [, key, rawValue = ""] = match;
    if (fields.has(key)) {
      findings.push(finding({
        code: "AGDF_SKILL_FRONTMATTER_DUPLICATE_FIELD",
        classification: "agdf_policy",
        skillPath,
        message: `Frontmatter field ${key} is declared more than once.`,
        remediation: `Keep exactly one ${key} field.`,
      }));
      continue;
    }
    if (!allowedFields.has(key)) {
      findings.push(finding({
        code: "AGDF_SKILL_FRONTMATTER_FIELD_UNSUPPORTED",
        classification: "agdf_policy",
        skillPath,
        message: `Frontmatter field ${key} is outside the approved AGDF profile.`,
        remediation: "Remove the field or revise the AGDF conformance policy through governance.",
      }));
    }
    const parsed = parseScalar(rawValue.trim());
    if (!parsed.ok || !allowedStyles.has(parsed.style)) {
      findings.push(finding({
        code: "AGDF_SKILL_FRONTMATTER_SCALAR_INVALID",
        classification: "agdf_policy",
        skillPath,
        message: `Frontmatter field ${key} is not a valid supported scalar.`,
        remediation: "Use a valid plain, single-quoted, or JSON-compatible double-quoted scalar.",
      }));
      continue;
    }
    fields.set(key, parsed.value);
  }
  return { fields, findings };
}

function runtimeContractSection(content) {
  const heading = content.match(/^## Runtime Contract\s*\r?\n/m);
  if (!heading || heading.index === undefined) return "";
  const body = content.slice(heading.index + heading[0].length);
  const nextHeading = body.search(/^##\s/m);
  return nextHeading < 0 ? body : body.slice(0, nextHeading);
}

function declaredResources(content) {
  const section = runtimeContractSection(content);
  const bulletResources = section.split(/\r?\n/).map((line) => line.match(RESOURCE_BULLET)?.[1]).filter(Boolean);
  return [...new Set([...dependencyTokens(section), ...bulletResources])];
}

function dependencyTokens(content) {
  return [...content.matchAll(RELATIVE_MARKDOWN_TOKEN)].map((match) => match[1]);
}

function withoutFencedCode(content) {
  return content
    .replace(/^[ \t]{0,3}`{3,}[^\r\n]*\r?\n[\s\S]*?^[ \t]{0,3}`{3,}\s*$/gm, "")
    .replace(/^[ \t]{0,3}~{3,}[^\r\n]*\r?\n[\s\S]*?^[ \t]{0,3}~{3,}\s*$/gm, "");
}

function validateResource({ token, skillDir, skillPath, surfaceRoot, sharedRoots }) {
  const base = { skillPath, resource: token };
  if (!token || isAbsolute(token) || /^[a-z][a-z0-9+.-]*:/i.test(token) || token.includes("\\") || token.split("/").includes("")) {
    return { finding: finding({
      ...base,
      code: "AGDF_SKILL_RESOURCE_PATH_UNSAFE",
      classification: "agdf_policy",
      message: "Declared resource path is not a safe portable relative path.",
      remediation: "Use a forward-slash relative path within the declared surface boundary.",
    }) };
  }
  const target = resolve(skillDir, token);
  if (!within(surfaceRoot, target)) {
    return { finding: finding({
      ...base,
      code: "AGDF_SKILL_RESOURCE_TRAVERSAL",
      classification: "agdf_policy",
      message: "Declared resource escapes the surface root lexically.",
      remediation: "Keep the resource inside the skill root or an approved shared resource root.",
    }) };
  }
  if (!isFile(target)) {
    return { finding: finding({
      ...base,
      code: "AGDF_SKILL_RESOURCE_UNRESOLVED",
      classification: "agdf_policy",
      message: "Declared resource does not resolve to a file.",
      remediation: "Correct the resource path or restore the canonical file.",
    }) };
  }
  let physicalSurfaceRoot;
  let physicalSkillRoot;
  let physicalTarget;
  let physicalSharedRoots;
  try {
    physicalSurfaceRoot = realpathSync(surfaceRoot);
    physicalSkillRoot = realpathSync(skillDir);
    physicalTarget = realpathSync(target);
    physicalSharedRoots = sharedRoots.map((path) => realpathSync(path));
  } catch {
    return { finding: finding({
      ...base,
      code: "AGDF_SKILL_RESOURCE_PHYSICAL_RESOLUTION_FAILED",
      classification: "agdf_policy",
      message: "Declared resource boundary could not be resolved physically.",
      remediation: "Restore readable surface, skill and shared-root paths, then rerun validation.",
    }) };
  }
  if (!within(physicalSurfaceRoot, physicalTarget)) {
    return { finding: finding({
      ...base,
      code: "AGDF_SKILL_RESOURCE_SYMLINK_ESCAPE",
      classification: "agdf_policy",
      message: "Declared resource resolves outside the surface root.",
      remediation: "Remove the escaping symlink or point at a file inside the approved surface.",
    }) };
  }
  if (within(physicalSkillRoot, physicalTarget)) return { classification: "skill_local" };
  for (const sharedRoot of physicalSharedRoots) {
    if (within(sharedRoot, physicalTarget)) return { classification: "plugin_scoped" };
  }
  return { finding: finding({
    ...base,
    code: "AGDF_SKILL_RESOURCE_SCOPE_UNDECLARED",
    classification: "agdf_policy",
    message: "Declared resource is outside the skill and every approved shared root.",
    remediation: "Move the resource into an approved root or revise the single conformance policy owner.",
  }) };
}

function loadInputs({ pluginRoot, policyPath, definitionPath }) {
  const findings = [];
  let policy = null;
  let definition = null;
  try {
    policy = readJson(policyPath ?? join(pluginRoot, "meta", "agent-skills-conformance.json"));
  } catch {
    findings.push(policyFinding("AGDF_SKILL_POLICY_UNREADABLE", "Conformance policy must be present and readable JSON."));
  }
  try {
    definition = readJson(definitionPath ?? join(pluginRoot, "meta", "agdf-plugin.definition.json"));
  } catch {
    findings.push(policyFinding("AGDF_SKILL_DEFINITION_UNREADABLE", "Canonical plugin definition must be present and readable JSON.", "Restore the canonical plugin definition."));
  }
  if (policy) findings.push(...validatePolicy(policy));
  if (!Array.isArray(definition?.skillSet) || definition.skillSet.length === 0) {
    findings.push(policyFinding("AGDF_SKILL_INVENTORY_INVALID", "Canonical plugin definition must own a non-empty skillSet.", "Correct agdf-plugin.definition.json instead of adding another inventory."));
  }
  return { policy, definition, findings };
}

export function validateAgentSkillsConformance({ pluginRoot, surfaceRoot = pluginRoot, surface = "source", policyPath, definitionPath } = {}) {
  pluginRoot = resolve(pluginRoot ?? ".");
  surfaceRoot = resolve(surfaceRoot ?? pluginRoot);
  const { policy, definition, findings } = loadInputs({ pluginRoot, policyPath, definitionPath });
  const result = {
    surface,
    policyVersion: policy?.policyVersion ?? "unknown",
    inspectedSkillCount: 0,
    findings,
    skills: [],
    blocking: true,
  };
  if (findings.some(({ severity }) => severity === "error")) return result;

  const descriptor = policy.surfaces[surface];
  if (!descriptor || typeof descriptor.skillsRoot !== "string"
      || !Array.isArray(descriptor.sharedResourceRoots)
      || typeof descriptor.skillPrefixOwner !== "string"
      || !Array.isArray(descriptor.ignoredSkillEntries)) {
    findings.push(policyFinding("AGDF_SKILL_SURFACE_DESCRIPTOR_INVALID", `Surface descriptor ${surface} is missing or invalid.`));
    return result;
  }
  if (!isDirectory(surfaceRoot)) {
    findings.push(policyFinding("AGDF_SKILL_SURFACE_ROOT_INVALID", `Surface root for ${surface} is not a directory.`));
    return result;
  }
  const skillsRoot = resolve(surfaceRoot, descriptor.skillsRoot);
  const sharedRoots = descriptor.sharedResourceRoots.map((path) => resolve(surfaceRoot, path));
  if (!within(surfaceRoot, skillsRoot) || sharedRoots.some((path) => !within(surfaceRoot, path))) {
    findings.push(policyFinding("AGDF_SKILL_SURFACE_BOUNDARY_INVALID", `Surface descriptor ${surface} escapes its root.`));
    return result;
  }
  if (!isDirectory(skillsRoot) || sharedRoots.some((path) => !isDirectory(path))) {
    findings.push(policyFinding("AGDF_SKILL_SURFACE_LAYOUT_MISSING", `Surface ${surface} is missing its skill or shared resource root.`));
    return result;
  }
  const allowedIgnoredEntries = new Set(sharedRoots.map((path) => relative(skillsRoot, path).split(sep)[0]).filter((entry) => entry && entry !== ".."));
  if (new Set(descriptor.ignoredSkillEntries).size !== descriptor.ignoredSkillEntries.length
      || descriptor.ignoredSkillEntries.some((entry) => !allowedIgnoredEntries.has(entry))) {
    findings.push(policyFinding("AGDF_SKILL_SURFACE_IGNORES_INVALID", `Surface ${surface} may ignore only declared shared-root entries.`));
    return result;
  }

  const prefix = definition?.[descriptor.skillPrefixOwner]?.skillPrefix;
  if (typeof prefix !== "string") {
    findings.push(policyFinding("AGDF_SKILL_SURFACE_PREFIX_INVALID", `Surface ${surface} cannot derive its skill prefix from the canonical plugin definition.`));
    return result;
  }
  const expected = definition.skillSet.map(({ slug }) => `${prefix}${slug}`).sort();
  if (new Set(expected).size !== expected.length || expected.some((name) => !name)) {
    findings.push(policyFinding("AGDF_SKILL_INVENTORY_DUPLICATE", "Canonical skill inventory produces empty or duplicate surface names.", "Correct agdf-plugin.definition.json."));
    return result;
  }
  const ignored = new Set(descriptor.ignoredSkillEntries);
  let skillEntries;
  try {
    skillEntries = readdirSync(skillsRoot);
  } catch {
    findings.push(policyFinding("AGDF_SKILL_SURFACE_SKILLS_UNREADABLE", `Surface ${surface} skill root cannot be read.`));
    return result;
  }
  const actual = skillEntries
    .filter((entry) => !ignored.has(entry) && isDirectory(join(skillsRoot, entry)))
    .sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    findings.push(finding({
      code: "AGENT_SKILLS_INVENTORY_MISMATCH",
      classification: "standard_strict",
      message: `Surface ${surface} skill directories do not match the canonical inventory. Expected ${expected.join(", ")}; got ${actual.join(", ")}.`,
      remediation: "Align the canonical plugin definition, source skills and generated projection.",
    }));
  }

  for (const expectedName of expected) {
    const skillDir = join(skillsRoot, expectedName);
    const path = join(skillDir, "SKILL.md");
    const skillPath = stablePath(surfaceRoot, path);
    if (existsSync(skillDir)) {
      try {
        if (!within(realpathSync(surfaceRoot), realpathSync(skillDir))) {
          findings.push(finding({
            code: "AGDF_SKILL_DIRECTORY_SYMLINK_ESCAPE",
            classification: "agdf_policy",
            skillPath,
            message: "Canonical skill directory resolves outside the surface root.",
            remediation: "Replace the escaping symlink with a skill directory inside the approved surface.",
          }));
          continue;
        }
      } catch {
        findings.push(finding({
          code: "AGDF_SKILL_DIRECTORY_UNREADABLE",
          classification: "agdf_policy",
          skillPath,
          message: "Canonical skill directory cannot be resolved physically.",
          remediation: "Restore a readable skill directory inside the approved surface.",
        }));
        continue;
      }
    }
    if (!isFile(path)) {
      findings.push(finding({
        code: "AGENT_SKILLS_FILE_MISSING",
        classification: "standard_strict",
        skillPath,
        message: "Canonical skill directory must contain SKILL.md.",
        remediation: "Restore the canonical SKILL.md file.",
      }));
      continue;
    }
    result.inspectedSkillCount += 1;
    let content;
    try {
      content = readFileSync(path, "utf8");
    } catch {
      findings.push(finding({
        code: "AGENT_SKILLS_FILE_UNREADABLE",
        classification: "standard_strict",
        skillPath,
        message: "Canonical SKILL.md cannot be read.",
        remediation: "Restore a readable canonical SKILL.md file.",
      }));
      continue;
    }
    const parsed = parseFrontmatter(content, skillPath, policy);
    findings.push(...parsed.findings);
    for (const field of policy.frontmatterProfile.requiredFields) {
      if (!parsed.fields.has(field) || parsed.fields.get(field) === "") {
        findings.push(finding({
          code: `AGENT_SKILLS_${field.toUpperCase()}_MISSING`,
          classification: "standard_strict",
          skillPath,
          message: `Required frontmatter field ${field} is missing or empty.`,
          remediation: `Add a non-empty ${field} scalar to the frontmatter.`,
        }));
      }
    }
    const name = parsed.fields.get("name") ?? "";
    const description = parsed.fields.get("description") ?? "";
    let namePattern = null;
    try { namePattern = new RegExp(policy.strictRules.namePattern); } catch {}
    if (name && (codePointLength(name) > policy.strictRules.nameMaxCodePoints || !namePattern?.test(name))) {
      findings.push(finding({
        code: "AGENT_SKILLS_NAME_INVALID",
        classification: "standard_strict",
        skillPath,
        message: "Skill name violates the declared Agent Skills name constraints.",
        remediation: "Use 1-64 lowercase alphanumeric or single-hyphen-separated characters.",
      }));
    }
    if (name && policy.strictRules.nameMustMatchParent && name !== expectedName) {
      findings.push(finding({
        code: "AGENT_SKILLS_NAME_PARENT_MISMATCH",
        classification: "standard_strict",
        skillPath,
        message: `Skill name ${name} does not match parent directory ${expectedName}.`,
        remediation: "Align the frontmatter name and canonical surface directory.",
      }));
    }
    if (description && codePointLength(description) > policy.strictRules.descriptionMaxCodePoints) {
      findings.push(finding({
        code: "AGENT_SKILLS_DESCRIPTION_INVALID",
        classification: "standard_strict",
        skillPath,
        message: "Skill description exceeds the declared Agent Skills limit.",
        remediation: "Shorten description to at most 1024 Unicode code points.",
      }));
    }
    if (description && !description.toLowerCase().startsWith(policy.agdfRules.descriptionStartsWith.toLowerCase())) {
      findings.push(finding({
        code: "AGDF_SKILL_DESCRIPTION_PREFIX_INVALID",
        classification: "agdf_policy",
        skillPath,
        message: `Skill description must start with ${policy.agdfRules.descriptionStartsWith}.`,
        remediation: "Restore the AGDF discovery-oriented description convention.",
      }));
    }
    const lineCount = content.split(/\r?\n/).length;
    if (lineCount > policy.advisoryRules.skillMdMaxLines) {
      findings.push(finding({
        code: "AGENT_SKILLS_LENGTH_ADVISORY",
        classification: "upstream_advisory",
        severity: "warning",
        skillPath,
        message: `SKILL.md has ${lineCount} lines; upstream guidance recommends at most ${policy.advisoryRules.skillMdMaxLines}.`,
        remediation: "Consider moving detail into linked resources; no strict conformance failure is asserted.",
      }));
    }

    const declarations = declaredResources(content);
    if (policy.agdfRules.requiresRuntimeContractResource && declarations.length === 0) {
      findings.push(finding({
        code: "AGDF_SKILL_RUNTIME_CONTRACT_RESOURCE_MISSING",
        classification: "agdf_policy",
        skillPath,
        message: "AGDF skill must declare at least one focused Runtime Contract resource.",
        remediation: "Declare the applicable focused contract module in the Runtime Contract section.",
      }));
    }
    const declarationSet = new Set(declarations);
    for (const token of new Set(dependencyTokens(withoutFencedCode(content)))) {
      if (!declarationSet.has(token)) {
        findings.push(finding({
          code: "AGDF_SKILL_RESOURCE_UNDECLARED_INLINE",
          classification: "agdf_policy",
          skillPath,
          resource: token,
          message: "Dependency-shaped relative Markdown path is not declared in the Runtime Contract resource list.",
          remediation: "Declare the resource in the Runtime Contract bullet list or remove the dependency-shaped token.",
        }));
      }
    }
    const portability = new Set();
    for (const token of declarations) {
      const resourceResult = validateResource({ token, skillDir, skillPath, surfaceRoot, sharedRoots });
      if (resourceResult.finding) findings.push(resourceResult.finding);
      if (resourceResult.classification) portability.add(resourceResult.classification);
    }
    result.skills.push({
      name: expectedName,
      path: skillPath,
      portability: portability.has("plugin_scoped") ? "plugin_scoped" : "skill_local",
      resources: declarations,
    });
  }

  findings.sort((left, right) => FINDING_ORDER.map((key) => String(left[key]).localeCompare(String(right[key]))).find((value) => value !== 0) ?? 0);
  result.blocking = findings.some(({ severity }) => severity === "error");
  return result;
}
