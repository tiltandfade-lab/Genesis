#!/usr/bin/env python3
"""build/gen-model-recipes.py — generate data/model-recipes.js from data/bestiary.js
(+ the §4.7 fallback vocabulary — data/items.js is read for reference/documentation
purposes only, per MODEL-GRAMMAR §4: the bestiary's own ac/actions/speed/tags fields
already carry everything a recipe needs; no item lookups are performed at generation
time). MODEL-GRAMMAR G2 (docs/MODEL-GRAMMAR.md §3/§4/§4.7).

Emits, per bestiary entry (510/510, never throws):
  { slug, base, size, modules:[{part,anchor,params?}], channels:{skin,armor,accent,glow},
    poseSeed, scalars?, stance?, translucent? }
— the §3 recipe shape, one per creature, keyed by bestiary id (== slug). `scalars`/`stance`/
`translucent` are only emitted when non-default (G5 ROUND-1 rulings 1/4/5 — see that dated block
below) — most recipes still carry no stance/translucent key at all, matching `scalars`' own
existing only-if-non-empty convention.

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

G5 ROUND-1 (2026-07-03, Adam live-review rulings — docs/MODEL-GRAMMAR.md unchanged, this generator's
own rule table grows in place):
  - ruling 1, NATURAL CHANNELS: a new pre-pass (natural_channels_for, PALETTE_BY_TYPE +
    PALETTE_NAME_RULES) resolves skin/accent to a creature's own natural-identity palette family
    (skeleton->bone-white, zombie->sickly-grey-green, goblinoid->olive-dun, wolf/beast->
    grey-brown-fur, ooze->murky-green, fiend->dark-red-black, ghost/celestial->pale-blue-grey, ...) —
    ALL desaturated within the Vagrant Story mood family (docs/BATTLE-THEATER.md §0), applied BEFORE
    rule 4's armor channel and rule 5's own channel overrides so both existing precedence layers still
    win where they're more specific (shadow-dark still beats this rule's own pale-blue-grey pick for a
    wraith, etc.). Foe figures now read their own species color instead of one flat per-KIND foe tint;
    PC gold/ally blue are UNCHANGED (theater-boot.js's recipeChannelTints only applies a recipe's
    channels for foe-kind units — see that function's own G5 comment).
  - ruling 4, TRANSLUCENT: a `translucent: true` recipe-level flag (keyword: ghost|spectre|
    spectre|wraith|spirit|phantom|shadow[- ]?) — see translucent_for() below — wired to figure opacity
    ~0.45 + depthWrite off in theater-boot.js's buildFigureFromRecipe.
  - ruling 5, STANCE: a `stance` recipe-level field (hunched|slouched|crouched) — see stance_for()
    below — goblinoid keyword->hunched (+ ~1.25x head-module scale), zombie keyword->slouched,
    rogue/ambusher-adjacent->crouched, cultist|acolyte|priest of->an explicit robe-skirt module (on
    top of rule 5's existing broader caster-silhouette keyword rule, which already covers this family
    generically — this one is the EXPLICIT ruling-5 keyword list, narrower and redundant-by-design
    with the existing caster rule so the ruling's own letter is directly satisfied, not just implied).

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
        # FRAME RETARGET (2026-07-03): wings attach at the `back` anchor (shoulder-blade height,
        # y=0.85) with yBase:0 so a wing sits AT its attach point, not a body-height above it — the
        # old `shoulders` anchor (y=1.0) stacked on wing-slab's own absolute y~0.8 -> wings floated
        # above the head. See wing-slab's own FRAME-RETARGET header.
        mods.append({"part": require_part("wing-slab"), "anchor": "back", "params": {"side": -1, "yBase": 0}})
        mods.append({"part": require_part("wing-slab"), "anchor": "back", "params": {"side": 1, "yBase": 0}})
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
# CARRY STATES (L14/L15): a heavy two-handed melee name -> the weapon module carries heavy:true so the
# render code (theater-boot.js weaponCarryFor) routes it to the BACK-mount carry (a greatsword rides
# the back, not one hand). A weapon-part key alone can't distinguish a longsword (versatile, held) from
# a greatsword (heavy 2H, back) — both are "sword-slab" — so this name signal rides on the module.
# Scoped to blade/blunt great-weapons (poles plant + bows are held regardless, per the ruling), which
# weapon_module's own default carry already handles; heavy only ever promotes a held-fist weapon.
HEAVY_2H_RX = re.compile(r"\bgreat(sword|axe|club|maul)?\b|\bmaul\b|two-handed|greataxe|greatsword", re.I)


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
    # CARRY STATES (L14): flag a heavy two-handed melee so the render code back-mounts it. Only a
    # blade/blunt part can be heavy-promoted (poles/bows keep their own carry); the flag is inert on
    # those, so it's safe to set purely off the name without re-checking the part here.
    if any(HEAVY_2H_RX.search(h) for h in haystacks):
        params["heavy"] = True
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
    #     variant that should still read visually winged). FRAME RETARGET: same `back`+yBase:0 wiring
    #     as the movement fly rule above (shoulder-blade height, not floating above the head). ---
    (re.compile(r"\bwinged\b|harpy|griffon|gargoyle", re.I),
     [{"part": require_part("wing-slab"), "anchor": "back", "params": {"side": -1, "yBase": 0}},
      {"part": require_part("wing-slab"), "anchor": "back", "params": {"side": 1, "yBase": 0}}],
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
    # === FIGURE-FIDELITY ROUND-2 UNIT 2 ===
    # --- maw-open (L4 "one signature feature per creature" — the wolf-jaw rule): predator names get
    #     an open toothed jaw at the `head` anchor, the single feature that reads "predator" at 100px.
    #     Curated keyword list (not NLP): wolf/worg/dire/predator/hound/dragon/ghoul/crocodile-family.
    #     Adds the maw as a MODULE (not a base override) so it layers on whatever body the creature's
    #     type already picked (a quadruped wolf keeps torso-quad + gains the maw; a dragon keeps its
    #     quadruped body + gains the maw). ---
    (re.compile(r"wolf|worg|\bdire\b|predator|hound|jackal|hyena|dragon|wyvern|drake|ghoul|ghast|"
                r"crocodile|croc\b|lizard(?:folk)?|raptor|\bshark\b|\bwolves\b", re.I),
     [{"part": require_part("maw-open"), "anchor": "head", "params": {"open": 1}}], {}, None, {}),
]

# --- torso-tapered (L6 "a box torso reads as a crate; a tapered wedge reads as a body"): humanoid
#     SOLDIER-types get the athletic V-taper body (shoulders wider than hips) instead of the flat
#     torso-biped crate. This is a BASE-PART swap applied as a POST-STEP (NOT a NAME_RULES base
#     override), for a deliberate reason: torso-tapered reuses torso-biped's OWN frame/anchors, so it
#     is biped-EQUIVALENT for every OTHER derivation rule (weapon at mainHand, armor bands, arm/leg
#     limbs). Routing it through the archetype system would flip `archetype` away from "biped" and
#     silently strip the creature's weapon + armor (those rules gate on archetype in ("biped","giant")).
#     So the archetype STAYS "biped" (weapon/armor/limbs all fire normally) and only the final base
#     PART is swapped torso-biped -> torso-tapered when the name is a martial humanoid AND the archetype
#     actually resolved to a plain biped (never overrides a giant/quadruped/etc. — a "Dragon Knight"
#     keeps its dragon body). Curated keyword list, the family whose square-shouldered crate read hurts
#     most. ---
SOLDIER_TAPER_RX = re.compile(
    r"soldier|knight|guard(?:ian)?|veteran|warrior|gladiator|legionnaire|hoplite|"
    r"myrmidon|champion|warlord|swordsman|berserker|barbarian|mercenary|"
    r"\bguard\b|man-at-arms|footman|infantry|cavalier", re.I)


def soldier_taper_base(name, archetype, base):
    """Swap a plain-biped base to torso-tapered for martial-humanoid names; leave everything else
    (base + archetype) untouched. archetype stays "biped" upstream so weapon/armor still fire."""
    if archetype == "biped" and base == "torso-biped" and SOLDIER_TAPER_RX.search(name or ""):
        return require_part("torso-tapered")
    return base
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
# FIGURE-FIDELITY ROUND-2 UNIT 3 — FAMILY PROPORTION PRESETS (REFERENCE-DIRECTION L3 "proportion
# exaggeration per family: signature features scaled 1.3-2x... legs err stumpy. Uniform realistic
# proportions are the failure mode"). Per creatureType/family, a set of PER-PART proportion scalars the
# render code (theater-boot.js's buildFigureFromRecipe) applies at assembly — headScale (head box),
# handScale (arm/fist), legScale (leg length), torsoScale (torso girth). Err toward exaggeration.
#
# TABLE SHAPE (deliberate, per the director's L15 note): a plain per-family dict of scalar KEYS, so a
# STANCE preset field (soldiers square / rogues crouched / brutes hunched, next round) can join this
# same table as another key per family WITHOUT a generator rework — proportion scalars and a future
# `stance` value live side by side in one family record. Keep values conservative-but-visible; the
# shape-primitive layer (L13) will refine how the taper reads, not these ratios.
#
# PRECEDENCE (documented so it can't drift): a family preset lays down the BASE proportion; a
# name-keyword refinement (goblinoid) OVERRIDES the coarse type base where it's more specific (a
# goblin is humanoid-typed but needs the oversized-head/stumpy-legs read the generic humanoid preset
# doesn't give); the existing hunched-stance headScale (1.25) and cr_scalar bulk are applied AFTER and
# WIN where they set the same key (a goblinoid's own hunch headScale is close to the preset's anyway;
# cr bulk is orthogonal to head/hand/leg). Every value is a MULTIPLIER (1.0 = unchanged).
PROPORTION_BY_TYPE = {
    # coarse per-creatureType base proportions — err toward exaggeration, uniform-realistic is the fail.
    "humanoid": {},                                        # plain humans stay 1.0 (a soldier's V-taper is the body swap, not a scalar)
    "undead": {"torsoScale": 0.85},                        # gaunt — a hollowed, narrower torso
    "fiend": {"handScale": 1.35, "headScale": 1.1},        # clawed hands, a heavier head
    "celestial": {"torsoScale": 1.05},                     # a touch broader/nobler
    "fey": {"headScale": 1.1, "legScale": 0.9},            # slightly large-headed, small
    "construct": {"torsoScale": 1.15, "handScale": 1.2},   # blocky, heavy-limbed
    "beast": {"headScale": 1.3},                           # the maw/head reads big (the maw module + this)
    "monstrosity": {"headScale": 1.25, "handScale": 1.2},  # oversized features
    "dragon": {"headScale": 1.35},                         # the great head/maw
    "giant": {"bulk": 1.3, "headScale": 0.9},              # uniformly huge, head PROPORTIONALLY smaller
    "aberration": {"headScale": 1.2},                      # a wrong, swollen mass
    "ooze": {},                                            # blob-mass has no head/hands/legs to scale
    "elemental": {"torsoScale": 1.1},
    "plant": {"legScale": 0.85},
    "swarm": {},                                           # a swarm is a scatter; density is a separate pass (queued, not built)
}
# name-keyword refinements (regex, {scalar: value}) — checked IN ORDER, first match per key wins;
# these OVERRIDE the coarse type base (more specific signal). Goblinoid is the headline L3 case:
# "goblinoid heads/hands" scaled up, "legs err stumpy". Kept a small curated list, same discipline as
# PALETTE_NAME_RULES / STANCE_RULES above.
PROPORTION_NAME_RULES = [
    (re.compile(r"goblin|hobgoblin|kobold|bugbear|goblinoid", re.I),
     {"headScale": 1.6, "handScale": 1.5, "legScale": 0.65}),  # the classic goblinoid: big head+hands, stumpy legs
    (re.compile(r"\borc\b|orog", re.I),
     {"handScale": 1.4, "torsoScale": 1.1}),                   # orcs: heavy-handed, broad, not big-headed
    (re.compile(r"ogre|troll", re.I),
     {"bulk": 1.2, "handScale": 1.3, "headScale": 0.95}),      # brutish: bulky, heavy-handed, smaller head
    (re.compile(r"imp\b|quasit|homunculus|sprite|pixie", re.I),
     {"headScale": 1.4, "legScale": 0.75}),                    # tiny fiends/fey: big-headed, stumpy
]


def proportion_scalars_for(creature_type, name):
    """L3 derivation: a per-family base proportion, REFINED by a name-keyword hit (the more specific
    signal — a goblin's oversized-head/stumpy-leg read overrides the coarse humanoid default). Returns
    a {headScale?, handScale?, legScale?, torsoScale?, bulk?} partial. Empty for a family with no
    exaggeration (plain humanoid). first keyword match wins per key among keywords."""
    t = (creature_type or "").lower()
    out = dict(PROPORTION_BY_TYPE.get(t, {}))
    keyword_hits = {}
    for rx, sc in PROPORTION_NAME_RULES:
        if rx.search(name or ""):
            for k, v in sc.items():
                keyword_hits.setdefault(k, v)  # first keyword match wins per key among keywords
    out.update(keyword_hits)  # a keyword refinement overrides the coarser type-base default
    return out


# ============================================================================
# G5 ROUND-1 (2026-07-03, Adam live-review ruling 1) — NATURAL CHANNELS. "Creatures wear their
# NATURAL identities — kill the flat foe tint." Before this pass every foe rendered under ONE flat
# per-KIND tint (unitTint's ember/oxblood, theater-boot.js) regardless of what it actually was — a
# skeleton and a goblin and an ooze all read the same rust-red. This rule adds a SECOND derivation
# pass (on top of §4 rule 4's AC-band armor/leather/plate channel, which is untouched and still fires)
# that resolves `skin`/`accent` (and `armor` where a creature's own material differs from the generic
# leather/plate read, e.g. bone-white skeletal "armor") to a NAMED PALETTE-FAMILY value — still a
# semantic channel slot per §5's own letter ("never a literal color... always a semantic slot name"),
# NOT a raw hex — theater-boot.js's CHANNEL_TINT_FALLBACK table is where a slot name resolves to an
# actual color (the existing "channels, not colors" seam this rule reuses rather than bypasses; a
# later env/realm/faction palette-stack pass can still re-resolve these same slot names, exactly like
# every other channel value already works). Precedence: creatureType gives a coarse base family
# (PALETTE_BY_TYPE); a name-keyword hit (PALETTE_NAME_RULES, checked in table order, first match wins
# per channel) refines it — "skeleton"/"bone" overrides a generic undead grey with bone-white, a
# goblinoid keyword overrides the generic humanoid skin with olive/dun, etc. EVERY value in both
# tables is deliberately DESATURATED (docs/BATTLE-THEATER.md §0's Vagrant Story mood — "no candy"):
# picked to sit in the same low-chroma, muted-value family the PSX grit pass's tile/void palette
# already uses, never a bright/saturated "toy" color. PC gold / ally blue are UNCHANGED by this rule
# (ruling 1's own letter: "PC gold / ally blue KEEP their figure tints... unchanged") — natural-channel
# resolution only ever fires for foes (see build_recipe's own call site below, gated on nothing here
# since a recipe doesn't know its own eventual pc/ally/foe kind — theater-boot.js's recipeChannelTints
# is where the pc/ally short-circuit actually happens, per that function's own G5 comment).
# ============================================================================
PALETTE_BY_TYPE = {
    # coarse per-creatureType base families — desaturated, Vagrant Story-family values.
    "humanoid": {"skin": "flesh-weathered", "accent": "leather-worn"},
    "undead": {"skin": "grave-pallor", "accent": "bone-white"},
    "fiend": {"skin": "dark-red-black", "accent": "dark-red-black"},
    "celestial": {"skin": "pale-blue-grey", "accent": "radiant-dim"},
    "fey": {"skin": "olive-dun", "accent": "moss-dim"},
    "construct": {"skin": "stone-grey", "accent": "stone-grey"},
    "beast": {"skin": "grey-brown-fur", "accent": "grey-brown-fur"},
    "monstrosity": {"skin": "murky-green", "accent": "grey-brown-fur"},
    "dragon": {"skin": "murky-green", "accent": "stone-grey"},
    "plant": {"skin": "moss-dim", "accent": "moss-dim"},
    "elemental": {"skin": "stone-grey", "accent": "ash-grey"},
    "giant": {"skin": "flesh-weathered", "accent": "stone-grey"},
    "ooze": {"skin": "murky-green", "accent": "murky-green"},
    "aberration": {"skin": "dark-red-black", "accent": "murky-green"},
    "swarm": {"skin": "grey-brown-fur", "accent": "grey-brown-fur"},
}
# name-keyword overrides (regex, {channel: value} refinements) — checked IN ORDER, first match per
# channel wins (a creature can pick up channel A from an earlier rule and channel B from a later one;
# it never lets a later rule stomp a channel an earlier rule already set — same "first match wins"
# discipline §4 rule 5's NAME_RULES base-override already uses).
PALETTE_NAME_RULES = [
    (re.compile(r"skeleton|skull|bone(?!fire)", re.I), {"skin": "bone-white", "accent": "bone-white"}),
    (re.compile(r"zombie|rot(?:ting|ted)|plague|putrid", re.I), {"skin": "sickly-grey-green", "accent": "sickly-grey-green"}),
    (re.compile(r"goblin|hobgoblin|orc\b|bugbear|kobold", re.I), {"skin": "olive-dun", "accent": "leather-worn"}),
    (re.compile(r"wolf|worg|dire wolf|hound|jackal", re.I), {"skin": "grey-brown-fur", "accent": "grey-brown-fur"}),
    (re.compile(r"ooze|slime|pudding|jelly\b|gelatinous", re.I), {"skin": "murky-green", "accent": "murky-green"}),
    (re.compile(r"fiend|demon|devil|imp\b|fiendish", re.I), {"skin": "dark-red-black", "accent": "dark-red-black"}),
    (re.compile(r"ghost|spectral|spectre|specter|wraith|spirit|phantom|shadow", re.I), {"skin": "pale-blue-grey", "accent": "pale-blue-grey"}),
    (re.compile(r"angel|celestial|radiant|seraph|archon", re.I), {"skin": "pale-blue-grey", "accent": "radiant-dim"}),
]


def natural_channels_for(creature_type, name):
    """G5 ROUND-1 ruling 1's derivation: creatureType base, then REFINED by a name-keyword hit (the
    keyword rule is the MORE SPECIFIC signal — a skeleton is undead-typed AND name-carries "skeleton",
    and the keyword's own bone-white read should win over the coarser undead-typed grave-pallor
    default; a later keyword rule still never overwrites an EARLIER keyword rule's own pick within
    this same loop, so "first keyword match wins" only governs keyword-vs-keyword ties, not
    keyword-vs-type-base). Returns a {skin?, accent?} partial channel map (never armor/glow — those
    stay §4 rule 4/5's own job)."""
    t = (creature_type or "").lower()
    out = dict(PALETTE_BY_TYPE.get(t, {}))
    keyword_hits = {}
    for rx, ch in PALETTE_NAME_RULES:
        if rx.search(name or ""):
            for k, v in ch.items():
                keyword_hits.setdefault(k, v)  # first KEYWORD match wins per channel among keywords
    out.update(keyword_hits)  # any keyword hit overrides the coarser type-base default
    return out


# ============================================================================
# G5 ROUND-1 ruling 4 — TRANSLUCENT. "Opacity exists — use it." A name-keyword-only flag (no bestiary
# field carries an "is incorporeal" signal generically enough to key off — the keyword list IS the
# spec's own letter: "ghost|spectre|wraith|spirit|phantom|shadow[- ]?"). theater-boot.js reads
# `recipe.translucent` and sets figure materials to opacity~0.45 + depthWrite off.
# ============================================================================
TRANSLUCENT_RX = re.compile(r"ghost|spectre|specter|wraith|spirit|phantom|shadow[- ]?", re.I)


def translucent_for(name):
    return bool(TRANSLUCENT_RX.search(name or ""))


# ============================================================================
# SHAPE-WAVE UNIT 3 (L17 THE SWARM LAW) — a swarm's MEMBER kind, derived from its name, so
# swarmScatter builds the right mini-creature (rat wedges / winged specks / crawlers) instead of
# generic blobs. Only meaningful when the base resolved to swarm-scatter; emitted as a recipe-level
# `swarmMember` field theater-boot.js's buildFigureFromRecipe passes into the swarm body's params.
# ============================================================================
SWARM_MEMBER_RULES = [
    (re.compile(r"\bbat|raven|bird|stirge\b", re.I), "winged"),
    (re.compile(r"insect|wasp|bee|locust|fly\b|mosquito|larva|larvae", re.I), "winged"),
    (re.compile(r"\brat|mouse|mice|rodent|weasel", re.I), "rat"),
    (re.compile(r"snake|serpent|viper|piranha|eel|claw|centipede|scarab|beetle|spider", re.I), "crawler"),
]


def swarm_member_for(name):
    n = name or ""
    for rx, member in SWARM_MEMBER_RULES:
        if rx.search(n):
            return member
    return "generic"


# ============================================================================
# SHAPE-WAVE UNIT 5 (L20 SPECIAL MATERIALS) — a small material-VARIANT vocabulary a recipe can request:
# "translucent" (opacity, the ghost/ooze see-through read) + "glossy" (a wet specular sheen). Emitted as
# a recipe-level `material` list theater-boot.js honors. An ooze/slime/jelly is both (a wet translucent
# blob); a ghost/spectre is translucent only (kept in sync with translucent_for's own keyword list, but
# now expressed through the general `material` field so the two share one code path downstream). NOTE:
# `translucent: true` is STILL emitted (back-compat with the existing specter fixtures/opacity path);
# `material` is the richer superset both new (glossy) and old (translucent) reads flow through.
# ============================================================================
OOZE_MATERIAL_RX = re.compile(r"ooze|slime|pudding|jelly\b|gelatinous|slaad(?!i)|mucous", re.I)


def material_variants_for(name, base):
    variants = []
    n = name or ""
    # an ooze/slime is a WET, TRANSLUCENT blob (both variants). Gated on the ooze base too so a
    # name-only "jelly" hit that resolved to a non-ooze body doesn't get the ooze material by accident.
    if base == "blob-mass" or OOZE_MATERIAL_RX.search(n):
        variants = ["translucent", "glossy"]
    elif translucent_for(name):
        variants = ["translucent"]   # ghosts/spectres: see-through, not wet
    return variants


# ============================================================================
# G5 ROUND-1 ruling 5 — STANCE (reference-informed posture). A recipe-level `stance` field theater-
# boot.js's composition applies: hunched (torso tipped forward, head forward+down, knees bent —
# goblinoids, +~1.25x head-module scale per Adam's own "classic goblin silhouettes are hunched with
# oversized heads" reference note), slouched (zombies: asymmetric shoulder drop, arms hanging),
# crouched (rogues/ambushers). Checked in order, first match wins (a creature is exactly one stance,
# never a blend) — order matters here specifically because "goblin" and "zombie" name spaces don't
# overlap in the bestiary today, but a future creature could plausibly carry both a rogue-adjacent AND
# a goblinoid keyword (a "goblin skulker"), and the more SPECIFIC physiological read (goblinoid's
# oversized-head hunch) should win over the generic behavioral one (crouched) in that case — goblinoid
# checked first for exactly that reason.
# ============================================================================
STANCE_RULES = [
    (re.compile(r"goblin|hobgoblin|orc\b|bugbear|kobold|goblinoid", re.I), "hunched"),
    (re.compile(r"zombie|rot(?:ting|ted)|plague|putrid", re.I), "slouched"),
    (re.compile(r"rogue|assassin|skulk|ambush|thief|cutpurse|sneak", re.I), "crouched"),
]


def stance_for(name):
    n = name or ""
    for rx, stance in STANCE_RULES:
        if rx.search(n):
            return stance
    return None


# ============================================================================
# G5 ROUND-1 ruling 5 (cultist -> robe-skirt keyword rule). §4 rule 5's existing NAME_RULES table
# already carries a BROADER caster/spellcaster keyword rule (mage|sorcerer|wizard|warlock|witch|
# shaman|cultist|priest|cleric|druid -> robe-skirt) that already covers "cultist"/"priest" generically
# — this narrower rule is the ruling's OWN explicit letter ("cultist|acolyte|priest of"), added as its
# own small keyword-match function so a fixture can assert against ruling 5's exact wording rather than
# relying on the pre-existing broader rule's incidental overlap. Returns True (attach robe-skirt at
# `base`, mirroring the existing caster rule's own module shape) or False — never a module list of its
# own, since the existing NAME_RULES entry already emits the identical module when it also matches
# (avoiding a DUPLICATE robe-skirt module on a "cultist" that both rules would otherwise separately add).
# ============================================================================
CULTIST_RX = re.compile(r"cultist|acolyte|priest of", re.I)


def is_cultist_robed(name):
    return bool(CULTIST_RX.search(name or ""))


# ============================================================================
# §5 channels — base channel map every recipe carries (skin/armor/accent/glow), refined by
# rules 4/5 above (and now G5's natural-channel pass). Never a literal color (§5's own letter) —
# always a semantic slot name.
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
    # UNIT 2: swap a plain-biped base to the V-taper torso-tapered for martial-humanoid names — a
    # base-PART swap only (archetype stays "biped" so weapon/armor/limb rules, which key off archetype
    # not base, all still fire). Applied AFTER base is resolved so it never touches a giant/quad/etc.
    base = soldier_taper_base(name, archetype, base)

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
    # G5 ROUND-1 ruling 1: the natural-identity pass lays down skin/accent FIRST (a creature's own
    # species/material read) — applied BEFORE armor_channel and channel_over_kw so both existing,
    # already-tested precedence layers keep winning where they overlap: armor_channel still owns the
    # `armor` slot (a natural pass never touches armor — see natural_channels_for's own docstring,
    # "never armor/glow"), and §4 rule 5's own channel_over_kw (shadow-dark for wraith/shadow,
    # crystal for gem creatures, fungal for mold, etc.) still overrides a natural pick where that
    # curated rule is MORE specific than this coarse type+keyword pass (e.g. "shadow-dark" beats this
    # rule's own "pale-blue-grey" ghost/shadow entry — the existing rule-5 fixture assertions for
    # flaming-skeleton/giant-spider/etc. depend on this ordering staying exactly this way).
    channels.update(natural_channels_for(ctype, name))
    if armor_channel != "none":
        channels["armor"] = armor_channel
    channels.update(channel_over_kw)

    # G5 ROUND-1 ruling 5 (cultist -> robe-skirt): only add a SECOND robe-skirt module if the
    # existing broader caster-keyword rule (NAME_RULES) didn't already add one for this same
    # creature — avoids a duplicate module on a name that matches both the broad and narrow rule.
    if is_cultist_robed(name) and not any(m.get("part") == "robe-skirt" for m in modules):
        modules.append({"part": require_part("robe-skirt"), "anchor": "base"})

    scalars = {}
    # UNIT 3 (L3): the family proportion preset lays down the BASE per-part exaggeration FIRST (head/
    # hand/leg/torso scalars), so the more-specific layers below override it where they overlap.
    scalars.update(proportion_scalars_for(ctype, name))
    scalars.update(move_scalars)
    scalars.update(weapon_flags)
    scalars.update(scalars_kw)
    scalars.update(cr_scalar(cr))  # cr bulk is orthogonal to head/hand/leg — composes, rarely collides

    # G5 ROUND-1 ruling 5 (stance): a goblinoid hunch also carries a headScale scalar (~1.25x, "classic
    # goblin silhouettes... oversized heads") — theater-boot.js's torsoBiped composition reads both
    # recipe.stance and scalars.headScale off the same recipe (see that file's own G5 comment). UNIT 3:
    # the goblinoid PROPORTION preset above already sets a larger headScale (1.6) for goblinoids — keep
    # the LARGER of the two (the preset's exaggerated head wins over the stance default) so a goblin
    # reads as big-headed per L3, not clamped back down to the stance's gentler 1.25.
    stance = stance_for(name)
    if stance == "hunched":
        scalars["headScale"] = max(1.25, scalars.get("headScale", 0))

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
    if stance:
        recipe["stance"] = stance
    # G5 ROUND-1 ruling 4 (translucent): only ever True (never emitted as an explicit False — keeps
    # the common case's JSON small, matching how `scalars` is only emitted when non-empty above).
    if translucent_for(name):
        recipe["translucent"] = True
    # SHAPE-WAVE UNIT 5 (L20): the material-variant list (translucent/glossy). Only emitted when
    # non-empty — most creatures carry no `material` key at all (an opaque matte figure, the default).
    material = material_variants_for(name, base)
    if material:
        recipe["material"] = material
    # SHAPE-WAVE UNIT 3 (L17): a swarm carries its member kind (rat/winged/crawler/generic) so the
    # swarm body renders the right mini-creature. Only emitted when the base is swarm-scatter (the only
    # consumer) and the member is non-generic (generic is swarmScatter's own default — keeps JSON lean).
    if base == "swarm-scatter":
        member = swarm_member_for(name)
        if member != "generic":
            recipe["swarmMember"] = member
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
