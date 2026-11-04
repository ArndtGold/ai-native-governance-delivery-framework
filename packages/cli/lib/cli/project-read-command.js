import { createCoreServices } from '#agdf-core';
import { resources, resolveConfiguredChatLanguage } from '../runtime/control-context.js';
import { cliGitObservation } from '../control-evaluation/git-observation.js';

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
