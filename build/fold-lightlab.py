#!/usr/bin/env python3
"""Promote a Light Lab 2.0 export into the authored lock and compile it.

The browser never edits source. Its SAVE action downloads a complete,
versioned light-profile-lock-set JSON document. This explicit offline command
validates that document with build/compile-light-locks.py and, unless
--dry-run is supplied, replaces data/light-profile-locks.json and regenerates
data/light-profile-locks.js.

Run:
  python3 build/fold-lightlab.py path/to/light-profile-locks.json
  python3 build/fold-lightlab.py path/to/light-profile-locks.json --dry-run
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUTHORED = ROOT / "data/light-profile-locks.json"
COMPILED = ROOT / "data/light-profile-locks.js"
COMPILER_PATH = ROOT / "build/compile-light-locks.py"


def load_compiler():
    spec = importlib.util.spec_from_file_location("compile_light_locks", COMPILER_PATH)
    if spec is None or spec.loader is None:
        raise SystemExit("fold-lightlab: could not load build/compile-light-locks.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    compiler = load_compiler()
    incoming = compiler.validate_lock(json.loads(args.export.read_text(encoding="utf-8")))
    normalized = json.dumps(incoming, indent=2, ensure_ascii=False) + "\n"
    compiled = compiler.compile_js(incoming)
    same_authored = AUTHORED.exists() and AUTHORED.read_text(encoding="utf-8") == normalized
    same_compiled = COMPILED.exists() and COMPILED.read_text(encoding="utf-8") == compiled

    if args.dry_run:
        print(
            "fold-lightlab: valid lock; "
            f"authored={'current' if same_authored else 'would change'}, "
            f"compiled={'current' if same_compiled else 'would change'}"
        )
        return 0
    if same_authored and same_compiled:
        print("fold-lightlab: no changes — authored and compiled locks are current")
        return 0
    AUTHORED.write_text(normalized, encoding="utf-8")
    COMPILED.write_text(compiled, encoding="utf-8")
    print("fold-lightlab: promoted authored JSON and regenerated compiled lock")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
