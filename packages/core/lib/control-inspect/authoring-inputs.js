import { inspectArtefactRecordingMode } from '../control-state/run-artefact-recording.js';
import { readFileSync, statSync } from '../control-read/fs.js';
import { captureControlScope } from '../control-read/snapshot.js';
import { readRunState } from '../control-evaluation/run-state.js';
import { runSealState, artefactFileDigest, canonicalRunText } from '../control-state/run-seal.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { operationContract } from '../control-state/run-command-contract.js';
import { resolveArtefactTemplatePath } from '../resources/artefact-templates.js';
import { digest, resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';

const templateId = gate => ({ UR: 'UR', PRD: 'PRD', SD: 'SD', TP: 'TP', QA: 'QA_REPORT', OR: 'OR',
  'Brownfield Review': 'BROWNFIELD_REVIEW', 'Brownfield Analysis': 'BROWNFIELD_REVIEW', 'Mode/Slice Decision': 'BROWNFIELD_REVIEW',
  'UX Intent Definition': 'UX_INTENT_DEFINITION', 'Verified Change Execution': 'VERIFIED_CHANGE' })[gate];

// One contained source projection plus the existing version-bound template owner.
// Its paged text is input, never a presentation, edit permission or review attestation.
export function inspectAuthoringInputs(root, input, { gitObservation } = {}) {
  const unavailable = reason => ({ available: false, reason, authorizes: false });
  try {
    const observeGit = () => gitObservation ? { head: gitObservation.gitValue(root, ['rev-parse', 'HEAD']),
      tracked: gitObservation.gitPathList(root, ['diff', 'HEAD', '--name-only']),
      untracked: gitObservation.gitPathList(root, ['ls-files', '--others', '--exclude-standard']) } : null;
    const git = observeGit(), observedGit = git ? { gitValue: () => git.head,
      gitPathList: (_root, args) => args[0] === 'diff' ? git.tracked : git.untracked } : undefined;
    const captured = captureControlScope(root, () => {
      const state = readRunState(root, { runId: input.run_id, ignoreRunIdEnv: true });
      if (state.resolution_error || state.meta?.revision_id !== input.expected_revision_id || runSealState(root, state.content).status !== 'valid') throw Error('authoring_binding_stale_or_invalid');
      const evaluated = evaluateGateCheck(root, { runId: input.run_id, ignoreRunIdEnv: true, presentationLanguage: input.presentation_language }, observedGit);
      const rows = [...state.artefacts].filter(([, r]) => r.path).map(([type, row]) => ({ type, ...row }));
      if (rows.length > 16) throw Error('authoring_source_limit');
      const sources = rows.map(row => {
        const path = row.path.replace(/^`|`$/gu, '');
        if (!path.startsWith(`.agdf/control/artefacts/${input.run_id}/`) || hasSymlinkComponent(root, path)) throw Error('authoring_source_unavailable');
        const file = containedRegularFile(root, path);
        if (file.status !== 'valid' || statSync(file.path).size > 131072) throw Error('authoring_source_unavailable');
        const content = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(file.path));
        return { type: row.type, path, status: row.status, digest: artefactFileDigest(root, path), content };
      });
      return { gate: evaluated.current_gate, authoring_owner: evaluated.next_operation?.type === 'record_closeout' ? 'OR'
        : evaluated.next_operation?.analysis ?? evaluated.next_operation?.gate ?? evaluated.current_gate,
        recording: inspectArtefactRecordingMode(state, evaluated.current_gate), mode: state.mode_slice_decision?.decision, next_operation: evaluated.next_operation, status: evaluated.status,
        blocking_reason: evaluated.blocking_reason, sources };
    });
    const data = captured.data, ids = [data.gate === 'OR' && data.mode === 'verified_change' ? 'VERIFIED_CHANGE' : templateId(data.authoring_owner),
      ...(['Brownfield Review', 'Mode/Slice Decision'].includes(data.gate) ? ['VERIFIED_CHANGE'] : [])].filter(Boolean);
    const templates = ids.map(id => {
      const path = resolveArtefactTemplatePath(id);
      if (statSync(path).size > 131072) throw Error('authoring_template_limit');
      const content = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(path));
      return { role: 'template', type: id, digest: digest(canonicalRunText(content)), content, source: 'version_matched_plugin' };
    });
    const documents = [...templates, ...data.sources.map(s => ({ role: 'source', ...s }))];
    const manifest = digest(JSON.stringify({ target_id: resolveControlCommandTarget(root).target_id, run_id: input.run_id,
      revision_id: input.expected_revision_id, gate: data.gate, authoring_owner: data.authoring_owner, recording: data.recording, documents: documents.map(({ content, ...r }) => r) })).slice(7);
    const chunks = [];
    for (const document of documents) {
      const { content, ...metadata } = document, bytes = Buffer.from(content);
      for (let start = 0; start < bytes.length;) {
        let end = Math.min(start + 16384, bytes.length);
        while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
        chunks.push({ ...metadata, content: bytes.subarray(start, end).toString('utf8'), byte_start: start, byte_end: end, total_bytes: bytes.length });
        start = end;
      }
    }
    const prefix = `${manifest}:`;
    if (input.cursor !== undefined && (!input.cursor.startsWith(prefix) || !/^(0|[1-9][0-9]*)$/u.test(input.cursor.slice(prefix.length)))) throw Error('authoring_cursor_stale_or_invalid');
    const index = input.cursor === undefined ? 0 : Number(input.cursor.slice(prefix.length));
    if (!Number.isSafeInteger(index) || index < 0 || index >= Math.max(chunks.length, 1)) throw Error('authoring_cursor_stale_or_invalid');
    captured.view.revalidate();
    if (JSON.stringify(observeGit()) !== JSON.stringify(git)) throw Error('authoring_binding_stale_or_invalid');
    return { available: true, run_id: input.run_id, revision_id: input.expected_revision_id, gate: data.gate, mode: data.mode,
      authoring_owner: data.authoring_owner, recording: data.recording,
      status: data.status, blocking_reason: data.blocking_reason, next_operation: data.next_operation,
      manifest_digest: `sha256:${manifest}`, documents: documents.map(({ content, ...r }) => r),
      chunk: chunks[index] ?? null, complete: index + 1 >= chunks.length, next_cursor: index + 1 < chunks.length ? `${prefix}${index + 1}` : null,
      formats: data.authoring_owner === 'OR' ? operationContract('agdf_closeout', 'closeout.record')
        : operationContract('agdf_record', ['PRD', 'SD', 'TP', 'QA'].includes(data.authoring_owner) ? 'artefact.record' : 'step.record', { gate: data.authoring_owner }),
      material_transport: { tool: 'agdf_record', kind: 'material.stage', limits: { request_bytes: 65536, part_bytes: 16384, source_bytes: 131072 },
        instructions: 'Read all chunks. Stage exact permitted material; seal to obtain identity. Record via the eligible typed writer with explicit cooperative review. No file/path discovery or shell hashing.' }, authorizes: false };
  } catch (e) { return unavailable(e.code ?? e.message); }
}
