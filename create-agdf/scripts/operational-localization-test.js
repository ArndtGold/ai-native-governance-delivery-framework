import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { transitionDecisionForRunState } from "../lib/control-evaluation/gate-policy.js";
import { createRun, recordRunRevision } from "../lib/control-state/index.js";
import { isOperationalValueRenderable, renderOperationalStatusCard } from "../lib/interaction-presentation.js";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";

const packageRoot = join(import.meta.dirname, "..");
const repositoryRoot = join(packageRoot, "..");
const registry = JSON.parse(readFileSync(join(repositoryRoot, "plugins", "agdf", "meta", "agdf-interaction-locales.json"), "utf8"));
const locales = Object.keys(registry.locales);
const unrenderable = (value) => locales.filter((locale) => !isOperationalValueRenderable(value, { registry, requestedLocale: locale }));

// Every gate-policy state, including the per-gate template variants, renders in every locale.
{
  const state = ({ approvals = [], rows = {}, decision, lifecycle = "active", currentGate = "" } = {}) => ({
    content: `- lifecycle: ${lifecycle}\n`,
    current_gate: currentGate,
    approvals: new Map(approvals.map((gate) => [gate, { status: "approved", evidence: "" }])),
    artefacts: new Map(Object.entries(rows).map(([type, status]) => [type, { path: `${type}.md`, status }])),
    mode_slice_decision: decision ? { decision, scope_reason: "fixture", evidence: "fixture" } : {},
  });
  const reviewed = { UR: "approved", "Brownfield Review": "done" };
  const planned = { ...reviewed, PRD: "approved", SD: "approved", TP: "approved" };
  const built = { ...planned, "Brownfield Analysis": "done", "CD+Tests": "done", CR: "done" };
  const through = ["UR", "PRD", "SD", "TP"];
  const cases = [
    [state()],
    [state({ approvals: ["UR"] })],
    [state({ approvals: ["UR"], rows: { UR: "approved" } })],
    [state({ approvals: ["UR"], rows: reviewed })],
    [state({ approvals: ["UR"], rows: reviewed, decision: "block" })],
    [state({ approvals: ["UR"], rows: reviewed, decision: "quick_task" })],
    [state({ approvals: ["UR"], rows: { ...reviewed, OR: "done" }, decision: "quick_task", lifecycle: "completed", currentGate: "OR" })],
    // An escalated record with an unsupported target also carries a doctor finding, whose step wins.
    ...["executed", "escalated", "eligible", "missing", "draft", "invalid"].flatMap((status) => ["structured_slice", "structured_delivery", "none"]
      .filter((target) => status !== "escalated" || target !== "none")
      .map((target) => [state({ approvals: ["UR"], rows: reviewed, decision: "verified_change" }), { status, escalation_target: target }])),
    [state({ approvals: ["UR"], rows: reviewed, decision: "structured_slice" })],
    [state({ approvals: ["UR"], rows: reviewed, decision: "structured_delivery" })],
    [state({ approvals: ["UR", "PRD"], rows: reviewed, decision: "structured_delivery" })],
    [state({ approvals: ["UR", "PRD"], rows: { ...reviewed, PRD: "approved" }, decision: "structured_delivery" })],
    [state({ approvals: ["UR", "PRD", "SD"], rows: { ...reviewed, PRD: "approved" }, decision: "structured_delivery" })],
    [state({ approvals: ["UR", "PRD", "SD"], rows: { ...reviewed, PRD: "approved", SD: "approved" }, decision: "structured_delivery" })],
    [state({ approvals: through, rows: { ...reviewed, PRD: "approved", SD: "approved" }, decision: "structured_delivery" })],
    [state({ approvals: through, rows: planned, decision: "structured_delivery" })],
    [state({ approvals: through, rows: { ...planned, "Brownfield Analysis": "done" }, decision: "structured_delivery" })],
    [state({ approvals: through, rows: { ...planned, "Brownfield Analysis": "done", "CD+Tests": "done" }, decision: "structured_delivery" })],
    [state({ approvals: through, rows: built, decision: "structured_delivery" })],
    [state({ approvals: through, rows: { ...built, QA: "revise" }, decision: "structured_delivery" })],
    [state({ approvals: through, rows: { ...built, QA: "block" }, decision: "structured_delivery" })],
    [state({ approvals: [...through, "QA"], rows: { ...built, QA: "draft" }, decision: "structured_delivery" })],
    [state({ approvals: [...through, "QA"], rows: { ...built, QA: "pass" }, decision: "structured_delivery" })],
    [state({ approvals: [...through, "QA", "UAT"], rows: { ...built, QA: "pass" }, decision: "structured_delivery" })],
  ];
  const reached = new Set();
  for (const [runState, verifiedChange = null] of cases) {
    const decision = transitionDecisionForRunState(runState, verifiedChange);
    reached.add(decision.blocking_reason === "none" ? decision.current_gate : decision.blocking_reason);
    for (const value of [...decision.allowed, ...decision.forbidden, decision.next_allowed_action]) {
      assert.deepEqual(unrenderable(value), [], `gate-policy value must render in every locale: ${value}`);
    }
    for (const locale of locales) {
      const rendered = renderOperationalStatusCard({
        run_id: "locale-matrix-run",
        presentation_language: locale,
        status: decision.status,
        current_gate: decision.current_gate,
        allowed_now: decision.allowed,
        forbidden_now: decision.forbidden,
        blocking_condition: decision.blocking_reason || "none",
        missing_approval: decision.missing_approval || "none",
        next_gate_after_approval: "none",
        allowed_after_approval: "none",
        next_step: decision.next_allowed_action,
        quality_outlook: registry.locales.en.operationalValues.noAdditionalQualityFollowUp,
        interaction_kind: "status",
      }, { registry, requestedLocale: locale, humanPresentation: {} });
      assert.ok(rendered, `${locale} status card renders for gate ${decision.current_gate}`);
      assert.ok(rendered.markdown.includes(registry.locales[locale].statusCard.title), `${locale} status card uses the localized title`);
      assert.ok(rendered.markdown.includes(registry.locales[locale].statusCard.gate), `${locale} status card uses the localized gate label`);
    }
  }
  for (const expected of ["UR", "Brownfield Review", "Mode/Slice Decision", "Quick Task Execution", "OR", "PRD", "SD", "TP",
    "Brownfield Analysis", "CD+Tests", "CR", "QA", "UAT", "mode_slice_decision_blocked", "qa_blocked", "qa_revise_required",
    "verified_change_escalated", "verified_change_invalid", "verified_change_record_required",
    ...["ur", "prd", "sd", "tp", "qa"].map((gate) => `missing_durable_${gate}_artefact`)]) {
    assert.ok(reached.has(expected), `the policy matrix must reach ${expected}`);
  }
}

// Every fixed operational string in the control evaluators is registered; each template string has at
// least one registered variant.
{
  const { parse } = createRequire(join(repositoryRoot, "package.json"))("acorn");
  const cardKeys = new Set(["allowed", "forbidden", "next_allowed_action", "next_step", "allowed_after_approval", "quality_outlook"]);
  const registered = Object.values(registry.locales[registry.fallbackLocale].operationalValues);
  const literals = new Set();
  const templates = new Set();
  const collect = (node) => {
    if (!node) return;
    if (node.type === "Literal" && typeof node.value === "string") literals.add(node.value);
    else if (node.type === "TemplateLiteral") templates.add(node.quasis.map((quasi) => quasi.value.cooked));
    else if (node.type === "ArrayExpression") node.elements.forEach(collect);
    else if (node.type === "ConditionalExpression") { collect(node.consequent); collect(node.alternate); }
    else if (node.type === "LogicalExpression") collect(node.right);
  };
  const walk = (node, file) => {
    if (!node || typeof node.type !== "string") return;
    if (node.type === "Property" && cardKeys.has(node.key?.name ?? node.key?.value)) collect(node.value);
    if (node.type === "AssignmentExpression" && ["nextAllowedAction", "nextStepFallback", "allowed", "forbidden"].includes(node.left?.name)) collect(node.right);
    if (node.type === "VariableDeclarator" && node.id?.name === "FINDING_RECOVERY_STEP") collect(node.init);
    if (node.type === "CallExpression") {
      const callee = node.callee?.name;
      if (callee === "addFinding") collect(node.arguments[5]);
      if (callee === "add" && file === "verified-change.js") collect(node.arguments[2]);
      if (callee === "warning" && file === "parent-reconciliation.js") collect(node.arguments[3]);
    }
    if (node.type === "FunctionDeclaration" && node.id?.name === "deriveQualityOutlook") {
      const returns = (child) => {
        if (!child || typeof child.type !== "string") return;
        if (child.type === "ReturnStatement") collect(child.argument);
        for (const value of Object.values(child)) {
          if (Array.isArray(value)) value.forEach(returns);
          else if (value && typeof value.type === "string") returns(value);
        }
      };
      returns(node.body);
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach((child) => walk(child, file));
      else if (value && typeof value.type === "string") walk(value, file);
    }
  };
  const evaluators = join(packageRoot, "lib", "control-evaluation");
  for (const file of readdirSync(evaluators).filter((name) => name.endsWith(".js"))) {
    walk(parse(readFileSync(join(evaluators, file), "utf8"), { ecmaVersion: "latest", sourceType: "module" }), file);
  }
  const fixed = [...literals].filter((value) => value && value !== "none");
  assert.ok(fixed.length > 150 && templates.size >= 6, "the operational string scan must keep finding the evaluator strings");
  for (const value of fixed) assert.deepEqual(unrenderable(value), [], `operational value must be registered in every locale: ${value}`);
  for (const parts of templates) {
    const pattern = new RegExp(`^${parts.map((part) => part.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")).join(".+")}$`, "u");
    assert.ok(registered.some((value) => pattern.test(value)), `template operational value needs registered variants: ${parts.join("${…}")}`);
  }
}

// Free text from the run state or from a finding never breaks a localized card; English keeps the text.
{
  const root = mkdtempSync(join(tmpdir(), "agdf-operational-localization-"));
  try {
    initializeCanonicalControl(root, generatedFilesForTarget("init", root, false, "de"));
    const statePath = createRun(root, "loc");
    mkdirSync(join(root, ".agdf", "control", "artefacts", "loc"), { recursive: true });
    writeFileSync(join(root, ".agdf", "control", "artefacts", "loc", "UR.md"), "# UR: Localization\n");
    const freeStep = "Frei formulierter nächster Schritt des Agenten.";
    const edited = readFileSync(statePath, "utf8")
      .replace("| UR |  | missing |  |", "| UR | `.agdf/control/artefacts/loc/UR.md` | draft |  |")
      .replace(/^- next_allowed_action:.*$/mu, `- next_allowed_action: ${freeStep}`)
      .replace(/^- quality_outlook:.*$/mu, "- quality_outlook: Freier Qualitätsausblick des Agenten.");
    writeFileSync(statePath, edited);
    const revision = () => readFileSync(statePath, "utf8").match(/^- revision_id: (.+)$/mu)[1];
    assert.equal(recordRunRevision(root, { runId: "loc", revisionId: revision() }).outcome, "updated");
    const german = evaluateGateCheck(root, { runId: "loc", presentationLanguage: "de" });
    const germanCard = german.status_presentation?.markdown ?? "";
    assert.equal(german.next_allowed_action, freeStep, "the machine report keeps the run-state next action");
    assert.ok(germanCard, `the German card renders despite free text: ${JSON.stringify(german.presentation_diagnostics)}`);
    assert.ok(!germanCard.includes(freeStep)
      && germanCard.includes(registry.locales.de.statusCard.userDecision)
      && germanCard.includes(registry.locales.de.statusCard.agentAllowed),
    "the German approval card separates the user's decision from the agent's allowed work");
    assert.ok(!germanCard.includes("Freier Qualitätsausblick"), "the German card derives the quality outlook instead of free text");
    const english = evaluateGateCheck(root, { runId: "loc", presentationLanguage: "en" });
    assert.ok(english.status_presentation?.markdown.includes(registry.locales.en.statusCard.userDecision)
      && english.status_presentation?.markdown.includes(registry.locales.en.statusCard.agentAllowed),
    "the English approval card separates the user's decision from the agent's allowed work");

    writeFileSync(statePath, readFileSync(statePath, "utf8").replace("## Evidence", "## Risks\n\n| Risk | Impact | Mitigation or owner |\n|---|---|---|\n| Fixture risk | block | Freie Minderung durch den Agenten. |\n\n## Evidence"));
    assert.equal(recordRunRevision(root, { runId: "loc", revisionId: revision() }).outcome, "updated");
    const blocked = evaluateGateCheck(root, { runId: "loc", presentationLanguage: "de" });
    assert.equal(blocked.blocking_reason, "AGDF_RISK_DECLARED");
    assert.ok(blocked.status_presentation?.markdown.includes(registry.locales.de.operationalValues.unknownRunAction),
      `an unknown selected-run action asks a localized focused clarification instead of substituting another action: ${JSON.stringify({ diagnostics: blocked.presentation_diagnostics, status_card: blocked.status_card, status_presentation: blocked.status_presentation })}`);
    assert.equal(blocked.status_card.user_action_required, "yes", "an unknown next action correctly asks the user to clarify");
    assert.equal(blocked.status_card.internal_next_step, "none", "the agent does not claim it can proceed while clarification is required");
    assert.ok(blocked.status_presentation.markdown.includes(registry.locales.de.statusCard.userTurn), "the card labels the clarification as the user's turn");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

console.log("operational localization tests passed");
