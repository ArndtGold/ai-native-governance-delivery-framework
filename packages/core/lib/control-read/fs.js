import * as native from 'node:fs';
import { AsyncLocalStorage } from 'node:async_hooks';

// Only read owners import this seam. No global fs patch and no writer API.
const context = new AsyncLocalStorage();
const memo = new WeakMap();
// Only a retained observation owner may inherit memoized facts after revalidation.
export function inheritControlReadMemo(from, to) {
  let cache = memo.get(from);
  if (!cache) { cache = new Map(); memo.set(from, cache); }
  memo.set(to, cache);
}
export const hasControlReadView = () => Boolean(context.getStore()?.view);
// CLI readers retain their existing file scope; memoized work never survives a call.
// MCP readers install a contained captured view before entering the same evaluators.
export function withControlReadMemo(work) {
  if (hasControlReadView()) return work();
  const view = { ...native, lstatKindSync(path) {
    const s = native.lstatSync(path);
    return s.isSymbolicLink() ? 'symlink' : s.isDirectory() ? 'directory' : s.isFile() ? 'file' : 'other';
  } };
  return withControlReadView(view, work);
}
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
// A mutation owner must not inherit a pre-write captured observation.
export function withLiveControlReads(work) { return context.run(undefined, work); }

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
// Containment/type checks do not consume directory size or timestamps. Keep
// their identity dependency separate from callers that actually inspect stats.
export const lstatKindSync = path => {
  const scope = context.getStore();
  if (scope) {
    try { return scope.view.lstatKindSync(path); }
    catch (error) { if (error.code === 'resource_denied') scope.denied = true; throw error; }
  }
  const stat = native.lstatSync(path);
  return stat.isSymbolicLink() ? 'symlink' : stat.isDirectory() ? 'directory' : stat.isFile() ? 'file' : 'other';
};
export const realpathSync = read('realpathSync');
