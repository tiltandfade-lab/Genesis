#!/usr/bin/env python3
"""Read-only scan of the creature/race/plane IP cluster across the SOURCE corpus.

Reports, per IP term: which markdown files reference it and how many times — split into
TABLE source (Engine/03. _Tables) vs MONSTER stat files (Asset Library/Monsters & Enemies).
Excludes Reference/ (copyrighted source, untouched) and zz_Archive/ (snapshots).

This is the exact scope of the proposed B2 creature scrub — for one-shot approval. It applies
NOTHING. Run: python3 build/scan-creature-ip.py
"""
import os, re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# IP term -> proposed generic (from the creature-reskin scan mapping)
MAP = [
    ("Beholder", "Eye-Tyrant"), ("Death Tyrant", "Undead Eye-Tyrant"),
    ("Mind Flayer", "Mind-Thief"), ("Illithid", "Mind-Thief"),
    ("Aboleth", "Elder Deep-Thing"), ("Modron", "Clockwork Law-Construct"),
    ("Slaad", "Chaos-Frog"), ("Githyanki", "Astral Raider"), ("Githzerai", "Void-Monk"),
    ("Intellect Devourer", "Brain-Crawler"), ("Chuul", "Clawed Drowner"),
    ("Grimlock", "Blind Deep-Stalker"), ("Quaggoth", "Deep-Brute"),
    ("Duergar", "Gray Dwarf"), ("Drow", "Deep-Elf"), ("Tiefling", "Fiend-Blooded"),
    ("Nothic", "Secret-Eye"), ("Flumph", "Lantern-Sage"), ("Kuo-toa", "Fish-Folk Cultist"),
    ("Underdark", "the Deeplands"), ("Mechanus", "the Clockwork plane"), ("Limbo", "the Churn"),
    ("Elder Brain", "Deep-Mind"),
]

SCAN_ROOTS = [
    ("TABLE",   os.path.join(ROOT, "Engine", "03. _Tables")),
    ("MONSTER", os.path.join(ROOT, "Asset Library", "Monsters & Enemies")),
    ("OTHER-ASSET", os.path.join(ROOT, "Asset Library")),
]
SKIP = ("zz_Archive", "Archive", "/Reference/", ".git")

def files():
    seen = set()
    for kind, root in SCAN_ROOTS:
        if not os.path.isdir(root):
            continue
        for dp, dn, fn in os.walk(root):
            if any(s in dp for s in SKIP):
                continue
            for f in fn:
                if not f.endswith(".md"):
                    continue
                p = os.path.join(dp, f)
                if p in seen:
                    continue
                seen.add(p)
                yield kind, p

# precompile word-boundary, case-insensitive patterns
pats = [(ip, gen, re.compile(r"\b" + re.escape(ip) + r"\b", re.I)) for ip, gen in MAP]

per_term = defaultdict(lambda: defaultdict(int))   # ip -> {relpath: count}
per_file_terms = defaultdict(set)                  # relpath -> {ip}
total = defaultdict(int)

for kind, p in files():
    try:
        txt = open(p, encoding="utf-8", errors="ignore").read()
    except Exception:
        continue
    rel = os.path.relpath(p, ROOT)
    for ip, gen, pat in pats:
        n = len(pat.findall(txt))
        if n:
            per_term[ip][rel] += n
            per_file_terms[rel].add(ip)
            total[ip] += n

print("=" * 80)
print("CREATURE IP CLUSTER — SOURCE SCAN (read-only; nothing applied)")
print("=" * 80)
print(f"\n{sum(total.values())} total hits · {len(per_file_terms)} files · "
      f"{sum(1 for ip,_,_ in pats if total[ip])} of {len(pats)} terms present\n")

print("BY TERM  (ip -> generic : total hits)")
for ip, gen, _ in pats:
    if total[ip]:
        print(f"  {ip:20s} -> {gen:22s} {total[ip]:>4}  "
              f"({len(per_term[ip])} files)")
no = [ip for ip, _, _ in pats if not total[ip]]
if no:
    print(f"  (absent from source: {', '.join(no)})")

print("\nTOP FILES  (most cluster-tokens — the scrub's heaviest edits)")
ranked = sorted(per_file_terms.items(), key=lambda kv: -sum(per_term[ip][kv[0]] for ip in kv[1]))
for rel, ips in ranked[:25]:
    cnt = sum(per_term[ip][rel] for ip in ips)
    print(f"  {cnt:>4}  {rel}   [{', '.join(sorted(ips))}]")

print("\nNOTES")
print("  - Drow/Tiefling in NPC name tables = SECTION LABELS only (relabel, don't gut the name bank).")
print("  - Underdark is SRD-reprieved; mapped to 'the Deeplands' as a TONE choice, not a legal need.")
print("  - Monster stat FILES also get an id/filename rename (Beholder.md -> Eye-Tyrant.md) at apply time.")
print("  - Skipped: Reference/ (copyrighted) + zz_Archive/ (snapshots).")
