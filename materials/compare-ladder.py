"""compare-ladder.py - compare the Python and node canon BY VALUE, and prove the comparison can fail.

Run from the repo root:
  python3 materials/bcr_reference.py > materials/canon-py.json
  node materials/run-ladder.js > materials/canon-js.json
  python3 materials/compare-ladder.py
Exit 0 only when every number agrees to 1e-6 relative AND a planted 0.1% fault is caught.
"""
import copy
import json
import sys

TOL = 1e-6


def walk(a, b, path, bad):
    if isinstance(a, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a or k not in b:
                bad.append(f"{path}.{k}: missing on one side")
            else:
                walk(a[k], b[k], f"{path}.{k}", bad)
    elif isinstance(a, list):
        if len(a) != len(b):
            bad.append(f"{path}: length {len(a)} vs {len(b)}")
        for i, (x, y) in enumerate(zip(a, b)):
            walk(x, y, f"{path}[{i}]", bad)
    elif isinstance(a, (int, float)) and isinstance(b, (int, float)):
        if abs(a - b) > TOL * max(1.0, abs(a), abs(b)):
            bad.append(f"{path}: {a} vs {b}")
    elif a != b:
        bad.append(f"{path}: {a!r} vs {b!r}")


def compare(a, b):
    bad = []
    walk(a, b, "canon", bad)
    return bad


py = json.load(open("materials/canon-py.json"))
js = json.load(open("materials/canon-js.json"))
bad = compare(py, js)
planted = copy.deepcopy(js)
planted["sim"]["p50"] *= 1.001
caught = compare(py, planted)
print(f"mismatches: {len(bad)}")
for line in bad[:20]:
    print("  " + line)
print("planted 0.1% fault caught:", bool(caught))
sys.exit(0 if not bad and caught else 1)
