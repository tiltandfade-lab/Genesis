#!/usr/bin/env python3
"""Genesis build — generate data/realm-props.js from dev/model-qa/realm-props.json.

REALM-PROPS-WIRING.md §1: 308 realm props (docs/REALM-PROPS-DRAFT.md's authored table), one list
per realm keyed data/realms.js's REALM_IDS. Each entry:
  {name, size, cover, crossRealm, model, summary}
`size` is one of Small|Medium|Large|Huge (the §3 size->footprint table's own vocabulary).
`crossRealm` is "all" | a realm-id list | "specific" (bespoke to its home realm only).
`model` resolves either to an existing WHOLE_OBJECT_REGISTRY "prop:<part>" key (derived from the
draft's own `base` column — see BASE_TO_PART below) or "net-new: <brief>" for the ~31-model queue
REALM-MODELS-P3 fills in later (a missing model NEVER blocks this build — theater-boot.js's setBoard
falls back to the part's generic Parts.PARTS cuboid, and further to a flat prop box if even that's
missing; "never a hole" per §1).

Dedupe law (Adam's "dedupe the cross-realm-all first"): the 50 `all`-tagged props are single
records in the source JSON already (one row per name, crossRealm:"all" meaning "eligible in every
realm's pool", NOT eleven literal copies) — this generator's own validation step below asserts
that invariant (no duplicate names corpus-wide) rather than re-deriving it.

Mirrors build/gen-realm-surfaces.py's discipline: edit the source json, re-run this, never
hand-edit the generated data/realm-props.js.

Modes:
  (default)  write data/realm-props.js
  --check    validate only (source shape + every model resolves a real part/registry key or a
             net-new marker); no write; used by CI/pre-merge and dev/verify-theater-data.mjs's own
             cross-check note (§4).
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "dev", "model-qa", "realm-props.json")
OUT = os.path.join(ROOT, "data", "realm-props.js")
REALMS_SRC = os.path.join(ROOT, "data", "realms.js")
THEATER_DATA = os.path.join(ROOT, "src", "engine", "theater-data.js")

VALID_SIZES = {"Small", "Medium", "Large", "Huge"}
VALID_COVERS = {"none", "half", "three-quarters", "full"}

# draft-doc `base` column -> theater-data.js `part` string (+ fixed partParams), the "existing
# generic prop fallback by cover kind" §5 decision 1 names — every base here already renders via
# an existing THEATER_PROP_KEYWORD_RULES part / WHOLE_OBJECT_REGISTRY "prop:<part>" entry, so a
# realm prop with no bespoke net-new model still renders as SOMETHING sane (a "well" base prop
# reads as the well-shaft part, etc.) rather than a bare flat box.
BASE_TO_PART = {
    "altar":             ("shrine-block", {}),
    "archway":           ("arch-frame", {}),
    "bone-wall":         ("rubble-scatter", {"channel": "bone", "scale": 0.9}),
    "brazier":           ("candelabra", {}),
    "broken-pillar":     ("pillar-broken", {"intact": False}),
    "candelabra":        ("candelabra", {}),
    "cart":              ("cart", {}),
    "crate/containers":  ("crate", {}),
    "gears":             ("gear-cluster", {}),
    "grate":             ("rubble-scatter", {"flat": True, "scale": 0.4}),
    "hanging-cage":      ("cage-frame", {"cheap": True}),
    "lantern-post":      ("candelabra", {}),
    "obelisk":           ("pillar-broken", {"intact": True}),
    "pillar":            ("pillar-broken", {"intact": True}),
    "portcullis":        ("arch-frame", {}),
    "refuse-pile":       ("rubble-scatter", {"scale": 0.9}),
    "sarcophagus":       ("coffin-slab", {}),
    "stagnant-pool":     ("basin-block", {}),
    "statue":            ("statue-figure", {"pose": "standing"}),
    "table":             ("table-slab", {}),
    "throne":            ("throne-seat", {}),
    "torch":             ("candelabra", {}),
    "wall-manacles":     ("chain-drape", {}),
    "web-mass":          ("web-mass", {}),
    "well":              ("well-shaft", {}),
}

# REALM-MODELS-P3 wave p3-props (2026-07-05 REGISTRAR pass, feat/realm-models-p3): net-new props
# that now have a REAL bespoke module registered in src/ui/theater-figures.js's WHOLE_OBJECT_
# REGISTRY under "prop:<slug>" (docs/REALM-MODELS-P3.md §0: "props land in the SAME
# WHOLE_OBJECT_REGISTRY grammar with a prop- slug prefix; no bestiary size-law disc"). Once a
# net-new prop's `base` column is updated to its bare slug (dropping the "net-new: <brief>"
# marker), this set lets resolve_model map it straight to "prop:<slug>" WITHOUT requiring a
# matching THEATER_PROP_KEYWORD_RULES part (props built this way have no generic keyword-rule
# part of their own — they're reached directly by the realm-prop-select seam, REALM-PROPS-WIRING
# §2).
REGISTERED_PROP_SLUGS = {
    "sentry-turret-mount",
    "conveyor-spur",
    "holo-pillar-ad",
    "blast-shutter-frame",
    "shroud-draped-loom",
    "sin-eaters-bowl-stand",
    "charnel-pit",
    "whispering-curtain-row",
}


def real_realm_ids():
    """Parse data/realms.js's REALMS object keys — mirrors gen-realm-surfaces.py's own parse,
    without requiring a JS runtime."""
    txt = open(REALMS_SRC, encoding="utf-8").read()
    m = re.search(r"const REALMS\s*=\s*\{", txt)
    if not m:
        print("FATAL: could not find `const REALMS = {` in data/realms.js", file=sys.stderr)
        sys.exit(1)
    ids = re.findall(r'^\s{2}"?([a-z][a-z0-9-]*)"?:\s*\{', txt[m.end():], re.MULTILINE)
    return [i for i in ids if i != "realm-neutral"]


def real_part_names():
    """Parse src/engine/theater-data.js's THEATER_PROP_KEYWORD_RULES array for every distinct
    `part` string it can emit (a plain regex scan of `part: "..."` / `part:"..."` literals),
    so BASE_TO_PART's target parts are cross-validated against the REAL live vocabulary rather
    than hand-copied and left to drift."""
    txt = open(THEATER_DATA, encoding="utf-8").read()
    return set(re.findall(r'part:\s*"([a-z-]+)"', txt))


def load_source():
    with open(SRC, encoding="utf-8") as f:
        return json.load(f)


def resolve_model(base):
    """base column -> (model_field, part, part_params). A `net-new: <brief>` base passes through
    untouched as the model field (REALM-MODELS-P3's queue marker) with no part mapping (theater-
    boot.js's generic flat-box fallback covers it until a bespoke model lands). A base that is one
    of REGISTERED_PROP_SLUGS resolves to "prop:<slug>" directly (a real WHOLE_OBJECT_REGISTRY
    entry, no THEATER_PROP_KEYWORD_RULES part required). A known base maps onto BASE_TO_PART; an
    unknown base is a build error (never silently falls through)."""
    if base.startswith("net-new:"):
        return base, None, None
    if base in REGISTERED_PROP_SLUGS:
        return "prop:" + base, None, None
    if base not in BASE_TO_PART:
        return None, None, None
    part, params = BASE_TO_PART[base]
    return "prop:" + part, part, params


def normalize_cross_realm(cross_realm, realm_ids):
    """crossRealm source values: "all", "specific", or a comma-joined realm-id list (free text,
    e.g. "suburb, ash"). Normalizes to the literal "all"/"specific" strings or a clean list of
    realm ids (validated against the real REALM_IDS)."""
    cr = (cross_realm or "").strip()
    if cr in ("all", "specific"):
        return cr
    ids = [x.strip() for x in cr.split(",") if x.strip()]
    bad = [i for i in ids if i not in realm_ids]
    return ids, bad


def validate_and_build(source, realm_ids):
    errors = []
    seen_names = {}
    out = {rid: [] for rid in realm_ids}
    part_names = real_part_names()

    for block in source:
        realm = block.get("realm")
        props = block.get("props", [])
        if realm not in realm_ids:
            errors.append(f"{realm}: not a known realm id (data/realms.js REALM_IDS)")
            continue
        for p in props:
            name = p.get("name", "?")
            size = p.get("size")
            cover = p.get("cover")
            base = p.get("base", "")
            cross_realm_raw = p.get("crossRealm", "")
            summary = p.get("summary")

            if name in seen_names:
                errors.append(f"{realm}/{name}: duplicate name (also in {seen_names[name]}) — "
                               f"dedupe law violation (§1's 'no duplicate names corpus-wide')")
            else:
                seen_names[name] = realm

            if size not in VALID_SIZES:
                errors.append(f"{realm}/{name}: size '{size}' not one of {sorted(VALID_SIZES)}")
            if cover not in VALID_COVERS:
                errors.append(f"{realm}/{name}: cover '{cover}' not one of {sorted(VALID_COVERS)}")
            if not summary:
                errors.append(f"{realm}/{name}: missing summary")

            model, part, part_params = resolve_model(base)
            if model is None:
                errors.append(f"{realm}/{name}: base '{base}' has no BASE_TO_PART mapping and is "
                               f"not a 'net-new:' marker")
            elif part is not None and part not in part_names:
                errors.append(f"{realm}/{name}: mapped part '{part}' not found in "
                               f"THEATER_PROP_KEYWORD_RULES (theater-data.js) — mapping drifted")

            # QF-B1 (2026-07-14, PLAY-LENS P0 #4): an optional per-entry `retint` ("#rrggbb") — a
            # realm prop that reuses a whole-object model whose BAKED palette doesn't match what it's
            # standing in for (e.g. "Alley Fire Escape"/"Rebar Thicket"/"Cable Snarl" all reuse
            # prop-web.js's buildWebMass — a giant-spider corner web authored in pale ghost-silk
            # tones — as a generic thin-tangled-lattice placeholder shape; theater-boot.js's
            # wholeObjectRetintColorBuffer recolors the cached geometry toward this hex at mount
            # time). part_params is BASE_TO_PART's OWN shared dict object (same reference for every
            # entry with this base) — COPY it before merging in a per-entry key, never mutate the
            # shared dict in place (would leak this entry's retint onto every sibling using the same
            # base, e.g. Cobweb Mass's genuine pale-web read). Written out as a plain decimal int —
            # json.dumps has no hex-literal syntax, and a JS number doesn't care what base its SOURCE
            # was written in; matches wholeObjectRetintColorBuffer's own `typeof === "number"` gate
            # and its `>> 16` / `& 255` bit-ops, byte-identical whether the literal reads 0x4a4c4f or
            # 4884815.
            retint_raw = p.get("retint")
            if retint_raw:
                if part_params is None:
                    errors.append(f"{realm}/{name}: retint set but base '{base}' has no part/partParams to attach it to")
                elif not (isinstance(retint_raw, str) and re.fullmatch(r"#?[0-9a-fA-F]{6}", retint_raw)):
                    errors.append(f"{realm}/{name}: retint '{retint_raw}' is not a '#rrggbb' hex string")
                else:
                    part_params = dict(part_params)
                    part_params["retint"] = int(retint_raw.lstrip("#"), 16)

            cross_norm = normalize_cross_realm(cross_realm_raw, realm_ids)
            if isinstance(cross_norm, tuple):
                cross_norm, bad = cross_norm
                if bad:
                    errors.append(f"{realm}/{name}: crossRealm names unknown realm(s) {bad}")

            entry = {
                "name": name,
                "size": size,
                "cover": cover,
                "crossRealm": cross_norm,
                "model": model,
                "summary": summary,
            }
            if part is not None:
                entry["part"] = part
                entry["partParams"] = part_params
            out[realm].append(entry)

    missing_realms = [r for r in realm_ids if not out.get(r)]
    if missing_realms:
        errors.append(f"missing realm(s) entirely: {missing_realms}")

    return errors, out


def main():
    check_only = "--check" in sys.argv
    source = load_source()
    realm_ids = real_realm_ids()

    errors, out = validate_and_build(source, realm_ids)
    if errors:
        print(f"REALM-PROPS VALIDATION FAILED ({len(errors)} error(s)):", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)

    total = sum(len(v) for v in out.values())
    print(f"validation OK — {len(realm_ids)} realms, {total} props, "
          f"{len(BASE_TO_PART)} base->part mappings")

    if check_only:
        return

    header = (
        "/* GENESIS DATA (generated) — data/realm-props.js\n"
        "   REALM-PROPS-WIRING.md §1 — per-realm furniture/cover vocabulary (docs/REALM-PROPS-DRAFT.md's\n"
        "   308-prop draft): REALM_PROPS[realmId] = [{name,size,cover,crossRealm,model,summary,part?,\n"
        "   partParams?}], keyed to data/realms.js's REALM_IDS (the `all`/cross-realm-list props are\n"
        "   authored ONCE and just tagged with which realms they're also eligible in — realmPropsFor\n"
        "   below folds them into every requested realm's pool, never a literal per-realm copy).\n"
        "   `model` is either an existing 'prop:<part>' WHOLE_OBJECT_REGISTRY key (derived from the\n"
        "   draft's own `base` column, src/engine/theater-data.js's live part vocabulary) or a\n"
        "   'net-new: <brief>' marker for REALM-MODELS-P3's queue — a missing net-new model NEVER blocks\n"
        "   rendering (theater-boot.js's setBoard falls back to the part's generic cuboid, or a flat prop\n"
        "   box; \"never a hole\" per §1). GENERATED from dev/model-qa/realm-props.json — never hand-edit;\n"
        "   edit the source json + re-run `python3 build/gen-realm-props.py`. Added 2026-07-04.\n"
        "   Classic <script> (shared global scope); defines REALM_PROPS + realmPropsFor(realms). */\n"
    )
    accessor = (
        "\n"
        "/* realmPropsFor(realms): an array of active realm ids (SAME activeRealmsFor(skin,w) shape\n"
        "   theaterFloorSurfaceInfo's opts.realms already consumes) -> the union of every named realm's\n"
        "   own REALM_PROPS entries PLUS every corpus-wide crossRealm:\"all\" prop (folded in once each,\n"
        "   never per-realm-duplicated — the dedupe law lives here at read time, not at authoring time).\n"
        "   A prop tagged with an explicit realm-id list (crossRealm is an array) is included when ANY of\n"
        "   its listed realms is in `realms`. A prop is always read off its OWN home realm's list first\n"
        "   (crossRealm:\"specific\" props never leak into another realm's pool at all). Returns [] on a\n"
        "   missing/empty `realms` or an unloaded REALM_PROPS (never throws — same total-function\n"
        "   discipline as theaterRealmSurfacePick). */\n"
        "function realmPropsFor(realms){\n"
        "  if(typeof REALM_PROPS === \"undefined\") return [];\n"
        "  var list = Array.isArray(realms) ? realms : [];\n"
        "  if(!list.length) return [];\n"
        "  var wantSet = {};\n"
        "  list.forEach(function(r){ wantSet[r] = true; });\n"
        "  var seen = {};\n"
        "  var out = [];\n"
        "  function add(p){ if(seen[p.name]) return; seen[p.name] = true; out.push(p); }\n"
        "  Object.keys(REALM_PROPS).forEach(function(realmId){\n"
        "    (REALM_PROPS[realmId] || []).forEach(function(p){\n"
        "      var eligible = wantSet[realmId] ||\n"
        "        (p.crossRealm === \"all\") ||\n"
        "        (Array.isArray(p.crossRealm) && p.crossRealm.some(function(r){ return wantSet[r]; }));\n"
        "      if(eligible) add(p);\n"
        "    });\n"
        "  });\n"
        "  return out;\n"
        "}\n"
    )
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("const REALM_PROPS=" + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
        f.write(accessor)
    print(f"  -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
