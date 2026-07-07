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
# HOTFIX-QUEUE-2026-07-06 H9(e): strip comments before def-scanning — a commented-out fake
# definition ("// const saveWorld = x") in a file that doesn't really own the symbol was tripping a
# false DRIFT error. Strips /* block */ and // line comments; the `(^|[^:])` guard on `//` keeps
# `http://` (and similar) protocol strings intact. String-literal false positives (a def keyword
# inside a JS string) are accepted as out of scope — a full JS lexer is not being built for this.
# Scope ruling (see H9 spec): this patches _defset ONLY, not defs_in's non-word raw-regex branch —
# every owned symbol in manifest.json is a \w+ word symbol, so that branch is never exercised by an
# owned-symbol check; leaving it comment-blind is inert today.
_COMMENT_RE=re.compile(r'/\*[\s\S]*?\*/|(^|[^:])//.*')
def _strip_comments(text):
    return _COMMENT_RE.sub(r'\1', text)
def _defset(path):
    if path not in _def_cache:
        _def_cache[path]=set(_DEF_RE.findall(_strip_comments(_text(path))))
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
# orphan .js not registered (HOTFIX-QUEUE-2026-07-06 H9(a): an unregistered module is a real drift
# risk (CLAUDE.md already claims this "fails on orphans" — make it true), not a warning.
# KNOWN_UNREGISTERED is an escape hatch for a deliberate future orphan (e.g. a scratch/example file
# never meant to load); empty today — if it's ever non-empty, the file it names must NOT be loaded
# by genesis.html either, or the two checks contradict each other.
KNOWN_UNREGISTERED=set()
registered={m["path"] for m in mods}
for f in glob.glob("data/*.js")+glob.glob("src/**/*.js",recursive=True):
    if f not in registered and f not in KNOWN_UNREGISTERED:
        errors.append("unregistered file (add to manifest): "+f)

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
    # HOTFIX-QUEUE-2026-07-06 H9(d): attribute-order-tolerant tag scan. The old regexes
    # (`<script src="..."` / `<script type="module" src="..."`) only matched that EXACT attribute
    # order — `<script defer src="...">` or `<script src="..." type="module">` silently fell through
    # both, producing false "no <script> tag" errors. Scan every <script ...src="*.js" ...> tag as a
    # whole, in document order, then classify module-vs-classic by searching the FULL tag text for
    # type="module" (order-independent).
    _TAG_RE=re.compile(r'<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>')
    all_tags=[]  # ordered list of (path, tag_text, start_offset)
    for mobj in _TAG_RE.finditer(html):
        all_tags.append((mobj.group(1), mobj.group(0), mobj.start()))
    classic_tags=[p for (p,t,_) in all_tags if not re.search(r'\btype="module"', t)]
    module_tags=set(p for (p,t,_) in all_tags if re.search(r'\btype="module"', t))
    # first tag-start offset per path — used by both the (b) sequence check and the (c) mustFollow
    # check; a path may legitimately have exactly one tag (classic or module), so first==only.
    first_offset={}
    for (p,t,start) in all_tags:
        if p not in first_offset: first_offset[p]=start
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
    # HOTFIX-QUEUE-2026-07-06 H9(b): loadOrder is a SEQUENCE, not just a membership set — a manifest
    # that lists the right files but in the wrong order silently ships a load-order bug (a module
    # loading before a dependency it needs at top-level). Compare the loadOrder sequence (filtered to
    # entries that DO have a matching classic tag — module-type entries and any entry with no tag are
    # already errored above) against the actual document order of those same tags.
    lo_with_tags=[e for e in lo if e in tagset]
    actual_order=sorted(lo_with_tags, key=lambda p: first_offset.get(p, -1))
    if actual_order != lo_with_tags:
        errors.append("loadOrder SEQUENCE differs from <script> tag order: manifest says "
                      +str(lo_with_tags)+", html says "+str(actual_order))
    # HOTFIX-QUEUE-2026-07-06 H9(c): an optional per-module "mustFollow" key on a type:"module" entry
    # mechanizes an ordering dependency that used to be comment-only (e.g. ref-bestiary.js needing
    # window.Theater.refFigure to exist, i.e. needing to load AFTER theater-boot.js's own tag).
    for m in mods:
        if m.get("type")!="module": continue
        for followee in m.get("mustFollow",[]):
            fo=first_offset.get(followee); mo=first_offset.get(m["path"])
            if fo is None or mo is None: continue  # missing-tag case already errored above
            if not (mo>fo):
                errors.append(f"mustFollow violated: {m['path']} must load AFTER {followee} "
                              f"(found at offsets {mo} <= {fo} in genesis.html)")

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
 "ui.dice":1,"ui.blockwright":1,"ui.theater-boot":1,"ui.theater-verbs":1,"ui.theater-parts":1,"ui.theater-figures":1,"ui.reference-shelf":1,
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
