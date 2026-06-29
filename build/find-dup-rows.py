#!/usr/bin/env python3
"""Dedup / overlap evidence for the deck-clearing consolidation.

Two reports, both READ-ONLY (no edits):
  A. CROSS-TABLE OVERLAP — for each proposed merge pair (thin table -> rich sibling),
     how many of the thin table's rows already have a near-duplicate concept in the rich
     sibling. High overlap = safe to retire the thin table (lift the few unique rows).
  B. INTERNAL DUPLICATION — the DUPED tables (copy-paste-inflated fake-large tables):
     distinct vs total rows, and the worst repeated strings.

Run: python3 build/find-dup-rows.py   (prints to stdout)
"""
import json, os, re, difflib
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, "tables.json")))

# Proposed merges from the worklist-validation pass: (thin, [rich siblings])
PAIRS = [
    ("npc-temperament",       ["npc-demeanor"]),
    ("npc-behavioral-detail", ["npc-mannerisms", "npc-visual-quirk"]),
    ("npc-immediate-mood",    ["npc-demeanor"]),
    ("npc-under-pressure",    ["npc-demeanor", "npc-mannerisms"]),
    ("npc-resource-control",  ["npc-leverage"]),
    ("monster-meal-viability",["cuisine-effects"]),
    ("dungeon-secret-type",   ["dungeon-secret-tier"]),
    ("urban-scene",           ["urban-sensory"]),
]

def norm(s):
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def concept(row):
    # prefer the label cell (cells[0]) if present, else the full text
    cells = row[5] if len(row) > 5 and isinstance(row[5], list) else None
    if cells and cells[0]:
        return norm(str(cells[0]))
    return norm(str(row[3]) if len(row) > 3 else "")

def rows(key):
    t = d.get(key)
    return (t.get("rows") or []) if t else []

def best_ratio(s, pool):
    return max((difflib.SequenceMatcher(None, s, p).ratio() for p in pool), default=0.0)

print("=" * 78)
print("A. CROSS-TABLE OVERLAP  (thin -> rich sibling; THRESH 0.55 = same concept)")
print("=" * 78)
THRESH = 0.55
for thin, riches in PAIRS:
    if thin not in d:
        print(f"\n[missing thin table: {thin}]"); continue
    missing = [r for r in riches if r not in d]
    if missing:
        print(f"\n[missing rich sibling(s) for {thin}: {missing}]")
    pool = [concept(r) for rk in riches if rk in d for r in rows(rk)]
    pool = [p for p in pool if p]
    thin_rows = rows(thin)
    dup, uniq = [], []
    for r in thin_rows:
        c = concept(r)
        if not c:
            continue
        if best_ratio(c, pool) >= THRESH:
            dup.append(c)
        else:
            uniq.append((r[0], (str(r[3])[:80] if len(r) > 3 else c)))
    n = len([r for r in thin_rows if concept(r)])
    pct = int(100 * len(dup) / n) if n else 0
    print(f"\n{thin}  ({n} rows)  ->  {', '.join(riches)}")
    print(f"  overlap: {len(dup)}/{n} rows ({pct}%) already covered · {len(uniq)} unique")
    if uniq:
        print(f"  UNIQUE rows to lift before retiring:")
        for ix, txt in uniq[:12]:
            print(f"    [{ix}] {txt}")
        if len(uniq) > 12:
            print(f"    … +{len(uniq)-12} more")

print("\n" + "=" * 78)
print("B. INTERNAL DUPLICATION  (DUPED tables — copy-paste-inflated)")
print("=" * 78)
for key, t in d.items():
    rws = t.get("rows") or []
    n = len(rws)
    if n < 12:
        continue
    texts = [norm(str(r[3])) for r in rws if len(r) > 3 and r[3]]
    if not texts:
        continue
    distinct = len(set(texts))
    if distinct / n >= 0.6:
        continue
    c = Counter(texts)
    worst = c.most_common(3)
    print(f"\n{key}  ({t.get('dice')}, {n} rows)  ->  {distinct} distinct ({int(100*distinct/n)}%)")
    for txt, ct in worst:
        if ct > 1:
            print(f"    ×{ct}: {txt[:70]}")
