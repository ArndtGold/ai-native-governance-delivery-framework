import os,sys,json,subprocess,pathlib,hashlib
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
