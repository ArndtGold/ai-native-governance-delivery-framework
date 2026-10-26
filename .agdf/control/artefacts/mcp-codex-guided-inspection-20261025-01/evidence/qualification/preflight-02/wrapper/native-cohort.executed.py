import os,sys,json,hashlib,pathlib,subprocess,time,signal
outer_started=time.monotonic()
ROOT=pathlib.Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework')
RUN=ROOT/'.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01'
CANDIDATE=pathlib.Path(json.loads((RUN/'evidence/baseline/candidate.json').read_text())['candidate'])
NODE='/usr/local/Cellar/node@22/22.22.3/bin/node';CODEX='/Users/arndtgold/.npm-global/bin/codex'
mode=sys.argv[1];assert mode in ['preflight-02','cohort']
OUT=CANDIDATE/'qualification-wrapper'/mode
required_checks=['build-prepare-02','normal-build-02','compatibility-record-01','compatibility-check-01','control-inspect-01','protocol-02','schema-parity-02','mcp-server-01','run-command-flow-01','copilot-profile-01','payload-budget-01','source-bindings-01']
for label in required_checks:
 result=json.loads((RUN/'evidence/checks'/(label+'.json')).read_text());assert result['exit_code']==0, 'PREREQUISITE_FAILED:'+label
visibility=json.loads((RUN/'evidence/renderer/capture/visibility.json').read_text())
assert visibility['visible_fields']==14 and visibility['visible_operations']==11 and visibility['model_invocations']==0 and visibility['account_auth']==False and visibility['external_network']=='denied'
OUT.mkdir(parents=True,exist_ok=False)
sha=lambda b:hashlib.sha256(b).hexdigest()
proc=None
def deadline(signum,frame):
 if proc is not None and proc.poll() is None:proc.terminate()
 (OUT/'outer-deadline.json').write_text(json.dumps(dict(deadline_seconds=1500,expired=True,model_budget_renewed=False))+'\n')
 sys.exit(124)
signal.signal(signal.SIGALRM,deadline);signal.alarm(1500)
protected=ROOT/ 'packages/core/lib/control-inspect/contract.js'
policy='(version 1)\n(allow default)\n(deny file-write* (subpath '+json.dumps(str(ROOT.resolve()))+'))\n'
(OUT/'original-root-read-only.sb').write_text(policy)
env=dict(os.environ);removed=[]
for key in list(env):
 if key in ['CODEX_API_KEY','OPENAI_API_KEY','OPENAI_BASE_URL','OPENAI_ORG_ID','AGDF_AB_REPETITION','NODE_TEST_CONTEXT'] or key.startswith('OPENAI_') or key.startswith('AZURE_OPENAI_'):
  removed.append(key);env.pop(key)
env['CODEX_BIN']=CODEX;env['PATH']=str(pathlib.Path(NODE).parent)+os.pathsep+env['PATH'];env['GIT_OPTIONAL_LOCKS']='0'
personal=pathlib.Path(env.get('CODEX_HOME',str(pathlib.Path.home()/'.codex'))).resolve()
inner_policy='(version 1)\n(allow default)\n(deny file-write* '+' '.join('(literal '+json.dumps(str(personal/f))+')' for f in ['config.toml','plugins/installed_plugins.json','plugins/known_marketplaces.json'])+')\n'
assert personal==(pathlib.Path.home()/'.codex').resolve(), 'PERSONAL_HOME_BINDING_CHANGED'
(OUT/'immutable-settings-expected.sb').write_text(inner_policy)
argv=['/usr/bin/sandbox-exec','-f',str(OUT/'original-root-read-only.sb'),NODE,'scripts/native-probes/codex-host-e2e.mjs','--command-task','T7','--repetitions','2','--model','gpt-6.1-sol','--reasoning-effort','low']
if mode.startswith('preflight'):argv.append('--preflight-only')
frozen_path=RUN/'evidence/build/frozen-candidate.json';frozen=json.loads(frozen_path.read_text())
def candidate_changes():
 changed=[]
 for rel,expected in frozen['files'].items():
  p=CANDIDATE/rel
  observed=dict(symlink=os.readlink(p)) if p.is_symlink() else dict(sha256=sha(p.read_bytes())) if p.is_file() else None
  if observed!=expected:changed.append(rel)
 return changed
assert not candidate_changes(), 'FROZEN_CANDIDATE_CHANGED'
expected={'scripts/native-probes/codex-host-e2e.mjs':'70e6a604900577334247824397beeaa2061cd0fc0cf1752c9aff49050ffe6f6a','evals/mcp-ergonomics/lib/native-run.js':'0241b7687a599cf64d646409466d6bcebdad0a08b51e0ebb1997d266edd67a1d','evals/mcp-ergonomics/lib/native-tasks.js':'1ed79fdfc59b6e67b6742e958a16a94a16dd06febcda2efb4f8d00b39c7bca84'}
for rel,h in expected.items():assert sha((ROOT/rel).read_bytes())==h and sha((CANDIDATE/rel).read_bytes())==h,rel
if mode=='cohort':
 pre=json.loads((CANDIDATE/'qualification-wrapper/preflight-02/result.json').read_text());assert pre['exit_code']==0 and pre['preserved']
 observations=[json.loads(p.read_text()) for p in (CANDIDATE/'probe-results').glob('*/observation.json')]
 assert len(observations)==1 and observations[0].get('preflight_status')=='pass' and observations[0]['session_invocations']==0
 ledger=RUN/'evidence/qualification/ledger.json';assert not ledger.exists();ledger.parent.mkdir(exist_ok=True)
 ledger.write_text(json.dumps(dict(cohort_launches_reserved=1,sessions_reserved=[1,2],max_model_sessions=2,model='gpt-6.1-sol',reasoning_effort='low',candidate=str(CANDIDATE),argv=argv,removed_environment_keys=removed,outer_policy=policy,outer_policy_sha256=sha(policy.encode()),harness_sources=expected,frozen_candidate_sha256=sha(frozen_path.read_bytes()),inner_policy=inner_policy,inner_policy_sha256=sha(inner_policy.encode()),additional_api_spend_authorized_usd=0,created_at=time.time()),indent=2)+'\n')
def manifest():
 files={}
 # Preserve the TP's repository/control/foreign-file scope. Ignored dependency
 # and build trees are not qualification inputs; the unchanged OS policy still
 # denies every write anywhere under the original ROOT, including those trees.
 paths=set(subprocess.check_output(['git','-c','core.fsmonitor=false','ls-files','--cached','--others','--exclude-standard','-z'],cwd=ROOT,env=env).decode().split('\0'))-{''}
 for directory,dirs,names in os.walk(ROOT/'.agdf/control',followlinks=False):
  for name in names:paths.add(str((pathlib.Path(directory)/name).relative_to(ROOT)))
 for rel in sorted(paths):
  p=ROOT/rel
  try:
   if p.is_symlink():files[rel]=dict(symlink=os.readlink(p))
   elif p.is_dir():files[rel]=dict(directory=True)
   else:files[rel]=dict(sha256=sha(p.read_bytes()),bytes=p.stat().st_size)
  except OSError as error:raise RuntimeError('ROOT_SNAPSHOT_UNAVAILABLE:'+rel+':'+str(error)) from error
 settings={}
 for rel in ['config.toml','plugins/installed_plugins.json','plugins/known_marketplaces.json']:
  p=pathlib.Path.home()/'.codex'/rel;settings[rel]=sha(p.read_bytes()) if p.exists() else None
 index=subprocess.check_output(['git','-c','core.fsmonitor=false','ls-files','--stage','-z'],cwd=ROOT,env=env)
 return dict(scope='tracked_and_nonignored_Root_files_plus_complete_control_tree; entire_Root_OS_write_denial_unchanged',files=files,settings=settings,staged_entries_sha256=sha(index))
print(json.dumps(dict(mode=mode,phase='snapshot_before',model_sessions=0)),flush=True)
before=manifest();assert before['settings']==json.loads((RUN/'evidence/baseline/preservation.json').read_text())['protected_settings'], 'PROTECTED_SETTINGS_BASELINE_CHANGED'
(OUT/'root-before.json').write_text(json.dumps(before,indent=2)+'\n')
# Opening an existing file for append must be denied before any write is attempted.
guard_code='import os,sys\ntry:\n fd=os.open(sys.argv[1],os.O_WRONLY|os.O_APPEND)\nexcept PermissionError:\n sys.exit(0)\nos.close(fd)\nsys.exit(1)\n'
guard=subprocess.run(['/usr/bin/sandbox-exec','-f',str(OUT/'original-root-read-only.sb'),sys.executable,'-c',guard_code,str(protected)],cwd=CANDIDATE,env=env,capture_output=True)
assert guard.returncode==0,'ROOT_WRITE_GUARD_UNAVAILABLE'
known=sorted(str(p) for p in (CANDIDATE/'probe-results').glob('*/observation.json')) if (CANDIDATE/'probe-results').exists() else []
print(json.dumps(dict(mode=mode,phase='guard_verified_launch',session_slots=2 if mode=='cohort' else 0)),flush=True)
started=time.time();timed_out=False
with (OUT/'stdout.log').open('wb') as out,(OUT/'stderr.log').open('wb') as err:
 proc=subprocess.Popen(argv,cwd=CANDIDATE,env=env,stdout=out,stderr=err)
 try:exit_code=proc.wait(timeout=max(1,1440-(time.monotonic()-outer_started)))
 except subprocess.TimeoutExpired:
  timed_out=True;proc.terminate()
  try:proc.wait(timeout=10)
  except subprocess.TimeoutExpired:proc.kill();proc.wait()
  exit_code=124
print(json.dumps(dict(mode=mode,phase='snapshot_after',exit_code=exit_code)),flush=True)
after=manifest();(OUT/'root-after.json').write_text(json.dumps(after,indent=2)+'\n')
changed=[k for k in set(before['files'])|set(after['files']) if before['files'].get(k)!=after['files'].get(k)]
new=sorted(str(p) for p in (CANDIDATE/'probe-results').glob('*/observation.json') if str(p) not in known)
expected_discovery=next(row for row in json.loads((RUN/'evidence/checks/budget.json').read_text())['tools'] if row['name']=='agdf_inspect')
for path in new:
 observed=json.loads(pathlib.Path(path).read_text())
 assert observed.get('host_guard',{}).get('policy_digest')==sha(inner_policy.encode()), 'INNER_POLICY_MISMATCH'
 assert observed.get('discovery',{}).get('inspect_definition_digest')=='sha256:'+expected_discovery['sha256'], 'CANDIDATE_DISCOVERY_CHANGED'
result=dict(mode=mode,argv=argv,exit_code=exit_code,timed_out=timed_out,elapsed_seconds=time.time()-started,total_wrapper_seconds=time.monotonic()-outer_started,deadline_seconds=1500,changed_root_paths=changed,settings_unchanged=before['settings']==after['settings'],staging_unchanged=before['staged_entries_sha256']==after['staged_entries_sha256'],observations=new,removed_environment_keys=removed,root_guard_verified=True,outer_policy_sha256=sha(policy.encode()))
result['changed_candidate_paths']=candidate_changes()
result['frozen_candidate_sha256']=sha(frozen_path.read_bytes())
result['preserved']=not changed and result['settings_unchanged'] and result['staging_unchanged'] and not result['changed_candidate_paths']
(OUT/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result),flush=True)
sys.exit(0 if exit_code==0 and result['preserved'] else 1)
