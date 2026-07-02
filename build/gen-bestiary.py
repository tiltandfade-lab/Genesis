#!/usr/bin/env python3
"""Genesis build — generate data/bestiary.js from Asset Library/Monsters & Enemies/*.md.

The fix for *creature = dead name-string* (docs/COMBAT.md, Layer 1). Parses the 374
hand-authored monster stat blocks into a queryable runtime index the combat resolver
(src/engine/combat.js) and the threat→stat-block resolver read. One entry per stat block
(multi-block files like Animated Objects.md emit one entry per `### N. Name` block).

What it emits, per stat block:
  id, name, cr, xp, size, typeline, alignment,
  ac, hp, hpFormula, speed, init,
  abilities {str,dex,con,int,wis,cha}  (score + mod),
  pb, pp, saves{}, skills{}, senses, languages,
  resist[], immune[], vuln[], condImmune[]   (damage/condition tokens, parsed best-effort),
  actions[], bonus[], reactions[], legendary[], traits[]   ({name, atk, reach, range,
     dmg:[{n,die,bonus,type}], saveDC, saveAbility, recharge, kind, text}),
  customTables[]  ({heading, die, rows})  — Adam's SACRED hand-authored d-tables, carried
     VERBATIM and never mechanized (the engine surfaces them to the DM; it never rolls them),
  role, habitat[], treasure, activity[], factionFit[]   (file-level frontmatter),
  tags{type,size,habitat}   — WALK-REFRESH §1: derived (never authored) — type/size parsed off the
     typeline, habitat a best-effort name/type keyword heuristic (absent = no habitat filter, soft
     preference only, never a hard gate). Feeds resolveArchetypePool (src/engine/walk-archetypes.js).

ALWAYS-parseable (asserted by dev/verify-combat.mjs): name, cr, ac, hp, abilities.
Attacks are best-effort — a stat block too freeform to parse an attack still carries its
numbers + raw action text, and the resolver falls back to "DM reads the text, calls
resolveAttack with the numbers." No monster is dropped for an unparseable trait.

GENERATED — never hand-edit data/bestiary.js; edit the monster source + re-run this.
Idempotent. Run `python3 build/check-manifest.py` after, then dev/verify-combat.mjs.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "Asset Library", "Monsters & Enemies")
OUT  = os.path.join(ROOT, "data", "bestiary.js")

DMG_TYPES = {"acid","bludgeoning","cold","fire","force","lightning","necrotic",
             "piercing","poison","psychic","radiant","slashing","thunder"}
ABILS = ["str","dex","con","int","wis","cha"]


def slugify(s):
    # MUST stay byte-identical to JS cmSlug (src/engine/combat.js) — it produces the id; cmSlug consumes it
    # at lookup time, so any divergence makes name lookups silently miss and fall to the CR-band fallback.
    s = re.sub(r"^\s*\d+\.\s*", "", s.strip())          # strip "1. " block numbering
    s = s.lower()
    s = re.sub(r"^(the|a|an)\s+", "", s)                # strip a leading article (matches cmSlug)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def amod(score):
    return (score - 10) // 2 if score is not None else None


# WALK-REFRESH §1 — best-effort habitat keyword heuristic off name+type. Soft preference only (a miss
# just means no habitat tag, never a hard gate downstream — resolveArchetypePool treats it as optional).
HABITAT_KEYWORDS = [
    ("underdark", re.compile(r"\b(underdark|deep gnome|drow|mind flayer|illithid|umber hulk|grimlock|troglodyte|myconid)\b", re.I)),
    ("aquatic",   re.compile(r"\b(shark|kraken|merfolk|sahuagin|eel|octopus|squid|reef|tide|water elemental|aquatic|sea)\b", re.I)),
    ("arctic",    re.compile(r"\b(frost|ice|glacier|yeti|white dragon|remorhaz|winter|snow)\b", re.I)),
    ("desert",    re.compile(r"\b(desert|sand|dune|scorpion|mummy|blue dragon)\b", re.I)),
    ("swamp",     re.compile(r"\b(swamp|bog|black dragon|bullywug|lizardfolk|will-o-wisp|marsh)\b", re.I)),
    ("forest",    re.compile(r"\b(forest|wood|treant|dryad|green dragon|owlbear|blight|spider)\b", re.I)),
    ("mountain",  re.compile(r"\b(mountain|peak|griffon|roc|stone giant|cliff|crag)\b", re.I)),
    ("urban",     re.compile(r"\b(bandit|thug|guard|assassin|cultist|noble|spy|thief|cutpurse|gladiator)\b", re.I)),
    ("planar",    re.compile(r"\b(demon|devil|elemental|angel|celestial|fiend|yugoloth|modron|slaad)\b", re.I)),
    ("undead",    re.compile(r"\b(undead|zombie|skeleton|ghoul|ghost|wraith|lich|vampire|specter|wight)\b", re.I)),
]


def derive_habitat(name, typeline):
    hay = f"{name} {typeline or ''}"
    for tag, rx in HABITAT_KEYWORDS:
        if rx.search(hay):
            return tag
    return None


def derive_type_tag(typeline):
    """Type token off the typeline (e.g. 'Medium Elemental, Neutral' -> 'elemental';
    'Large Beast (Dinosaur), Unaligned' -> 'beast'). None if unparseable."""
    if not typeline:
        return None
    m = re.match(r"^\s*(?:Tiny|Small|Medium|Large|Huge|Gargantuan)(?:\s+or\s+(?:Tiny|Small|Medium|Large|Huge|Gargantuan))?\s+([A-Za-z]+)", typeline)
    return m.group(1).lower() if m else None


def derive_tags(name, typeline, size):
    return {
        "type": derive_type_tag(typeline),
        "size": (size or "").split()[0].lower() if size else None,
        "habitat": derive_habitat(name, typeline),
    }


def parse_cr(s):
    s = (s or "").strip()
    return {"1/8": 0.125, "1/4": 0.25, "1/2": 0.5}.get(s, None) or (
        float(s) if re.match(r"^\d+(\.\d+)?$", s) else None)


def parse_frontmatter(text):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not m:
        return {}, text
    fm, body = {}, text[m.end():]
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        k, v = k.strip(), v.strip()
        if v.startswith("[") and v.endswith("]"):
            v = [x.strip() for x in v[1:-1].split(",") if x.strip()]
        fm[k] = v
    return fm, body


def split_damage(raw):
    """A '... Resistances/Immunities/Vulnerabilities:' value → (dmg_tokens, cond_tokens)."""
    dmg, cond = [], []
    for tok in re.split(r"[;,]", raw or ""):
        t = tok.strip().lower()
        t = re.sub(r"\s*\(.*?\)\s*", "", t)                 # drop "(blind beyond...)" notes
        t = re.sub(r"\bdamage\b", "", t).strip()
        t = re.sub(r"^(and|from)\s+", "", t)
        head = t.split()[0] if t.split() else ""
        if head in DMG_TYPES:
            dmg.append(head)
        elif t and "nonmagical" not in t and "magical" not in t:
            cond.append(t)
    return dmg, cond


def parse_damage_clauses(text):
    """All '7 (2d6 + 3) poison' / '1 Piercing' clauses → [{n,die,bonus,type}]."""
    out = []
    for m in re.finditer(r"\((\d+)d(\d+)(?:\s*([+-])\s*(\d+))?\)\s*([A-Za-z]+)", text):
        n, die, sign, bonus, typ = m.groups()
        b = (int(bonus) if bonus else 0) * (-1 if sign == "-" else 1)
        typ = typ.lower()
        out.append({"n": int(n), "die": int(die), "bonus": b,
                    "type": typ if typ in DMG_TYPES else None})
    if not out:  # flat, diceless: "Hit: 1 Piercing damage"
        m = re.search(r"Hit:\s*\*?_?\s*(\d+)\s+([A-Za-z]+)\s+damage", text)
        if m:
            typ = m.group(2).lower()
            out.append({"n": 0, "die": 0, "bonus": int(m.group(1)),
                        "type": typ if typ in DMG_TYPES else None})
    return out


def norm_minus(s):
    """SRD 2024 files use U+2212 minus / en-dash for negatives — fold to ASCII for parsing.
    (Operates on a working copy; the verbatim customTables are extracted separately + untouched.)"""
    return s.replace("−", "-").replace("–", "-")


def parse_action(text):
    text = norm_minus(text)
    a = {"text": text.strip()}
    nm = re.match(r"\s*\*\*(.+?)[.:]\*\*", text)
    if nm:
        a["name"] = nm.group(1).strip()
    mh = re.search(r"Attack Roll:\s*([+-]\d+)", text) or re.search(r"([+-]\d+)\s*to hit", text)
    if mh:
        a["atk"] = int(mh.group(1))
    mr = re.search(r"reach\s*(\d+)\s*ft", text, re.I)
    if mr:
        a["reach"] = int(mr.group(1))
    mn = re.search(r"range\s*(\d+)(?:/(\d+))?\s*ft", text, re.I)
    if mn:
        a["range"] = int(mn.group(1))
    dmg = parse_damage_clauses(text)
    if dmg:
        a["dmg"] = dmg
    ms = re.search(r"DC\s*(\d+)\s*([A-Za-z]+)\s+saving throw", text, re.I) or \
         re.search(r"([A-Za-z]+) Saving Throw:\s*DC\s*(\d+)", text)
    if ms:
        g = ms.groups()
        if g[0].isdigit():
            a["saveDC"], a["saveAbility"] = int(g[0]), g[1].lower()[:3]
        else:
            a["saveDC"], a["saveAbility"] = int(g[1]), g[0].lower()[:3]
    mrc = re.search(r"\(Recharge\s*([0-9–\-]+)\)", text)
    if mrc:
        a["recharge"] = mrc.group(1)
    mpd = re.search(r"\((\d+/Day)\)", text)
    if mpd:
        a["perDay"] = mpd.group(1)
    if "Melee" in text:
        a["kind"] = "melee"
    elif "Ranged" in text or a.get("range"):
        a["kind"] = "ranged"
    elif a.get("saveDC"):
        a["kind"] = "save"
    else:
        a["kind"] = "other"
    return a


SECTION_HEADS = ["Traits", "Actions", "Bonus Actions", "Reactions", "Legendary Actions"]
SEC_KEY = {"Traits": "traits", "Actions": "actions", "Bonus Actions": "bonus",
           "Reactions": "reactions", "Legendary Actions": "legendary"}


def parse_sections(body):
    """Body after the stat header → {traits,actions,bonus,reactions,legendary} lists.
    Recognizes both `**Actions**` (SRD) and `### Actions` (Adam's custom) section markers."""
    out = {v: [] for v in SEC_KEY.values()}
    heads = "|".join(SECTION_HEADS)
    markers = [(m.start(), m.group(1) or m.group(2)) for m in
               re.finditer(r"(?:\*\*(" + heads + r")\*\*|^#+\s*(" + heads + r")\s*$)", body, re.M)]
    for i, (pos, name) in enumerate(markers):
        end = markers[i + 1][0] if i + 1 < len(markers) else len(body)
        chunk = body[pos:end]
        # bullet items: "- **Name.**/:** ..." possibly spanning wrapped lines
        items = re.split(r"\n-\s+(?=\*\*)", "\n" + chunk)
        for it in items:
            if "**" not in it or it.strip().startswith("**" + name):
                continue
            out[SEC_KEY[name]].append(parse_action(it))
    return out


def parse_statblock(name, sec):
    """sec = the markdown of one `### Name` block. Returns an entry dict or None."""
    sec = norm_minus(sec)
    if not re.search(r"\*\*(?:Armor Class|AC):\*\*", sec) and \
       not re.search(r"\*\*(?:Hit Points|HP):\*\*", sec):
        return None
    e = {"name": re.sub(r"^\s*\d+\.\s*", "", name).strip()}
    e["id"] = slugify(name)

    tl = re.search(r"^_(.+?)_\s*$", sec, re.M)
    if tl:
        e["typeline"] = tl.group(1).strip()
        parts = [p.strip() for p in re.split(r",", e["typeline"])]
        e["size"] = e["typeline"].split()[0]
        if len(parts) > 1:
            e["alignment"] = parts[-1]

    m = re.search(r"\*\*(?:Armor Class|AC):\*\*\s*(\d+)", sec);  e["ac"] = int(m.group(1)) if m else None
    m = re.search(r"\*\*(?:Hit Points|HP):\*\*\s*(\d+)\s*(?:\(([^)]*)\))?", sec)
    if m:
        e["hp"] = int(m.group(1)); e["hpFormula"] = (m.group(2) or "").strip()
    m = re.search(r"\*\*Initiative:\*\*\s*([+-]\d+)", sec)
    if m:
        e["init"] = int(m.group(1))
    m = re.search(r"\*\*Speed:\*\*\s*([^\n]+)", sec);       e["speed"] = m.group(1).strip() if m else None

    ab = {}
    for a in ABILS:
        # one pattern for all three forms: `**STR:**`, `**STR**` (roster files), bare `STR`
        m = re.search(r"\*{0,2}" + a.upper() + r":?\*{0,2}\s*(\d+)\s*\(([+-]?\d+)\)", sec)
        if m:
            ab[a] = {"score": int(m.group(1)), "mod": int(m.group(2))}
    e["abilities"] = ab
    if "init" not in e and "dex" in ab:
        e["init"] = ab["dex"]["mod"]

    m = re.search(r"\*\*(?:Challenge|CR):\*\*\s*([0-9/]+)\s*(?:\(([\d,]+)\s*XP\))?", sec)
    if m:
        e["cr"] = parse_cr(m.group(1))
        e["xp"] = int(m.group(2).replace(",", "")) if m.group(2) else None
    m = re.search(r"\*\*Proficiency Bonus:\*\*\s*\+?(\d+)", sec); e["pb"] = int(m.group(1)) if m else None
    m = re.search(r"passive Perception\s*(\d+)", sec, re.I);     e["pp"] = int(m.group(1)) if m else None

    m = re.search(r"\*\*Saving Throws:\*\*\s*([^\n]+)", sec)
    if m:
        saves = {}
        for sm in re.finditer(r"([A-Za-z]{3})\s*([+-]\d+)", m.group(1)):
            saves[sm.group(1).lower()] = int(sm.group(2))
        e["saves"] = saves
    m = re.search(r"\*\*Skills:\*\*\s*([^\n]+)", sec)
    if m:
        e["skills"] = m.group(1).strip()
    m = re.search(r"\*\*Senses:\*\*\s*([^\n]+)", sec)
    if m:
        e["senses"] = m.group(1).strip()
    m = re.search(r"\*\*Languages:\*\*\s*([^\n]+)", sec)
    if m:
        e["languages"] = m.group(1).strip()

    resist, immune, vuln, cond = [], [], [], []
    m = re.search(r"\*\*(?:Damage )?Resistances:\*\*\s*([^\n]+)", sec)
    if m:
        resist, _ = split_damage(m.group(1))
    m = re.search(r"\*\*(?:Damage )?Vulnerabilities:\*\*\s*([^\n]+)", sec)
    if m:
        vuln, _ = split_damage(m.group(1))
    m = re.search(r"\*\*Condition Immunities:\*\*\s*([^\n]+)", sec)
    if m:
        _, cond = split_damage(m.group(1))
    m = re.search(r"\*\*(?:Damage )?Immunities:\*\*\s*([^\n]+)", sec)
    if m:
        di, ci = split_damage(m.group(1))
        immune += di; cond += ci
    e["resist"], e["immune"], e["vuln"], e["condImmune"] = resist, immune, vuln, cond

    e.update(parse_sections(sec))
    return e


def parse_custom_table(heading, sec):
    """A `### d10 …` flavor section → {heading, die, rows} carried VERBATIM."""
    die = None
    dm = re.match(r"\s*(d\d+|\d+d\d+)\b", heading, re.I)
    if dm:
        die = dm.group(1)
    rows = [ln.rstrip() for ln in sec.splitlines() if ln.strip().startswith("|")]
    if not rows:
        return None
    return {"heading": heading.strip(), "die": die, "rows": rows}


def is_table_section(heading, sec):
    # the drop-guard must be at least as wide as parse_statblock's stat detection (both AC forms), or a
    # custom-format stat block (`**AC:**`) that happens to contain a pipe could be misrouted + dropped.
    if re.search(r"\*\*(?:Armor Class|AC):\*\*", sec) or re.search(r"^_.+,.+_\s*$", sec, re.M):
        return False
    return bool(re.match(r"\s*\d*d\d+\b", heading, re.I)) or "|" in sec


def main():
    files = sorted(f for f in os.listdir(SRC) if f.endswith(".md"))
    bestiary, by_cr = {}, {}
    stats = {"files": len(files), "blocks": 0, "ac": 0, "hp": 0, "cr": 0,
             "abil": 0, "withAttack": 0, "tables": 0, "noStat": []}

    for fn in files:
        text = open(os.path.join(SRC, fn), encoding="utf-8").read()
        fm, body = parse_frontmatter(text)
        file_meta = {
            "role": fm.get("role"), "habitat": fm.get("habitat", []),
            "treasure": fm.get("treasure"), "activity": fm.get("activity", []),
            "factionFit": fm.get("faction_fit", []),
        }
        # split into `### Name` sections; text before the first heading is intro prose
        sections = re.split(r"\n###\s+", "\n" + body)
        blocks, tables = [], []
        for raw in sections[1:]:
            nl = raw.find("\n")
            heading = raw[:nl] if nl >= 0 else raw
            sec = raw[nl + 1:] if nl >= 0 else ""
            if is_table_section(heading, sec):
                t = parse_custom_table(heading, sec)
                if t:
                    tables.append(t)
                continue
            sb = parse_statblock(heading, sec)
            if sb:
                blocks.append(sb)

        if not blocks:  # Adam's custom format: one block under an H1, no `### Name` heading
            h1 = re.search(r"^#\s+(.+)$", body, re.M)
            name = h1.group(1).strip() if h1 else fn[:-3]
            sb = parse_statblock(name, body)
            if sb:
                blocks.append(sb)

        if tables:
            stats["tables"] += len(tables)
        if not blocks:
            stats["noStat"].append(fn)
            continue

        for sb in blocks:
            sb.update(file_meta)
            if tables:
                sb["customTables"] = tables          # file-level tables, surfaced per block
            if sb.get("cr") is None:                  # fall back to file headline CR
                sb["cr"] = parse_cr(fm.get("cr", ""))
            sb["tags"] = derive_tags(sb.get("name"), sb.get("typeline"), sb.get("size"))
            key = sb["id"] or slugify(fn[:-3])
            if key in bestiary:                       # de-dupe deterministically, but SURFACE it — a
                # suffixed id is not name-resolvable (resolveCreature falls to the CR band), so a real
                # duplicate hiding here would silently lose its stats. Visible, not silent.
                print(f"  ⚠ id collision '{key}' ({fn}) — suffixing '-x' (check for a true duplicate)")
                while key in bestiary: key += "-x"
            sb["id"] = key
            bestiary[key] = sb
            stats["blocks"] += 1
            if sb.get("ac") is not None:  stats["ac"] += 1
            if sb.get("hp") is not None:  stats["hp"] += 1
            if sb.get("cr") is not None:  stats["cr"] += 1
            if sb.get("abilities"):       stats["abil"] += 1
            if any(a.get("atk") is not None or a.get("dmg") for a in sb.get("actions", [])):
                stats["withAttack"] += 1
            crk = ("%g" % sb["cr"]) if sb.get("cr") is not None else "?"
            by_cr.setdefault(crk, []).append(key)

    header = ("/* GENESIS DATA (generated) — data/bestiary.js\n"
              "   Runtime monster index parsed from Asset Library/Monsters & Enemies/*.md — the stat\n"
              "   layer the combat resolver (src/engine/combat.js) + the threat→stat-block resolver\n"
              "   read (docs/COMBAT.md, Layer 1). One entry per stat block. Adam's hand-authored custom\n"
              "   d-tables are carried VERBATIM as customTables and never mechanized.\n"
              "   GENERATED by build/gen-bestiary.py — DO NOT hand-edit; edit the monster source + re-run.\n"
              "   Classic <script> (shared global scope); defines BESTIARY + BESTIARY_BY_CR. */\n")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("const BESTIARY=" + json.dumps(bestiary, ensure_ascii=False, indent=1) + ";\n")
        f.write("const BESTIARY_BY_CR=" + json.dumps(by_cr, ensure_ascii=False, indent=1) + ";\n")

    print(f"  files={stats['files']}  blocks={stats['blocks']}  customTables={stats['tables']}")
    print(f"  parsed: AC={stats['ac']}  HP={stats['hp']}  CR={stats['cr']}  "
          f"abilities={stats['abil']}  withAttack={stats['withAttack']}")
    if stats["noStat"]:
        print(f"  ⚠ {len(stats['noStat'])} files yielded NO stat block: {', '.join(stats['noStat'][:12])}"
              + (" …" if len(stats['noStat']) > 12 else ""))
    print(f"  → {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
