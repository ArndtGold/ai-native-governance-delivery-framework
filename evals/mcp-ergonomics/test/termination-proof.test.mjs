import test from 'node:test';
import assert from 'node:assert/strict';
import { pureInspectWrapper } from '../lib/native-run.js';
const proof={literalTermination:true};
const audit=source=>pureInspectWrapper(source,new Set(),['agdf_inspect'],proof);
test('renderer observer proves only literal unshadowed thrown errors and zero-argument isolate exit',()=>{
  const code='const r=await tools.mcp__agdf__agdf_inspect({operation:"gate-check"});if(!r.structuredContent)throw new Error("Missing report");text(r);exit();';
  assert.equal(audit(code),true);
  assert.equal(pureInspectWrapper(code),false,'Historical wrapper profile is unchanged.');
  for(const source of ['throw new Error("Binding changed");','if(true){exit();}'])assert.equal(audit(source),true,source);
  for(const source of [
    'new Error("not thrown");','throw Error("function call");','throw new Error(1);',
    'throw new Error("computed"+" message");','throw new Error({toString(){return "x"}});',
    'const Error=()=>({});throw new Error("shadowed");',
    'throw new Error(await tools.exec_command({cmd:"pwd"}));',
    'throw new globalThis.Error("foreign");','const E=Error;throw new E("extracted");',
    'Error.prepareStackTrace=()=>"x";throw new Error("modified");',
    'throw new Error("x",{cause:await tools.mcp__agdf__agdf_approve({})});',
    'const e=exit;e();','exit(1);','exit.call(null);','const exit=()=>{};exit();',
    'text(exit());','throw new Error("x");process.exit(0);',
    'exit();await tools.mcp__agdf__agdf_approve({});',
    'throw new Error("x");await import("node:fs");',
    'const match=ALL_TOOLS.find(t=>t.name.includes("agdf")&&t.name.endsWith("agdf_inspect"));text(await tools[match.name]({}));',
  ])assert.equal(audit(source),false,source);
  for(const earlier of [new Set(['Error']),new Set(['exit'])])
    assert.equal(pureInspectWrapper(code,earlier,['agdf_inspect'],proof),false,'Earlier shadowing remains forbidden.');
});
