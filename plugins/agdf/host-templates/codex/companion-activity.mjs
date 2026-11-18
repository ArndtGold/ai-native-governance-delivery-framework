import { readFileSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { observeCodexActivity } from '../runtime/create-agdf/runtime/core/lib/companion/codex-activity.js';

try {
  const config = JSON.parse(readFileSync(new URL('../mcp.json', import.meta.url), 'utf8'));
  const roots = ['agdf', 'agdf-cockpit'].map(name => {
    const args = config.mcpServers?.[name]?.args;
    const index = Array.isArray(args) ? args.indexOf('--data') : -1;
    return index < 0 ? null : args[index + 1];
  });
  if (typeof roots[0] === 'string' && isAbsolute(roots[0]) && roots[0] === roots[1]) {
    const chunks = [];
    let bytes = 0;
    const deadline = setTimeout(() => process.stdin.destroy(), 650);
    try {
      for await (const chunk of process.stdin) {
        bytes += chunk.length;
        if (bytes > 512 * 1024) break;
        chunks.push(chunk);
      }
      if (bytes <= 512 * 1024) observeCodexActivity(roots[0], JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } finally { clearTimeout(deadline); }
  }
} catch {
  // Display evidence is optional. Codex retains its normal turn behavior.
}
process.stdout.write('{}\n');
