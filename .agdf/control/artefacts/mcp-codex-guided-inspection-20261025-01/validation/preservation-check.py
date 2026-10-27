import pathlib,json,hashlib,subprocess,os,sys
root=pathlib.Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework');run=root/'.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01';base=json.loads((run/'evidence/baseline/preservation.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest();failures=[]
env=dict(os.environ,GIT_OPTIONAL_LOCKS='0')
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,env=env,text=True).strip()
index=subprocess.check_output(['git','-c','core.fsmonitor=false','ls-files','--stage','-z'],cwd=root,env=env)
if head!=base['head']:failures.append('HEAD')
if sha(index)!=base['index_entries_sha256']:failures.append('staged_entries')
for group in ['foreign_files','other_control_files']:
 for rel,h in base[group].items():
  p=root/rel
  if not p.is_file() or sha(p.read_bytes())!=h:failures.append(rel)
for rel,h in base['protected_settings'].items():
 p=pathlib.Path.home()/'.codex'/rel
 if (sha(p.read_bytes()) if p.exists() else None)!=h:failures.append('protected_settings/'+rel)
staged=subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=root,env=env).decode().split('\0');staged=[p for p in staged if p]
assert len(staged)==14
for rel in staged:
 if (root/rel).read_bytes()!=subprocess.check_output(['git','show',':'+rel],cwd=root,env=env):failures.append('foreign_staged_worktree/'+rel)
result=dict(pass_=not failures,head=head,staged_entries_sha256=sha(index),foreign_staged_files=len(staged),foreign_untracked_files=len(base['foreign_files']),other_control_files=len(base['other_control_files']),failures=failures,model_invocations=0)
output=run/'evidence/checks'/('preservation-'+sys.argv[1]+'.json');assert not output.exists();output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(0 if not failures else 1)
