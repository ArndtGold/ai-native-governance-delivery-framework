from pathlib import Path
import shutil,subprocess,json,re
B=Path('/private/tmp/agdf-inspect-evaluation');S=B/'guided';D=B/'guided-v2';R=Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework')
assert not D.exists();subprocess.run(['git','clone','--quiet','--no-hardlinks',str(R),str(D)],check=True)
for p in ['node_modules','packages/mcp-server/node_modules','packages/cli/generated','packages/core/generated','packages/control-ui/dist-mcp']:shutil.copytree(S/p,D/p,dirs_exist_ok=True)
for name in ['contract.js','service.js']:shutil.copy2(S/'packages/core/lib/control-inspect'/name,D/'packages/core/lib/control-inspect'/name)
shutil.copy2(S/'scripts/native-probes/codex-host-e2e.mjs',D/'scripts/native-probes/codex-host-e2e.mjs')
shutil.copy2(S/'evaluation-checks.mjs',D/'evaluation-checks.mjs')
p=D/'packages/core/lib/control-inspect/service.js';s=p.read_text();a=s.index('            // Read-only navigation');b=s.index('            return { report: evaluated, presentation: gateCheckPresentation',a)
s=s[:a]+'''            // Catalog validation owns fresh Run, revision, seal and target checks.
            if (input.run_id && input.target_source && input.primary_target && evaluated.status_card?.run_id === input.run_id) {
              const revisionId = evaluated.status_card.runState?.meta?.revision_id;
              const targetId = resolveControlCommandTarget(target.governance_target).target_id;
              const common = Object.fromEntries(['presentation_language', 'working_directory', 'target_source', 'primary_target', 'run_id'].map(key => [key, input[key]]));
              common.expected_revision_id = revisionId;
              const catalog = readPresentationCatalog(target.governance_target, { runId: input.run_id, revisionId, targetId,
                gate: evaluated.current_gate, workingDirectory: input.working_directory, targetSource: input.target_source,
                primaryTarget: input.primary_target, language: input.presentation_language });
              const groups = Object.entries(RUN_COMMAND_GROUPS).filter(([, kinds]) => kinds.includes(evaluated.next_operation?.operation_key));
              const nextCalls = catalog.state !== 'unavailable' && groups.length === 1 ? [{ tool: 'agdf_inspect', arguments: {
                operation: 'operation-contract', ...common, module: `${groups[0][0]}/${evaluated.next_operation.operation_key}` } }] : [];
              if (catalog.state === 'unique' && catalog.complete_scan && catalog.page_complete)
                nextCalls.push({ tool: 'agdf_inspect', arguments: catalog.candidates[0].read_arguments });
              return { report: { ...evaluated, binding: { target_id: targetId, run_id: input.run_id, expected_revision_id: revisionId },
                presentation_catalog: catalog, next_calls: nextCalls, next_calls_authorize: false },
                presentation: gateCheckPresentation(evaluated, input.variant, evaluate) };
            }
'''+s[b:]
a=s.index('// The MCP read tool');b=s.index('\nconst defaultNow',a)
s=s[:a]+'''// Read-only projection of canonical CLI evaluators and Core validators. It never
// writes, selects a Run or prepares approval. Git observations are unavailable.
'''+s[b:];p.write_text(s)
p=D/'packages/core/lib/control-inspect/contract.js';s=p.read_text();s=s.replace('Copy report.next_calls; read every document page.','Follow report.next_calls in order; read every document page.')
helps={
'operation':'Read-only action; never prepares or approves.',
'presentation_language':'Required BCP47 tag; unsupported valid languages fall back to complete English.',
'working_directory':'Absolute context; never selects a target.',
'target_source':'Actual provenance: explicit_target = specified, continued_target = confirmed continuation, current_repository = unambiguous repository.',
'primary_target':'Confirmed absolute root paired with target_source; cwd is not target authority.',
'run_id':'Named or unambiguously confirmed Run; never select by recency.',
'gate':'Requested document gate or catalog filter, never a selection heuristic. artifact-readiness: UR/PRD/SD/TP only.',
'expected_revision_id':'Current gate-check revision for bound inspections. Document/preview: preserve selected catalog record original revision or exact conversation binding.',
'presentation_id':'Exact prepared ID from validated catalog or conversation. Never guess, select by timestamp, or prepare a replacement to read.',
' target_id':'',
'cursor':'Omit initially; copy next_cursor. Catalog cursors: only operation-contract module=agdf_prepare/presentation.prepare. Never exchange cursor types.',
'variant':'gate-check view only; never records approval.',
'module':'contract: advertised module; operation-contract: group/kind; operation-status: original operation UUID from saved receipt, never a new UUID.',
'all_active':'true only for doctor/delivery-map; false keeps selected-Run behavior.'}
for key,val in helps.items():
 if key.startswith(' '):continue
 pattern=r'('+re.escape(key)+r": \{ help: ')[^']*(')"
 s,n=re.subn(pattern,lambda m:m[1]+val+m[2],s,count=1);assert n==1,key
s=s.replace("Copy binding.target_id from operation-contract or the selected catalog read_arguments; this digest identifies a target and grants no authority.","Copy target hash from operation-contract binding or selected catalog read_arguments; grants no authority.")
a=s.index('// Detailed result semantics');b=s.index('export const CONTROL_INSPECT_OUTPUT_SCHEMA',a)
s=s[:a]+'// Core retains full result validation; discovery advertises the bounded envelope.\n'+s[b:]
s=s.replace("// Normalizes a raw inspect input with the dispatcher's language and target rules and the shared\n// read-selection rules. Throws SkillDispatchInputError or ReadSelectionError; both carry `field`.","// Shared language, target and read-selection rules; errors carry the invalid field.")
s=s.replace('// Same 1 MiB ceiling as the dispatcher, but the fallback keeps the inspect result shape so the host\n// receives a schema-valid recovery instead of a schema error.','// Preserve the result envelope when enforcing the shared 1 MiB output ceiling.')
p.write_text(s)
for name in ['contract.js','service.js']:
 print(name,'v1',len((S/'packages/core/lib/control-inspect'/name).read_bytes()),'v2',len((D/'packages/core/lib/control-inspect'/name).read_bytes()))
print(D)
