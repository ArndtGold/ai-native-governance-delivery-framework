import json, sys
from pathlib import Path

case, turn_id = sys.argv[1:]
session = Path('/Users/arndtgold/.codex/sessions/2026/10/08/rollout-2026-10-08T21-34-44-01a11d02-cb5a-7a82-89ea-d6129505fcfa.jsonl')
base = Path(__file__).parent
active = False
items = []
for line in session.open():
    row = json.loads(line)
    item = row.get('payload', {})
    if row['type'] == 'turn_context':
        active = item.get('turn_id') == turn_id
    if active and row['type'] == 'response_item':
        items.append(item)
found = []
for index, item in enumerate(items):
    if item.get('type') != 'custom_tool_call_output':
        continue
    for block in item['output']:
        try:
            outer = json.loads(block.get('text', ''))
        except (ValueError, TypeError):
            continue
        if not isinstance(outer, dict):
            continue
        for content in outer.get('content', []):
            if content.get('type') != 'text':
                continue
            try:
                result = json.loads(content['text'])
            except ValueError:
                continue
            if isinstance(result, dict) and result.get('terminal') is True:
                found.append((index, result))
assert len(found) == 1, 'Expected one actual terminal result'
index, dispatch = found[0]
final = next(item for item in items[index+1:] if item.get('type') == 'message' and item.get('phase') == 'final_answer')
text = ''.join(block.get('text', '') for block in final['content'])
later = [item for item in items[index+1:] if item.get('type') in ['custom_tool_call', 'function_call']]
proof = {'thread_id': '01a11d02-cb5a-7a82-89ea-d6129505fcfa', 'turn_id': turn_id, 'case': case,
         'actual_dispatch': dispatch, 'actual_final_text': text,
         'exact_host_text_equal': text == dispatch['host_action']['text'], 'later_tool_calls': later,
         'source': 'Actual named local Codex response_items, inspected after completed isolated test turn'}
assert proof['exact_host_text_equal'] and not later
path = base / ('INDEPENDENT_TERMINAL_' + case.upper().replace('-', '_') + '_PROOF-01.json')
path.write_text(json.dumps(proof, indent=2) + '\n')
print(json.dumps({'case': case, 'exact_host_text_equal': True, 'later_tool_calls': 0,
                  'outcome': dispatch['outcome'], 'runtime': dispatch['runtime']}))
