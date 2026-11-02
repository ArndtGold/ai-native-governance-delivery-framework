from pathlib import Path
import os,subprocess,json,sys,time,hashlib
B=Path('/private/tmp/agdf-inspect-agent-ab');NODE='/usr/local/Cellar/node@22/22.22.3/bin/node';BIN='/Users/arndtgold/.npm-global/bin/codex'
PLAN=json.loads((B/'experiment.json').read_text());MODE=sys.argv[1]
assert MODE in ['preflight','native']
env=dict(os.environ);env.update(CODEX_BIN=BIN,PATH=str(Path(NODE).parent)+os.pathsep+env.get('PATH',''))
for key in ['NODE_TEST_CONTEXT','OPENAI_API_KEY','CODEX_API_KEY','OPENAI_BASE_URL','OPENAI_ORG_ID']:env.pop(key,None)
args=[NODE,'scripts/native-probes/codex-host-e2e.mjs','--command-task','T7','--repetitions','2','--model','gpt-6.1-sol','--reasoning-effort','low']
if MODE=='preflight':
 jobs=[['baseline',0],['candidate',0]]
else:
 pre=json.loads((B/'preflights.json').read_text());assert len(pre)==2 and all(x['qualified'] for x in pre)
 assert not (B/'native-launches.json').exists(),'Refusing any experiment retry'
 jobs=PLAN['order']
rows=[];launches=[]
for variant,rep in jobs:
 key=variant+('-preflight' if MODE=='preflight' else '-rep'+str(rep))
 print(json.dumps({'phase':MODE,'starting':key,'model':'none' if MODE=='preflight' else PLAN['model'],'effort':PLAN['reasoning_effort']}),flush=True)
 child_env={**env,'AGDF_AB_REPETITION':str(rep or 1)};command=args+(['--preflight-only'] if MODE=='preflight' else [])
 if MODE=='native':
  launches.append({'variant':variant,'repetition':rep,'reserved_before_spawn':True,'timestamp':time.time()});assert len(launches)<=4
  (B/'native-launches.json').write_text(json.dumps(launches,indent=2)+'\n')
 log=B/(key+'.log')
 with log.open('w') as f:r=subprocess.run(command,cwd=B/variant,env=child_env,stdout=f,stderr=subprocess.STDOUT,timeout=660)
 found=[]
 for line in log.read_text().splitlines():
  try:x=json.loads(line)
  except json.JSONDecodeError:continue
  if isinstance(x,dict) and 'report' in x:found.append(x)
 assert len(found)==1, 'Expected one retained observation: '+key
 path=Path(found[0]['report']);o=json.loads(path.read_text())
 good=(o.get('infrastructure_ok') is True and not o.get('isolation',{}).get('changed') and o.get('host',{}).get('version','').startswith('codex-cli 0.163.0'))
 if MODE=='preflight':good=good and o.get('session_invocations')==0 and o.get('preflight_status')=='pass'
 else:good=good and o.get('session_invocations')==1 and o.get('observed_models')==[PLAN['model']] and o.get('observed_efforts')==['low']
 row={'variant':variant,'repetition':rep,'report':str(path),'report_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'exit':r.returncode,'infrastructure_qualified':good,'qualified':good and (MODE=='preflight' or o.get('complete') is True),'metrics':o.get('metrics'),'source_candidate':o.get('candidate',{}).get('git_head'),'definition_bytes':o.get('discovery',{}).get('inspect_definition_bytes'),'session_invocations':o.get('session_invocations'),'original_predicate':o.get('original_predicate'),'strict':o.get('strict'),'trace_complete':o.get('trace_complete'),'error':o.get('error')}
 rows.append(row);(B/('preflights.json' if MODE=='preflight' else 'native-results.json')).write_text(json.dumps(rows,indent=2)+'\n')
 print(json.dumps({'finished':key,'qualified':row['qualified'],'infrastructure_qualified':good,'real_sessions':o.get('session_invocations'),'definition_bytes':row['definition_bytes'],'calls':o.get('metrics',{}).get('calls'),'sdk_errors':o.get('metrics',{}).get('invalid_argument_calls'),'error':o.get('error')}),flush=True)
 if not good:sys.exit(2)
 if MODE=='preflight' and r.returncode!=0:sys.exit(2)
print(json.dumps({'phase':MODE,'completed':len(rows),'qualified':sum(x['qualified'] for x in rows)}),flush=True)
