import { execFileSync } from "node:child_process";
const readOnlyOptions = ['--no-optional-locks', '-c', 'core.fsmonitor=false'];

export function gitPathList(targetDir, args, exec = execFileSync) {
  try {
    if (![JSON.stringify(['diff', 'HEAD', '--name-only']), JSON.stringify(['ls-files', '--others', '--exclude-standard'])].includes(JSON.stringify(args))) return null;
    const fixed = args[0] === 'diff' ? ['diff', '--no-ext-diff', '--no-textconv', ...args.slice(1)] : args;
    const bytes = exec("git", [...readOnlyOptions, ...fixed, '-z'], { cwd: targetDir, encoding: 'buffer', stdio: ["ignore", "pipe", "ignore"], timeout: 3000, maxBuffer: 2 * 1024 * 1024 });
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes).split('\0').filter(item => item.length > 0);
  } catch {
    return null;
  }
}

export function gitValue(targetDir, args, exec = execFileSync) {
  try {
    if (![JSON.stringify(['rev-parse', 'HEAD']), JSON.stringify(['rev-parse', '--show-toplevel'])].includes(JSON.stringify(args))) return null;
    return exec("git", [...readOnlyOptions, ...args], { cwd: targetDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 3000, maxBuffer: 2 * 1024 * 1024 }).trim();
  } catch {
    return null;
  }
}

export const cliGitObservation = Object.freeze({ gitPathList, gitValue });
