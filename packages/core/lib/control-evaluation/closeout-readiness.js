import { extractField } from './verified-change.js';
import { cleanStatusCell, filled, isPlaceholderValue, markdownSection, tableRows } from './shared.js';
import { canonicalJson, digest } from '../control-state/approval-command-contract.js';
import { readReportDecision } from './report-decision.js';
import { STRUCTURED_REQUIRED_REVIEWS, reviewArtefactType } from '../control-state/evidence-bindings.js';
import { inspectQaReports } from './qa-follow-up.js';

export { STRUCTURED_REQUIRED_REVIEWS, reviewArtefactType };

export const closeoutConfirmation = (runId, revisionId, operationId, orDigest) => `Close Run: ${runId} ${revisionId} ${operationId} ${orDigest}`;
const value = (text, field, label) => cleanStatusCell(extractField(text, field) || (label ? text.match(new RegExp(`^${label}:[ \\t]*(.*)$`, 'mu'))?.[1] : ''));
const concrete = text => filled(text) && !isPlaceholderValue(text) && !/^(?:tbd|todo|<)/iu.test(text);
export function closeoutContext(text) {
  return Object.fromEntries(['context_graph_impact', 'context_graph_refs', 'context_graph_reconciliation', 'context_graph_required_action',
    'context_graph_gate_effect', 'context_graph_evidence', 'memory_target', 'memory_reason', 'memory_refs'].map(field => [field, value(text, field)]));
}
export const closeoutContextDigest = text => digest(`agdf-closeout-context/1\0${canonicalJson(closeoutContext(text))}`);

// Shared observation of registered OR and prepared OR candidates. Legacy reports retain
// their documented formats; the new writer additionally requires the complete template.
export function evaluateCloseoutReadiness(state, report, readArtefact, { prepared = false } = {}) {
  const findings = [], fail = reason => findings.push(reason), route = state.mode_slice_decision?.decision;
  const structured = ['structured_slice', 'structured_delivery'].includes(route);
  if (typeof report !== 'string' || Buffer.byteLength(report) > 131072) return { ready: false, findings: ['or_unavailable_or_oversized'] };
  if (prepared) for (const [field, label] of [['run_id', 'Run'], ['report_mode', 'Report mode'], ...(structured ? [['status', 'Status']] : [])]) {
    const declarations = [...report.matchAll(new RegExp(`^(?:- ${field}|${label}):[ \\t]*(.*)$`, 'gmu'))];
    if (declarations.length !== 1) fail('or_field_ambiguous:' + field);
  }
  if (value(report, 'run_id', 'Run') !== state.run_id) fail('or_run_binding_invalid');
  if (value(report, 'report_mode', 'Report mode') !== (structured ? 'OR-full' : 'OR-lite')) fail('or_mode_invalid');
  if (!structured && route !== 'quick_task') return { ready: false, findings: ['closeout_route_unsupported'] };
  const parent = state.reconciliation_state?.parent_reconciliation, programme = state.reconciliation_state?.programme_aggregation;
  if (parent?.outcome === 'open' && parent.disposition !== 'accepted_open') fail('parent_reconciliation_required');
  if (programme?.applicable && !programme.final_ready) fail('programme_aggregation_unfulfilled');
  if (!structured) {
    if (state.artefacts.get('CR')?.status !== 'done') fail('code_review_missing');
    for (const section of ['Result', 'Evidence', 'Risk', 'Next Step']) if (!concrete(markdownSection(report, section).trim())) fail(`or_${section.toLowerCase().replaceAll(' ', '_')}_missing`);
  } else {
    if (!['done', 'completed', 'pass'].includes(value(report, 'status', 'Status'))) fail('or_status_unconfirmed');
    for (const gate of ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT']) {
      if (state.approvals.get(gate)?.status !== 'approved') fail(`closeout_${gate.toLowerCase()}_approval_missing`);
      if (gate !== 'UAT' && (!state.artefacts.get(gate)?.path || !(gate === 'QA' && state.qa_acceptance?.accepted)
        && !['approved', ...(gate === 'QA' ? ['pass'] : [])].includes(state.artefacts.get(gate)?.status))) fail(`closeout_${gate.toLowerCase()}_artefact_missing`);
    }
    const steps = ['Brownfield Analysis', 'CD+Tests', 'CR', ...(prepared ? STRUCTURED_REQUIRED_REVIEWS : [])];
    for (const step of steps) {
      const type = reviewArtefactType(state, step), row = state.artefacts.get(type), association = state.evidence_applicability?.by_step.get(type);
      const acceptedPlan = step === 'TP Review' && state.qa_acceptance?.accepted && row?.status === 'revise';
      if (!row || !acceptedPlan && !['done', ...(step === 'Brownfield Analysis' ? ['not_applicable'] : [])].includes(row.status) || association && association.applicability !== 'current') fail('closeout_review_unfulfilled:' + step);
      if (prepared && row?.status !== 'not_applicable') {
        const text = row?.path ? readArtefact(row.path) : undefined;
        if (!['pass', ...(acceptedPlan ? ['revise'] : [])].includes(readReportDecision(text))) fail('closeout_review_result_unconfirmed:' + step);
      }
    }
    const qa = state.artefacts.get('QA'), qaText = qa?.path ? readArtefact(qa.path) : undefined;
    if (!['pass', ...(state.qa_acceptance?.accepted ? ['revise'] : [])].includes(readReportDecision(qaText))) fail('closeout_qa_pass_unconfirmed');
    if (state.qa_acceptance?.accepted && (value(report, 'qa_acceptance') !== 'accepted_with_deviations'
      || value(report, 'accepted_qa_deviations_digest') !== state.qa_acceptance.digest)) fail('closeout_qa_deviations_not_disclosed');
    const qaAssociation = state.evidence_applicability?.by_step.get('QA');
    if (qaAssociation && qaAssociation.applicability !== 'current') fail('closeout_qa_association_not_current');
    if (prepared && !state.qa_acceptance?.accepted) {
      const quality = inspectQaReports('', state, state.run_id, 'pass', 64, true, { readArtefact });
      if (quality.kind !== 'none' || quality.findings.length) fail('closeout_quality_unconfirmed');
    }
    const context = closeoutContext(report);
    if (!['resolved', 'not_applicable'].includes(context.context_graph_reconciliation)
      || !['none', 'warning'].includes(context.context_graph_gate_effect) || context.context_graph_required_action !== 'none'
      || !concrete(context.context_graph_evidence)) fail('closeout_context_unresolved');
    if (['revise', 'block'].includes(state.context_graph?.gate_effect) || state.context_graph?.reconciliation === 'open_gap') fail('run_context_obligation_open');
    if ([...(state.missing_evidence ?? []), ...(state.risks ?? [])].some(row => ['revise', 'block'].includes(row.impact))) fail('run_required_obligation_open');
    if (prepared) {
      if (!['none', 'link_only', 'update_existing_node', 'new_node_required', 'sot_drift'].includes(context.context_graph_impact)
        || context.context_graph_reconciliation === 'not_applicable' && (context.context_graph_impact !== 'none' || context.memory_target === 'context_graph')
        || context.context_graph_reconciliation === 'resolved' && context.context_graph_impact !== 'none'
          && (!concrete(context.context_graph_refs) || context.context_graph_refs === 'none')) fail('or_context_binding_invalid');
      for (const field of ['run_id', 'related_ur', 'related_prd', 'related_sd', 'related_tp', 'related_qa_report', 'mode_slice_decision', 'current_gate', 'decision',
        ...Object.keys(context), 'next_allowed_action', 'required_approval', 'forbidden_until_then']) {
        if ([...report.matchAll(new RegExp(`^- ${field}:[ \\t]*(.*)$`, 'gmu'))].length !== 1) fail('or_field_ambiguous:' + field);
      }
      for (const [field, type] of Object.entries({ related_ur: 'UR', related_prd: 'PRD', related_sd: 'SD', related_tp: 'TP', related_qa_report: 'QA' })) {
        if (value(report, field) !== state.artefacts.get(type)?.path) fail('or_source_reference_invalid:' + field);
      }
      if (value(report, 'mode_slice_decision') !== route || value(report, 'current_gate') !== 'OR' || value(report, 'decision') !== 'pass') fail('or_control_binding_invalid');
      const gateRows = tableRows(markdownSection(report, 'Gate State')).filter(row => row[0] !== 'Gate or step');
      for (const type of ['UR', 'PRD', 'SD', 'TP', 'Brownfield Review', 'Brownfield Analysis', 'CD+Tests', 'CR', 'QA', 'UAT']) {
        const rows = gateRows.filter(row => row[0] === type), expected = state.approvals.has(type) ? state.approvals.get(type).status : state.artefacts.get(type)?.status;
        const reference = state.artefacts.get(type)?.path || state.approvals.get(type)?.evidence;
        if (rows.length !== 1 || rows[0][1] !== expected || !concrete(rows[0][2])
          || cleanStatusCell(rows[0][2]) !== cleanStatusCell(reference)) fail('or_gate_state_unconfirmed:' + type);
      }
      for (const section of ['Gate State', 'Delivered', 'Not Delivered / Intentionally Deferred', 'Evidence', 'Missing Evidence', 'Risks And Open Items', 'Context Graph Impact', 'Knowledge Persistence Decision', 'Next Permissible Step']) {
        const text = markdownSection(report, section).trim();
        if (!concrete(text) || /<[^>]+>|\|[ \t]*\|/u.test(text)) fail('or_section_incomplete:' + section);
      }
      for (const section of ['Missing Evidence', 'Risks And Open Items']) if (/\|\s*(?:revise|block)\s*\|/u.test(markdownSection(report, section))) fail('or_required_obligation_open:' + section);
      if (!['context_graph', 'sot_registry', 'scope_artifact', 'open_questions', 'none'].includes(context.memory_target)
        || !concrete(context.memory_reason) || !concrete(context.memory_refs)) fail('or_knowledge_decision_incomplete');
      if (value(report, 'required_approval') !== 'none') fail('or_required_approval_open');
    }
  }
  return { ready: findings.length === 0, findings, route, context_digest: closeoutContextDigest(report),
    parent_reconciliation: parent ?? null, programme_aggregation: programme ?? null };
}
