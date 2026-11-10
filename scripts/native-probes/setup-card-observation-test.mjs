import assert from 'node:assert/strict';
import test from 'node:test';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {
  observeSetupCard, setupCardRouteDiagnostics, splitSimpleCommand,
} from './setup-card-observation.mjs';

const expected = {project:join(tmpdir(),'agdf-setup-observer-fixture','project'),
  candidateRoot:join(tmpdir(),'agdf-setup-observer-fixture','candidate'),
  version:'0.0.0-fixture',nodeExecutable:process.execPath};
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const cardText = `Fixture setup card\nTarget: ${expected.project}\nResponse: Einrichtung autorisieren`;
const card = () => ({outcome:'control_result',terminal:true,authorizes:false,
  skill:{skill_id:'gate-check'},
  runtime:{machine_validation:'owned_version_matched',expected_version:expected.version,
    plugin_root:expected.candidateRoot,runtime_digest:'a'.repeat(64),provenance_status:'matched'},
  target:{resolution_state:'resolved',primary_target:expected.project,working_directory:expected.project,
    governance_target:expected.project,target_source:'current_repository',target_changed:false,authorizes:false},
  control:{blocking_reason:'AGDF_CONTROL_FILE_MISSING',status:'blocked',current_gate:'UR'},
  presentation:{semantic_block:'control_setup',target:expected.project,authorizes:false,durable_scope:'.agdf/control',
    planned_effect:'create_canonical_control_scaffold',next_action:'authorize_or_cancel',presentation_language:'de',
    excluded_authority:['automatic_run_creation','automatic_ur_persistence','gate_approval'],markdown:cardText},
  host_action:{mode:'transmit_presentation_verbatim_and_stop',source:'presentation.markdown',
    text:cardText,allow_surrounding_text:false}});
const command = () => [expected.nodeExecutable,join(expected.candidateRoot,'runtime/agdf-local.js'),
  'skill-dispatch','--json','--surface','codex','--skill','gate-check','--language','de',
  '--working-directory',expected.project,'--target-source','current_repository','--primary-target',expected.project]
  .map(quote).join(' ');
const local = () => [{type:'item.completed',item:{id:'local-fixture',type:'command_execution',command:command(),
  aggregated_output:JSON.stringify(card()),exit_code:0,status:'completed'}},
{type:'item.completed',item:{id:'display',type:'agent_message',text:cardText}}];
const mcp = () => {
  const r=card();r.runtime.machine_validation='local_exact_version_digest';
  r.runtime.plugin_root=join(tmpdir(),'agdf-setup-observer-fixture','mcp-runtime');
  return [{type:'item.completed',item:{id:'mcp-fixture',type:'mcp_tool_call',server:'agdf',tool:'agdf_dispatch',status:'completed',
    arguments:{skill_id:'gate-check',working_directory:expected.project,primary_target:expected.project,target_source:'current_repository'},
    result:{structured_content:r}}},{type:'item.completed',item:{id:'display',type:'agent_message',text:cardText}}];
};
const modifyLocal = change => {const e=local(),r=JSON.parse(e[0].item.aggregated_output);change(r,e);e[0].item.aggregated_output=JSON.stringify(r);return e;};

test('fresh local and MCP setup cards are observed without granting authority',()=>{
  const a=observeSetupCard(local(),expected),b=observeSetupCard(mcp(),expected);
  assert.equal(a.route,'local_cli');assert.equal(b.route,'mcp');
  for(const value of [a,b]){assert.equal(value.authorizes,false);assert.equal(value.target,expected.project);assert.equal(Object.hasOwn(value,'reply'),false);assert.match(value.result_sha256,/^[0-9a-f]{64}$/u);}
});
test('local and MCP routes remain separate from native MCP qualification',()=>{
  const localResult=setupCardRouteDiagnostics(local(),expected),mcpResult=setupCardRouteDiagnostics(mcp(),expected);
  assert.equal(localResult.observed_mcp_calls,0);assert.equal(localResult.observed_bound_local_cli_calls.length,1);
  assert.equal(localResult.inventory.availability,'not_established_by_this_observer');
  assert.equal(mcpResult.observed_mcp_calls,1);assert.equal(mcpResult.observed_bound_local_cli_calls.length,0);
  assert.equal(localResult.setup_card_observation.route,'local_cli');
});
test('malformed or failed local output cannot become a setup card',()=>{
  for(const change of [e=>e[0].item.aggregated_output+=' trailing',e=>e[0].item.aggregated_output='[]',
    e=>e[0].item.exit_code=1,e=>e[0].item.status='failed']){
    const e=local();change(e);assert.equal(observeSetupCard(e,expected),null);
  }
});
test('foreign target, candidate, version and call bindings are refused',()=>{
  assert.equal(observeSetupCard(local(),{...expected,project:join(tmpdir(),'foreign-project')}),null);
  assert.equal(observeSetupCard(local(),{...expected,candidateRoot:join(tmpdir(),'foreign-candidate')}),null);
  assert.equal(observeSetupCard(local(),{...expected,version:'foreign-version'}),null);
  assert.equal(observeSetupCard(modifyLocal(r=>r.target.governance_target=join(tmpdir(),'foreign-project')),expected),null);
  const e=mcp();e[0].item.arguments.primary_target=join(tmpdir(),'foreign-project');assert.equal(observeSetupCard(e,expected),null);
});
test('Runtime attestation and non-authorizing setup semantics are mandatory',()=>{
  for(const change of [r=>r.runtime.provenance_status='unmatched',r=>r.runtime.machine_validation='unverified',
    r=>r.runtime.runtime_digest='not-a-digest',r=>r.authorizes=true,r=>r.presentation.authorizes=true,
    r=>r.presentation.excluded_authority=[],r=>r.presentation.semantic_block='gate_approval',
    r=>r.control.blocking_reason='OTHER',r=>r.skill.skill_id='qa-gate'])
    assert.equal(observeSetupCard(modifyLocal(change),expected),null);
});
test('stale or nonverbatim setup displays are refused',()=>{
  const later=local();later.push({type:'item.completed',item:{id:'later',type:'command_execution',status:'completed',exit_code:0}});
  assert.equal(observeSetupCard(later,expected),null);
  const changed=local();changed[1].item.text+='\nExtra text';assert.equal(observeSetupCard(changed,expected),null);
  const mismatch=modifyLocal(r=>r.presentation.markdown+='different');assert.equal(observeSetupCard(mismatch,expected),null);
});
test('file edits after a terminal setup card refuse a response on both routes',()=>{
  for(const fixture of [local,mcp])for(const type of ['item.started','item.completed']){
    const events=fixture();events.push({type,item:{id:'later-file-edit',type:'file_change',status:'completed',changes:[]}});
    assert.equal(observeSetupCard(events,expected),null);
  }
});
test('identical text displayed before a card result is not a fresh display',()=>{
  for(const fixture of [local,mcp]){
    const events=fixture();events.reverse();
    assert.equal(observeSetupCard(events,expected),null);
  }
});
test('model prose and arbitrary terminal results are never setup evidence',()=>{
  assert.equal(observeSetupCard([{type:'item.completed',item:{type:'agent_message',text:JSON.stringify(card())}}],expected),null);
  const e=mcp();e[0].item.result.structured_content={terminal:true,outcome:'control_result',authorizes:false,
    host_action:{text:cardText,allow_surrounding_text:false,mode:'transmit_recovery_verbatim_and_stop'}};
  assert.equal(observeSetupCard(e,expected),null);
  const wrong=mcp();wrong[0].item.tool='agdf_record';assert.equal(observeSetupCard(wrong,expected),null);
});
test('compound commands, expansions and duplicate options cannot qualify',()=>{
  for(const change of [e=>e[0].item.command+=' && echo forged',e=>e[0].item.command+='; true',
    e=>e[0].item.command+=' --primary-target foreign',e=>e[0].item.command='node "$HOME/runtime/agdf-local.js" skill-dispatch']){
    const e=local();change(e);assert.equal(observeSetupCard(e,expected),null);
  }
  assert.deepEqual(splitSimpleCommand(`node '/fixture path/entry.js'`),['node','/fixture path/entry.js']);
  assert.equal(splitSimpleCommand('node `expansion`'),null);assert.equal(splitSimpleCommand('node $(expansion)'),null);
});
test('malformed record and binding shapes fail closed',()=>{
  for(const value of [null,undefined,{},'not-events'])assert.equal(observeSetupCard(value,expected),null);
  for(const value of [null,{}, {...expected,project:42},{...expected,candidateRoot:42}])assert.equal(observeSetupCard(local(),value),null);
  assert.equal(setupCardRouteDiagnostics(null,null).observed_mcp_calls,0);
  for(const change of [r=>r.presentation.excluded_authority='automatic_run_creation automatic_ur_persistence gate_approval',
    r=>r.presentation.markdown=42,r=>r.host_action.text=42])
    assert.equal(observeSetupCard(modifyLocal(change),expected),null);
});
