import { projectStoredRun } from './core.mjs';
// Bounded, read-only current-Run projection. Typed records and display policy come
// from the canonical pure Core modules. This does not qualify seals or file evidence
// and never authorizes a gate or command. File access remains injected by the host.

export const GATES = Object.freeze(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT', 'OR']);
// The internal steps between an approved TP and QA, shown as the build phase (SDD-02, SDD-03).
export const BUILD_GATES = Object.freeze(['Brownfield Analysis', 'CD+Tests', 'CR']);
export const isStructured = route => route === 'structured_delivery' || route === 'structured_slice';
// The host rejects reads over 4 MiB; the largest observed run state is about 280 KB.
export const MAX_RUN_STATE_BYTES = 1024 * 1024;
const TEXT_LIMIT = 240;

// The run lifecycles the core reader accepts (`LIFECYCLES` in run-state-parser.js); the logic suite
// asserts that both sets are equal, so a new core lifecycle fails it instead of reading unreadable.
export const LIFECYCLES = Object.freeze(['active', 'completed', 'superseded', 'abandoned']);
const KNOWN_LIFECYCLES = new Set(LIFECYCLES);
const plain = value => String(value ?? '').replace(/`/gu, '').trim();
const clip = text => (text.length > TEXT_LIMIT ? `${text.slice(0, TEXT_LIMIT - 1)}…` : text);

// Body of a level-two section, without its heading; '' when absent.
export function section(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex(line => line.trimEnd() === `## ${heading}`);
  if (start < 0) return '';
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => line.startsWith('## '));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n');
}

const field = (body, key) => plain(body.match(new RegExp(`^- ${key}:[ \\t]*(.*)$`, 'mu'))?.[1]);

// Canonical writers keep a review or gate result in the Artefacts row of the step that produced it
// (`CR | … | revise`, `QA | … | block`); a Quick Task's Code Review is the CR row. The Run Meta
// `decision` stays `in_progress` (CR-F02).
const RESULT_ROWS = Object.freeze({ 'Quick Task Execution': ['CR'] });
const RESULTS = new Set(['revise', 'block', 'blocked']);
// The core's decision-content placeholder rule (`isDecisionContentPlaceholder`,
// decision-content-readiness.js), so a template objective is never shown as the run's goal.
const PROMPTS = new Set(['describe the trustworthy outcome.', 'what outcome should become possible?',
  'which tp tasks are fully done, partially done or not done?', 'what remains unverified?', 'which risks remain and what is their impact?']);
export function isPlaceholderText(value) {
  if (typeof value !== 'string') return true;
  const text = value.trim().replace(/^`([^`]+)`$/u, '$1').replace(/\s+/gu, ' ').toLowerCase();
  return !text || PROMPTS.has(text)
    || /^(?:todo|tbd|<[^>]+>|(?:draft|done|ready|blocked|pass|revise|block)(?:\s*\|\s*(?:draft|done|ready|blocked|pass|revise|block))+)$/u.test(text);
}

// Returns { ok: true, run } or { ok: false, id, reason } with reason missing | too_large | format.
// Only version 4 typed records are accepted; retired persisted derived tables are refused.
export function parseRunState(id, text) {
  if (typeof text !== 'string') return { ok: false, id, reason: 'missing' };
  if (text.length > MAX_RUN_STATE_BYTES) return { ok: false, id, reason: 'too_large' };
  const normalized = text.replace(/^﻿/u, '').replace(/\r\n?/gu, '\n');
  const meta = section(normalized, 'Run Meta');
  let projection; try { projection = projectStoredRun(normalized); } catch { return { ok: false, id, reason: 'format' }; }
  const control = projection.control;
  const runId = field(meta, 'run_id');
  const lifecycle = field(meta, 'lifecycle');
  const gate = control.current_gate;
  const decision = lifecycle === 'completed' ? 'completed' : 'in_progress';
  const updatedAt = Number.isNaN(Date.parse(field(meta, 'updated_at'))) ? '' : field(meta, 'updated_at');
  if (!meta || runId !== id || !KNOWN_LIFECYCLES.has(lifecycle) || !gate) return { ok: false, id, reason: 'format' };
  const objective = section(normalized, 'Objective').split('\n').map(line => line.trim()).find(Boolean) ?? '';
  const statuses = new Map([...projection.facts.artefacts].map(([name, row]) => [name, row.status]));
  const gateResult = (RESULT_ROWS[gate] ?? [gate]).map(type => statuses.get(type)).find(status => RESULTS.has(status)) ?? null;
  return { ok: true, run: Object.freeze({
    id,
    lifecycle,
    gate,
    decision,
    route: projection.route,
    gateResult,
    gateDecision: control.presentation_decision?.action ?? null,
    updatedAt,
    missing: clip(projection.facts.artefacts.get(gate)?.path || gate === 'UAT' ? control.missing_approval ?? '' : 'none'),
    next: clip(control.next_allowed_action ?? ''),
    approved: Object.freeze([...projection.facts.approvals].filter(([, row]) => row.status === 'approved').map(([name]) => name)),
    objective: isPlaceholderText(objective) ? '' : clip(objective),
  }) };
}

// Reads every run state below <projectRoot>/.agdf/control/runs through the injected file access
// ({ exists, list, read }, as `$.fs` provides). Never writes. A failing directory read is
// transient (status 'failed'); a single unreadable run state is reported per run. Without a
// control folder the snapshot names the checked project root, so the panel can say where it looked.
export async function readSnapshot(fs, projectRoot, { now }) {
  const runsDir = `${projectRoot}/.agdf/control/runs`;
  try {
    if (!(await fs.exists(`${projectRoot}/.agdf/control`))) return { status: 'no_control', root: projectRoot, runs: [], unreadable: [], readAt: now };
    if (!(await fs.exists(runsDir))) return { status: 'ok', runs: [], unreadable: [], readAt: now };
    const folders = (await fs.list(runsDir)).filter(entry => entry.kind === 'dir' && !entry.isLink);
    const results = await Promise.all(folders.map(folder => fs.read(`${runsDir}/${folder.name}/RUN_STATE.md`)
      .then(text => parseRunState(folder.name, text), () => ({ ok: false, id: folder.name, reason: 'missing' }))));
    return {
      status: 'ok',
      runs: results.filter(result => result.ok).map(result => result.run),
      unreadable: results.filter(result => !result.ok).map(({ id, reason }) => ({ id, reason })),
      readAt: now,
    };
  } catch (error) {
    return { status: 'failed', runs: [], unreadable: [], readAt: now, error: String(error?.message ?? error).slice(0, TEXT_LIMIT) };
  }
}

// A transient failure keeps the last good snapshot, marked stale with the failed read time (AC-006).
export function settleSnapshot(previous, next) {
  if (next.status !== 'failed' || !previous || previous.status === 'failed') return next;
  return { ...previous, stale: { failedAt: next.readAt, error: next.error } };
}
