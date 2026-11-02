import * as native from 'node:fs';
import { AsyncLocalStorage } from 'node:async_hooks';

// Only read owners import this seam. No global fs patch and no writer API.
const context = new AsyncLocalStorage();
const memo = new WeakMap();
export function memoizeControlRead(key, work) {
  const view = context.getStore()?.view;
  if (!view) return work();
  let cache = memo.get(view);
  if (!cache) { cache = new Map(); memo.set(view, cache); }
  if (!cache.has(key)) {
    const result = work();
    if (context.getStore()?.denied) throw Object.assign(Error('resource_denied'), { code: 'resource_denied' });
    cache.set(key, result);
  }
  return cache.get(key);
}
export function withControlReadView(view, work) {
  const scope = { view, denied: false };
  const check = value => {
    if (scope.denied) throw Object.assign(Error('resource_denied'), { code: 'resource_denied' });
    return value;
  };
  return context.run(scope, () => {
    const result = work();
    return result instanceof Promise ? result.then(check) : check(result);
  });
}
const read = name => (...args) => {
  const scope = context.getStore();
  if (!scope) return native[name](...args);
  try { return scope.view[name](...args); }
  catch (error) { if (error.code === 'resource_denied') scope.denied = true; throw error; }
};
export const existsSync = read('existsSync');
export const readFileSync = read('readFileSync');
export const readdirSync = read('readdirSync');
export const statSync = read('statSync');
export const lstatSync = read('lstatSync');
export const realpathSync = read('realpathSync');
