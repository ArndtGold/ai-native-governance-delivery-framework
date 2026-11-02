"""Refresh only the already owned AGDF native marketplace after owner rollback."""
import subprocess,pathlib,json,datetime
base=pathlib.Path('/private/tmp/agdf-sdk-native-upgrade-20261017')
checks=json.loads(pathlib.Path('/private/tmp/agdf-sdk-canonical-20261017/result.json').read_text())
assert len(checks)==2 and all(r.get('exit_code')==0 for r in checks),'Final canonical lane has not passed'
rollback=json.loads((base/'publication-rollback.json').read_text())
previous='fb1def114314338c2d49ac9e03eceb3f939a23e9827e189221f35d4b39c9b235'
assert rollback['status']=='restored' and rollback['source_digest']==previous
root=pathlib.Path('/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf')
assert root.resolve()==root and not root.is_symlink()
owner=json.loads((root/'.agdf-owned.json').read_text());assert owner['owner']=='create-agdf' and owner['source_digest']==previous
codex='/Users/arndtgold/.npm-global/bin/codex'
r=subprocess.run([codex,'plugin','marketplace','list','--json'],capture_output=True,text=True,timeout=45);assert r.returncode==0
listing=json.loads(r.stdout);rows=listing['marketplaces'];own=[m for m in rows if m['name']=='agdf'];assert len(own)==1 and own[0]['root']==str(root) and own[0]['marketplaceSource']=={'sourceType':'local','source':str(root)}
assert not (base/'native-marketplace-refresh.json').exists(),'Refuse overwrite or repeated refresh'
results=[]
for args in [['plugin','marketplace','remove','agdf','--json'],['plugin','marketplace','add',str(root),'--json'],['plugin','add','agdf@agdf','--json']]:
 r=subprocess.run([codex,*args],capture_output=True,text=True,timeout=90)
 row={'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'argv':[codex,*args],'exit_code':r.returncode,'stdout':r.stdout,'stderr':r.stderr};results.append(row);(base/'native-marketplace-refresh.json').write_text(json.dumps(results,indent=2)+'\n')
 print(json.dumps({'argv':args,'exit_code':r.returncode}),flush=True)
 if r.returncode:raise SystemExit(r.returncode)
r=subprocess.run([codex,'plugin','marketplace','list','--json'],capture_output=True,text=True,timeout=45);assert r.returncode==0
(base/'marketplace-list-after-refresh.json').write_text(r.stdout)
after=json.loads(r.stdout)['marketplaces'];assert [m for m in after if m['name']!='agdf']==[m for m in rows if m['name']!='agdf'],'Foreign marketplace listing changed'
print('Refreshed owned AGDF marketplace through public native CLI; foreign marketplace rows unchanged.')
