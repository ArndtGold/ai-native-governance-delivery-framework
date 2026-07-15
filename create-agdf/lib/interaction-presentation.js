const REQUIRED_GATES = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
const ARTEFACT_ORDER = ["UR", "PRD", "SD", "TP"];
const OUTCOMES = new Set(["approve", "revise", "decline", "cancel", "no_response", "timeout", "empty", "invalid", "stale"]);
const ATTEMPT_OUTCOMES = new Set(["presented", "unavailable_before_invocation", "attempted_not_applied", "unsafe_to_wait"]);

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
        : key.includes("Description") || key.startsWith("primary.actions.") || key.startsWith("primary.afterApproval.") || key === "primary.quality"
          ? budgets.description
          : budgets.label;
      if (Number.isInteger(budget) && value.length > budget) errors.push(`length_budget:${locale}:${key}`);
    }
    for (const key of REQUIRED_GATES) {
      if (typeof pack.gateTitles?.[key] !== "string" || !pack.gateTitles[key].trim()) errors.push(`missing_gate_title:${locale}:${key}`);
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

export const interactionPresentationConstants = Object.freeze({
  artefactOrder: Object.freeze([...ARTEFACT_ORDER]),
  outcomes: Object.freeze([...OUTCOMES]),
  attemptOutcomes: Object.freeze([...ATTEMPT_OUTCOMES]),
});
