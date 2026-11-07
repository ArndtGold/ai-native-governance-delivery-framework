import { createCoreServices } from '#agdf-core';
import { readRunView } from '#agdf-core/companion/run-view.js';
import { resources, resolveConfiguredChatLanguage } from '../runtime/control-context.js';
import { cliGitObservation } from '../control-evaluation/git-observation.js';
import { RUN_ID_PATTERN } from '#agdf-core/control-state/run-identity.js';
import { CliUsageError } from './parse-args.js';

// An explicit --language wins; otherwise the configured chat language. A configuration that cannot be
// resolved (unsupported layout, invalid value) must not hide the store diagnosis (PRD AC-002), so the
// language is left to Core as executeProjectRead does: an unsupported store is reported in `store`,
// an invalid configuration as the evaluation error of every evaluated run (CR finding CIR-05; both
// cases are covered by run-view-command-test.js).
const readLanguage = options => {
  if (options.languageExplicit) return options.language?.chat_language;
  try { return resolveConfiguredChatLanguage(options.dir); } catch { return undefined; }
};

// Read-only companion run view (SD SDD-001): the status card fields of every active or unreadable
// run of one project root plus every run named with --run, versioned run-view/1. Writes nothing.
// Exit 0 for a complete view, 2 when the store is unavailable or has no control folder.
export function executeRunView(options, io = console) {
  // A malformed run id is a usage error, never an evaluated run of its own (CR finding C3).
  const invalid = (options.runIds ?? []).find(runId => !RUN_ID_PATTERN.test(runId));
  if (invalid !== undefined) throw new CliUsageError(`run-view --run requires a run id (${RUN_ID_PATTERN}); got ${JSON.stringify(invalid)}.`);
  const view = readRunView(options.dir, { language: readLanguage(options), runIds: options.runIds ?? [] });
  if (options.json) io.log(JSON.stringify(view, null, 2));
  else {
    io.log(`AGDF run-view: ${view.store.status}${view.store.reason ? ` (${view.store.reason})` : ''}`);
    for (const run of view.runs) io.log(`- ${run.run_id}: ${run.evaluated ? `${run.status} · ${run.current_gate} · ${run.next_step_text}` : run.lifecycle ?? 'unreadable'}`);
  }
  return view.store.status === 'ok' ? 0 : 2;
}

// CLI syntax only. Target confirmation, facts and original-operation semantics
// stay with the same inspect owner used by MCP.
export function executeProjectRead(options, io = console) {
  let language = options.language?.chat_language;
  if (!options.languageExplicit) {
    try { language = resolveConfiguredChatLanguage(options.dir); }
    catch { /* Core still reports the invalid configuration and original receipt facts. */ }
  }
  const result = createCoreServices({ resources, observers: { gitObservation: cliGitObservation } }).inspect({
    operation: options.target, workingDirectory: options.dir, targetSource: 'explicit_target', primaryTarget: options.dir,
    presentationLanguage: language,
    expectedVersion: resources.pluginDefinition.version, interactionLocales: resources.interactionLocales,
    ...(options.contractModule ? { contractModule: options.contractModule } : {}),
  });
  if (options.json) io.log(JSON.stringify(result, null, 2));
  else {
    const report = result.report;
    io.log(`AGDF ${options.target}: ${report?.status ?? result.outcome}`);
    if (report?.target_id) io.log(`Target: ${report.target_id}`);
    if (report?.operation_id) io.log(`Operation: ${report.operation_id}`);
    if (report?.current_setup) io.log(`Current setup: ${report.current_setup}`);
    if (report?.plan) io.log(`Plan: ${report.plan.file_count} files; ${report.plan.plan_digest}`);
    if (report?.receipt?.receipt_digest) io.log(`Receipt: ${report.receipt.receipt_digest}`);
    if (report?.reason) io.log(`Reason: ${report.reason}`);
    if (report?.recovery?.instruction) io.log(`Recovery: ${report.recovery.instruction}`);
    if (report?.next_calls?.length) io.log(`Next: ${JSON.stringify(report.next_calls)}`);
    if (result.host_action?.text) io.log(result.host_action.text);
  }
  return result.outcome === 'inspect_result' && result.report?.available === true
    && !['blocked', 'unavailable', 'incomplete'].includes(result.report.status) ? 0 : 2;
}
