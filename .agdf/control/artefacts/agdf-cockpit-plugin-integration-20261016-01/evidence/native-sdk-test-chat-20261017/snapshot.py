from pathlib import Path
import json,hashlib,datetime,sys
repo=Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework')
roots=[repo/'.agdf/control',repo/'.agdf/config.json',repo/'.mcp.json',repo/'.codex',Path('/Users/arndtgold/.codex/config.toml'),Path('/Users/arndtgold/.codex/plugins/installed_plugins.json'),Path('/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf/.mcp.json'),Path('/Users/arndtgold/Library/Application Support/agdf/mcp/codex-plugin/mcp/current.json')]
files={}
for root in roots:
 paths=sorted(root.rglob('*')) if root.is_dir() else [root]
 for p in paths:
  if p.is_symlink():files[str(p)]={'symlink':str(p.readlink())}
  elif p.is_file():
   b=p.read_bytes();files[str(p)]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
  elif not p.exists():files[str(p)]={'missing':True}
value={'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope_roots':[str(x) for x in roots],'files':files}
Path(sys.argv[1]).write_text(json.dumps(value,indent=2)+'\n')
print(json.dumps({'path':sys.argv[1],'records':len(files)}))
