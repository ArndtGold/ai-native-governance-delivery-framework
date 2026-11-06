import { MATERIAL_LIMITS } from '../control-state/material-limits.js';
import { AUTHORING_TEXT_HANDOFF } from '../control-state/authoring-text-handoff.js';
import { approvalSummaryAuthoringFormat } from '../control-state/run-presentation-render.js';
import { resolveArtifactPresentationLanguages } from '../resources/context.js';
import { runDocumentPath } from '../control-state/run-identity.js';
import { preparedCommandCall } from '../control-state/prepared-control-calls.js';
import { inspectArtefactRecordingMode } from '../control-state/run-artefact-recording.js';
import { readFileSync, statSync } from '../control-read/fs.js';
import { captureControlScope } from '../control-read/snapshot.js';
import { readRunState } from '../control-evaluation/run-state.js';
import { runSealState, artefactFileDigest, canonicalRunText } from '../control-state/run-seal.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { operationContract } from '../control-state/run-command-contract.js';
import { resolveArtefactTemplatePath } from '../resources/artefact-templates.js';
import { digest, resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { inspectDefinitionSources } from '../control-evaluation/definition-sources.js';
import { prdDefinitionEligible } from '../skill-dispatch/prd-definition.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { inspectPlannedEntry, inspectPlannedSelection } from '../control-state/planned-entry.js';
import { assertPlannedNotTransferred } from '../control-state/planned-origin-reader.js';
import { parseControlState } from '../control-state/run-state-parser.js';

const templateId = gate => ({ UR: 'UR', PRD: 'PRD', SD: 'SD', TP: 'TP', QA: 'QA_REPORT', OR: 'OR',
  'Brownfield Review': 'BROWNFIELD_REVIEW', 'Brownfield Analysis': 'BROWNFIELD_REVIEW', 'Mode/Slice Decision': 'BROWNFIELD_REVIEW',
  'UX Intent Definition': 'UX_INTENT_DEFINITION', 'Verified Change Execution': 'VERIFIED_CHANGE' })[gate];

// One contained source projection plus the existing version-bound template owner.
// Its paged text is input, never a presentation, edit permission or review attestation.
export function inspectAuthoringInputs(root, input, { gitObservation } = {}) {
  const unavailable = reason => ({ available: false, reason, authorizes: false });
  try {
    const observeGit = () => !input.planning && gitObservation ? { head: gitObservation.gitValue(root, ['rev-parse', 'HEAD']),
      tracked: gitObservation.gitPathList(root, ['diff', 'HEAD', '--name-only']),
      untracked: gitObservation.gitPathList(root, ['ls-files', '--others', '--exclude-standard']) } : null;
    const git = observeGit(), observedGit = git ? { gitValue: () => git.head,
      gitPathList: (_root, args) => args[0] === 'diff' ? git.tracked : git.untracked } : undefined;
    const captured = captureControlScope(root, () => {
      const languages = resolveArtifactPresentationLanguages(root, input.presentation_language);
      if (input.planning) {
        inspectPlannedSelection(root, input.planning, { presentationLanguage: input.presentation_language });
        const creating = input.planning.expected_digest === null;
        const entry = creating ? null : inspectPlannedEntry(root, input.planning.plan_id, { presentationLanguage: input.presentation_language });
        if (!creating) assertPlannedNotTransferred(root, input.planning.plan_id);
        const kind = creating ? 'planned_ur.create' : 'planned_ur.replace';
        return { languages, gate: null, authoring_owner: 'UR', mode: 'planning', recording: { mode: creating ? 'create_planned' : 'replace_planned', kind },
          next_operation: { type: 'author_planned_ur', skill_id: 'ur-definition', kind }, status: 'draft', blocking_reason: null,
          sources: entry ? [{ type: 'UR', path: entry.path, status: 'draft', digest: entry.digest, content: entry.content }] : [] };
      }
      const state = readRunState(root, { runId: input.run_id, ignoreRunIdEnv: true });
      if (state.resolution_error || state.meta?.revision_id !== input.expected_revision_id || runSealState(root, state.content).status !== 'valid') throw Error('authoring_binding_stale_or_invalid');
      const evaluated = evaluateGateCheck(root, { runId: input.run_id, ignoreRunIdEnv: true, presentationLanguage: input.presentation_language }, observedGit);
      const protectedSources = parseControlState(state.content, { closeoutArtefacts: ['Planned UR Snapshot', 'Planned UR Origin'] }).artefacts;
      const rows = [...new Map([...state.artefacts, ...protectedSources])].filter(([, r]) => r.path).map(([type, row]) => ({ type, ...row }));
      if (rows.length > 32) throw Error('authoring_source_limit');
      const sources = rows.map(row => {
        const path = row.path.replace(/^`|`$/gu, '');
        if (!path.startsWith(`${runDocumentPath(input.run_id, '')}/`) || hasSymlinkComponent(root, path)) throw Error('authoring_source_unavailable');
        const file = containedRegularFile(root, path);
        if (file.status !== 'valid' || statSync(file.path).size > 131072) throw Error('authoring_source_unavailable');
        const content = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(file.path));
        return { type: row.type, path, status: row.status, digest: artefactFileDigest(root, path), content };
      });
      // Match dispatch's initial UX prerequisite route as well as source reassessment.
      // Reuse its eligibility and contained-source facts; inspection grants no repair permission.
      const prdEligible = prdDefinitionEligible(evaluated, { ...input, skill_id: 'prd-definition' });
      const uxRequired = prdEligible && inspectDefinitionSources(root, state, input.run_id, 'PRD', ['UR', 'Brownfield Review']).issue?.repairable;
      const nextOperation = uxRequired ? { type: 'reassess_source_analysis', skill_id: 'ux-intent-definition', analysis: 'UX Intent Definition' } : evaluated.next_operation;
      return { languages, gate: evaluated.current_gate, authoring_owner: nextOperation?.type === 'record_closeout' ? 'OR'
        : nextOperation?.analysis ?? nextOperation?.gate ?? evaluated.current_gate,
        recording: inspectArtefactRecordingMode(state, evaluated.current_gate), mode: state.mode_slice_decision?.decision, next_operation: nextOperation, status: evaluated.status,
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
    const sources = data.sources.map(s => ({ role: 'source', ...s }));
    const currentDraft = sources.find(source => source.type === data.authoring_owner);
    // The source being corrected must not move behind unrelated, growing sources.
    // Keep the legacy template-first view; bundles put the current source first.
    const documents = input.bundle && currentDraft
      ? [currentDraft, ...templates, ...sources.filter(source => source !== currentDraft)]
      : [...templates, ...sources];
    if (documents.length > 32) throw Error('authoring_source_limit');
    const manifest = digest(JSON.stringify({ target_id: resolveControlCommandTarget(root).target_id, run_id: input.run_id,
      ...(input.planning ? { planning: input.planning } : {}),
      revision_id: input.expected_revision_id, languages: data.languages, ...(input.bundle ? { bundle: 2 } : {}), gate: data.gate, authoring_owner: data.authoring_owner, recording: data.recording, documents: documents.map(({ content, ...r }) => r) })).slice(7);
    const chunks = [];
    for (const document of documents) {
      const { content, ...metadata } = document, bytes = Buffer.from(content);
      if (input.bundle && !bytes.length) chunks.push({ ...metadata, content: '', byte_start: 0, byte_end: 0, total_bytes: 0 });
      for (let start = 0; start < bytes.length;) {
        let end = Math.min(start + 16384, bytes.length);
        while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
        let chunk;
        for (;;) {
          chunk = { ...metadata, content: bytes.subarray(start, end).toString('utf8'), byte_start: start, byte_end: end, total_bytes: bytes.length };
          if (!input.bundle || Buffer.byteLength(JSON.stringify([chunk])) <= 48128) break;
          end = start + Math.floor((end - start) / 2);
          while (end > start && (bytes[end] & 0xc0) === 0x80) end--;
          if (end <= start) throw Error('authoring_metadata_limit');
        }
        chunks.push(chunk);
        start = end;
      }
    }
    const pages = [];
    if (input.bundle) {
      for (const chunk of chunks) {
        const last = pages.at(-1);
        if (!last || Buffer.byteLength(JSON.stringify([...last, chunk])) > 48128) pages.push([chunk]);
        else last.push(chunk);
      }
    }
    const selection = input.bundle ? pages : chunks;
    const prefix = `${manifest}:`;
    if (input.cursor !== undefined && (!input.cursor.startsWith(prefix) || !/^(0|[1-9][0-9]*)$/u.test(input.cursor.slice(prefix.length)))) throw Error('authoring_cursor_stale_or_invalid');
    const index = input.cursor === undefined ? 0 : Number(input.cursor.slice(prefix.length));
    if (!Number.isSafeInteger(index) || index < 0 || index >= Math.max(selection.length, 1)) throw Error('authoring_cursor_stale_or_invalid');
    captured.view.revalidate();
    if (JSON.stringify(observeGit()) !== JSON.stringify(git)) throw Error('authoring_binding_stale_or_invalid');
    const grouped = new Map();
    for (const part of pages[index] ?? []) {
      const key = JSON.stringify([part.role, part.type, part.path, part.digest]);
      const prior = grouped.get(key);
      if (prior) {
        if (prior.byte_end !== part.byte_start) throw Error('authoring_fragment_order_invalid');
        prior.content += part.content; prior.byte_end = part.byte_end;
      } else grouped.set(key, { ...part });
    }
    const documentRows = [...grouped.values()].map(row => ({ ...row, complete: row.byte_start === 0 && row.byte_end === row.total_bytes }));
    const documentPage = { documents: documentRows.filter(row => row.complete), fragments: documentRows.filter(row => !row.complete) };
    if (input.bundle && Buffer.byteLength(JSON.stringify(documentPage)) > 49152) throw Error('authoring_page_limit');
    const pageCall = page => ({ tool: 'agdf_inspect', arguments: { operation: 'authoring-inputs',
      ...Object.fromEntries(['presentation_language', 'working_directory', 'primary_target', 'target_source', 'target_id',
        'run_id', 'expected_revision_id', 'planning', 'bundle'].filter(key => input[key] !== undefined).map(key => [key, input[key]])),
      cursor: `${prefix}${page}` } });
    const draftRow = currentDraft && documentRows.find(row => row.role === 'source' && row.type === currentDraft.type && row.path === currentDraft.path && row.digest === currentDraft.digest);
    const draftPage = input.bundle && currentDraft ? pages.findIndex(page => page.some(row => row.role === 'source'
      && row.type === currentDraft.type && row.path === currentDraft.path && row.digest === currentDraft.digest && row.byte_start === 0)) : -1;
    const nextPage = index + 1 < selection.length ? pageCall(index + 1) : null;
    const registeredUr = data.authoring_owner === 'UR' && data.sources.some(source => source.type === 'UR' && source.path);
    const formats = input.planning ? operationContract('agdf_record', data.recording.kind)
      : registeredUr ? operationContract('agdf_revise', 'ur_draft.replace', { gate: 'UR' }) : data.authoring_owner === 'OR' ? operationContract('agdf_closeout', 'closeout.record')
      : operationContract('agdf_record', ['PRD', 'SD', 'TP', 'QA'].includes(data.authoring_owner) ? 'artefact.record' : 'step.record', { gate: data.authoring_owner });
    const summaryFormat = approvalSummaryAuthoringFormat(data.authoring_owner, currentDraft?.content ?? '', data.languages);
    return { available: true, ...data.languages, run_id: input.run_id, revision_id: input.expected_revision_id, gate: data.gate, mode: data.mode,
      ...(input.planning ? { planning: input.planning, canonical_skill: 'ur-definition' } : {}),
      authoring_owner: data.authoring_owner, recording: data.recording,
      ...(summaryFormat ? { approval_summary_format: summaryFormat } : {}),
      ...(!input.planning && index === 0 ? { material_call: preparedCommandCall('agdf_record', 'material.stage',
        { ...input, target_id: resolveControlCommandTarget(root).target_id }, { gate: data.authoring_owner }) } : {}),
      status: data.status, blocking_reason: data.blocking_reason, next_operation: data.next_operation,
      manifest_digest: `sha256:${manifest}`, ...(input.bundle ? { document_manifest: documents.map(({ content, ...r }) => r) } : { documents: documents.map(({ content, ...r }) => r) }),
      ...(input.bundle ? { format: 'document_bundle_v2', ...documentPage, page_bytes_limit: 49152,
        page_index: index, page_count: Math.max(selection.length, 1),
        first_page_call: pageCall(0),
        current_draft: currentDraft ? { type: currentDraft.type, path: currentDraft.path, status: currentDraft.status, digest: currentDraft.digest,
          content_state: draftRow?.complete ? 'complete' : draftRow ? 'fragment' : 'not_on_page',
          ...(draftPage >= 0 && (!draftRow || draftRow.byte_start > 0) ? { read_call: pageCall(draftPage) } : {}),
          instruction: 'Metadata only, never document text or edit permission. Use the matching complete report.documents row. For a fragment, join matching report.fragments by byte offsets across next_calls before editing. If not_on_page or earlier fragment bytes were not retained, copy read_call.arguments unchanged to read its first page.' } : null }
        : { chunk: chunks[index] ?? null }), complete: index + 1 >= selection.length,
      next_cursor: index + 1 < selection.length ? `${prefix}${index + 1}` : null,
      next_calls: nextPage ? [{ ...nextPage, instruction: 'Copy arguments unchanged to read the next page of this manifest. Retain earlier bytes; repeat until complete before editing a fragmented source. No JavaScript cloning or source/path discovery is needed.' }] : [],
      // The writer contract is identical on every page of one manifest; later pages only name it.
      formats: index === 0 ? input.bundle ? (({ schema, result_schema, ...authoring }) => authoring)(formats) : formats : { schema_version: formats.schema_version, available: formats.available, group: formats.group, kind: formats.kind,
        omitted: 'identical to the first page of this manifest' },
      material_transport: { tool: 'agdf_record', kind: input.planning ? 'planned_material.stage' : 'material.stage', limits: { request_bytes: 65536, inline_file_bytes: MATERIAL_LIMITS.inline, part_bytes: MATERIAL_LIMITS.part, source_bytes: MATERIAL_LIMITS.file },
        instructions: (input.bundle
          ? 'MCP access: response.structuredContent.report (or JSON.parse(response.content[0].text).report). Read complete report.documents[].content; report.document_manifest and current_draft are metadata only. The registered current draft is prioritized; inspect current_draft.content_state before looking for its complete document. Join report.fragments by identity and byte offsets across all next_calls pages before editing. Absent content is an error, never the string undefined. Copy call.arguments unchanged and supply only authored content in the named fields; no JavaScript helper is required. Preserve bundle:true. '
          : 'MCP access: response.structuredContent.report (or JSON.parse(response.content[0].text).report). This legacy view puts text in report.chunk.content; report.documents is metadata only. Follow every next_cursor with this exact binding, or request bundle:true for fewer round trips. ')
          + 'The included formats and bound forms replace a second operation-contract read. Retain unchanged sources for this manifest. Prefer material_call: put takes exact UTF-8 <=48 KiB per file within the 64 KiB JSON request bound and seals once. Use returned recording_calls, adding only required author/review inputs. Larger files use multipart; each action has its own UUID. Follow next_calls exactly. No file/path discovery or shell hashing. ' + AUTHORING_TEXT_HANDOFF }, authorizes: false };
  } catch (e) { return unavailable(e.code ?? e.message); }
}
