import { createHash } from "node:crypto";

export const INSTRUCTION_FOOTPRINT_SCHEMA_VERSION = 1;

export const REQUEST_ACTIVATION_MARKERS = Object.freeze({
  start: "<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->",
  end: "<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->",
});

export const DISPATCHER_BINDING_PREFIX = "AGDF dispatcher binding:";
export const RUNTIME_FACTS_PREFIX = "AGDF runtime facts:";

export const INSTRUCTION_FOOTPRINT_SURFACE_IDS = Object.freeze([
  "activationKernel",
  "skillDiscoveryDescription",
  "allSkillDiscoveryDescriptions",
  "sessionStartBase",
  "runtimeCheckSupplement",
  "openCodeEagerInstructions",
  "openCodeActiveDynamicContext",
  "openCodeInactiveDynamicContext",
  "openCodeComposedStaticAndActiveDynamic",
  "openCodeCompactionAddition",
  "selectedGateCheckSkill",
]);

// These canonical digests lock approved content without copying its budget values, condition prose,
// or terminal-dispatch wording into a second semantic owner. Object-key order is intentionally
// irrelevant to the schema digest. A semantic change requires an explicitly reviewed validator
// update, not a silent limit increase, condition weakening or dispatch rewrite.
const AUTHORIZED_SCHEMA_V1_FINGERPRINT = "174a388cb77d07f54d07530918cf2e6ac918bc3c9f81224d8dcdd3a2f34cf6d6";
const AUTHORIZED_TERMINAL_DISPATCH_FINGERPRINT = "ace1a7c9985b2d765f016465b1d53ad814c2cb6db9a02046ba36491458932c41";
const AUTHORIZED_OPENCODE_EAGER_FINGERPRINTS = Object.freeze({
  canonical: "07dbbf9d0cb2af2ada57a795ee37423997531c9dfe8af38f0693af764d1c409c",
  global: "141fc97184e7cbd551f09078aba8dfceed5856f0367cfff254d0151a561ee798",
});
const TERMINAL_DISPATCH_ANCHOR = "`gate-check` has deterministic-control dispatch.";
const GLOBAL_TERMINAL_DISPATCH_ANCHOR = "`agdf-global-gate-check` has deterministic-control dispatch.";

const DYNAMIC_VALUE_KEYS = Object.freeze(["executable", "validator", "workingDirectory"]);
const EXPECTED_DYNAMIC_TOKENS = Object.freeze({
  executable: "<executable>",
  validator: "<validator>",
  workingDirectory: "<working-directory>",
});

const FULL_ROUTER_HEADINGS = Object.freeze([
  "Task Target Resolution",
  "Mode Selection",
  "Gate Transition",
  "Quality Readiness",
  "Closeout",
]);

function failure(code, message, surfaceId = null, instanceId = null) {
  return {
    code,
    message,
    ...(surfaceId ? { surface_id: surfaceId } : {}),
    ...(instanceId ? { instance_id: instanceId } : {}),
  };
}

export function normalizeInstructionLineEndings(value) {
  return String(value ?? "").replace(/\r\n?/gu, "\n");
}

function isAbsoluteInstructionPath(value) {
  return typeof value === "string"
    && value.length > 0
    && (/^\//u.test(value) || /^[A-Za-z]:[\\/]/u.test(value) || /^\\\\/u.test(value));
}

function replaceAllLiteral(value, search, replacement) {
  return search ? value.split(search).join(replacement) : value;
}

export function normalizeDynamicInstructionContent(
  content,
  dynamicValues = {},
  dynamicTokens = EXPECTED_DYNAMIC_TOKENS,
) {
  let normalized = normalizeInstructionLineEndings(content);
  const replacements = [];

  for (const key of DYNAMIC_VALUE_KEYS) {
    const value = dynamicValues?.[key];
    if (!isAbsoluteInstructionPath(value)) continue;
    replacements.push({ key, value });
  }

  replacements.sort((left, right) => right.value.length - left.value.length);
  for (const { key, value } of replacements) {
    const token = dynamicTokens[key];
    const jsonEscapedValue = JSON.stringify(value).slice(1, -1);
    normalized = replaceAllLiteral(normalized, value, token);
    if (jsonEscapedValue !== value) {
      normalized = replaceAllLiteral(normalized, jsonEscapedValue, token);
    }
  }

  return normalized;
}

export function measureInstructionContent({ content, dynamicValues = {}, dynamicTokens = EXPECTED_DYNAMIC_TOKENS }) {
  const raw = normalizeInstructionLineEndings(content);
  const normalized = normalizeDynamicInstructionContent(raw, dynamicValues, dynamicTokens);
  return Object.freeze({
    raw_bytes: Buffer.byteLength(raw, "utf8"),
    normalized_bytes: Buffer.byteLength(normalized, "utf8"),
  });
}

function canonicalizeJson(value) {
  if (Array.isArray(value)) return value.map((entry) => canonicalizeJson(entry));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalizeJson(value[key])]),
  );
}

export function extractSerializedDescriptionScalar(skillContent) {
  const normalized = normalizeInstructionLineEndings(skillContent);
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/u);
  if (!frontmatterMatch) {
    throw new Error("AGDF_INSTRUCTION_FOOTPRINT_DESCRIPTION_FRONTMATTER_MISSING");
  }
  const matches = [...frontmatterMatch[1].matchAll(/^description:[ \t]*(.*)$/gmu)];
  if (matches.length !== 1 || matches[0][1].length === 0) {
    throw new Error("AGDF_INSTRUCTION_FOOTPRINT_DESCRIPTION_SCALAR_INVALID");
  }
  return matches[0][1];
}

export function requestActivationKernelFingerprint(kernel) {
  const normalized = normalizeInstructionLineEndings(kernel);
  const matches = [...normalized.matchAll(/- `guard_fingerprint`: `sha256:[0-9a-f]{64}`/gu)];
  if (matches.length !== 1) {
    throw new Error("AGDF_INSTRUCTION_FOOTPRINT_KERNEL_FINGERPRINT_FIELD_INVALID");
  }
  const fingerprintInput = normalized.replace(
    /- `guard_fingerprint`: `sha256:[0-9a-f]{64}`/u,
    "- `guard_fingerprint`: `sha256:<computed>`",
  );
  return `sha256:${createHash("sha256").update(fingerprintInput, "utf8").digest("hex")}`;
}

function requestActivationKernelIdentity(kernel) {
  const readOne = (pattern) => {
    const matches = [...kernel.matchAll(pattern)];
    return matches.length === 1 ? matches[0][1] : null;
  };
  return {
    owner: readOne(/- `owner`: `([^`]+)`/gu),
    path: readOne(/- `path`: `([^`]+)`/gu),
    policy_version: Number(readOne(/- `policy_version`: `(\d+)`/gu)),
    guard_fingerprint: readOne(/- `guard_fingerprint`: `(sha256:[0-9a-f]{64})`/gu),
  };
}

function countLiteral(value, needle) {
  if (!needle) return 0;
  return value.split(needle).length - 1;
}

function instructionContentFingerprint(content) {
  return createHash("sha256")
    .update(normalizeInstructionLineEndings(content), "utf8")
    .digest("hex");
}

function parsePrefixedJsonLine(line, prefix) {
  if (!line.startsWith(`${prefix} `)) return null;
  try {
    return JSON.parse(line.slice(prefix.length + 1));
  } catch {
    return null;
  }
}

function hasConflictingActivationLanguage(content, canonicalKernel) {
  const withoutKernel = canonicalKernel
    ? replaceAllLiteral(normalizeInstructionLineEndings(content), normalizeInstructionLineEndings(canonicalKernel), "")
    : normalizeInstructionLineEndings(content);
  return [
    /AGDF activation policy:/iu,
    /automatic discovery[^\n.]*activat(?:e|es|ing)[^\n.]*AGDF/iu,
    /(?:always|automatically|unconditionally)[^\n.]*activat(?:e|es|ing)[^\n.]*AGDF/iu,
    /activat(?:e|es|ing)[^\n.]*AGDF[^\n.]*(?:every|all)\s+(?:user\s+)?requests?/iu,
    /(?:every|all)\s+(?:user\s+)?requests?[^\n.]*activat(?:e|es|ing)[^\n.]*AGDF/iu,
    /AGDF[^\n.]*(?:applies to|is active for)[^\n.]*(?:every|all)\s+(?:user\s+)?requests?/iu,
    /default entry rule/iu,
    /stop this AGDF path silently/iu,
    /request activation is non-authorizing/iu,
    /^#{1,6}[ \t]+Request Activation[ \t]*$/imu,
  ].some((pattern) => pattern.test(withoutKernel));
}

function kernelCount(content, canonicalKernel) {
  return canonicalKernel ? countLiteral(content, canonicalKernel) : 0;
}

function bindingCount(content) {
  return countLiteral(normalizeInstructionLineEndings(content), DISPATCHER_BINDING_PREFIX);
}

function markerState(content) {
  const normalized = normalizeInstructionLineEndings(content);
  const startCount = countLiteral(normalized, REQUEST_ACTIVATION_MARKERS.start);
  const endCount = countLiteral(normalized, REQUEST_ACTIVATION_MARKERS.end);
  return {
    startCount,
    endCount,
    ordered: startCount === 1
      && endCount === 1
      && normalized.indexOf(REQUEST_ACTIVATION_MARKERS.start) < normalized.indexOf(REQUEST_ACTIVATION_MARKERS.end),
  };
}

function validateDefinition(definition) {
  const failures = [];
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
    return { failures: [failure("AGDF_INSTRUCTION_FOOTPRINT_DEFINITION_MISSING", "instructionFootprint must be an object")] };
  }
  if (definition.schemaVersion !== INSTRUCTION_FOOTPRINT_SCHEMA_VERSION) {
    failures.push(failure(
      "AGDF_INSTRUCTION_FOOTPRINT_SCHEMA_UNKNOWN",
      `instructionFootprint.schemaVersion must be ${INSTRUCTION_FOOTPRINT_SCHEMA_VERSION}`,
    ));
  }
  if (definition.measurement?.encoding !== "utf8" || definition.measurement?.lineEndings !== "lf") {
    failures.push(failure(
      "AGDF_INSTRUCTION_FOOTPRINT_MEASUREMENT_INVALID",
      "instructionFootprint measurement must use UTF-8 bytes after LF normalization",
    ));
  }
  for (const key of DYNAMIC_VALUE_KEYS) {
    if (definition.measurement?.dynamicAbsolutePathTokens?.[key] !== EXPECTED_DYNAMIC_TOKENS[key]) {
      failures.push(failure(
        "AGDF_INSTRUCTION_FOOTPRINT_DYNAMIC_TOKEN_INVALID",
        `instructionFootprint dynamic token ${key} is missing or changed`,
      ));
    }
  }

  const declaredBudgets = definition.budgets && typeof definition.budgets === "object"
    ? definition.budgets
    : {};
  for (const id of Object.keys(declaredBudgets)) {
    if (!INSTRUCTION_FOOTPRINT_SURFACE_IDS.includes(id)) {
      failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_BUDGET_UNKNOWN", `unknown budget id: ${id}`, id));
    }
  }
  for (const id of INSTRUCTION_FOOTPRINT_SURFACE_IDS) {
    const declared = declaredBudgets[id];
    if (!declared || typeof declared !== "object") {
      failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_BUDGET_MISSING", `missing budget id: ${id}`, id));
      continue;
    }
    if (!Number.isInteger(declared.maxNormalizedBytes) || declared.maxNormalizedBytes < 0) {
      failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_BUDGET_INVALID", `invalid budget value: ${id}`, id));
    }
    if (!Array.isArray(declared.structuralConditions) || declared.structuralConditions.length === 0
        || declared.structuralConditions.some((condition) => typeof condition !== "string" || !condition)) {
      failures.push(failure(
        "AGDF_INSTRUCTION_FOOTPRINT_CONDITIONS_INVALID",
        `structural conditions for ${id} are missing or invalid`,
        id,
      ));
    }
  }
  if (definition.schemaVersion === INSTRUCTION_FOOTPRINT_SCHEMA_VERSION) {
    const observedFingerprint = createHash("sha256")
      .update(JSON.stringify(canonicalizeJson(definition)), "utf8")
      .digest("hex");
    if (observedFingerprint !== AUTHORIZED_SCHEMA_V1_FINGERPRINT) {
      failures.push(failure(
        "AGDF_INSTRUCTION_FOOTPRINT_CONTRACT_UNAUTHORIZED",
        "instructionFootprint schema v1 differs from its approved budget and structural-condition contract",
      ));
    }
  }
  return { failures };
}

export function validateInstructionFootprintDefinition(definition) {
  const { failures } = validateDefinition(definition);
  return Object.freeze({ status: failures.length === 0 ? "pass" : "block", failures: Object.freeze(failures) });
}

function validateKernelIdentity(content, canonicalKernel, surfaceId, instanceId, failures, expectedCount = 1) {
  const count = kernelCount(content, canonicalKernel);
  if (count !== expectedCount) {
    failures.push(failure(
      "AGDF_INSTRUCTION_FOOTPRINT_KERNEL_COUNT",
      `${surfaceId}/${instanceId} must contain ${expectedCount} canonical kernel instance(s); found ${count}`,
      surfaceId,
      instanceId,
    ));
  }
  const state = markerState(content);
  if (expectedCount === 1 && (state.startCount !== 1 || state.endCount !== 1 || !state.ordered)) {
    failures.push(failure(
      "AGDF_INSTRUCTION_FOOTPRINT_MARKER_INVALID",
      `${surfaceId}/${instanceId} has missing, duplicate, partial or reordered kernel markers`,
      surfaceId,
      instanceId,
    ));
  }
}

function validateNoRouter(content, surfaceId, instanceId, failures) {
  const leaked = FULL_ROUTER_HEADINGS.find((heading) => new RegExp(
    `^#{1,6}[ \\t]+${heading.replaceAll(" ", "[ \\t]+")}[ \\t]*$`,
    "imu",
  ).test(content));
  if (leaked) {
    failures.push(failure(
      "AGDF_INSTRUCTION_FOOTPRINT_FULL_ROUTER_LEAK",
      `${surfaceId}/${instanceId} contains eager router section ${leaked}`,
      surfaceId,
      instanceId,
    ));
  }
}

function derivedDynamicValues(surfaceId, content) {
  const normalized = normalizeInstructionLineEndings(content);
  const values = {};
  if ([
    "sessionStartBase",
    "openCodeActiveDynamicContext",
    "openCodeComposedStaticAndActiveDynamic",
  ].includes(surfaceId)) {
    const bindingLines = normalized
      .split("\n")
      .filter((line) => line.startsWith(`${DISPATCHER_BINDING_PREFIX} `));
    const binding = bindingLines.length === 1
      ? parsePrefixedJsonLine(bindingLines[0], DISPATCHER_BINDING_PREFIX)
      : null;
    if (isAbsoluteInstructionPath(binding?.executable)) values.executable = binding.executable;
    if (isAbsoluteInstructionPath(binding?.argv_prefix?.[0])) values.validator = binding.argv_prefix[0];
  }
  if (surfaceId === "runtimeCheckSupplement") {
    const factLines = normalized
      .split("\n")
      .filter((line) => line.startsWith(`${RUNTIME_FACTS_PREFIX} `));
    const facts = factLines.length === 1
      ? parsePrefixedJsonLine(factLines[0], RUNTIME_FACTS_PREFIX)
      : null;
    if (isAbsoluteInstructionPath(facts?.working_directory)) {
      values.workingDirectory = facts.working_directory;
    }
  }
  return values;
}

function validateBindingJson(content, canonicalKernel, expectedVersion, surfaceId, instanceId, failures) {
  const bindingLines = normalizeInstructionLineEndings(content)
    .split("\n")
    .filter((line) => line.startsWith(DISPATCHER_BINDING_PREFIX));
  const binding = bindingLines.length === 1
    ? parsePrefixedJsonLine(bindingLines[0], DISPATCHER_BINDING_PREFIX)
    : null;
  const kernelIdentity = requestActivationKernelIdentity(canonicalKernel);
  const expectedBindingKeys = surfaceId === "sessionStartBase"
    ? "arguments,argv_prefix,authorizes,environment,executable,expected_version,request_activation,route_source_after_activation,schema_version"
    : "arguments,argv_prefix,authorizes,environment,executable,expected_version,request_activation,schema_version";
  const exactKeys = binding && typeof binding === "object" && !Array.isArray(binding)
    ? Object.keys(binding).sort().join(",") === expectedBindingKeys
    : false;
  const activationKeys = binding?.request_activation && typeof binding.request_activation === "object" && !Array.isArray(binding.request_activation)
    ? Object.keys(binding.request_activation).sort().join(",") === "guard_fingerprint,owner,policy_version"
    : false;
  const routeSourceKeys = binding?.route_source_after_activation
    && typeof binding.route_source_after_activation === "object"
    && !Array.isArray(binding.route_source_after_activation)
    ? Object.keys(binding.route_source_after_activation).sort().join(",") === "path,relative_to"
    : false;
  const routeSourceValid = surfaceId !== "sessionStartBase"
    || (routeSourceKeys
      && binding.route_source_after_activation.relative_to === "validator_directory"
      && [
        "../meta/contracts/request-activation.md",
        "../copilot-skills/contracts/request-activation.md",
      ].includes(binding.route_source_after_activation.path));
  let computedFingerprint = null;
  try {
    computedFingerprint = requestActivationKernelFingerprint(canonicalKernel);
  } catch {}
  const valid = binding
    && exactKeys
    && activationKeys
    && routeSourceValid
    && binding.schema_version === "2"
    && typeof binding.arguments === "string" && binding.arguments.length > 0 && binding.arguments.length <= 240
    && binding.environment && typeof binding.environment === "object" && !Array.isArray(binding.environment)
    && Object.keys(binding.environment).every((key) => key === "ELECTRON_RUN_AS_NODE" && binding.environment[key] === "1")
    && isAbsoluteInstructionPath(binding.executable)
    && Array.isArray(binding.argv_prefix)
    && binding.argv_prefix.length === 5
    && isAbsoluteInstructionPath(binding.argv_prefix[0])
    && binding.argv_prefix.slice(1, 5).join("\u0000") === ["skill-dispatch", "--json", "--surface", binding.argv_prefix[4]].join("\u0000")
    && typeof binding.argv_prefix[4] === "string"
    && ["codex", "claude", "copilot", "opencode"].includes(binding.argv_prefix[4])
    && typeof binding.expected_version === "string"
    && binding.expected_version.length > 0
    && (!expectedVersion || binding.expected_version === expectedVersion)
    && binding.authorizes === false
    && binding.request_activation.owner === kernelIdentity.owner
    && binding.request_activation.policy_version === kernelIdentity.policy_version
    && binding.request_activation.guard_fingerprint === kernelIdentity.guard_fingerprint
    && kernelIdentity.guard_fingerprint === computedFingerprint;
  if (!valid) {
    failures.push(failure(
      "AGDF_INSTRUCTION_FOOTPRINT_BINDING_INVALID",
      `${surfaceId}/${instanceId} must contain one exact non-authorizing dispatcher binding for the canonical kernel`,
      surfaceId,
      instanceId,
    ));
  }
  return valid ? binding : null;
}

function validateSurfaceStructure({ surfaceId, record, canonicalKernel, expectedDescriptions, expectedVersion }, failures) {
  const content = normalizeInstructionLineEndings(record.content);
  const instanceId = record.id;

  if ([
    "sessionStartBase",
    "runtimeCheckSupplement",
    "openCodeEagerInstructions",
    "openCodeActiveDynamicContext",
    "openCodeInactiveDynamicContext",
    "openCodeComposedStaticAndActiveDynamic",
    "openCodeCompactionAddition",
  ].includes(surfaceId) && hasConflictingActivationLanguage(content, canonicalKernel)) {
    failures.push(failure(
      "AGDF_INSTRUCTION_FOOTPRINT_ACTIVATION_CONFLICT",
      `${surfaceId}/${instanceId} contains activation language outside the canonical kernel`,
      surfaceId,
      instanceId,
    ));
  }

  switch (surfaceId) {
    case "activationKernel": {
      if (content !== canonicalKernel) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_KERNEL_IDENTITY",
          `${surfaceId}/${instanceId} differs from the canonical kernel`,
          surfaceId,
          instanceId,
        ));
      }
      validateKernelIdentity(content, canonicalKernel, surfaceId, instanceId, failures);
      break;
    }
    case "skillDiscoveryDescription": {
      if (!record.slug || !Object.hasOwn(expectedDescriptions, record.slug)) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_DESCRIPTION_SKILL_UNKNOWN",
          `${surfaceId}/${instanceId} has no definition-owned skill identity`,
          surfaceId,
          instanceId,
        ));
      } else if (content !== expectedDescriptions[record.slug]) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_DESCRIPTION_IDENTITY",
          `${surfaceId}/${instanceId} is not the exact serialized definition projection`,
          surfaceId,
          instanceId,
        ));
      }
      break;
    }
    case "allSkillDiscoveryDescriptions": {
      const expectedAggregate = Object.values(expectedDescriptions).join("");
      if (content !== expectedAggregate) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_DESCRIPTION_AGGREGATE_IDENTITY",
          `${surfaceId}/${instanceId} is not ten serialized scalars in definition order without separators`,
          surfaceId,
          instanceId,
        ));
      }
      if (/AGDF-REQUEST-ACTIVATION-OPERATIONS|ordinary_read_only|active_run_continuation|requested_effect|invocation_provenance/iu.test(content)) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_DESCRIPTION_POLICY_LEAK",
          `${surfaceId}/${instanceId} contains the exclusion taxonomy or operation catalog`,
          surfaceId,
          instanceId,
        ));
      }
      break;
    }
    case "sessionStartBase": {
      validateKernelIdentity(content, canonicalKernel, surfaceId, instanceId, failures);
      if (bindingCount(content) !== 1) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_BINDING_COUNT", `${surfaceId}/${instanceId} must contain exactly one binding`, surfaceId, instanceId));
      } else {
        validateBindingJson(content, canonicalKernel, expectedVersion, surfaceId, instanceId, failures);
        const bindingLine = content.split("\n").find((line) => line.startsWith(`${DISPATCHER_BINDING_PREFIX} `));
        if (content !== `${canonicalKernel}\n\n${bindingLine}`) {
          failures.push(failure(
            "AGDF_INSTRUCTION_FOOTPRINT_SESSION_BASE_SHAPE",
            `${surfaceId}/${instanceId} must contain only the canonical kernel, one blank separator and the binding line`,
            surfaceId,
            instanceId,
          ));
        }
      }
      validateNoRouter(content, surfaceId, instanceId, failures);
      break;
    }
    case "runtimeCheckSupplement": {
      const lines = content.split("\n").filter(Boolean);
      const facts = lines.length === 1 ? parsePrefixedJsonLine(lines[0], RUNTIME_FACTS_PREFIX) : null;
      const required = ["context_state", "working_directory", "automatic_check", "config"];
      const allowed = new Set([...required, "languages"]);
      if (
        !facts
        || typeof facts !== "object"
        || Array.isArray(facts)
        || required.some((key) => !Object.hasOwn(facts, key))
        || Object.keys(facts).some((key) => !allowed.has(key))
        || typeof facts.context_state !== "string"
        || typeof facts.working_directory !== "string"
        || typeof facts.config !== "string"
        || !facts.automatic_check
        || typeof facts.automatic_check !== "object"
        || Array.isArray(facts.automatic_check)
        || Object.keys(facts.automatic_check).sort().join(",") !== "findings,status"
        || typeof facts.automatic_check.status !== "string"
        || !Number.isSafeInteger(facts.automatic_check.findings)
        || facts.automatic_check.findings < 0
        || (Object.hasOwn(facts, "languages") && (
          !facts.languages
          || typeof facts.languages !== "object"
          || Array.isArray(facts.languages)
          || Object.keys(facts.languages).sort().join(",") !== "artifact,chat,runtime"
          || Object.values(facts.languages).some((value) => typeof value !== "string")
        ))
      ) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_RUNTIME_FACTS_INVALID",
          `${surfaceId}/${instanceId} must contain one variable-facts JSON line only`,
          surfaceId,
          instanceId,
        ));
      }
      if (kernelCount(content, canonicalKernel) !== 0 || bindingCount(content) !== 0) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_RUNTIME_FACTS_POLICY_LEAK", `${surfaceId}/${instanceId} contains kernel or binding policy`, surfaceId, instanceId));
      }
      break;
    }
    case "openCodeEagerInstructions": {
      validateKernelIdentity(content, canonicalKernel, surfaceId, instanceId, failures);
      if (bindingCount(content) !== 0) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_BINDING_COUNT", `${surfaceId}/${instanceId} must not contain a binding`, surfaceId, instanceId));
      }
      validateNoRouter(content, surfaceId, instanceId, failures);
      const variant = record.variant ?? "canonical";
      if (
        !Object.hasOwn(AUTHORIZED_OPENCODE_EAGER_FINGERPRINTS, variant)
        || instructionContentFingerprint(content) !== AUTHORIZED_OPENCODE_EAGER_FINGERPRINTS[variant]
      ) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_EAGER_IDENTITY_DRIFT",
          `${surfaceId}/${instanceId} must equal its approved generated micro-bootstrap`,
          surfaceId,
          instanceId,
        ));
      }
      break;
    }
    case "openCodeActiveDynamicContext": {
      if (kernelCount(content, canonicalKernel) !== 0 || markerState(content).startCount !== 0 || markerState(content).endCount !== 0) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_DYNAMIC_KERNEL_LEAK", `${surfaceId}/${instanceId} must not copy the kernel`, surfaceId, instanceId));
      }
      if (bindingCount(content) !== 1) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_BINDING_COUNT", `${surfaceId}/${instanceId} must contain exactly one binding`, surfaceId, instanceId));
      } else {
        record.bindingVersion = validateBindingJson(content, canonicalKernel, expectedVersion, surfaceId, instanceId, failures)?.expected_version ?? null;
      }
      {
        const lines = content.split("\n");
        const facts = lines.length === 2 ? parsePrefixedJsonLine(lines[1], RUNTIME_FACTS_PREFIX) : null;
        if (
          !facts
          || typeof facts !== "object"
          || Array.isArray(facts)
          || Object.keys(facts).sort().join(",") !== "active,version"
          || facts.active !== true
          || typeof facts.version !== "string"
          || (expectedVersion && facts.version !== expectedVersion)
          || (record.bindingVersion && facts.version !== record.bindingVersion)
        ) {
          failures.push(failure(
            "AGDF_INSTRUCTION_FOOTPRINT_DYNAMIC_FACTS_INVALID",
            `${surfaceId}/${instanceId} must contain only active/version facts after its binding`,
            surfaceId,
            instanceId,
          ));
        }
      }
      break;
    }
    case "openCodeInactiveDynamicContext": {
      if (content.length !== 0) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_INACTIVE_NONEMPTY", `${surfaceId}/${instanceId} must be empty`, surfaceId, instanceId));
      }
      break;
    }
    case "openCodeComposedStaticAndActiveDynamic": {
      validateKernelIdentity(content, canonicalKernel, surfaceId, instanceId, failures);
      if (bindingCount(content) !== 1) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_BINDING_COUNT", `${surfaceId}/${instanceId} must contain exactly one binding`, surfaceId, instanceId));
      } else {
        validateBindingJson(content, canonicalKernel, expectedVersion, surfaceId, instanceId, failures);
      }
      validateNoRouter(content, surfaceId, instanceId, failures);
      const bindingStart = content.lastIndexOf(`${DISPATCHER_BINDING_PREFIX} `);
      if (bindingStart <= 0 || content[bindingStart - 1] !== "\n") {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_COMPOSED_SHAPE_INVALID",
          `${surfaceId}/${instanceId} must be one approved eager bootstrap plus one active dynamic block`,
          surfaceId,
          instanceId,
        ));
      } else {
        const eagerContent = content.slice(0, bindingStart - 1);
        const activeContent = content.slice(bindingStart);
        validateSurfaceStructure({
          surfaceId: "openCodeEagerInstructions",
          record: { id: `${instanceId}-eager`, variant: record.variant, content: eagerContent },
          canonicalKernel,
          expectedDescriptions,
          expectedVersion,
        }, failures);
        validateSurfaceStructure({
          surfaceId: "openCodeActiveDynamicContext",
          record: { id: `${instanceId}-active`, content: activeContent },
          canonicalKernel,
          expectedDescriptions,
          expectedVersion,
        }, failures);
      }
      break;
    }
    case "openCodeCompactionAddition": {
      if (content !== "" && content !== canonicalKernel) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_COMPACTION_INVALID",
          `${surfaceId}/${instanceId} must be empty or the exact kernel-only recovery block`,
          surfaceId,
          instanceId,
        ));
      }
      if (bindingCount(content) !== 0 || /\bactive\b|\binactive\b/iu.test(replaceAllLiteral(content, canonicalKernel, ""))) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_COMPACTION_GUIDANCE_LEAK",
          `${surfaceId}/${instanceId} contains a binding or active/inactive guidance`,
          surfaceId,
          instanceId,
        ));
      }
      break;
    }
    case "selectedGateCheckSkill": {
      validateKernelIdentity(content, canonicalKernel, surfaceId, instanceId, failures);
      const variant = record.variant ?? "canonical";
      const dispatchHeading = variant === "global" ? "## Conditional Executable Dispatch" : "## Executable Dispatch";
      const dispatchIndex = content.indexOf(dispatchHeading);
      if (dispatchIndex < 0 || content.indexOf(canonicalKernel) > dispatchIndex || countLiteral(content, dispatchHeading) !== 1) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_GATE_DISPATCH_ORDER",
          `${surfaceId}/${instanceId} must contain one unchanged terminal dispatch after the kernel`,
          surfaceId,
          instanceId,
        ));
      }
      const expectedHeadings = variant === "global"
        ? [
          "## Purpose",
          "## Request Activation",
          "## Repository Activation Guard",
          "## Route Boundary",
          "## Conditional Executable Dispatch",
          "## Declared `instruction_only` Fallback",
        ]
        : [
          "## Purpose",
          "## Request Activation",
          "## Route Boundary",
          "## Executable Dispatch",
          "## Declared `instruction_only` Fallback",
        ];
      const actualHeadings = content.match(/^## .+$/gmu) ?? [];
      if (
        !["canonical", "global"].includes(variant)
        ||
        actualHeadings.length !== expectedHeadings.length
        || actualHeadings.some((heading, index) => heading !== expectedHeadings[index])
      ) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_GATE_STRUCTURE",
          `${surfaceId}/${instanceId} must contain exactly its approved compact level-two headings in order`,
          surfaceId,
          instanceId,
        ));
      }
      if (!/## Declared `instruction_only` Fallback/u.test(content) || !/terminal:\s*true/u.test(content)) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_GATE_FALLBACK_INVALID",
          `${surfaceId}/${instanceId} must keep explicit instruction_only fallback and terminal dispatch`,
          surfaceId,
          instanceId,
        ));
      }
      const terminalDispatchAnchor = variant === "global"
        ? GLOBAL_TERMINAL_DISPATCH_ANCHOR
        : TERMINAL_DISPATCH_ANCHOR;
      const terminalDispatchCount = countLiteral(content, terminalDispatchAnchor);
      const fallbackStart = content.indexOf("## Declared `instruction_only` Fallback");
      const terminalDispatchStart = content.indexOf(terminalDispatchAnchor);
      const terminalDispatch = terminalDispatchCount === 1
        && terminalDispatchStart >= 0
        && fallbackStart > terminalDispatchStart
        ? content.slice(terminalDispatchStart, fallbackStart).trimEnd()
        : "";
      const canonicalTerminalDispatch = variant === "global"
        ? terminalDispatch.replace(GLOBAL_TERMINAL_DISPATCH_ANCHOR, TERMINAL_DISPATCH_ANCHOR)
        : terminalDispatch;
      const terminalDispatchFingerprint = createHash("sha256")
        .update(canonicalTerminalDispatch, "utf8")
        .digest("hex");
      if (
        terminalDispatchCount !== 1
        || terminalDispatchFingerprint !== AUTHORIZED_TERMINAL_DISPATCH_FINGERPRINT
      ) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_GATE_TERMINAL_DISPATCH_DRIFT",
          `${surfaceId}/${instanceId} must preserve the approved terminal dispatch byte-for-byte`,
          surfaceId,
          instanceId,
        ));
      }
      const fallback = fallbackStart >= 0 ? content.slice(fallbackStart) : "";
      const expectedResourceRoot = variant === "global" ? "../../contracts" : "../../meta/contracts";
      const expectedResources = [
        "task-target-resolution.md",
        "gate-transition.md",
        "interaction.md",
        "control-scaffold.md",
        "modes.md",
        "quality.md",
      ].map((name) => `${expectedResourceRoot}/${name}`);
      const declaredResources = [...fallback.matchAll(/`(\.\.\/\.\.\/(?:meta\/)?contracts\/[a-z0-9-]+\.md)`/gu)]
        .map((match) => match[1]);
      const resourcesOutsideFallback = [...content.slice(0, Math.max(0, fallbackStart)).matchAll(/`(\.\.\/\.\.\/(?:meta\/)?contracts\/[a-z0-9-]+\.md)`/gu)];
      if (JSON.stringify(declaredResources) !== JSON.stringify(expectedResources) || resourcesOutsideFallback.length !== 0) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_GATE_RESOURCES_INVALID",
          `${surfaceId}/${instanceId} must load exactly six focused contracts only through its declared fallback`,
          surfaceId,
          instanceId,
        ));
      }
      validateNoRouter(content, surfaceId, instanceId, failures);
      break;
    }
    default:
      break;
  }
}

export function validateInstructionFootprintProfile({
  definition,
  canonicalKernel,
  expectedDescriptions = {},
  expectedVersion = null,
  expectedInstanceIds = {},
  surfaces,
  requiredSurfaceIds = INSTRUCTION_FOOTPRINT_SURFACE_IDS,
}) {
  const definitionResult = validateDefinition(definition);
  const failures = [...definitionResult.failures];
  const measurements = [];
  const dynamicTokens = definition?.measurement?.dynamicAbsolutePathTokens ?? EXPECTED_DYNAMIC_TOKENS;
  const normalizedKernel = normalizeInstructionLineEndings(canonicalKernel);
  let canonicalFingerprint = null;

  if (!normalizedKernel) {
    failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_CANONICAL_KERNEL_MISSING", "canonical kernel is required"));
  } else {
    const state = markerState(normalizedKernel);
    if (state.startCount !== 1 || state.endCount !== 1 || !state.ordered) {
      failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_CANONICAL_MARKER_INVALID", "canonical kernel markers are missing, duplicate, partial or reordered"));
    }
    try {
      canonicalFingerprint = requestActivationKernelFingerprint(normalizedKernel);
      const identity = requestActivationKernelIdentity(normalizedKernel);
      if (
        identity.owner !== "request_activation_contract"
        || identity.path !== "plugin/meta/contracts/request-activation.md"
        || identity.policy_version !== 1
        || identity.guard_fingerprint !== canonicalFingerprint
      ) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_CANONICAL_FINGERPRINT_INVALID", "canonical kernel fingerprint does not match its normalized guard content"));
      }
    } catch {
      failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_CANONICAL_FINGERPRINT_INVALID", "canonical kernel must contain exactly one valid fingerprint field"));
    }
  }

  const required = new Set(requiredSurfaceIds);
  for (const id of required) {
    if (!INSTRUCTION_FOOTPRINT_SURFACE_IDS.includes(id)) {
      failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_REQUIRED_SURFACE_UNKNOWN", `unknown required surface: ${id}`, id));
    }
  }
  if (!surfaces || typeof surfaces !== "object" || Array.isArray(surfaces)) {
    failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_SURFACES_MISSING", "surface profile must be an object"));
  }
  const supplied = surfaces && typeof surfaces === "object" && !Array.isArray(surfaces) ? surfaces : {};
  for (const id of Object.keys(supplied)) {
    if (!INSTRUCTION_FOOTPRINT_SURFACE_IDS.includes(id)) {
      failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_SURFACE_UNKNOWN", `unknown surface: ${id}`, id));
    }
  }

  for (const surfaceId of INSTRUCTION_FOOTPRINT_SURFACE_IDS) {
    const records = supplied[surfaceId];
    if (!Array.isArray(records) || records.length === 0) {
      if (required.has(surfaceId)) {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_SURFACE_MISSING", `missing required surface: ${surfaceId}`, surfaceId));
      }
      continue;
    }
    if (Object.hasOwn(expectedInstanceIds, surfaceId)) {
      const actualIds = records.map((record) => record?.id);
      const expectedIds = expectedInstanceIds[surfaceId];
      if (!Array.isArray(expectedIds) || JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_SURFACE_INVENTORY_INVALID",
          `${surfaceId} instances are missing, unknown, duplicate or out of order`,
          surfaceId,
        ));
      }
    }
    if (surfaceId === "skillDiscoveryDescription") {
      const actualSlugs = records.map((record) => record?.slug);
      const expectedSlugs = Object.keys(expectedDescriptions);
      if (expectedSlugs.length !== 10 || JSON.stringify(actualSlugs) !== JSON.stringify(expectedSlugs)) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_DESCRIPTION_INVENTORY_INVALID",
          `${surfaceId} must contain ten unique records in definition order`,
          surfaceId,
        ));
      }
    }
    for (const [index, record] of records.entries()) {
      const instanceId = typeof record?.id === "string" && record.id ? record.id : `${surfaceId}-${index + 1}`;
      if (!record || typeof record.content !== "string") {
        failures.push(failure("AGDF_INSTRUCTION_FOOTPRINT_SURFACE_INVALID", `${surfaceId}/${instanceId} content must be a string`, surfaceId, instanceId));
        continue;
      }
      const measured = measureInstructionContent({
        content: record.content,
        dynamicValues: derivedDynamicValues(surfaceId, record.content),
        dynamicTokens,
      });
      const budget = definition?.budgets?.[surfaceId]?.maxNormalizedBytes;
      const overBudget = Number.isInteger(budget) && measured.normalized_bytes > budget;
      measurements.push(Object.freeze({
        surface_id: surfaceId,
        instance_id: instanceId,
        ...measured,
        max_normalized_bytes: budget ?? null,
        status: overBudget ? "block" : "pass",
      }));
      if (overBudget) {
        failures.push(failure(
          "AGDF_INSTRUCTION_FOOTPRINT_BUDGET_EXCEEDED",
          `${surfaceId}/${instanceId} is ${measured.normalized_bytes} normalized bytes; maximum is ${budget}`,
          surfaceId,
          instanceId,
        ));
      }
      validateSurfaceStructure({
        surfaceId,
        record: { ...record, id: instanceId },
        canonicalKernel: normalizedKernel,
        expectedDescriptions,
        expectedVersion,
      }, failures);
    }
  }

  return Object.freeze({
    schema_version: INSTRUCTION_FOOTPRINT_SCHEMA_VERSION,
    status: failures.length === 0 ? "pass" : "block",
    canonical_kernel_fingerprint: canonicalFingerprint,
    measurements: Object.freeze(measurements),
    failures: Object.freeze(failures),
  });
}
