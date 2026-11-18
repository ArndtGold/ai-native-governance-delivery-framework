import { lstatSync, realpathSync, watch } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { createControlChangeObserver } from '#agdf-core/control-read/control-changes.js';
import { JOURNAL_DIRECTORY, JOURNAL_FILE, JOURNAL_ROTATED_FILE } from '#agdf-core/companion/journal.js';

const journalFiles = new Set([JOURNAL_FILE, JOURNAL_ROTATED_FILE]);

// The journal is only a notice wake-up. Watch its own directory, or the nearest
// existing plugin-data ancestor until the journal directory is created.
function watchJournal(root, notify, unavailable) {
  const target = join(root, JOURNAL_DIRECTORY);
  let watcher;
  const bind = () => {
    watcher?.close();
    try {
      let directory = target;
      while (true) {
        try {
          if (!lstatSync(directory).isDirectory()) throw Error('invalid_journal_directory');
          break;
        } catch (error) {
          if (error.code !== 'ENOENT' || directory === dirname(dirname(dirname(root)))) throw error;
          directory = dirname(directory);
        }
      }
      const child = relative(directory, target).split(sep)[0];
      const active = watch(realpathSync(directory), (_event, name) => {
        if (watcher !== active) return;
        const file = name == null ? null : String(name);
        if (child && (file === null || file === child)) {
          bind();
          notify();
        } else if (!child && (file === null || journalFiles.has(file))) notify();
        else if (!child && file === JOURNAL_DIRECTORY) { bind(); notify(); }
      });
      watcher = active;
      active.on('error', () => {
        if (watcher !== active) return;
        active.close();
        unavailable();
      });
    } catch { unavailable(); }
  };
  bind();
  return () => watcher?.close();
}

// Internal streaming entry of the owned Claude validator. Only bounded hints
// cross stdout. The host still reads current status through the normal run view.
export async function runCompanionObserver(args, io = console, signal) {
  const [project, journal] = args;
  const root = project && isAbsolute(project) && !project.includes('\0') ? resolve(project) : null;
  const data = journal && isAbsolute(journal) && !journal.includes('\0') ? resolve(journal) : null;
  if (!root || args.length > 2 || journal !== undefined && (!data || basename(data) !== 'agdf-agdf'
      || basename(dirname(data)) !== 'data' || basename(dirname(dirname(data))) !== 'plugins')) return 2;
  if (signal?.aborted) return 0;
  let canonical;
  try { canonical = realpathSync(root); } catch { return 2; }

  return await new Promise(resolveExit => {
    let stopJournal;
    const stop = code => {
      observation.close();
      stopJournal?.();
      signal?.removeEventListener('abort', abort);
      process.removeListener('SIGINT', abort);
      process.removeListener('SIGTERM', abort);
      resolveExit(code);
    };
    const abort = () => stop(0);
    const observation = createControlChangeObserver(canonical, () => io.log('run'), {
      persistent: true,
      unavailable: error => {
        const code = typeof error?.code === 'string' && /^[A-Z_0-9]+$/.test(error.code) ? error.code : 'unavailable';
        io.error(`AGDF observation lost: ${code}`);
        stop(2);
      },
    });
    const control = join(canonical, '.agdf', 'control');
    if (!observation.bind([{ path: join(control, 'runs'), subtree: true },
      { path: join(control, 'config.json') }, { path: join(control, 'VERSION') }])) {
      stop(2);
      return;
    }
    signal?.addEventListener('abort', abort, { once: true });
    process.once('SIGINT', abort);
    process.once('SIGTERM', abort);
    if (data) stopJournal = watchJournal(data, () => io.log('journal'), () => io.log('journal-unavailable'));
    io.log('ready');
  });
}
