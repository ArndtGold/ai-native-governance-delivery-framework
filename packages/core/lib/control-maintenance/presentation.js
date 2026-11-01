import { interactionLocales } from '../resources/context.js';
import { localePack } from '../interaction-presentation.js';
import { controlCounts } from './contract.js';

export function renderControlCompatibility(control, { registry = interactionLocales, language = 'en', details = false } = {}) {
  if (!control || control.status === 'not_checked') return '';
  const pack = localePack(registry, language), copy = pack.installSetup.controlCompatibility;
  const counts = controlCounts(control);
  const lines = ['', pack.repositoryMaintenance.title, `${copy.target}: ${control.target}`,
    `${copy.state}: ${copy.states[control.status] ?? control.status}`,
    `run-folders-v1 · Run 4 · unsupported: ${counts.unsupported} · repair_required: ${counts.repair}`];
  if (details) {
    for (const finding of control.diagnostics) lines.push(`${finding.code}${finding.path ? `: ${finding.path}` : ''}`);
    for (const run of control.runs) lines.push(`${run.run_id}: ${run.status}`, ...run.diagnostics.map(finding => `  ${finding.code}`));
  }
  return lines.join('\n');
}
export function renderMaintenanceResult(report, options = {}) {
  if (report.inspection_state !== 'complete') return `${report.target}\n${report.diagnostics.map(item => item.code).join('\n')}`;
  return [renderControlCompatibility(report.compatibility, options), ...report.diagnostics.map(item => item.code)].join('\n');
}
export function renderStartupControlNotice(facts, { registry = interactionLocales, language = 'en', platform = process.platform } = {}) {
  if (!facts.invocation) return '';
  const pack = localePack(registry, language), copy = pack.installSetup.controlCompatibility;
  const quote = platform === 'win32' ? value => `'${String(value).replaceAll("'", "''")}'`
    : value => `'${String(value).replaceAll("'", `'"'"'`)}'`;
  const command = [facts.invocation.executable, ...facts.invocation.argv].map(quote).join(' ');
  return [pack.repositoryMaintenance.title, `${copy.target}: ${facts.target}`, `${copy.state}: ${copy.states[facts.status] ?? facts.status}`,
    `${platform === 'win32' ? '& ' : ''}${command}`].join('\n');
}
