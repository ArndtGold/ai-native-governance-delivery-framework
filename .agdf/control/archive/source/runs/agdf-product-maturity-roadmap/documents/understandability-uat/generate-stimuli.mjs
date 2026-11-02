import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildApprovalOrientationSnapshot,
  buildArtefactRefs,
  renderApprovalOrientationSnapshot,
  renderOperationalStatusCard,
  renderScopeClassificationCard,
  renderTaskTargetOrientation,
} from "../../../../../create-agdf/lib/interaction-presentation.js";
import { printGeneralStatus } from "../../../../../create-agdf/lib/lifecycle/presentation.js";

const packageDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(packageDir, "../../../../..");
const stimulusDir = join(packageDir, "stimuli");
const recordDir = join(packageDir, "records");
const registryPath = join(repositoryRoot, "plugin/meta/agdf-interaction-locales.json");
const rendererPath = join(repositoryRoot, "create-agdf/lib/interaction-presentation.js");
const lifecycleRendererPath = join(repositoryRoot, "create-agdf/lib/lifecycle/presentation.js");
const manifestPath = join(packageDir, "STIMULUS_MANIFEST.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));

const FREEZE_ID = "pmr6-understandability-v1-20260827";
const RANDOMIZATION_SEED = "pmr6-v1-independent-participants";
const replacePreExposure = process.argv.includes("--replace-pre-exposure");
if (existsSync(manifestPath)) {
  const existingManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (existingManifest.status !== "frozen_not_exposed") {
    throw new Error("Refusing to replace a stimulus package after exposure.");
  }
  if (!replacePreExposure) {
    throw new Error("Stimulus package is already frozen. Use verify-stimuli.mjs; replacement requires --replace-pre-exposure before any exposure.");
  }
}
const questions = [
  "Was ist das primäre Ziel oder Arbeitsobjekt?",
  "Was ist der aktuelle Status oder Delivery Zustand?",
  "Was ist die eine nächste Aktion?",
  "Was autorisiert dieser Zustand und was autorisiert er nicht?",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function statusStimulus({ runId, runTitle, status, gate, gateTitle, mode, breadcrumb, allowed, forbidden, blocking, nextStep, quality }) {
  const presentation = renderOperationalStatusCard({
    run_id: runId,
    presentation_language: "de",
    mode,
    status,
    current_gate: gate,
    mode_slice_decision: mode,
    breadcrumb,
    delivery_state: "active",
    allowed_now: allowed,
    forbidden_now: forbidden,
    blocking_condition: blocking,
    missing_approval: "none",
    next_gate_after_approval: "none",
    allowed_after_approval: "none",
    user_visible_outcome_after_approval: "none",
    internal_next_step: nextStep,
    next_user_gate: "none",
    user_action_required: "no",
    evidence: [],
    next_skill: "none",
    next_step: nextStep,
    quality_outlook: quality,
  }, {
    registry,
    revisionId: `${FREEZE_ID}-${runId}`,
    humanPresentation: { runTitle, gateTitle, artefactRefs: [] },
  });
  if (!presentation) throw new Error(`Could not render status stimulus ${runId}`);
  return presentation.markdown;
}

const quickCard = renderScopeClassificationCard({
  outcome: "ungated",
  mode: "quick_task",
  trivial_boundary: "inside",
  ur_trigger_evaluation: "Keine neue Produktsemantik, keine funktionale Änderung und keine Änderung sichtbaren Verhaltens.",
  allowed_summary: "Die benannte Dokumentationsstelle prüfen und die begrenzte Korrektur ausführen.",
  forbidden_summary: "Keine Produktlogik ändern, keinen Run eröffnen und keine Release Freigabe ableiten.",
  escalation_triggers: ["Produktsemantik wird berührt", "Das tatsächliche Änderungsziel bleibt unklar"],
  challenge_path: "Bei begründetem Widerspruch zur UR Klärung wechseln.",
}, { registry, requestedLocale: "de" });
if (!quickCard) throw new Error("Could not render Quick Task stimulus");
const quickTarget = renderTaskTargetOrientation({
  resolution_state: "resolved",
  reason_code: "explicit_target",
  primary_target: "/projects/product-docs/README.md",
  governance_target: "/projects/product-docs",
  evidence_sources: ["/projects/product-docs/docs/style-guide.md"],
  working_directory: "/projects/product-docs",
  target_changed: false,
  next_action: "",
}, { registry, requestedLocale: "de" });
if (!quickTarget) throw new Error("Could not render Quick Task target stimulus");

const compactCard = statusStimulus({
  runId: "bounded-owner-copy-correction",
  runTitle: "Begrenzte Korrektur beim bestehenden Dokumentationsowner",
  status: "open",
  gate: "Quick Task Execution",
  gateTitle: "Compact Delivery",
  mode: "quick_task",
  breadcrumb: [{ gate: "UR", status: "fulfilled" }, { gate: "Quick Task", status: "current" }],
  allowed: ["Nur die benannte Dokumentationsstelle ändern", "Die deklarierte Validierung ausführen"],
  forbidden: ["Produktverhalten oder weitere Owner ändern", "Bei Scope Wachstum ohne Eskalation fortfahren"],
  blocking: "none",
  nextStep: "Die begrenzte Änderung ausführen und danach die deklarierte Validierung dokumentieren.",
  quality: "Bei neuer Produktsemantik oder weiterem Owner zur strukturierten Delivery eskalieren.",
});
const compactTarget = renderTaskTargetOrientation({
  resolution_state: "resolved",
  reason_code: "continued_target",
  primary_target: "/projects/product-docs/docs/install.md",
  governance_target: "/projects/product-docs",
  evidence_sources: ["/projects/product-docs/docs/style-guide.md"],
  working_directory: "/projects/product-docs",
  target_changed: false,
  next_action: "",
}, { registry, requestedLocale: "de" });
if (!compactTarget) throw new Error("Could not render Compact target stimulus");

const structuredCard = statusStimulus({
  runId: "account-recovery-intent",
  runTitle: "Nutzerabsicht für Account Recovery",
  status: "open",
  gate: "Brownfield Review",
  gateTitle: "Brownfield Prüfung",
  mode: "structured_delivery",
  breadcrumb: [{ gate: "UR", status: "fulfilled" }, { gate: "PRD", status: "open" }, { gate: "SD", status: "open" }, { gate: "TP", status: "open" }, { gate: "QA", status: "open" }, { gate: "UAT", status: "open" }],
  allowed: ["Bestehende Owner, Verträge und Wiederverwendung prüfen", "Den kleinsten passenden Delivery Pfad bestimmen"],
  forbidden: ["PRD, Implementierung oder Release vorwegnehmen"],
  blocking: "none",
  nextStep: "Brownfield Review für den genehmigten UR Scope durchführen.",
  quality: "Bestehende Recovery Owner und Sicherheitsgrenzen vor einer Produktentscheidung belegen.",
});

const approvalRefs = buildArtefactRefs(new Map([
  ["UR", { path: ".agdf/control/artefacts/payment-retry/UR.md", status: "approved" }],
  ["PRD", { path: ".agdf/control/artefacts/payment-retry/PRD.md", status: "approved" }],
  ["SD", { path: ".agdf/control/artefacts/payment-retry/SD.md", status: "approved" }],
  ["TP", { path: ".agdf/control/artefacts/payment-retry/TP.md", status: "approved" }],
]), registry, "de", { pathExists: () => true });
const uatSnapshot = buildApprovalOrientationSnapshot({
  ready: true,
  statusCard: {
    run_id: "payment-retry-visibility",
    status: "open",
    current_gate: "UAT",
    missing_approval: "Approval: UAT",
    next_gate_after_approval: "none",
    next_user_gate: "none",
    user_action_required: "no",
  },
  humanPresentation: {
    runTitle: "Sichtbarkeit von Payment Retry Zuständen",
    gateTitle: "Nutzerabnahme",
    artefactRefs: approvalRefs,
  },
  revisionId: `${FREEZE_ID}-uat`,
  registry,
  requestedLocale: "de",
});
const uatPresentation = renderApprovalOrientationSnapshot(uatSnapshot, { registry });
if (!uatPresentation) throw new Error("Could not render UAT stimulus");
const uatCard = [
  uatPresentation.blocks.run_status_card.markdown,
  "",
  uatPresentation.blocks.gate_transition_card.markdown,
  "",
  uatPresentation.approval_interaction.prompt,
  ...uatPresentation.approval_interaction.options.map((option) => `${option.label}: ${option.description}`),
].join("\n");

const blockedTarget = renderTaskTargetOrientation({
  resolution_state: "unresolved",
  reason_code: "multiple_plausible_targets",
  primary_target: "",
  governance_target: "",
  evidence_sources: ["/projects/customer-portal", "/projects/shared-auth"],
  working_directory: "/projects/customer-portal",
  target_changed: false,
  next_action: "Klären, ob die Recovery Meldung im Customer Portal oder im Shared Auth Modul geändert werden soll.",
}, { registry, requestedLocale: "de" });
if (!blockedTarget) throw new Error("Could not render blocked target stimulus");

const hostLimitCard = statusStimulus({
  runId: "host-rendering-observation",
  runTitle: "Darstellung der Freigabe im installierten Host",
  status: "warn",
  gate: "CD+Tests",
  gateTitle: "Implementierung und Tests",
  mode: "structured_delivery",
  breadcrumb: [{ gate: "UR", status: "fulfilled" }, { gate: "PRD", status: "fulfilled" }, { gate: "SD", status: "fulfilled" }, { gate: "TP", status: "fulfilled" }, { gate: "QA", status: "open" }, { gate: "UAT", status: "open" }],
  allowed: ["Repository und Renderer Evidenz als solche dokumentieren", "Eine authentifizierte Host Beobachtung vorbereiten"],
  forbidden: ["Repository Tests als native Host Darstellung oder Enforcement Garantie ausgeben"],
  blocking: "Authentifizierte Host Darstellung wurde noch nicht beobachtet",
  nextStep: "Die aktuelle Version in einer frischen authentifizierten Host Sitzung direkt beobachten.",
  quality: "Repository, installierte Runtime und sichtbares Host Verhalten als getrennte Evidenzklassen behalten.",
});

const changedTarget = renderTaskTargetOrientation({
  resolution_state: "resolved",
  reason_code: "explicit_target",
  primary_target: "/projects/shared-auth/docs/recovery.md",
  governance_target: "/projects/shared-auth",
  evidence_sources: ["/projects/customer-portal/src/recovery.tsx"],
  working_directory: "/projects/customer-portal",
  target_changed: true,
  next_action: "",
}, { registry, requestedLocale: "de" });
if (!changedTarget) throw new Error("Could not render changed target stimulus");
const changedTargetScope = renderScopeClassificationCard({
  outcome: "ungated",
  mode: "quick_task",
  trivial_boundary: "inside",
  ur_trigger_evaluation: "Die Änderung bleibt auf die ausdrücklich benannte Dokumentationsdatei begrenzt.",
  allowed_summary: "Nur das neue primäre Ziel im Governance Ziel Shared Auth bearbeiten.",
  forbidden_summary: "Das frühere Customer Portal Ziel oder weitere Dateien verändern.",
  escalation_triggers: ["Produktverhalten wird berührt", "Das neue Ziel reicht für die Änderung nicht aus"],
  challenge_path: "Bei Scope Wachstum zur UR Klärung im Shared Auth Repository wechseln.",
}, { registry, requestedLocale: "de" });
if (!changedTargetScope) throw new Error("Could not render changed target scope stimulus");

const lifecycleLines = [];
printGeneralStatus({
  installation: { status: "healthy", version: "0.13.8" },
  repository: { status: "not_configured" },
  delivery: { status: "not_configured", current_gate: null },
  runtime_checks: { requested: "enabled", effective: "enabled", reason: "content_bound_consent" },
  next_action: { text: "Start a new task; create durable repository control only when governed delivery is needed." },
}, { io: { log: (line) => lifecycleLines.push(line) } });

const stimuli = new Map([
  ["PMR6-S01", `${quickTarget.markdown}\n\n${quickCard.markdown}`],
  ["PMR6-S02", `${compactTarget.markdown}\n\n${compactCard}`],
  ["PMR6-S03", structuredCard],
  ["PMR6-S04", uatCard],
  ["PMR6-S05", blockedTarget.markdown],
  ["PMR6-S06", hostLimitCard],
  ["PMR6-S07", `${changedTarget.markdown}\n\n${changedTargetScope.markdown}`],
  ["PMR6-S08", lifecycleLines.join("\n")],
]);

const assignmentOrder = [...stimuli.keys()].sort((left, right) => {
  const leftKey = sha256(`${RANDOMIZATION_SEED}:${left}`);
  const rightKey = sha256(`${RANDOMIZATION_SEED}:${right}`);
  return leftKey.localeCompare(rightKey);
});
const assignments = ["P01", "P02", "P03", "P04"].map((participantId, index) => ({
  participant_id: participantId,
  scenario_ids: assignmentOrder.slice(index * 2, index * 2 + 2),
}));

mkdirSync(stimulusDir, { recursive: true });
mkdirSync(recordDir, { recursive: true });
for (const file of readdirSync(recordDir)) {
  if (/^P\d{2}-PMR6-S\d{2}\.md$/.test(file)) unlinkSync(join(recordDir, file));
}

const manifestStimuli = [];
for (const [scenarioId, renderedOutput] of stimuli) {
  const body = [
    "# Teilnehmeraufgabe",
    "",
    "Bitte lies nur die folgende Oberfläche. Nutze keine weiteren Projektinformationen.",
    "",
    renderedOutput,
    "",
    "## Fragen",
    "",
    ...questions.map((question, index) => `${index + 1}. ${question}`),
    "",
  ].join("\n");
  const fileName = `${scenarioId}.md`;
  writeFileSync(join(stimulusDir, fileName), body);
  manifestStimuli.push({ scenario_id: scenarioId, file: `stimuli/${fileName}`, sha256: sha256(body) });
}

for (const assignment of assignments) {
  for (const scenarioId of assignment.scenario_ids) {
    const record = [
      "# Beobachtungsformular",
      "",
      `- participant_id: ${assignment.participant_id}`,
      `- scenario_id: ${scenarioId}`,
      "- observer:",
      "- observed_at:",
      "- technical_display_retry: no",
      "- retry_reason: none",
      "",
      "## Wortgetreue Antworten",
      "",
      ...questions.flatMap((question, index) => [`${index + 1}. ${question}`, "", "Antwort:", ""]),
      "## Bewertung nach vollständiger Erfassung",
      "",
      "- target:",
      "- status:",
      "- next_action:",
      "- authority_effect:",
      "- critical_misunderstanding:",
      "- scoring_notes:",
      "",
    ].join("\n");
    writeFileSync(join(recordDir, `${assignment.participant_id}-${scenarioId}.md`), record);
  }
}

const manifest = {
  schema_version: 1,
  freeze_id: FREEZE_ID,
  status: "frozen_not_exposed",
  frozen_on: "2026-08-27",
  source_owners: [
    { file: "create-agdf/lib/interaction-presentation.js", sha256: sha256(readFileSync(rendererPath)) },
    { file: "create-agdf/lib/lifecycle/presentation.js", sha256: sha256(readFileSync(lifecycleRendererPath)) },
    { file: "plugin/meta/agdf-interaction-locales.json", sha256: sha256(readFileSync(registryPath)) },
  ],
  stimulus_count: manifestStimuli.length,
  stimuli: manifestStimuli,
  randomization: {
    method: "fixed blinded allocation generated before exposure",
    seed: RANDOMIZATION_SEED,
    assignments,
  },
  participant_state: {
    required: 4,
    confirmed: 0,
    observations_required: 8,
    observations_completed: 0,
  },
  evidence_boundary: "Frozen repository fixtures only; no participant or UAT evidence exists yet.",
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const participantGuide = [
  "# Teilnehmerinformation",
  "",
  "Diese Beobachtung prüft, ob eine dargestellte AGDF Situation ohne Vorwissen verständlich ist.",
  "Es wird nicht die Person getestet. Es gibt keine Vorbereitung und keine erwartete Fachsprache.",
  "",
  "- Jede Person erhält zwei getrennte Situationen in der zugewiesenen Reihenfolge.",
  "- Antworten werden vor der Bewertung wortgetreu unter einer pseudonymen ID erfasst.",
  "- Bitte keine Namen, E Mail Adressen oder vertraulichen Projektinformationen nennen.",
  "- Während der Antwort gibt es keine Hinweise und keine Korrektur.",
  "- Ein technischer Darstellungsfehler darf wiederholt werden. Ein Verständnisproblem wird nicht wiederholt.",
  "- Die Teilnahme ist freiwillig und kann vor Abschluss jederzeit beendet werden.",
  "",
  "Nach jeder Situation werden dieselben vier Fragen gestellt. Erst nach vollständiger Erfassung bewertet die beobachtende Person die Antworten.",
  "",
].join("\n");
writeFileSync(join(packageDir, "PARTICIPANT_GUIDE.md"), participantGuide);

const observerRunbook = [
  "# Beobachterleitfaden",
  "",
  `Freeze ID: ${FREEZE_ID}`,
  "",
  "## Vor der ersten Beobachtung",
  "",
  "1. Prüfe das Paket mit `node verify-stimuli.mjs`.",
  "2. Bestimme eine beobachtende Person, die die bewerteten Funktionen nicht implementiert hat.",
  "3. Ordne vier unabhängige Personen ausschließlich den pseudonymen IDs P01 bis P04 zu. Namen werden nicht im Repository gespeichert.",
  "4. Zeige jeder Person die Teilnehmerinformation und bestätige freiwillige Teilnahme.",
  "5. Öffne pro Person nur die beiden im Manifest zugewiesenen Stimuli und halte die dort angegebene Reihenfolge ein.",
  "6. Lege keine erwarteten Antworten, Szenariotypen oder Bewertungskriterien offen.",
  "",
  "## Während der Beobachtung",
  "",
  "1. Stelle nach jedem Stimulus genau die vier angegebenen Fragen.",
  "2. Erfasse jede Antwort wortgetreu im zugehörigen Formular, bevor du bewertest.",
  "3. Gib keine Hinweise und korrigiere keine Begriffe.",
  "4. Wiederhole nur bei einem technischen Darstellungsfehler und dokumentiere den Grund.",
  "",
  "## Nach der Beobachtung",
  "",
  "1. Bewerte erst nach vollständiger wortgetreuer Erfassung gemäß UNDERSTANDABILITY_UAT_PROTOCOL.md.",
  "2. Entferne keine unklaren oder falschen Beobachtungen.",
  "3. Aktualisiere Manifest, Protokoll und Aggregate Acceptance erst nach allen acht gültigen Beobachtungen.",
  "4. Eine kritische Fehlinterpretation bleibt Evidenz und wird vor RMP-12 zum verantwortlichen Produktowner geroutet.",
  "",
].join("\n");
writeFileSync(join(packageDir, "OBSERVER_RUNBOOK.md"), observerRunbook);

console.log(`Generated ${manifestStimuli.length} frozen stimuli and ${assignments.length * 2} observation forms for ${FREEZE_ID}.`);
