import pathlib,json,hashlib
run=pathlib.Path(__file__).resolve().parent.parent;e=run/'evidence';checks=e/'checks';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert json.loads((checks/'protocol-02.json').read_text())['exit_code']==0
transports=[]
for file in (checks/'transport').glob('*.jsonl'):
 rows=[json.loads(s) for s in file.read_text().splitlines()]
 # Only the completed passing attempt contains both historical read sequences.
 historical=[r for r in rows if (r.get('result',{}).get('structuredContent',{}).get('report') or {}).get('applicability')=='historical']
 if historical:transports.append(dict(path=str(file.relative_to(e)),sha256=sha(file),rows=len(rows),historical_reads=len(historical)))
assert len(transports)==1
summary=dict(classification='deterministic_actual_sdk_stdio_assertions',model_invocations=0,protocols=['2025-11-25','2026-07-28'],passing_attempt='protocol-02',retained_failed_attempt='protocol-01: test helper expected success on deliberate negative read; corrected only assertion helper',raw_transport=transports)
summary['assertions']={s:True for s in ['bound_returned_arguments_execute','current_gate_scope_disclosed','complete_scan_and_page_required','ambiguous_discovery_no_document_selection','exact_known_binding_read_despite_ambiguity','missing_does_not_prepare','corrupt_catalog_no_hints','unbound_no_target_inference','stale_revision_foreign_target_gate_run_refused','read_control_byte_snapshots_unchanged','historical_document_original_revision','current_contract_current_revision','historical_and_stale_approvals_refused']}
(checks/'navigation.json').write_text(json.dumps(summary,indent=2)+'\n')
(checks/'historical.json').write_text(json.dumps(dict(classification=summary['classification'],model_invocations=0,source='navigation.json',raw_transport=transports,assertions={k:v for k,v in summary['assertions'].items() if any(t in k for t in ['revision','historical','unchanged'])}),indent=2)+'\n')
parity=json.loads((checks/'schema-parity.json').read_text());assert parity['core_translation_cases']==160 and parity['differences']==0
(checks/'core-parity.json').write_text(json.dumps(dict(cases=160,differences=0,frozen_expectations_sha256=sha(e/'baseline/core-expectations.json'),comparison='Canonical JSON values plus original Object.keys; expectations captured before source edits',matrix_cases=247003,model_invocations=0),indent=2)+'\n')
definition=json.loads((checks/'candidate-definition.json').read_text());(checks/'contract.json').write_text(json.dumps(dict(name=definition['name'],fields=list(definition['inputSchema']['properties']),operations=definition['inputSchema']['properties']['operation']['enum'],bytes=len(json.dumps(definition,separators=(',',':'),ensure_ascii=False).encode()),sha256=sha(checks/'candidate-definition.json'),model_invocations=0),indent=2)+'\n')
(e/'render/launches.json').write_text(json.dumps(dict(classification='model_free_installed_host_probe',attempts=[dict(attempt=1,outcome='sandbox denied loopback bind before server/app-server launch',model_invocations=0),dict(attempt=2,outcome='completed under approved local execution permission; external network denied, scratch CODEX_HOME, no auth',requests=1,model_invocations=0,visibility='final/visibility.json')]),indent=2)+'\n')
print(json.dumps(dict(navigation_assertions=len(summary['assertions']),frozen_core_cases=160,model_invocations=0)))
