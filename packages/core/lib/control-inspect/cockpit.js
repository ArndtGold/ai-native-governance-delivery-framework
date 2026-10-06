import { relative, join, posix } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { captureControl, fail, READ_LIMITS } from '../control-read/snapshot.js';
import { withControlReadView } from '../control-read/fs.js';
import { discoverRuns } from '../control-state/run-state-reader.js';
import { readRunState, readArtefactHeading } from '../control-evaluation/run-state.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { isSafeControlRelativePath } from '../control-state/contained-file.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { localePack, resolveHumanRunTitle } from '../interaction-presentation.js';
import { interactionLocales } from '../resources/context.js';
import { projectCockpitContext, composeCockpitPacket } from './cockpit-context.js';

const CONTROL = '.agdf/control/';
const SUPPORTED = new Map([['md', 'markdown'], ['json', 'json'], ['txt', 'text'], ['log', 'text']]);
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
function boundedCode(error) {
  return ['resource_denied', 'source_changed', 'timeout', 'resource_limit', 'read_failed'].includes(error.code) ? error.code : 'read_failed';
}
const objective = content => content?.match(/(?:^|\n)## Objective\s*\n([\s\S]*?)(?=\n## |$)/)?.[1]?.trim() ?? null;

export function createCockpitReader(root, options = {}) {
  let view = null, runs = [], details = new Map(), documents = new Map();
  let graph = null, inspected = null, packet = null;
  const invalidate = () => { packet = null; };
  const target = { target_id: resolveControlCommandTarget(root).target_id, display_path: root };
  const meta = () => ({ schema_version: '1', target, snapshot_id: view?.snapshot_id ?? null,
    observed_as_of: view?.observed_as_of ?? null, source_digest: view?.digest ?? null });
  const envelope = (data, state = 'available', code = null, retryable = false) => ({ ...meta(), state, code, retryable, data });
  function evaluation(state, report) {
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
    const rows = [{ type: 'Run State', path: state.path }, ...[...state.artefacts].map(([type, row]) => ({ type, ...row }))];
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
  function detail(run) {
    const state = readRunState(root, { runId: run.run_id, ignoreRunIdEnv: true });
    const report = evaluateGateCheck(root, { runId: run.run_id, ignoreRunIdEnv: true, presentationLanguage: 'de' });
    const resources = manifest(run.run_id, state);
    return { run_id: run.run_id, revision_id: run.meta.revision_id, lifecycle: run.meta.lifecycle,
      // The cockpit identifies the undertaking; the gate card can still name its current artefact.
      objective: objective(run.content), title: resolveHumanRunTitle({
        urHeading: readArtefactHeading(root, state.artefacts.get('UR')).replace(/^UR:\s*/i, ''),
        runContent: run.content, runId: run.run_id,
      }),
      evaluation: evaluation(state, report), persisted: { current_gate: state.current_gate, next_allowed_action: state.next_allowed_action,
        decision: run.meta.decision, artefacts: [...state.artefacts].map(([type, value]) => ({ type, ...value })) },
      context_graph: { refs: state.context_graph.refs }, resources };
  }
  function assertSnapshot(id) {
    try {
      if (!view || id !== view.snapshot_id) fail('source_changed');
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
  return Object.freeze({
    snapshot() {
      // Destroy old selectors even when a replacement fails.
      invalidate(); inspected = null; graph = null;
      view = null; details = new Map(); documents = new Map(); runs = [];
      try {
        view = captureControl(root, options);
        if (view.control_absent) return envelope(null, 'missing', 'control_absent', true);
        const inventory = withControlReadView(view, () => discoverRuns(root));
        const deadline = Date.now() + READ_LIMITS.timeout;
        runs = inventory.map(run => {
          if (Date.now() > deadline) fail('timeout');
          const base = { run_id: run.run_id, valid: run.valid, lifecycle: run.meta?.lifecycle ?? null,
            revision_id: run.meta?.revision_id ?? null, objective: objective(run.content), title: objective(run.content) ?? run.run_id,
            source_path: relative(root, run.path), status: null, current_gate: null, code: null };
          if (!run.valid) { details.set(run.run_id, { state: 'invalid', code: 'invalid_run', data: { ...base, diagnostics: run.findings, resources: [] } }); return { ...base, code: 'invalid_run' }; }
          try {
            const data = withControlReadView(view, () => detail(run));
            details.set(run.run_id, { state: 'available', code: null, data });
            return { ...base, title: data.title, status: data.evaluation.status, current_gate: data.evaluation.current_gate,
              attention: { blocking_reason: data.evaluation.blocking_reason, missing_approval: data.evaluation.missing_approval,
                missing_evidence_count: data.evaluation.missing_evidence.length } };
          } catch (error) {
            const code = boundedCode(error);
            details.set(run.run_id, { state: 'blocked', code, data: { ...base, resources: [] } });
            return { ...base, code };
          }
        });
        view.revalidate();
        const partial = runs.some(run => !run.valid || run.code);
        return envelope({ runs, file_count: view.file_count, byte_count: view.byte_count }, partial ? 'partial' : runs.length ? 'available' : 'empty', partial ? 'inventory_partial' : null);
      } catch (error) { view = null; return envelope(null, 'error', boundedCode(error), true); }
    },
    run(runId, id) {
      invalidate(); inspected = null;
      if (graph?.run_id !== runId) graph = null;
      assertSnapshot(id);
      const selected = details.get(runId);
      if (!selected) return envelope({ run_id: runId, resources: [] }, 'missing', 'run_removed', true);
      return envelope(selected.data, selected.state, selected.code, selected.code === 'read_failed');
    },
    document(resourceId, id) {
      assertSnapshot(id); invalidate(); inspected = null;
      const result = readDocument(resourceId);
      if (result.state === 'available') inspected = { resource_id: resourceId, run_id: result.data.resource.run_id, snapshot_id: id };
      return result;
    },
    context(runId, id) {
      assertSnapshot(id);
      if (inspected && inspected.run_id !== runId) { invalidate(); inspected = null; }
      const selected = details.get(runId);
      if (selected?.state !== 'available') return envelope(null, 'blocked', 'resource_denied');
      if (!graph || graph.run_id !== runId) graph = projectCockpitContext(view, root, runId, selected.data.context_graph.refs);
      return envelope(graph, !graph.references.length ? 'empty' : graph.references.some(ref => ref.state !== 'available') ? 'partial' : 'available');
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
  });
}
