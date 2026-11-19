import { watch, lstatSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';

// Filesystem events are hints only. The captured reader revalidates committed bytes
// before notifying its view. Parent watches also survive atomic file replacement.
export function createControlChangeObserver(root, notify, { watchFactory = watch, delay = 150, persistent = false, unavailable = () => {} } = {}) {
  const base = join(root, '.agdf'), control = join(base, 'control');
  let watchers = [], timer, closed = false, generation = 0;
  function retire() {
    ++generation;
    clearTimeout(timer);
    for (const watcher of watchers) watcher.close();
    watchers = [];
  }
  return {
    bind(dependencies) {
      retire();
      if (closed) return false;
      const binding = generation;
      const live = () => !closed && binding === generation;
      const hint = path => {
        if (!live() || path && !dependencies.some(dep => dep.path === path || dep.path.startsWith(path + sep)
          || dep.directory && dirname(path) === dep.path || dep.subtree && path.startsWith(dep.path + sep))) return;
        clearTimeout(timer);
        timer = setTimeout(() => { if (live()) notify(); }, delay);
        timer.unref?.();
      };
      try {
        if (!lstatSync(base).isDirectory() || !lstatSync(control).isDirectory()) return false;
        for (const [directory, recursive] of [[base, false], [control, false], [control, true]]) {
          const watcher = watchFactory(directory, { persistent, recursive }, (_event, name) => {
            const path = name ? resolve(directory, String(name)) : null;
            if (path && (relative(base, path).startsWith('..') || path.includes('\0'))) return;
            hint(path);
          });
          watchers.push(watcher);
          watcher.on('error', error => {
            if (!live()) return;
            retire();
            unavailable(error);
          });
        }
        return true;
      } catch {
        retire();
        return false;
      }
    },
    close() { closed = true; retire(); },
  };
}
