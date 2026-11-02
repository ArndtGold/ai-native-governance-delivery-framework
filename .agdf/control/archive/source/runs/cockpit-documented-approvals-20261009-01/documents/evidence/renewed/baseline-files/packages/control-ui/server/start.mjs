import { startControlServer } from './service.mjs';
const args = process.argv.slice(2), input = {};
try {
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i], value = args[i + 1];
    if (!['--dir', '--port'].includes(flag) || !value || Object.hasOwn(input, flag.slice(2))) throw Error('invalid_arguments');
    input[flag.slice(2)] = flag === '--port' && /^\d+$/.test(value) ? Number(value) : value;
  }
  const service = await startControlServer(input);
  console.log(`AGDF Control · Nur Lesen\nRepository: ${service.root}\nÖffnen: ${service.startupURL}\nBeenden: Ctrl+C`);
  let stopping = false;
  const stop = async () => { if (stopping) return; stopping = true; await service.close(); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
} catch (e) { console.error(`Start fehlgeschlagen: ${['explicit_target_required', 'target_invalid', 'port_invalid', 'invalid_arguments', 'EADDRINUSE'].includes(e.message) ? e.message : e.code === 'EADDRINUSE' ? 'Port belegt' : 'Repository, Voraussetzungen und Build prüfen'}`); process.exitCode = 1; }
