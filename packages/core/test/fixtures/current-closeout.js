// Complete synthetic OR-full from the actual current fixture's recorded sources.
export function structuredCloseout(run) {
  const state = run.state(), fields = { run_id: run.id,
    ...Object.fromEntries(Object.entries({ related_ur: 'UR', related_prd: 'PRD', related_sd: 'SD', related_tp: 'TP', related_qa_report: 'QA' }).map(([key, type]) => [key, state.artefacts.get(type).path])),
    mode_slice_decision: 'structured_delivery', current_gate: 'OR', decision: 'pass' };
  const gates = ['UR', 'PRD', 'SD', 'TP', 'Brownfield Review', 'Brownfield Analysis', 'CD+Tests', 'CR', 'QA', 'UAT'];
  const rows = gates.map(type => `| ${type} | ${state.approvals.get(type)?.status ?? state.artefacts.get(type)?.status} | ${state.artefacts.get(type)?.path || state.approvals.get(type)?.evidence} |`);
  const context = { context_graph_impact: 'none', context_graph_refs: 'none', context_graph_reconciliation: 'not_applicable',
    context_graph_required_action: 'none', context_graph_gate_effect: 'none', context_graph_evidence: 'Disposable synthetic fixture adds no project memory.',
    memory_target: 'none', memory_reason: 'Synthetic test prerequisites have no enduring project meaning.', memory_refs: 'none' };
  return ['# OR: Synthetic current Run', '', 'Report mode: OR-full', 'Status: done', '', '## Run', '',
    ...Object.entries(fields).map(([key, value]) => `- ${key}: ${value}`), '', '## Gate State', '', '| Gate or step | Status | Evidence |', '|---|---|---|', ...rows,
    '', '## Delivered', '', 'The disposable current-model command journey completed with exact source bindings.',
    '', '## Not Delivered / Intentionally Deferred', '', 'Native host qualification and real human acceptance remain outside this synthetic test.',
    '', '## Evidence', '', 'The actual isolated assertions check commands, material snapshots, receipts and seals.',
    '', '## Missing Evidence', '', 'Production installation and native host behavior remain unobserved.',
    '', '## Risks And Open Items', '', 'No production delivery or release is represented by these synthetic approvals.',
    '', '## Context Graph Impact', '', ...Object.entries(context).filter(([key]) => key.startsWith('context_graph_')).map(([key,value]) => `- ${key}: ${value}`),
    '', '## Knowledge Persistence Decision', '', ...Object.entries(context).filter(([key]) => key.startsWith('memory_')).map(([key,value]) => `- ${key}: ${value}`),
    '', '## Next Permissible Step', '', '- next_allowed_action: Dispose of this isolated test fixture.', '- required_approval: none', '- forbidden_until_then: Unrequested publication or release.', '',
  ].join('\n');
}
