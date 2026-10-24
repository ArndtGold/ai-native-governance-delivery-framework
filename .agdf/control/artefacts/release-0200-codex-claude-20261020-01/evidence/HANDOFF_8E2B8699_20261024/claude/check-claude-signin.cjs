// Refuses a native run when the copied Claude sign-in would need a token refresh during the run. The first case
// would rotate the refresh token inside its isolated copy, and every later case would then fail to authenticate.
// Prints only the remaining minutes, never a credential value.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { homedir } = require('node:os');
if (process.env.CLAUDE_CODE_OAUTH_TOKEN) { console.log('sign-in: CLAUDE_CODE_OAUTH_TOKEN'); process.exit(0); }
let minutes = -1;
try {
  const source = join(process.env.CLAUDE_CONFIG_DIR_SOURCE || join(homedir(), '.claude'), '.credentials.json');
  minutes = Math.floor((JSON.parse(readFileSync(source, 'utf8')).claudeAiOauth.expiresAt - Date.now()) / 60000);
} catch {}
console.log(`sign-in minutes left: ${minutes}`);
process.exit(minutes >= 60 ? 0 : 3);
