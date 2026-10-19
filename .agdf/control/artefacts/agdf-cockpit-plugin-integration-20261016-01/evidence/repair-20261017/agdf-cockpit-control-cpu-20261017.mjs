import {Session} from 'node:inspector';
import {writeFileSync} from 'node:fs';
import {createOwnedRuntimeFixture} from '/private/tmp/agdf-cockpit-integration-work/packages/mcp-server/test/owned-runtime.js';
import {evaluateGateCheck} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/core/lib/control-evaluation/gate-check.js';
const fixture=createOwnedRuntimeFixture(),session=new Session();session.connect();
const post=(method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(error,result)=>error?reject(error):resolve(result)));
try{await post('Profiler.enable');await post('Profiler.start');const durations=[];for(let i=0;i<5;i++){const start=performance.now();evaluateGateCheck(fixture.governanceTarget,{runId:'agdf-mcp-dispatch-server',presentationLanguage:'de'});durations.push(performance.now()-start);}const {profile}=await post('Profiler.stop');writeFileSync('/private/tmp/agdf-cockpit-control-cpu-20261017.json',JSON.stringify(profile));const counts=new Map();for(const n of profile.nodes){if(n.hitCount){const key=n.callFrame.functionName+' '+n.callFrame.url;counts.set(key,(counts.get(key)??0)+n.hitCount);}}console.log(JSON.stringify({durations_ms:durations,hotspots:[...counts].sort((a,b)=>b[1]-a[1]).slice(0,25)},null,2));}finally{session.disconnect();fixture.dispose();}
