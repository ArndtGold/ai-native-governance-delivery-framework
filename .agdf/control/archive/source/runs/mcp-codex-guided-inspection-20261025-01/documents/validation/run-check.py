import sys,subprocess,time,json,pathlib,os
label,cwd,*argv=sys.argv[1:]
base=pathlib.Path(__file__).resolve().parent.parent/'evidence'/'checks';base.mkdir(parents=True,exist_ok=True)
log=base/(label+'.log');result=base/(label+'.json')
assert not log.exists() and not result.exists(), 'retain prior checks; use a new label'
started=time.time()
with log.open('wb') as out:
 p=subprocess.run(argv,cwd=cwd,stdout=out,stderr=subprocess.STDOUT)
result.write_text(json.dumps(dict(label=label,cwd=cwd,argv=argv,exit_code=p.returncode,elapsed_seconds=time.time()-started,model_invocations=0),indent=2)+'\n')
print(result.read_text());sys.exit(p.returncode)
