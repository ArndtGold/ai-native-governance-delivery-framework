@echo off
setlocal enabledelayedexpansion
rem Runs the five Claude CLI release cases once each, outside the packaged Claude Desktop app.
cd /d C:\Workspace\agdf-e2e-97454ec2
set "LOG=C:\Workspace\agdf-e2e-97454ec2\probe-results\claude-cli-run.log"
set "DONE=C:\Workspace\agdf-e2e-97454ec2\probe-results\claude-cli-run.done"
if exist "%DONE%" del "%DONE%"
echo started %DATE% %TIME%> "%LOG%"
where claude >> "%LOG%" 2>&1
claude --version >> "%LOG%" 2>&1
node --version >> "%LOG%" 2>&1
for %%S in (dispatch failure_case skill_continuation upgrade recovery) do (
  echo === %%S ===>> "%LOG%"
  node scripts\native-probes\claude-host-e2e.mjs --candidate .release-candidate.json --tuple probe-results\claude-cli-tuple.json --model claude-sonnet-5-5 --scenario %%S >> "%LOG%" 2>&1
  echo exit %%S: !ERRORLEVEL!>> "%LOG%"
)
echo finished %DATE% %TIME%>> "%LOG%"
echo done> "%DONE%"
