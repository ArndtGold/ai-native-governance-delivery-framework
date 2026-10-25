from pathlib import Path
import shutil,subprocess,json
B=Path('/private/tmp/agdf-inspect-evaluation');R=Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework');S=Path('/private/tmp/agdf-inspect-agent-ab/baseline');D=B/'guided'
assert not D.exists()
plan={'scope':'Isolated evaluation; no AGDF; no root product changes','base_head':'5046858826f3bca7922c14ef402b095feca8b6fb','model':'gpt-6.1-sol','reasoning_effort':'low','maximum_real_sessions':6,'candidate_versions_maximum':2,'initial_sessions':2,'held_out_sessions':2,'reserve_sessions':2,'retry_or_resume':False,'timeout_ms':600000,'auth':'Existing ChatGPT account only; no API key or credential copy','success':'Unchanged strict T7 verifier; real intended approval exactly once; zero SDK errors desired; no isolation/trace/model violations; preserve every failure','boundaries':'All existing MCP budgets and validators retained; next_calls read-only, explicit Run/target/revision; no write auto-execution or human reply fabrication'}
(B/'experiment.json').write_text(json.dumps(plan,indent=2)+'\n')
subprocess.run(['git','clone','--quiet','--no-hardlinks',str(R),str(D)],check=True)
for p in ['node_modules','packages/mcp-server/node_modules','packages/cli/generated','packages/core/generated','packages/control-ui/dist-mcp']:
 shutil.copytree(S/p,D/p,dirs_exist_ok=True)
p=D/'scripts/native-probes/codex-host-e2e.mjs';t=p.read_text();t=t.replace('for (let repetition = 1; repetition <= 2; repetition++) {','for (const repetition of process.env.AGDF_AB_REPETITION ? [Number(process.env.AGDF_AB_REPETITION)] : [1, 2]) {');assert 'AGDF_AB_REPETITION' in t;p.write_text(t)
p=D/'packages/core/lib/control-inspect/contract.js';t=p.read_text();t=t.replace("description: 'Absolute context; not target authority.'","description: 'Context; not target authority.'").replace("description: 'Confirmed absolute root.'","description: 'Confirmed root.'").replace("description: 'Draft/read gate; catalog filter.'","description: 'Document gate. Never with gate-check.'").replace("description: 'Next cursor; omit initially.'","description: 'Copy next_cursor.'")
t=t.replace('Read-only: gate-check -> operation-contract module=agdf_prepare/presentation.prepare -> catalog read_arguments -> presentation-document/next_cursor.','Read-only. Start gate-check with language, cwd, target pair and Run; omit gate/module. Copy report.next_calls; read every document page.')
t=t.replace('\nconst inspectContract = {','\ninputSchema.dependentSchemas.operation = { allOf: inputSchema.allOf };\ndelete inputSchema.allOf;\n\nconst inspectContract = {');p.write_text(t)
p=D/'packages/core/lib/control-inspect/service.js';t=p.read_text().replace("import { operationContract }", "import { RUN_COMMAND_GROUPS, operationContract }")
old='return { report: evaluated, presentation: gateCheckPresentation(evaluated, input.variant, evaluate) };'
new='''// Read-only navigation derives from the same current Run and existing owners.
            // Never synthesize a write, select a historical record or waive binding checks.
            if (input.run_id && input.target_source && input.primary_target) {
              const state = readRunState(target.governance_target, { runId: input.run_id });
              const revisionId = state.meta?.revision_id;
              const valid = parseRunState(state.content, input.run_id).valid
                && runSealState(target.governance_target, state.content).status === 'valid';
              if (valid && evaluated.status_card?.run_id === input.run_id) {
                const targetId = resolveControlCommandTarget(target.governance_target).target_id;
                const common = { presentation_language: input.presentation_language,
                  working_directory: input.working_directory, target_source: input.target_source,
                  primary_target: input.primary_target, run_id: input.run_id, expected_revision_id: revisionId };
                const catalog = readPresentationCatalog(target.governance_target, { runId: input.run_id,
                  revisionId, targetId, gate: evaluated.current_gate,
                  workingDirectory: input.working_directory, targetSource: input.target_source,
                  primaryTarget: input.primary_target, language: input.presentation_language });
                const kind = evaluated.next_operation?.operation_key;
                const groups = Object.entries(RUN_COMMAND_GROUPS).filter(([, kinds]) => kinds.includes(kind));
                const nextCalls = groups.length === 1 ? [{ tool: 'agdf_inspect',
                  arguments: { operation: 'operation-contract', ...common, module: `${groups[0][0]}/${kind}` } }] : [];
                if (catalog.state === 'unique' && catalog.complete_scan && catalog.page_complete) {
                  nextCalls.push({ tool: 'agdf_inspect', arguments: catalog.candidates[0].read_arguments });
                }
                return { report: { ...evaluated, binding: { target_id: targetId, run_id: input.run_id,
                  expected_revision_id: revisionId }, presentation_catalog: catalog, next_calls: nextCalls,
                  next_calls_authorize: false }, presentation: gateCheckPresentation(evaluated, input.variant, evaluate) };
              }
            }
            '''+old
assert t.count(old)==1;t=t.replace(old,new);p.write_text(t)
print(json.dumps({'clone':str(D),'product_files':['packages/core/lib/control-inspect/contract.js','packages/core/lib/control-inspect/service.js']}))
