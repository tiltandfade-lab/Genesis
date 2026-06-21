#!/usr/bin/env python3
"""Genesis build — generate data/class-progression.js from Reference/SRD-Data/classes.md.

Levels 2-20 advancement data, the load-bearing prerequisite for leveling
(docs/ADVANCEMENT.md). The character creator already wires level 1 (data/srd-creator.js);
this extends every class to 20 so the level-up beat + DM lookups have real numbers.

What it emits, per class, per level 1-20:
  - pb           proficiency bonus (2 + (level-1)//4)
  - features[]   {name, text} for every base-class feature gained at that level,
                 with FULL SRD feature text embedded (the explicit design choice), plus a
                 generic {name:"Subclass feature", subclass:true} marker at the levels the
                 class's subclass grants one.
  - casters get  cantrips / prepared / slots[] (full+half) OR slots+slotLevel+invocations (pact)
  - class resource scalers where canonical + high-confidence (rage, sneak attack, etc.)

METHOD — parse, then validate. The SRD's numeric progression grids survived OCR as
space-separated rows (em-dash = empty). We PARSE them straight from classes.md (faithful to
the edit-source -> compile-artifact discipline), then ASSERT the parsed spell-slot columns
match the authored canonical matrices below — so OCR corruption fails the build loudly rather
than shipping wrong rules data. Ranger's grid is the one too OCR-scrambled to parse, so it is
authored from the (Paladin-validated) half-caster matrix; that substitution is the validation.

Feature names + prose OCR'd cleanly under `### Level N: Name` headings; those are parsed
directly. Subclass-feature levels are read from each class's subclass-section headings.

GENERATED — never hand-edit data/class-progression.js; edit classes.md (source) + re-run this.
Idempotent. Run `python3 build/check-manifest.py` after, then the headless harness.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "Reference", "SRD-Data", "classes.md")
OUT  = os.path.join(ROOT, "data", "class-progression.js")

CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk",
           "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]

# caster kind: full | half | pact | None.  (Subclass casters like Eldritch Knight are not
# base-class casters and are out of scope — only base classes are wired in Genesis.)
CASTER = {"Bard": "full", "Cleric": "full", "Druid": "full", "Sorcerer": "full",
          "Wizard": "full", "Paladin": "half", "Ranger": "half", "Warlock": "pact"}

# ---------------------------------------------------------------------------
# Authored canonical spell-slot matrices — for VALIDATION of the parsed grids.
# These are invariant D&D 5e canon; the parser asserts the SRD grid matches them.
# ---------------------------------------------------------------------------
FULL_SLOTS = {  # level -> [slots for spell levels 1..9]
    1:[2,0,0,0,0,0,0,0,0],  2:[3,0,0,0,0,0,0,0,0],  3:[4,2,0,0,0,0,0,0,0],
    4:[4,3,0,0,0,0,0,0,0],  5:[4,3,2,0,0,0,0,0,0],  6:[4,3,3,0,0,0,0,0,0],
    7:[4,3,3,1,0,0,0,0,0],  8:[4,3,3,2,0,0,0,0,0],  9:[4,3,3,3,1,0,0,0,0],
    10:[4,3,3,3,2,0,0,0,0], 11:[4,3,3,3,2,1,0,0,0], 12:[4,3,3,3,2,1,0,0,0],
    13:[4,3,3,3,2,1,1,0,0], 14:[4,3,3,3,2,1,1,0,0], 15:[4,3,3,3,2,1,1,1,0],
    16:[4,3,3,3,2,1,1,1,0], 17:[4,3,3,3,2,1,1,1,1], 18:[4,3,3,3,3,1,1,1,1],
    19:[4,3,3,3,3,2,1,1,1], 20:[4,3,3,3,3,2,2,1,1],
}
HALF_SLOTS = {  # level -> [slots for spell levels 1..5]  (2024: half-casters cast from L1)
    1:[2,0,0,0,0],  2:[2,0,0,0,0],  3:[3,0,0,0,0],  4:[3,0,0,0,0],  5:[4,2,0,0,0],
    6:[4,2,0,0,0],  7:[4,3,0,0,0],  8:[4,3,0,0,0],  9:[4,3,2,0,0],  10:[4,3,2,0,0],
    11:[4,3,3,0,0], 12:[4,3,3,0,0], 13:[4,3,3,1,0], 14:[4,3,3,1,0], 15:[4,3,3,2,0],
    16:[4,3,3,2,0], 17:[4,3,3,3,1], 18:[4,3,3,3,1], 19:[4,3,3,3,2], 20:[4,3,3,3,2],
}
PACT_SLOTS = {  # level -> (slots, slot-level)
    1:(1,1), 2:(2,1), 3:(2,2), 4:(2,2), 5:(2,3), 6:(2,3), 7:(2,4), 8:(2,4),
    9:(2,5), 10:(2,5), 11:(3,5), 12:(3,5), 13:(3,5), 14:(3,5), 15:(3,5), 16:(3,5),
    17:(4,5), 18:(4,5), 19:(4,5), 20:(4,5),
}
# Ranger has no parseable grid -> authored from the half-caster canon (the substitution IS
# the validation: half-casters are identical, and Paladin's grid validates HALF_SLOTS).
HALF_PREPARED = [2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15]


def pb(level):
    return 2 + (level - 1) // 4


def steps(spec):
    """Expand {breakpoint_level: value} into a per-level (1..20) dict, carrying forward."""
    out, cur = {}, None
    for lv in range(1, 21):
        if lv in spec:
            cur = spec[lv]
        if cur is not None:
            out[lv] = cur
    return out


# Recurring features the SRD prints only once (at first appearance) but the summary table
# repeats at later levels. The summary OCR is too corrupted to parse reliably (Fighter's lost
# its level column entirely), so these are handled as canonical 2024 constants and verified by
# the harness. Each reuses the first-appearance prose text.
ASI_LEVELS = {c: [8, 12, 16] for c in CLASSES}      # L4 already comes from prose
ASI_LEVELS["Fighter"] = [6, 8, 12, 14, 16]          # Fighter gains extra ASIs at 6 + 14
# (level, display-name, prose-feature-to-borrow-text-from)
REPEAT_FEATURES = {
    "Bard":     [(9, "Expertise", "Expertise")],
    "Rogue":    [(6, "Expertise", "Expertise")],
    "Sorcerer": [(10, "Metamagic", "Metamagic"), (17, "Metamagic", "Metamagic")],
    "Warlock":  [(13, "Mystic Arcanum (level 7 spell)", "Mystic Arcanum (level 6 spell)"),
                 (15, "Mystic Arcanum (level 8 spell)", "Mystic Arcanum (level 6 spell)"),
                 (17, "Mystic Arcanum (level 9 spell)", "Mystic Arcanum (level 6 spell)")],
}
# Wizard's subclass section isn't present in the SRD classes.md, so its repeat subclass-feature
# levels can't be parsed — canonical fallback (Wizard gains subclass features at 3/6/10/14).
SUBCLASS_FALLBACK = {"Wizard": [6, 10, 14]}

# Per-class resource scalers — authored, restricted to canonical + high-confidence values.
# Anything uncertain is deliberately omitted (the embedded feature text still carries it).
RESOURCES = {
    "Barbarian": {"rages": steps({1:2, 3:3, 6:4, 12:5, 17:6}),
                  "rageDamage": steps({1:2, 9:3, 16:4})},
    "Bard":      {"bardicInspirationDie": steps({1:"d6", 5:"d8", 10:"d10", 15:"d12"})},
    "Fighter":   {"actionSurge": steps({2:1, 17:2}),
                  "indomitable": steps({9:1, 13:2, 17:3})},
    "Monk":      {"martialArtsDie": steps({1:"d6", 5:"d8", 11:"d10", 17:"d12"}),
                  "focusPoints": {lv: lv for lv in range(2, 21)},
                  "unarmoredMovement": steps({2:10, 6:15, 10:20, 14:25, 18:30})},
    "Rogue":     {"sneakAttackDice": {lv: (lv + 1) // 2 for lv in range(1, 21)}},
    "Sorcerer":  {"sorceryPoints": {lv: lv for lv in range(2, 21)}},
}


# ---------------------------------------------------------------------------
# Parsing classes.md
# ---------------------------------------------------------------------------
DASHES = {"—", "–", "-", "−"}


def is_grid_row(line):
    toks = line.split()
    return len(toks) >= 5 and all(t in DASHES or t.isdigit() for t in toks)


def grid_tokens(line):
    return [0 if t in DASHES else int(t) for t in line.split()]


def is_slot_header(line):
    s = line.strip()
    if "Spell Slots per Spell Level" in s:
        return True
    if s.startswith("Cantrips ") and all(t.isdigit() for t in s.split()[1:]):
        return True
    return False


def load_lines():
    return open(SRC, encoding="utf-8").read().split("\n")


def section_bounds(lines):
    """Map class -> (class_start, next_class_start) line indices."""
    starts = {}
    cls_re = re.compile(r"^##\s+(" + "|".join(CLASSES) + r")\b")
    for i, ln in enumerate(lines):
        m = cls_re.match(ln)
        if m:
            c = m.group(1)
            # the first bare "## {Class}" (intro), not "## {Class} Class Features" etc.
            if c not in starts and ln.strip() in ("## " + c, "## " + c + " …", "## " + c + " ..."):
                starts[c] = i
    # fallback: earliest "## {Class}" occurrence
    for c in CLASSES:
        if c not in starts:
            for i, ln in enumerate(lines):
                if cls_re.match(ln) and cls_re.match(ln).group(1) == c:
                    starts[c] = i
                    break
    ordered = sorted(starts.items(), key=lambda kv: kv[1])
    bounds = {}
    for idx, (c, s) in enumerate(ordered):
        end = ordered[idx + 1][1] if idx + 1 < len(ordered) else len(lines)
        bounds[c] = (s, end)
    return bounds


def parse_features(lines, c, lo, hi):
    """Base-class features: {level: [{name, text}]} from the `## {c} Class Features` block."""
    feat_start = None
    for i in range(lo, hi):
        if lines[i].strip() == f"## {c} Class Features":
            feat_start = i
            break
    if feat_start is None:
        return {}
    # block ends at the next "## " heading
    feat_end = hi
    for i in range(feat_start + 1, hi):
        if lines[i].startswith("## "):
            feat_end = i
            break
    head_re = re.compile(r"^###\s+Level\s+(\d+):\s+(.*)$")
    # collect heading positions
    heads = [(i, int(head_re.match(lines[i]).group(1)), head_re.match(lines[i]).group(2).strip())
             for i in range(feat_start, feat_end) if head_re.match(lines[i])]
    bylevel = {}
    for k, (i, lvl, name) in enumerate(heads):
        body_end = heads[k + 1][0] if k + 1 < len(heads) else feat_end
        raw = lines[i + 1:body_end]
        # drop OCR grid-table noise embedded in the (Spellcasting) feature text
        kept = [ln.strip() for ln in raw
                if not is_grid_row(ln) and not is_slot_header(ln)]
        text = "\n".join(kept)
        text = re.sub(r"\n{3,}", "\n\n", text).strip()
        bylevel.setdefault(lvl, []).append({"name": name, "text": text})
    return bylevel


def parse_subclass_levels(lines, c, lo, hi):
    """Levels (besides 3) at which the class's subclass grants a feature."""
    sub_start = None
    for i in range(lo, hi):
        if lines[i].startswith(f"## {c} Subclass"):
            sub_start = i
            break
    if sub_start is None:
        return []
    head_re = re.compile(r"^###\s+Level\s+(\d+):")
    levels = sorted({int(head_re.match(lines[i]).group(1))
                     for i in range(sub_start, hi) if head_re.match(lines[i])})
    return [lv for lv in levels if lv != 3]


def parse_grid(lines, lo, hi, ncols):
    """First run of 20 consecutive `ncols`-token numeric rows -> list of 20 token-lists."""
    rows, run = [], []
    for i in range(lo, hi):
        ln = lines[i]
        if ln.strip() == "":
            continue
        if is_grid_row(ln) and len(ln.split()) == ncols:
            run.append(grid_tokens(ln))
            if len(run) == 20:
                return run
        else:
            run = []
    return None


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
def build():
    lines = load_lines()
    bounds = section_bounds(lines)
    prog = {}
    report = []

    for c in CLASSES:
        lo, hi = bounds[c]
        features = parse_features(lines, c, lo, hi)
        prose_text = {f["name"]: f["text"] for fl in features.values() for f in fl}
        sub_levels = set(parse_subclass_levels(lines, c, lo, hi) or SUBCLASS_FALLBACK.get(c, []))
        kind = CASTER.get(c)
        res = RESOURCES.get(c, {})

        # ---- spellcasting numbers (parse + validate) ----
        cantrips = prepared = slots = slotlevel = invocations = None
        if kind == "full":
            grid = parse_grid(lines, lo, hi, 11)   # [cantrips, prepared, s1..s9]
            assert grid, f"{c}: full-caster grid not found"
            cantrips = {lv + 1: grid[lv][0] for lv in range(20)}
            prepared = {lv + 1: grid[lv][1] for lv in range(20)}
            slots    = {lv + 1: grid[lv][2:11] for lv in range(20)}
            for lv in range(1, 21):
                assert slots[lv] == FULL_SLOTS[lv], f"{c} L{lv}: slot mismatch {slots[lv]} vs {FULL_SLOTS[lv]}"
            report.append(f"  {c:9s} full  — grid parsed + slots validated")
        elif kind == "half" and c == "Paladin":
            grid = parse_grid(lines, lo, hi, 7)    # [channelDivinity, prepared, s1..s5]
            assert grid, f"{c}: half-caster grid not found"
            prepared = {lv + 1: grid[lv][1] for lv in range(20)}
            slots    = {lv + 1: grid[lv][2:7] for lv in range(20)}
            for lv in range(1, 21):
                assert slots[lv] == HALF_SLOTS[lv], f"{c} L{lv}: slot mismatch {slots[lv]} vs {HALF_SLOTS[lv]}"
            res = dict(res, channelDivinity=steps({3: grid[2][0] or 2}))
            report.append(f"  {c:9s} half  — grid parsed + slots validated")
        elif kind == "half":  # Ranger — OCR-scrambled grid -> authored from validated half canon
            prepared = {lv: HALF_PREPARED[lv - 1] for lv in range(1, 21)}
            slots    = {lv: HALF_SLOTS[lv] for lv in range(1, 21)}
            report.append(f"  {c:9s} half  — authored from Paladin-validated half-caster canon")
        elif kind == "pact":
            grid = parse_grid(lines, lo, hi, 5)    # [invocations, cantrips, prepared, slots, slotLevel]
            assert grid, f"{c}: pact grid not found"
            invocations = {lv + 1: grid[lv][0] for lv in range(20)}
            cantrips    = {lv + 1: grid[lv][1] for lv in range(20)}
            prepared    = {lv + 1: grid[lv][2] for lv in range(20)}
            slots       = {lv + 1: grid[lv][3] for lv in range(20)}
            slotlevel   = {lv + 1: grid[lv][4] for lv in range(20)}
            for lv in range(1, 21):
                assert (slots[lv], slotlevel[lv]) == PACT_SLOTS[lv], \
                    f"{c} L{lv}: pact mismatch {(slots[lv], slotlevel[lv])} vs {PACT_SLOTS[lv]}"
            res = dict(res, invocationsKnown=invocations)
            report.append(f"  {c:9s} pact  — grid parsed + slots validated")
        else:
            report.append(f"  {c:9s} martial — no spellcasting")

        # ---- assemble per-level ----
        levels = {}
        for lv in range(1, 21):
            entry = {"pb": pb(lv)}
            feats = list(features.get(lv, []))
            # recurring ASI at the canonical later levels (L4 already in prose)
            if lv in ASI_LEVELS.get(c, []):
                feats.append({"name": "Ability Score Improvement",
                              "text": prose_text.get("Ability Score Improvement", ""),
                              "repeat": True})
            # other canonical recurrences (Expertise/Metamagic/Mystic Arcanum)
            for rlv, disp, src in REPEAT_FEATURES.get(c, []):
                if rlv == lv:
                    feats.append({"name": disp, "text": prose_text.get(src, ""), "repeat": True})
            if lv in sub_levels:
                feats.append({"name": "Subclass feature",
                              "text": "You gain a feature granted by your subclass at this level.",
                              "subclass": True})
            # dedup by name, preserve order
            seen, deduped = set(), []
            for f in feats:
                if f["name"] not in seen:
                    seen.add(f["name"]); deduped.append(f)
            entry["features"] = deduped
            if kind:
                if cantrips is not None and cantrips.get(lv):
                    entry["cantrips"] = cantrips[lv]
                if prepared is not None:
                    entry["prepared"] = prepared[lv]
                if kind == "pact":
                    entry["pactSlots"] = slots[lv]
                    entry["pactSlotLevel"] = slotlevel[lv]
                else:
                    entry["slots"] = slots[lv]
                # Wizard prepares from a spellbook: prepared (the grid column) is the castable
                # set; the book itself starts at 6 and gains 2 spells per Wizard level (2024).
                if c == "Wizard":
                    entry["spellbook"] = 6 + 2 * (lv - 1)
            for rname, rmap in res.items():
                if lv in rmap:
                    entry[rname] = rmap[lv]
            levels[lv] = entry

        prog[c] = {"caster": kind, "levels": levels}

    return prog, report


def emit(prog):
    header = (
        "/* GENESIS DATA (generated) — data/class-progression.js\n"
        "   Levels 1-20 advancement for all 12 base classes: proficiency bonus, features\n"
        "   (with full SRD text), spell slots / cantrips / prepared counts, and class resource\n"
        "   scalers. The load-bearing data for leveling — see docs/ADVANCEMENT.md.\n"
        "   GENERATED by build/gen-class-progression.py from Reference/SRD-Data/classes.md —\n"
        "   DO NOT hand-edit; edit the source and re-run. Classic <script> (shared global\n"
        "   scope); defines CLASS_PROGRESSION. Level 1 reconciles with data/srd-creator.js. */\n"
    )
    body = json.dumps(prog, ensure_ascii=False, indent=1)
    js = header + "const CLASS_PROGRESSION=" + body + ";\n"
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(js)


def main():
    prog, report = build()
    emit(prog)
    print("\n".join(report))
    nfeat = sum(len(l["features"]) for c in prog.values() for l in c["levels"].values())
    size = os.path.getsize(OUT)
    print(f"\nwrote {OUT}: {len(prog)} classes x 20 levels, {nfeat} feature entries, {size//1024} KB")


if __name__ == "__main__":
    main()
