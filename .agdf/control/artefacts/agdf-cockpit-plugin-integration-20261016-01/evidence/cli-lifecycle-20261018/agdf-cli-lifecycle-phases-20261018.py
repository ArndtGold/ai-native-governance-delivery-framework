import pathlib,subprocess,json,os,sys,selectors,time,hashlib
s=json.loads(pathlib.Path(sys.argv[1]).read_text());root=pathlib.Path(s['root']);out=pathlib.Path(s['evidence']);cli='/Users/arndtgold/.npm-global/bin/codex'
env=dict(os.environ);env.update({'CODEX_HOME':s['home'],'AGDF_DATA_DIR':str(root/'isolated-data')})
ledger=json.loads((out/'commands.json').read_text())
def cmd(label,args):
 r=subprocess.run([cli,*args],cwd=s['project'],env=env,capture_output=True,text=True,timeout=45)
 (out/(label+'.stdout')).write_text(r.stdout);(out/(label+'.stderr')).write_text(r.stderr)
 ledger.append({'label':label,'argv':[cli,*args],'cwd':s['project'],'child_environment':{'CODEX_HOME':s['home'],'AGDF_DATA_DIR':env['AGDF_DATA_DIR']},'exit_code':r.returncode});(out/'commands.json').write_text(json.dumps(ledger,indent=2)+'\n')
 if r.returncode:raise RuntimeError(label+': '+r.stderr[-1000:])
 return json.loads(r.stdout) if r.stdout.strip().startswith(('{','[')) else r.stdout
class App:
 def __init__(self,label):
  self.rows=[];self.next=0;self.label=label;self.err=open(out/(label+'-stderr.txt'),'w');self.p=subprocess.Popen([cli,'--no-daemon','app-server','--stdio'],cwd=s['project'],env=env,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=self.err,bufsize=0);self.buf=b''
  self.sel=selectors.DefaultSelector();self.sel.register(self.p.stdout,selectors.EVENT_READ)
  self.call('initialize',{'clientInfo':{'name':'agdf_cli_lifecycle_probe','version':'1'},'capabilities':{'experimentalApi':True,'requestAttestation':False}});self.send({'method':'initialized'})
 def send(self,value):
  self.rows.append({'direction':'out','message':value});self.p.stdin.write((json.dumps(value)+'\n').encode());self.p.stdin.flush()
 def call(self,method,params):
  self.next+=1;rid=self.next;self.send({'id':rid,'method':method,'params':params});deadline=time.monotonic()+35
  while time.monotonic()<deadline:
   if b'\n' not in self.buf:
    if not self.sel.select(max(0,deadline-time.monotonic())):break
    part=os.read(self.p.stdout.fileno(),65536)
    if not part:raise RuntimeError('app-server exited')
    self.buf+=part
    if len(self.buf)>4*1024**2:raise RuntimeError('bounded app-server input exceeded')
    continue
   line,self.buf=self.buf.split(b'\n',1)
   try:value=json.loads(line)
   except json.JSONDecodeError:continue
   self.rows.append({'direction':'in','message':value})
   if value.get('id')==rid and ('result'in value or 'error'in value):
    if 'error'in value:raise RuntimeError(method+': '+str(value['error']))
    return value['result']
  raise TimeoutError(method)
 def close(self):
  self.p.stdin.close()
  try:self.p.wait(timeout=4)
  except subprocess.TimeoutExpired:self.p.terminate();self.p.wait(timeout=4)
  self.err.close();self.sel.close();(out/(self.label+'-rpc.json')).write_text(json.dumps(self.rows,indent=2)+'\n')
 def __enter__(self):return self
 def __exit__(self,*args):self.close()
def write(a,key,value):return a.call('config/value/write',{'keyPath':key,'value':value,'mergeStrategy':'replace','filePath':str(pathlib.Path(s['home'])/'config.toml')})
def observe(label,expected):
 rows=cmd(label+'-mcp-list',['mcp','list','--json']);names=[r['name'] for r in rows if r['enabled']]
 assert set(names)==set(expected),(label,names,expected)
 with App(label) as a:
  status=a.call('mcpServerStatus/list',{'detail':'full','limit':100})
  assert not status.get('nextCursor'),label+' unexpected pagination'
  (out/(label+'-native-status.json')).write_text(json.dumps(status,indent=2)+'\n')
 (out/(label+'-config.toml')).write_bytes((pathlib.Path(s['home'])/'config.toml').read_bytes())
 print(json.dumps({'phase':label,'configured_enabled':names,'native_status_servers':[r.get('name') for r in status.get('data',[])]}),flush=True)
with App('create-canary') as a:write(a,'mcp_servers.lifecycle_canary',{'enabled':False,'command':'node','args':['--version']})
observe('old',['agdf'])
candidate=next(p for p in s['packages'] if p['label']=='candidate')
cmd('remove-old-marketplace',['plugin','marketplace','remove','agdf','--json'])
cmd('add-candidate-marketplace',['plugin','marketplace','add',candidate['marketplaceRoot'],'--json'])
installed=cmd('install-candidate',['plugin','add','agdf@agdf','--json']);assert installed['version']==candidate['version']
observe('updated',['agdf','agdf-cockpit'])
with App('disable') as a:write(a,'plugins."agdf@agdf".enabled',False)
observe('disabled',[])
with App('enable') as a:write(a,'plugins."agdf@agdf".enabled',True)
observe('reenabled',['agdf','agdf-cockpit'])
removed=cmd('remove-candidate',['plugin','remove','agdf@agdf','--json'])
observe('removed',[])
canaries=cmd('canary-readback',['mcp','list','--json'])
canary=next(r for r in canaries if r['name']=='lifecycle_canary')
assert canary['enabled'] is False and canary['transport']['command']=='node' and canary['transport']['args']==['--version']
assert not (pathlib.Path(s['home'])/'plugins/cache/agdf/agdf'/candidate['version']).exists()
before=json.loads((out/'production-before.json').read_text());after={p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest() if pathlib.Path(p).exists() else None for p in s['production']}
(out/'production-after.json').write_text(json.dumps(after,indent=2)+'\n');assert before==after,'production canary changed'
result={'schema_version':1,'authorizes':False,'evidence_class':'actual_codex_cli_and_stdio_app_server_isolated_profile','cli_version':(out/'cli-version.stdout').read_text().strip(),'phases':['old','updated','disabled','reenabled','removed'],'passed':True,'production_canaries_unchanged':True,'foreign_disabled_server_preserved':True,'desktop_native_qualified':False,'update_route':'native local marketplace remove/add then plugin add; no synthetic Git upgrade','candidate':candidate['version'],'source_digest':candidate['sourceDigest']}
(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result),flush=True)
