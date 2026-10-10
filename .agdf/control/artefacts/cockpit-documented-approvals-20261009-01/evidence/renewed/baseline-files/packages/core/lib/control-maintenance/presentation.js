import { interactionLocales } from "../resources/context.js";
import { localePack } from "../interaction-presentation.js";
import { controlCounts } from "./contract.js";

export function renderMaintenanceOffer(control, { registry = interactionLocales, language = "en", details = false } = {}) {
  const copy = localePack(registry, language).repositoryMaintenance;
  return [renderControlMigration(control, { registry, language, details }),
    `[1] ${copy.start}`, `[2] ${copy.later}`, `[3] ${copy.details}`].join("\n");
}

export function renderMaintenanceResult(report, { registry = interactionLocales, language = "en", details = false } = {}) {
  const copy = localePack(registry, language).repositoryMaintenance;
  if (report.inspection_state !== "complete") return `${copy.unavailable}: ${report.target}\n${report.diagnostics.map((item) => item.code).join("\n")}`;
  return [renderControlMigration(report.compatibility, { registry, language, details }),
    ...report.diagnostics.map((item) => `${item.run_id ? `${item.run_id}: ` : ""}${item.code}${item.path ? `: ${item.path}` : ""}`),
    `${copy.title}: ${copy.outcomes[report.maintenance_outcome]}`].join("\n");
}

export function renderStartupControlNotice(facts, { registry = interactionLocales, language = "en", platform = process.platform } = {}) {
  if (!facts.invocation) return "";
  const pack = localePack(registry, language);
  const copy = pack.repositoryMaintenance;
  const migration = pack.installSetup.controlMigration;
  const quote = platform === "win32" ? (value) => `'${String(value).replaceAll("'", "''")}'`
    : (value) => `'${String(value).replaceAll("'", `'"'"'`)}'`;
  const command = [facts.invocation.executable, ...facts.invocation.argv].map(quote).join(" ");
  return [copy.title, `${migration.target}: ${facts.target}`,
    facts.status === "unavailable" ? copy.unavailable : `${migration.state}: ${migration.states[facts.status]}`,
    ...(facts.counts ? [replacement(migration.eligibleDescription, { count: facts.counts.migration }),
      replacement(migration.blockedDescription, { count: facts.counts.repair })] : []),
    copy.next, `${platform === "win32" ? "& " : ""}${command}`].join("\n");
}

function replacement(template, values = {}) {
  return Object.entries(values).reduce((current, [key, value]) => current.replaceAll(`{${key}}`, String(value)), template);
}

export function renderControlMigration(control, { registry = interactionLocales, language = "en", details = false } = {}) {
  if (!control || control.status === "not_checked") return "";
  const copy = localePack(registry, language).installSetup.controlMigration;
  const lines = ["", copy.title, `${copy.target}: ${control.target}`,
    `${copy.state}: ${copy.states[control.status]}`];
  const { migration: eligible, repair } = controlCounts(control);
  if (eligible) lines.push(replacement(copy.eligibleDescription, { count: eligible }));
  if (repair) lines.push(replacement(copy.blockedDescription, { count: repair }));
  if (control.changes.length) lines.push(replacement(copy.changed, { count: control.changes.length }));
  if (control.repair) {
    const repairCopy = localePack(registry, language).installSetup.controlRepair;
    lines.push(replacement(repairCopy.repairedDescription, { count: control.repair.items.filter((item) => item.outcome === "repaired").length }));
    for (const item of control.repair.items.filter((item) => !item.available)) {
      for (const finding of item.required) lines.push(`${item.run_id}: ${repairCopy.reasons[finding.code] ?? repairCopy.manualDescription}${finding.path ? `: ${finding.path}` : ""}`);
    }
  }
  if (!details) {
    if (control.diagnostics.length && !repair) lines.push(copy.repairDescription);
    if (eligible || repair || control.diagnostics.length) lines.push(copy.detailsDescription);
    return lines.join("\n");
  }
  lines.push(`${copy.format}: ${control.supported_control_state_version}`,
    replacement(copy.historicalCount, { count: control.runs.filter((run) => run.status === "historical").length }));
  for (const run of control.runs.filter((entry) => entry.status !== "current" && entry.status !== "historical")) {
    lines.push(`${run.run_id}: ${copy.states[run.status]}`);
    for (const finding of run.diagnostics) lines.push(`  ${finding.code}${finding.path ? `: ${finding.path}` : ""}`);
  }
  for (const diagnostic of control.diagnostics) lines.push(`${diagnostic.code}${diagnostic.path ? `: ${diagnostic.path}` : ""}`);
  for (const change of control.changes) lines.push(`${change.run_id}: ${copy.backup}: ${change.backup}`);
  if (control.status === "migration_required") lines.push(copy.migrationDescription, copy.manualDescription, copy.legacyDescription);
  if (control.status === "repair_required") lines.push(copy.repairDescription);
  return lines.join("\n");
}

export function renderControlMigrationDecision(plan, { registry = interactionLocales, language = "en", details = false } = {}) {
  const copy = localePack(registry, language).installSetup.controlMigration;
  const lines = [renderControlMigration(plan.control, { registry, language, details }),
    replacement(copy.batchDescription, { count: plan.runs.length }), copy.backupDescription];
  if (plan.approval_reset_count) lines.push(replacement(copy.resetDescription, { count: plan.approval_reset_count }));
  if (details) {
    for (const run of plan.runs) {
      lines.push(`${copy.run}: ${run.run_id}`, `${copy.sourceRevision}: ${run.source_revision_id}`,
        `${copy.nextGate}: ${run.next_gate}`,
        ...run.prior_approvals.filter((row) => row.status !== "missing" || row.evidence)
          .map((row) => `  ${row.gate}: ${row.status} (${row.evidence})`));
    }
    for (const diagnostic of plan.diagnostics) lines.push(`${diagnostic.run_id}: ${diagnostic.code}`);
  }
  lines.push(`[1] ${copy.migrateChoice}`, `[2] ${copy.skipChoice}`, `[3] ${copy.detailsChoice}`);
  return lines.join("\n");
}

export function renderControlRepairOffer(control, { registry = interactionLocales, language = "en", details = false } = {}) {
  const copy = localePack(registry, language).installSetup.controlRepair;
  return [renderControlMigration(control, { registry, language, details }), copy.searchDescription,
    `[1] ${copy.startChoice}`, `[2] ${copy.skipChoice}`, `[3] ${copy.detailsChoice}`].join("\n");
}

export function renderControlRepairPlan(plan, { registry = interactionLocales, language = "en", details = false } = {}) {
  const pack = localePack(registry, language).installSetup;
  const copy = pack.controlRepair;
  const candidates = plan.items.filter((item) => item.available);
  const lines = [copy.title, `${pack.controlMigration.target}: ${plan.target}`,
    replacement(copy.availableDescription, { count: candidates.length }), copy.backupDescription];
  if (candidates.some((item) => item.approval_reset)) lines.push(copy.resetDescription);
  for (const item of plan.items) {
    lines.push(`${item.run_id}: ${copy.kinds[item.kind]}`);
    for (const finding of item.required) lines.push(`  ${copy.reasons[finding.code] ?? copy.manualDescription}${finding.path ? `: ${finding.path}` : ""}`);
    if (details) for (const source of item.sources) lines.push(`  ${source.path}: ${source.source} ${source.commit ?? source.journal ?? ""}`);
    if (details && item.available && item.source_content !== item.candidate_content) {
      const before = item.source_content.split("\n");
      const after = item.candidate_content.split("\n");
      let start = 0;
      while (start < before.length && start < after.length && before[start] === after[start]) start++;
      let end = 0;
      while (end < before.length - start && end < after.length - start && before.at(-1 - end) === after.at(-1 - end)) end++;
      lines.push(...before.slice(start, before.length - end).map((line) => `- ${line}`),
        ...after.slice(start, after.length - end).map((line) => `+ ${line}`));
    }
  }
  for (const finding of plan.diagnostics) lines.push(`${copy.manualDescription}${finding.path ? `: ${finding.path}` : ""}${details ? ` (${finding.code})` : ""}`);
  if (candidates.length) lines.push(`[1] ${copy.applyChoice}`);
  lines.push(`[2] ${copy.skipChoice}`, `[3] ${copy.detailsChoice}`);
  return lines.join("\n");
}
