"""Read-only reassessment of retained inputs; never launches a host or model."""
import hashlib
import json
import os
from pathlib import Path

ROOT = Path('/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework')
RUN = ROOT / '.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01'
Q = RUN / 'evidence/qualification/pair-guidance-01'
OUT = RUN / 'evidence/direct-fix-04'
OUT.mkdir(exist_ok=False)
sha = lambda data: hashlib.sha256(data).hexdigest()
read = lambda path: json.loads(path.read_text())
bindings = read(Q / 'final-bindings.json')
candidate = Path(bindings['candidate'])
changed = 'scripts/native-probes/codex-command-task-test.mjs'
current = (ROOT / changed).read_bytes()
new = b'assert.match(result.stderr, /T7_GUARD_APPLICATION_UNAVAILABLE/);'
old = b'assert.match(result.stdout, /T7_GUARD_APPLICATION_UNAVAILABLE/);'
assert current.count(new) == 1
assert sha(current.replace(new, old, 1)) == bindings['bindings'][changed]
assert current == (candidate / changed).read_bytes()
source_rows = []
for rel, expected in bindings['bindings'].items():
    actual = sha((ROOT / rel).read_bytes())
    assert actual == sha((candidate / rel).read_bytes())
    assert rel == changed or actual == expected, rel
    source_rows.append({'path': rel, 'native_sha256': expected, 'current_sha256': actual,
                        'changed': actual != expected})
frozen_path = Q / 'frozen-candidate.json'
assert sha(frozen_path.read_bytes()) == bindings['frozen_candidate']['sha256']
frozen = read(frozen_path)
fresh_files, differences = {}, []
for rel, expected in frozen['files'].items():
    path = candidate / rel
    actual = ({'symlink': os.readlink(path)} if path.is_symlink() else
              {'directory': True} if path.is_dir() else {'sha256': sha(path.read_bytes())})
    fresh_files[rel] = actual
    if actual != expected:
        differences.append(rel)
assert differences == [changed], differences
(OUT / 'post-fix-candidate.json').write_text(json.dumps({'candidate': str(candidate), 'files': fresh_files}, indent=2) + '\n')
applicability = read(Q / 'applicability.json')
evidence_count = 0
for scenario in applicability['scenarios']:
    for item in scenario['evidence']:
        assert sha((RUN / item['path']).read_bytes()) == item['sha256'], item['path']
        evidence_count += 1
retention = read(RUN / 'evidence/prestudy/retention-index.json')
for item in retention['entries']:
    for path in [Path(item['source']), RUN / 'evidence/prestudy' / item['destination']]:
        assert sha(path.read_bytes()) == item['sha256'], str(path)
native = read(Q / 'native-summary.json')
assert native['qualified'] and native['model_invocations'] == 2
assert native['run_real_sessions_total'] == 4
assert sha((candidate / 'qualification-wrapper/renewed/ledger.json').read_bytes()) == native['prior_ledger_sha256']
retained_native = 0
for session in ['session-01', 'session-02']:
    directory = Q / 'native' / session
    manifest = read(directory / 'retention-manifest.json')
    for rel, expected in manifest['files'].items():
        for path in [directory / rel, Path(manifest['original']) / rel]:
            assert sha(path.read_bytes()) == expected, str(path)
        retained_native += 1
for observation in native['observations']:
    assert observation['qualified'] and observation['strict']['success'] and observation['original_predicate']['success']
    assert observation['metrics']['calls'] == 4
    for counter in ['invalid_calls','invalid_argument_calls','is_error_results','agdf_failure_results','agdf_shell_calls']:
        assert observation['metrics'][counter] == 0
    assert observation['observed_models'] == ['gpt-6.1-sol']
    assert observation['observed_efforts'] == ['low']
logs = {}
for label in ['darwin', 'platform']:
    source = Path('/private/tmp/codex-command-task-direct-fix-' + label + '.log')
    data = source.read_bytes()
    assert b'# fail 0' in data
    assert (b'# pass 4' if label == 'darwin' else b'# pass 1') in data
    destination = OUT / (label + '.log')
    destination.write_bytes(data)
    logs[label] = {'source': str(source), 'sha256': sha(data), 'model_invocations': 0,
                   'scope': 'actual macOS synthetic-host suite' if label == 'darwin' else 'simulated unsupported-platform branch on macOS; not native Linux'}
result = {'pass': True, 'source_rows': source_rows, 'candidate_files_checked': len(fresh_files),
          'changed_frozen_paths': differences, 'scenarios_reassessed': len(applicability['scenarios']),
          'scenario_evidence_hashes_verified': evidence_count,
          'prestudy_original_and_retained_pairs_verified': len(retention['entries']),
          'current_native_original_and_retained_pairs_verified': retained_native,
          'native_qualified': 2, 'native_total_real_sessions': 4, 'additional_real_sessions': 0,
          'native_applicability': 'All runtime/guard/task/audit, assembly, dependencies and UI bytes unchanged; only a negative-test stream assertion changed. Historical manifest and observations remain immutable. Their native-runtime qualification remains applicable; it is not a claim of new execution on the changed test snapshot.',
          'logs': logs, 'model_invocations': 0}
(OUT / 'assessment.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key not in ['source_rows', 'logs']}))
