# Bound Run launcher. T7 entry exclusively owns policy, reservation and guarded worker.
import os,sys,json,hashlib,pathlib,subprocess,shutil,time
ROOT=pathlib.Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework')
RUN=ROOT/'.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01'
C=pathlib.Path(json.loads((RUN/'evidence/baseline/candidate.json').read_text())['candidate'])
E=RUN/'evidence/qualification/renewed';W=C/'qualification-wrapper/renewed'
NODE='/usr/local/Cellar/node@22/22.22.3/bin/node';CODEX='/Users/arndtgold/.npm-global/bin/codex'
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def save(p,v):
 assert not p.exists(), 'PRESERVE_EXISTING:'+str(p)
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2)+'\n')
def current_files():
 old=json.loads((RUN/'evidence/build/frozen-candidate.json').read_text());files={}
 for rel in sorted(set(old['files'])|{'scripts/native-probes/lib/codex-command-guard.mjs'}):
  p=C/rel;files[rel]={'symlink':os.readlink(p)} if p.is_symlink() else {'sha256':sha(p)}
 return files
mode=sys.argv[1];assert mode in ['prepare','preflight','cohort']
if mode=='prepare':
 for name in ['guard-integration-03','compatibility-guard-01']:
  assert json.loads((RUN/'evidence/checks'/(name+'.json')).read_text())['exit_code']==0,name
 old=json.loads((RUN/'evidence/build/source-bindings.json').read_text())
 paths=list(old['source'])+list(old['invariants'])+['scripts/native-probes/lib/codex-command-guard.mjs','scripts/native-probes/codex-command-task-test.mjs']
 bindings={rel:sha(ROOT/rel) for rel in sorted(set(paths))}
 for rel,h in bindings.items():assert sha(C/rel)==h,rel
 for path,h in old['assembly'].items():assert sha(path)==h,path
 for path,h in old['ui'].items():assert sha(path)==h,path
 save(E/'frozen-candidate.json',{'candidate':str(C),'files':current_files(),'model_invocations':0})
 settings=json.loads((RUN/'evidence/baseline/preservation.json').read_text())['protected_settings']
 home=(pathlib.Path.home()/'.codex').resolve()
 for rel,h in settings.items():assert (sha(home/rel) if (home/rel).exists() else None)==h,rel
 frozen={'path':str(E/'frozen-candidate.json'),'sha256':sha(E/'frozen-candidate.json')}
 final={'bindings':bindings,'frozen_candidate':frozen,'expected_settings':settings,'root':str(ROOT),'candidate':str(C),'codex_home':str(home),'source_assembly':old['assembly'],'sdk':old['sdk'],'sdk_runtime_digest':old['sdk_runtime_digest'],'ui':old['ui'],'model':'gpt-6.1-sol','reasoning_effort':'low','max_real_sessions':2,'additional_api_spend_authorized_usd':0,'model_invocations':0,'launcher_sha256':sha(__file__)}
 save(E/'final-bindings.json',final)
 save(W/'preflight-input-01.json',{'schema_version':1,**{k:final[k] for k in ['bindings','frozen_candidate','expected_settings','root','candidate','codex_home']},'output':str(W/'preflight-01'),'ledger':str(W/'ledger.json')})
 print(json.dumps({'phase':'prepared','frozen_files':len(current_files()),'model_invocations':0}));sys.exit(0)
final=json.loads((E/'final-bindings.json').read_text());assert sha(__file__)==final['launcher_sha256'],'LAUNCHER_CHANGED'
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
 if key in ['CODEX_API_KEY','AGDF_AB_REPETITION','NODE_TEST_CONTEXT','AGDF_T7_GUARD_WORKER'] or key.startswith(('OPENAI_','AZURE_OPENAI_')):env.pop(key)
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
budget=json.loads((RUN/'evidence/checks/budget.json').read_text());inspect=next(x for x in budget['tools'] if x['name']=='agdf_inspect')
checks=[]
for path,report in records:
 check={'source':str(path),'task':'T7','model_invocations':report['session_invocations'],'error':report.get('error'),'guard_matches':report.get('host_guard',{}).get('policy_digest')==result.get('policy_digest'),'discovery_matches':report.get('discovery',{}).get('inspect_definition_digest')=='sha256:'+inspect['sha256'],'isolation_unchanged':not report.get('isolation',{}).get('changed')}
 if mode=='preflight':check['qualified']=report.get('preflight_status')=='pass' and report['session_invocations']==0
 else:check['qualified']=bool(report.get('complete') and report.get('trace_complete') and report.get('strict',{}).get('success') and report.get('original_predicate',{}).get('success') and report.get('observed_models')==['gpt-6.1-sol'] and report.get('observed_efforts')==['low'] and report.get('metrics',{}).get('calls',999)<=4 and report.get('metrics',{}).get('invalid_calls',999)==0 and not report.get('detours'))
 check['qualified']=check['qualified'] and check['guard_matches'] and check['discovery_matches'] and check['isolation_unchanged'] and not check['error'];checks.append(check)
dest=E/('preflight' if mode=='preflight' else 'native');assert not dest.exists()
shutil.copytree(output,dest/'controller')
for i,(path,report) in enumerate(records,1):
 target=dest/('original-preflight' if mode=='preflight' else 'session-%02d'%i);target.mkdir()
 for name in ['observation.json','events.jsonl','rollouts.jsonl','effective-config.toml','final-message.txt']:
  source=path.parent/name
  if source.exists():shutil.copyfile(source,target/name)
 save(target/'retention-manifest.json',{'original':str(path.parent),'files':{p.name:sha(p) for p in target.iterdir() if p.is_file()}})
for p in [input_path,W/(mode+'-launcher.stdout.log'),W/(mode+'-launcher.stderr.log')]+([W/'ledger.json'] if (W/'ledger.json').exists() else []):shutil.copyfile(p,dest/p.name)
summary={'phase':mode,'qualified':code==0 and result['exit_code']==0 and result['preserved'] and len(records)==(1 if mode=='preflight' else 2) and all(x['qualified'] for x in checks) and result['model_invocations']==(0 if mode=='preflight' else 2),'controller':result,'observations':checks,'model_invocations':result['model_invocations'],'elapsed_seconds':time.monotonic()-start,'original_evidence_retained':True}
save(E/('preflight-summary.json' if mode=='preflight' else 'native-summary.json'),summary)
print(json.dumps(summary),flush=True);sys.exit(0 if summary['qualified'] else 1)
