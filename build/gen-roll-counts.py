#!/usr/bin/env python3
"""build/gen-roll-counts.py — docs/TABLE-ATLAS.md unit U1: aggregate table-roll tallies across
test sessions into data/roll-counts.js (owns ROLL_COUNTS).

Seam (spec-decided, U1 §"the seam decision"): src/engine/compiled.js's rollTable() tallies every
automatic roll onto the transient GS.tableRolls container (one integer increment per roll, no I/O
in the mechanical loop). A session-close step (playtest-rig close / genesis-clean-close / a manual
dev command — PROVISIONAL, workflow taste, does not block this script) flushes that session's
GS.tableRolls snapshot as ONE JSON line appended to .dm/roll-counts.jsonl. This script sums every
line in that file, per table id, and writes the committed compiled artifact data/roll-counts.js.

Never hand-edit data/roll-counts.js — regenerate with this script.

Usage: python3 build/gen-roll-counts.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)  # …/Genesis
JSONL_PATH = os.path.join(BASE, ".dm", "roll-counts.jsonl")
OUT_PATH = os.path.join(BASE, "data", "roll-counts.js")


def aggregate(jsonl_path):
    """Sum every {tableId: count} JSON line in jsonl_path into one dict. Missing file -> {}
    (no test sessions flushed yet; the Atlas degrades to '—' per docs/TABLE-ATLAS.md edge case 1)."""
    totals = {}
    if not os.path.isfile(jsonl_path):
        return totals
    with open(jsonl_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                snapshot = json.loads(line)
            except json.JSONDecodeError:
                continue  # skip a malformed line rather than aborting the whole aggregation
            if not isinstance(snapshot, dict):
                continue
            for table_id, count in snapshot.items():
                try:
                    n = int(count)
                except (TypeError, ValueError):
                    continue
                totals[table_id] = totals.get(table_id, 0) + n
    return totals


def main():
    totals = aggregate(JSONL_PATH)
    lines = [
        "/* GENERATED — do not hand-edit. Regenerate: python3 build/gen-roll-counts.py",
        "   Aggregates GS.tableRolls tallies flushed to .dm/roll-counts.jsonl across test sessions.",
        "   Owns ROLL_COUNTS: { tableId: totalRollsAcrossTestSessions }. */",
        "const ROLL_COUNTS = " + json.dumps(totals, indent=2, sort_keys=True) + ";",
        "",
    ]
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"wrote data/roll-counts.js ({len(totals)} tables tallied"
          f"{'' if os.path.isfile(JSONL_PATH) else ', no .dm/roll-counts.jsonl yet — all zero'})")


if __name__ == "__main__":
    main()
