import { watch, lstatSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';

// Filesystem events are hints only. The captured reader revalidates committed bytes
// before notifying its view. Parent watches also survive atomic file replacement.
export function createControlChangeObserver(root, notify, { watchFactory = watch, delay = 150 } = {}) {
  const base = join(root, '.agdf'), control = join(base, 'control');
  let dependencies = [], watchers = [], timer, closed = false;
  const hint = path => {
    if (closed || path && !dependencies.some(dep => dep.path === path || dep.path.startsWith(path + sep)
      || dep.directory && dirname(path) === dep.path)) return;
    clearTimeout(timer); timer = setTimeout(() => { if (!closed) notify(); }, delay); timer.unref?.();
  };
  // An unavailable watcher does not affect reading; freshness polling is retained.
  function start() {
    try {
      if (!lstatSync(base).isSymbolicLink() && !lstatSync(control).isSymbolicLink()) {
        for (const [directory, recursive] of [[base, false], [control, false], [control, true]]) {
          const watcher = watchFactory(directory, { persistent: false, recursive }, (_event, name) => {
            const path = name ? resolve(directory, String(name)) : null;
            if (path && (relative(base, path).startsWith('..') || path.includes('\0'))) return;
            hint(path);
          });
          watcher.on('error', () => hint(null)); watchers.push(watcher);
        }
      }
    } catch { for (const watcher of watchers) watcher.close(); watchers = []; }
  }
  return {
    bind(value) { for (const watcher of watchers) watcher.close(); watchers = []; dependencies = value; if (!closed) start(); },
    close() { closed = true; clearTimeout(timer); for (const watcher of watchers) watcher.close(); watchers = []; dependencies = []; },
  };
}
