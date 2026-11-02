import pathlib,json,hashlib,subprocess
run=pathlib.Path(__file__).resolve().parent.parent;c=pathlib.Path(json.loads((run/'evidence/baseline/candidate.json').read_text())['candidate']);files={}
paths=set(subprocess.check_output(['git','ls-files','-z'],cwd=c).decode().split('\0'))-{''}
for directory in ['packages/core/generated','packages/cli/generated','packages/control-ui/dist-mcp','dist/npm','node_modules','packages/mcp-server/node_modules']:
 base=c/directory
 for p in base.rglob('*'):
  if p.is_file() or p.is_symlink():paths.add(str(p.relative_to(c)))
for rel in sorted(paths):
 p=c/rel
 files[rel]=dict(symlink=str(p.readlink())) if p.is_symlink() else dict(sha256=hashlib.sha256(p.read_bytes()).hexdigest())
output=run/'evidence/build/frozen-candidate.json';assert not output.exists()
output.write_text(json.dumps(dict(candidate=str(c),head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=c,text=True).strip(),files=files,model_invocations=0),indent=2)+'\n')
print(json.dumps(dict(frozen_files=len(files),sha256=hashlib.sha256(output.read_bytes()).hexdigest(),model_invocations=0)))
