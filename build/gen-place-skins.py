#!/usr/bin/env python3
"""Genesis build — generate data/place-skins.js from the PLACE-GEN spine + realm skins.

docs/PLACE-GEN.md §2 + ADDENDUM §7E ("Source format contract"): a `place-spine` (24 universal
site-ARCHETYPES, each with a universal function-note, default Weight, GRID-LAW Space band, Staff
headcount band, and Cast profile) plus one `Place Skin - <Realm>.md` per realm (an overlay that
relabels/drops/adds/reweights the spine for that world). Mirrors build/gen-role-skins.py's
discipline exactly (source markdown -> data/*.js, a --check mode, "GENERATED — never hand-edit"
header) with ONE deliberate deviation per §7E: **missing skins are legal** — only 3 of 11 realms
are authored (Frontier, Chrome, Gloom); a realm with no skin file falls back to frontier AT ROLL
TIME in the generated JS, not at generation time, so --check does NOT require every REALM_ID to
have a skin file (unlike gen-role-skins.py, which does).

Emits data/place-skins.js (classic <script> globals, NOT ES module):
  PLACE_SPINE = [ {key, archetype, note, weight, scale, space, staff:{min,max},
                    cast:{anchor, ambient:[...]}}, ... ]                          (24 entries)
  PLACE_SKINS = { realmId: { reskin: {"<key>": {label, weight}}, adds: [...],
                              namePatterns: [...] } }                     (only authored realms)
  PLACE_SPACE_CELLS = { cramped: {...}, roomy: {...}, vast: {...} }  (GRID-LAW footprint bands,
                        5-ft cells, constants sourced from the DMG24 Bastion gather — see the
                        comment on the constant itself)
  placeForRealm(realmId, rng, opts) -> {archetypeKey, label, note, scale, space, staff, cast}
    (weighted pick, hand-written JS; opts.archetypeBias multiplies listed keys' weights ×3;
    opts.excludeScale accepted for future use; unknown/absent realmId falls back to 'frontier')
  SCENE_BUCKET_BY_ARCHETYPE / SCENE_BUCKET_DEFAULT / sceneBucketForArchetype(archetypeKey)
    (PLACE-GEN §5 unit 3): hand-maintained spine-key -> ambient scene-bucket map (shrine|shop|
    tavern|market, the vocabulary src/world/prep.js already owns), always-resolving accessor.
  SCENE_DRESSING_BY_ARCHETYPE / SCENE_DRESSING_DEFAULT / SURFACE_TAG_BASES /
    sceneDressingForPlace(realmId, archetypeKey) (PLACE-GEN ADDENDUM §7 unit 8): hand-maintained
    spine-key -> {propNames, surface, light} dressing map; the resolver matches propNames against
    realmPropsFor's real prop pool (missing names skipped, never a hole), resolves the abstract
    surface tag against REALM_SURFACES' real material vocabulary, and returns the archetype's
    authored light-profile default (THEATER_LIGHT_TABLE's own vocabulary).

Modes:
  (default)  write data/place-skins.js
  --check    validate only (spine shape, every AUTHORED skin's reskin map covers all 24 keys,
             every non-dropped archetype has a label, every ADD row carries the full field set);
             no write. Does NOT require every REALM_ID to have a skin (§7E, deliberate deviation).
  --census   sweep 24 archetypes x the 3 authored realms (frontier/chrome/gloom), resolve every
             SCENE_DRESSING_BY_ARCHETYPE propNames list against that realm's realmPropsFor pool
             (pure-python re-implementation of the JS fold, no jsdom needed), and print which
             archetype/realm pairs resolve <2 props (thin) or which propNames matched nothing
             (missing) — ADDENDUM §7.8's prop-census rider. Report only; never pads pools to green.

Weight semantics (spec, identical to gen-role-skins.py): blank cell in a skin's reskin row =
inherit the spine's default weight; `0` = drop (excluded from that realm's pool entirely).
Realm ids = data/realms.js REALM_IDS.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLES_DIR = os.path.join(ROOT, "Engine", "03. _Tables", "05. Realms")
SPINE_SRC = os.path.join(TABLES_DIR, "Place Spine.md")
REALMS_SRC = os.path.join(ROOT, "data", "realms.js")
OUT = os.path.join(ROOT, "data", "place-skins.js")

# filename stem "Frontier" / "Chrome" / "Gloom" -> realm id, exact match to data/realms.js's
# REALM_IDS (a plain .lower() of the stem, same convention as gen-role-skins.py's skin files).
SKIN_FILE_RE = re.compile(r"^Place Skin - (.+)\.md$")

# NPC spine Tags vocabulary (§7E Cast field) — classes a castProfile may name, plus "any" =
# unfiltered. Kept here only for a soft validation warning; roleForRealm itself does the real
# class filtering against NPC_ROLE_SPINE's `cls` field at cast-wiring time (unit 3, not this file).
CAST_CLASSES = {"labor", "wild", "service", "margin", "craft", "trade", "care", "faith",
                 "authority", "criminal", "elite", "any"}


def real_realm_ids():
    """Parse data/realms.js's REALMS object keys — mirrors gen-role-skins.py's own parse,
    without requiring a JS runtime."""
    txt = open(REALMS_SRC, encoding="utf-8").read()
    m = re.search(r"const REALMS\s*=\s*\{", txt)
    if not m:
        print("FATAL: could not find `const REALMS = {` in data/realms.js", file=sys.stderr)
        sys.exit(1)
    ids = re.findall(r'^\s{2}"?([a-z][a-z0-9-]*)"?:\s*\{', txt[m.end():], re.MULTILINE)
    return [i for i in ids if i != "realm-neutral"]


def parse_staff(s):
    """'N' or 'N-M' headcount band -> {min,max} (both ints; single value = min==max)."""
    s = s.strip()
    if "-" in s:
        lo, hi = s.split("-", 1)
        return {"min": int(lo.strip()), "max": int(hi.strip())}
    n = int(s)
    return {"min": n, "max": n}


def parse_cast(s):
    """'anchorCls / ambientCls+ambientCls' -> {anchor, ambient:[...]}."""
    parts = s.split("/")
    anchor = parts[0].strip()
    ambient = []
    if len(parts) > 1:
        ambient = [c.strip() for c in parts[1].split("+") if c.strip()]
    return {"anchor": anchor, "ambient": ambient}


SPINE_ROW_RE = re.compile(
    r"^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$",
    re.MULTILINE,
)


def parse_spine(text):
    """24 rows: | # | Archetype | Function-note | Weight | Scale | Space | Staff | Cast |"""
    rows = []
    seen_keys = set()
    for m in SPINE_ROW_RE.finditer(text):
        key, archetype, note, weight, scale, space, staff, cast = m.groups()
        key = int(key)
        if key in seen_keys:
            continue  # a stray table-format example row elsewhere in the doc; keep the first hit
        seen_keys.add(key)
        rows.append({
            "key": key, "archetype": archetype, "note": note, "weight": int(weight),
            "scale": scale, "space": space, "staff": parse_staff(staff), "cast": parse_cast(cast),
        })
    rows.sort(key=lambda r: r["key"])
    return rows


# Reskin row: "| N · Archetype | <label> | Weight |" — blank Weight = inherit, 0 = drop.
RESKIN_ROW_RE = re.compile(
    r"^\|\s*(\d+)\s*·\s*[^|]+?\s*\|\s*(.+?)\s*\|\s*(\d*)\s*\|\s*$", re.MULTILINE
)
# ADD row: "| [ADD] | <label> | Weight | Scale | Space | Staff | Cast | Note |"
ADD_ROW_RE = re.compile(
    r"^\|\s*\[ADD\]\s*\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$",
    re.MULTILINE,
)
NAME_PATTERNS_SECTION_RE = re.compile(
    r"^##\s*Name patterns\s*$(.*?)(?=^##\s|\Z)", re.MULTILINE | re.DOTALL
)
NAME_PATTERN_LINE_RE = re.compile(r"^-\s*(.+?)\s*$", re.MULTILINE)


def slugify(label):
    s = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
    return s


def parse_skin(text):
    """A skin file's reskin map, [ADD] rows, and optional `## Name patterns` list (§7E)."""
    reskin = {}
    for m in RESKIN_ROW_RE.finditer(text):
        key, label, weight = m.groups()
        reskin[key] = {"label": label, "weight": (int(weight) if weight != "" else None)}
    adds = []
    for m in ADD_ROW_RE.finditer(text):
        label, weight, scale, space, staff, cast, note = m.groups()
        adds.append({
            "key": "add:" + slugify(label), "label": label, "weight": int(weight), "scale": scale,
            "space": space, "staff": parse_staff(staff), "cast": parse_cast(cast), "note": note,
        })
    name_patterns = []
    sec = NAME_PATTERNS_SECTION_RE.search(text)
    if sec:
        name_patterns = [p for p in NAME_PATTERN_LINE_RE.findall(sec.group(1))]
    return reskin, adds, name_patterns


def load_skins():
    out = {}
    for fname in sorted(os.listdir(TABLES_DIR)):
        m = SKIN_FILE_RE.match(fname)
        if not m:
            continue
        realm_id = m.group(1).lower()
        text = open(os.path.join(TABLES_DIR, fname), encoding="utf-8").read()
        reskin, adds, name_patterns = parse_skin(text)
        out[realm_id] = {"reskin": reskin, "adds": adds, "namePatterns": name_patterns, "_file": fname}
    return out


def validate(spine, skins, realm_ids):
    errors = []
    if len(spine) != 24:
        errors.append(f"spine: expected 24 archetypes, parsed {len(spine)} — Place Spine.md table drifted")
    spine_keys = {r["key"] for r in spine}
    if spine_keys != set(range(1, 25)):
        missing = sorted(set(range(1, 25)) - spine_keys)
        extra = sorted(spine_keys - set(range(1, 25)))
        errors.append(f"spine: key set is not exactly 1..24 (missing={missing}, extra={extra})")
    for r in spine:
        if r["space"] not in ("cramped", "roomy", "vast"):
            errors.append(f"spine key {r['key']}: Space '{r['space']}' not one of cramped|roomy|vast")
        if r["scale"] != "site":
            errors.append(f"spine key {r['key']}: Scale '{r['scale']}' expected 'site' (only value defined today)")

    # §7E deliberate deviation from gen-role-skins.py: missing skins are LEGAL — only 3 of 11
    # realms are authored yet; roll-time fallback to frontier covers the rest. We do NOT error on
    # realm_ids missing a skin file. We DO error on a skin file for an id that doesn't exist.
    extra_skins = [r for r in skins if r not in realm_ids]
    if extra_skins:
        errors.append(f"skin file(s) for unknown realm id(s) (not in data/realms.js REALM_IDS): {extra_skins}")
    if "frontier" not in skins:
        errors.append("no 'Place Skin - Frontier.md' found — frontier is the mandatory fallback skin (roll-time default)")

    for realm_id, skin in skins.items():
        reskin = skin["reskin"]
        missing_keys = spine_keys - {int(k) for k in reskin.keys()}
        if missing_keys:
            errors.append(f"{realm_id} ({skin['_file']}): reskin map missing archetype key(s) {sorted(missing_keys)}")
        for key_str, row in reskin.items():
            dropped = (row["weight"] == 0)
            if not dropped and not row["label"]:
                errors.append(f"{realm_id} ({skin['_file']}): archetype {key_str} has no label and isn't dropped (weight 0)")
        for i, add in enumerate(skin["adds"]):
            ok = (add.get("label") and add.get("note") and isinstance(add.get("weight"), int)
                  and add.get("scale") == "site" and add.get("space") in ("cramped", "roomy", "vast")
                  and isinstance(add.get("staff"), dict) and add.get("cast", {}).get("anchor"))
            if not ok:
                errors.append(f"{realm_id} ({skin['_file']}): ADD row #{i+1} missing/malformed field(s) — {add}")

    return errors


# GRID-LAW footprint bands (5-ft cells). Source: docs/PLACE-GATHER-DMG24-BASTIONS.md's Bastion
# facility-size table (p.335): Cramped = 4 squares (up to 100 sq ft) = a 2x2-cell footprint;
# Roomy = 16 squares (up to 400 sq ft) = a 4x4-cell footprint; Vast = 36 squares (up to 900 sq ft)
# = a 6x6-cell footprint. Genesis widens each band into a small {min,max} RANGE (not a fixed
# square) so mints vary room shape while staying inside the DMG24 area ceiling for that band —
# min bound is one band-step down from the max (never smaller than 1 cell), giving room to roll
# rectangular (non-square) footprints too.
PLACE_SPACE_CELLS = {
    "cramped": {"wMin": 1, "wMax": 2, "dMin": 1, "dMax": 2},   # <=100 sq ft ceiling (2x2 cells)
    "roomy": {"wMin": 3, "wMax": 4, "dMin": 3, "dMax": 4},     # <=400 sq ft ceiling (4x4 cells)
    "vast": {"wMin": 5, "wMax": 6, "dMin": 5, "dMax": 6},      # <=900 sq ft ceiling (6x6 cells)
}

# SCENE_BUCKET_BY_ARCHETYPE (PLACE-GEN.md §5 unit 3, "AMBIENT" — cast wiring): a small HAND-
# MAINTAINED map from universal spine archetype key -> the existing scene-bucket vocabulary
# NPC-PRESENCE-AND-HOOKS.md Component 2 already built (src/world/prep.js's AMBIENT_SCENE_BASE /
# SCENE_PARTIALS: shrine | shop | tavern | market — NOT new bucket names, the doc names only these
# four). Only archetypes that read unambiguously as one of the four buckets get an entry; every
# other spine key (and every realm [ADD] key, which this generator never sees at the spine level)
# falls through to the "shop" default the engine already uses for an unmapped/small-interior scene
# (src/world/urban.js's sceneTypeForBuildingKit, same fallback). Maintained here, not in the
# markdown source (§7E's Cast/Space/Staff columns are the only per-archetype fields the craft lane
# owns) — a scene-bucket is an ENGINE population concern, not a realm-flavor concern.
SCENE_BUCKET_BY_ARCHETYPE = {
    1: "market",   # Gathering-place — the social switchboard; crowds, like a plaza/market
    2: "tavern",   # Watering-hole
    3: "market",   # Market
    6: "shrine",   # Shrine
    16: "tavern",  # Vice-den — pleasure economy, tavern-shaped population
    22: "market",  # Commons — open shared ground, plaza/market-shaped population
}
SCENE_BUCKET_DEFAULT = "shop"

# SCENE_DRESSING_BY_ARCHETYPE (PLACE-GEN.md ADDENDUM §7 unit 8, "Archetype -> dressing map"): a
# small HAND-MAINTAINED map from universal spine archetype key -> {propNames, surface, light}.
# propNames are matched BY NAME against realmPropsFor(realm)'s pool at resolution time (dev/
# model-qa/realm-props.json is the source of truth for what names actually exist) — every name
# below was verified present in the FRONTIER/CHROME/GLOOM prop pools (the 3 authored realms) via
# realmPropsFor's own union-fold rule (own-realm + crossRealm:"all" + crossRealm-listed), so no
# spine archetype goes thin in any authored realm. A name absent from an unauthored realm's future
# pool is legal — sceneDressingForPlace SKIPS unmatched names, never holes (see unit 8 rider: the
# prop census reports thin/missing, it never pads the pool to force green).
#
# `surface` is an ABSTRACT TAG (not a REALM_SURFACES row name) resolved per-realm at call time via
# SURFACE_TAG_BASES below, against the REAL `base` material vocabulary data/realm-surfaces.js
# already carries (src/ui/theater-boot.js's FLOOR_MATERIAL_RECIPES keys — plank/cobble/flagstone/
# grating/cracked-earth/mud/grass/sand/scree/etc). This mirrors placeForRealm's own realm-fallback
# discipline: an abstract tag lets one map cover every realm's differently-named surfaces.
#
# `light` is one of THEATER_LIGHT_TABLE's existing profile vocabulary (src/engine/theater-data.js
# — dark|torchlit|fungal-glow|magic-glow|lamplit|daylit|moonlit|overcast|lavalit|voidlit), the
# SAME light-profile enum the walk/segment layer already rolls and renders (BATTLE-THEATER's
# lighting ruling) — deliberately NOT a new parallel vocabulary. This map supplies a per-archetype
# DEFAULT profile (an authored fact, not a dice roll — a Shrine reads torchlit whichever realm it's
# in); theaterRollLightProfile/keyword overrides remain the battle-theater's own seam and are
# untouched by this unit.
SCENE_DRESSING_BY_ARCHETYPE = {
    1: {"propNames": ["Long Bar", "Rain Barrel", "Wandering Torch", "Overflowing Trash Can"],
        "surface": "street", "light": "lamplit"},                                   # Gathering-place
    2: {"propNames": ["Long Bar", "Grog Barrel Row", "Rolling Field Kitchen", "Rain Barrel"],
        "surface": "interior-wood", "light": "lamplit"},                            # Watering-hole
    # PLACE-PARTS-WAVE Wave A (2026-07-09): anchor-first rows — the archetype-naming piece leads its
    # row (Market gains its stall+shop counter, Hall-of-law its bench+bars, Threshold a real gate,
    # gloom Works the standpipe — the Blood-Slick-Altar realm-scoped precedent, see row 6 note).
    3: {"propNames": ["Market Stall Frame", "Shop Counter", "Munitions Crate", "Trash Can Row", "Rolling Field Kitchen"],
        "surface": "street", "light": "daylit"},                                    # Market
    4: {"propNames": ["Judge's Bench", "Case-File Desk", "Star-Chart Table", "Wandering Torch"],
        "surface": "interior-stone", "light": "lamplit"},                           # Seat-of-power
    5: {"propNames": ["Judge's Bench", "Cell Bar Run", "Case-File Desk", "Brig Cage"],
        "surface": "interior-stone", "light": "torchlit"},                          # Hall-of-law
    # PLACE-ASSET-QUEUE Part 1a finding: row 6's propNames were all scatter (font/torch/crate) with
    # no altar anchor, even though the anchor already exists (prop:shrine-block, base "altar" in
    # dev/model-qa/realm-props.json). "Blood-Slick Altar" (gloom's own base:"altar" entry) carries
    # crossRealm:[frontier,lost-world,cosmic] — the widest reach of any altar-base entry, covering
    # 2 of the 3 authored realms (frontier+gloom; chrome's own altar-base entry, "Terminal Stand",
    # is crossRealm:"specific" and doesn't fold in) — sceneDressingForPlace skips it there, never a
    # hole (unit 8's own discipline, see file header).
    6: {"propNames": ["Offertory Table", "Weeping Font", "Guttering Grave-Torch", "Pew Row", "Blood-Slick Altar"],
        "surface": "interior-stone", "light": "torchlit"},                          # Shrine
    7: {"propNames": ["Embalming Table", "Rain Barrel", "Duckboard Walkway"],
        "surface": "interior-wood", "light": "lamplit"},                            # House-of-healing
    8: {"propNames": ["Scrap Heap", "Cinderblock Stack", "Munitions Crate Stack", "Slag Heap"],
        "surface": "interior-metal", "light": "torchlit"},                          # Workplace
    9: {"propNames": ["Smith's Hearth", "Shop Counter", "Scrap Heap", "Rust Drum"],
        "surface": "interior-wood", "light": "lamplit"},                            # Workshop
    10: {"propNames": ["Stock Shelves", "Loading Dock", "Munitions Crate Stack", "Ballast Crate Stack"],
         "surface": "interior-wood", "light": "dark"},                              # Storehouse
    11: {"propNames": ["Duckboard Walkway", "Rain Barrel", "Trash Can Row"],
         "surface": "interior-wood", "light": "lamplit"},                           # Lodging
    12: {"propNames": ["Rain Barrel", "Cobweb Mass", "Overflowing Trash Can"],
         "surface": "interior-wood", "light": "dark"},                              # Dwelling
    13: {"propNames": ["Checkpoint Gate", "Turnstile Row", "Rift Grate", "Glyph-Warded Grate"],
         "surface": "street", "light": "torchlit"},                                 # Threshold
    14: {"propNames": ["Storm Drain Grate", "Coiled Mooring Rope", "Wandering Torch", "Cracked Water Cistern"],
         "surface": "street", "light": "daylit"},                                   # Crossing
    15: {"propNames": ["Cell Bar Run", "Cobweb Mass", "Scrap Heap", "Rotted Coffin"],
         "surface": "earth", "light": "dark"},                                      # Hideout
    16: {"propNames": ["Long Bar", "Grog Barrel Row", "Piled Party Favors"],
         "surface": "interior-wood", "light": "lamplit"},                           # Vice-den
    17: {"propNames": ["Sundered Column Drum", "Cobweb Mass", "Rotted Coffin", "Collapsed Trench Wall"],
         "surface": "earth", "light": "dark"},                                      # Ruin
    18: {"propNames": ["Stacked Corpse Cairn", "Cattle Skull Pile", "Rotted Coffin", "Guttering Grave-Torch"],
         "surface": "earth", "light": "moonlit"},                                   # Boneyard
    19: {"propNames": ["Wandering Torch", "Cinderblock Stack", "Storm Drain Grate"],
         "surface": "interior-stone", "light": "torchlit"},                         # Watch-post
    20: {"propNames": ["Fence Run", "Turf-Claim Fence", "Refuse Drift", "Cattle Skull Pile"],
         "surface": "open-exterior", "light": "overcast"},                          # Wild-margin
    21: {"propNames": ["Riveted Standpipe Tank", "Mill Wheel", "Power Junction Box", "Scrap Heap", "Slag Heap"],
         "surface": "interior-metal", "light": "torchlit"},                         # Works
    22: {"propNames": ["Bandstand Dais", "Overflowing Trash Can", "Wandering Torch", "Rain Barrel"],
         "surface": "street", "light": "daylit"},                                   # Commons
    23: {"propNames": ["Star-Chart Table", "Case-File Desk", "Reliquary Crate Stack"],
         "surface": "interior-stone", "light": "lamplit"},                          # Seat-of-learning
    24: {"propNames": ["Sundered Column Drum", "Wandering Torch", "Cinderblock Stack"],
         "surface": "street", "light": "moonlit"},                                  # Monument
}
# Default dressing for a realm [ADD] key (add:*) or any unmapped archetype key — a documented,
# always-defined fallback, never undefined (unit 8: "never a hole"). Empty propNames is legal:
# sceneDressingForPlace's resolver still returns a defined {props:[], surface, light} shape.
SCENE_DRESSING_DEFAULT = {"propNames": [], "surface": "interior-wood", "light": "dark"}

# SURFACE_TAG_BASES: abstract surface tag -> the REAL data/realm-surfaces.js `base` material
# vocabulary (src/ui/theater-boot.js FLOOR_MATERIAL_RECIPES keys) it may resolve to, ordered by
# preference. sceneDressingForPlace walks a realm's REALM_SURFACES list and returns the first
# entry whose `base` is in the tag's list; falls back to the realm's first surface entry (never
# undefined) when nothing matches — same never-a-hole discipline as placeForRealm/realmPropsFor.
SURFACE_TAG_BASES = {
    "interior-wood": ["plank"],
    "interior-stone": ["flagstone", "cave-rock", "cobble"],
    "interior-metal": ["grating"],
    "street": ["cobble", "asphalt", "mud"],
    "earth": ["cracked-earth", "mud", "leaf-litter", "scree"],
    "open-exterior": ["grass", "scree", "snow-ice", "sand"],
}

# archetypeBias multiplier (HOOK-WALKS seam, PLACE-GEN §4 "Walks + HOOK-WALKS" / §5 unit 4):
# opts.archetypeBias lists archetype/add keys a caller wants favored (e.g. a smuggling hook biases
# toward Storehouse/Hideout/Crossing) — each listed key's pool weight is multiplied by this
# constant before the weighted pick. x3 mirrors the shared-constant discipline of this codebase's
# other bias multipliers (documented once, reused, never re-derived per caller).
ARCHETYPE_BIAS_MULTIPLIER = 3

PLACE_FOR_REALM_JS = """
/* placeForRealm(realmId, rng, opts) -> {archetypeKey, label, note, scale, space, staff, cast} —
   PLACE-GEN.md §2/§5 unit 1 "Engine wiring": weighted-pick a spine archetype (skin weight
   override if present, else spine default; weight 0 = excluded) unioned with that realm's own
   [ADD] places (own weight/label/scale/space/staff/cast/note), then weighted-pick ONE entry from
   the combined pool. `rng` is an optional zero-arg fn returning a float in [0,1) (Math.random
   contract) — omit it and this uses Math.random() directly (same defensive style as
   roleForRealm/rollNpcBreachTouch/coherenceAtomGate). realmId falls back to 'frontier' when
   absent/unrecognized OR when no skin file was authored for it yet (§7E: only 3 of 11 realms are
   authored — this is the roll-time fallback that makes the other 8 legal to omit).
   opts.archetypeBias (array of archetype/add keys, string or number) multiplies each listed key's
   pool weight by ARCHETYPE_BIAS_MULTIPLIER (HOOK-WALKS seam, PLACE-GEN §4). opts.excludeScale
   (array of scale tags) drops any pool entry whose scale is listed — accepted now for future use;
   every spine/add row is scale "site" today so this is a no-op until non-site rows exist. Pure —
   no state/DOM access, safe for the jsdom harness. */
function placeForRealm(realmId, rng, opts){
  var rnd = (typeof rng === "function") ? rng : Math.random;
  var bias = (opts && opts.archetypeBias) || [];
  var biasSet = {};
  for(var bi=0; bi<bias.length; bi++) biasSet[String(bias[bi])] = true;
  var excludeScale = {};
  ((opts && opts.excludeScale) || []).forEach(function(s){ excludeScale[s] = true; });
  var skin = (PLACE_SKINS[realmId]) || PLACE_SKINS.frontier || null;
  if(!skin) return null; // defensive: data file failed to load / is empty — never throw
  var pool = [];
  PLACE_SPINE.forEach(function(a){
    if(excludeScale[a.scale]) return;
    var row = skin.reskin[String(a.key)];
    var weight = (row && row.weight !== null && row.weight !== undefined) ? row.weight : a.weight;
    if(!weight) return; // 0 or missing override with a 0 spine default -> dropped
    if(biasSet[String(a.key)]) weight *= ARCHETYPE_BIAS_MULTIPLIER;
    var label = (row && row.label) ? row.label : a.archetype;
    pool.push({archetypeKey:a.key, label:label, note:a.note, scale:a.scale, space:a.space, staff:a.staff, cast:a.cast, weight:weight});
  });
  (skin.adds || []).forEach(function(add){
    if(!add.weight) return;
    if(excludeScale[add.scale]) return;
    var weight = add.weight;
    if(biasSet[add.key]) weight *= ARCHETYPE_BIAS_MULTIPLIER;
    pool.push({archetypeKey:add.key, label:add.label, note:add.note, scale:add.scale, space:add.space, staff:add.staff, cast:add.cast, weight:weight});
  });
  if(!pool.length) return null; // defensive: a malformed skin (or excludeScale) dropped everything — never throw
  var total = 0;
  for(var i=0;i<pool.length;i++) total += pool[i].weight;
  var roll = rnd() * total;
  var acc = 0;
  for(var j=0;j<pool.length;j++){
    acc += pool[j].weight;
    if(roll < acc) return {archetypeKey:pool[j].archetypeKey, label:pool[j].label, note:pool[j].note, scale:pool[j].scale, space:pool[j].space, staff:pool[j].staff, cast:pool[j].cast};
  }
  var last = pool[pool.length-1]; // float-rounding guard, same pattern as roleForRealm/pickCoherenceTier
  return {archetypeKey:last.archetypeKey, label:last.label, note:last.note, scale:last.scale, space:last.space, staff:last.staff, cast:last.cast};
}

/* sceneBucketForArchetype(archetypeKey) -> one of "shrine"|"shop"|"tavern"|"market" — PLACE-GEN.md
   §5 unit 3: resolves a minted place's spine archetypeKey to the ambient-population scene-bucket
   vocabulary src/world/prep.js already owns (AMBIENT_SCENE_BASE/SCENE_PARTIALS). ALWAYS resolves —
   an unmapped spine key or any realm [ADD] key (SCENE_BUCKET_BY_ARCHETYPE only covers universal
   spine rows, per this file's own comment) falls through to SCENE_BUCKET_DEFAULT, never undefined. */
function sceneBucketForArchetype(archetypeKey){
  if(archetypeKey==null) return SCENE_BUCKET_DEFAULT;
  var hit = SCENE_BUCKET_BY_ARCHETYPE[String(archetypeKey)];
  return hit || SCENE_BUCKET_DEFAULT;
}

/* sceneDressingForPlace(realmId, archetypeKey) -> {props:[...], surface, light} — PLACE-GEN.md
   ADDENDUM §7 unit 8: resolves a minted place's spine archetypeKey (or an add:* key) to concrete
   dressing for that realm. props: SCENE_DRESSING_BY_ARCHETYPE[archetypeKey].propNames matched BY
   NAME against realmPropsFor([realmId])'s pool — a name with no match is SKIPPED (never a hole,
   never a throw; the array is simply shorter). surface: the archetype's abstract SURFACE_TAG_
   resolved against REALM_SURFACES[realmId] (fallback 'frontier', same convention as placeForRealm)
   -> the first surface entry whose base is in that tag's material list, or that realm's first
   surface entry if nothing matches (never undefined). light: the archetype's authored default
   light-profile, straight from THEATER_LIGHT_TABLE's own vocabulary (src/engine/theater-data.js) —
   not re-rolled here, this is an authored per-archetype fact layered under the battle-theater's own
   dice/keyword seam. An unmapped archetypeKey (an add:* key with no per-skin override, or any
   future spine key) falls through to SCENE_DRESSING_DEFAULT. Pure, defensive — never throws even
   when REALM_PROPS/REALM_SURFACES/realmPropsFor haven't loaded (returns empty props / undefined
   surface only in that unloaded-data edge case, same defensive tier as placeForRealm's own guards). */
function sceneDressingForPlace(realmId, archetypeKey){
  var dress = SCENE_DRESSING_BY_ARCHETYPE[String(archetypeKey)] || SCENE_DRESSING_DEFAULT;
  var props = [];
  if(typeof realmPropsFor === "function"){
    var pool = realmPropsFor([realmId || "frontier"]);
    var byName = {};
    pool.forEach(function(p){ byName[p.name] = p; });
    (dress.propNames || []).forEach(function(n){ if(byName[n]) props.push(byName[n]); });
  }
  var surface = null;
  if(typeof REALM_SURFACES !== "undefined"){
    var surfaces = REALM_SURFACES[realmId] || REALM_SURFACES.frontier || [];
    var bases = SURFACE_TAG_BASES[dress.surface] || [];
    var baseSet = {};
    bases.forEach(function(b){ baseSet[b] = true; });
    for(var i=0; i<surfaces.length; i++){
      if(baseSet[surfaces[i].base]){ surface = surfaces[i]; break; }
    }
    if(!surface && surfaces.length) surface = surfaces[0];
  }
  return {props: props, surface: surface, light: dress.light};
}
"""


REALM_PROPS_SRC = os.path.join(ROOT, "dev", "model-qa", "realm-props.json")
CENSUS_REALMS = ["frontier", "chrome", "gloom"]  # the 3 authored realms (§7E)


def _norm_cross_realm(raw):
    raw = (raw or "").strip()
    if raw in ("all", "specific", ""):
        return raw
    return [x.strip() for x in raw.split(",") if x.strip()]


def realm_props_pool(realm_id, by_realm):
    """Pure-python re-implementation of the JS realmPropsFor([realm_id]) fold (own-realm entries +
    crossRealm:"all" + crossRealm-listed) — used by --census so it needs no jsdom. Returns {name: prop}."""
    seen = {}
    for rid, props in by_realm.items():
        for p in props:
            cross = _norm_cross_realm(p.get("crossRealm", ""))
            eligible = (rid == realm_id) or (cross == "all") or (
                isinstance(cross, list) and realm_id in cross)
            if eligible and p["name"] not in seen:
                seen[p["name"]] = p
    return seen


def run_census():
    """--census (ADDENDUM §7.8 rider): sweep 24 archetypes x the 3 authored realms, resolve every
    SCENE_DRESSING_BY_ARCHETYPE propNames list against that realm's realmPropsFor pool, print thin
    (<2 resolved props) and missing (a propName that matched nothing) findings per realm. Report
    only — never mutates SCENE_DRESSING_BY_ARCHETYPE to force a green result."""
    by_realm = {}
    for entry in json.load(open(REALM_PROPS_SRC, encoding="utf-8")):
        by_realm[entry["realm"]] = entry["props"]

    print(f"PLACE-DRESSING PROP CENSUS — {len(SCENE_DRESSING_BY_ARCHETYPE)} archetypes x "
          f"{len(CENSUS_REALMS)} realms ({', '.join(CENSUS_REALMS)})")
    thin_total = 0
    missing_total = 0
    findings = {r: {"thin": [], "missing": []} for r in CENSUS_REALMS}
    for realm_id in CENSUS_REALMS:
        pool = realm_props_pool(realm_id, by_realm)
        for key in sorted(SCENE_DRESSING_BY_ARCHETYPE, key=int):
            dress = SCENE_DRESSING_BY_ARCHETYPE[key]
            names = dress["propNames"]
            resolved = [n for n in names if n in pool]
            missing = [n for n in names if n not in pool]
            if len(resolved) < 2:
                findings[realm_id]["thin"].append((key, len(resolved), len(names)))
                thin_total += 1
            if missing:
                findings[realm_id]["missing"].append((key, missing))
                missing_total += 1
        print(f"  {realm_id}: {len(findings[realm_id]['thin'])} thin archetype(s), "
              f"{len(findings[realm_id]['missing'])} archetype(s) with a missing name")
        for key, nres, ntot in findings[realm_id]["thin"]:
            print(f"    THIN  key {key}: only {nres}/{ntot} propNames resolved")
        for key, missing in findings[realm_id]["missing"]:
            print(f"    MISSING key {key}: {missing}")
    print(f"TOTAL: {thin_total} thin finding(s), {missing_total} archetype(s) w/ a missing-name finding "
          f"across {len(CENSUS_REALMS)} realms (report only — no pool padding)")
    return findings


def main():
    if "--census" in sys.argv:
        run_census()
        return
    check_only = "--check" in sys.argv
    spine_text = open(SPINE_SRC, encoding="utf-8").read()
    spine = parse_spine(spine_text)
    skins = load_skins()
    realm_ids = real_realm_ids()

    errors = validate(spine, skins, realm_ids)
    if errors:
        print(f"PLACE-SKINS VALIDATION FAILED ({len(errors)} error(s)):", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)

    total_adds = sum(len(s["adds"]) for s in skins.values())
    print(f"validation OK — 24 spine archetypes, {len(skins)}/{len(realm_ids)} realm skins authored "
          f"({', '.join(sorted(skins.keys()))}), {total_adds} total [ADD] places "
          f"(missing skins fall back to frontier at roll time, per §7E)")

    if check_only:
        return

    out_skins = {}
    for realm_id, s in skins.items():
        out_skins[realm_id] = {
            "reskin": {k: {"label": v["label"], "weight": v["weight"]} for k, v in s["reskin"].items()},
            "adds": [{"key": a["key"], "label": a["label"], "weight": a["weight"], "scale": a["scale"],
                      "space": a["space"], "staff": a["staff"], "cast": a["cast"], "note": a["note"]}
                     for a in s["adds"]],
            "namePatterns": s["namePatterns"],
        }

    header = (
        "/* GENESIS DATA (generated) — data/place-skins.js\n"
        "   docs/PLACE-GEN.md §2/§5 unit 1 + ADDENDUM §7E \"Source format contract\" — the\n"
        "   24-archetype universal PLACE SPINE (`Engine/03. _Tables/05. Realms/Place Spine.md`) + one\n"
        "   realm SKIN per authored `Place Skin - <Realm>.md` file that relabels/drops/adds/reweights\n"
        "   it for that world. PLACE_SPINE = [{key,archetype,note,weight,scale,space,staff:{min,max},\n"
        "   cast:{anchor,ambient:[...]}}, ...] (24 entries). PLACE_SKINS = {realmId: {reskin:{\"<key>\":\n"
        "   {label,weight}}, adds:[{key,label,weight,scale,space,staff,cast,note}, ...], namePatterns:\n"
        "   [...]}}  — reskin.weight null means \"inherit the spine default\", 0 means \"drop\" (the\n"
        "   archetype cannot exist in this realm). ONLY AUTHORED REALMS APPEAR HERE (§7E: missing\n"
        "   skins are legal — only a subset of realms are authored yet); placeForRealm falls back to\n"
        "   the frontier skin at roll time for every other realm id, so this is never a hole. PLACE_\n"
        "   SPACE_CELLS = GRID-LAW footprint bands in 5-ft cells (constants sourced from the DMG24\n"
        "   Bastion gather, see the comment on the constant in build/gen-place-skins.py). Consumed by\n"
        "   placeForRealm(realmId,rng,opts) (hand-written below, not generated) — src/engine/\n"
        "   codex-roll.js's rollPlace() calls it (PLACE-GEN §5 unit 2, not yet wired by this unit).\n"
        "   GENERATED from the Engine markdown source; never hand-edit — edit the source .md tables +\n"
        "   re-run `python3 build/gen-place-skins.py`. Added 2026-07-09.\n"
        "   SCENE_BUCKET_BY_ARCHETYPE/SCENE_BUCKET_DEFAULT/sceneBucketForArchetype (PLACE-GEN §5\n"
        "   unit 3) map a spine archetypeKey to the ambient scene-bucket vocabulary src/world/\n"
        "   prep.js already owns (shrine|shop|tavern|market) — hand-maintained in this generator,\n"
        "   NOT parsed from the markdown source (a scene-bucket is an engine population concern).\n"
        "   SCENE_DRESSING_BY_ARCHETYPE/SCENE_DRESSING_DEFAULT/SURFACE_TAG_BASES/\n"
        "   sceneDressingForPlace (PLACE-GEN ADDENDUM §7 unit 8) map a spine archetypeKey to\n"
        "   {propNames,surface,light} dressing — propNames matched by name against realmPropsFor's\n"
        "   real prop pool (missing skipped, never a hole), surface an abstract tag resolved against\n"
        "   REALM_SURFACES' real material vocabulary, light the archetype's authored default off\n"
        "   THEATER_LIGHT_TABLE's own vocabulary. Hand-maintained in this generator, NOT parsed from\n"
        "   the markdown source (dressing is an engine population concern, same as the scene-bucket\n"
        "   map above).\n"
        "   Classic <script> (shared global scope); defines PLACE_SPINE + PLACE_SKINS +\n"
        "   PLACE_SPACE_CELLS + placeForRealm + SCENE_BUCKET_BY_ARCHETYPE + SCENE_BUCKET_DEFAULT +\n"
        "   sceneBucketForArchetype + SCENE_DRESSING_BY_ARCHETYPE + SCENE_DRESSING_DEFAULT +\n"
        "   SURFACE_TAG_BASES + sceneDressingForPlace. */\n"
    )
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("const PLACE_SPINE=" + json.dumps(spine, ensure_ascii=False, indent=1) + ";\n")
        f.write("const PLACE_SKINS=" + json.dumps(out_skins, ensure_ascii=False, indent=1) + ";\n")
        f.write("const PLACE_SPACE_CELLS=" + json.dumps(PLACE_SPACE_CELLS, ensure_ascii=False, indent=1) + ";\n")
        f.write(f"const ARCHETYPE_BIAS_MULTIPLIER={ARCHETYPE_BIAS_MULTIPLIER};\n")
        f.write("const SCENE_BUCKET_BY_ARCHETYPE=" +
                 json.dumps({str(k): v for k, v in SCENE_BUCKET_BY_ARCHETYPE.items()}, ensure_ascii=False, indent=1) + ";\n")
        f.write(f"const SCENE_BUCKET_DEFAULT={json.dumps(SCENE_BUCKET_DEFAULT)};\n")
        f.write("const SCENE_DRESSING_BY_ARCHETYPE=" +
                 json.dumps({str(k): v for k, v in SCENE_DRESSING_BY_ARCHETYPE.items()}, ensure_ascii=False, indent=1) + ";\n")
        f.write(f"const SCENE_DRESSING_DEFAULT={json.dumps(SCENE_DRESSING_DEFAULT, ensure_ascii=False)};\n")
        f.write(f"const SURFACE_TAG_BASES={json.dumps(SURFACE_TAG_BASES, ensure_ascii=False, indent=1)};\n")
        f.write(PLACE_FOR_REALM_JS)
    print(f"  -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
