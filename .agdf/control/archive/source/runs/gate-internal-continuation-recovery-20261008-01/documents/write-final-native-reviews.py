from pathlib import Path
import datetime,re,json
candidate=json.loads((Path(__file__).parent/"OWNER_CANDIDATE-01.json").read_text())
b=Path(__file__).parent
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
files=['CD_TESTS.md','CODE_REVIEW.md','TASK_PLAN_REVIEW.md','CLEAN_IMPLEMENTATION_REVIEW.md','QA_REPORT.md']
for n in files:
 p=b/n; backup=b/('BEFORE_FINAL_NATIVE_PROGRESS-'+n)
 if backup.exists():raise RuntimeError('Progress already applied: '+n)
 backup.write_bytes(p.read_bytes())
gap='| QF-001 | evidence_gap | evidence_obligation | open | EVIDENCE_NATIVE-05.md and FINAL_INDEPENDENT_INDEX-01.json: actual current desktop positive, stop, multi-turn revision, QA and terminal/input chains observed; representative current native displayed readability remains inaccessible | Open the freshly issued Cockpit in the accessible expanded MCP-App surface and observe current state, exact diagnosis and readability before final QA readiness |'
for n in ['CD_TESTS.md','CODE_REVIEW.md','CLEAN_IMPLEMENTATION_REVIEW.md']:
 p=b/n;s=p.read_text();s=re.sub(r'^- assessed_at: .+$','- assessed_at: '+stamp,s,flags=re.M)
 s=re.sub(r'^- actual_host_status: .+$','- actual_host_status: current candidate matched in independent actual Codex Desktop/gpt-6.1-sol; positive/stop/revision/QA/terminal/input cases observed; display remains open',s,flags=re.M)
 s=re.sub(r'^- missing_evidence: .+$','- missing_evidence: QF-001 representative current native displayed readability; independent QA adapter first-attempt failure and one coordinator recovery are retained, not erased',s,flags=re.M)
 s=re.sub(r'^- required_next_step: .+$','- required_next_step: collect the exact current displayed-readability observation from the accessible expanded MCP App',s,flags=re.M)
 s=re.sub(r'^- workaround_or_shim_risk: .+$','- workaround_or_shim_risk: no shim or retry state; bounded unchanged stop and exact terminal/no-later-tool compliance now observed in actual desktop turns',s,flags=re.M)
 s=re.sub(r'^\| QF-001 \|.*$',lambda m:gap,s,flags=re.M)
 s+='\n## Current actual qualification progress\n\nEVIDENCE_NATIVE-05.md supersedes earlier blanket native absence statements. QF-003 now names unique validated upstream owners in the existing reason; OWNER_SOURCE_REVIEW-01.md, OWNER_CHECKS-01.json and the fresh corrected native upstream proof establish affected-path evidence. Prior scoped proof is retained only by the applicability assessment in QUALIFICATION_PLAN-05.md and EVIDENCE_NATIVE-05.md. Current actual independent desktop tests cover UX preparation/correction, unchanged stop, staged new-model-turn resume with stale replay, full QA implementation/evidence, external gap, upstream/invalid boundaries, exact terminal final/no later tool, read-only snapshots and MCP input rejection. The first independent QA implementation attempt failed in the caller adapter; the corrected canonical ordering and one coordinator recovery are explicit. The observed QF-003 production diagnosis defect and exact authorized package switch are documented; no approval or universal zero-prompt reliability is inferred. Representative current native display/readability remains open.\n'
 p.write_text(s)
p=b/'TASK_PLAN_REVIEW.md';s=p.read_text();s=re.sub(r'^- assessed_at: .+$','- assessed_at: '+stamp,s,flags=re.M)
rows={
'T-003':'| T-003 | fully_done | Existing qa-follow-up owner, retained source negatives and actual full QA implementation/evidence plus external/upstream/invalid native boundaries | none at source/route level | No approval from revise |',
'T-004':'| T-004 | fully_done | Existing contracts, affected instruction checks, actual bounded unchanged stop and three exact terminal/no-later-tool native turns | native displayed readability under T008 | No retry engine or suppressed terminal |',
'T-006':'| T-006 | fully_done | Retained canonical suites, source before/after comparisons, all registered locale renders, complete current categorized actual ledgers and multi-turn revision/terminal/input/no-write observations | historical full model timing unavailable; no such timing claimed | Actual evidence and limits separated |',
'T-008':'| T-008 | partially_done | Current installed identity plus independent fresh Desktop/model and complete nine-case observations; typed QA recovery and retained failed attempt | representative current native displayed readability; no abrupt host cancellation claimed | QF-001 remains open |',
'T-009':'| T-009 | partially_done | CD+Tests and mandatory reviews refreshed to concrete actual progress; QA revise retained until required visible proof | final visible observation and subsequent final QA readiness | No Approval: QA |'
}
for key,row in rows.items():s=re.sub(r'^\| '+re.escape(key)+r' \|.*$',lambda m:row,s,flags=re.M)
s=s.replace('- fully_done: 5 of 9, T002/T003/T004/T005/T007','- fully_done: 6 of 9, T002/T003/T004/T005/T006/T007').replace('- partially_done: 4 of 9, T001/T006/T008/T009','- partially_done: 3 of 9, T001/T008/T009')
s=s.replace('- not_done: 0 tasks wholly unstarted; specified native observations themselves remain unperformed','- not_done: 0 tasks wholly unstarted; representative current native displayed-readability observation remains unperformed')
s=re.sub(r'^- required_next_step: .+$','- required_next_step: collect current native displayed-readability observation, then have qa-gate reassess the concrete remaining obligation',s,flags=re.M)
ac={
'AC-001':'| AC-001 | done | high | Source matrix and actual fresh missing-UX preparation/validation/recording/PRD chain with zero extra human restart prompts |',
'AC-002':'| AC-002 | done | high | Exact malformed diagnosis, own correction and actual unchanged-condition stop; approved sources protected |',
'AC-003':'| AC-003 | done | high | Actual full QA work/evidence routes and external/upstream/invalid boundary observations; initial caller-order failure and one coordinator recovery explicitly retained |',
'AC-004':'| AC-004 | partial | high for protocol/model, missing display | Exact terminal text/no later tool in three native turns; actual MCP invalid input reject and no-write checks; representative displayed readability missing |',
'AC-005':'| AC-005 | partial | high for identity/sequence, missing display | Prepared candidate and sequence before change; same candidate matches fresh independent Desktop/model; inaccessible current display explicitly open |',
'AC-006':'| AC-006 | partial | medium | Actual staged multi-turn resume/stale revision and categorized prompt/correction ledger observed; earlier root extra human turns and one independent adapter recovery retained; native display missing and original historical full model timing not invented |',
'AC-008':'| AC-008 | done | high | Existing single owners retained; every changed source locale render inspected; source/package/protocol/actual model claims and unavailable visible proof explicitly separated |'
}
for key,row in ac.items():s=re.sub(r'^\| '+key+r' \| (?:partial|done) \|.*$',lambda m:row,s,flags=re.M)
sc={
'SCN-002':('done','Actual fresh missing-UX/PRD chain, installed validator, canonical recording and pending genuine decision; zero extra human restart prompts'),
'SCN-005':('done','Actual exact malformed correction and one ineffective correction then no recording/redispatch/PRD'),
'SCN-007':('done','Actual complete failing filter test, restore-only fix, full passing tests/reviews, canonical QA; independent first adapter failure and corrected later recording retained'),
'SCN-008':('done','Actual evidence-only code bytes unchanged, full tests/reviews and canonical QA; no implementation inferred'),
'SCN-009':('done','Actual external-gap target binds no accessible external resource; complete observation plan and no false proof/approval; expected unavailable boundary'),
'SCN-013':('done','Actual supported calls and one MCP-schema rejection; three exact terminal final texts and zero subsequent tool calls'),
'SCN-015':('partial','All registered source locale/state renders inspected; representative actual displayed readability unavailable'),
'SCN-017':('done','Fresh independent Codex Desktop 0.162.0-alpha.2/gpt-6.1-sol identity and exact selected current dispatcher before chained behavior'),
'SCN-018':('done','Actual inaccessible expired MCP-App flagged as stale, not used for current qualification; retained source mismatch tests and candidate applicability distinct'),
'SCN-019':('done','Actual staged model-turn interruption/checkpoint then fresh binding; stale-revision rejection with whole control bytes unchanged; no abrupt host cancellation claimed'),
'SCN-020':('done','Categorized source baseline/current and actual prompt/stop/correction ledger; reconstructed source baseline and missing historical model timing explicitly bounded'),
'SCN-021':('done','Actual permitted root and independent chains with zero extra human restart prompts; staged test turns, real decision/external boundaries and one coordinator adapter recovery counted separately; no universal reliability claim'),
'SCN-028':('partial','All changed locale source outputs inspected; exact native model terminal output captured; representative native displayed readability missing'),
'SCN-030':('partial','All tasks/scenarios/reviews/current obligations assessed; final QA readiness awaits actual display')
}
for key,(status,proof) in sc.items():s=re.sub(r'^\| '+key+r' \|.*$',lambda m:'| '+key+' | '+status+' | '+proof+' |',s,flags=re.M)
ux={
'AC-001':'| AC-001 | pre-PRD preparation | T-002/T-006/T-008 | Actual independent missing-UX/PRD chain and complete canonical evidence | fulfilled | none |',
'AC-002':'| AC-002 | own-input correction/unchanged stop | T-004/T-006/T-008 | Actual malformed repair and ineffective-correction stop; protected control/UR bytes | fulfilled | none |',
'AC-003':'| AC-003 | QA follow-up | T-003/T-008 | Complete actual implementation/evidence and expected external/upstream/invalid boundaries; failed caller attempt retained | fulfilled | none |',
'AC-004':'| AC-004 | status/continuation/terminal | T-005/T-008 | Actual exact terminal/no later tool and pure status; representative displayed readability missing | partial | evidence_gap |',
'AC-005':'| AC-005 | external qualification | T-007/T-008 | Exact candidate matches independent fresh host/model; complete plan and unavailable current display distinguished | partial | evidence_gap |',
'AC-006':'| AC-006 | interruption and reduced chat loops | T-006/T-008 | Actual staged two-turn revision replay and categorized ledger; original root extra turns and one adapter recovery disclosed; display open | partial | evidence_gap |',
'AC-008':'| AC-008 | ownership/evidence clarity | T-009/T-008 | Single owners and source/model/display distinctions documented with exact current identity and limits | fulfilled | none |'
}
for key,row in ux.items():s=re.sub(r'^\| '+key+r' \| (?!(?:partial|done) \|)[^|]+ \| T-[^\n]+$',lambda m:row,s,flags=re.M)
s=re.sub(r'^\| QF-001 \|.*$',lambda m:gap,s,flags=re.M)
s+='\n## Current qualification delta\n\nEVIDENCE_NATIVE-05.md supersedes earlier blanket native absence paragraphs above. The candidate changed solely for QF-003; fresh affected proof and explicit retained-evidence applicability are recorded in EVIDENCE_NATIVE-05.md. All executable model/protocol/checkpoint/QA cases are now observed; only representative current native displayed readability remains a live collection dependency. T001 retains its explicit historical baseline-method/timing limitation; no historical model duration or complete original model baseline is invented. The ledger preserves one independent QA caller-order failure and one subsequent coordinator recovery rather than presenting a universal zero-recovery result.\n'
p.write_text(s)
for n in ['CD_TESTS.md','CODE_REVIEW.md','TASK_PLAN_REVIEW.md','CLEAN_IMPLEMENTATION_REVIEW.md']:
 p=b/n;s=p.read_text()
 for key,value in [('candidate',candidate['codex_install_version']),('runtime_digest',candidate['runtime_digest']),('mcp_dispatcher_digest',candidate['mcp_dispatcher_digest'])]:
  s=re.sub(r'^- '+key+r': .+$','- '+key+': '+value,s,flags=re.M)
 s=re.sub(r'^\| QF-003 \|.*$', '| QF-003 | implementation_gap | CD+Tests | resolved | OWNER_SOURCE_REVIEW-01.md; OWNER_CHECKS-01.json; OWNER_CANDIDATE-01.json; INDEPENDENT_TERMINAL_OWNER_CORRECTED_PROOF-01.json; OWNER_NATIVE_NO_WRITE-01.json: known SD owner appears, terminal and protected bytes retained | Retain the affected proof and reassess if its source path changes |',s,flags=re.M)
 s=s.replace('Native owner diagnosis update: QF-003 is a bounded approved-scope implementation correction. Existing QA revise is retained; no pass or approval is inferred.', 'Native owner diagnosis update: QF-003 is resolved by the scoped source correction, all affected checks and fresh actual installed upstream terminal proof. Existing QA revise is retained for QF-001 display evidence; no approval is inferred.')
 if n=='CODE_REVIEW.md':
  s=s.replace('- decision: revise','- decision: pass',1)
  s=re.sub(r'^- missing_evidence: .+$','- missing_evidence: QF-001 representative current displayed readability remains a separate overall QA obligation; affected source review is complete',s,flags=re.M)
  s=re.sub(r'^- risks: .+$','- risks: same-agent source review; actual separate native model qualification and explicit adapter recovery limits retained',s,flags=re.M)
  s=re.sub(r'^- required_next_step: .+$','- required_next_step: qa-gate consumes all refreshed dimensions and the remaining QF-001 visible observation',s,flags=re.M)
 if n=='CD_TESTS.md':s=s.replace('approved TP source implementation and QF-002 correction','approved TP source implementation and QF-002/QF-003 corrections')
 s+='\nCurrent-source review supplement: OWNER_SOURCE_REVIEW-01.md records the exact +120-byte Core delta, existing quality-map validation and preserved terminal authority. All seven affected checks passed. New selected MCP identity is matched in OWNER_FRESH_CONNECTION-01.json and OWNER_ACTUAL_QA_DISPATCH-01.json; fresh independent corrected upstream output names SD exactly and remains read-only. Previous failure, package identity and native evidence are retained as historical/applicable as individually stated.\n'
 p.write_text(s)
print('Mandatory review progress refreshed; QA report not reassessed or changed by this script')
