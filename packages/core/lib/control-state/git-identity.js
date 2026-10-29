import { readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';

// Pure read of the local Git identity for a cooperative confirmation statement. No child
// process, no include or includeIf directive; an identity found nowhere is recorded unknown.
// Precedence as in Git: repository config, then ~/.gitconfig, then the XDG config file.
const CONFIG_LIMIT = 1048576;
function readText(path) {
  try { const stat = statSync(path); return stat.isFile() && stat.size <= CONFIG_LIMIT ? readFileSync(path, 'utf8') : null; } catch { return null; }
}
const isDirectory = path => { try { return statSync(path).isDirectory(); } catch { return false; } };
const isFile = path => { try { return statSync(path).isFile(); } catch { return false; } };

// The repository config of the nearest .git directory, or of a .git file's gitdir and its commondir.
function repositoryConfig(root) {
  for (let directory = resolve(root); ; directory = dirname(directory)) {
    const dotGit = join(directory, '.git');
    let gitDir = isDirectory(dotGit) ? dotGit : null;
    if (!gitDir && isFile(dotGit)) {
      const target = readText(dotGit)?.match(/^gitdir:[ \t]*(.+?)[ \t]*\r?$/mu)?.[1];
      if (target) gitDir = resolve(directory, target);
    }
    if (gitDir) {
      const common = readText(join(gitDir, 'commondir'))?.trim();
      return join(common ? resolve(gitDir, common) : gitDir, 'config');
    }
    if (dirname(directory) === directory) return null;
  }
}

export function gitConfigPaths(root, { env = process.env, home = homedir() } = {}) {
  const xdg = env.XDG_CONFIG_HOME && isAbsolute(env.XDG_CONFIG_HOME) ? env.XDG_CONFIG_HOME : home ? join(home, '.config') : null;
  return [repositoryConfig(root), home ? join(home, '.gitconfig') : null, xdg ? join(xdg, 'git', 'config') : null].filter(Boolean);
}

// Value grammar: leading blanks skipped, double quotes group, \\ \" \n \t \b escapes,
// # or ; outside quotes start a comment, trailing blanks outside quotes are dropped.
function configValue(raw) {
  let value = '', quoted = false, pending = '';
  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (char === '\\') {
      const next = raw[++i];
      value += pending + ({ n: '\n', t: '\t', b: '\b', '"': '"', '\\': '\\' }[next] ?? ''); pending = ''; continue;
    }
    if (char === '"') { value += pending; pending = ''; quoted = !quoted; continue; }
    if (!quoted && (char === '#' || char === ';')) break;
    if (!quoted && (char === ' ' || char === '\t')) { if (value) pending += char; continue; }
    value += pending + char; pending = '';
  }
  return value;
}

// Last assignment within one file wins, as in Git; sections other than plain [user] are ignored.
export function parseGitIdentity(text) {
  const found = {};
  let section = null;
  for (const rawLine of String(text ?? '').replace(/^﻿/u, '').split(/\r?\n/u)) {
    let line = rawLine.trim();
    const header = line.match(/^\[([^\]"]+?)(?:\s+"(?:[^"\\]|\\.)*")?\]/u);
    if (header) {
      section = /\s+"/u.test(line.slice(0, header[0].length)) ? null : header[1].trim().toLowerCase();
      line = line.slice(header[0].length).trim();
    }
    if (section !== 'user' || !line || line.startsWith('#') || line.startsWith(';')) continue;
    const pair = line.match(/^([A-Za-z][A-Za-z0-9-]*)\s*=(.*)$/u);
    const key = pair?.[1].toLowerCase();
    if (key === 'name' || key === 'email') found[key] = configValue(pair[2]);
  }
  return found;
}

const clean = value => {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f]+/gu, ' ').replaceAll('|', '/').replace(/\s+/gu, ' ').trim().slice(0, 256).trim();
  return text || null;
};
export function readGitIdentity(root, options = {}) {
  const identity = {};
  for (const path of gitConfigPaths(root, options)) {
    const values = parseGitIdentity(readText(path));
    for (const key of ['name', 'email']) if (!Object.hasOwn(identity, key) && Object.hasOwn(values, key)) identity[key] = clean(values[key]);
  }
  return identity.name || identity.email
    ? { name: identity.name ?? null, email: identity.email ?? null, statement: 'cooperative' } : { statement: 'unknown' };
}
