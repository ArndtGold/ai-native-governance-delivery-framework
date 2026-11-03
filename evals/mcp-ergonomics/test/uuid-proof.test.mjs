import test from 'node:test';
import assert from 'node:assert/strict';
import { pureInspectWrapper } from '../lib/native-run.js';
const code=(random='Math.random() * 16 | 0')=>`const operation_id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
  const r = ${random}; return (c === "x" ? r : (r & 3 | 8)).toString(16);
}); text(await tools.mcp__agdf__agdf_approve({operation_id}));`;
test('numeric UUID calculations are proven without general Math access or write authority',()=>{
  for(const expression of ['Math.random() * 16 | 0','Math.floor(Math.random() * 16)']) {
    assert.equal(pureInspectWrapper(code(expression),new Set(),['agdf_approve']),true);
    assert.equal(pureInspectWrapper(code(expression)),false,'UUID proof never grants a write tool');
  }
  for(const source of ['text(Math.random());','text(Math.floor(1));','text(Math.random().toString(16));',
    'const hex="0123456789abcdef";const randHex=n=>Array.from({length:n},()=>hex[Math.floor(Math.random()*16)]).join("");const operation_id=`${randHex(8)}-${randHex(4)}-4${randHex(3)}-${["8","9","a","b"][Math.floor(Math.random()*4)]}${randHex(3)}-${randHex(12)}`;text(await tools.mcp__agdf__agdf_approve({operation_id}));'])
    assert.equal(pureInspectWrapper(source,new Set(),['agdf_approve']),true,source);
  for(const source of [
    'text(crypto.randomUUID());','text(Math.sin(1));','text(Math.random);','text(Math.floor);',
    'text(Math.floor({valueOf:()=>1}));','text(Math.floor("1"));','text(Math.random(1));',
    'const r={toString:()=>"a"};text(r.toString(16));','const f=Math.random;text(f());',
    'const Math={random:()=>0};'+code(),
    code('Math.random(1) * 16 | 0'),code('other.random() * 16 | 0'),
    code().replace('toString(16)','toString(36)'),code().replace('r & 3','r & 7'),
    code().replace('const r =','let r ='),code().replace('/[xy]/g','/[xyz]/g'),
    code().replace('return (','process.exit(1); return ('),
    code().replace('Math.random()','Math["random"]()'),
    code()+'text(Math.sin(1));',code()+'text(operation_id.constructor);',
    code()+'text(await tools.exec_command({cmd:"pwd"}));',
  ])assert.equal(pureInspectWrapper(source,new Set(),['agdf_approve']),false,source);
});
