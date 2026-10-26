from pathlib import Path
import os,subprocess,json,sys,time,hashlib
B=Path('/private/tmp/agdf-inspect-evaluation');NODE='/usr/local/Cellar/node@22/22.22.3/bin/node';BIN='/Users/arndtgold/.npm-global/bin/codex';PLAN=json.loads((B/'experiment.json').read_text());MODE=sys.argv[1]; PREFIX='v2-'
assert MODE in ['preflight','initial','heldout']
env=dict(os.environ);env.update(CODEX_BIN=BIN,PATH=str(Path(NODE).parent)+os.pathsep+env.get('PATH',''))
for key in ['NODE_TEST_CONTEXT','OPENAI_API_KEY','CODEX_API_KEY','OPENAI_BASE_URL','OPENAI_ORG_ID']:env.pop(key,None)
args=[NODE,'scripts/native-probes/codex-host-e2e.mjs','--command-task','T7','--repetitions','2','--model',PLAN['model'],'--reasoning-effort','low']
if MODE=='preflight':jobs=[0]
else:
 pre=json.loads((B/'v2-preflight-results.json').read_text());assert len(pre)==1 and all(x['qualified'] for x in pre)
 assert not (B/(PREFIX+MODE+'-launches.json')).exists(),'No retry or resume'
 jobs=[2,3] if MODE=='initial' else [4,5]
 if MODE=='heldout':assert all(r['qualified'] and r['sdk_errors']==0 for r in json.loads((B/'v2-initial-results.json').read_text()))
rows=[];launches=[]
for rep in jobs:
 key=PREFIX+MODE+('-preflight' if not rep else '-'+str(rep));child_env={**env,'AGDF_AB_REPETITION':str((rep-1) if MODE=='initial' else (rep-3) if MODE=='heldout' else 1)}
 if MODE=='heldout':child_env['AGDF_EVAL_PROMPT']=json.loads((B/'v2-heldout-prompts.json').read_text())[str(rep)]
 if rep:
  total=sum(len(json.loads(p.read_text())) for p in B.glob('*-launches.json'))
  assert total<PLAN['maximum_real_sessions']
  launches.append({'session':rep,'reserved_before_spawn':True,'timestamp':time.time(),'prompt':child_env.get('AGDF_EVAL_PROMPT','Unchanged T7')});(B/(PREFIX+MODE+'-launches.json')).write_text(json.dumps(launches,indent=2)+'\n')
 print(json.dumps({'starting':key,'sessions':1 if rep else 0}),flush=True)
 with (B/(key+'.log')).open('w') as out:r=subprocess.run(args+([] if rep else ['--preflight-only']),cwd=B/'guided-v2',env=child_env,stdout=out,stderr=subprocess.STDOUT,timeout=660)
 found=[]
 for line in (B/(key+'.log')).read_text().splitlines():
  try:x=json.loads(line)
  except:continue
  if isinstance(x,dict) and 'report' in x:found.append(x)
 assert len(found)==1,(key,'Missing retained observation')
 p=Path(found[0]['report']);o=json.loads(p.read_text());m=o.get('metrics',{})
 host=(o.get('infrastructure_ok') is True and not o.get('isolation',{}).get('changed') and o.get('host',{}).get('version','').startswith('codex-cli 0.163.0'))
 if rep:host=host and o.get('session_invocations')==1 and o.get('observed_models')==[PLAN['model']] and o.get('observed_efforts')==['low']
 else:host=host and o.get('session_invocations')==0 and o.get('preflight_status')=='pass'
 row={'session':rep,'cohort':MODE,'report':str(p),'report_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'exit':r.returncode,'infrastructure_qualified':host,'qualified':host and (not rep or o.get('complete') is True),'calls':m.get('calls'),'sdk_errors':m.get('invalid_argument_calls'),'metrics':m,'strict':o.get('strict'),'original_predicate':o.get('original_predicate'),'trace_complete':o.get('trace_complete'),'definition_bytes':o.get('discovery',{}).get('inspect_definition_bytes'),'error':o.get('error')}
 rows.append(row);(B/(PREFIX+MODE+'-results.json')).write_text(json.dumps(rows,indent=2)+'\n')
 print(json.dumps({k:row[k] for k in ['session','cohort','qualified','calls','sdk_errors','definition_bytes','error']}),flush=True)
 if not host:sys.exit(2)
print(json.dumps({'cohort':MODE,'completed':len(rows),'qualified':sum(x['qualified'] for x in rows)}),flush=True)
