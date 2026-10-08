import { relative, join, posix, sep } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { captureControlScope, fail, READ_LIMITS } from '../control-read/snapshot.js';
import { withControlReadView } from '../control-read/fs.js';
import { discoverRuns } from '../control-state/run-state-reader.js';
import { readRunState, readArtefactHeading } from '../control-evaluation/run-state.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { isSafeControlRelativePath } from '../control-state/contained-file.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { localePack, resolveHumanRunTitle } from '../interaction-presentation.js';
import { interactionLocales } from '../resources/context.js';
import { projectCockpitContext, composeCockpitPacket } from './cockpit-context.js';
import { projectCockpitBacklog, projectBacklogUrTitle } from './cockpit-backlog.js';

const CONTROL = '.agdf/control/';
const SUPPORTED = new Map([['md', 'markdown'], ['json', 'json'], ['txt', 'text'], ['log', 'text']]);
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
function boundedCode(error) {
  return ['resource_denied', 'source_changed', 'timeout', 'resource_limit', 'read_failed'].includes(error.code) ? error.code : 'read_failed';
}
const objective = content => content?.match(/(?:^|\n)## Objective\s*\n([\s\S]*?)(?=\n## |$)/)?.[1]?.trim() ?? null;

// Read-only projection of the evaluated decision, never a second gate evaluator.
// Doctor warnings are already considered by evaluateGateCheck; they are not a UI veto.
export function projectCockpitAssessment(report, lifecycle) {
  const state = lifecycle === 'completed' ? 'completed'
    : lifecycle !== 'active' ? 'unconfirmed'
    : report.status === 'blocked' || (report.blocking_reason && report.blocking_reason !== 'none')
      || (report.missing_approval && report.missing_approval !== 'none') ? 'blocked'
    : report.status === 'open' && report.blocking_reason === 'none' && report.missing_approval === 'none' ? 'open'
    : 'unconfirmed';
  return { state, authorizes: false };
}

export function createCockpitReader(root, options = {}) {
  let view = null, details = new Map(), documents = new Map();
  let graph = null, inspected = null, packet = null;
  let backlogRows = new Map(), backlogDigest = null;
  const invalidate = () => { packet = null; };
  const target = { target_id: resolveControlCommandTarget(root).target_id, display_path: root };
  const meta = () => ({ schema_version: '1', target, snapshot_id: view?.snapshot_id ?? null,
    observed_as_of: view?.observed_as_of ?? null, source_digest: view?.digest ?? null });
  const envelope = (data, state = 'available', code = null, retryable = false) => ({ ...meta(), state, code, retryable, data });
  function evaluation(state, report, lifecycle) {
    const pack = localePack(interactionLocales, 'de');
    const en = localePack(interactionLocales, 'en');
    const label = value => {
      for (const [source, localized] of [[en.operationalValues, pack.operationalValues], [en.primary?.actions, pack.primary?.actions], [en.primary?.afterApproval, pack.primary?.afterApproval]]) {
        const key = Object.keys(source ?? {}).find(k => source[k] === value);
        if (key && typeof localized?.[key] === 'string') return localized[key];
      }
      return null;
    };
    return {
      status: report.status, current_gate: report.current_gate, blocking_reason: report.blocking_reason,
      missing_approval: report.missing_approval, next_allowed_action: report.next_allowed_action,
      next_action_de: label(report.next_allowed_action), allowed: report.allowed, forbidden: report.forbidden,
      control_assessment: projectCockpitAssessment(report, lifecycle),
      doctor_status: report.doctor_status, quality_outlook: report.quality_outlook,
      diagnostics: [...(report.doctor_report?.findings ?? []), ...(report.delivery_map?.findings ?? [])],
      approvals: [...state.approvals].map(([gate, row]) => ({ gate, ...row })),
      missing_evidence: state.missing_evidence,
      git_evidence: 'unavailable',
    };
  }
  function manifest(runId, state) {
    const result = [];
    const paths = new Set();
    // The canonical state itself and each explicit Artefacts row are registrations.
    // The canonical state path is platform-native; registrations use POSIX separators.
    const rows = [{ type: 'Run State', path: state.path?.split(sep).join(posix.sep) }, ...[...state.artefacts].map(([type, row]) => ({ type, ...row }))];
    for (const row of rows) {
      const path = String(row.path ?? '').replace(/^`|`$/g, '').trim();
      if (!path || path === 'none' || paths.has(path)) continue;
      paths.add(path);
      const allowed = isSafeControlRelativePath(path) && path.startsWith(CONTROL);
      const resource = { resource_id: randomUUID(), run_id: runId, type: row.type, path: allowed ? path : null,
        registered_reference: path, status: allowed ? 'registered' : 'blocked' };
      result.push(resource); documents.set(resource.resource_id, resource);
    }
    return result;
  }
  // The canonical gate-check reads registered sources outside the control scope, which this
  // reader never opens. Report that as unevaluated instead of a divergent second evaluation.
  function outOfScopeEvaluation(state, paths) {
    return { status: 'not_evaluated', current_gate: state.current_gate, blocking_reason: 'not_evaluated',
      missing_approval: 'not_evaluated', next_allowed_action: state.next_allowed_action, next_action_de: null,
      allowed: [], forbidden: [], control_assessment: { state: 'unconfirmed', authorizes: false },
      doctor_status: 'not_evaluated', quality_outlook: 'not_evaluated',
      diagnostics: paths.map(path => ({ code: 'evaluation_out_of_scope', severity: 'warning', path,
        message: 'The gate evaluation depends on a registered source outside .agdf/control, which the cockpit does not read.',
        next_step: 'Check the current gate with the existing AGDF gate-check.' })),
      approvals: [...state.approvals].map(([gate, row]) => ({ gate, ...row })),
      missing_evidence: state.missing_evidence, git_evidence: 'unavailable' };
  }
  function detail(run) {
    const state = readRunState(root, { runId: run.run_id, ignoreRunIdEnv: true });
    const resources = manifest(run.run_id, state);
    const outside = resources.filter(r => r.status === 'blocked' && isSafeControlRelativePath(r.registered_reference)).map(r => r.registered_reference);
    const report = outside.length ? null : evaluateGateCheck(root, { runId: run.run_id, ignoreRunIdEnv: true });
    return { run_id: run.run_id, revision_id: run.meta.revision_id, lifecycle: run.meta.lifecycle,
      // The cockpit identifies the undertaking; the gate card can still name its current artefact.
      objective: objective(run.content), title: resolveHumanRunTitle({
        urHeading: readArtefactHeading(root, state.artefacts.get('UR')).replace(/^UR:\s*/i, ''),
        runContent: run.content, runId: run.run_id,
      }),
      evaluation: report ? evaluation(state, report, run.meta.lifecycle) : outOfScopeEvaluation(state, outside), persisted: { current_gate: state.current_gate, next_allowed_action: state.next_allowed_action,
        decision: run.meta.decision, artefacts: [...state.artefacts].map(([type, value]) => ({ type, ...value })) },
      context_graph: { refs: state.context_graph.refs }, resources };
  }
  function assertSnapshot(id) {
    if (!view || id !== view.snapshot_id) fail('resource_denied');
    try {
      view.revalidate();
    } catch (error) { invalidate(); inspected = null; graph = null; throw error; }
  }
  function readDocument(resourceId) {
      const resource = documents.get(resourceId);
      if (!resource) fail('resource_denied');
      if (resource.status === 'blocked') return envelope({ resource }, 'blocked', 'resource_denied');
      const format = SUPPORTED.get(resource.path.split('.').at(-1)?.toLowerCase());
      if (!view.existsSync(join(root, resource.path))) return envelope({ resource }, 'missing', 'document_missing', true);
      if (!format) return envelope({ resource }, 'unsupported', 'document_unsupported');
      const bytes = view.readFileSync(join(root, resource.path));
      if (bytes.length > READ_LIMITS.preview) return envelope({ resource, reason: 'preview_limit' }, 'unsupported', 'resource_limit');
      let content;
      try { content = decoder.decode(bytes); if (content.includes('\0')) throw Error(); }
      catch { return envelope({ resource, reason: 'invalid_utf8' }, 'unsupported', 'document_unsupported'); }
      const links = {};
      // A navigation map is private to this run. Unknown/external URLs stay inert in React.
      const resources = details.get(resource.run_id)?.data?.resources ?? [];
      for (const match of content.matchAll(/\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
        const href = match[1];
        if (/[:\\\0]/.test(href) || href.startsWith('/') || href.startsWith('#')) continue;
        let decoded;
        try { decoded = decodeURIComponent(href.split('#')[0]); } catch { continue; }
        const targetPath = decoded.startsWith(CONTROL) ? decoded : posix.normalize(posix.join(posix.dirname(resource.path), decoded));
        const registered = resources.find(r => r.path === targetPath && r.status === 'registered');
        if (registered) links[href] = registered.resource_id;
      }
      return envelope({ resource, format, content, content_digest: createHash('sha256').update(bytes).digest('hex'), links });
  }
  function discardScope() {
    invalidate(); inspected = null; graph = null; view = null;
    details = new Map(); documents = new Map();
    backlogRows = new Map(); backlogDigest = null;
  }
  function selectedRun(runId) {
    const run = discoverRuns(root).find(row => row.run_id === runId);
    if (!run) return { state: 'missing', code: 'run_missing', data: { kind: 'run', requested_run_id: runId, run: null } };
    if (!run.valid) return { state: 'invalid', code: 'invalid_run', data: { kind: 'run', requested_run_id: runId,
      run: { run_id: runId, revision_id: null, lifecycle: null, resources: [], diagnostics: run.findings } } };
    const data = detail(run);
    details.set(runId, { state: 'available', code: null, data });
    return { state: 'available', code: null, data: { kind: 'run', run: data } };
  }
  function replaceScope(project) {
    // Incoming opaque selectors have already been checked. Drop retained bytes
    // before recording a candidate; a failed candidate never restores them.
    discardScope();
    try {
      const captured = captureControlScope(root, candidate => {
        view = candidate; details = new Map(); documents = new Map(); graph = null; inspected = null;
        return project();
      }, options);
      view = captured.view;
      return envelope(captured.data.data, captured.data.state, captured.data.code, !!captured.data.code);
    } catch (error) { discardScope(); return envelope(null, 'error', boundedCode(error), true); }
  }
  const sameRegistration = (a, b) => a.run_id === b.run_id && a.type === b.type && a.registered_reference === b.registered_reference;
  function backlogScope(removedRunId = null, titleRows = [], expectedDigest = null) {
    const result = projectCockpitBacklog(root);
    backlogRows = new Map(); backlogDigest = result.data?.content_digest ?? null;
    if (expectedDigest && backlogDigest !== expectedDigest) fail('source_changed');
    if (result.data) result.data.entries.forEach((row, index) => {
      row.row_id = randomUUID(); backlogRows.set(row.row_id, index);
      if (titleRows.includes(index)) row.title_observation = projectBacklogUrTitle(root, view, row, backlogDigest);
    });
    if (result.data) Object.assign(result.data, { file_count: view.file_count, byte_count: view.byte_count,
      ...(removedRunId ? { removed_run_id: removedRunId } : {}) });
    return result;
  }
  function reopenRun(runId, wasInspected) {
    const selected = selectedRun(runId);
    return selected.code === 'run_missing' && wasInspected ? backlogScope(runId) : selected;
  }
  function selectedDocument(previous, runId) {
    const selected = selectedRun(runId);
    if (selected.state !== 'available') return selected;
    const resource = selected.data.run.resources.find(row => sameRegistration(row, previous));
    if (!resource) return { state: 'missing', code: 'document_removed', data: { kind: 'document', run: selected.data.run, document: null } };
    const document = readDocument(resource.resource_id);
    if (document.state === 'available') inspected = { resource_id: resource.resource_id, run_id: runId, snapshot_id: view.snapshot_id };
    return { state: document.state, code: document.code, data: { kind: 'document', run: selected.data.run, document: document.data } };
  }
  return Object.freeze({
    snapshot(runId) {
      if (runId !== undefined && !/^[A-Za-z0-9_-]{1,128}$/.test(runId)) fail('resource_denied');
      const wasInspected = details.get(runId)?.state === 'available';
      return replaceScope(() => {
        if (view.control_absent) return { state: 'missing', code: 'control_absent', data: null };
        if (runId) return reopenRun(runId, wasInspected);
        return backlogScope();
      });
    },
    run(runId, id) {
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(runId)) fail('resource_denied');
      assertSnapshot(id);
      const wasInspected = details.get(runId)?.state === 'available';
      return replaceScope(() => reopenRun(runId, wasInspected));
    },
    backlogTitles(rowIds, id) {
      if (!Array.isArray(rowIds) || !rowIds.length || rowIds.length > 12 || new Set(rowIds).size !== rowIds.length
        || rowIds.some(row => !backlogRows.has(row))) fail('resource_denied');
      assertSnapshot(id);
      const rows = rowIds.map(row => backlogRows.get(row)), digest = backlogDigest;
      return replaceScope(() => backlogScope(null, rows, digest));
    },
    document(resourceId, id, runId) {
      // Check selectors before revalidation or replacing the legitimate view.
      const previous = documents.get(resourceId);
      if (!previous || runId !== undefined && previous.run_id !== runId) fail('resource_denied');
      assertSnapshot(id);
      return replaceScope(() => selectedDocument(previous, previous.run_id));
    },
    context(runId, id) {
      if (!details.has(runId)) fail('resource_denied');
      assertSnapshot(id);
      const previous = inspected ? documents.get(inspected.resource_id) : null;
      return replaceScope(() => {
        const selected = previous ? selectedDocument(previous, runId) : selectedRun(runId);
        if (selected.state !== 'available') return selected;
        const run = selected.data.run;
        graph = projectCockpitContext(view, root, runId, run.context_graph.refs);
        return { state: !graph.references.length ? 'empty' : graph.references.some(ref => ref.state !== 'available') ? 'partial' : 'available', code: null,
          data: { kind: 'context', run, document: selected.data.document ?? null, context: graph } };
      });
    },
    prepareContext(input) {
      invalidate(); assertSnapshot(input.snapshot_id);
      const selected = details.get(input.run_id)?.data;
      if (!selected || selected.revision_id !== input.revision_id
        || inspected?.snapshot_id !== input.snapshot_id || inspected?.run_id !== input.run_id
        || inspected?.resource_id !== input.resource_id || documents.get(input.resource_id)?.run_id !== input.run_id) fail('resource_denied');
      if (!graph || graph.run_id !== input.run_id) graph = projectCockpitContext(view, root, input.run_id, selected.context_graph.refs);
      const document = readDocument(input.resource_id);
      if (document.state !== 'available') return envelope(null, 'blocked', 'context_unavailable');
      const composed = composeCockpitPacket({ ...meta(), run_id: input.run_id, revision_id: input.revision_id }, document.data, graph, input);
      // Even limit failures must not report measurements against a changed capture.
      assertSnapshot(input.snapshot_id);
      if (!composed.packet) return envelope({ byte_count: composed.byte_count, limit: composed.limit }, 'blocked', 'context_limit');
      packet = composed.packet;
      return envelope({ packet, byte_count: composed.byte_count, limit: composed.limit });
    },
    validateContext(contextId, generation) {
      if (!packet || packet.context_id !== contextId || packet.generation !== generation) return envelope(null, 'blocked', 'context_superseded');
      assertSnapshot(packet.snapshot_id);
      return envelope({ context_id: contextId, generation, current: true });
    },
    invalidateContext() { invalidate(); return envelope({ invalidated: true }); },
    freshness(id) { assertSnapshot(id); return envelope({ unchanged: true }); },
    dependencies() { return view?.dependencies ?? []; },
  });
}
