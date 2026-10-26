import pathlib,subprocess,os,json,hashlib,sys
ROOT=pathlib.Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework');RUN=ROOT/'.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01';C=pathlib.Path(json.loads((RUN/'evidence/baseline/candidate.json').read_text())['candidate']);OUT=C/'qualification-wrapper/combined-guard-proof';OUT.mkdir(parents=True,exist_ok=False)
CODEX='/Users/arndtgold/.npm-global/bin/codex';HOME=pathlib.Path.home()/'.codex';settings=[HOME/x for x in ['config.toml','plugins/installed_plugins.json','plugins/known_marketplaces.json']];source=ROOT/'packages/core/lib/control-inspect/contract.js'
sha=lambda b:hashlib.sha256(b).hexdigest()
def snapshots():return {str(p):sha(p.read_bytes()) if p.exists() else None for p in [*settings,source]}
before=snapshots();policy='(version 1)\n(allow default)\n(deny file-write* (subpath '+json.dumps(str(ROOT))+'))\n(deny file-write* '+' '.join('(literal '+json.dumps(str(p))+')' for p in settings)+')\n';(OUT/'combined.sb').write_text(policy)
worker=OUT/'read-only-worker.py';worker.write_text('''import os,sys,json,subprocess,pathlib,hashlib
root_file,config_file,codex,temp_root=sys.argv[1:]
checks=[]
for file in [root_file,config_file]:
 try:
  fd=os.open(file,os.O_WRONLY|os.O_APPEND)
 except PermissionError:checks.append(dict(path=file,append_open_denied=True))
 else:
  os.close(fd);raise RuntimeError('PROTECTED_APPEND_OPEN_ALLOWED')
p=pathlib.Path(temp_root)/'owned-positive-control';p.write_text('guard positive control');assert p.read_text()=='guard positive control';p.unlink()
r=subprocess.run([codex,'login','status'],capture_output=True,text=True,timeout=15)
v=subprocess.run([codex,'--version'],capture_output=True,text=True,timeout=15)
report=dict(append_checks=checks,owned_temp_write_allowed=True,login_status_exit=r.returncode,chatgpt_detected='Logged in using ChatGPT' in r.stdout+r.stderr,login_stdout_sha256=hashlib.sha256(r.stdout.encode()).hexdigest(),login_stderr_sha256=hashlib.sha256(r.stderr.encode()).hexdigest(),codex_version=v.stdout.strip(),model_invocations=0,credential_values_retained=False)
print(json.dumps(report));sys.exit(0 if r.returncode==0 and report['chatgpt_detected'] and v.returncode==0 else 1)
''')
env=dict(os.environ)
for key in list(env):
 if key in ['CODEX_API_KEY','OPENAI_API_KEY','OPENAI_BASE_URL','OPENAI_ORG_ID','NODE_TEST_CONTEXT'] or key.startswith('OPENAI_') or key.startswith('AZURE_OPENAI_'):env.pop(key)
argv=['/usr/bin/sandbox-exec','-f',str(OUT/'combined.sb'),sys.executable,str(worker),str(source),str(settings[0]),CODEX,str(OUT)]
r=subprocess.run(argv,cwd=C,env=env,capture_output=True,text=True,timeout=40);after=snapshots()
(OUT/'stdout.json').write_text(r.stdout);(OUT/'stderr.log').write_text(r.stderr)
report=dict(classification='model_free_single_combined_policy_planning_proof',exit_code=r.returncode,argv=argv,policy_sha256=sha(policy.encode()),same_protected_targets=[str(ROOT),*[str(p) for p in settings]],snapshots_before=before,snapshots_after=after,protected_files_unchanged=before==after,model_invocations=0,existing_harness_unchanged=True,qualification_task_executed=False,guard_layers=1)
(OUT/'result.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));print(r.stdout);sys.exit(0 if r.returncode==0 and before==after else 1)
