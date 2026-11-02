import json,re,pathlib,hashlib,subprocess
repo=pathlib.Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework'); root=pathlib.Path('/private/tmp/agdf-baseline-reconstruct-40'); base=json.loads((repo/'.agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/evidence/BASELINE.json').read_text())
allowed={'packages/cli/package.json','packages/core/lib/control-state/run-revision-boundary.js','packages/core/lib/control-state/run-revision-history.js','packages/core/lib/control-state/run-revision.js'}
records=[json.loads(s) for s in open('/private/tmp/agdf-baseline-provenance-40.jsonl')]; edits=[]
for r in records:
 if r['line'] not in [11805,11838,11854]:continue
 s=r['record']['payload'];t=s.get('input',s.get('arguments',''))
 for m in re.finditer(r'tools\.apply_patch\(("(?:[^"\\]|\\.)*")\)',t):
  patch=json.loads(m.group(1));lines=patch.splitlines();i=0
  while i<len(lines):
   line=lines[i];i+=1
   if not line.startswith(('*** Add File: ','*** Update File: ')):continue
   adding=line.startswith('*** Add File: ');path=line.split(': ',1)[1];rel=path.removeprefix(str(repo)+'/');section=[]
   while i<len(lines) and not lines[i].startswith('*** '):section.append(lines[i]);i+=1
   if rel not in allowed:continue
   f=root/rel;f.parent.mkdir(parents=True,exist_ok=True)
   if adding:f.write_text('\n'.join(v[1:] for v in section if v.startswith('+'))+'\n')
   else:
    text=f.read_text();chunks=[];chunk=[]
    for v in section:
     if v.startswith('@@'):
      if chunk:chunks.append(chunk);chunk=[]
     elif v and v[0] in ' +-':chunk.append(v)
    if chunk:chunks.append(chunk)
    for chunk in chunks:
     old='\n'.join(v[1:] for v in chunk if v[0] in ' -')+'\n';new='\n'.join(v[1:] for v in chunk if v[0] in ' +')+'\n'
     if text.count(old)!=1:raise RuntimeError(f'unique original hunk absent: {rel} at {r["line"]}, matches={text.count(old)}')
     text=text.replace(old,new,1)
    f.write_text(text)
   edits.append({'history_line':r['line'],'path':rel})
rows=[]
for p in sorted(allowed):
 actual='sha256:'+hashlib.sha256((root/p).read_bytes()).hexdigest();rows.append({'path':p,'expected':base['files'][p],'actual':actual,'exact':actual==base['files'][p]})
report={'evidence_class':'exact_history_patch_reconstruction_checked_against_original_baseline','edits':edits,'files':rows,'all_exact':all(r['exact'] for r in rows),'original_source_and_index_changed':False}
(root/'RECOVERY.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
