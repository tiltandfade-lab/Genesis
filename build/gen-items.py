#!/usr/bin/env python3
"""Genesis build — generate data/items.js (docs/ITEMS.md, the type/instance split for gear).

The fix for *item = dead name-string* — the same problem gen-bestiary.py solved for monsters,
reapplied to gear. Parses real SRD data (already structured for weapons/armor, table-shaped
prose for adventuring gear) into a queryable runtime index `ITEMS_BY_NAME`. `sheet.inventory`
INSTANCES resolve their `name` against this index for objective facts (damage/AC/weight/cost/
properties); the index never mutates at runtime. Also emits `ITEM_CONDITIONS` (the fixed
per-instance status vocabulary) and `PACK_EXPANSIONS` (each SRD starting-equipment pack resolved
to its real individual line items, replacing the old bundled-string `PACK_CONTENTS` model — every
pack item is its own thing with its own properties, not flavor text under one umbrella entry).

Sources:
  Reference/SRD-Data/equipment-weapons-armor.json   weapons (38) + armor (13) — already
                                                      structured JSON, no parsing needed.
  Reference/SRD-Data/equipment.md                    the real "Adventuring Gear" table (prose,
                                                      regex-parsed: name/weight/cost) + the
                                                      "Ammunition" sub-table (name/amount/weight/
                                                      cost — divided to a per-unit basis).
  data/srd-creator.js  (PACK_CONTENTS)                the 7 starting-equipment packs' item-name
                                                      strings, re-parsed into {name,qty} pairs and
                                                      resolved against the gear/weapon/armor index.

Unindexed names degrade gracefully — they still become their own real instance (no mechanical
data, flavor-only), never dropped, never invented. No fuzzy aliasing beyond what the existing
codebase already does elsewhere (exact match → naive plural-strip → substring-contains, the same
`packOf()`/`findClockTarget()` house style) — an item that doesn't resolve just stays flavor-only,
honestly, rather than risk a wrong mechanical guess.

GENERATED — never hand-edit data/items.js; edit this generator (or the SRD source) + re-run.
Idempotent. Run `python3 build/check-manifest.py` after, then dev/verify-items.mjs.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EQUIP_JSON = os.path.join(ROOT, "Reference", "SRD-Data", "equipment-weapons-armor.json")
EQUIP_MD   = os.path.join(ROOT, "Reference", "SRD-Data", "equipment.md")
SRD_CREATOR = os.path.join(ROOT, "data", "srd-creator.js")
OUT = os.path.join(ROOT, "data", "items.js")

DMG_TYPES = {"acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic",
             "piercing", "poison", "psychic", "radiant", "slashing", "thunder"}

# The fixed, hand-authored per-instance condition vocabulary (docs/ITEMS.md "Decisions").
# Small and expandable on demand — mirrors the lean already taken for PC conditions: a fixed
# list keeps it mechanizable (the engine can react to "on-fire"); free text wouldn't be.
ITEM_CONDITIONS = ["on-fire", "frozen", "poisoned-coated", "cursed", "broken",
                    "dropped", "waterlogged", "rusted"]


def norm(s):
    return re.sub(r"\s+", " ", str(s or "")).strip().lower()


def parse_weight(s):
    """'4 lb.' / '1/2 lb.' / '8½ lb.' / '—' (no weight, e.g. Varies-priced foci) -> float lb or None."""
    s = (s or "").strip()
    if not s or s == "—":
        return None
    s = s.replace("½", ".5")           # the vulgar-fraction char ('8½' -> '8.5')
    m = re.match(r"^(\d+)/(\d+)\s*lb", s)
    if m:
        return round(int(m.group(1)) / int(m.group(2)), 4)
    m = re.match(r"^([\d.]+)\s*lb", s)
    if m:
        return float(m.group(1))
    return None                              # "Varies" or an unparsed format — stays inert, not invented


def parse_cost(s):
    """'25 GP' / '5 SP' / '1,000 GP' -> {n,unit} in copper-normalized form, or None ('Varies')."""
    s = (s or "").strip()
    m = re.match(r"^([\d,]+)\s*(GP|SP|CP)$", s, re.I)
    if not m:
        return None
    n = int(m.group(1).replace(",", ""))
    return {"n": n, "unit": m.group(2).lower()}


def parse_damage(s):
    """'1d6 Slashing' / '1 Piercing' (Blowgun — flat, no die) -> {n,die,bonus,type}.
    The diceless form mirrors combat.js's cmRollDamage convention: n:0,die:0 contributes
    the bonus as flat damage — so Blowgun's "1 Piercing" composes with the existing resolver
    with zero special-casing there."""
    s = (s or "").strip()
    m = re.match(r"^(\d+)d(\d+)\s+(\w+)$", s)
    if m:
        t = m.group(3).lower()
        return {"n": int(m.group(1)), "die": int(m.group(2)), "bonus": 0,
                "type": t if t in DMG_TYPES else m.group(3).lower()}
    m = re.match(r"^(\d+)\s+(\w+)$", s)       # flat damage, no die (Blowgun)
    if m:
        t = m.group(2).lower()
        return {"n": 0, "die": 0, "bonus": int(m.group(1)),
                "type": t if t in DMG_TYPES else m.group(2).lower()}
    return None


def parse_ac(s):
    """Armor AC column -> a structured spec the future combat/sheet AC calc can read.
    '11 + Dex modifier' -> {base:11,dexMod:True,dexCap:None}
    '14 + Dex modifier (max 2)' -> {base:14,dexMod:True,dexCap:2}
    '16' (heavy armor, flat) -> {base:16,dexMod:False,dexCap:None}
    '+2' (Shield) -> {shieldBonus:2}"""
    s = (s or "").strip()
    m = re.match(r"^\+(\d+)$", s)
    if m:
        return {"shieldBonus": int(m.group(1))}
    m = re.match(r"^(\d+)\s*\+\s*Dex modifier(?:\s*\(max\s*(\d+)\))?$", s, re.I)
    if m:
        return {"base": int(m.group(1)), "dexMod": True,
                "dexCap": int(m.group(2)) if m.group(2) else None}
    m = re.match(r"^(\d+)$", s)
    if m:
        return {"base": int(m.group(1)), "dexMod": False, "dexCap": None}
    return None


def load_weapons_armor():
    d = json.load(open(EQUIP_JSON, encoding="utf-8"))
    items = {}
    for w in d["weapons"]:
        key = norm(w["name"])
        props = [p.strip() for p in re.split(r",\s*", w.get("properties", "") or "")
                 if p.strip() and p.strip() != "—"]
        items[key] = {
            "name": w["name"], "kind": "weapon", "category": w["category"],
            "damage": parse_damage(w["damage"]), "properties": props,
            "mastery": w.get("mastery") or None,
            "weight": parse_weight(w.get("weight")), "cost": parse_cost(w.get("cost")),
            "stackable": False,
        }
    for a in d["armor"]:
        key = norm(a["name"])
        items[key] = {
            "name": a["name"], "kind": "shield" if a["category"] == "Shield" else "armor",
            "category": a["category"], "ac": parse_ac(a["ac"]),
            "strengthReq": None if (a.get("strength") or "—") == "—" else a["strength"],
            "stealthDisadvantage": (a.get("stealth") or "").strip().lower() == "disadvantage",
            "weight": parse_weight(a.get("weight")), "cost": parse_cost(a.get("cost")),
            "stackable": False,
        }
    return items


# Names that are clearly per-stack price/weight bundles in the SRD prose table (a "Pack" row is
# the bundle ITSELF — already indexed via its own pack-name lookup elsewhere — so the loose-gear
# table doesn't need to also emit it as a generic gear entry; skip to avoid a confusing dupe).
_SKIP_GEAR_ROWS = {"ammunition", "arcane focus", "druidic focus", "holy symbol",
                    "burglar's pack", "diplomat's pack", "dungeoneer's pack",
                    "entertainer's pack", "explorer's pack", "priest's pack", "scholar's pack"}


def load_adventuring_gear():
    """Parse equipment.md's real 'Adventuring Gear' table (regular `Name <weight> <cost>` rows,
    with a repeated 'Item Weight Cost' header mid-table from the source page break)."""
    lines = open(EQUIP_MD, encoding="utf-8").read().split("\n")
    block = lines[540:624]                    # 'Adventuring Gear' header .. just before 'Ammunition'
    items = {}
    # weight optionally carries a parenthetical annotation before the cost column
    # ("Waterskin 5 lb. (full) 2 SP") — tolerate and discard it, the number is what we want.
    row_re = re.compile(r"^(.+?)\s+(—|[\d/.½]+\s*lb\.)(?:\s*\([^)]*\))?\s+([\d,]+\s*(?:GP|SP|CP)|Varies)$")
    for raw in block:
        line = raw.strip()
        if not line or line in ("Adventuring Gear", "Item Weight Cost"):
            continue
        m = row_re.match(line)
        if not m:
            continue                          # a prose/heading line inside the slice — skip, not fatal
        name, weight_s, cost_s = m.group(1).strip(), m.group(2).strip(), m.group(3).strip()
        key = norm(name)
        if key in _SKIP_GEAR_ROWS:
            continue
        items[key] = {
            "name": name, "kind": "gear", "category": "Adventuring Gear",
            "weight": parse_weight(weight_s), "cost": parse_cost(cost_s),
            "stackable": False,
        }
    return items


def load_ammunition():
    """The Ammunition sub-table is bundle totals ('Arrows 20 Quiver 1 lb. 1 GP' = 20 arrows
    weigh 1 lb / cost 1 gp TOGETHER) — divide down to a per-unit basis so a stackable instance's
    `weight*qty`/`cost.n*qty` reconstructs the bundle total exactly, same convention every other
    gear row already uses (one row = one unit)."""
    lines = open(EQUIP_MD, encoding="utf-8").read().split("\n")
    block = lines[625:631]
    items = {}
    row_re = re.compile(r"^(.+?)\s+(\d+)\s+\w+\s+([\d.½]+)\s*lb\.\s+([\d,]+\s*(?:GP|SP|CP))$")
    for raw in block:
        line = raw.strip()
        if not line or line == "Ammunition" or line.startswith("Type "):
            continue
        m = row_re.match(line)
        if not m:
            continue
        name, amount, weight_s, cost_s = m.group(1).strip(), int(m.group(2)), m.group(3), m.group(4)
        total_w = parse_weight(weight_s + " lb.") or 0
        total_c = parse_cost(cost_s)
        singular = re.sub(r"s$", "", name) if name.lower() != "ammunition" else name
        items[norm(singular)] = {
            "name": singular, "kind": "gear", "category": "Ammunition",
            "weight": round(total_w / amount, 4) if amount else None,
            "cost": ({"n": round(total_c["n"] / amount, 4), "unit": total_c["unit"]}
                     if total_c else None),
            "stackable": True, "qtyDefault": amount,
        }
    return items


# ---- pack-contents parsing: each PACK_CONTENTS string -> {name, qty?} resolved against the index ----

_QTY_PATTERNS = [
    re.compile(r"^(\d+)\s+days?\s+(.+)$", re.I),     # "10 days Rations"
    re.compile(r"^(\d+)\s+ft\s+(.+)$", re.I),         # "50 ft Hempen Rope" -> qty 1 (one coil/length)
    re.compile(r"^(\d+)\s+flasks?\s+(.+)$", re.I),    # "2 flasks Oil"
    re.compile(r"^(\d+)\s+sheets?\s+(.+)$", re.I),    # "5 sheets Paper"
    re.compile(r"^(\d+)\s+blocks?\s+of\s+(.+)$", re.I),  # "2 Blocks of Incense"
    re.compile(r"^(\d+)\s+(.+)$"),                     # generic "10 Torches" / "1000 Ball Bearings"
]


def _resolve_gear_name(raw_name, index):
    """exact -> naive plural-strip -> word-set match (catches the SRD's own "Lantern, Hooded"
    word-order vs. a pack's "Hooded Lantern") -> longest substring-contains (the house style
    already used by render.js's packOf()/dm.js's findClockTarget() — when several keys share a
    substring, the LONGEST match is the more specific, less likely to be a spurious short-word
    collision: "Vial of Perfume" substring-matches both "Vial" and "Perfume"; "Perfume" wins) ->
    give up (stays flavor-only, not invented)."""
    key = norm(raw_name)
    if key in index:
        return index[key]["name"]
    if key.endswith("es") and key[:-2] in index:
        return index[key[:-2]]["name"]
    if key.endswith("s") and key[:-1] in index:
        return index[key[:-1]]["name"]
    words = set(re.split(r"[,\s]+", key)) - {""}
    for k, v in index.items():
        if words and words == (set(re.split(r"[,\s]+", k)) - {""}):
            return v["name"]
    hits = sorted(((k, v["name"]) for k, v in index.items() if key in k or k in key),
                  key=lambda kv: -len(kv[0]))
    if hits:
        return hits[0][1]
    return raw_name                            # unresolved — its own real item, just flavor-only


def parse_pack_item(raw, index):
    is_ft_coil = False
    for pat in _QTY_PATTERNS:
        m = pat.match(raw)
        if m:
            qty, rest = int(m.group(1)), m.group(2).strip()
            if pat.pattern.startswith(r"^(\d+)\s+ft"):
                is_ft_coil, qty = True, 1
            elif pat.pattern.startswith(r"^(\d+)\s+(.+)$"):
                # generic: only treat the leading number as a qty if the remainder, once
                # singularized, plausibly resolves — else this is a name that just starts with
                # a digit-like word (none in our corpus today, but don't assume blindly)
                pass
            name = _resolve_gear_name(rest, index)
            return {"name": name, "qty": qty} if not is_ft_coil and qty != 1 else {"name": name}
    name = _resolve_gear_name(raw.strip(), index)
    return {"name": name}


def load_class_kit_items():
    """Every distinct item string across every class's starting-equipment options (CLASS_KIT,
    data/srd-creator.js) — "4 Handaxes", "20 Arrows", "Explorer's Pack", etc. Character creation
    needs each of these expanded the SAME way a pack's contents are (a quantity-prefixed string
    splits into {name,qty}; a pack name expands to its full line-item list) — built here, once, so
    sheet.js never re-implements the parsing at runtime."""
    src = open(SRD_CREATOR, encoding="utf-8").read()
    m = re.search(r"const CLASS_KIT=\{(.*?)\n\};", src, re.S)
    if not m:
        return set()
    names = set()
    for items_block in re.findall(r"items:\[(.*?)\]", m.group(1)):
        names.update(re.findall(r'"([^"]+)"', items_block))
    return names


def load_pack_contents():
    src = open(SRD_CREATOR, encoding="utf-8").read()
    m = re.search(r"const PACK_CONTENTS=\{(.*?)\n\};", src, re.S)
    if not m:
        return {}
    body = m.group(1)
    packs = {}
    for line in body.split("\n"):
        line = line.strip().rstrip(",")
        if not line:
            continue
        km = re.match(r'^"([^"]+)":\[(.*)\]$', line)
        if not km:
            continue
        pack_name, items_raw = km.group(1), km.group(2)
        names = re.findall(r'"([^"]+)"', items_raw)
        packs[pack_name] = names
    return packs


def main():
    weapons_armor = load_weapons_armor()
    gear = load_adventuring_gear()
    ammo = load_ammunition()
    items = {}
    items.update(weapons_armor)
    items.update(gear)
    items.update(ammo)                          # ammo wins on name collision (more specific unit basis)

    raw_packs = load_pack_contents()
    pack_expansions = {}
    for pack_name, raw_items in raw_packs.items():
        pack_expansions[pack_name] = [parse_pack_item(s, items) for s in raw_items]

    indexed_pack_lines = sum(
        1 for lines in pack_expansions.values() for e in lines
        if norm(e["name"]) in items
    )
    total_pack_lines = sum(len(v) for v in pack_expansions.values())

    # every CLASS_KIT item string -> its expansion: a pack name expands to the FULL pack contents;
    # anything else (a generic gear/weapon string, possibly quantity-prefixed) parses to one entry.
    kit_item_names = load_class_kit_items()
    kit_expansions = {}
    for raw in kit_item_names:
        kit_expansions[raw] = list(pack_expansions[raw]) if raw in pack_expansions else [parse_pack_item(raw, items)]
    indexed_kit_lines = sum(
        1 for lines in kit_expansions.values() for e in lines if norm(e["name"]) in items
    )
    total_kit_lines = sum(len(v) for v in kit_expansions.values())

    header = ("/* GENESIS DATA (generated) — data/items.js\n"
              "   Runtime item index (docs/ITEMS.md, the type/instance split for gear — the bestiary\n"
              "   pattern reapplied). ITEMS_BY_NAME holds objective facts (damage/AC/weight/cost/\n"
              "   properties); sheet.inventory instances resolve `name` against it. ITEM_CONDITIONS is\n"
              "   the fixed per-instance status vocabulary. PACK_EXPANSIONS resolves each SRD starting\n"
              "   pack to its real individual line items (replacing the old bundled-string model).\n"
              "   KIT_ITEM_EXPANSIONS does the same for every CLASS_KIT item string (data/srd-creator.js)\n"
              "   — a pack name expands to its full contents, a quantity-prefixed string ('4 Handaxes')\n"
              "   splits into {name,qty} — so character creation never re-parses strings at runtime.\n"
              "   GENERATED by build/gen-items.py — DO NOT hand-edit; edit the generator + re-run.\n"
              "   Classic <script> (shared global scope); defines ITEMS_BY_NAME + ITEM_CONDITIONS +\n"
              "   PACK_EXPANSIONS + KIT_ITEM_EXPANSIONS. */\n")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("const ITEMS_BY_NAME=" + json.dumps(items, ensure_ascii=False, indent=1, sort_keys=True) + ";\n")
        f.write("const ITEM_CONDITIONS=" + json.dumps(ITEM_CONDITIONS, ensure_ascii=False) + ";\n")
        f.write("const PACK_EXPANSIONS=" + json.dumps(pack_expansions, ensure_ascii=False, indent=1) + ";\n")
        f.write("const KIT_ITEM_EXPANSIONS=" + json.dumps(kit_expansions, ensure_ascii=False, indent=1, sort_keys=True) + ";\n")

    print(f"  weapons={len(weapons_armor)-len([1 for k in weapons_armor if items[k]['kind'] in ('armor','shield')])}"
          f"  armor/shield={sum(1 for v in weapons_armor.values() if v['kind'] in ('armor','shield'))}"
          f"  gear={len(gear)}  ammo={len(ammo)}  total={len(items)}")
    print(f"  packs={len(pack_expansions)}  pack-lines={total_pack_lines}"
          f"  resolved={indexed_pack_lines}/{total_pack_lines}")
    print(f"  kit-items={len(kit_expansions)}  kit-lines={total_kit_lines}"
          f"  resolved={indexed_kit_lines}/{total_kit_lines}")
    print(f"  → {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
