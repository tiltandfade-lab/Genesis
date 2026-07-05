#!/usr/bin/env python3
"""Genesis build — generate data/realm-surfaces.js from dev/model-qa/realm-surfaces.json.

REALM-SURFACES-WIRING.md §1: 88 realm floor surfaces (docs/REALM-SURFACES-DRAFT.md's authored
table), one 8-entry list per realm keyed data/realms.js's REALM_IDS. Each entry:
  {name, base, tint, where, summary}
`base` MUST be a key that exists in src/ui/theater-boot.js's FLOOR_MATERIAL_RECIPES (validated
below by parsing the real source, never hand-copied) — a realm surface picking an unbuilt base
would render flat, so this is a hard build-time gate, not a lint warning.
`where` is normalized to interior|exterior|any.

Mirrors build/gen-bestiary.py's discipline: edit the source json, re-run this, never hand-edit
the generated data/realm-surfaces.js.

Modes:
  (default)  write data/realm-surfaces.js
  --check    validate only (source shape + every base resolves a real recipe); no write; used by
             CI/pre-merge and by dev/verify-theater-data.mjs's own cross-check note (§4).
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "dev", "model-qa", "realm-surfaces.json")
OUT = os.path.join(ROOT, "data", "realm-surfaces.js")
REALMS_SRC = os.path.join(ROOT, "data", "realms.js")
THEATER_BOOT = os.path.join(ROOT, "src", "ui", "theater-boot.js")

VALID_WHERE = {"interior", "exterior", "any"}


def real_realm_ids():
    """Parse data/realms.js's REALMS object keys (first-level object keys), excluding
    realm-neutral — mirrors that file's own REALM_IDS derivation, without requiring a JS runtime."""
    txt = open(REALMS_SRC, encoding="utf-8").read()
    m = re.search(r"const REALMS\s*=\s*\{", txt)
    if not m:
        print("FATAL: could not find `const REALMS = {` in data/realms.js", file=sys.stderr)
        sys.exit(1)
    # top-level keys: lines like `  frontier: {` or `  "high-seas": {` at 2-space indent inside the
    # REALMS object (hyphenated ids are quoted, plain ids are bare — both forms appear in the file).
    ids = re.findall(r'^\s{2}"?([a-z][a-z0-9-]*)"?:\s*\{', txt[m.end():], re.MULTILINE)
    return [i for i in ids if i != "realm-neutral"]


def real_recipe_keys():
    """Parse src/ui/theater-boot.js's FLOOR_MATERIAL_RECIPES object for its top-level keys — the
    real, load-bearing set (never hand-copied elsewhere, so this stays in sync with theater-boot.js
    by construction). Keys appear either bare (`flagstone(c){`) or quoted (`"cave-rock"(c){`)."""
    txt = open(THEATER_BOOT, encoding="utf-8").read()
    m = re.search(r"const FLOOR_MATERIAL_RECIPES\s*=\s*\{", txt)
    if not m:
        print("FATAL: could not find `const FLOOR_MATERIAL_RECIPES = {` in src/ui/theater-boot.js", file=sys.stderr)
        sys.exit(1)
    # walk forward from the opening brace to its matching close, tracking depth, so we only scan
    # THIS object's body (never spill into a later unrelated object in the same file).
    start = m.end()
    depth = 1
    i = start
    while depth > 0 and i < len(txt):
        if txt[i] == "{":
            depth += 1
        elif txt[i] == "}":
            depth -= 1
        i += 1
    body = txt[start:i]
    keys = re.findall(r'(?:^|\n)\s*(?:"([a-z0-9-]+)"|([a-z][a-z0-9]*))\s*\(c\)\s*\{', body)
    return {a or b for a, b in keys}


def load_source():
    with open(SRC, encoding="utf-8") as f:
        return json.load(f)


def validate(source, recipe_keys, realm_ids):
    errors = []
    seen_realms = set()
    for block in source:
        realm = block.get("realm")
        surfaces = block.get("surfaces", [])
        if realm not in realm_ids:
            errors.append(f"{realm}: not a known realm id (data/realms.js REALM_IDS)")
            continue
        seen_realms.add(realm)
        if len(surfaces) != 8:
            errors.append(f"{realm}: expected 8 surfaces, got {len(surfaces)}")
        for s in surfaces:
            name = s.get("name", "?")
            base = s.get("base")
            where = s.get("where")
            if base not in recipe_keys:
                errors.append(f"{realm}/{name}: base '{base}' has no FLOOR_MATERIAL_RECIPES builder")
            if where not in VALID_WHERE:
                errors.append(f"{realm}/{name}: where '{where}' not one of {sorted(VALID_WHERE)}")
            if not s.get("tint"):
                errors.append(f"{realm}/{name}: missing tint")
            if not s.get("summary"):
                errors.append(f"{realm}/{name}: missing summary")
    missing_realms = set(realm_ids) - seen_realms
    if missing_realms:
        errors.append(f"missing realm(s) entirely: {sorted(missing_realms)}")
    return errors


def main():
    check_only = "--check" in sys.argv
    source = load_source()
    recipe_keys = real_recipe_keys()
    realm_ids = real_realm_ids()

    errors = validate(source, recipe_keys, realm_ids)
    if errors:
        print(f"REALM-SURFACES VALIDATION FAILED ({len(errors)} error(s)):", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)

    print(f"validation OK — {len(source)} realms, "
          f"{sum(len(b['surfaces']) for b in source)} surfaces, "
          f"{len(recipe_keys)} recipe keys available")

    if check_only:
        return

    out = {block["realm"]: block["surfaces"] for block in source}
    header = (
        "/* GENESIS DATA (generated) — data/realm-surfaces.js\n"
        "   REALM-SURFACES-WIRING.md §1 — per-realm floor surface vocabulary (docs/REALM-SURFACES-DRAFT.md's\n"
        "   88-surface draft): REALM_SURFACES[realmId] = [{name,base,tint,where,summary}], 8 entries per\n"
        "   realm across the 11 realms (data/realms.js). `base` is a real src/ui/theater-boot.js\n"
        "   FLOOR_MATERIAL_RECIPES key (validated at generation time by build/gen-realm-surfaces.py — never\n"
        "   hand-copied); `where` is interior|exterior|any. Consumed by theaterFloorMaterial's opts.realms\n"
        "   seam (src/engine/theater-data.js) to pick a breach room's floor from its active realm instead of\n"
        "   the generic 12-material pool. GENERATED from dev/model-qa/realm-surfaces.json — never hand-edit;\n"
        "   edit the source json + re-run `python3 build/gen-realm-surfaces.py`. Added 2026-07-04.\n"
        "   Classic <script> (shared global scope); defines REALM_SURFACES. */\n"
    )
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("const REALM_SURFACES=" + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
    print(f"  -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
