import { readFileSync } from '../control-read/fs.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { posix } from 'node:path';
import { extractField } from './verified-change.js';
import { declaredRoutes, normalizedGapProblems, readNormalizedFindings } from './normalized-gaps.js';
import { isGateSatisfied } from './gate-policy.js';
import { isInternalStepSatisfied } from './run-state-policy.js';
import { createHash } from 'node:crypto';
import { readReportDecision } from './report-decision.js';

// Review reports a QA report references explicitly; they are inspected like recorded reviews.
export function qaReportReferences(content, qaPath) {
  const refs = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/gu)].filter(m => /review|\bCR\b/iu.test(m[1] + ' ' + m[2]) && /\.md(?:#.*)?$/iu.test(m[2])).map(m => [m[1], m[2].split('#')[0]]);
  for (const m of content.matchAll(/^- (tp_review|clean_implementation_review|code_review):[ \t]*`?([^`\r\n]+)`?[ \t]*$/gmu)) refs.push([m[1], m[2].trim()]);
  return refs.map(([label, ref]) => ({ type: `QA reference: ${label}`, path: ref.startsWith('.agdf/') ? ref : posix.join(posix.dirname(qaPath), ref) }));
}

export function evaluateQaFollowUp(root, state, runId, maxSources = Infinity, strictUtf8 = false) {
  const stop = reason => ({ kind: 'blocked', reason, findings: [], sources: [] });
  if (!['UR', 'PRD', 'SD', 'TP'].every(gate => isGateSatisfied(state, gate))
      || !['Brownfield Analysis', 'CD+Tests', 'CR'].every(step => isInternalStepSatisfied(state, step))) return stop('Current approved sources and completed implementation/reviews are required.');
  const qa = state.artefacts.get('QA');
  if (qa?.status !== 'revise') return stop('Only the current revise report permits this follow-up.');
  return inspectQaReports(root, state, runId, 'revise', maxSources, strictUtf8);
}

// Shared registered-source and normalized-finding validation. Only the wrapper above routes
// corrective work; pass/block observations here cannot approve or revoke a gate.
export function inspectQaReports(root, state, runId, expectedDecision, maxSources = Infinity, strictUtf8 = false, { readArtefact } = {}) {
  const observations = [];
  const stop = reason => ({ kind: 'blocked', reason, findings: [], sources: observations });
  const routes = declaredRoutes();
  if (routes.size !== 6) return stop('Normalized review-gap contract is unavailable.');
  const findings = [], reports = new Set();
  const sources = ['QA', 'TP Review', 'Clean Implementation Review', 'Clean Review', 'CR', 'Code Review'].map(type => ({ type, ...state.artefacts.get(type) }));
  for (const artefact of sources) {
    const { type } = artefact;
    const path = String(artefact.path ?? '').replace(/^`|`$/gu, '');
    if (!path) { if (type === 'QA') return stop('Current QA report is missing.'); else continue; }
    if (posix.normalize(path) !== path || strictUtf8 && /[%?#]/u.test(path)
        || !path.startsWith(`.agdf/control/artefacts/${runId}/`) || !readArtefact && hasSymlinkComponent(root, path)) return stop(`Unsafe review source: ${type}.`);
    const file = readArtefact ? null : containedRegularFile(root, path);
    if (file && file.status !== 'valid') return stop(`Review source unavailable: ${type}.`);
    if (reports.has(path)) continue;
    if (reports.size >= maxSources) return stop('Review source limit exceeded.');
    reports.add(path);
    const captured = readArtefact ? readArtefact(path) : null;
    if (readArtefact && typeof captured !== 'string') return stop(`Review source unavailable: ${type}.`);
    const bytes = readArtefact ? Buffer.from(captured) : readFileSync(file.path);
    observations.push({ path, digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), state: 'available' });
    if (strictUtf8 && bytes.length > 262144) return stop(`Review source exceeds the bounded input size: ${type}.`);
    let content;
    try { content = strictUtf8 ? new TextDecoder('utf-8', { fatal: true }).decode(bytes) : bytes.toString('utf8'); }
    catch { return stop(`Review source encoding unsupported: ${type}.`); }
    if (content.length > 262144) return stop(`Review source exceeds the bounded input size: ${type}.`);
    if (type === 'QA') {
      if (readReportDecision(content) !== expectedDecision) return stop('QA report decision contradicts its current recording.');
      // Explicit QA references are inputs too; missing or unsafe references cannot be ignored.
      sources.push(...qaReportReferences(content, path));
    }
    const scan = readNormalizedFindings(content), headerFound = scan.header;
    const seen = new Set();
    for (const entry of scan.entries) {
      if (entry.kind === 'malformed_header') return stop(`Malformed normalized finding header: ${type}.`);
      if (entry.kind === 'malformed_row') return stop(`Malformed normalized finding row: ${type}.`);
      const row = entry.row, [id, , target, status, evidence, action] = row;
      const problems = seen.has(id) ? [{ field: 'finding_id', expected: 'a finding id used only once', rule: 'duplicate_id' }] : normalizedGapProblems(row, routes);
      if (problems.length) return { ...stop(`Invalid or contradictory normalized finding: ${type}/${id || 'missing id'}.`), invalid: { review: type, finding_id: id || null, problems } };
      seen.add(id);
      if (status === 'open' && findings.length >= 64) return stop('Too many open findings for a bounded follow-up; consolidate the authoritative review first.');
      if (status === 'open') findings.push({ id, target, evidence, action, path });
    }
    if ((!headerFound || !seen.size) && (type === 'QA' && expectedDecision !== 'pass' || ['revise', 'block'].includes(artefact.status) || ['revise', 'block'].includes(extractField(content, 'decision')))) return stop(`Normalized findings are missing: ${type}.`);
  }
  if (!findings.length && expectedDecision === 'pass') return { kind: 'none', findings, reason: '', sources: observations };
  if (!findings.length) return stop('QA revise has no valid open normalized finding; inspect its decisive obligation before corrective work.');
  const upstreamTargets = [...new Set(findings.map(f => f.target).filter(target => !['CD+Tests', 'evidence_obligation'].includes(target)))];
  if (upstreamTargets.length) return { kind: 'upstream', findings, reason: `Resolve the earliest source-owner decision (${upstreamTargets.join(', ')}) before dependent implementation.`, sources: observations };
  return { kind: findings.some(f => f.target === 'CD+Tests') ? 'implementation' : 'evidence', findings, reason: '', sources: observations };
}
