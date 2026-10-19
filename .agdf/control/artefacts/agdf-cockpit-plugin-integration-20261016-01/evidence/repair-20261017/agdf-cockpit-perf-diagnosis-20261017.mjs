import { createOwnedRuntimeFixture } from '/private/tmp/agdf-cockpit-integration-work/packages/mcp-server/test/owned-runtime.js';
import { withStdioClient } from '/private/tmp/agdf-cockpit-integration-work/packages/mcp-server/test/helpers.js';
const fixture=createOwnedRuntimeFixture();
try { await withStdioClient(fixture,async client=>{for(let i=0;i<5;i++){const t=performance.now();const r=await client.callTool({name:'agdf_dispatch',arguments:{skill_id:'gate-check',presentation_language:'de',working_directory:fixture.governanceTarget,primary_target:fixture.governanceTarget,target_source:'current_repository',run_id:'agdf-mcp-dispatch-server'}});console.log(JSON.stringify({sample:i,wall_ms:performance.now()-t,timing:r.structuredContent?.timing,outcome:r.structuredContent?.outcome}));}}); }
finally {fixture.dispose();}
