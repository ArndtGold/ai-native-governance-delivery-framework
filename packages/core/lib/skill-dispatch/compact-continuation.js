import { readFileSync } from '../control-read/fs.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { artefactFileDigest } from '../control-state/run-seal-compute.js';
import { REVISION_ID_PATTERN } from '../control-state/run-identity.js';
import { extractField, parseVerifiedChangePathList } from '../control-evaluation/verified-change.js';

// Translate only the final evaluated operation; policy and writers retain authority.
export function compactContinuation(root, report, input) {
  const state = report.status_card?.runState;
  const mode = report.status_card?.mode_slice_decision ?? report.delivery_map?.mode_slice_decision?.decision;
  const operation = report.next_operation;
  const implementation = operation?.type === 'implement_compact_scope'
    && operation.skill_id === 'gate-check' && operation.operation_key === 'implementation.execute'
    && operation.actor === 'agent' && operation.effect === 'implementation';
  const closeout = operation?.type === 'record_closeout'
    && operation.skill_id === 'release-or' && operation.operation_key === 'closeout.record'
    && operation.actor === 'agent' && operation.effect === 'closeout';
  const expectedGate = mode === 'quick_task' ? 'Quick Task Execution'
    : mode === 'verified_change' ? (implementation ? 'Verified Change Execution' : 'OR') : null;
  if (!input.continue_delivery || !input.run_id || !state || !expectedGate
      || (!implementation && !closeout) || report.status !== 'open'
      || report.current_gate !== expectedGate || operation.gate !== expectedGate
      || report.blocking_reason !== 'none' || report.missing_approval !== 'none'
      || extractField(state.content, 'lifecycle') !== 'active') return null;
  const runId = extractField(state.content, 'run_id');
  const revision = extractField(state.content, 'revision_id');
  if (runId !== input.run_id || runId !== report.status_card.run_id || !REVISION_ID_PATTERN.test(revision)) throw Error('compact_binding_invalid');
  const sources = [];
  const read = type => {
    const path = state.artefacts.get(type)?.path;
    const file = containedRegularFile(root, path);
    if (hasSymlinkComponent(root, path) || file.status !== 'valid') throw Error('compact_source_unavailable');
    const content = readFileSync(file.path, 'utf8');
    const digest = artefactFileDigest(root, path);
    if (!/^sha256:[0-9a-f]{64}$/u.test(digest)) throw Error('compact_source_unavailable');
    sources.push({ type, path, digest });
    return { path, content };
  };
  read('UR'); read('Brownfield Review');
  let record;
  if (mode === 'verified_change') {
    const evaluated = report.verified_change;
    const current = read('Verified Change');
    if (evaluated?.status !== (implementation ? 'eligible' : 'executed')
        || evaluated.findings?.length || current.path !== evaluated.record?.path
        || current.content !== evaluated.record?.content) throw Error('compact_record_changed');
    record = {
      path: current.path, canonical_owner: extractField(current.content, 'canonical_owner'),
      allowed_source_paths: parseVerifiedChangePathList(extractField(current.content, 'allowed_source_paths')),
      allowed_derived_paths: parseVerifiedChangePathList(extractField(current.content, 'allowed_derived_paths')),
      baseline_commit: extractField(current.content, 'baseline_commit'),
      baseline_tracked_paths: parseVerifiedChangePathList(extractField(current.content, 'baseline_tracked_paths')),
      baseline_untracked_paths: parseVerifiedChangePathList(extractField(current.content, 'baseline_untracked_paths')),
      propagation_command: extractField(current.content, 'propagation_command'),
      validation_commands: extractField(current.content, 'validation_commands'),
      escalation_target: evaluated.escalation_target,
    };
  } else if (closeout && state.artefacts.get('CR')?.path) {
    // The CLI review step records a done Code Review without a file; bind CR only when one is registered.
    read('CR');
  }
  return {
    phase: implementation ? 'compact_implementation' : 'compact_closeout',
    skill_id: implementation ? 'gate-check' : 'release-or',
    governance_target: root, run_id: runId, revision_id: revision,
    presentation_language: input.presentation_language, mode,
    source_artifacts: sources, ...(record ? { verified_change: record } : {}),
    instruction: implementation
      ? `Inspect current execution and review evidence first; perform only unfinished work within the approved UR and Brownfield scope. ${mode === 'verified_change'
        ? 'Use only the evaluated record paths; run its declared propagation and validation commands, record exact changed paths and passing evidence through the existing record/run-update owner. Escalate through the existing declared structured path if eligibility is lost.'
        : 'Run relevant checks, record actual evidence and mandatory Code Review through the existing run-step owners before OR-lite.'} After recorded changes redispatch gate-check for this same target/run with continue_delivery and its fresh revision. Stop at any decision or concrete blocker. Never infer QA, UAT, VCS or release authority.`
      : `Close only this already reviewed/executed compact scope through release-or. ${mode === 'verified_change'
        ? 'Complete the linked Verified Change Mini-Closeout and publish lifecycle-consistent role links through the existing run-update owner; closeout.record does not support this mode. Revalidate with Git-aware CLI evaluation.'
        : 'Read the bound OR template and closeout authoring format; persist OR-lite with the exact Run and Report mode declared once, plus Result, Evidence, Risk and Next Step through the existing closeout owner.'} Do not repeat implementation or perform VCS/release actions. Redispatch gate-check for this same target/run after recording; completed state stops.`,
  };
}
