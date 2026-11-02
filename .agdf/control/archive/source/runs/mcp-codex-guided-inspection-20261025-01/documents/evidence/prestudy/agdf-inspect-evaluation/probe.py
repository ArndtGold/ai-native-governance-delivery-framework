import os,json,subprocess,threading,http.server,pathlib,queue,time,hashlib,sys
BASE=pathlib.Path('/private/tmp/agdf-inspect-evaluation')
BIN='/Users/arndtgold/.npm-global/bin/codex'
requests=[]
class Stub(http.server.BaseHTTPRequestHandler):
 def log_message(self,*a):pass
 def do_POST(self):
  body=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
  requests.append({'path':self.path,'body':body})
  self.send_response(200);self.send_header('Content-Type','text/event-stream');self.end_headers()
  item={'id':'msg_probe','type':'message','role':'assistant','status':'completed','content':[{'type':'output_text','text':'Offline schema capture complete.','annotations':[]}]}
  events=[{'type':'response.created','response':{'id':'resp_probe','object':'response','status':'in_progress','output':[]}}, {'type':'response.output_item.added','output_index':0,'item':{**item,'status':'in_progress'}},{'type':'response.output_item.done','output_index':0,'item':item},{'type':'response.completed','response':{'id':'resp_probe','object':'response','status':'completed','output':[item],'usage':{'input_tokens':0,'output_tokens':0,'total_tokens':0}}}]
  for i,event in enumerate(events):
   event['sequence_number']=i
   self.wfile.write(('event: '+event['type']+'\ndata: '+json.dumps(event)+'\n\n').encode())
  self.wfile.flush()
 def do_GET(self):
  self.send_response(404);self.end_headers();self.wfile.write(b'{}')
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Stub)
threading.Thread(target=server.serve_forever,daemon=True).start()
run=BASE/(sys.argv[1] if len(sys.argv)>1 else 'baseline')
run.mkdir(exist_ok=True);home=run/'home';work=run/'work';home.mkdir(exist_ok=True);work.mkdir(exist_ok=True)
config=f'''model = "gpt-6.1-sol"
model_provider = "offline"
model_reasoning_effort = "low"
project_doc_max_bytes = 0
web_search = "disabled"
[model_providers.offline]
name = "Loopback schema capture; no model"
base_url = "http://127.0.0.1:{server.server_port}/v1"
wire_api = "responses"
requires_openai_auth = false
[features]
code_mode = true
code_mode_only = true
code_mode_host = true
shell_tool = false
plugins = false
hooks = false
memories = false
'''
(home/'config.toml').write_text(config)
policy=run/'network.sb';policy.write_text('(version 1)\n(allow default)\n(deny network-outbound)\n(allow network-outbound (remote ip "localhost:*"))\n')
env={k:v for k,v in os.environ.items() if k not in ['OPENAI_API_KEY','CODEX_API_KEY','OPENAI_BASE_URL','OPENAI_ORG_ID']}
env.update(CODEX_HOME=str(home),RUST_LOG='error')
proc=subprocess.Popen(['/usr/bin/sandbox-exec','-f',str(policy),BIN,'app-server','--stdio'],env=env,cwd=work,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=open(run/'stderr.log','w'),text=True,bufsize=1)
lines=queue.Queue();all_lines=[]
def reader():
 for line in proc.stdout:
  try:v=json.loads(line);all_lines.append(v);lines.put(v)
  except:pass
threading.Thread(target=reader,daemon=True).start()
def send(method,params,id=None):
 x={'method':method,'params':params}
 if id is not None:x['id']=id
 proc.stdin.write(json.dumps(x)+'\n');proc.stdin.flush()
def wait_for(predicate,timeout=20):
 end=time.time()+timeout
 while time.time()<end:
  try:r=lines.get(timeout=max(.1,end-time.time()))
  except queue.Empty:break
  if predicate(r):return r
 raise RuntimeError('No matching response; tail='+json.dumps(all_lines[-4:])[:1800])
try:
 send('initialize',{'clientInfo':{'name':'offline_schema_probe','version':'1'},'capabilities':{'experimentalApi':True}},1)
 r=wait_for(lambda r:r.get('id')==1);assert 'error' not in r,r
 send('initialized',{})
 definition=json.loads((BASE/(run.name+'.json')).read_text())
 tool={'type':'function','name':'inspect_probe','description':definition['description'],'inputSchema':definition['inputSchema'],'deferLoading':False}
 send('thread/start',{'cwd':str(work),'model':'gpt-6.1-sol','modelProvider':'offline','approvalPolicy':'never','sandbox':'read-only','baseInstructions':'Offline deterministic tool-schema capture. No real model or external actions.','dynamicTools':[tool]},2)
 r=wait_for(lambda r:r.get('id')==2);assert 'error' not in r,r
 thread=r['result']['thread']['id']
 send('turn/start',{'threadId':thread,'input':[{'type':'text','text':'Capture the tool interface only; do not invoke tools.','text_elements':[]}]},3)
 r=wait_for(lambda r:r.get('method')=='turn/completed',timeout=35)
 (run/'protocol.json').write_text(json.dumps(all_lines,indent=2)+'\n')
 (run/'requests.json').write_text(json.dumps(requests,indent=2)+'\n')
 print(json.dumps({'variant':run.name,'status':r.get('params',{}).get('turn',{}).get('status'),'requests':len(requests),'model_invocations':0,'account_auth':False,'external_network':'denied','api_endpoint':'loopback-only','transport':'deterministic_stub'},ensure_ascii=False))
finally:
 proc.terminate()
 try:proc.wait(timeout=5)
 except subprocess.TimeoutExpired:proc.kill();proc.wait()
 server.shutdown()
