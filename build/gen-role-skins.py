#!/usr/bin/env python3
"""Genesis build — generate data/npc-role-skins.js from the NPC-ROLE-REALMS spine + realm skins.

docs/NPC-ROLE-REALMS.md ("Data seam"): `npc-role` (the frontier-coast-only flat d100) is being
replaced by a **spine + realm skin** system — `Engine/03. _Tables/02. Social/Sentient NPCs/
NPC Role Spine.md` (35 universal role-ARCHETYPES, each with a universal play-angle note, a class
tag, and a default Weight) plus one `NPC Role Skin - <Realm>.md` per realm (an overlay that
relabels/drops/adds/reweights the spine for that world). These are NOT roll tables —
compile-tables.py skips them as label-overlays — so they get their own generator here, mirroring
build/gen-realm-props.py's discipline exactly: source markdown -> data/*.js, a --check mode,
"GENERATED — never hand-edit" header, never hand-edit the artifact.

Emits data/npc-role-skins.js (classic <script> globals, NOT ES module):
  NPC_ROLE_SPINE = [ {key, archetype, note, weight, cls}, ... ]                    (35 entries)
  NPC_ROLE_SKINS = { realmId: { reskin: { "<key>": {label, weight} }, adds: [...] } }
  roleForRealm(realmId, rng) -> {archetypeKey, label, note, cls}  (weighted pick, hand-written JS)

Weight semantics (spec): blank cell in a skin's reskin row = inherit the spine's default weight;
`0` = drop (excluded from that realm's pool entirely). Realm ids = data/realms.js REALM_IDS; an
unknown/absent realm id falls back to 'frontier' at roll time (roleForRealm), not here.

Modes:
  (default)  write data/npc-role-skins.js
  --check    validate only (spine shape, every REALM_ID has a skin, every non-dropped archetype
             has a label, every ADD row carries role/weight/cls/note); no write.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLES_DIR = os.path.join(ROOT, "Engine", "03. _Tables", "02. Social", "Sentient NPCs")
SPINE_SRC = os.path.join(TABLES_DIR, "NPC Role Spine.md")
REALMS_SRC = os.path.join(ROOT, "data", "realms.js")
OUT = os.path.join(ROOT, "data", "npc-role-skins.js")

# filename stem "Ash" / "Bright-Kingdom" / "High-Seas" / "Lost-World" -> realm id, exact match to
# data/realms.js's REALM_IDS (a plain .lower() of the stem — every skin filename was authored to
# already match the realm id's casing/hyphenation 1:1).
SKIN_FILE_RE = re.compile(r"^NPC Role Skin - (.+)\.md$")


def real_realm_ids():
    """Parse data/realms.js's REALMS object keys — mirrors gen-realm-props.py's own parse,
    without requiring a JS runtime."""
    txt = open(REALMS_SRC, encoding="utf-8").read()
    m = re.search(r"const REALMS\s*=\s*\{", txt)
    if not m:
        print("FATAL: could not find `const REALMS = {` in data/realms.js", file=sys.stderr)
        sys.exit(1)
    ids = re.findall(r'^\s{2}"?([a-z][a-z0-9-]*)"?:\s*\{', txt[m.end():], re.MULTILINE)
    return [i for i in ids if i != "realm-neutral"]


SPINE_ROW_RE = re.compile(
    r"^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*$", re.MULTILINE
)


def parse_spine(text):
    """35 rows: | # | Archetype | Play-Angle (universal) | Weight | Tags |"""
    rows = []
    seen_keys = set()
    for m in SPINE_ROW_RE.finditer(text):
        key, archetype, note, weight, tags = m.groups()
        key = int(key)
        if key in seen_keys:
            continue  # a stray table-format example row elsewhere in the doc; keep the first hit
        seen_keys.add(key)
        cls = tags.split(",")[0].strip().split()[0].lower() if tags.strip() else ""
        rows.append({"key": key, "archetype": archetype, "note": note, "weight": int(weight), "cls": cls})
    rows.sort(key=lambda r: r["key"])
    return rows


RESKIN_ROW_RE = re.compile(
    r"^\|\s*(\d+)\s*·\s*[^|]+?\s*\|\s*(.+?)\s*\|\s*(\d*)\s*\|\s*$", re.MULTILINE
)
ADD_ROW_RE = re.compile(
    r"^\|\s*\[ADD\]\s*\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$", re.MULTILINE
)


def parse_skin(text):
    """A skin file's two tables: the reskin map (Archetype key | label | Weight) and the Adds
    table ([ADD] | Role | Weight | Class | Note). A dropped archetype's label is literally "—"
    in the source (paired with an explicit Weight 0) — kept verbatim as the label text (never
    surfaced: roleForRealm excludes weight-0 pool entries before any label is read)."""
    reskin = {}
    for m in RESKIN_ROW_RE.finditer(text):
        key, label, weight = m.groups()
        reskin[key] = {"label": label, "weight": (int(weight) if weight != "" else None)}
    adds = []
    for m in ADD_ROW_RE.finditer(text):
        role, weight, cls, note = m.groups()
        adds.append({"role": role, "weight": int(weight), "cls": cls, "note": note})
    return reskin, adds


def load_skins():
    out = {}
    for fname in sorted(os.listdir(TABLES_DIR)):
        m = SKIN_FILE_RE.match(fname)
        if not m or fname == "NPC Role Spine.md":
            continue
        realm_id = m.group(1).lower()
        text = open(os.path.join(TABLES_DIR, fname), encoding="utf-8").read()
        reskin, adds = parse_skin(text)
        out[realm_id] = {"reskin": reskin, "adds": adds, "_file": fname}
    return out


def validate(spine, skins, realm_ids):
    errors = []
    if len(spine) != 35:
        errors.append(f"spine: expected 35 archetypes, parsed {len(spine)} — NPC Role Spine.md table drifted")
    spine_keys = {r["key"] for r in spine}
    if spine_keys != set(range(1, 36)):
        missing = sorted(set(range(1, 36)) - spine_keys)
        extra = sorted(spine_keys - set(range(1, 36)))
        errors.append(f"spine: key set is not exactly 1..35 (missing={missing}, extra={extra})")

    missing_realms = [r for r in realm_ids if r not in skins]
    if missing_realms:
        errors.append(f"missing realm skin(s) entirely: {missing_realms} (no 'NPC Role Skin - <Realm>.md' matched)")
    extra_skins = [r for r in skins if r not in realm_ids]
    if extra_skins:
        errors.append(f"skin file(s) for unknown realm id(s) (not in data/realms.js REALM_IDS): {extra_skins}")

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
            if not (add.get("role") and add.get("cls") and add.get("note") and isinstance(add.get("weight"), int)):
                errors.append(f"{realm_id} ({skin['_file']}): ADD row #{i+1} missing role/weight/cls/note — {add}")
        if not skin["adds"]:
            errors.append(f"{realm_id} ({skin['_file']}): no [ADD] rows parsed (every skin authors realm-unique adds per NPC-ROLE-REALMS.md)")

    return errors


ROLE_FOR_REALM_JS = """
/* roleForRealm(realmId, rng) -> {archetypeKey, label, note, cls} — NPC-ROLE-REALMS.md "Engine
   wiring": weighted-pick a spine archetype (skin weight override, else spine default; weight 0 =
   excluded) union'd with that realm's own [ADD] roles (own weight/label/note/cls), then weighted-
   pick ONE entry from the combined pool. `rng` is an optional zero-arg fn returning a float in
   [0,1) (same contract as Math.random) — omit it and this uses Math.random() directly, same
   defensive style as this file's siblings (rollNpcBreachTouch, coherenceAtomGate). realmId falls
   back to 'frontier' when absent/unrecognized (NPC-ROLE-REALMS.md "default when no realm context
   -> frontier skin, no regression"). ADD entries carry a synthetic, always-truthy archetypeKey
   ("add:<role>") — rollNPC's `rolled.archetypeKey set` contract holds for adds too, they just
   don't map back onto a spine row. Pure — no state/DOM access, safe for the jsdom harness.
   opts.addsOnly (bool, additive) restricts the pool to ONLY that realm's [ADD] rows — the
   NPC-ROLE-REALMS.md hybridization seam (src/engine/codex-roll.js's rollNPC opts.hybridRealm rider)
   draws a fray-scaled minority of picks from a *breached* realm's edge-adds specifically, never its
   whole reskinned spine (the "Fallout pocket": a war-shape washes up, not a whole parallel town). */
function roleForRealm(realmId, rng, opts){
  var rnd = (typeof rng === "function") ? rng : Math.random;
  var addsOnly = !!(opts && opts.addsOnly);
  var skin = (NPC_ROLE_SKINS[realmId]) || NPC_ROLE_SKINS.frontier || null;
  if(!skin) return null; // defensive: data file failed to load / is empty — never throw
  var pool = [];
  if(!addsOnly){
    NPC_ROLE_SPINE.forEach(function(a){
      var row = skin.reskin[String(a.key)];
      var weight = (row && row.weight !== null && row.weight !== undefined) ? row.weight : a.weight;
      if(!weight) return; // 0 or missing override with a 0 spine default -> dropped
      var label = (row && row.label) ? row.label : a.archetype;
      pool.push({archetypeKey:a.key, label:label, note:a.note, cls:a.cls, weight:weight});
    });
  }
  (skin.adds || []).forEach(function(add){
    if(!add.weight) return;
    pool.push({archetypeKey:"add:"+add.role, label:add.role, note:add.note, cls:add.cls, weight:add.weight});
  });
  if(!pool.length) return null; // defensive: a malformed skin dropped everything (or addsOnly on an empty adds list) — never throw
  var total = 0;
  for(var i=0;i<pool.length;i++) total += pool[i].weight;
  var roll = rnd() * total;
  var acc = 0;
  for(var j=0;j<pool.length;j++){
    acc += pool[j].weight;
    if(roll < acc) return {archetypeKey:pool[j].archetypeKey, label:pool[j].label, note:pool[j].note, cls:pool[j].cls};
  }
  var last = pool[pool.length-1]; // float-rounding guard, same pattern as pickCoherenceTier's fallthrough
  return {archetypeKey:last.archetypeKey, label:last.label, note:last.note, cls:last.cls};
}
"""


def main():
    check_only = "--check" in sys.argv
    spine_text = open(SPINE_SRC, encoding="utf-8").read()
    spine = parse_spine(spine_text)
    skins = load_skins()
    realm_ids = real_realm_ids()

    errors = validate(spine, skins, realm_ids)
    if errors:
        print(f"NPC-ROLE-SKINS VALIDATION FAILED ({len(errors)} error(s)):", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)

    total_adds = sum(len(s["adds"]) for s in skins.values())
    print(f"validation OK — 35 spine archetypes, {len(realm_ids)} realm skins, {total_adds} total [ADD] roles")

    if check_only:
        return

    out_skins = {}
    for realm_id in realm_ids:
        s = skins[realm_id]
        out_skins[realm_id] = {
            "reskin": {k: {"label": v["label"], "weight": v["weight"]} for k, v in s["reskin"].items()},
            "adds": [{"role": a["role"], "weight": a["weight"], "cls": a["cls"], "note": a["note"]} for a in s["adds"]],
        }

    header = (
        "/* GENESIS DATA (generated) — data/npc-role-skins.js\n"
        "   docs/NPC-ROLE-REALMS.md \"Data seam\" — the 35-archetype universal role SPINE\n"
        "   (`Engine/03. _Tables/02. Social/Sentient NPCs/NPC Role Spine.md`) + one realm SKIN per\n"
        "   `data/realms.js` REALM_ID (`NPC Role Skin - <Realm>.md`) that relabels/drops/adds/reweights\n"
        "   it for that world. NPC_ROLE_SPINE = [{key,archetype,note,weight,cls}, ...] (35 entries, the\n"
        "   universal play-angle + default Weight). NPC_ROLE_SKINS = {realmId: {reskin:{\"<key>\":\n"
        "   {label,weight}}, adds:[{role,weight,cls,note}, ...]}} — reskin.weight null means \"inherit\n"
        "   the spine default\", 0 means \"drop\" (the archetype cannot exist in this realm). Consumed by\n"
        "   roleForRealm(realmId,rng) (hand-written below, not generated) — src/engine/codex-roll.js's\n"
        "   rollNPC() calls it in place of the old flat rollTable(\"npc-role\"). GENERATED from the\n"
        "   Engine markdown source; never hand-edit — edit the source .md tables + re-run\n"
        "   `python3 build/gen-role-skins.py`. Added 2026-07-08.\n"
        "   Classic <script> (shared global scope); defines NPC_ROLE_SPINE + NPC_ROLE_SKINS + roleForRealm. */\n"
    )
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("const NPC_ROLE_SPINE=" + json.dumps(spine, ensure_ascii=False, indent=1) + ";\n")
        f.write("const NPC_ROLE_SKINS=" + json.dumps(out_skins, ensure_ascii=False, indent=1) + ";\n")
        f.write(ROLE_FOR_REALM_JS)
    print(f"  -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
