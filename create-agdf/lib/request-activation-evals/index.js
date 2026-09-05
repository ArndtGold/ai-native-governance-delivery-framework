import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseRequestActivationOperationCatalog } from "../../scripts/sync-request-activation-projections.js";

const REQUESTED_EFFECTS = new Set([
  "read_only_assistance",
  "governed_delivery",
  "binding_delivery_artefact",
  "named_agdf_operation",
  "control_lifecycle",
  "continuation_action",
  "ambiguous",
]);
const INVOCATION_PROVENANCE = new Set(["current_user_text", "trusted_ephemeral_user_action", "unavailable"]);
const SELECTION_ORIGINS = new Set(["explicit_user_action", "automatic_discovery", "router_selection", "unavailable"]);
const DECISIONS = new Set(["abstain", "clarify", "activate_named_operation", "activate_delivery_intake", "activate_continuation"]);
const VISIBLE_POLICIES = new Set(["silent", "clarification_without_agdf", "normal_answer", "operation_result"]);
const CONTROL_CONTEXTS = new Set(["not_applicable", "repositoryless", "no_control", "active_run"]);

const EFFECT_EXPECTATIONS = Object.freeze({
  read_only_assistance: { requestClass: "ordinary_read_only", decisions: ["abstain"] },
  governed_delivery: { requestClass: "delivery_intent", decisions: ["activate_delivery_intake"] },
  binding_delivery_artefact: { requestClass: "delivery_intent", decisions: ["activate_delivery_intake"] },
  named_agdf_operation: { requestClass: "explicit_agdf_operation", decisions: ["activate_named_operation"] },
  control_lifecycle: { requestClass: "explicit_control_lifecycle", decisions: ["activate_named_operation"] },
  continuation_action: { requestClass: "active_run_continuation", decisions: ["activate_continuation"] },
  ambiguous: { requestClass: "ambiguous_effect", decisions: ["abstain", "clarify"] },
});

function normalized(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function inside(root, candidate) {
  const relation = relative(root, candidate);
  return relation === "" || (relation !== ".." && !relation.startsWith(`..${sep}`) && !isAbsolute(relation));
}

function safePath(root, relativePath) {
  const path = resolve(root, relativePath);
  if (!inside(resolve(root), path)) throw new Error(`request activation eval path escapes repository: ${relativePath}`);
  return path;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function failure(code, message, caseId = null) {
  return { code, message, ...(caseId ? { case_id: caseId } : {}) };
}

function exactKeys(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index]);
}

function jsonEqual(left, right) {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => jsonEqual(value, right[index]));
  }
  if (left && right && typeof left === "object" && typeof right === "object"
      && !Array.isArray(left) && !Array.isArray(right)) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length
      && leftKeys.every((key, index) => key === rightKeys[index] && jsonEqual(left[key], right[key]));
  }
  return false;
}

function schemaTypeMatches(type, value) {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === type;
}

function resolveLocalSchemaRef(rootSchema, ref) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) return null;
  return ref.slice(2).split("/").reduce((value, token) => (
    value?.[token.replaceAll("~1", "/").replaceAll("~0", "~")]
  ), rootSchema);
}

function validateSchemaNode(schema, value, path, rootSchema, errors) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    errors.push({ path, keyword: "schema", message: "schema node must be an object" });
    return;
  }
  if (schema.$ref) {
    const resolved = resolveLocalSchemaRef(rootSchema, schema.$ref);
    if (!resolved) errors.push({ path, keyword: "$ref", message: `unresolved local schema reference ${schema.$ref}` });
    else validateSchemaNode(resolved, value, path, rootSchema, errors);
    return;
  }
  if (schema.const !== undefined && !jsonEqual(value, schema.const)) {
    errors.push({ path, keyword: "const", message: "value differs from const" });
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => jsonEqual(value, candidate))) {
    errors.push({ path, keyword: "enum", message: "value is not in enum" });
  }
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => schemaTypeMatches(type, value))) {
      errors.push({ path, keyword: "type", message: `expected ${types.join("|")}` });
      return;
    }
  }

  for (const [keyword, requirement] of [["allOf", "all"], ["anyOf", "any"], ["oneOf", "one"]]) {
    if (!Array.isArray(schema[keyword])) continue;
    const branchErrors = schema[keyword].map((branch) => {
      const result = [];
      validateSchemaNode(branch, value, path, rootSchema, result);
      return result;
    });
    const matches = branchErrors.filter((result) => result.length === 0).length;
    if ((requirement === "all" && matches !== branchErrors.length)
        || (requirement === "any" && matches === 0)
        || (requirement === "one" && matches !== 1)) {
      errors.push({ path, keyword, message: `${keyword} matched ${matches} branches` });
    }
  }
  if (schema.not) {
    const notErrors = [];
    validateSchemaNode(schema.not, value, path, rootSchema, notErrors);
    if (notErrors.length === 0) errors.push({ path, keyword: "not", message: "value matches forbidden schema" });
  }
  if (schema.if) {
    const conditionErrors = [];
    validateSchemaNode(schema.if, value, path, rootSchema, conditionErrors);
    if (conditionErrors.length === 0 && schema.then) validateSchemaNode(schema.then, value, path, rootSchema, errors);
    if (conditionErrors.length > 0 && schema.else) validateSchemaNode(schema.else, value, path, rootSchema, errors);
  }

  if (typeof value === "string") {
    if (Number.isInteger(schema.minLength) && value.length < schema.minLength) {
      errors.push({ path, keyword: "minLength", message: `string length is below ${schema.minLength}` });
    }
    if (schema.pattern !== undefined) {
      try {
        if (!new RegExp(schema.pattern, "u").test(value)) errors.push({ path, keyword: "pattern", message: `string does not match ${schema.pattern}` });
      } catch {
        errors.push({ path, keyword: "pattern", message: `schema pattern is invalid: ${schema.pattern}` });
      }
    }
  }
  if (typeof value === "number") {
    if (typeof schema.minimum === "number" && value < schema.minimum) errors.push({ path, keyword: "minimum", message: `number is below ${schema.minimum}` });
    if (typeof schema.maximum === "number" && value > schema.maximum) errors.push({ path, keyword: "maximum", message: `number is above ${schema.maximum}` });
  }
  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) errors.push({ path, keyword: "minItems", message: `array has fewer than ${schema.minItems} items` });
    if (Number.isInteger(schema.maxItems) && value.length > schema.maxItems) errors.push({ path, keyword: "maxItems", message: `array has more than ${schema.maxItems} items` });
    if (schema.uniqueItems === true) {
      for (let left = 0; left < value.length; left += 1) {
        if (value.slice(left + 1).some((candidate) => jsonEqual(value[left], candidate))) {
          errors.push({ path, keyword: "uniqueItems", message: "array items must be unique" });
          break;
        }
      }
    }
    if (schema.items && typeof schema.items === "object") {
      value.forEach((item, index) => validateSchemaNode(schema.items, item, `${path}[${index}]`, rootSchema, errors));
    }
    if (schema.contains) {
      const matches = value.filter((item, index) => {
        const result = [];
        validateSchemaNode(schema.contains, item, `${path}[${index}]`, rootSchema, result);
        return result.length === 0;
      }).length;
      const minimum = Number.isInteger(schema.minContains) ? schema.minContains : 1;
      const maximum = Number.isInteger(schema.maxContains) ? schema.maxContains : Infinity;
      if (matches < minimum || matches > maximum) errors.push({ path, keyword: "contains", message: `contains matched ${matches} items` });
    }
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const propertyCount = Object.keys(value).length;
    if (Number.isInteger(schema.minProperties) && propertyCount < schema.minProperties) {
      errors.push({ path, keyword: "minProperties", message: `object has fewer than ${schema.minProperties} properties` });
    }
    if (Number.isInteger(schema.maxProperties) && propertyCount > schema.maxProperties) {
      errors.push({ path, keyword: "maxProperties", message: `object has more than ${schema.maxProperties} properties` });
    }
    const required = Array.isArray(schema.required) ? schema.required : [];
    for (const key of required) if (!(key in value)) errors.push({ path: `${path}.${key}`, keyword: "required", message: "required property is missing" });
    const properties = schema.properties && typeof schema.properties === "object" ? schema.properties : {};
    for (const [key, propertyValue] of Object.entries(value)) {
      if (properties[key]) validateSchemaNode(properties[key], propertyValue, `${path}.${key}`, rootSchema, errors);
      else if (schema.additionalProperties === false) errors.push({ path: `${path}.${key}`, keyword: "additionalProperties", message: "unknown property" });
      else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        validateSchemaNode(schema.additionalProperties, propertyValue, `${path}.${key}`, rootSchema, errors);
      }
    }
  }
}

export function validateJsonSchema(schema, value) {
  const errors = [];
  validateSchemaNode(schema, value, "$", schema, errors);
  return errors;
}

export function computeRequestActivationSourceFingerprint(repoRoot, sourcePaths) {
  if (!Array.isArray(sourcePaths) || sourcePaths.length === 0) throw new Error("request activation source fingerprint needs at least one source");
  const hash = createHash("sha256");
  for (const sourcePath of [...sourcePaths].sort()) {
    const path = safePath(repoRoot, sourcePath);
    hash.update(sourcePath).update("\0").update(normalized(readFileSync(path, "utf8"))).update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

export function loadRequestActivationCorpus(repoRoot, { corpusDir = "evals/request-activation" } = {}) {
  const root = safePath(repoRoot, corpusDir);
  const manifest = readJson(join(root, "manifest.json"));
  const schema = readJson(join(root, "schema.json"));
  const cases = readdirSync(join(root, "cases"))
    .filter((name) => name.endsWith(".json"))
    .sort()
    .flatMap((name) => readJson(join(root, "cases", name)));
  return { root, manifest, schema, cases };
}

function validateCaseShape(testCase, callbacks, operationIds, skillSlugs, failures) {
  const id = testCase?.case_id || "<missing>";
  const requiredKeys = [
    "case_family", "case_id", "control_context", "covered_criteria", "expected",
    "invocation_provenance", "locale", "prior_context", "requested_effect", "schema_version",
    "selection_origin", "user_text",
  ];
  const allowedTopLevel = new Set([...requiredKeys, "composed_profile", "pair"]);
  if (!testCase || typeof testCase !== "object" || Array.isArray(testCase)) {
    failures.push(failure("CASE_SCHEMA", "case must be an object", id));
    return;
  }
  if (Object.keys(testCase).some((key) => !allowedTopLevel.has(key)) || requiredKeys.some((key) => !(key in testCase))) {
    failures.push(failure("CASE_SCHEMA", "case has missing or unknown fields", id));
  }
  if (testCase.schema_version !== 1 || !/^[a-z0-9][a-z0-9-]+$/.test(id)) failures.push(failure("CASE_SCHEMA", "invalid schema version or case id", id));
  if (!new Set(["de", "en"]).has(testCase.locale) || !id.startsWith(`${testCase.locale}-`)) failures.push(failure("CASE_LOCALE", "case id and locale must agree", id));
  if (typeof testCase.user_text !== "string" || !testCase.user_text.trim()) failures.push(failure("CASE_SCHEMA", "user_text must be non-empty", id));
  if (!Array.isArray(testCase.prior_context) || testCase.prior_context.some((turn) => !exactKeys(turn, ["role", "text"]) || !["user", "assistant"].includes(turn.role) || !turn.text)) {
    failures.push(failure("CASE_SCHEMA", "prior_context must contain only role/text turns", id));
  }
  if (!CONTROL_CONTEXTS.has(testCase.control_context)) failures.push(failure("CASE_SCHEMA", "unknown control_context", id));
  if (!REQUESTED_EFFECTS.has(testCase.requested_effect)) failures.push(failure("CASE_SCHEMA", "unknown requested_effect", id));
  if (!INVOCATION_PROVENANCE.has(testCase.invocation_provenance)) failures.push(failure("CASE_SCHEMA", "unknown invocation_provenance", id));
  if (!SELECTION_ORIGINS.has(testCase.selection_origin)) failures.push(failure("CASE_SCHEMA", "unknown selection_origin", id));
  if (!Array.isArray(testCase.covered_criteria) || testCase.covered_criteria.length === 0 || testCase.covered_criteria.some((value) => !/^RAB-[0-9]{2}$/.test(value))) {
    failures.push(failure("CASE_COVERAGE", "covered_criteria must contain RAB identifiers", id));
  }
  if (testCase.composed_profile !== undefined) {
    if (!exactKeys(testCase.composed_profile, ["instruction_skill"])) {
      failures.push(failure("COMPOSED_PROFILE_SCHEMA", "composed_profile must contain only instruction_skill", id));
    } else if (!skillSlugs.has(testCase.composed_profile.instruction_skill)) {
      failures.push(failure("COMPOSED_PROFILE_SKILL", `unknown composed-profile instruction skill ${testCase.composed_profile.instruction_skill}`, id));
    }
  }

  const expected = testCase.expected;
  const expectedKeys = [
    "allowed_callbacks", "authorizes", "callback_order", "decision", "forbidden_callbacks",
    "operation_id", "persist", "request_class", "selected_skill", "visible_agdf",
  ];
  if (!exactKeys(expected, expectedKeys)) {
    failures.push(failure("CASE_SCHEMA", "expected result has missing or unknown fields", id));
    return;
  }
  const effectExpectation = EFFECT_EXPECTATIONS[testCase.requested_effect];
  if (!effectExpectation || expected.request_class !== effectExpectation.requestClass || !effectExpectation.decisions.includes(expected.decision)) {
    failures.push(failure("DECISION_MAPPING", "requested effect, request class and decision disagree", id));
  }
  if (!DECISIONS.has(expected.decision) || !VISIBLE_POLICIES.has(expected.visible_agdf)) failures.push(failure("CASE_SCHEMA", "unknown decision or visible policy", id));
  if (expected.authorizes !== false || expected.persist !== false) failures.push(failure("AUTHORITY", "request activation must be non-authorizing and transient", id));
  if (typeof expected.selected_skill !== "string" || !expected.selected_skill) failures.push(failure("CASE_SCHEMA", "selected_skill must be a string and may be none", id));
  if (expected.selected_skill !== "none" && !skillSlugs.has(expected.selected_skill)) failures.push(failure("SKILL_OWNER", `unknown selected skill ${expected.selected_skill}`, id));

  for (const key of ["allowed_callbacks", "forbidden_callbacks", "callback_order"]) {
    if (!Array.isArray(expected[key]) || new Set(expected[key]).size !== expected[key].length || expected[key].some((name) => !callbacks.has(name))) {
      failures.push(failure("CALLBACK_SCHEMA", `${key} contains missing, duplicate or unknown callbacks`, id));
    }
  }
  const allowed = new Set(expected.allowed_callbacks);
  const forbidden = new Set(expected.forbidden_callbacks);
  if ([...allowed].some((name) => forbidden.has(name))) failures.push(failure("CALLBACK_POLICY", "allowed and forbidden callbacks overlap", id));
  if ([...callbacks].some((name) => !allowed.has(name) && !forbidden.has(name))) failures.push(failure("CALLBACK_POLICY", "callback policy must classify the complete vocabulary", id));
  if (expected.callback_order.some((name) => !allowed.has(name))) failures.push(failure("CALLBACK_ORDER", "callback_order must be a subset of allowed_callbacks", id));

  if (["abstain", "clarify"].includes(expected.decision)) {
    if (expected.operation_id !== null || expected.selected_skill !== "none" || allowed.size !== 0 || forbidden.size !== callbacks.size || expected.callback_order.length !== 0) {
      failures.push(failure("SILENT_OUTCOME", "abstain and clarify must select no operation or skill and allow zero AGDF callbacks", id));
    }
    if (!new Set(["silent", "clarification_without_agdf"]).has(expected.visible_agdf)) failures.push(failure("SILENT_OUTCOME", "negative applicability may not render AGDF output", id));
  } else {
    if (typeof expected.operation_id !== "string" || !expected.operation_id) failures.push(failure("OPERATION_OWNER", "positive applicability requires an operation id", id));
    else if (expected.operation_id.startsWith("skill.")) {
      const slug = expected.operation_id.slice("skill.".length);
      if (!skillSlugs.has(slug) || expected.selected_skill !== slug || expected.callback_order[0] !== "dispatcher_v1") {
        failures.push(failure("DIRECT_SKILL_ORDER", "direct skills must derive from skillSet and dispatch first", id));
      }
    } else if (!operationIds.has(expected.operation_id)) failures.push(failure("OPERATION_OWNER", `unknown operation id ${expected.operation_id}`, id));
  }

  if (expected.operation_id?.startsWith("status.installation.") && ["target_resolver", "repository_activation", "control_presence", "control_evaluator", "repository_status_owner"].some((name) => allowed.has(name))) {
    failures.push(failure("GLOBAL_STATUS_BOUNDARY", "global installation status may not call target, repository or control owners", id));
  }
  if (expected.operation_id === "delivery.start" && allowed.has("dispatcher_v1") && expected.callback_order.indexOf("dispatcher_v1") < expected.callback_order.indexOf("target_resolver")) {
    failures.push(failure("DELIVERY_ORDER", "delivery intake must resolve target before dispatcher revalidation", id));
  }
}

export function validateRequestActivationCorpus(repoRoot, options = {}) {
  const { manifest, schema, cases } = loadRequestActivationCorpus(repoRoot, options);
  const failures = [];
  if (manifest.schema_version !== 1 || manifest.policy_version !== 1 || manifest.source_fingerprint?.algorithm !== "sha256") {
    failures.push(failure("MANIFEST_SCHEMA", "manifest must use schema/policy version 1 and SHA-256 source identity"));
  }
  if (schema?.type !== "object" || schema?.additionalProperties !== false) failures.push(failure("JSON_SCHEMA", "case schema must be a closed object schema"));
  if (manifest.privacy?.raw_prompt_transport !== false || manifest.privacy?.remote_classifier !== false || manifest.privacy?.activation_persistence !== false) {
    failures.push(failure("PRIVACY", "manifest must prohibit raw-prompt transport, remote classification and activation persistence"));
  }
  const callbacks = new Set(manifest.callback_vocabulary ?? []);
  if (callbacks.size !== (manifest.callback_vocabulary ?? []).length || callbacks.size === 0) failures.push(failure("MANIFEST_SCHEMA", "callback vocabulary must be non-empty and unique"));

  const definition = readJson(safePath(repoRoot, "plugin/meta/agdf-plugin.definition.json"));
  const skillSlugs = new Set((definition.skillSet ?? []).map(({ slug }) => slug));
  const contractContent = normalized(readFileSync(safePath(repoRoot, "plugin/meta/contracts/request-activation.md"), "utf8"));
  const catalog = parseRequestActivationOperationCatalog(contractContent);
  const operationIds = new Set(catalog.operations.map(({ operation_id: operationId }) => operationId));

  const ids = new Set();
  for (const testCase of cases) {
    if (ids.has(testCase.case_id)) failures.push(failure("DUPLICATE_CASE", "case id must be unique", testCase.case_id));
    ids.add(testCase.case_id);
    for (const schemaError of validateJsonSchema(schema, testCase)) {
      failures.push(failure("CASE_JSON_SCHEMA", `${schemaError.path} ${schemaError.keyword}: ${schemaError.message}`, testCase.case_id));
    }
    validateCaseShape(testCase, callbacks, operationIds, skillSlugs, failures);
  }
  for (const locale of manifest.required_locales ?? []) if (!cases.some((testCase) => testCase.locale === locale)) failures.push(failure("LOCALE_COVERAGE", `missing locale ${locale}`));
  for (const family of manifest.required_case_families ?? []) if (!cases.some((testCase) => testCase.case_family === family)) failures.push(failure("FAMILY_COVERAGE", `missing case family ${family}`));
  for (const pair of manifest.required_pairs ?? []) {
    const observed = new Set(cases.filter((testCase) => testCase.pair?.id === pair.id).map((testCase) => testCase.pair.side));
    if (observed.size !== pair.sides.length || pair.sides.some((side) => !observed.has(side))) failures.push(failure("PAIR_COVERAGE", `pair ${pair.id} does not contain exactly ${pair.sides.join(", ")}`));
  }
  const composed = manifest.composed_profile;
  const requiredComposedCoverage = new Set(["negative", "positive", "mixed", "explicit_operation", "continuation"]);
  const expectedProfileSurfaces = ["codex", "claude", "copilot", "opencode"];
  if (!exactKeys(composed, ["evaluator_surfaces", "evidence_plane", "loaded_profile", "profiles", "required_pairs", "schema_version"])
      || composed.schema_version !== 1
      || composed.evidence_plane !== "source_composed"
      || composed.loaded_profile !== false
      || !jsonEqual(composed.evaluator_surfaces, ["codex", "claude"])
      || !exactKeys(composed.profiles, expectedProfileSurfaces)) {
    failures.push(failure("COMPOSED_PROFILE_MANIFEST", "composed-profile evidence manifest is missing or invalid"));
  } else {
    for (const surface of expectedProfileSurfaces) {
      const profile = composed.profiles[surface];
      const keys = profile?.eager_kind === "session_start"
        ? ["eager_kind", "eager_source", "skill_prefix", "skill_root"]
        : ["dynamic_source", "eager_kind", "eager_source", "skill_prefix", "skill_root"];
      if (!exactKeys(profile, keys)
          || !["session_start", "opencode"].includes(profile.eager_kind)
          || (surface === "opencode") !== (profile.eager_kind === "opencode")
          || keys.filter((key) => key.endsWith("source") || key === "skill_root").some((key) => typeof profile[key] !== "string" || !profile[key])
          || typeof profile.skill_prefix !== "string") {
        failures.push(failure("COMPOSED_PROFILE_MANIFEST", `invalid composed-profile source mapping for ${surface}`));
      }
    }
    const pairIds = new Set();
    const coverage = new Set();
    for (const pair of composed.required_pairs ?? []) {
      if (!exactKeys(pair, ["coverage", "id"])
          || typeof pair.id !== "string"
          || pairIds.has(pair.id)
          || !Array.isArray(pair.coverage)
          || pair.coverage.length === 0
          || new Set(pair.coverage).size !== pair.coverage.length
          || pair.coverage.some((value) => !requiredComposedCoverage.has(value))) {
        failures.push(failure("COMPOSED_PROFILE_MANIFEST", "composed-profile pair declarations must be closed, unique and use known coverage"));
        continue;
      }
      pairIds.add(pair.id);
      pair.coverage.forEach((value) => coverage.add(value));
      const pairedCases = cases.filter((testCase) => testCase.pair?.id === pair.id);
      if (pairedCases.length < 2 || pairedCases.some((testCase) => !testCase.composed_profile)) {
        failures.push(failure("COMPOSED_PROFILE_COVERAGE", `composed-profile pair ${pair.id} must contain at least two declared cases`));
      }
      const coverageMatches = {
        negative: pairedCases.some((testCase) => ["abstain", "clarify"].includes(testCase.expected?.decision)),
        positive: pairedCases.some((testCase) => !["abstain", "clarify"].includes(testCase.expected?.decision)),
        mixed: pairedCases.some((testCase) => testCase.case_family === "mixed_intent"),
        explicit_operation: pairedCases.some((testCase) => testCase.expected?.decision === "activate_named_operation"),
        continuation: pairedCases.some((testCase) => testCase.expected?.decision === "activate_continuation"),
      };
      for (const value of pair.coverage) {
        if (!coverageMatches[value]) failures.push(failure("COMPOSED_PROFILE_COVERAGE", `pair ${pair.id} does not substantiate ${value} coverage`));
      }
    }
    for (const value of requiredComposedCoverage) {
      if (!coverage.has(value)) failures.push(failure("COMPOSED_PROFILE_COVERAGE", `missing composed-profile ${value} coverage`));
    }
    const composedCases = cases.filter((testCase) => testCase.composed_profile);
    if (composedCases.some((testCase) => !pairIds.has(testCase.pair?.id))) {
      failures.push(failure("COMPOSED_PROFILE_COVERAGE", "every composed-profile case must belong to a required composed pair"));
    }
    if (!composedCases.some((testCase) => testCase.expected.selected_skill === "none"
        && testCase.composed_profile.instruction_skill !== testCase.expected.selected_skill)) {
      failures.push(failure("COMPOSED_PROFILE_INDEPENDENCE", "corpus must prove instruction_skill is independent from expected.selected_skill"));
    }
  }
  if (!cases.some((testCase) => testCase.expected.selected_skill === "none")) failures.push(failure("NO_SKILL_COVERAGE", "corpus must support selected_skill none"));
  for (const origin of SELECTION_ORIGINS) if (!cases.some((testCase) => testCase.selection_origin === origin)) failures.push(failure("ORIGIN_COVERAGE", `missing selection origin ${origin}`));
  for (const provenance of INVOCATION_PROVENANCE) if (!cases.some((testCase) => testCase.invocation_provenance === provenance)) failures.push(failure("PROVENANCE_COVERAGE", `missing invocation provenance ${provenance}`));

  let actualFingerprint = null;
  try {
    actualFingerprint = computeRequestActivationSourceFingerprint(repoRoot, manifest.source_fingerprint?.sources);
    if (manifest.source_fingerprint?.value !== actualFingerprint) failures.push(failure("SOURCE_FINGERPRINT", "manifest source fingerprint does not match current canonical owners"));
  } catch (error) {
    failures.push(failure("SOURCE_FINGERPRINT", error.message));
  }

  return {
    schema_version: 1,
    corpus_version: manifest.corpus_version,
    policy_version: manifest.policy_version,
    evidence_kind: "deterministic_corpus_validation",
    evidence_boundary: manifest.evidence_boundary,
    source_fingerprint: actualFingerprint,
    cases: cases.length,
    locales: [...new Set(cases.map(({ locale }) => locale))].sort(),
    selected_skill_none_cases: cases.filter((testCase) => testCase.expected.selected_skill === "none").length,
    composed_profile_cases: cases.filter((testCase) => testCase.composed_profile).length,
    profile_surfaces: Object.keys(manifest.composed_profile?.profiles ?? {}).sort(),
    status: failures.length === 0 ? "pass" : "block",
    failures,
  };
}

export function gradeRequestActivationObservation(testCase, observation) {
  const expected = testCase.expected;
  const failures = [];
  for (const key of ["requested_effect", "invocation_provenance", "selection_origin"]) {
    if (observation[key] !== testCase[key]) failures.push(failure("BEHAVIOR_MISMATCH", `${key} differs from the case contract`, testCase.case_id));
  }
  for (const key of ["request_class", "decision", "operation_id", "selected_skill", "visible_agdf", "authorizes", "persist"]) {
    if (observation[key] !== expected[key]) failures.push(failure("BEHAVIOR_MISMATCH", `${key} differs from expected`, testCase.case_id));
  }
  const callbacks = observation.predicted_callbacks;
  if (!Array.isArray(callbacks)) {
    failures.push(failure("CALLBACK_SCHEMA", "behavioral result must provide predicted_callbacks as an array", testCase.case_id));
  } else {
    const vocabulary = new Set([...expected.allowed_callbacks, ...expected.forbidden_callbacks]);
    if (callbacks.some((name) => typeof name !== "string" || !vocabulary.has(name))) {
      failures.push(failure("CALLBACK_SCHEMA", "behavioral result predicts an unknown callback", testCase.case_id));
    }
    if (new Set(callbacks).size !== callbacks.length) {
      failures.push(failure("CALLBACK_SCHEMA", "behavioral result predicts duplicate callbacks", testCase.case_id));
    }
    if (callbacks.some((name) => expected.forbidden_callbacks.includes(name))) {
      failures.push(failure("CALLBACK_POLICY", "behavioral result predicts a forbidden callback", testCase.case_id));
    }
    if (callbacks.length !== expected.callback_order.length
        || expected.callback_order.some((name, index) => callbacks[index] !== name)) {
      failures.push(failure("CALLBACK_ORDER", "behavioral result must match the exact expected callback sequence", testCase.case_id));
    }
  }
  return { case_id: testCase.case_id, status: failures.length === 0 ? "pass" : "block", failures };
}
