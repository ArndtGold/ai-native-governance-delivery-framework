const REQUIRED_GATES = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
const ARTEFACT_ORDER = ["UR", "PRD", "SD", "TP"];
const OUTCOMES = new Set(["approve", "revise", "decline", "cancel", "no_response", "timeout", "empty", "invalid", "stale"]);
const ATTEMPT_OUTCOMES = new Set(["presented", "unavailable_before_invocation", "attempted_not_applied", "unsafe_to_wait"]);
const APPROVAL_VALUE_TRANSPORTS = new Set(["exact_option_value", "separate_label_and_value", "decorated_label_only", "unknown"]);
const APPROVAL_SEQUENCE = Object.freeze(["run_status_card", "gate_transition_card", "approval_interaction"]);
const QUALITY_STATUS_RANK = { pass: 0, warn: 1, revise: 2, block: 3 };
const QUALITY_DIMENSIONS = Object.freeze([
  Object.freeze({ id: "plan_coverage", owner: "task-plan-review" }),
  Object.freeze({ id: "solution_integrity", owner: "clean-implementation-review" }),
  Object.freeze({ id: "code_quality", owner: "code-review" }),
  Object.freeze({ id: "qa_decision", owner: "qa-gate" }),
]);

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function flattenKeys(value, prefix = "") {
  const keys = [];
  for (const [key, child] of Object.entries(value ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (plainObject(child)) keys.push(...flattenKeys(child, path));
    else keys.push(path);
  }
  return keys.sort();
}

function visibleStrings(value, prefix = "") {
  const entries = [];
  for (const [key, child] of Object.entries(value ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (plainObject(child)) entries.push(...visibleStrings(child, path));
    else if (typeof child === "string") entries.push([path, child]);
  }
  return entries;
}

export function canonicalizeLanguageTag(value) {
  const raw = String(value ?? "").trim().replaceAll("_", "-").replace(/\.(.+)$/, "");
  if (!raw || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(raw)) return "";
  try {
    return Intl.getCanonicalLocales(raw)[0]?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

export function validateLocaleRegistry(registry) {
  const errors = [];
  if (!plainObject(registry) || registry.schemaVersion !== 1) errors.push("schema_version");
  const fallback = canonicalizeLanguageTag(registry?.fallbackLocale);
  const locales = registry?.locales;
  if (!fallback || !plainObject(locales) || !plainObject(locales[fallback])) errors.push("fallback_locale");
  const baseline = plainObject(locales?.[fallback]) ? flattenKeys(locales[fallback]) : [];
  const budgets = registry?.lengthBudgets ?? {};
  for (const [locale, pack] of Object.entries(locales ?? {})) {
    if (!canonicalizeLanguageTag(locale) || !plainObject(pack)) {
      errors.push(`invalid_locale:${locale}`);
      continue;
    }
    const keys = flattenKeys(pack);
    if (JSON.stringify(keys) !== JSON.stringify(baseline)) errors.push(`incomplete_locale:${locale}`);
    for (const [key, value] of visibleStrings(pack)) {
      if (!value.trim()) errors.push(`empty_copy:${locale}:${key}`);
      const budget = key.startsWith("gateTitles.") ? budgets.title
        : key.includes("Description") || key.includes("fallbackReasons") || key.startsWith("primary.actions.") || key.startsWith("primary.afterApproval.") || key.startsWith("primary.narration.") || key.startsWith("gateRationale.") || key.startsWith("interaction.why.") || key === "primary.quality"
          ? budgets.description
          : budgets.label;
      if (Number.isInteger(budget) && value.length > budget) errors.push(`length_budget:${locale}:${key}`);
    }
    for (const key of REQUIRED_GATES) {
      if (typeof pack.gateTitles?.[key] !== "string" || !pack.gateTitles[key].trim()) errors.push(`missing_gate_title:${locale}:${key}`);
      if (typeof pack.gateActionTitles?.[key] !== "string" || !pack.gateActionTitles[key].trim()) errors.push(`missing_gate_action_title:${locale}:${key}`);
    }
  }
  if (JSON.stringify(registry?.optionOrder) !== JSON.stringify(["approve", "revise", "decline", "cancel"])) errors.push("option_order");
  return { valid: errors.length === 0, errors };
}

export function resolvePresentationLocale(registry, requestedLocale) {
  const validation = validateLocaleRegistry(registry);
  if (!validation.valid) throw new Error(`Invalid AGDF interaction locale registry: ${validation.errors.join(",")}`);
  const fallback = canonicalizeLanguageTag(registry.fallbackLocale);
  const requested = canonicalizeLanguageTag(requestedLocale);
  if (requested && registry.locales[requested]) return requested;
  const language = requested.split("-")[0];
  if (language && registry.locales[language]) return language;
  return fallback;
}

export function localePack(registry, requestedLocale) {
  return registry.locales[resolvePresentationLocale(registry, requestedLocale)];
}

export function gateTitle(registry, requestedLocale, gate) {
  return localePack(registry, requestedLocale).gateTitles[gate] || String(gate || "");
}

export function gateRationale(registry, requestedLocale, gate) {
  return localePack(registry, requestedLocale).gateRationale?.[gate] || String(gate || "");
}

function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/^#+\s*/, "")
    .replace(/[`*_]/g, "")
    .trim();
}

function section(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`(?:^|\\n)## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`))?.[1]?.trim() ?? "";
}

export function normalizedRunTitle(runId) {
  const words = String(runId ?? "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return words ? words.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase()) : "AGDF run";
}

export function resolveHumanRunTitle({ currentArtefactHeading, urHeading, runContent, runId }) {
  const objective = section(String(runContent ?? ""), "Objective").split(/\r?\n/).map(stripMarkdown).find(Boolean) ?? "";
  return [currentArtefactHeading, urHeading, objective].map(stripMarkdown).find(Boolean) || normalizedRunTitle(runId);
}

function displaySafeTitle(value, fallback) {
  const title = stripMarkdown(value).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  return (title || fallback).slice(0, 100);
}

export function buildRunCandidates(runs) {
  return [...(runs ?? [])]
    .filter((run) => run?.valid && run?.meta?.lifecycle === "active" && typeof run.run_id === "string")
    .map((run) => {
      const currentGate = run.control_state?.current_gate || run.meta?.current_gate || "unknown";
      const title = resolveHumanRunTitle({
        currentArtefactHeading: run.current_artefact_heading,
        urHeading: run.ur_heading,
        runContent: "",
        runId: run.run_id,
      });
      return {
        run_id: run.run_id,
        display_title: displaySafeTitle(title, normalizedRunTitle(run.run_id)),
        current_gate: currentGate,
        next_allowed_action: String(run.control_state?.next_allowed_action ?? "").trim(),
        revision_id: String(run.meta?.revision_id ?? "").trim(),
      };
    })
    .sort((left, right) => left.display_title.localeCompare(right.display_title) || left.run_id.localeCompare(right.run_id));
}

export function normalizeReconciliationText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[._:/\\-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function reconcileRunScope({ requestText = "", scopeKey = "", runs = [] } = {}) {
  const requested = normalizeReconciliationText(scopeKey || requestText);
  if (!requested) return Object.freeze({ outcome: "match_uncertain", matches: [], reason: "scope_input_missing" });
  const matches = [...(runs ?? [])]
    .filter((run) => run?.valid && ["active", "completed"].includes(run?.meta?.lifecycle) && typeof run.run_id === "string")
    .filter((run) => {
      const keys = [run.scope_key, run.display_title, run.current_artefact_heading, run.ur_heading]
        .map(normalizeReconciliationText)
        .filter(Boolean);
      return keys.includes(requested);
    })
    .map((run) => Object.freeze({
      run_id: run.run_id,
      lifecycle: run.meta.lifecycle,
      display_title: displaySafeTitle(run.display_title || run.ur_heading || run.run_id, normalizedRunTitle(run.run_id)),
      current_gate: run.control_state?.current_gate || run.meta?.current_gate || "unknown",
    }))
    .sort((left, right) => left.run_id.localeCompare(right.run_id));
  if (matches.length !== 1) return Object.freeze({ outcome: matches.length ? "match_uncertain" : "no_match", matches, reason: matches.length > 1 ? "multiple_exact_matches" : "no_exact_match" });
  return Object.freeze({ outcome: matches[0].lifecycle === "active" ? "active_match" : "completed_match", matches, reason: "exact_match" });
}

export function evaluateNativeApprovalCapability({ staticCapability, runtimeCapability } = {}) {
  const staticValue = staticCapability?.approvalValueTransport;
  const runtimeValue = runtimeCapability?.approvalValueTransport;
  if (runtimeCapability && staticCapability && (runtimeValue !== staticValue || runtimeCapability.waitSafety !== staticCapability.waitSafety)) {
    return Object.freeze({ eligible: false, native_attempt_required: false, preflight_outcome: "unavailable_before_invocation", reason: "capability_conflict", evidence_source: "runtime" });
  }
  const capability = runtimeCapability ?? staticCapability;
  const evidenceSource = runtimeCapability ? "runtime" : staticCapability ? "static" : "none";
  if (!capability || !APPROVAL_VALUE_TRANSPORTS.has(capability.approvalValueTransport)) return Object.freeze({ eligible: false, native_attempt_required: false, preflight_outcome: "unavailable_before_invocation", reason: "capability_missing", evidence_source: evidenceSource });
  if (capability.waitSafety === "unsafe") return Object.freeze({ eligible: false, native_attempt_required: false, preflight_outcome: "unsafe_to_wait", reason: "unsafe_wait", evidence_source: evidenceSource });
  if (capability.waitSafety !== "deliberate_no_auto_resolution") return Object.freeze({ eligible: false, native_attempt_required: false, preflight_outcome: "unavailable_before_invocation", reason: "capability_missing", evidence_source: evidenceSource });
  if (!new Set(["exact_option_value", "separate_label_and_value"]).has(capability.approvalValueTransport)) return Object.freeze({ eligible: false, native_attempt_required: false, preflight_outcome: "unavailable_before_invocation", reason: capability.approvalValueTransport === "decorated_label_only" ? "decorated_only" : "capability_missing", evidence_source: evidenceSource });
  return Object.freeze({ eligible: true, native_attempt_required: true, preflight_outcome: "eligible_for_invocation", reason: capability.approvalValueTransport === "exact_option_value" ? "exact_transport" : "separate_value_transport", evidence_source: evidenceSource });
}

export function executeNativeApprovalAttempt({ ready = false, orientationSnapshot, capabilityPreflight, invokeNative, fallback } = {}) {
  if (!ready) return Object.freeze({ attempted: false, outcome: "unavailable_before_invocation", reason: "gate_not_ready", authorizes: false });
  const preflight = validateApprovalOrientationSnapshot(orientationSnapshot);
  if (!preflight.valid) return Object.freeze({ attempted: false, outcome: "unavailable_before_invocation", reason: "orientation_preflight_failed", authorizes: false });
  if (!capabilityPreflight?.eligible) {
    const outcome = capabilityPreflight?.preflight_outcome === "unsafe_to_wait" ? "unsafe_to_wait" : "unavailable_before_invocation";
    const reason = capabilityPreflight?.reason || "capability_missing";
    if (typeof fallback === "function") fallback({ outcome, reason });
    return Object.freeze({ attempted: false, outcome, reason, authorizes: false });
  }
  if (typeof invokeNative !== "function") return Object.freeze({ attempted: false, outcome: "unavailable_before_invocation", reason: "adapter_unavailable", authorizes: false });
  let adapterResult;
  try {
    adapterResult = invokeNative();
  } catch (error) {
    adapterResult = { outcome: "attempted_not_applied", reason: String(error?.message || "adapter_error") };
  }
  const outcome = ATTEMPT_OUTCOMES.has(adapterResult?.outcome)
    ? adapterResult.outcome
    : adapterResult?.presented === true || adapterResult?.applied === true
      ? "presented"
      : "attempted_not_applied";
  const reason = String(adapterResult?.reason || "").trim();
  if (outcome !== "presented" && typeof fallback === "function") fallback({ outcome, reason });
  return Object.freeze({ attempted: true, outcome, reason, authorizes: false });
}

export function buildInteractionAttempt({ interactionId, runId, currentGate, surface, attemptOutcome, expectedApproval, fallbackReason = "" }) {
  if (!ATTEMPT_OUTCOMES.has(attemptOutcome)) throw new Error("invalid interaction attempt outcome");
  if (!String(interactionId ?? "").trim() || !String(runId ?? "").trim() || !String(currentGate ?? "").trim())
    throw new Error("interaction attempt identity missing");
  return Object.freeze({
    interaction_id: String(interactionId), run_id: String(runId), current_gate: String(currentGate),
    surface: String(surface ?? "fallback"), attempt_outcome: attemptOutcome,
    expected_approval: String(expectedApproval ?? ""), fallback_reason: String(fallbackReason ?? ""),
    authorizes: false,
  });
}

function safeArtefactPath(value) {
  const path = String(value ?? "").replace(/^`|`$/g, "").trim();
  if (!path || !/^[A-Za-z0-9._/-]+$/.test(path) || /^([a-z]+:|\/)/i.test(path)) return "";
  const parts = path.replaceAll("\\", "/").split("/");
  if (parts.includes("..")) return "";
  return path;
}

export function buildArtefactRefs(artefacts, registry, requestedLocale, { pathExists } = {}) {
  const pack = localePack(registry, requestedLocale);
  return ARTEFACT_ORDER.map((type) => {
    const artefact = artefacts instanceof Map ? artefacts.get(type) : artefacts?.[type];
    const candidatePath = safeArtefactPath(artefact?.path);
    const path = candidatePath && (!pathExists || pathExists(candidatePath, type)) ? candidatePath : "";
    return {
      type,
      exists: Boolean(path),
      status: String(artefact?.status ?? ""),
      path,
      label: type,
      missingLabel: `${type} (${pack.artefacts.notYetCreated})`,
    };
  });
}

export function formatArtefactRefs(refs) {
  return refs.map((ref) => ref.exists ? `[${ref.label}](${ref.path})` : ref.missingLabel).join(" · ");
}

export function gateOptions(registry, requestedLocale, gate, { includeCancel = false } = {}) {
  const pack = localePack(registry, requestedLocale);
  const options = [
    { outcome: "approve", label: `Approval: ${gate}`, description: pack.interaction.approveDescription, value: `Approval: ${gate}`, authorizes: true },
    { outcome: "revise", label: pack.interaction.reviseLabel, description: pack.interaction.reviseDescription, value: "revise", authorizes: false },
    { outcome: "decline", label: pack.interaction.declineLabel, description: pack.interaction.declineDescription, value: "decline", authorizes: false },
  ];
  if (includeCancel) options.push({ outcome: "cancel", label: pack.interaction.cancelLabel, description: pack.interaction.cancelDescription, value: "cancel", authorizes: false });
  return options;
}

export function normalizeInteractionOutcome(value, { expectedApproval, stale = false, timedOut = false, noResponse = false } = {}) {
  if (stale) return "stale";
  if (timedOut) return "timeout";
  if (noResponse || value === undefined || value === null) return "no_response";
  if (typeof value !== "string") return "invalid";
  const normalized = value.trim();
  if (!normalized) return "empty";
  if (normalized === expectedApproval) return "approve";
  if (OUTCOMES.has(normalized) && normalized !== "approve") return normalized;
  return "invalid";
}

export function buildApprovalOrientationSnapshot({
  ready = false,
  statusCard,
  humanPresentation,
  revisionId = "",
  registry,
  requestedLocale,
} = {}) {
  if (!ready || !plainObject(statusCard) || !plainObject(humanPresentation)) return null;
  const gate = String(statusCard.current_gate ?? "").trim();
  const runId = String(statusCard.run_id ?? "").trim();
  const expectedApproval = `Approval: ${gate}`;
  if (!REQUIRED_GATES.includes(gate) || !runId || statusCard.status !== "open" || statusCard.missing_approval !== expectedApproval) return null;

  const locale = resolvePresentationLocale(registry, requestedLocale);
  const pack = localePack(registry, locale);
  const runTitle = String(humanPresentation.runTitle ?? "").trim() || normalizedRunTitle(runId);
  const currentGateTitle = String(humanPresentation.gateTitle ?? "").trim() || gateTitle(registry, locale, gate);
  const primaryHeading = String(pack.gateActionTitles?.[gate] ?? "").trim();
  const artefactRefs = Object.freeze([...(humanPresentation.artefactRefs ?? [])].map((ref) => Object.freeze({ ...ref })));
  const statusFields = Object.freeze([
    Object.freeze({ id: "selected_run", label: pack.statusCard.run, value: `${runTitle} · ${runId}` }),
    Object.freeze({ id: "readiness_status", label: pack.statusCard.title, value: pack.interaction.ready }),
    Object.freeze({ id: "current_gate", label: pack.statusCard.gate, value: `${gate} — ${currentGateTitle}` }),
    Object.freeze({ id: "missing_approval", label: pack.statusCard.missing, value: expectedApproval }),
    Object.freeze({ id: "next_action", label: pack.statusCard.step, value: pack.primary.actions[gate] ?? String(statusCard.next_step ?? "") }),
    Object.freeze({ id: "quality_outlook", label: pack.statusCard.quality, value: pack.primary.quality }),
  ]);
  const options = Object.freeze(gateOptions(registry, locale, gate).map((option) => Object.freeze({ ...option })));

  return Object.freeze({
    schema_version: "1",
    run_id: runId,
    revision_id: String(revisionId ?? "").trim(),
    current_gate: gate,
    presentation_language: locale,
    sequence: APPROVAL_SEQUENCE,
    compact_status_card: Object.freeze({
      semantic_block: "run_status_card",
      title: primaryHeading,
      primary_heading: primaryHeading,
      primary_heading_level: 2,
      fields: statusFields,
    }),
    gate_transition_card: Object.freeze({
      semantic_block: "gate_transition_card",
      title: `${currentGateTitle} · ${runTitle} · ${runId}`,
      artefact_refs: artefactRefs,
      ready: pack.interaction.ready,
      approve_heading: pack.interaction.approveHeading,
      exact_approval: expectedApproval,
      approval_effect: pack.primary.afterApproval[gate] ?? pack.primary.actions[gate] ?? "",
      next_heading: pack.interaction.nextHeading,
      next_gate: String(statusCard.next_gate_after_approval ?? "none"),
    }),
    approval_interaction: Object.freeze({ semantic_block: "approval_interaction", expected_approval: expectedApproval, options, authorizes: false }),
    authorizes: false,
  });
}

export function validateApprovalOrientationSnapshot(snapshot) {
  const errors = [];
  if (!plainObject(snapshot)) return Object.freeze({ valid: false, errors: Object.freeze(["snapshot_missing"]) });
  if (JSON.stringify(snapshot.sequence) !== JSON.stringify(APPROVAL_SEQUENCE)) errors.push("sequence");
  if (snapshot.compact_status_card?.semantic_block !== "run_status_card") errors.push("run_status_card");
  if (snapshot.gate_transition_card?.semantic_block !== "gate_transition_card") errors.push("gate_transition_card");
  if (snapshot.approval_interaction?.semantic_block !== "approval_interaction") errors.push("approval_interaction");
  const heading = String(snapshot.compact_status_card?.primary_heading ?? "").trim();
  if (!heading || snapshot.compact_status_card?.primary_heading_level !== 2) errors.push("primary_heading");
  if (String(snapshot.compact_status_card?.title ?? "").trim() !== heading) errors.push("primary_heading_owner");
  if (/^(?:(?:agdf[- ]?status(?: card|karte)?|run status card|gate transition card)(?:\b|\s*[-:—·])|(?:UR|PRD|SD|TP|QA|UAT)(?:\s*[-:—·]|$))/i.test(heading)) errors.push("generic_primary_heading");
  const fieldIds = snapshot.compact_status_card?.fields?.map((field) => field?.id);
  if (JSON.stringify(fieldIds) !== JSON.stringify(["selected_run", "readiness_status", "current_gate", "missing_approval", "next_action", "quality_outlook"])) errors.push("status_fields");
  const expectedApproval = `Approval: ${String(snapshot.current_gate ?? "").trim()}`;
  if (!REQUIRED_GATES.includes(snapshot.current_gate)
    || snapshot.gate_transition_card?.exact_approval !== expectedApproval
    || snapshot.approval_interaction?.expected_approval !== expectedApproval
    || snapshot.approval_interaction?.options?.[0]?.value !== expectedApproval) errors.push("canonical_approval");
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function attachApprovalOrientationSnapshot(statusCard, options = {}) {
  if (!plainObject(statusCard)) throw new Error("approval orientation status card missing");
  const snapshot = buildApprovalOrientationSnapshot({ ...options, statusCard });
  Object.defineProperty(statusCard, "approvalOrientation", {
    value: snapshot,
    enumerable: false,
  });
  return snapshot;
}

function qualityStatus(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Object.hasOwn(QUALITY_STATUS_RANK, normalized) ? normalized : "unknown";
}

export function buildQualityReadiness({
  planCoverage,
  solutionIntegrity,
  codeQuality,
  qaDecision,
  decisiveReason = "",
  nextAction = "",
} = {}) {
  const values = [planCoverage, solutionIntegrity, codeQuality, qaDecision];
  const rows = QUALITY_DIMENSIONS.map((dimension, index) => Object.freeze({
    ...dimension,
    status: qualityStatus(values[index]),
  }));
  const known = rows.filter((row) => row.status !== "unknown");
  if (known.length === 0) return null;
  const status = rows.some((row) => row.status === "unknown")
    ? "revise"
    : known.reduce((current, row) =>
      QUALITY_STATUS_RANK[row.status] > QUALITY_STATUS_RANK[current] ? row.status : current,
    "pass");
  const decisiveRow = rows.find((row) => row.status === status && status !== "pass")
    ?? rows.find((row) => row.id === "qa_decision")
    ?? rows[0];
  return Object.freeze({
    status,
    rows: Object.freeze(rows),
    decisive_reason: String(decisiveReason ?? "").trim(),
    decisive_dimension: decisiveRow.id,
    next_action: String(nextAction ?? "").trim(),
    decision_owner: "qa-gate",
    authorizes: false,
  });
}

export function collapseInternalState(
  { modeSliceDecision = "", verifiedChangeState = "", contextGraphRequiredAction = "", multiScopeState = "" } = {},
  registry,
  requestedLocale,
) {
  const pack = localePack(registry, requestedLocale);
  const labels = pack.internalStateLabels || {};
  const result = {};
  if (modeSliceDecision === "verified_change") {
    if (verifiedChangeState === "escalated") {
      result.verified_change = labels.verifiedChangeEscalated || "Escalated to structured delivery";
    } else if (["missing", "draft", "invalid", "eligible", "executed"].includes(verifiedChangeState)) {
      result.verified_change = labels.verifiedChange || "Compact change under review";
    }
  }
  if (contextGraphRequiredAction === "open_gap") {
    result.context_graph = labels.contextGraphOpenGap || "Graph gap open";
  } else if (["link", "update", "create", "resolve_drift"].includes(contextGraphRequiredAction)) {
    result.context_graph = labels.contextGraphMaintained || "Project memory maintained";
  }
  if (multiScopeState === "blocked") {
    result.multi_scope = labels.multiScopeBlocked || "Ambiguous scope, clarification needed";
  }
  return result;
}

export function buildBreadcrumb(breadcrumb, registry, requestedLocale) {
  if (!Array.isArray(breadcrumb)) return "";
  const pack = localePack(registry, requestedLocale);
  const cardLabels = pack.statusCard || {};
  const titles = pack.gateTitles || {};
  const sep = cardLabels.breadcrumbSeparator || " \u00b7 ";
  const symbols = {
    fulfilled: cardLabels.breadcrumbFulfilled || "\u2713",
    current: cardLabels.breadcrumbCurrent || "\u25cf",
    open: cardLabels.breadcrumbOpen || "\u25cb",
  };
  return breadcrumb
    .map((entry) => {
      const title = titles[entry.gate] || entry.gate;
      const symbol = symbols[entry.status] || symbols.open;
      return `${title} ${symbol}`;
    })
    .join(sep);
}

export function buildTransitionNarration(gate, registry, requestedLocale) {
  const pack = localePack(registry, requestedLocale);
  const narration = pack.primary?.narration || {};
  const gateTitles = pack.gateTitles || {};
  const gateTitle = gateTitles[gate] || gate;
  const gateConfig = narration.gates?.[gate] || {};
  const agentNext = gateConfig.agentNext || "";
  const userAction = gateConfig.userAction || narration.noAction || "no user action required now";
  if (!agentNext) return "";
  const gateSatisfiedTemplate = narration.gateSatisfied || "{gate} approved";
  const gateSatisfied = gateSatisfiedTemplate.replace("{gate}", gateTitle);
  return `${gateSatisfied} \u2192 ${agentNext} \u2192 ${userAction}`;
}

export const interactionPresentationConstants = Object.freeze({
  artefactOrder: Object.freeze([...ARTEFACT_ORDER]),
  outcomes: Object.freeze([...OUTCOMES]),
  attemptOutcomes: Object.freeze([...ATTEMPT_OUTCOMES]),
  approvalSequence: APPROVAL_SEQUENCE,
  qualityDimensions: QUALITY_DIMENSIONS,
});
