#!/usr/bin/env python3
"""Genesis build — generate data/subclass-progression.js from the SRD markdown.

The SRD 5.2.1 ships exactly ONE subclass per class. This extracts each class's subclass —
its name, intro description, and the features it grants per level (with FULL SRD text) — so
the in-app level-up picker can REVEAL the subclass + its features at the right levels (L3
grant, then L6 / L10 / … features), instead of deferring "shape it with your DM".

Source of truth = the SRD markdown (edit-source -> compile-artifact). Subclass sections live
under inconsistent headings (e.g. "## College of Lore" vs "## Cleric Subclass: Life Domain"),
and the Wizard's Evoker lives in character-origins-feats.md — so each class maps to an explicit
(file, heading) pair. Features are parsed from `### Level N: Name` blocks within the section.

GENERATED — never hand-edit data/subclass-progression.js; edit the SRD markdown + re-run this.
Idempotent. Run `python3 build/check-manifest.py` after, then the headless harness.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLASSES_MD = os.path.join(ROOT, "Reference", "SRD-Data", "classes.md")
FEATS_MD   = os.path.join(ROOT, "Reference", "SRD-Data", "character-origins-feats.md")
OUT        = os.path.join(ROOT, "data", "subclass-progression.js")

# class -> (source file, exact "## " heading text, canonical display name).
# Heading text is what locates the section; display name is the SRD index name (sometimes differs).
SUBCLASS = {
  "Barbarian": (CLASSES_MD, "Path of the Berserker",          "Path of the Berserker"),
  "Bard":      (CLASSES_MD, "College of Lore",                "College of Lore"),
  "Cleric":    (CLASSES_MD, "Cleric Subclass: Life Domain",   "Life Domain"),
  "Druid":     (CLASSES_MD, "Circle of the Land",             "Circle of the Land"),
  "Fighter":   (CLASSES_MD, "Fighter Subclass: Champion",     "Champion"),
  "Monk":      (CLASSES_MD, "Open Hand",                      "Warrior of the Open Hand"),
  "Paladin":   (CLASSES_MD, "Paladin Subclass: Oath of Devotion", "Oath of Devotion"),
  "Ranger":    (CLASSES_MD, "Ranger Subclass: Hunter",        "Hunter"),
  "Rogue":     (CLASSES_MD, "Rogue Subclass: Thief",          "Thief"),
  "Sorcerer":  (CLASSES_MD, "Sorcerer Subclass: Draconic",    "Draconic Sorcery"),
  "Warlock":   (CLASSES_MD, "Warlock Subclass: Fiend Patron", "Fiend Patron"),
  "Wizard":    (FEATS_MD,   "Wizard Subclass: Evoker",        "Evoker"),
}

def section(lines, heading):
    """The block of lines from `## <heading>` up to the next top-level `## ` heading. Robust to
    OCR that split a heading across two `## ` lines (e.g. Sorcerer's "## Draconic" / "## Sorcery"):
    a `## ` line only ENDS the section once the subclass's `### Level` features have begun, so a
    stray heading appearing before any feature is absorbed, not treated as the next section."""
    start = None
    for i, ln in enumerate(lines):
        if ln.strip() == "## " + heading:
            start = i; break
    if start is None:
        raise SystemExit(f"heading not found: '## {heading}'")
    out, seen_feature = [], False
    for ln in lines[start + 1:]:
        if ln.startswith("### Level "):
            seen_feature = True
        elif ln.startswith("## ") and seen_feature:
            break
        out.append(ln)
    return out

def parse_subclass(lines, heading):
    block = section(lines, heading)
    # intro description = prose before the first `### ` feature heading
    desc_lines, i = [], 0
    while i < len(block) and not block[i].startswith("### "):
        s = block[i].strip()
        if s and not s.startswith("#") and not (s.startswith("*") and s.endswith("*")):  # skip stray headings + italic subtitles
            desc_lines.append(s)
        i += 1
    desc = " ".join(desc_lines).strip()
    # features: `### Level N: Name` then body until the next `### ` / end
    levels = {}
    feat_re = re.compile(r"^### Level (\d+):\s*(.+?)\s*$")
    cur = None
    for ln in block[i:]:
        m = feat_re.match(ln)
        if m:
            if cur:
                cur["text"] = cur["text"].strip()
                levels.setdefault(cur["lvl"], []).append({"name": cur["name"], "text": cur["text"]})
            cur = {"lvl": m.group(1), "name": m.group(2), "text": ""}
        elif cur is not None:
            if not ln.startswith("## "):
                cur["text"] += ln + "\n"
    if cur:
        cur["text"] = cur["text"].strip()
        levels.setdefault(cur["lvl"], []).append({"name": cur["name"], "text": cur["text"]})
    return desc, levels

def main():
    classes_lines = open(CLASSES_MD, encoding="utf-8").read().split("\n")
    feats_lines   = open(FEATS_MD,   encoding="utf-8").read().split("\n")
    prog = {}
    for cls, (src, heading, name) in SUBCLASS.items():
        lines = classes_lines if src == CLASSES_MD else feats_lines
        desc, levels = parse_subclass(lines, heading)
        if not levels:
            raise SystemExit(f"{cls}: no `### Level N:` features parsed under '{heading}'")
        prog[cls] = {"name": name, "desc": desc, "levels": levels}

    header = ("/* GENESIS DATA (generated) — data/subclass-progression.js\n"
              "   The SRD 5.2.1 subclass for each of the 12 base classes: name, intro, and the\n"
              "   features it grants per level (full SRD text). Surfaced by the level-up picker as a\n"
              "   reveal (one subclass per class in the SRD). GENERATED by build/gen-subclass-progression.py\n"
              "   from Reference/SRD-Data/classes.md + character-origins-feats.md — DO NOT hand-edit; edit\n"
              "   the SRD markdown and re-run. Classic <script> (shared global scope); defines\n"
              "   SUBCLASS_PROGRESSION. See docs/ADVANCEMENT.md. */\n")
    body = json.dumps(prog, ensure_ascii=False, indent=1)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header + "const SUBCLASS_PROGRESSION=" + body + ";\n")

    # report
    for cls in SUBCLASS:
        lv = prog[cls]["levels"]
        feats = sum(len(v) for v in lv.values())
        print(f"  {cls:10s} {prog[cls]['name']:24s} levels {sorted(map(int,lv.keys()))} ({feats} features)")
    print(f"\nwrote {OUT} ({os.path.getsize(OUT)} bytes)")

if __name__ == "__main__":
    main()
