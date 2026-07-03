#!/usr/bin/env python3
"""build/gen-model-recipes.py — generate data/model-recipes.js from data/bestiary.js
(+ the §4.7 fallback vocabulary — data/items.js is read for reference/documentation
purposes only, per MODEL-GRAMMAR §4: the bestiary's own ac/actions/speed/tags fields
already carry everything a recipe needs; no item lookups are performed at generation
time). MODEL-GRAMMAR G2 (docs/MODEL-GRAMMAR.md §3/§4/§4.7).

Emits, per bestiary entry (510/510, never throws):
  { slug, base, size, modules:[{part,anchor,params?}], channels:{skin,armor,accent,glow},
    poseSeed }
— the §3 recipe shape, one per creature, keyed by bestiary id (== slug).

Derivation precedence (§4, each rule cites the field it reads off the bestiary entry):
  1. tags.type + tags.size -> base body (archetypes-2's THEATER_ARCHETYPE_BY_TYPE mapping,
     inherited verbatim from src/engine/theater-data.js so G2 never invents a second
     type->archetype table that could drift from the live combat-theater one).
  2. speed string -> movement modules (fly->wing-slab pair, swim-only->fin-ridge, burrow->
     a low-profile scalar param on the base module list).
  3. actions[] -> weapon module (ranged action->bow-arcs, thrown->spear-pole, reach melee->
     longer arm-tapered params, multiattack claws->clawed/tapered arm params) — reuses
     theater-data.js's THEATER_WEAPON_WORD_RX vocabulary against action names/text.
  4. ac bands -> armor module (<=12 none, 13-15 leather/armor channel, 16-17 chest-plate,
     18+ chest-plate+pauldrons+helm-crest "plate set").
  5. name keywords (curated list, ~25 rules; folds in dev/model-coverage-report.md's
     "§G2 consumables" class-(b) block as prop/creature-adjacent keyword rules) -> extra
     modules/channel overrides (skeleton/skull->head-skull+bone-protrusions, spider->
     thorax-abdomen+leg-spider [base override], flame/fire->ember-flecks, shadow/wraith->
     drip-tendrils+dark channels, dire/dread->bulk scalar, etc).
  6. cr -> an imposing bulk/crest scalar curve layered on top (big things read big).
  7. anything unresolved -> the archetypes-2 default figure (never worse than today) — the
     §4.7 fallback: base body only, no modules, channels all "skin"/"none".

Deterministic: two runs on the same data/bestiary.js produce byte-identical output (no
randomness, no wall-clock/env-dependent values in the emitted body — a header timestamp
line is NOT emitted for exactly this reason, matching data/class-progression.js's own
no-timestamp convention).

Also emits PART_NAMES (the full theater-parts.js §1 vocabulary, read from that file's own
PARTS registry export at generation time so the classic-script layer — theater-data.js's
resolveShapeHint — can validate a DM shape-hint against the real part vocabulary without
itself importing the ES module; PART_NAMES is a plain array baked into this SAME generated
classic-script file).

GENERATED — never hand-edit data/model-recipes.js; edit this script (or the curated
keyword tables below) and re-run. Overrides live in the separate, HAND-AUTHORED
data/model-recipe-overrides.js (never touched by this script).

Usage: python3 build/gen-model-recipes.py            (report-only)
       python3 build/gen-model-recipes.py --emit      (write data/model-recipes.js)
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BESTIARY_JS = ROOT / "data" / "bestiary.js"
PARTS_JS = ROOT / "src" / "ui" / "theater-parts.js"
OUT_JS = ROOT / "data" / "model-recipes.js"

# ============================================================================
# §1 the part vocabulary — parsed from theater-parts.js's PARTS registry block (regex,
# not an ES-module import — this is a plain python script; the registry's keys are the
# single-source-of-truth kebab-case names per that file's own header, so scraping the
# `"key": fn,` lines out of the `export const PARTS = Object.freeze({...})` block keeps
# this generator from hand-duplicating the ~42-name list and silently drifting from it).
# ============================================================================
def load_part_names():
    text = PARTS_JS.read_text(encoding="utf-8")
    m = re.search(r"export const PARTS = Object\.freeze\(\{(.*?)\}\);", text, re.S)
    if not m:
        return []
    body = m.group(1)
    return re.findall(r'"([a-z0-9-]+)":\s*\w+', body)


PART_NAMES = load_part_names()
PART_SET = set(PART_NAMES)


def require_part(name):
    """A part name this generator emits MUST exist in the real theater-parts.js vocabulary
    (§4b: 'picked from the CLOSED part vocabulary') — fail loudly at generation time (not
    510 silent drops at runtime) if a curated rule below references a part that doesn't
    exist. Bestiary-DERIVED unknowns (§4.7 fallback path) never hit this; only this
    script's own hand-authored rule tables do."""
    if name not in PART_SET:
        raise SystemExit("gen-model-recipes: rule references unknown part '%s' (not in theater-parts.js PARTS)" % name)
    return name


# ============================================================================
# §4 rule 1 — tags.type + tags.size -> base body. INHERITED VERBATIM from
# src/engine/theater-data.js's THEATER_ARCHETYPE_BY_TYPE / THEATER_GIANT_SIZE_TYPES /
# THEATER_GIANT_SIZES / THEATER_QUAD_WORD_RX / THEATER_ARACHNID_WORD_RX so the recipe base
# body and the live-combat archetype fallback can never independently drift — same
# creature always buckets the same base whether or not it has a recipe (Decision 6: "the
# archetypes-2 default figure (never worse than today)").
# archetype key -> §1 base body part name.
# ============================================================================
ARCHETYPE_TO_BASE = {
    "biped": require_part("torso-biped"),
    "quadruped": require_part("torso-quad"),
    "giant": require_part("torso-biped-huge"),
    "ooze": require_part("blob-mass"),
    "aberration": require_part("horror-mass"),
    "amorphous-horror": require_part("horror-mass"),
    "arachnid": require_part("thorax-abdomen"),
    "swarm": require_part("swarm-scatter"),
    "serpent": require_part("serpent-coil"),
    "flyer": require_part("torso-biped"),  # theater-data.js has no dedicated "flyer" archetype bucket
                                            # today (buildFlyer is a T1 inline core, not a §1 body) —
                                            # bases on biped; the movement rule (§4 rule 2) below layers
                                            # wing-slab on top regardless of base, which is what actually
                                            # signals "this thing flies" in the recipe.
}

TYPE_TO_ARCHETYPE = {
    "humanoid": "biped", "fiend": "biped", "celestial": "biped",
    "undead": "biped", "construct": "biped", "fey": "biped",
    "beast": "quadruped", "monstrosity": "quadruped", "dragon": "quadruped",
    "plant": "quadruped", "elemental": "quadruped",
    "giant": "giant", "ooze": "ooze", "aberration": "amorphous-horror",
    "swarm": "swarm",
}
GIANT_SIZE_TYPES = {"humanoid", "fiend", "celestial", "undead", "construct", "fey"}
GIANT_SIZES = {"huge", "gargantuan"}
QUAD_WORD_RX = re.compile(r"\b(elk|worg|wolf|horse|bear|stag|hound|steed|boar|lion|tiger|panther|hyena|dog)\b", re.I)
ARACHNID_WORD_RX = re.compile(r"spider|arachnid|tarantula", re.I)
SERPENT_WORD_RX = re.compile(r"\b(serpent|snake|naga|wyrm(?!ling)|viper)\b", re.I)


def archetype_for(creature_type, size, name):
    t = (creature_type or "").lower()
    s = (size or "").lower()
    n = name or ""
    if "swarm" in t:
        return "swarm"
    if ARACHNID_WORD_RX.search(n):
        return "arachnid"
    if t == "giant":
        return "giant"
    if t in GIANT_SIZE_TYPES and s in GIANT_SIZES:
        if QUAD_WORD_RX.search(n):
            return "quadruped"
        return "giant"
    # a serpent-shaped name on an otherwise-quadruped-mapped row (beast/monstrosity/dragon) reads
    # far better on serpent-coil than a 4-legged quadruped body — narrow name-keyword override,
    # same discipline as the arachnid override above (theater-data.js has no serpent bucket of its
    # own yet; this is a G2-local refinement layered on top of the inherited base table, still
    # falling within the "unresolved -> archetypes-2 default" guarantee since serpent-coil IS one
    # of the 8 body parts theater-data.js's own fallback figures already use for a "serpent" unit
    # kind... note theater-data.js itself has no "serpent" archetype key either (buildSerpent is a
    # standalone T1 archetype, not reachable via THEATER_ARCHETYPE_BY_TYPE) — kept as a recipe-only
    # refinement, never changes what a non-recipe fallback figure renders.
    if t in ("beast", "monstrosity", "dragon") and SERPENT_WORD_RX.search(n):
        return "serpent"
    if t in TYPE_TO_ARCHETYPE:
        return TYPE_TO_ARCHETYPE[t]
    return "biped"


# ============================================================================
# §4 rule 2 — movement -> locomotion modules, read off the bestiary `speed` string.
# ============================================================================
FLY_RX = re.compile(r"\bfly\b", re.I)
SWIM_RX = re.compile(r"\bswim\b", re.I)
BURROW_RX = re.compile(r"\bburrow\b", re.I)
WALK_RX = re.compile(r"^\s*(\d+)\s*ft", re.I)


def movement_modules(speed, archetype):
    mods = []
    scalars = {}
    s = speed or ""
    has_fly = bool(FLY_RX.search(s))
    has_swim = bool(SWIM_RX.search(s))
    has_burrow = bool(BURROW_RX.search(s))
    walk_m = WALK_RX.match(s.strip())
    walk_speed = int(walk_m.group(1)) if walk_m else None
    if has_fly:
        mods.append({"part": require_part("wing-slab"), "anchor": "shoulders", "params": {"side": -1}})
        mods.append({"part": require_part("wing-slab"), "anchor": "shoulders", "params": {"side": 1}})
    # swim-only: swims but doesn't fly AND (no real walk speed, or walk is 0/5ft — a fish-shaped
    # thing that can technically shuffle isn't "swim-only" if it also strides around on land).
    if has_swim and not has_fly and (walk_speed is None or walk_speed <= 5):
        mods.append({"part": require_part("fin-ridge"), "anchor": "back"})
    if has_burrow and not has_fly:
        scalars["lowProfile"] = 0.85  # a low-profile scalar param, not a module — layered onto the
                                        # base body's own build params by the (future G3) loadout/recipe
                                        # resolver; recorded here so the recipe DATA carries the signal
                                        # even before a burrow-specific geometry treatment exists.
    return mods, scalars


# ============================================================================
# §4 rule 3 — actions -> weapon module. Reuses theater-data.js's own weapon-word vocabulary
# (THEATER_WEAPON_WORD_RX) for consistency with the live-combat fallback's weapon read, plus
# a ranged/thrown/reach/multiattack-claws refinement layered on top per the spec's letter.
# ============================================================================
WEAPON_WORD_RX = [
    ("bow", re.compile(r"(cross)?bow\b", re.I)),
    ("axe", re.compile(r"axe\b", re.I)),
    ("spear", re.compile(r"\b(spear|pike|lance|trident|halberd|glaive)\b", re.I)),
    ("staff", re.compile(r"\b(staff|quarterstaff|wand|rod)\b", re.I)),
    ("dagger", re.compile(r"\b(dagger|dirk|knife)\b", re.I)),
    ("mace", re.compile(r"(mace|club|hammer|flail|morningstar)\b", re.I)),
    ("sword", re.compile(r"sword\b|\b(blade|rapier|scimitar|saber|falchion)\b", re.I)),
]
WEAPON_TO_PART = {
    "bow": "bow-arcs", "axe": "axe-wedge", "spear": "spear-pole", "staff": "staff-tipped",
    "dagger": "dagger-slabs", "mace": "club-mass", "sword": "sword-slab",
}
for _wk in WEAPON_TO_PART.values():
    require_part(_wk)

RANGED_ACTION_RX = re.compile(r"ranged attack roll", re.I)
THROWN_RX = re.compile(r"\bthrown\b", re.I)
REACH_RX = re.compile(r"reach\s+(\d+)\s*ft", re.I)
MULTIATTACK_CLAW_RX = re.compile(r"\bclaws?\b", re.I)


def weapon_module(name, actions, archetype):
    # only biped/giant archetypes have a mainHand anchor that reads as "wielding a weapon" in the
    # existing figure vocabulary (quadruped/arachnid/serpent/swarm/ooze bodies best-effort a mainHand
    # transform per the anchor contract's unconditional-export rule, but a spider holding a sword is
    # not a real bestiary shape) — weapon derivation is scoped to the two humanoid-proportioned bases,
    # matching theater-data.js's own theaterWeaponForFoe scope (biped/giant only get a weaponMeshFor call).
    if archetype not in ("biped", "giant"):
        return None, {}
    haystacks = [name or ""] + [((a or {}).get("name") or "") for a in (actions or [])]
    haystacks += [((a or {}).get("text") or "") for a in (actions or [])]
    key = None
    is_ranged = False
    is_thrown = False
    reach = None
    has_claw_multiattack = False
    for a in (actions or []):
        text = (a or {}).get("text") or ""
        aname = (a or {}).get("name") or ""
        if aname.lower() == "multiattack" and MULTIATTACK_CLAW_RX.search(text):
            has_claw_multiattack = True
        if RANGED_ACTION_RX.search(text):
            is_ranged = True
        if THROWN_RX.search(text):
            is_thrown = True
        rm = REACH_RX.search(text)
        if rm:
            reach = max(reach or 0, int(rm.group(1)))
    for hay in haystacks:
        for wk, rx in WEAPON_WORD_RX:
            if rx.search(hay):
                key = wk
                break
        if key:
            break
    params = {}
    if key is None:
        if is_ranged:
            key = "bow"
        elif is_thrown:
            key = "spear"
        elif has_claw_multiattack:
            return None, {"clawedArms": True}  # no weapon slab — a clawed-arm param instead (arm-tapered
                                                  # taper/tint refinement), matching "multiattack claws ->
                                                  # clawed arm taper" from §4 rule 3's letter.
        else:
            return None, {}
    if reach and reach > 5:
        params["longReach"] = True  # "reach melee -> longer arm params" — recorded as a param flag on
                                      # the weapon module entry; the (future) resolver reads this to
                                      # lengthen arm-tapered's segLen.
    part = WEAPON_TO_PART[key]
    mod = {"part": part, "anchor": "mainHand"}
    if params:
        mod["params"] = params
    return mod, {}


# ============================================================================
# §4 rule 4 — AC bands -> armor module + channel.
# ============================================================================
def armor_modules(ac, archetype):
    if archetype not in ("biped", "giant"):
        return [], "none"
    a = ac if isinstance(ac, (int, float)) else 10
    if a <= 12:
        return [], "none"
    if a <= 15:
        return [], "leather"
    if a <= 17:
        return [{"part": require_part("chest-plate"), "anchor": "mount"}], "armor"
    return [
        {"part": require_part("chest-plate"), "anchor": "mount"},
        {"part": require_part("pauldrons"), "anchor": "shoulders"},
        {"part": require_part("helm-crest"), "anchor": "head"},
    ], "armor"


# ============================================================================
# §4 rule 5 — name-keyword curated table (~25 rules). Each entry: (regex, extra modules[],
# channel overrides{}, base override|None, scalar overrides{}). Folds in
# dev/model-coverage-report.md's "§G2 consumables" class-(b) block (creature/prop-adjacent
# keyword -> existing-part mappings) alongside MODEL-GRAMMAR §4's own worked examples
# (skeleton/skull, spider, flame/fire, shadow/wraith, dire/dread). Order matters — first
# match per creature wins for BASE overrides (a creature can still accumulate multiple
# extra-module rules if more than one keyword matches; base-override rules are mutually
# exclusive by construction below since each targets a distinct name-keyword family).
# ============================================================================
NAME_RULES = [
    # --- skeleton/skull family (§4 rule 5's own worked example) ---
    (re.compile(r"skeleton|skull|bone(?!fire)", re.I),
     [{"part": require_part("head-skull"), "anchor": "head"},
      {"part": require_part("bone-protrusions"), "anchor": "shoulders"}],
     {}, None, {}),
    # --- spider/arachnid family (§4 rule 5's own worked example; base override to thorax-abdomen +
    #     leg-spider x8 — mirrors theater-data.js's own THEATER_ARACHNID_WORD_RX override) ---
    (ARACHNID_WORD_RX,
     [{"part": require_part("leg-spider"), "anchor": "base", "params": {"side": 1, "idx": i, "count": 4}} for i in range(4)] +
     [{"part": require_part("leg-spider"), "anchor": "base", "params": {"side": -1, "idx": i, "count": 4}} for i in range(4)],
     {}, "arachnid", {}),
    # --- flame/fire family (§4 rule 5's own worked example) ---
    (re.compile(r"flam(?:e|ing|es)|fire(?!fly)|ember|magma|ash(?!en\b)", re.I),
     [{"part": require_part("ember-flecks"), "anchor": "mount"}],
     {"glow": "fire"}, None, {}),
    # --- shadow/wraith family (§4 rule 5's own worked example) ---
    (re.compile(r"shadow|wraith|specter|spectre|banshee", re.I),
     [{"part": require_part("drip-tendrils"), "anchor": "base"}],
     {"skin": "shadow-dark", "accent": "shadow-dark"}, None, {}),
    # --- dire/dread bulk family (§4 rule 5's own worked example: "bulk scalar") ---
    (re.compile(r"\b(dire|dread|elder|ancient|greater)\b", re.I),
     [], {}, None, {"bulk": 1.15}),
    # --- horned family ---
    (re.compile(r"horned|demon|devil|imp\b|fiendish", re.I),
     [{"part": require_part("head-horned"), "anchor": "head"}], {}, None, {}),
    # --- eyeless/blind family ---
    (re.compile(r"eyeless|blind(?!ed)|faceless", re.I),
     [{"part": require_part("head-eyeless"), "anchor": "head"}], {}, None, {}),
    # --- ooze/slime family (base override, mirrors theater-data.js's ooze type bucket for name-only hits) ---
    (re.compile(r"ooze|slime|pudding|jelly\b|gelatinous", re.I),
     [], {}, "ooze", {}),
    # --- swarm family (name-only hits not already tagged type:swarm) ---
    (re.compile(r"\bswarm\b", re.I),
     [], {}, "swarm", {}),
    # --- serpent/snake family ---
    (SERPENT_WORD_RX, [], {}, "serpent", {}),
    # --- radiant/holy family ---
    (re.compile(r"angel|celestial|radiant|seraph|archon", re.I),
     [{"part": require_part("glow-halo"), "anchor": "head"}], {"glow": "radiant"}, None, {}),
    # --- caster/spellcaster silhouette (robe-skirt + staff, when not already weaponed by rule 3) ---
    (re.compile(r"mage|sorcerer|wizard|warlock|witch|shaman|cultist|priest|cleric|druid", re.I),
     [{"part": require_part("robe-skirt"), "anchor": "base"}], {}, None, {}),
    # --- cage/prisoner-adjacent creature dressing (audit §G2 consumables: cage-frame is class (c);
    #     G4 built it — a caged/gibbeted/imprisoned creature carries a cage-frame at its `back`
    #     anchor, params.cheap=true (the open-bottomed hanging-cage read, per that part's own doc). ---
    (re.compile(r"gibbet|caged|imprisoned", re.I),
     [{"part": require_part("cage-frame"), "anchor": "back", "params": {"cheap": True}}], {}, None, {}),
    # --- statue/construct-guardian dressing (audit #2 statue-figure; G4 built it — this rule keeps
    #     the creature's OWN base body (a living/animated statue still fights with its real anatomy),
    #     adding a statue-figure at `mount` purely as a stone-plinth companion prop read + a stone
    #     channel hint so the creature itself tints like carved stone). ---
    (re.compile(r"gargoyle|animated statue|living statue", re.I),
     [{"part": require_part("statue-figure"), "anchor": "mount", "params": {"scale": 0.6}}],
     {"skin": "crystal"}, None, {}),
    # --- web/spider-dressing (audit #9 web-mass; G4 built it — a web-spinning/webbed creature now
    #     carries an actual web-mass module at `back`, on top of the arachnid base above when the
    #     spider keyword also matches). ---
    (re.compile(r"web-?spinning|webbed", re.I),
     [{"part": require_part("web-mass"), "anchor": "back", "params": {}}], {"accent": "web"}, None, {}),
    # --- crystal/gem family ---
    (re.compile(r"crystal|gem(?:stone)?|diamond|prismatic", re.I),
     [], {"skin": "crystal", "accent": "crystal"}, None, {}),
    # --- plant/fungal family (audit #10 mushroom-cluster; G4 built it — a fungal/mold/spore/mushroom
    #     creature now carries an actual mushroom-cluster module at `back`, on top of the channel hint). ---
    (re.compile(r"fungus|fungal|mushroom|mold|spore", re.I),
     [{"part": require_part("mushroom-cluster"), "anchor": "back", "params": {}}], {"skin": "fungal"}, None, {}),
    # --- ice/frost family ---
    (re.compile(r"frost|ice\b|frozen|glacial", re.I),
     [], {"skin": "frost", "glow": "frost"}, None, {}),
    # --- poison/venom family ---
    (re.compile(r"venom|poison|toxic", re.I),
     [], {"accent": "poison"}, None, {}),
    # --- armored/plated name-hint (on TOP of the AC-band rule, for a creature whose name promises
    #     armor its AC band alone might undershoot, e.g. a low-AC "Armored" skirmisher variant) ---
    (re.compile(r"armored|plated|carapace", re.I),
     [{"part": require_part("chest-plate"), "anchor": "mount"}], {"armor": "plate"}, None, {}),
    # --- winged name-hint (independent of the speed-string fly check — covers "wing" in name for a
    #     creature whose speed string doesn't parse as flying, e.g. a grounded winged-but-flightless
    #     variant that should still read visually winged) ---
    (re.compile(r"\bwinged\b|harpy|griffon|gargoyle", re.I),
     [{"part": require_part("wing-slab"), "anchor": "shoulders", "params": {"side": -1}},
      {"part": require_part("wing-slab"), "anchor": "shoulders", "params": {"side": 1}}],
     {}, None, {}),
    # --- tentacled/aberrant name-hint ---
    (re.compile(r"tentacle|beholder|mind ?flayer|illithid|aboleth", re.I),
     [], {}, "aberration", {}),
    # --- giant-vermin bulk (rat/spider/insect kept giant-sized reads bigger without a type override) ---
    (re.compile(r"^giant ", re.I),
     [], {}, None, {"bulk": 1.1}),
    # --- shell/carapace family (audit's carapace already covered above; this adds a shield-read slab
    #     for turtle/crab-shaped things as a cheap stand-in, per the audit's "cheap stand-in" pattern) ---
    (re.compile(r"turtle|tortoise|crab\b|beetle\b", re.I),
     [{"part": require_part("shield-slab"), "anchor": "back"}], {}, None, {}),
    # === §"G2 consumables" — dev/model-coverage-report.md class-(b) block, folded in verbatim as
    # keyword->part mapping rules (creature-NAME hits only; the walk-feature/prop side of this same
    # block is G4's scope per the task brief — these rows only fire when a bestiary creature's own
    # name happens to carry one of these nouns, e.g. a "Barrel Golem" or "Cage Horror" flavor name). ===
    (re.compile(r"\b(barrel|keg|cask|hogshead|urn|jar|vat|cauldron)\b", re.I),
     [{"part": require_part("crate"), "anchor": "base", "params": {"round": True}}], {}, None, {}),
    (re.compile(r"\b(obelisk|standing.?stone|menhir|monolith|totem)\b", re.I),
     [{"part": require_part("pillar-broken"), "anchor": "base", "params": {"intact": True}}], {}, None, {}),
    (re.compile(r"\b(signpost|banner|standard.?bearer)\b", re.I),
     [{"part": require_part("banner-pole"), "anchor": "back"}], {}, None, {}),
]
for _rx, _mods, _ch, _base, _sc in NAME_RULES:
    for _m in _mods:
        require_part(_m["part"])


def name_keyword_rules(name):
    extra_mods = []
    channel_overrides = {}
    base_override = None
    scalars = {}
    n = name or ""
    for rx, mods, ch, base, sc in NAME_RULES:
        if rx.search(n):
            extra_mods.extend(mods)
            channel_overrides.update(ch)
            if base_override is None and base:
                base_override = base
            scalars.update(sc)
    return extra_mods, channel_overrides, base_override, scalars


# ============================================================================
# §4 rule 6 — CR imposing-scalar curve.
# ============================================================================
def cr_scalar(cr):
    try:
        c = float(cr) if cr is not None else 0.0
    except (TypeError, ValueError):
        c = 0.0
    if c >= 15:
        return {"bulk": 1.35, "crest": True}
    if c >= 8:
        return {"bulk": 1.2}
    if c >= 3:
        return {"bulk": 1.08}
    return {}


# ============================================================================
# §5 channels — base channel map every recipe carries (skin/armor/accent/glow), refined by
# rules 4/5 above. Never a literal color (§5's own letter) — always a semantic slot name.
# ============================================================================
def base_channels():
    return {"skin": "default", "armor": "none", "accent": "none", "glow": "none"}


# ============================================================================
# THE GENERATOR — one bestiary entry -> one recipe. Never throws: every field read is
# defensively defaulted (the bestiary carries a handful of legacy/reference rows with null
# type/size/name — see the null-tags rows this generator was built against) so rule 7's
# "anything unresolved -> the archetypes-2 default figure" is a REAL fallback path this
# script actually exercises, not just a comment.
# ============================================================================
def build_recipe(slug, entry):
    name = entry.get("name") or slug
    tags = entry.get("tags") or {}
    ctype = tags.get("type")
    size = tags.get("size")
    # the malformed-size guard: one legacy row (archdruid, a 2014-edition reference block) carries
    # tags.size == "(the" (a frontmatter parse artifact, not a real size token) — never let a
    # non-SRD-size string reach the size-override logic; treat it as unknown/None instead.
    if size and size not in ("tiny", "small", "medium", "large", "huge", "gargantuan"):
        size = None
    ac = entry.get("ac")
    cr = entry.get("cr")
    speed = entry.get("speed") or ""
    actions = entry.get("actions") or []

    archetype = archetype_for(ctype, size, name)
    extra_mods_kw, channel_over_kw, base_override, scalars_kw = name_keyword_rules(name)
    if base_override:
        archetype = base_override
    base = ARCHETYPE_TO_BASE.get(archetype, ARCHETYPE_TO_BASE["biped"])

    modules = []
    move_mods, move_scalars = movement_modules(speed, archetype)
    modules.extend(move_mods)

    weapon_mod, weapon_flags = weapon_module(name, actions, archetype)
    if weapon_mod:
        modules.append(weapon_mod)

    armor_mods, armor_channel = armor_modules(ac, archetype)
    modules.extend(armor_mods)

    modules.extend(extra_mods_kw)

    channels = base_channels()
    if armor_channel != "none":
        channels["armor"] = armor_channel
    channels.update(channel_over_kw)

    scalars = {}
    scalars.update(move_scalars)
    scalars.update(weapon_flags)
    scalars.update(scalars_kw)
    scalars.update(cr_scalar(cr))

    recipe = {
        "slug": slug,
        "base": base,
        "size": (size or "medium"),
        "modules": modules,
        "channels": channels,
        "poseSeed": slug,
    }
    if scalars:
        recipe["scalars"] = scalars
    return recipe


def load_bestiary():
    text = BESTIARY_JS.read_text(encoding="utf-8")
    start = text.index("const BESTIARY={") + len("const BESTIARY=")
    end = text.index("const BESTIARY_BY_CR=")
    body = text[start:end].rstrip().rstrip(";").rstrip()
    return json.loads(body)


def emit(recipes, part_names):
    lines = []
    lines.append("/* GENESIS DATA (generated) — data/model-recipes.js")
    lines.append("   MODEL-GRAMMAR G2 (docs/MODEL-GRAMMAR.md §3/§4) — one recipe per data/bestiary.js")
    lines.append("   entry: {slug, base, size, modules:[{part,anchor,params?}], channels, poseSeed}.")
    lines.append("   Derived deterministically off bestiary type/size/speed/actions/ac/name/cr — the")
    lines.append("   script owns the look (§4's precedence rules); the part vocabulary itself lives in")
    lines.append("   src/ui/theater-parts.js (G1). data/model-recipe-overrides.js is the separate")
    lines.append("   HAND-AUTHORED file that wins by slug (never touched by this generator).")
    lines.append("   GENERATED by build/gen-model-recipes.py — DO NOT hand-edit; edit that script (or")
    lines.append("   the overrides file for one-off art direction) and re-run. Classic <script> (shared")
    lines.append("   global scope); defines MODEL_RECIPES + PART_NAMES.")
    lines.append("   PART_NAMES is a plain array snapshot of theater-parts.js's own PARTS registry keys")
    lines.append("   (scraped at generation time), so the classic-script layer (theater-data.js's")
    lines.append("   resolveShapeHint) can validate a DM shape-hint against the real part vocabulary")
    lines.append("   without importing the ES module — the classic/module boundary stays one-way. */")
    lines.append("const MODEL_RECIPES=" + json.dumps(recipes, indent=1, sort_keys=True) + ";")
    lines.append("const PART_NAMES=" + json.dumps(sorted(part_names)) + ";")
    lines.append("")
    return "\n".join(lines)


def main():
    emit_flag = "--emit" in sys.argv
    bestiary = load_bestiary()
    slugs = sorted(bestiary.keys())
    recipes = {}
    rule_fire_counts = {
        "type_base": {}, "fly": 0, "swim": 0, "burrow": 0, "weapon": 0,
        "armor_leather": 0, "armor_chest": 0, "armor_plate_set": 0,
        "name_keyword_hits": 0, "cr_scalar": 0, "fallback_pure": 0,
    }
    for slug in slugs:
        entry = bestiary[slug]
        try:
            r = build_recipe(slug, entry)
        except Exception as e:  # never throws — §7.1's 510/510 zero-throws gate
            print("ERROR building recipe for", slug, ":", e, file=sys.stderr)
            raise
        recipes[slug] = r
        # coverage tallies for the report
        rule_fire_counts["type_base"][r["base"]] = rule_fire_counts["type_base"].get(r["base"], 0) + 1
        mod_parts = [m["part"] for m in r["modules"]]
        if "wing-slab" in mod_parts:
            rule_fire_counts["fly"] += 1
        if "fin-ridge" in mod_parts:
            rule_fire_counts["swim"] += 1
        if r.get("scalars", {}).get("lowProfile"):
            rule_fire_counts["burrow"] += 1
        if any(m["anchor"] == "mainHand" for m in r["modules"]):
            rule_fire_counts["weapon"] += 1
        if r["channels"]["armor"] == "leather":
            rule_fire_counts["armor_leather"] += 1
        if "chest-plate" in mod_parts and "pauldrons" not in mod_parts:
            rule_fire_counts["armor_chest"] += 1
        if "pauldrons" in mod_parts and "helm-crest" in mod_parts:
            rule_fire_counts["armor_plate_set"] += 1
        if r.get("scalars", {}).get("bulk"):
            rule_fire_counts["cr_scalar"] += 1
        if not r["modules"] and r["channels"]["armor"] == "none" and not r.get("scalars"):
            rule_fire_counts["fallback_pure"] += 1

    part_names = PART_NAMES

    print("gen-model-recipes: %d/%d bestiary entries -> recipes" % (len(recipes), len(slugs)))
    print("  base-body distribution:", json.dumps(rule_fire_counts["type_base"], sort_keys=True))
    print("  fly (wing-slab):", rule_fire_counts["fly"])
    print("  swim-only (fin-ridge):", rule_fire_counts["swim"])
    print("  burrow (lowProfile scalar):", rule_fire_counts["burrow"])
    print("  weapon module attached:", rule_fire_counts["weapon"])
    print("  armor band — leather channel:", rule_fire_counts["armor_leather"])
    print("  armor band — chest-plate only:", rule_fire_counts["armor_chest"])
    print("  armor band — full plate set:", rule_fire_counts["armor_plate_set"])
    print("  cr bulk scalar applied:", rule_fire_counts["cr_scalar"])
    print("  pure §4.7 fallback (no modules/armor/scalars):", rule_fire_counts["fallback_pure"])
    print("  part vocabulary size (PART_NAMES):", len(part_names))

    if emit_flag:
        out = emit(recipes, part_names)
        OUT_JS.write_text(out, encoding="utf-8")
        print("wrote", OUT_JS)
    else:
        print("(report-only — pass --emit to write data/model-recipes.js)")


if __name__ == "__main__":
    main()
