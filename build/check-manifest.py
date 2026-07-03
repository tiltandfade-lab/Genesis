#!/usr/bin/env python3
"""Genesis index consistency check. Validates manifest.json against the filesystem
and enforces single-definition of each owned symbol. Run after any module edit.
Exit 0 = consistent; exit 1 = drift found."""
import json,os,re,sys,glob
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
M=json.load(open("manifest.json"))
errors=[]; warns=[]
mods=M["modules"]
ids=[m["id"] for m in mods]
if len(ids)!=len(set(ids)): errors.append("duplicate module ids: "+str([i for i in ids if ids.count(i)>1]))
# path existence
for m in mods:
    if not os.path.exists(m["path"]): errors.append(f"{m['id']}: path missing -> {m['path']}")
# load order entries map to a known path
paths={m["path"] for m in mods}|{"genesis.html (main)"}
for entry in M.get("loadOrder",[]):
    if entry not in paths and entry.split(" ")[0] not in paths:
        warns.append("loadOrder entry not a known module path: "+entry)
# single-definition of owned symbols (skip the app wildcard)
# Each file is read + scanned ONCE for all declared identifiers (zero-width capture so
# the identifier itself isn't consumed), then every symbol question is a set lookup —
# instead of one full-file regex pass per (symbol, file) pair.
_DEF_RE=re.compile(r'\b(?:const|let|var|function|class)\s+(?=(\w+))')
_txt_cache={}; _def_cache={}
def _text(path):
    if path not in _txt_cache:
        _txt_cache[path]=open(path,encoding="utf-8").read() if os.path.exists(path) else ""
    return _txt_cache[path]
def _defset(path):
    if path not in _def_cache:
        _def_cache[path]=set(_DEF_RE.findall(_text(path)))
    return _def_cache[path]
_WORD_RE=re.compile(r'\w+\Z')
def defs_in(path,sym):
    if _WORD_RE.match(sym): return 1 if sym in _defset(path) else 0
    # symbol names with non-\w chars can't use the tokenized set; scan the cached text
    return len(re.findall(r'(?:^|\b)(?:const|let|var|function|class)\s+'+re.escape(sym)+r'\b',_text(path)))
for m in mods:
    for sym in m.get("owns",[]):
        if sym.startswith("*"): continue
        here=defs_in(m["path"],sym)
        if here<1: errors.append(f"{m['id']}: owns '{sym}' but no definition found in {m['path']}")
        # must NOT be defined in any other module file
        for other in mods:
            if other["path"]==m["path"]: continue
            if other["path"]=="genesis.html": op="genesis.html"
            else: op=other["path"]
            if defs_in(op,sym)>0:
                errors.append(f"DRIFT: '{sym}' (owned by {m['id']}) is also defined in {op}")
# orphan .js not registered
registered={m["path"] for m in mods}
for f in glob.glob("data/*.js")+glob.glob("src/**/*.js",recursive=True):
    if f not in registered: warns.append("unregistered file (add to manifest): "+f)

# --- HTML <script> tags must match the manifest loadOrder (catches "in manifest, not loaded") ---
# BATTLE-THEATER T1 exemption (minimal, red-first): a manifest module can declare "type":"module" —
# it's loaded via its OWN `<script type="module" src="...">` tag (an ES-module boundary, e.g.
# src/ui/theater-boot.js), not via the classic loadOrder list, so it must NOT be required to appear
# in loadOrder and must NOT be flagged as "tag not in manifest loadOrder" the way a stray classic
# script would be. It still must have a real <script> tag in genesis.html (a module entry with no
# matching tag is exactly the "in manifest, not loaded" bug this section exists to catch) and its
# tag must actually carry type="module" (catches the entry drifting to a plain classic tag, which
# would silently break the import-map-scoped `import` inside it). Before this exemption existed,
# registering ui.theater-boot in manifest.json (type:"module", no loadOrder entry) tripped the
# pre-existing "loadOrder entry not a known module path"-adjacent tag scan as a false positive on a
# design that was never a loadOrder omission — proving the gap red before this patch closed it.
if os.path.exists("genesis.html"):
    html=open("genesis.html",encoding="utf-8").read()
    classic_tags=re.findall(r'<script src="([^"]+\.js)"', html)
    module_tags=set(re.findall(r'<script type="module" src="([^"]+\.js)"', html))
    lo=[e for e in M.get("loadOrder",[]) if e.endswith(".js")]
    tagset=set(classic_tags)
    module_mods={m["path"] for m in mods if m.get("type")=="module"}
    for e in lo:
        if e not in tagset: errors.append(f"loadOrder entry has NO <script> tag in genesis.html (won't load): {e}")
    for mp in module_mods:
        if mp not in module_tags:
            errors.append(f"module-type manifest entry has NO <script type=\"module\"> tag in genesis.html (won't load): {mp}")
    known={"tables.js"}  # compiled artifact, intentionally not a manifest module
    for t in classic_tags:
        if t not in set(lo) and t not in known and t not in module_mods:
            warns.append(f"<script> tag not in manifest loadOrder: {t}")

# --- layer-direction check (WARN-mode): a module should not call UP into a higher layer ---
# Layers (lower may depend on same-or-lower; calling a higher layer is an inversion).
# Shared state/data consts live in app.main (the * wildcard) and are an exempt substrate
# any layer may read — only calls to *module-owned functions* in a higher layer are flagged.
# (Flip these warns to errors once the known inversions in docs/SCALING.md are cleaned.)
LAYER={
 "state":0,
 "data.pronouns":0,
 "data.character-genesis":0,"data.names":0,"data.names-cultures":0,"data.world-tables":0,"data.starting-state":0,
 "data.species-backgrounds":0,"data.souls-canon":0,"data.srd-creator":0,"data.spells-slim":0,"data.spells":0,
 "data.class-progression":0,"data.subclass-progression":0,"data.feats":0,"data.bestiary":0,"data.items":0,"data.economy":0,"data.sidekick-classes":0,"data.tarot":0,"data.skin-motifs":0,"data.realms":0,"data.creation-flow":0,"data.actions-ref":0,
 "engine.core":1,"engine.tables":1,"engine.compiled":1,"engine.walk":1,"engine.walk-archetypes":1,"engine.dungeon-walk":1,"engine.wild-walk":1,"engine.quest-hook":1,"engine.prep-bundle":1,"engine.codex-roll":1,"engine.skin-grants":1,"engine.breach":1,"engine.crit":1,"engine.social":1,"engine.consequence":1,"engine.combat":1,"engine.economy":1,"engine.check":1,"engine.conditions":1,"engine.concentration":1,"engine.combat-actions":1,"engine.monster-tactics":1,"engine.death":1,"engine.hazards":1,"engine.theater-data":1,"engine.hexmap":1,"engine.region":1,"engine.tarot":1,"engine.resources":1,"engine.advancement":1,"world.state":1,"world.codex":1,"world.triage":1,"world.seam":3,
 "ui.dice":1,"ui.blockwright":1,"ui.theater-boot":1,"ui.theater-verbs":1,"ui.theater-parts":1,
 "engine.world-gen":2,"world.render":2,"world.saga":2,"world.rebirth":2,"ui.oracle":2,"creator.scores":2,"creator.life":2,
 "creator.sheet":3,"creator.bardo":3,"creator.roster":3,"creator.levelup":3,"creator.world-name":3,
 "ui.chrome":4,"world.play":4,"world.fate":4,"world.inventory":4,"world.handoff":4,"world.prep":4,"world.capture":4,"world.dm":4,"world.shop":4,"world.turn":4,"world.reputation":4,"world.companions":4,"world.durability":4,"world.store":4,
 "app.main":5,
}
owner={}
for m in mods:
    if any(s.startswith("*") for s in m.get("owns",[])): continue   # app wildcard = exempt substrate
    for s in m.get("owns",[]): owner[s]=m["id"]
for m in mods:
    if m["id"] not in LAYER:
        warns.append("layer: no layer assigned (add to LAYER in check-manifest.py): "+m["id"]); continue
    ml=LAYER[m["id"]]
    for dep in m.get("callTimeDeps",[]):
        o=owner.get(dep)
        if not o: continue          # unowned = app-owned state/data or external (window.*) — exempt
        ol=LAYER.get(o)
        if ol is not None and ol>ml:
            warns.append(f"layer: {m['id']} (L{ml}) calls UP into {o} (L{ol}) via '{dep}' — see docs/SCALING.md")

print("modules:",len(mods)," owned symbols checked:",sum(len([s for s in m.get('owns',[]) if not s.startswith('*')]) for m in mods))
for w in warns: print("  WARN:",w)
for e in errors: print("  ERROR:",e)
print("RESULT:", "FAIL" if errors else "OK")
sys.exit(1 if errors else 0)
