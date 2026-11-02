import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FilterService} from './filter-service.mjs';
test('save and restore values independently of later mutation',()=>{const s=new FilterService(),v={status:'open',tags:['work']};s.save('a','daily',v);v.tags.push('other');assert.deepEqual(s.restore('a','daily'),{status:'open',tags:['work']});});
test('personal ownership',()=>{const s=new FilterService();s.save('a','daily',{});assert.throws(()=>s.restore('b','daily'),RangeError);});
test('empty/default values',()=>{const s=new FilterService();s.save('a','empty',{});assert.deepEqual(s.restore('a','empty'),{});});
test('invalid input',()=>{const s=new FilterService();assert.throws(()=>s.save('','daily',{}),TypeError);});
