import { captureControlScope, ControlReadError } from './snapshot.js';
import { resolveRuns } from '../control-state/run-state-resolver.js';
import { evaluateDoctor, doctorInventoryFindings } from '../control-evaluation/doctor.js';
import { aggregate } from '../control-state/aggregate.js';
import { allowNoActiveRuns } from '../control-evaluation/shared.js';
import { existsSync } from './fs.js';
import { join } from 'node:path';

const bytes = value => Buffer.byteLength(JSON.stringify(value));
const error = code => { throw new ControlReadError(code); };
const git = value => ({ gitValue: () => value?.head ?? null, gitPathList: (_root, args) => args[0] === 'diff' ? value?.tracked ?? null : value?.untracked ?? null });
const summary = findings => ({ findings: findings.length, block: findings.filter(f => f.severity === 'block').length,
  revise: findings.filter(f => f.severity === 'revise').length, warn: findings.filter(f => f.severity === 'warn').length });

// Exactly one bounded observation per read worker. Core owns checks/aggregation;
// the retained dependency scope owns consistency, not permission or persistence.
export function createDoctorReader(root, { limits = {} } = {}) {
  let scope, current, items, originalGit, allowEmpty, next = 0, invalidCount = 0, cacheBytes = 0;
  const pages = new Map(), statuses = [], totals = { findings: 0, block: 0, revise: 0, warn: 0 };
  let failed = false, unevaluated = 0, controlPresent = true;
  function page(offset, snapshot, started = performance.now()) {
    if (failed || !scope || JSON.stringify(originalGit) !== JSON.stringify(snapshot)) error('source_changed');
    current.view.revalidate();
    if (pages.has(offset)) return pages.get(offset);
    if (offset !== next || pages.size >= 64) error(offset !== next ? 'diagnostic_cursor_invalid' : 'resource_limit');
    let wanted = null;
    const captured = scope.extend(() => {
      const rows = [], start = performance.now(); let size = 0;
      for (let index = offset; index < items.length && rows.length < (wanted ?? 20); index++) {
        if (wanted === null && rows.length && performance.now() - start >= 2500) break;
        const item = items[index];
        const row = item.invalid ? { run_id: item.run_id, invalid: true, findings: doctorInventoryFindings(item.findings) }
          : { run_id: item.run_id, report: evaluateDoctor(root, { runId: item.run_id, ignoreRunIdEnv: true }, git(originalGit)) };
        if (bytes(row) > 500 * 1024) {
          rows.push({ run_id: item.run_id, unevaluated: true, reason: 'resource_limit', findings: [] });
        } else {
          if (wanted === null && rows.length && size + bytes(row) > 500 * 1024) break;
          rows.push(row); size += bytes(row);
        }
      }
      if (wanted === null) wanted = rows.length;
      return rows;
    });
    current = captured;
    const rows = captured.data;
    if (items.length && !rows.length) error('resource_limit');
    const findings = rows.flatMap(row => row.invalid ? row.findings : row.report?.findings.map(f => ({ ...f, run_id: row.run_id })) ?? []);
    const counts = summary(findings), nextTotals = Object.fromEntries(Object.keys(totals).map(k => [k, totals[k] + counts[k]]));
    const end = offset + rows.length, nextUnevaluated = unevaluated + rows.filter(r => r.unevaluated).length;
    const nextInvalid = invalidCount + rows.filter(r => r.invalid).length;
    const nextStatuses = [...statuses, ...rows.filter(r => r.report).map(r => ({ run_id: r.run_id, status: r.report.status }))];
    const complete = end === items.length && !nextUnevaluated;
    const result = { schema_version: '1', available: true, status: complete ? nextInvalid ? 'block' : aggregate(nextStatuses, { allowNoActiveRuns: allowEmpty }).status : 'partial',
      target_dir: root, checked_at: current.view.observed_as_of, observed_as_of: scope.view.observed_as_of,
      source_digest: current.view.digest, completeness: complete ? 'complete' : 'partial',
      inventory: { state: !controlPresent ? 'absent' : nextInvalid ? 'incomplete' : end === items.length ? 'complete' : 'partial', active_count: items.filter(r => !r.invalid).length,
        total_entries: items.length, accounted_count: end, evaluated_count: end - nextUnevaluated,
        unevaluated_count: nextUnevaluated, remaining_count: items.length - end },
      summary: complete ? nextTotals : counts, cumulative_summary: nextTotals, findings,
      runs: rows.filter(r => r.report), invalid_entries: rows.filter(r => r.invalid), unevaluated_entries: rows.filter(r => r.unevaluated),
      next_offset: end < items.length ? end : null, authorizes: false,
      timing: { capture_and_evaluation_ms: performance.now() - started } };
    if (bytes(result) > 512 * 1024 || cacheBytes + bytes(result) > 8 * 1024 * 1024) error('resource_limit');
    next = end; unevaluated = nextUnevaluated; invalidCount = nextInvalid;
    statuses.splice(0, statuses.length, ...nextStatuses); Object.assign(totals, nextTotals);
    pages.set(offset, result); cacheBytes += bytes(result);
    return result;
  }
  return Object.freeze({
    open(input) {
      if (scope) error('resource_denied');
      const started = performance.now(); originalGit = input.git_snapshot;
      if (!input.all_active) {
        const selected = captureControlScope(root, () => evaluateDoctor(root, { ...(input.run_id ? { runId: input.run_id } : {}), ignoreRunIdEnv: true }, git(originalGit)), { limits });
        return { ...selected.data, available: true, completeness: 'complete', source_digest: selected.view.digest,
          observed_as_of: selected.view.observed_as_of, authorizes: false, next_offset: null,
          timing: { capture_and_evaluation_ms: performance.now() - started } };
      }
      scope = captureControlScope(root, () => {
        const resolved = resolveRuns(root, { allActive: true }), invalid = new Map();
        for (const finding of resolved.findings) invalid.set(finding.run_id, [...(invalid.get(finding.run_id) ?? []), finding]);
        return { items: [...resolved.runs.map(r => ({ run_id: r.run_id })), ...[...invalid].map(([run_id, findings]) => ({ run_id, invalid: true, findings }))]
          .sort((a, b) => a.run_id.localeCompare(b.run_id)), allowEmpty: allowNoActiveRuns(root), controlPresent: existsSync(join(root, '.agdf/control')) };
      }, { limits, retain: true });
      current = scope; items = scope.data.items; allowEmpty = scope.data.allowEmpty; controlPresent = scope.data.controlPresent;
      return page(0, originalGit, started);
    },
    page(input) { try { return page(input.offset, input.git_snapshot); } catch (e) { if (e.code !== 'diagnostic_cursor_invalid') failed = true; throw e; } },
  });
}
