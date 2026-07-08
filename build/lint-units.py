#!/usr/bin/env python3
"""Genesis STANDARDIZATION LINTER — flags incongruent creature entries + non-standard 3D models.

A cheap, read-only REPORTER (never a CI gate — always exits 0, per CLAUDE.md's "validators
preserve the thing's job" discipline). It surfaces where a bestiary entry is missing a piece of
the congruence contract, or where a WHOLE_OBJECT_REGISTRY model deviates from the shared model
"language" — so Opus/Sonnet don't have to eyeball 510 core + 1307 realm entries by hand.

  python3 build/lint-units.py            # full markdown report to stdout
  python3 build/lint-units.py --top 30   # widen the worst-first tail (default 20)

WHAT IT READS (all read-only):
  data/bestiary.js        const BESTIARY        — ~510 core stat blocks (gen-bestiary.py shape)
  data/realm-bestiary.js  const REALM_BESTIARY  — ~1307 realm reskins    (gen-realm-bestiary.py shape)
  src/ui/theater-figures.js  WHOLE_OBJECT_REGISTRY + NEAREST_SUB — the model wiring (ESM export,
                          pulled via a tiny node import so we read the runtime object, not a
                          hand-rolled JS parse that would drift from it — same tactic as
                          build/gen-realm-bestiary.py's node extractor).

The authoritative field shapes are taken from build/gen-bestiary.py and build/gen-realm-bestiary.py
(their REQUIRED_FIELDS / emitted-shape docstrings) — this linter never invents a field that isn't
part of those contracts.

PART A — congruence checklist (per bestiary entry)
  Core BESTIARY entries carry their own stats, so each is checked directly:
    abilities   all six of STR/DEX/CON/INT/WIS/CHA present with a real numeric score
    hp          numeric hp AND a non-empty hpFormula (the hit-dice expression)
    ac          numeric AC
    cr          a real CR (0 is valid; None/absent is not)
    action      at least one action/bonus/reaction/legendary entry, OR a trait bearing an
                attack (atk) / damage (dmg) / save (saveDC) — i.e. it can DO something
    flavorTable at least one hand-authored d-table: core = customTables[] (die + rows);
                realm = the d8 flavorTable{die,mode,rows}
    model       the entry's render key resolves through the model wiring (see PART B) —
                EXACT (direct registry hit) / ALIAS (via NEAREST_SUB) / MISSING (cuboid fallback)
  Realm REALM_BESTIARY entries are reskins — their STR/HP/AC/actions live on the `frame` stat
  chassis, not the entry — so instead of re-checking those, they are checked for:
    required    the 7 required fields (name, cr, role, type, size, frame, model)
    frame       `frame` resolves to a real BESTIARY id (that's what lends it its stats)
    flavorTable the d8 flavorTable is present
    model       the `model` render key resolves through the wiring (EXACT/ALIAS/MISSING)

PART B — model standard (per WHOLE_OBJECT_REGISTRY entry)
  Every model entry should speak the same language:
    module      a `module` path that EXISTS on disk (resolved relative to src/ui/)
    fn          an `fn` build-function name that is actually EXPORTED by that module
    discR       a base-disc radius present AND in the documented size-law vocabulary
                {0.32, 0.42, 0.48, 0.55, 0.62, 0.68, 0.72} (file header §1 size law)
  Plus NEAREST_SUB hygiene: every alias target must be a key that resolves in the registry
  (a dangling alias silently drops to the cuboid fallback).

Nothing here fails the build. Every finding is a FLAG for a human/model to judge.
GENERATED-adjacent: this script is not a manifest module (build/*.py are outside manifest.json,
confirmed against build/check-manifest.py's scope) — register nothing.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BESTIARY_JS = os.path.join(ROOT, "data", "bestiary.js")
REALM_JS = os.path.join(ROOT, "data", "realm-bestiary.js")
FIGURES_JS = os.path.join(ROOT, "src", "ui", "theater-figures.js")
FIGURES_DIR_BASE = os.path.join(ROOT, "src", "ui")

ABILS = ["str", "dex", "con", "int", "wis", "cha"]
# The §1 size law disc vocabulary documented in theater-figures.js's header (+ 0.72 for the
# apex/gargantuan bodies added by CREATURE-MODELS-P2). A discR outside this set is a
# part-language deviation worth a human's eye, not necessarily wrong.
DISC_VOCAB = {0.32, 0.42, 0.48, 0.55, 0.62, 0.68, 0.72}
REALM_REQUIRED = ["name", "cr", "role", "type", "size", "frame", "model"]

# Per-flag weights → the worst-first sort key (bigger = more incongruent).
WEIGHT = {
    "abilities": 3, "hp": 3, "ac": 2, "cr": 2, "action": 2, "flavorTable": 1, "model": 1,
    "frame": 3, "required": 3, "flavorTableDie": 1,
}


# ---------- extraction (read-only) ----------
def extract_const_json(path, const_name, stop_marker=None):
    """Pull one `const NAME={...};` value out of a classic-script data file. The generators emit
    these via json.dumps, so the object body is valid JSON — no JS parser needed."""
    text = open(path, encoding="utf-8").read()
    body = text.split("const " + const_name + "=", 1)[1]
    if stop_marker:
        body = body.split(stop_marker, 1)[0]
    return json.loads(body.rstrip().rstrip(";").rstrip())


def extract_registry():
    """WHOLE_OBJECT_REGISTRY + NEAREST_SUB from the ESM figures module, read as the real runtime
    objects via a one-shot node import (their property names are unquoted → not JSON)."""
    script = (
        "import * as m from %s;"
        "process.stdout.write(JSON.stringify("
        "{reg:m.WHOLE_OBJECT_REGISTRY, sub:m.NEAREST_SUB}));"
        % json.dumps("file://" + FIGURES_JS)
    )
    out = subprocess.run(["node", "--input-type=module", "-e", script],
                         capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        sys.stderr.write("lint-units: failed to import theater-figures.js via node:\n" + out.stderr)
        sys.exit(0)  # reporter never hard-fails; degrade to no PART B
    data = json.loads(out.stdout)
    return data["reg"], data["sub"]


# ---------- PART B helpers (used by PART A's model check too) ----------
_export_cache = {}


def module_exports(module_path):
    """Set of names a creature module exports. Cached per file."""
    if module_path in _export_cache:
        return _export_cache[module_path]
    names = set()
    if os.path.exists(module_path):
        src = open(module_path, encoding="utf-8").read()
        for m in re.finditer(r"export\s+(?:async\s+)?(?:function|const|let|var)\s+(\w+)", src):
            names.add(m.group(1))
        for m in re.finditer(r"export\s*\{([^}]*)\}", src):  # export { a, b as c }
            for part in m.group(1).split(","):
                tok = part.strip().split(" as ")[-1].strip()
                if tok:
                    names.add(tok)
    _export_cache[module_path] = names
    return names


def resolve_model(key, reg, sub):
    """EXACT (direct registry key) / ALIAS (via NEAREST_SUB → a real registry key) / MISSING."""
    if not key:
        return "MISSING"
    if key in reg:
        return "EXACT"
    if key in sub and sub[key] in reg:
        return "ALIAS"
    return "MISSING"


# ---------- PART A ----------
def is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def check_core_entry(eid, e, reg, sub):
    flags = []
    ab = e.get("abilities") or {}
    missing_ab = [a for a in ABILS if not (isinstance(ab.get(a), dict) and is_num(ab[a].get("score")))]
    if missing_ab:
        flags.append(("abilities", "missing scores: " + ",".join(missing_ab)))
    if not is_num(e.get("hp")):
        flags.append(("hp", "no numeric hp"))
    elif not (e.get("hpFormula") or "").strip():
        flags.append(("hp", "hp present but no hit-dice formula"))
    if not is_num(e.get("ac")):
        flags.append(("ac", "no numeric AC"))
    if not is_num(e.get("cr")):
        flags.append(("cr", "no CR"))
    # action: any action/bonus/reaction/legendary, or an attack-bearing trait
    have_action = any(e.get(sec) for sec in ("actions", "bonus", "reactions", "legendary"))
    if not have_action:
        atk_trait = any((t.get("atk") is not None) or t.get("dmg") or t.get("saveDC")
                        for t in (e.get("traits") or []))
        if not atk_trait:
            flags.append(("action", "no action/bonus/reaction/legendary or attack trait"))
    # flavor table: core = customTables[] (Adam's SACRED hand-authored tables — OPTIONAL by design;
    # only a minority of core monsters carry one). A table with rows counts even if its heading
    # doesn't lead with a dN; that's a separate, milder "die undeclared" note, not a missing table.
    cts = e.get("customTables") or []
    if not any(ct.get("rows") for ct in cts):
        flags.append(("flavorTable", "no customTables flavor d-table (optional for core)"))
    elif not any(ct.get("die") for ct in cts):
        flags.append(("flavorTableDie", "customTables present but no die declared in the heading"))
    status = resolve_model(eid, reg, sub)
    if status == "MISSING":
        flags.append(("model", "model key unresolved (cuboid fallback)"))
    return flags, status


def check_realm_entry(c, best_ids, reg, sub):
    flags = []
    missing_req = [f for f in REALM_REQUIRED if f not in c or c[f] in (None, "")]
    if missing_req:
        flags.append(("required", "missing required: " + ",".join(missing_req)))
    frame = c.get("frame")
    if frame and frame not in best_ids:
        flags.append(("frame", "frame '%s' not a BESTIARY id (no stat chassis)" % frame))
    ft = c.get("flavorTable")
    if not (isinstance(ft, dict) and ft.get("die") and ft.get("rows")):
        flags.append(("flavorTable", "no d8 flavorTable"))
    status = resolve_model(c.get("model"), reg, sub)
    if status == "MISSING":
        flags.append(("model", "model '%s' unresolved (cuboid fallback)" % c.get("model")))
    return flags, status


def score(flags):
    return sum(WEIGHT.get(f[0], 1) for f in flags)


# ---------- report ----------
def main():
    top_n = 20
    if "--top" in sys.argv:
        try:
            top_n = int(sys.argv[sys.argv.index("--top") + 1])
        except (ValueError, IndexError):
            pass

    bestiary = extract_const_json(BESTIARY_JS, "BESTIARY", "\nconst BESTIARY_BY_CR=")
    realm = extract_const_json(REALM_JS, "REALM_BESTIARY")
    reg, sub = extract_registry()
    best_ids = set(bestiary.keys())

    L = []  # markdown lines
    p = L.append

    # ---- run PART A ----
    core_flagged = []      # (id, flags, status)
    core_counts = {}       # check -> count
    core_model = {"EXACT": 0, "ALIAS": 0, "MISSING": 0}
    for eid, e in bestiary.items():
        flags, status = check_core_entry(eid, e, reg, sub)
        core_model[status] += 1
        for f in flags:
            core_counts[f[0]] = core_counts.get(f[0], 0) + 1
        if flags:
            core_flagged.append((eid, flags, status, score(flags)))

    realm_flagged = []
    realm_counts = {}
    realm_model = {"EXACT": 0, "ALIAS": 0, "MISSING": 0}
    realm_total = 0
    for rname, creatures in realm.items():
        for c in creatures:
            realm_total += 1
            flags, status = check_realm_entry(c, best_ids, reg, sub)
            realm_model[status] += 1
            for f in flags:
                realm_counts[f[0]] = realm_counts.get(f[0], 0) + 1
            if flags:
                realm_flagged.append(("%s/%s" % (rname, c.get("name", "?")), flags, status, score(flags)))

    # ---- run PART B ----
    reg_flagged = []
    reg_counts = {"module_missing": 0, "fn_not_exported": 0, "discR_missing": 0,
                  "discR_nonstandard": 0}
    for key, entry in reg.items():
        rflags = []
        mod = entry.get("module")
        mod_abs = os.path.normpath(os.path.join(FIGURES_DIR_BASE, mod)) if mod else None
        if not mod:
            rflags.append("no module path")
        elif not os.path.exists(mod_abs):
            rflags.append("module file absent: " + mod)
            reg_counts["module_missing"] += 1
        else:
            fn = entry.get("fn")
            if not fn:
                rflags.append("no fn")
            elif fn not in module_exports(mod_abs):
                rflags.append("fn '%s' not exported by %s" % (fn, mod))
                reg_counts["fn_not_exported"] += 1
        dr = entry.get("discR")
        if not is_num(dr):
            rflags.append("no discR")
            reg_counts["discR_missing"] += 1
        elif round(dr, 3) not in DISC_VOCAB:
            rflags.append("discR %s outside size-law vocab" % dr)
            reg_counts["discR_nonstandard"] += 1
        if rflags:
            reg_flagged.append((key, rflags))

    sub_dangling = [(k, v) for k, v in sub.items() if v not in reg]

    # ---- emit markdown ----
    p("# Unit Standardization Report")
    p("")
    p("_Generated by `build/lint-units.py` — a read-only REPORTER (never a CI gate; always exits 0). "
      "Every line is a FLAG for a human/model to judge, not a build failure._")
    p("")
    p("Corpus: **%d** core BESTIARY entries, **%d** realm REALM_BESTIARY entries (across %d realms), "
      "**%d** WHOLE_OBJECT_REGISTRY models, **%d** NEAREST_SUB aliases."
      % (len(bestiary), realm_total, len(realm), len(reg), len(sub)))
    p("")
    p("## How to read this")
    p("")
    p("**PART A — congruence** checks each bestiary entry against the field contract in "
      "`build/gen-bestiary.py` / `build/gen-realm-bestiary.py`:")
    p("")
    p("- **abilities** — all six STR/DEX/CON/INT/WIS/CHA present with a real numeric score.")
    p("- **hp** — numeric hp *and* a non-empty `hpFormula` (hit dice).")
    p("- **ac** — numeric AC. · **cr** — a real CR (0 is valid; absent is not).")
    p("- **action** — at least one action/bonus/reaction/legendary, or an attack-bearing trait.")
    p("- **flavorTable** — a hand-authored d-table: core `customTables[]` (OPTIONAL by design — "
      "Adam's SACRED tables, carried on only a minority of core monsters), realm d8 `flavorTable` "
      "(expected on every realm reskin). **flavorTableDie** = a core table is present but its "
      "heading doesn't declare a die (milder note).")
    p("- **model** — the render key resolves through the wiring: EXACT (direct registry hit) / "
      "ALIAS (via NEAREST_SUB) / MISSING (drops to the cuboid fallback).")
    p("- (realm only) **required** — the 7 required fields; **frame** — `frame` resolves to a real "
      "BESTIARY id (the stat chassis a reskin inherits from). Realm STR/HP/AC/actions live on that "
      "frame, so they are not re-checked on the reskin itself.")
    p("")
    p("**PART B — model standard** checks each WHOLE_OBJECT_REGISTRY entry speaks one language: a "
      "`module` that exists on disk, an `fn` actually exported by it, and a `discR` in the size-law "
      "vocabulary {0.32, 0.42, 0.48, 0.55, 0.62, 0.68, 0.72}. Plus NEAREST_SUB hygiene (no dangling "
      "alias targets).")
    p("")

    # PART A summary
    p("## PART A — bestiary congruence")
    p("")
    p("### Core BESTIARY (%d entries) — per-check gap counts" % len(bestiary))
    p("")
    p("| check | entries flagged |")
    p("|---|---|")
    for k in ["abilities", "hp", "ac", "cr", "action", "flavorTable", "flavorTableDie", "model"]:
        p("| %s | %d |" % (k, core_counts.get(k, 0)))
    p("")
    p("_flavorTable is OPTIONAL for core — %d of %d core monsters carry a hand-authored table; the "
      "count above is coverage information, not breakage._"
      % (len(bestiary) - core_counts.get("flavorTable", 0), len(bestiary)))
    p("")
    p("Model wiring: **EXACT %d · ALIAS %d · MISSING %d** "
      "(%d of %d core ids render a real body; %d fall to the cuboid fallback)."
      % (core_model["EXACT"], core_model["ALIAS"], core_model["MISSING"],
         core_model["EXACT"] + core_model["ALIAS"], len(bestiary), core_model["MISSING"]))
    p("")
    p("### Realm REALM_BESTIARY (%d entries) — per-check gap counts" % realm_total)
    p("")
    p("| check | entries flagged |")
    p("|---|---|")
    for k in ["required", "frame", "flavorTable", "model"]:
        p("| %s | %d |" % (k, realm_counts.get(k, 0)))
    p("")
    p("Model wiring: **EXACT %d · ALIAS %d · MISSING %d**."
      % (realm_model["EXACT"], realm_model["ALIAS"], realm_model["MISSING"]))
    p("")

    # PART B summary
    p("## PART B — model registry standard")
    p("")
    p("| check | models flagged |")
    p("|---|---|")
    p("| module file absent | %d |" % reg_counts["module_missing"])
    p("| fn not exported by module | %d |" % reg_counts["fn_not_exported"])
    p("| discR missing | %d |" % reg_counts["discR_missing"])
    p("| discR outside size-law vocab | %d |" % reg_counts["discR_nonstandard"])
    p("| NEAREST_SUB dangling alias | %d |" % len(sub_dangling))
    p("")
    if reg_flagged:
        p("### Flagged models")
        p("")
        for key, rflags in sorted(reg_flagged):
            p("- **%s** — %s" % (key, "; ".join(rflags)))
        p("")
    else:
        p("_All %d registry models are well-formed (module on disk, fn exported, discR in vocab)._" % len(reg))
        p("")
    if sub_dangling:
        p("### NEAREST_SUB dangling aliases (target not a registry key)")
        p("")
        for k, v in sorted(sub_dangling):
            p("- `%s` → `%s` (missing)" % (k, v))
        p("")

    # Worst-first tail
    all_flagged = ([("core", *x) for x in core_flagged] +
                   [("realm", *x) for x in realm_flagged])
    all_flagged.sort(key=lambda r: (-r[4], r[1]))
    p("## Top %d most-incongruent entries (worst-first)" % top_n)
    p("")
    p("_Sort key = summed flag weight (abilities/hp/frame/required = 3, ac/cr/action = 2, "
      "flavorTable/model = 1). %d core + %d realm entries carry at least one flag._"
      % (len(core_flagged), len(realm_flagged)))
    p("")
    p("| # | layer | entry | wt | flags |")
    p("|---|---|---|---|---|")
    for i, (layer, eid, flags, status, sc) in enumerate(all_flagged[:top_n], 1):
        detail = "; ".join("**%s**: %s" % (f[0], f[1]) for f in flags)
        p("| %d | %s | `%s` | %d | %s |" % (i, layer, eid, sc, detail))
    p("")

    sys.stdout.write("\n".join(L) + "\n")


if __name__ == "__main__":
    main()
