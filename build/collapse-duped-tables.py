#!/usr/bin/env python3
"""Lossless de-inflation of copy-paste-padded tables (the approved 'cheap deck-clearing wins').

Each target is a fake-large table where runs of consecutive rows are byte-identical except for the
die index. We merge each run into ONE row with a `lo-hi` range — same die, same probability, same
text, just no redundant rows. NO content change, NO re-weighting. Archives the original first.

Run: python3 build/collapse-duped-tables.py   (then recompile tables)
"""
import os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    "Engine/03. _Tables/03. Session Mechanics/Travel & Resting/Travel Biome.md",
    "Engine/03. _Tables/03. Session Mechanics/Travel & Resting/Travel Destination Type.md",
    "Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Lighting.md",
]

def collapse(path):
    full = os.path.join(ROOT, path)
    lines = open(full, encoding="utf-8").read().split("\n")
    out, i = [], 0
    # passthrough until the table starts (header row = a | line whose first cell looks like a die label)
    table_start = None
    for j, ln in enumerate(lines):
        if ln.strip().startswith("|") and re.search(r"\bd\d+\b", ln, re.I):
            table_start = j
            break
    if table_start is None:
        print(f"  [!] no table header found in {path}; skipped")
        return 0, 0
    out += lines[:table_start + 1]          # everything up to & incl. the header row
    sep = lines[table_start + 1]
    out.append(sep)                          # the |---|---| separator
    # parse data rows until a non-table line
    rows, k = [], table_start + 2
    while k < len(lines) and lines[k].strip().startswith("|"):
        cells = [c.strip() for c in lines[k].strip().strip("|").split("|")]
        m = re.match(r"^(\d+)(?:\s*-\s*(\d+))?$", cells[0])
        if not m:                            # not a numbered data row — stop
            break
        lo = int(m.group(1)); hi = int(m.group(2)) if m.group(2) else lo
        rows.append((lo, hi, tuple(cells[1:])))
        k += 1
    trailer = lines[k:]                       # anchor line(s), trailing prose
    # merge consecutive runs with identical non-die cells
    merged, before = [], len(rows)
    for lo, hi, body in rows:
        if merged and merged[-1][2] == body and merged[-1][1] + 1 == lo:
            merged[-1] = (merged[-1][0], hi, body)
        else:
            merged.append((lo, hi, body))
    for lo, hi, body in merged:
        rng = f"{lo}" if lo == hi else f"{lo}-{hi}"
        out.append("| " + " | ".join([rng, *body]) + " |")
    out += trailer
    open(full, "w", encoding="utf-8").write("\n".join(out))
    return before, len(merged)

for t in TARGETS:
    full = os.path.join(ROOT, t)
    if not os.path.isfile(full):
        print(f"  [!] missing: {t}"); continue
    # archive-first
    d = os.path.join(os.path.dirname(full), "zz_Archive")
    os.makedirs(d, exist_ok=True)
    base = os.path.basename(full)[:-3]
    shutil.copy2(full, os.path.join(d, f"{base} _pre-collapse_2026-06-28.md"))
    before, after = collapse(t)
    print(f"  {os.path.basename(t):32s} {before:>4} rows -> {after:>3} rows (archived)")
print("Done. Recompile: python3 \"Engine/00. _System/compile-tables.py\" --emit")
