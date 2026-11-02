@echo off
setlocal enabledelayedexpansion
rem Freezes the Claude Code CLI tuple and runs the five release cases for candidate 8e2b8699 once each.
rem Start it through explorer.exe so it runs outside the packaged Claude Desktop app.
cd /d C:\Workspace\agdf-rc-460027fa
set "MODEL=claude-sonnet-5-5"
set "TUPLE=probe-results\claude-cli-tuple.json"
set "LOG=C:\Workspace\agdf-rc-460027fa\probe-results\claude-cli-run.log"
set "DONE=C:\Workspace\agdf-rc-460027fa\probe-results\claude-cli-run.done"
if exist "%DONE%" del "%DONE%"
echo started %DATE% %TIME%> "%LOG%"
git rev-parse HEAD >> "%LOG%" 2>&1
git status --porcelain >> "%LOG%" 2>&1
where claude >> "%LOG%" 2>&1
claude --version >> "%LOG%" 2>&1
node --version >> "%LOG%" 2>&1
if exist "%TUPLE%" (
  echo tuple already present, refusing to overwrite: remove %TUPLE% only if no case ran with it>> "%LOG%"
  goto finish
)
rem A sign-in that expires during the run is refreshed by the first case and lost for the others.
node probe-results\check-claude-signin.cjs >> "%LOG%" 2>&1
if errorlevel 1 goto refused_signin
echo === preflight ===>> "%LOG%"
node scripts\native-probes\release-evidence.mjs preflight --candidate .release-candidate.json --host claude --surface cli --model %MODEL% --output %TUPLE% >> "%LOG%" 2>&1
echo exit preflight: !ERRORLEVEL!>> "%LOG%"
if not exist "%TUPLE%" goto finish
for %%S in (dispatch failure_case skill_continuation upgrade recovery) do (
  echo === %%S ===>> "%LOG%"
  node scripts\native-probes\claude-host-e2e.mjs --candidate .release-candidate.json --tuple %TUPLE% --model %MODEL% --scenario %%S >> "%LOG%" 2>&1
  echo exit %%S: !ERRORLEVEL!>> "%LOG%"
)
goto finish
:refused_signin
echo refused: sign in again with claude and /login in a terminal outside the Desktop app, or set CLAUDE_CODE_OAUTH_TOKEN>> "%LOG%"
:finish
echo finished %DATE% %TIME%>> "%LOG%"
echo done> "%DONE%"
