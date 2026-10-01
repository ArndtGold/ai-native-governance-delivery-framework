import json,re,os,shutil
from pathlib import Path
root=Path.cwd(); ev=root/'.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence'
mods=json.loads((ev/'SD_MODULE_OWNERSHIP.json').read_text())['modules']
mp={m['source']:m['planned_target'] for m in mods if m['design_owner'] in ['core','core_and_cli']}
# Keep CLI/provider adapters at their existing paths; only pure consumers target Core.
adapters={'create-agdf/lib/skill-dispatch/binding.js','create-agdf/lib/control-maintenance/interaction.js','create-agdf/lib/control-maintenance/repair.js','create-agdf/lib/control-maintenance/service.js','create-agdf/lib/control-state/run-recovery.js','create-agdf/lib/runtime/control-context.js','create-agdf/lib/cli/contract-command.js'}
originals={src:(root/src).read_text() for src in mp}
for src,dst in mp.items():
 p=root/dst;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(originals[src])
# rewrite all static relative JS imports, preserving public adapter consumers in CLI.
pat=re.compile(r'((?:from\s*|import\s*\(|import\s*)[\"\'])(\.[^\"\']+)([\"\'])')
files=list((root/'create-agdf').rglob('*.js'))+list((root/'agdf-mcp-server').rglob('*.js'))+list((root/'scripts').rglob('*.mjs'))
files=[p for p in files if 'node_modules' not in p.parts and 'generated' not in p.parts]
for src,dst in mp.items(): files.append(root/dst)
for p in files:
 rel=p.relative_to(root).as_posix(); old=next((s for s,d in mp.items() if d==rel),rel); core=rel.startswith('packages/core/')
 def subst(m):
  target=os.path.normpath(os.path.join(os.path.dirname(old),m[2])).replace(os.sep,'/')
  if target not in mp:return m[0]
  if not core and target in adapters:return m[0]
  dst=mp[target]
  spec=os.path.relpath(dst,os.path.dirname(rel)).replace(os.sep,'/') if core or not rel.startswith('create-agdf/') else '#agdf-core/'+dst.removeprefix('packages/core/lib/')
  if not spec.startswith(('.','#')):spec='./'+spec
  return m[1]+spec+m[3]
 p.write_text(pat.sub(subst,p.read_text()))
for src in mp:
 if src not in adapters:(root/src).unlink()
p=root/'create-agdf/package.json'; j=json.loads(p.read_text());j['imports']={'#agdf-core':'@agdf/core','#agdf-core/*':'@agdf/core/*'};j['devDependencies']={**j.get('devDependencies',{}),'@agdf/core':'file:../packages/core'};p.write_text(json.dumps(j,indent=2)+'\n')
core=root/'packages/core'; (core/'package.json').write_text(json.dumps({'name':'@agdf/core','private':True,'version':'0.14.5','type':'module','engines':{'node':'>=22'},'exports':{'.':'./lib/index.js','./*':'./lib/*'},'files':['lib','generated']},indent=2)+'\n')
# Development link only. Public assemblies never include this node_modules directory.
link=root/'create-agdf/node_modules/@agdf/core';link.parent.mkdir(parents=True,exist_ok=True)
if not link.exists():link.symlink_to(os.path.relpath(core,link.parent),target_is_directory=True)
(ev/'stages').mkdir(exist_ok=True); (ev/'stages/C-01_MODULES.json').write_text(json.dumps({'moves':mp,'provider_adapters':sorted(adapters)},indent=2)+'\n')
print('Extracted',len(mp),'canonical Core modules; index unchanged')
