// Diagnostic only: use the same installed launcher owner and preserve its
// preparation/claim/guard path; retain the otherwise hidden facade exception.
import {pathToFileURL}from'node:url';import{writeFileSync}from'node:fs';
const pluginRoot='/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const {launchPluginMcpServer}=await import(pathToFileURL(pluginRoot+'/runtime/create-agdf/lib/mcp-lifecycle/plugin-runtime.js'));
await launchPluginMcpServer({pluginRoot,startFacade:async({runtime,surface,cockpitDir,pluginRoot,env})=>{
try{env.AGDF_DISPATCH_PLUGIN_ROOT=pluginRoot;const {runMcpServer}=await import(pathToFileURL(runtime.packageRoot+'/src/main.js'));return await runMcpServer({surface,cockpitDir,ownedPublication:runtime,ownedPublisher:(await import(pathToFileURL(pluginRoot+'/runtime/create-agdf/lib/mcp-lifecycle/package.js'))).createMcpGenerationPublisher(runtime)});}
catch(error){writeFileSync(new URL('./facade-error.json',import.meta.url),JSON.stringify({name:error.name,message:error.message,stack:error.stack},null,2)+'\n');throw error;}
}});
