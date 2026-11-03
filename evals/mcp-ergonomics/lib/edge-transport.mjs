// Test-only faults after a real canonical response. Never loaded by the product.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const config=JSON.parse(readFileSync(process.argv[2],'utf8'));
const {runMcpServer}=await import(pathToFileURL(config.serverMain).href);
const original=process.stdout.write.bind(process.stdout), requests=new Map();
let incoming='', outgoing='', injected=false;
process.stdin.prependListener('data',chunk=>{
  incoming+=chunk;
  while(incoming.includes('\n')) {
    const index=incoming.indexOf('\n'),line=incoming.slice(0,index);incoming=incoming.slice(index+1);
    try {const request=JSON.parse(line);if(request.method==='tools/call')requests.set(request.id,request);}catch{}
  }
});
process.stdout.write=function(chunk,...args) {
  outgoing+=String(chunk);
  while(outgoing.includes('\n')) {
    const index=outgoing.indexOf('\n'),line=outgoing.slice(0,index);outgoing=outgoing.slice(index+1);
    let packet;try{packet=JSON.parse(line)}catch{}
    const request=requests.get(packet?.id),input=request?.params?.arguments,result=packet?.result?.structuredContent;
    if(!injected&&config.fault==='race'&&input?.operation==='gate-check'&&input.run_id===config.runId&&result?.outcome==='inspect_result') {
      const args=[config.cli,'run-step','--dir',config.root,'--json','--run',config.runId,'--revision',config.revision,'--step','evidence','--evidence',config.evidencePath,'--reason','Independent synthetic concurrent update','--covers','AC-001'];
      const changed=spawnSync(process.execPath,args,{encoding:'utf8',timeout:15000});
      let value;try{value=JSON.parse(changed.stdout)}catch{}
      if(changed.status!==0||value?.outcome!=='accepted')throw Error('EDGE_REVISION_INJECTION_FAILED:'+changed.stdout+changed.stderr);
      writeFileSync(config.journal,JSON.stringify({kind:'revision_change',operation_id:value.operation_id,request,result,value}));injected=true;
    }
    if(!injected&&config.fault==='lost_ack'&&input?.command?.kind==='approval.record'&&result?.outcome==='accepted') {
      // A real accepted result and its exact original request remain private to
      // the oracle. The client receives no acknowledgement and must resolve it.
      writeFileSync(config.journal,JSON.stringify({kind:'lost_ack',request,result}));injected=true;requests.delete(packet.id);continue;
    }
    original(line+'\n');if(packet?.id!==undefined)requests.delete(packet.id);
  }
  const callback=args.find(a=>typeof a==='function');callback?.();return true;
};
await runMcpServer({surface:'codex'});
