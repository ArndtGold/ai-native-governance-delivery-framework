"""Agent-side bounded evidence collection; never qualifies a transition or changes a host."""
import argparse, base64, collections, datetime, hashlib, json, pathlib, re
p=argparse.ArgumentParser();p.add_argument('--trace-id',required=True);p.add_argument('--app-session');p.add_argument('--start-utc',required=True);p.add_argument('--out',required=True);a=p.parse_args()
if not re.fullmatch(r'[0-9a-f-]{36}',a.trace_id):raise SystemExit('Invalid observed trace id')
if a.app_session and not re.fullmatch(r'session:[0-9a-f-]{36}',a.app_session):raise SystemExit('Invalid observed app session')
start=datetime.datetime.fromisoformat(a.start_utc.replace('Z','+00:00'))
if start.tzinfo is None:raise SystemExit('UTC offset required')
root=pathlib.Path.home()/'Library/Logs/com.openai.codex'/start.strftime('%Y/%m/%d')
rows=collections.deque();total=0;dropped=0;matches=0;paths=[];limit=2*1024*1024
for f in sorted(root.glob('*.log')):
 for number,line in enumerate(f.open('rb'),1):
  own_trace=a.trace_id.encode() in line and (b'AGDF_SDK_TRACE' in line or b'agdf.sdk.trace' in line)
  lifecycle=bool(a.app_session and a.app_session.encode() in line and any(key in line for key in [b'session_created',b'registration_removed',b'initializeMcpApp',b'display_mode_changed']))
  if not (own_trace or lifecycle):continue
  try:stamp=datetime.datetime.fromisoformat(line[:24].decode().replace('Z','+00:00'))
  except (ValueError,UnicodeDecodeError):continue
  if stamp<start:continue
  matches+=1
  row={'source_path':str(f),'source_line':number,'match':'sdk_trace' if own_trace else 'app_lifecycle','raw_line_sha256':hashlib.sha256(line).hexdigest(),'raw_line_base64':base64.b64encode(line).decode()}
  size=len(line)
  if size>limit:dropped+=1;continue
  rows.append((row,size));total+=size
  while total>limit:
   old,size=rows.popleft();total-=size;dropped+=1
out=pathlib.Path(a.out)
if out.exists():raise SystemExit('Refuse overwrite of collected evidence')
value={'schema_version':1,'kind':'native_sdk_host_log_subset','authorizes':False,'qualified':False,'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'trace_id':a.trace_id,'app_session':a.app_session,'start_utc':a.start_utc,'policy':'exact observed ids; matching SDK or lifecycle lines; bounded tail in lexicographic file order and ascending line order; not a global chronological sort','total_matched_lines':matches,'retained_raw_bytes':total,'dropped_matching_lines':dropped,'records':[row for row,size in rows]}
out.write_text(json.dumps(value,indent=2)+'\n')
print(json.dumps({'path':str(out),'matched':matches,'retained':len(rows),'dropped':dropped,'qualified':False}))
