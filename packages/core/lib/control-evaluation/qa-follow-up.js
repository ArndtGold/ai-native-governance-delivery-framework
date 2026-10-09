import { readFileSync } from '../control-read/fs.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { posix } from 'node:path';
import { extractField } from './verified-change.js';
import { readRuntimeContract } from '../resources/contracts.js';
import { cleanStatusCell } from './shared.js';
import { isGateSatisfied } from './gate-policy.js';
import { isInternalStepSatisfied } from './run-state.js';

const columns = ['finding_id', 'gap_type', 'routing_target', 'gap_status', 'evidence', 'required_next_step'];
// Consume the sole normative route table rather than introduce a second type-to-route map.
function declaredRoutes() {
  const contract = readRuntimeContract('quality');
  if (!contract.ok) return new Map();
  const text = contract.content;
  const body = text.split('## Normalized Review Gaps')[1]?.split(/^## /mu)[0] ?? '';
  const routes = new Map();
  for (const line of body.split('\n')) {
    const row = line.match(/^\|\s*`([a-z_]+)`\s*\|[^|]*\|(.+)\|\s*$/u);
    if (!row) continue;
    const targets = [...row[2].matchAll(/`([^`]+)`/gu)].flatMap(m => m[1].split('|').map(v => v.trim()));
    routes.set(row[1], targets);
  }
  return routes;
}

export function evaluateQaFollowUp(root, state, runId) {
  const stop = reason => ({ kind: 'blocked', reason, findings: [] });
  if (!['UR', 'PRD', 'SD', 'TP'].every(gate => isGateSatisfied(state, gate))
      || !['Brownfield Analysis', 'CD+Tests', 'CR'].every(step => isInternalStepSatisfied(state, step))) return stop('Current approved sources and completed implementation/reviews are required.');
  const qa = state.artefacts.get('QA');
  if (qa?.status !== 'revise') return stop('Only the current revise report permits this follow-up.');
  const routes = declaredRoutes();
  if (routes.size !== 6) return stop('Normalized review-gap contract is unavailable.');
  const findings = [], reports = new Set();
  const sources = ['QA', 'TP Review', 'Clean Implementation Review', 'Clean Review', 'CR', 'Code Review'].map(type => ({ type, ...state.artefacts.get(type) }));
  for (const artefact of sources) {
    const { type } = artefact;
    const path = String(artefact.path ?? '').replace(/^`|`$/gu, '');
    if (!path) { if (type === 'QA') return stop('Current QA report is missing.'); else continue; }
    if (posix.normalize(path) !== path || !path.startsWith(`.agdf/control/artefacts/${runId}/`) || hasSymlinkComponent(root, path)) return stop(`Unsafe review source: ${type}.`);
    const file = containedRegularFile(root, path);
    if (file.status !== 'valid') return stop(`Review source unavailable: ${type}.`);
    if (reports.has(path)) continue;
    reports.add(path);
    const content = readFileSync(file.path, 'utf8');
    if (content.length > 262144) return stop(`Review source exceeds the bounded input size: ${type}.`);
    if (type === 'QA') {
      if ([...content.matchAll(/^- decision:[ \t]*(.*)$/gmu)].length !== 1 || extractField(content, 'decision') !== 'revise') return stop('QA report decision contradicts its current revise recording.');
      // Explicit QA references are inputs too; missing or unsafe references cannot be ignored.
      const refs = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/gu)].filter(m => /review|\bCR\b/iu.test(m[1] + ' ' + m[2]) && /\.md(?:#.*)?$/iu.test(m[2])).map(m => [m[1], m[2].split('#')[0]]);
      for (const m of content.matchAll(/^- (tp_review|clean_implementation_review|code_review):[ \t]*`?([^`\r\n]+)`?[ \t]*$/gmu)) refs.push([m[1], m[2].trim()]);
      for (const [label, ref] of refs) sources.push({ type: `QA reference: ${label}`, path: ref.startsWith('.agdf/') ? ref : posix.join(posix.dirname(path), ref) });
    }
    let active = false, headerFound = false;
    const seen = new Set();
    for (const line of content.split('\n')) {
      if (!line.trim().startsWith('|')) { active = false; continue; }
      if (/^\|(?:\s*:?-+:?\s*\|)+\s*$/u.test(line.trim())) continue;
      const row = line.trim().replace(/^\||\|$/gu, '').split('|').map(cleanStatusCell);
      if (row.includes('finding_id') || row.filter(cell => columns.includes(cell)).length > 1) {
        if (row.join('|') !== columns.join('|')) return stop(`Malformed normalized finding header: ${type}.`);
        active = true; headerFound = true; continue;
      }
      if (!active) continue;
      if (row.length !== columns.length) return stop(`Malformed normalized finding row: ${type}.`);
      const [id, gap, target, status, evidence, action] = row;
      if (!id || seen.has(id) || !routes.get(gap)?.includes(target) || !['open', 'resolved'].includes(status)
          || !evidence || !action || id.length > 128 || evidence.length > 4096 || action.length > 2048
          || /^(?:none|tbd|todo|<)/iu.test(evidence) || /^(?:none|tbd|todo|<)/iu.test(action)) return stop(`Invalid or contradictory normalized finding: ${type}/${id || 'missing id'}.`);
      seen.add(id);
      if (gap === 'requirements_gap' && target === 'UR' && !/changed (?:user )?(?:intent|scope)/iu.test(evidence)) return stop(`Changed intent/scope evidence is required: ${id}.`);
      if (gap === 'emergent_risk' && !/earliest[- ]owner assessment/iu.test(evidence)) return stop(`Earliest-owner assessment is required: ${id}.`);
      if (status === 'open' && findings.length >= 64) return stop('Too many open findings for a bounded follow-up; consolidate the authoritative review first.');
      if (status === 'open') findings.push({ id, target, evidence, action, path });
    }
    if ((!headerFound || !seen.size) && (type === 'QA' || ['revise', 'block'].includes(artefact.status) || ['revise', 'block'].includes(extractField(content, 'decision')))) return stop(`Normalized findings are missing: ${type}.`);
  }
  if (!findings.length) return stop('QA revise has no valid open normalized finding; inspect its decisive obligation before corrective work.');
  const upstreamTargets = [...new Set(findings.map(f => f.target).filter(target => !['CD+Tests', 'evidence_obligation'].includes(target)))];
  if (upstreamTargets.length) return { kind: 'upstream', findings, reason: `Resolve the earliest source-owner decision (${upstreamTargets.join(', ')}) before dependent implementation.` };
  return { kind: findings.some(f => f.target === 'CD+Tests') ? 'implementation' : 'evidence', findings, reason: '' };
}
