# Bound Run launcher. T7 entry exclusively owns policy, reservation and guarded worker.
import os,sys,json,hashlib,pathlib,subprocess,shutil,time
ROOT=pathlib.Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework')
RUN=ROOT/'.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01'
C=pathlib.Path(json.loads((RUN/'evidence/baseline/candidate.json').read_text())['candidate'])
E=RUN/'evidence/qualification/pair-guidance-01';W=C/'qualification-wrapper/pair-guidance-01'
PRIOR=C/'qualification-wrapper/renewed/ledger.json'
PRIOR_SUMMARY=RUN/'evidence/qualification/renewed/native-summary.json'
TP_DIGEST='sha256:094ac6cef506aa40ccfb04cfc88056420c15f65963d650847f27d1c3bdcd04bb'
NODE='/usr/local/Cellar/node@22/22.22.3/bin/node';CODEX='/Users/arndtgold/.npm-global/bin/codex'
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def save(p,v):
 assert not p.exists(), 'PRESERVE_EXISTING:'+str(p)
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2)+'\n')
def current_files():
 env=dict(os.environ,GIT_OPTIONAL_LOCKS='0')
 paths=set(subprocess.check_output(['git','-c','core.fsmonitor=false','ls-files','--cached','--others','--exclude-standard','-z'],cwd=C,env=env).decode().split('\0'))-{''}
 paths={p for p in paths if not p.startswith(('qualification-wrapper/','probe-results/'))}
 for directory in ['packages/core/generated','packages/cli/generated','packages/control-ui/dist-mcp','dist/npm','node_modules','packages/mcp-server/node_modules']:
  for p in (C/directory).rglob('*'):
   if p.is_file() or p.is_symlink():paths.add(str(p.relative_to(C)))
 paths.add('scripts/native-probes/lib/codex-command-guard.mjs')
 files={}
 for rel in sorted(paths):
  p=C/rel
  if p.is_symlink():files[rel]={'symlink':os.readlink(p)}
  elif p.is_file():files[rel]={'sha256':sha(p)}
  else:raise RuntimeError('FROZEN_INPUT_UNAVAILABLE:'+rel)
 return files
mode=sys.argv[1];assert mode in ['prepare','preflight','cohort']
if mode=='prepare':
 assert json.loads(PRIOR_SUMMARY.read_text())['model_invocations']==2
 assert json.loads(PRIOR.read_text())['sessions_reserved']==[1,2]
 assert not W.exists() and not E.exists(), 'PRESERVE_DISTINCT_NEW_NAMESPACE'
 for name in ['guard-integration-03','pair-schema-01','pair-cli-01','pair-renderer-01','pair-protocol-01','pair-build-prepare-01','pair-compatibility-record-01','pair-normal-build-01','pair-source-bindings-01','pair-copilot-01','pair-performance-01']:
  assert json.loads((RUN/'evidence/checks'/(name+'.json')).read_text())['exit_code']==0,name
 old=json.loads((RUN/'evidence/pair-guidance/build/source-bindings.json').read_text())
 paths=list(old['source'])+list(old['invariants'])+['scripts/native-probes/lib/codex-command-guard.mjs','scripts/native-probes/codex-command-task-test.mjs']
 expected={**old['source'],**old['invariants'],**json.loads((RUN/'evidence/preparation-tp-03.json').read_text())['source_hashes']}
 for rel,h in expected.items():assert sha(ROOT/rel)==h and sha(C/rel)==h, 'APPROVED_SOURCE_CHANGED:'+rel
 bindings={rel:sha(ROOT/rel) for rel in sorted(set(paths))}
 for rel,h in bindings.items():assert sha(C/rel)==h,rel
 for path,h in old['assembly'].items():assert sha(path)==h,path
 for path,h in old['ui'].items():assert sha(path)==h,path
 for name,value in old['sdk'].items():assert sha(C/'packages/mcp-server/node_modules'/name/'package.json')==value['manifest_sha256']
 sdk_module=(C/'packages/core/lib/runtime/plugin-provenance.js').as_uri()
 sdk_code='import {digestMcpSdkRuntime} from '+json.dumps(sdk_module)+';console.log(digestMcpSdkRuntime('+json.dumps(str(C/'packages/mcp-server'))+'));'
 assert subprocess.check_output([NODE,'--input-type=module','-e',sdk_code],cwd=C,text=True).strip()==old['sdk_runtime_digest'], 'SDK_RUNTIME_CHANGED'
 save(E/'frozen-candidate.json',{'candidate':str(C),'files':current_files(),'model_invocations':0})
 settings=json.loads((RUN/'evidence/baseline/preservation.json').read_text())['protected_settings']
 home=(pathlib.Path.home()/'.codex').resolve()
 for rel,h in settings.items():assert (sha(home/rel) if (home/rel).exists() else None)==h,rel
 frozen={'path':str(E/'frozen-candidate.json'),'sha256':sha(E/'frozen-candidate.json')}
 final={'bindings':bindings,'frozen_candidate':frozen,'expected_settings':settings,'root':str(ROOT),'candidate':str(C),'codex_home':str(home),'source_assembly':old['assembly'],'sdk':old['sdk'],'sdk_runtime_digest':old['sdk_runtime_digest'],'ui':old['ui'],'model':'gpt-6.1-sol','reasoning_effort':'low','max_real_sessions':2,'additional_api_spend_authorized_usd':0,'model_invocations':0,'launcher_sha256':sha(__file__),'tp_digest':TP_DIGEST,'cohort_id':'pair-guidance-01','new_run_session_slots':[3,4],'spent_prior_sessions':2,'prior_ledger_sha256':sha(PRIOR),'prior_summary_sha256':sha(PRIOR_SUMMARY),'observed_execution_tuple':{'node':'22.22.3','codex_cli':'0.163.0','os':'darwin','arch':'x64','os_release':'24.6.0'}}
 save(E/'final-bindings.json',final)
 save(W/'preflight-input-01.json',{'schema_version':1,**{k:final[k] for k in ['bindings','frozen_candidate','expected_settings','root','candidate','codex_home']},'output':str(W/'preflight-01'),'ledger':str(W/'ledger.json')})
 print(json.dumps({'phase':'prepared','frozen_files':len(current_files()),'model_invocations':0}));sys.exit(0)
final=json.loads((E/'final-bindings.json').read_text());assert sha(__file__)==final['launcher_sha256'],'LAUNCHER_CHANGED'
assert final['tp_digest']==TP_DIGEST and sha(PRIOR)==final['prior_ledger_sha256'] and sha(PRIOR_SUMMARY)==final['prior_summary_sha256'], 'PRIOR_SOURCE_OR_LEDGER_CHANGED'
assert current_files()==json.loads((E/'frozen-candidate.json').read_text())['files'],'FINAL_CANDIDATE_CHANGED'
if mode=='cohort':
 assert not (W/'ledger.json').exists(),'NO_RETRY_OR_REPLACEMENT'
 receipt=W/'preflight-01/result.json';pre=json.loads(receipt.read_text());assert pre['exit_code']==0 and pre['preserved'] and pre['model_invocations']==0
 observations=json.loads((E/'preflight-summary.json').read_text());assert observations['qualified'] and observations['model_invocations']==0
 input_path=W/'cohort-input-01.json'
 save(input_path,{'schema_version':1,**{k:final[k] for k in ['bindings','frozen_candidate','expected_settings','root','candidate','codex_home']},'output':str(W/'cohort-01'),'ledger':str(W/'ledger.json'),'preflight':{'path':str(receipt),'sha256':sha(receipt)}})
else:input_path=W/'preflight-input-01.json'
value=json.loads(input_path.read_text());output=pathlib.Path(value['output']);assert not output.exists(),'NO_REPLAY'
env=dict(os.environ)
for key in list(env):
 if key in ['CODEX_API_KEY','AGDF_AB_REPETITION','NODE_TEST_CONTEXT','AGDF_T7_GUARD_WORKER','AGDF_TEST_EVIDENCE_DIR'] or key.startswith(('OPENAI_','AZURE_OPENAI_')):env.pop(key)
env.update(CODEX_BIN=CODEX,CODEX_HOME=final['codex_home'],AGDF_T7_GUARD_INPUT=str(input_path),GIT_OPTIONAL_LOCKS='0',PATH=str(pathlib.Path(NODE).parent)+os.pathsep+env['PATH'])
argv=[NODE,'scripts/native-probes/codex-host-e2e.mjs','--command-task','T7','--repetitions','2','--model','gpt-6.1-sol','--reasoning-effort','low']
if mode=='preflight':argv.append('--preflight-only')
print(json.dumps({'phase':mode+'_launch','direct_controller':True,'session_budget':0 if mode=='preflight' else 2}),flush=True)
start=time.monotonic()
with (W/(mode+'-launcher.stdout.log')).open('xb') as out,(W/(mode+'-launcher.stderr.log')).open('xb') as err:
 process=subprocess.Popen(argv,cwd=C,env=env,stdout=out,stderr=err)
 try:code=process.wait(timeout=1510)
 except subprocess.TimeoutExpired:
  process.terminate()
  try:process.wait(timeout=5)
  except subprocess.TimeoutExpired:process.kill();process.wait()
  code=124
# The guarded window has ended. Verify/comparison is controller-owned before any import.
result=json.loads((output/'result.json').read_text()) if (output/'result.json').exists() else {'exit_code':code,'failure':'CONTROLLER_RESULT_UNAVAILABLE','preserved':False,'model_invocations':None}
records=[]
if (output/'stdout.log').exists():
 for line in (output/'stdout.log').read_text().splitlines():
  try:row=json.loads(line)
  except ValueError:continue
  if row.get('report'):
   path=pathlib.Path(row['report']);assert path.is_relative_to(C/'probe-results')
   report=json.loads(path.read_text());records.append((path,report))
budget=json.loads((RUN/'evidence/pair-guidance/checks/budget.json').read_text());inspect=next(x for x in budget['tools'] if x['name']=='agdf_inspect')
checks=[]
for path,report in records:
 check={'source':str(path),'task':'T7','metrics':report.get('metrics'),'observed_models':report.get('observed_models'),'observed_efforts':report.get('observed_efforts'),'strict':report.get('strict'),'original_predicate':report.get('original_predicate'),'model_invocations':report['session_invocations'],'error':report.get('error'),'guard_matches':report.get('host_guard',{}).get('policy_digest')==result.get('policy_digest') and report.get('host_guard',{}).get('input_digest')==result.get('input_digest') and report.get('host_guard',{}).get('protected_root')==str(ROOT) and all(report.get('host_guard',{}).get(k)==True for k in ['root_write_denied','config_write_denied','positive_control']),'discovery_matches':report.get('discovery',{}).get('inspect_definition_digest')=='sha256:'+inspect['sha256'],'isolation_unchanged':report.get('isolation',{}).get('changed')==[] and report.get('isolation',{}).get('credential_copy_removed')==True and report.get('isolation',{}).get('temporary_roots_removed')==True,'host_matches':report.get('host')=={'version':'codex-cli 0.163.0','platform':'darwin','arch':'x64','node':'v22.22.3'}}
 if mode=='preflight':check['qualified']=report.get('preflight_status')=='pass' and report['session_invocations']==0
 else:check['qualified']=bool(report.get('complete') and report.get('trace_complete') and report.get('strict',{}).get('success') and report.get('original_predicate',{}).get('success') and report.get('observed_models')==['gpt-6.1-sol'] and report.get('observed_efforts')==['low'] and report.get('metrics',{}).get('calls',999)<=4 and all(report.get('metrics',{}).get(key,999)==0 for key in ['invalid_calls','invalid_argument_calls','is_error_results','agdf_failure_results','agdf_shell_calls']) and report.get('strict',{}).get('approvals')==1 and not report.get('detours'))
 check['qualified']=check['qualified'] and check['guard_matches'] and check['discovery_matches'] and check['isolation_unchanged'] and check['host_matches'] and not check['error'];checks.append(check)
assert sha(PRIOR)==final['prior_ledger_sha256'] and sha(PRIOR_SUMMARY)==final['prior_summary_sha256'], 'PRIOR_EVIDENCE_CHANGED'
dest=E/('preflight' if mode=='preflight' else 'native');assert not dest.exists()
shutil.copytree(output,dest/'controller')
for i,(path,report) in enumerate(records,1):
 target=dest/('original-preflight' if mode=='preflight' else 'session-%02d'%i);target.mkdir()
 for name in ['observation.json','events.jsonl','rollouts.jsonl','effective-config.toml','final-message.txt']:
  source=path.parent/name
  if source.exists():shutil.copyfile(source,target/name)
 save(target/'retention-manifest.json',{'original':str(path.parent),'files':{p.name:sha(p) for p in target.iterdir() if p.is_file()}})
for p in [input_path,W/(mode+'-launcher.stdout.log'),W/(mode+'-launcher.stderr.log')]+([W/'ledger.json'] if (W/'ledger.json').exists() else []):shutil.copyfile(p,dest/p.name)
summary={'phase':mode,'qualified':code==0 and result['exit_code']==0 and result['preserved'] and len(records)==(1 if mode=='preflight' else 2) and all(x['qualified'] for x in checks) and result['model_invocations']==(0 if mode=='preflight' else 2),'controller':result,'observations':checks,'model_invocations':result['model_invocations'],'elapsed_seconds':time.monotonic()-start,'original_evidence_retained':True,'cohort_id':'pair-guidance-01','tp_digest':TP_DIGEST,'spent_prior_sessions':2,'new_run_session_slots':[3,4],'run_real_sessions_total':2+result['model_invocations'] if isinstance(result['model_invocations'],int) else None,'prior_ledger_sha256':sha(PRIOR)}
save(E/('preflight-summary.json' if mode=='preflight' else 'native-summary.json'),summary)
print(json.dumps({k:summary[k] for k in ['phase','qualified','model_invocations','run_real_sessions_total','elapsed_seconds','cohort_id']}|{'preserved':result['preserved'],'failure':result.get('failure'),'observations':[{'qualified':x['qualified'],'metrics':x['metrics']} for x in checks]}),flush=True);sys.exit(0 if summary['qualified'] else 1)
