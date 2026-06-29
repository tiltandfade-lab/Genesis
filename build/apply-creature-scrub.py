#!/usr/bin/env python3
"""Apply the creature/race/plane IP scrub: swap trademark creature nouns -> generic coinages.

Deterministic, case-preserving, word-boundary token swap across the TABLE corpus + monster stat files.
Renames the IP-named stat files (Beholder.md -> Eye-Tyrant.md) and updates their `id:`. Excludes
Reference/, zz_Archive/, Adventures/, Encounter Modules/ (copyrighted source + campaign/built content
that needs human judgment). Produces a fully-reviewable diff; applies on the feat branch only.

Run: python3 build/apply-creature-scrub.py   (then recompile + re-grep to verify)
"""
import os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (term, replacement, article) — article 'an'/'a'/None for the a/an cleanup. Longest terms first so
# multi-word names win over any substring.
MAP = [
    ("Death Tyrant", "Undead Eye-Tyrant", "an"),
    ("Intellect Devourer", "Brain-Crawler", "a"),
    ("Mind Flayer", "Mind-Thief", "a"),
    ("Elder Brain", "Deep-Mind", "a"),
    ("Githyanki", "Astral Raider", "an"),
    ("Githzerai", "Void-Monk", "a"),
    ("Beholder", "Eye-Tyrant", "an"),
    ("Illithid", "Mind-Thief", "a"),
    ("Aboleth", "Elder Deep-Thing", "an"),
    ("Quaggoth", "Deep-Brute", "a"),
    ("Grimlock", "Blind Deep-Stalker", "a"),
    ("Tiefling", "Fiend-Blooded", "a"),
    ("Kuo-toa", "Fish-Folk", "a"),
    ("Duergar", "Gray Dwarf", "a"),
    ("Slaadi", "Chaos-Frogs", None),     # irregular plural before the singular
    ("Modron", "Clockwork Law-Construct", "a"),
    ("Slaad", "Chaos-Frog", "a"),
    ("Nothic", "Secret-Eye", "a"),
    ("Flumph", "Lantern-Sage", "a"),
    ("Chuul", "Clawed Drowner", "a"),
    ("Drow", "Deep-Elf", "a"),
    ("Underdark", "Deeplands", None),
    ("Mechanus", "Cogwork", None),
    ("Limbo", "Churn", None),
]
MAP.sort(key=lambda e: -len(e[0]))

SCAN_ROOTS = [os.path.join(ROOT, "Engine", "03. _Tables"),
              os.path.join(ROOT, "Asset Library", "Monsters & Enemies")]
SKIP = ("zz_Archive", "Archive", "/Reference/", "/Adventures/", "/Encounter Modules/", ".git")
VOWEL = tuple("AEIOUaeiou")

def case_like(src, repl):
    """A fully-lowercase matched term -> lowercase coinage (species-style, "the eye-tyrant");
    any capitalization in the term -> the canonical Capitalized coinage ("Eye-Tyrant")."""
    return repl.lower() if src.islower() else repl

def swap(text):
    for term, repl, _art in MAP:
        pat = re.compile(r"\b" + re.escape(term) + r"(s|es|i)?\b", re.I)
        def rep(m, repl=repl):
            r = case_like(m.group(0), repl)
            if m.group(1) and not r.endswith("s"):   # matched a plural suffix -> pluralize the coinage
                r += "s"
            return r
        text = pat.sub(rep, text)
    # a/an cleanup around the inserted coinages (matches either case of the coinage's first word)
    for _term, repl, art in MAP:
        if not art:
            continue
        head = re.escape(repl.split()[0])
        def fix(m, art=art):
            return m.group(1) + ("n" if art == "an" else "") + m.group(2)
        text = re.sub(r"\b([Aa])n?(\s+" + head + r")", fix, text, flags=re.I)
    return text

def files():
    for root in SCAN_ROOTS:
        for dp, dn, fn in os.walk(root):
            if any(s in dp for s in SKIP):
                continue
            for f in fn:
                if f.endswith(".md"):
                    yield os.path.join(dp, f)

# 1) rename IP-named stat files first (git mv preserves history), then content-swap the renamed file
mon = os.path.join(ROOT, "Asset Library", "Monsters & Enemies")
renames = []
for term, repl, _ in MAP:
    for cand in (f"{term}.md", f"{term}s.md"):
        src = os.path.join(mon, cand)
        if os.path.isfile(src):
            newname = repl + ("s" if cand.endswith("s.md") and not repl.endswith("s") else "") + ".md"
            dst = os.path.join(mon, newname)
            if os.path.abspath(src) != os.path.abspath(dst):
                subprocess.run(["git", "-C", ROOT, "mv", src, dst], check=True)
                renames.append((cand, newname))

# 2) content swap every file in scope
changed = 0
for p in files():
    txt = open(p, encoding="utf-8", errors="ignore").read()
    new = swap(txt)
    if new != txt:
        open(p, "w", encoding="utf-8").write(new)
        changed += 1

# 3) fix id: lines in renamed stat files -> slug of the new filename
def slugify(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
for _old, newname in renames:
    p = os.path.join(mon, newname)
    txt = open(p, encoding="utf-8").read()
    base = newname[:-3]
    txt2 = re.sub(r"(?m)^id:\s*.+$", "id: " + slugify(base), txt, count=1)
    if txt2 != txt:
        open(p, "w", encoding="utf-8").write(txt2)

print(f"renamed {len(renames)} stat files, content-swapped {changed} files")
for o, n in renames:
    print(f"  {o}  ->  {n}")
print("Recompile: python3 \"Engine/00. _System/compile-tables.py\" --emit")
