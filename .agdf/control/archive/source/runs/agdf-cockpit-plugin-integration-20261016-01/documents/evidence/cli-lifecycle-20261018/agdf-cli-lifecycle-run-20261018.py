import pathlib,subprocess,json,os,hashlib,sys,time
state=json.loads(pathlib.Path(sys.argv[1]).read_text()); root=pathlib.Path(state['root']);out=pathlib.Path(state['evidence'])
env=dict(os.environ);env.update({'CODEX_HOME':state['home'],'AGDF_DATA_DIR':str(root/'isolated-data')})
cli='/Users/arndtgold/.npm-global/bin/codex';ledger=[]
def command(label,args,expect=0):
    started=time.monotonic();r=subprocess.run([cli,*args],cwd=state['project'],env=env,text=True,capture_output=True,timeout=45)
    (out/(label+'.stdout')).write_text(r.stdout);(out/(label+'.stderr')).write_text(r.stderr)
    row={'label':label,'argv':[cli,*args],'cwd':state['project'],'child_environment':{'CODEX_HOME':state['home'],'AGDF_DATA_DIR':env['AGDF_DATA_DIR']},'exit_code':r.returncode,'seconds':round(time.monotonic()-started,3)};ledger.append(row);(out/'commands.json').write_text(json.dumps(ledger,indent=2)+'\n');print(json.dumps(row),flush=True)
    if r.returncode!=expect:raise RuntimeError(label+': '+r.stderr[-1500:])
    return r.stdout
old=next(p for p in state['packages'] if p['label']=='old')
command('cli-version',['--version'])
command('add-old-marketplace',['plugin','marketplace','add',old['marketplaceRoot'],'--json'])
command('install-old',['plugin','add','agdf@agdf','--json'])
command('old-mcp-list',['mcp','list','--json'])
command('generate-schema',['app-server','generate-json-schema','--experimental','--out',str(root/'schema')])
print(json.dumps({'status':'old_installed','state':sys.argv[1]}))
