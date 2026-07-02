#!/usr/bin/env python3
"""Genesis build — generate data/names.js from the NPC Name Megatable
(Engine/03. _Tables/02. Social/Sentient NPCs/NPC Name Megatable.md).

ON-DEMAND-GEN.md §3 / BATCH-GUARDRAILS G4: the megatable packs two-column d100 sub-tables
(|d100|Name|d100|Name|) that compile-tables.py mangles if it ever treats them as dice tables
(hence the file is stamped `type: name-bank` — skipped there). This script parses the packed
columns directly (ignore the d100 ranges; keep only the Name cells) and regenerates
data/names.js — shape stays BACKWARD-COMPATIBLE: `first`/`last` stay a union of every pool
for that species (roster.js:randomCharName keeps working untouched), plus new `female`/`male`
(and `child` where the source has it) gendered pools rollNPC's gender roll reads.

Species → megatable section mapping (best-effort onto CHAR_NAMES' existing key set):
  Human, Dwarf, Elf, Halfling, Gnome, Dragonborn — direct.
  Orc      <- "Half-Orc" sections (megatable has no plain-Orc bank).
  Tiefling <- "Fiend-Blooded" sections (closest fit; Virtue names -> last/surname pool).
  Goliath  <- no megatable section; the existing hand-authored pool is kept untouched.

Generated artifact — never hand-edit data/names.js; edit the megatable (the source) and
re-run this. Idempotent.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "Engine", "03. _Tables", "02. Social", "Sentient NPCs", "NPC Name Megatable.md")
OUT  = os.path.join(ROOT, "data", "names.js")
CULTURES_SRC = os.path.join(ROOT, "Engine", "03. _Tables", "02. Social", "Sentient NPCs", "Name Cultures.md")
CULTURES_OUT = os.path.join(ROOT, "data", "names-cultures.js")

# section header (after stripping " Names"/" Adult Names" etc.) -> (species, bucket)
SECTION_MAP = {
    "Elf Child":              ("Elf", "child"),
    "Elf Female Adult":       ("Elf", "female"),
    "Elf Male Adult":         ("Elf", "male"),
    "Elf Family":             ("Elf", "last"),
    "Human (English) Female": ("Human", "female"),
    "Human (English) Male":   ("Human", "male"),
    "Dwarf Female":           ("Dwarf", "female"),
    "Dwarf Male":             ("Dwarf", "male"),
    "Dwarf Clan":             ("Dwarf", "last"),
    "Half-Orc Female":        ("Orc", "female"),
    "Half-Orc Male":          ("Orc", "male"),
    "Gnome Female":           ("Gnome", "female"),
    "Gnome Male":             ("Gnome", "male"),
    "Gnome Clan":             ("Gnome", "last"),
    "Halfling Female":        ("Halfling", "female"),
    "Halfling Male":          ("Halfling", "male"),
    "Halfling Family":        ("Halfling", "last"),
    "Dragonborn Female":      ("Dragonborn", "female"),
    "Dragonborn Male":        ("Dragonborn", "male"),
    "Dragonborn Clan":        ("Dragonborn", "last"),
    "Fiend-Blooded Female":   ("Tiefling", "female"),
    "Fiend-Blooded Male":     ("Tiefling", "male"),
    "Fiend-Blooded Virtue":   ("Tiefling", "last"),
}

# The pre-megatable hand-authored pools (git history, feat/roll-branches). Two uses: (1) Goliath has
# no megatable section at all — kept verbatim; (2) the megatable's Human/Half-Orc banks carry no
# separate family-name table (given names only) — `last` falls back to these HAND-AUTHORED surnames so
# randomCharName (roster.js, unguarded `pick(pool.last)`) never draws from an empty array (BATCH-
# GUARDRAILS G4: "roster.js keeps working untouched").
LAST_FALLBACK = {
    "Human":      ["Underwood","Hartley","Thatcher","Marsh","Fenwick","Ashgrove","Carrow","Dunmore","Larkin","Holloway","Crane","Rooke","Sallow","Brackett","Quill","Hedley","Coombe","Frost","Vane","Bell"],
    "Orc":        ["Bonebreaker","Ironmaw","Bloodtusk","Grimfang","Ashwalker","Stormtooth","Redhand","Bonegrin","Hollowhowl","Skullsplit"],
    "Goliath":    ["Skywatcher","Stonepeak","Cloudchaser","Frostborn","Boulderfist","Highcairn","Stormcrest","Snowstride","Ramheart","Farreach"],
}
GOLIATH_FALLBACK = {
    "first": ["Kavaki","Ouva","Thalai","Vaunea","Manneo","Keothi","Nalla","Aukan","Ilydrin","Gae","Lhurno","Eglath"],
    "last":  LAST_FALLBACK["Goliath"],
}

HEADER_RE = re.compile(r"^### (.+?)\s+Names\s*$")
ROW_RE = re.compile(r"^\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|\s*$")

def parse_megatable(text):
    """-> {section_title: [name, name, ...]} — packed 2-col d100 rows, names only (d100 ranges dropped)."""
    sections = {}
    cur = None
    for line in text.splitlines():
        m = HEADER_RE.match(line.strip())
        if m:
            cur = m.group(1).strip()
            sections[cur] = []
            continue
        if cur is None:
            continue
        m = ROW_RE.match(line.strip())
        if not m:
            continue
        a, b, c, d = (x.strip() for x in m.groups())
        if a.lower() in ("d100", "---") or not re.match(r"^\d", a):   # header/separator row
            continue
        if b:
            sections[cur].append(b)
        if d:
            sections[cur].append(d)
    return sections

def main():
    text = open(SRC, encoding="utf-8").read()
    sections = parse_megatable(text)

    species = {}   # species -> {"first":set(), "last":set(), "female":[...], "male":[...], "child":[...]}
    for title, names in sections.items():
        key = SECTION_MAP.get(title)
        if not key:
            continue   # a megatable section this build doesn't map (none expected; forward-compatible no-op)
        sp, bucket = key
        rec = species.setdefault(sp, {"female": [], "male": [], "child": []})
        rec[bucket] = names   # each bucket appears once per species in this megatable — direct assign

    out = {}
    for sp, rec in species.items():
        female = rec.get("female", [])
        male = rec.get("male", [])
        child = rec.get("child", [])
        last = rec.get("last", [])
        first = []   # union pool, order-preserved de-dupe (back-compat for randomCharName/npcRolledName)
        seen = set()
        for n in female + male + child:
            if n not in seen:
                seen.add(n); first.append(n)
        if not last:
            last = LAST_FALLBACK.get(sp, [])
        entry = {"first": first, "last": last, "female": female, "male": male}
        if child:
            entry["child"] = child
        out[sp] = entry

    # Goliath: no megatable section — keep the hand-authored pool, back-filled into the new shape
    # (female/male empty so rollNPC's gender roll falls back to `first`, exactly as before this build).
    if "Goliath" not in out:
        out["Goliath"] = {"first": GOLIATH_FALLBACK["first"], "last": GOLIATH_FALLBACK["last"], "female": [], "male": []}

    order = ["Human", "Dwarf", "Elf", "Halfling", "Orc", "Gnome", "Dragonborn", "Goliath", "Tiefling"]
    for sp in order:
        if sp not in out:
            out[sp] = {"first": [], "last": [], "female": [], "male": []}

    lines = []
    for sp in order:
        entry = out[sp]
        lines.append(f"  {sp}:{json.dumps(entry, ensure_ascii=False, separators=(',', ':'))},")

    header = (
        "/* GENESIS DATA (generated) — data/names.js\n"
        "   owns: CHAR_NAMES\n"
        "   Per-species character name pools (NPC Name Megatable, ON-DEMAND-GEN.md §3).\n"
        "   GENERATED by build/gen-names.py from Engine/03. _Tables/02. Social/Sentient NPCs/\n"
        "   NPC Name Megatable.md — DO NOT hand-edit; edit the megatable and re-run.\n"
        "   Shape: {first,last,female,male[,child]} per species — first/last are union pools\n"
        "   (roster.js:randomCharName), female/male(/child) are the gendered pools rollNPC's\n"
        "   1d2 gender roll reads. Classic <script> (shared global scope). Registered in\n"
        "   manifest.json — run build/check-manifest.py after edits. */\n"
    )
    js = header + "const CHAR_NAMES={\n" + "\n".join(lines) + "\n};\n"
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(js)
    counts = {sp: {b: len(out[sp].get(b, [])) for b in ("first", "last", "female", "male", "child") if b in out[sp]} for sp in order}
    print(f"wrote {OUT}: {len(order)} species")
    for sp in order:
        print(f"  {sp}: {counts[sp]}")

CULTURE_HEADER_RE = re.compile(r"^### (.+?)\s+(Female|Male|Family)\s+Names\s*$")

def parse_cultures(text):
    """-> {(culture,bucket): [name,...]} — same packed 2-col format as the species megatable,
    reusing parse_megatable's row-scan but keyed on the (Culture, Female/Male/Family) heading."""
    sections = {}
    cur = None
    for line in text.splitlines():
        m = CULTURE_HEADER_RE.match(line.strip())
        if m:
            cur = (m.group(1).strip(), m.group(2).lower())
            sections[cur] = []
            continue
        if cur is None:
            continue
        m = ROW_RE.match(line.strip())
        if not m:
            continue
        a, b, c, d = (x.strip() for x in m.groups())
        if a.lower() in ("d40", "---") or not re.match(r"^\d", a):
            continue
        if b:
            sections[cur].append(b)
        if d:
            sections[cur].append(d)
    return sections

def main_cultures():
    """data/names-cultures.js — owns NAME_CULTURES = {Culture: {female,male,family}}
    (REGIONS-NAMES.md §3/§5; Name Cultures.md is the source, `type: name-bank` so
    compile-tables.py skips it — this script is the only consumer)."""
    text = open(CULTURES_SRC, encoding="utf-8").read()
    sections = parse_cultures(text)

    cultures = {}
    for (culture, bucket), names in sections.items():
        rec = cultures.setdefault(culture, {"female": [], "male": [], "family": []})
        rec[bucket] = names

    order = sorted(cultures.keys())
    lines = []
    for c in order:
        entry = cultures[c]
        lines.append(f"  \"{c}\":{json.dumps(entry, ensure_ascii=False, separators=(',', ':'))},")

    header = (
        "/* GENESIS DATA (generated) — data/names-cultures.js\n"
        "   owns: NAME_CULTURES\n"
        "   The 12 regional name-culture banks (REGIONS-NAMES.md §3/§5): {female,male,family}\n"
        "   per culture, original phonology-inspired coinages, world-agnostic.\n"
        "   GENERATED by build/gen-names.py --cultures from Engine/03. _Tables/02. Social/\n"
        "   Sentient NPCs/Name Cultures.md — DO NOT hand-edit; edit the bank and re-run.\n"
        "   Classic <script> (shared global scope). Registered in manifest.json — run\n"
        "   build/check-manifest.py after edits. */\n"
    )
    js = header + "const NAME_CULTURES={\n" + "\n".join(lines) + "\n};\n"
    with open(CULTURES_OUT, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"wrote {CULTURES_OUT}: {len(order)} cultures")
    for c in order:
        e = cultures[c]
        print(f"  {c}: female={len(e['female'])} male={len(e['male'])} family={len(e['family'])}")

if __name__ == "__main__":
    if "--cultures" in sys.argv:
        main_cultures()
    else:
        main()
