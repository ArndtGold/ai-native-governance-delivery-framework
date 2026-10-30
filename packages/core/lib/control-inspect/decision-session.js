import { resolutionRecordVersion } from '../control-state/input-resolution.js';
import { createPresentationDelivery } from '../control-state/presentation-delivery.js';
import { randomUUID, createHash } from 'node:crypto';
import { createCockpitSessionService } from './cockpit-session.js';
import { COCKPIT_LIMITS, parseCockpitArguments } from './cockpit-contract.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { validateRunPresentationRecord, readPresentationDocument, readPresentationPreview } from '../control-state/run-presentation.js';
import { validateCurrentPreviewRecord } from '../control-state/preview-snapshot.js';
import { prepareRunContentState } from '../control-evaluation/run-state.js';
import { readRun } from '../control-state/run-state-edits.js';
import { decisionMaterial } from '../control-state/presentation-decision.js';
import { createDecisionActionService } from '../control-state/decision-action-service.js';
import { validateDecisionAction, enabledDecisionActions } from '../control-state/decision-action-contract.js';
import { RUN_COMMAND_GROUPS } from '../control-state/run-command-contract.js';
import { interactionLocales } from '../resources/context.js';
import { presentationVersionComparison, decisionBriefFromSummary } from '../control-state/run-presentation-render.js';
import { qaDeviationPresentation } from '../control-state/qa-deviation-acceptance.js';
import { runSealState } from '../control-state/run-seal.js';
import { READ_LIMITS } from '../control-read/snapshot.js';

// Bounded ephemeral views on the existing reader. A general cockpit ID is never a
// decision-session ID, and no view is persistent gate authority.
export function createDecisionSessionService({ groups = Object.keys(RUN_COMMAND_GROUPS), now = Date.now,
  delivery = createPresentationDelivery({ now }), appOnlyMediationQualified = false, readServiceFactory = root => createCockpitSessionService(root),
  // Only a host adapter with actual current-surface identity may supply this
  // private observation. Client name/version, tool arguments and UI capability
  // cannot supply it. The current SDK adapter has no such observation.
  surfaceBinding = () => null,
  qualification = () => appOnlyMediationQualified === true,
  actionService = createDecisionActionService({ enabledGroups: groups, appOnlyMediationQualified: true }),
} = {}) {
  const sessions = new Map(), readers = new Map(), epoch = randomUUID();
  let closed = false, generation = 0;
  const failure = reason => ({ schema_version: '1', outcome: 'rejected', reason, authorizes: false });
  function currentMaterial(row) {
    const run = readRun(row.root, row.binding.run_id);
    if (run.rejection || run.meta.revision_id !== row.binding.expected_revision_id || runSealState(row.root, run.content).status !== 'valid') return false;
    const material = decisionMaterial(row.root, prepareRunContentState(row.root, run.content, run.path), row.binding.gate);
    return material.available && material.material_version === row.binding.material_version;
  }
  function retire(row) {
    if (row.retirement) return row.retirement;
    row.primary = false; row.displayed = false;
    row.retired = true; ++row.generation; clearTimeout(row.timer); readers.delete(row.readId);
    row.retirement = Promise.resolve().then(() => row.reader.close()).then(() => { sessions.delete(row.id); });
    void row.retirement.catch(() => {}); // Failed worker retirement keeps its counted slot.
    return row.retirement;
  }
  function active(id) {
    const row = sessions.get(id);
    if (closed || !row || row.retired) return null;
    if (now() >= row.expires || now() - row.touched >= COCKPIT_LIMITS.idle) { void retire(row); return null; }
    return row;
  }
  function touch(row) {
    row.touched = now(); clearTimeout(row.timer);
    row.timer = setTimeout(() => { void retire(row); }, Math.max(0, Math.min(row.expires, row.touched + COCKPIT_LIMITS.idle) - now()));
    row.timer.unref?.();
  }
  return Object.freeze({
    remember: delivery.remember, prepared: delivery.prepared, deliver: delivery.deliver,
    inspectOwnership() {
      for (const row of sessions.values()) active(row.id);
      return { views: sessions.size, active: [...sessions.values()].filter(row => !row.retired).length,
        inflight: [...sessions.values()].filter(row => row.pending || row.readPending).length };
    },
    async open(input, result, host = {}) {
      delivery.remember(input, result);
      const prepared = result.family_result;
      if (closed || !['accepted', 'already_applied'].includes(result.outcome) || typeof prepared?.text !== 'string') return { ...result, app_capability: 'unavailable' };
      for (const row of sessions.values()) active(row.id);
      if (sessions.size >= COCKPIT_LIMITS.sessions) return { ...result, app_capability: 'unavailable', app_reason: 'resource_limit' };
      const root = resolveControlCommandTarget(input.primary_target).root;
      const presentation = validateRunPresentationRecord(root, { runId: input.run_id, gate: input.command.payload.gate,
        revisionId: input.expected_revision_id, presentationId: prepared.presentation_id });
      const run = readRun(root, input.run_id);
      if (presentation.reason || run.rejection || run.meta.revision_id !== input.expected_revision_id
        || presentation.digest !== prepared.record_digest
        || 'sha256:' + createHash('sha256').update(prepared.text).digest('hex') !== presentation.record.presentation_digest) return { ...result, app_capability: 'unavailable', app_reason: 'presentation_binding_changed' };
      const state = prepareRunContentState(root, run.content, run.path);
      const material = decisionMaterial(root, state, input.command.payload.gate);
      if (!material.available) return { ...result, app_capability: 'unavailable', app_reason: material.reason };
      if ([3, 4, 5, 6].includes(resolutionRecordVersion(presentation.record)) && (typeof prepared.summary !== 'string'
        || 'sha256:' + createHash('sha256').update(prepared.summary).digest('hex') !== presentation.record.summary_digest)) {
        return { ...result, app_capability: 'unavailable', app_reason: 'presentation_binding_changed' };
      }
      const binding = Object.freeze({ target_id: input.target_id, run_id: input.run_id, gate: input.command.payload.gate,
        expected_revision_id: input.expected_revision_id, presentation_id: prepared.presentation_id, presentation_digest: presentation.digest,
        material_version: material.material_version, material_sources: material.sources, presentation_language: prepared.presentation_language });
      let qualified = false; try { qualified = qualification(host) === true; } catch {}
      const row = { id: randomUUID(), reader: readServiceFactory(root), root, binding, qualified, created: now(), touched: now(),
        expires: now() + COCKPIT_LIMITS.lifetime, generation: ++generation, retired: false, retirement: null, readId: null, timer: null, pending: null,
        nonce: randomUUID(), surface: surfaceBinding(host), displayed: false, primary: false };
      const preparedDelivery = delivery.prepared({ ...input, operation_id: prepared.presentation_id });
      if (!preparedDelivery || preparedDelivery.selected) return { ...result, app_capability: 'unavailable', app_reason: 'delivery_already_selected' };
      preparedDelivery.view = {
        confirm: host => active(row.id) === row && Boolean(row.displayed) && row.surface !== null && row.surface === surfaceBinding(host)
          && now() - row.displayed < 10000 && currentMaterial(row),
        select: () => { row.primary = true; }, retire: () => retire(row),
      };
      // UAT presents a bound evidence summary, not an invented UAT artefact or
      // today's QA document. Its large view reads exactly the prepared text.
      row.presentationDocument = binding.gate === 'UAT' ? Object.freeze({ resource_id: randomUUID(),
        run_id: binding.run_id, type: 'UAT', status: 'registered', path: null,
        registered_reference: `presentation:${binding.presentation_id}` }) : null;
      row.hasSnapshot = [3, 4, 5, 6].includes(resolutionRecordVersion(presentation.record));
      row.previewRecord = ([5, 6].includes(resolutionRecordVersion(presentation.record)) && presentation.record.preview_review) ? presentation.record : null;
      row.previewResourceId = row.previewRecord ? randomUUID() : null;
      row.presentationText = row.presentationDocument ? prepared.text : null;
      row.presentedContentSeal = presentation.record.content_digest;
      row.documentDigest = row.hasSnapshot ? presentation.record.document_digest
        : row.presentationDocument ? presentation.record.presentation_digest : presentation.record.artefact_digest;
      if (row.hasSnapshot) {
        let cursor, text = '';
        do {
          const page = readPresentationDocument(root, { runId: binding.run_id, gate: binding.gate,
            revisionId: binding.expected_revision_id, presentationId: binding.presentation_id, targetId: binding.target_id, cursor });
          if (!page.available) return { ...result, app_capability: 'unavailable', app_reason: page.reason };
          text += page.content; cursor = page.next_cursor ?? undefined;
        } while (cursor);
        row.presentationText = text;
      }
      // Publish capacity ownership before the first await, including unsuccessful cleanup.
      sessions.set(row.id, row); touch(row);
      try {
        const rendered = await row.reader.render({ run_id: binding.run_id });
        if (active(row.id) !== row || !rendered._meta?.agdf_cockpit?.session_id) throw Error('session_expired');
        row.readId = rendered._meta.agdf_cockpit.session_id; readers.set(row.readId, row);
        const snapshot = await row.reader.read({ operation: 'snapshot', session_id: row.readId, run_id: binding.run_id });
        if (active(row.id) !== row || snapshot.state !== 'available' || snapshot.data?.run?.revision_id !== binding.expected_revision_id) throw Error('source_snapshot_changed');
        const resource = row.presentationDocument ?? snapshot.data.run.resources.find(item => item.type === binding.gate && item.status === 'registered');
        // App metadata identifies one immutable presentation. The shared reader
        // issues replacement snapshot/resource selectors when it projects a read.
        // Keep that rotating cursor private to this exact decision view.
        row.presentedRead = Object.freeze({ snapshot_id: snapshot.snapshot_id, resource_id: resource?.resource_id ?? null });
        row.currentRead = row.presentedRead;
        const qaAcceptance = prepared.qa_acceptance ? qaDeviationPresentation(state.qa_acceptance, binding.presentation_language) : null;
        const labels = interactionLocales.locales[binding.presentation_language]?.decisionCard ?? interactionLocales.locales.en.decisionCard;
        return { ...result, app_capability: row.qualified ? 'available' : 'not_qualified',
          _meta: { agdf_decision: { schema_version: '1', session_id: row.id, read_session_id: row.readId,
            owner_epoch: epoch, generation: row.generation, expires_at: row.expires, binding, target: snapshot.target,
            delivery_state: 'preview', display_nonce: row.nonce, surface_id: row.surface,
            title: snapshot.data.run.title, labels: qaAcceptance ? { ...labels, approve: qaAcceptance.approve_label, confirmed: qaAcceptance.confirmed_label } : labels,
            approval_effect_label: interactionLocales.locales[binding.presentation_language]?.statusCard.allowedAfter ?? interactionLocales.locales.en.statusCard.allowedAfter,
            summary: row.presentationText ?? prepared.text,
            decision_brief: null,
            gate_title: interactionLocales.locales[binding.presentation_language]?.gateTitles[binding.gate]
              ?? interactionLocales.locales.en.gateTitles[binding.gate],
            decision_heading: qaAcceptance ? labels.deviationAcceptanceIntro : interactionLocales.locales[binding.presentation_language]?.gateActionTitles[binding.gate]
              ?? interactionLocales.locales.en.gateActionTitles[binding.gate],
            approval_effect: qaAcceptance?.effect || (interactionLocales.locales[binding.presentation_language]?.primary.afterApproval[binding.gate]
              ?? interactionLocales.locales.en.primary.afterApproval[binding.gate]),
            snapshot_id: snapshot.snapshot_id, resource_id: resource?.resource_id ?? null,
            document_digest: row.documentDigest,
            source_digest: presentation.record.artefact_digest,
            ...(row.previewRecord ? { preview: { resource_id: row.previewResourceId,
              version: row.previewRecord.preview_review.descriptor.version,
              task: row.previewRecord.preview_review.descriptor.review_task,
              scenarios: row.previewRecord.preview_review.descriptor.scenarios,
              criterion_ids: row.previewRecord.preview_review.descriptor.criterion_ids,
              open_questions: row.previewRecord.preview_review.descriptor.open_questions,
              content_digest: row.previewRecord.preview_review.rendered_digest } } : {}),
            enabled_actions: [],
            capability: row.qualified ? 'available' : 'not_qualified',
            comparison: presentationVersionComparison(root, state, binding.gate, presentation.record.artefact_digest) } } };
      } catch (error) {
        await retire(row).catch(() => {});
        return { ...result, app_capability: 'unavailable', app_reason: error.message };
      }
    },
    async action(input, host = {}) {
      const errors = validateDecisionAction(input);
      if (errors.length) return { ...failure('decision_schema_invalid'), diagnostics: errors };
      const row = active(input.session_id);
      if (!row) return failure('session_expired');
      if (!row.qualified) return failure('app_only_mediation_not_qualified');
      try { if (qualification(host) !== true) return failure('app_only_mediation_not_qualified'); }
      catch { return failure('app_only_mediation_not_qualified'); }
      if (!row.primary || !row.displayed || row.surface !== surfaceBinding(host)) return failure('decision_display_unconfirmed');
      if (input.presentation_id !== row.binding.presentation_id || input.expected_revision_id !== row.binding.expected_revision_id) return failure('decision_binding_invalid');
      if (row.pending) return { ...failure('decision_pending'), outcome: row.pending === input.operation_id ? 'effect_unknown' : 'rejected', operation_id: row.pending };
      touch(row); const captured = row.generation; row.pending = input.operation_id;
      let result;
      try { result = await actionService(row.root, row.binding, input); }
      catch { result = { ...failure('decision_result_unknown'), outcome: 'effect_unknown', operation_id: input.operation_id }; }
      finally { row.pending = null; }
      if (active(row.id) !== row || row.generation !== captured) return { ...result, view_state: 'closed' };
      touch(row); return { ...result, view_state: 'active' };
    },
    async read(input, signal, host = {}) {
      try { input = parseCockpitArguments(input); } catch { return failure('resource_denied'); }
      const row = readers.get(input.session_id);
      if (!row || active(row.id) !== row) return failure('session_expired');
      if (input.operation === 'close') { await retire(row); return { schema_version: '1', state: 'available', data: { closed: true }, authorizes: false }; }
      if (['decision_display', 'decision_state'].includes(input.operation)) {
        if (!currentMaterial(row)) { await retire(row).catch(() => {}); return failure('decision_binding_changed'); }
        if (delivery.prepared(row.binding)?.selected && !row.primary) { await retire(row).catch(() => {}); return failure('delivery_already_selected'); }
        if (input.operation === 'decision_display') {
          if (!row.surface || row.surface !== surfaceBinding(host) || input.surface_id !== row.surface || input.owner_epoch !== epoch
            || input.nonce !== row.nonce || input.document_digest !== row.documentDigest || input.visible !== true) return failure('decision_display_unconfirmed');
          const preparedDelivery = delivery.prepared(row.binding);
          if (preparedDelivery?.selected) return failure('delivery_already_selected');
          row.displayed = now();
        }
        if (row.primary && row.surface === surfaceBinding(host)) row.displayed = now();
        touch(row);
        return { schema_version: '1', state: 'available', data: { delivery_state: row.primary ? 'ui_primary' : 'preview',
          display: row.displayed ? 'confirmed' : 'unconfirmed', document_digest: row.documentDigest,
          enabled_actions: row.primary && row.qualified ? enabledDecisionActions(groups).filter(a => a === 'approve') : [] }, authorizes: false };
      }
      if (!['snapshot', 'document', 'preview', 'freshness', 'changes'].includes(input.operation) || input.run_id && input.run_id !== row.binding.run_id) return failure('resource_denied');
      if (input.operation === 'preview') {
        if (signal?.aborted) return failure('cancelled');
        if (!row.previewRecord || input.resource_id !== row.previewResourceId
          || ![row.presentedRead.snapshot_id, row.currentRead.snapshot_id].includes(input.snapshot_id)) return failure('resource_denied');
        if (row.readPending) return failure('busy');
        touch(row); const captured = row.generation; row.readPending = true;
        try {
          const run = readRun(row.root, row.binding.run_id);
          if (run.rejection || run.meta.revision_id !== row.binding.expected_revision_id || runSealState(row.root, run.content).status !== 'valid') return failure('decision_binding_changed');
          validateCurrentPreviewRecord(row.root, row.previewRecord);
          let content = '', cursor;
          do {
            const chunk = readPresentationPreview(row.root, { runId: row.binding.run_id, gate: row.binding.gate,
              revisionId: row.binding.expected_revision_id, presentationId: row.binding.presentation_id, targetId: row.binding.target_id, cursor });
            if (signal?.aborted) return failure('cancelled');
            if (!chunk.available) return failure(chunk.reason);
            if (chunk.applicability !== 'current') return failure('decision_binding_changed');
            content += chunk.content; cursor = chunk.next_cursor ?? undefined;
          } while (cursor);
          if (active(row.id) !== row || row.generation !== captured) return failure('session_expired');
          const result = { schema_version: '1', state: 'available', data: { preview: { resource_id: row.previewResourceId,
            content, content_digest: row.previewRecord.preview_review.rendered_digest, version: row.previewRecord.preview_review.descriptor.version } }, authorizes: false };
          if (Buffer.byteLength(JSON.stringify(result), 'utf8') > READ_LIMITS.response) return failure('resource_limit');
          return result;
        } catch (error) { return failure(error.message.startsWith('preview_') ? error.message : 'preview_unavailable'); }
        finally { row.readPending = false; }
      }
      const presented = input.snapshot_id === row.presentedRead.snapshot_id
        && (input.operation !== 'document' || input.resource_id === row.presentedRead.resource_id);
      const current = input.snapshot_id === row.currentRead.snapshot_id
        && (input.operation !== 'document' || input.resource_id === row.currentRead.resource_id);
      if (input.operation !== 'snapshot' && (!presented && !current
        || input.operation === 'document' && !row.currentRead.resource_id)) return failure('resource_denied');
      if (row.readPending) return failure('busy');
      touch(row); const captured = row.generation;
      row.readPending = true;
      let result;
      try {
        result = await row.reader.read(input.operation === 'document' && (row.presentationDocument || row.hasSnapshot)
          ? { operation: 'snapshot', session_id: row.readId, run_id: row.binding.run_id }
          : input.operation === 'snapshot' ? { ...input, run_id: row.binding.run_id }
          : { ...input, snapshot_id: row.currentRead.snapshot_id,
            ...(input.operation === 'document' ? { resource_id: row.currentRead.resource_id } : {}) }, signal);
      } finally { row.readPending = false; }
      if (active(row.id) !== row || row.generation !== captured) return failure('session_expired');
      if (result.data?.run && result.data.run.revision_id !== row.binding.expected_revision_id) return failure('decision_binding_changed');
      if (input.operation === 'document' && (row.presentationDocument || row.hasSnapshot) && result.state === 'available') {
        const run = readRun(row.root, row.binding.run_id);
        if (run.rejection || run.meta.revision_id !== row.binding.expected_revision_id) return failure('decision_binding_changed');
        const seal = runSealState(row.root, run.content);
        if (seal.status !== 'valid' || seal.actual.content_seal !== row.presentedContentSeal) return failure('decision_binding_changed');
        const material = decisionMaterial(row.root, prepareRunContentState(row.root, run.content, run.path), row.binding.gate);
        if (!material.available || material.material_version !== row.binding.material_version) return failure('presented_document_unavailable');
        const resource = row.presentationDocument ?? result.data.run.resources.find(item => item.type === row.binding.gate && item.status === 'registered');
        if (!resource) return failure('presented_document_unavailable');
        result = { ...result, data: { ...result.data, document: { resource,
          content: row.presentationText, content_digest: row.documentDigest.slice(7) } } };
        if (Buffer.byteLength(JSON.stringify(result), 'utf8') > READ_LIMITS.response) return failure('resource_limit');
      }
      const document = result.data?.document;
      if (input.operation === 'document' && result.state === 'available'
        && (document?.resource?.type !== row.binding.gate || 'sha256:' + document?.content_digest !== row.documentDigest)) {
        // The digest comes from the immutable prepared record, never the mutable reader.
        return failure('presented_document_unavailable');
      }
      if (result.state === 'available' && result.data?.run && result.snapshot_id) {
        const resource = row.presentationDocument ?? result.data.run.resources.find(item => item.type === row.binding.gate && item.status === 'registered');
        row.currentRead = { snapshot_id: result.snapshot_id, resource_id: resource?.resource_id ?? null };
      }
      return result;
    },
    async close() { closed = true; delivery.close(); await Promise.allSettled([...sessions.values()].map(retire)); },
  });
}
