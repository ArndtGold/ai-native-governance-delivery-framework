// Run view reader (SD SDD-010): obtains the Core run view through the plugin runtime's read-only
// `run-view` command and maps it to the companion's runs. The companion derives no run semantics of
// its own: status, gate path, missing approval, next step and figure come from the status card's
// evaluator. Process access is injected by the host ({ run(argv, init) }, as `$.process` provides).

export const RUN_VIEW_SCHEMA = 'run-view/1';
export const RUN_VIEW_TIMEOUT_MS = 10_000;
// Why a run-view read failed; each has a catalog text under `unreadable` (shown with the failure).
export const READ_FAILURE_REASONS = Object.freeze(['timeout', 'unavailable', 'exit', 'malformed', 'source_changed']);
// Store reasons of a read that may succeed on the next attempt (a write during the read, the read
// budget); they keep the last good view, marked stale, like a failed read (CR delta review RV-1).
export const TRANSIENT_STORE_REASONS = Object.freeze(['source_changed', 'timeout']);
// The internal steps between an approved TP and QA, shown as the build phase in the gate bar.
export const BUILD_GATES = Object.freeze(['Brownfield Analysis', 'CD+Tests', 'CR']);
export const isStructured = route => route === 'structured_delivery' || route === 'structured_slice';
const TEXT_LIMIT = 240;
const clip = text => { const value = String(text ?? ''); return value.length > TEXT_LIMIT ? `${value.slice(0, TEXT_LIMIT - 1)}…` : value; };

// The only command the companion runs: the read-only run view of one project root.
export function runViewArgv({ pluginRoot, root, language, runIds = [] }) {
  return ['node', `${pluginRoot}/runtime/agdf-local.js`, 'run-view', '--dir', root, '--json', '--language', language,
    ...runIds.flatMap(runId => ['--run', runId])];
}

// One run-view entry as the companion's run.
export function companionRun(entry) {
  return Object.freeze({
    id: entry.run_id,
    lifecycle: entry.lifecycle,
    evaluated: entry.evaluated === true,
    gate: entry.current_gate ?? null,
    route: entry.mode ?? null,
    updatedAt: entry.last_activity ?? '',
    missing: entry.missing_approval ?? 'none',
    next: entry.next_step ?? '',
    nextText: entry.next_step_text ?? '',
    blockingText: entry.blocking_text ?? '',
    path: Object.freeze((entry.path ?? []).map(({ gate, status }) => Object.freeze({ gate, status }))),
    figure: entry.figure,
    // Bound documents changed after recording (SDD-008), as the run view reports them.
    drift: Object.freeze((entry.drift ?? []).map(item => Object.freeze({ ...item }))),
    // The authored objective, never the status card's run title or a template text.
    objective: clip(entry.objective ?? ''),
  });
}

// stdout of the command as a snapshot: { status, root, runs, unreadable, diagnosis, readAt }.
// status is ok, no_control, unavailable (store diagnosis with reason) or failed (no usable view).
export function snapshotFromRunView(stdout, { now }) {
  let view;
  try { view = JSON.parse(stdout); } catch { return { status: 'failed', runs: [], unreadable: [], readAt: now, error: 'malformed' }; }
  if (view?.schema_version !== RUN_VIEW_SCHEMA || !Array.isArray(view.runs) || !view.store) {
    return { status: 'failed', runs: [], unreadable: [], readAt: now, error: 'malformed' };
  }
  if (view.store.status === 'unavailable' && TRANSIENT_STORE_REASONS.includes(view.store.reason)) {
    return { status: 'failed', runs: [], unreadable: [], readAt: now, error: view.store.reason };
  }
  // A run read while its files changed (after the run view's bounded retries) makes the view incomplete;
  // like a transient store failure it keeps the last good view instead of showing that run as blocked.
  const changedRun = view.runs.find(run => TRANSIENT_STORE_REASONS.includes(run?.evaluation_error));
  if (changedRun) return { status: 'failed', runs: [], unreadable: [], readAt: now, error: changedRun.evaluation_error };
  const status = view.store.status === 'ok' ? 'ok' : view.store.status === 'no_control' ? 'no_control' : 'unavailable';
  return {
    status,
    root: view.root,
    reason: view.store.reason ?? null,
    // The run folders of an unsupported store, which the run view counts without reading them (AC-002).
    runFolders: Number.isSafeInteger(view.store.run_folders) && view.store.run_folders > 0 ? view.store.run_folders : null,
    runs: view.runs.filter(entry => entry.valid !== false && entry.listed !== false).map(companionRun),
    unreadable: (view.diagnosis?.unreadable ?? []).map(({ run_id, reason }) => ({ id: run_id, reason })),
    diagnosis: view.diagnosis ?? null,
    readAt: now,
  };
}

// Runs the command through the host and never throws: a process failure, a timeout or malformed
// output is a failed snapshot with its cause, which the adapter settles as stale.
export async function readSnapshot(processes, { pluginRoot, root, language, runIds = [], now, clock = () => Date.now() }) {
  let ran;
  const started = await clock();
  try {
    ran = await processes.run(runViewArgv({ pluginRoot, root, language, runIds }), { timeoutMs: RUN_VIEW_TIMEOUT_MS });
  } catch {
    // `$.process.run` rejects when the command cannot start or is still running at the timeout; its
    // message format is not specified, so the elapsed time tells the two apart (CR finding CIR-06).
    const elapsed = (await clock()) - started;
    return { status: 'failed', runs: [], unreadable: [], readAt: now, error: elapsed >= RUN_VIEW_TIMEOUT_MS ? 'timeout' : 'unavailable' };
  }
  if (ran.exitCode !== 0 && ran.exitCode !== 2) return { status: 'failed', runs: [], unreadable: [], readAt: now, error: 'exit' };
  return snapshotFromRunView(ran.stdout, { now });
}

// A transient failure keeps the last good snapshot, marked stale with the failed read time (AC-006).
export function settleSnapshot(previous, next) {
  if (next.status !== 'failed' || !previous || previous.status === 'failed') return next;
  return { ...previous, stale: { failedAt: next.readAt, error: next.error } };
}
