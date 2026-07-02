/* GENESIS MODULE — src/world/durability.js — THE DURABILITY TRIO (docs/DURABILITY-TRIO.md).
   Classic <script>, shared global scope. Three small units bundled in one file (batch-2 "durability"):
     §1 World export/import — the "forever" promise, insured (a file in the player's hand, not just
        localStorage). Pure serialize/parse/merge helpers here; the DOM download/file-picker glue lives
        in genesis.html + the ⚙ Menu (world.render) — kept thin so this file stays jsdom-testable headless.
     §2 Environmental rust — a non-magical METAL weapon/armor exposed to a qualifying hazard rusts
        (tell first, teeth second): first exposure → `rusting` (cosmetic tell), second un-maintained
        exposure → `rusted` (weapon damage die steps down one size; armor AC −1). A whetstone & oil kit
        or a smith (economy) clears it; any rest also auto-maintains everything carried.
     §3 Chronicle ⇐ Ledger — chronicleLine(entry) renders the player-facing Chronicle FROM the existing
        ledger (world.state's addLedger) instead of the parallel prose w.log store. Legacy w.log lines
        with no ledger twin are imported once (idempotent) as session-type ledger entries; logEvent
        becomes an inert back-compat shim so its 16 existing call sites (world.play, creator (sheet,
        levelup), world.fate, world.rebirth, engine.world-gen) keep working without a 16-site edit
        sweep (G0: minimal diffs).
   Reads U/uid/slug (world.state), ITEMS_BY_NAME/baseDef/itemDef (engine.combat), addLedger/ledgerOf/
   migrateWorld (world.state), livingSheet (world.dm) at call-time. */

/* ============================================================
   §1. WORLD EXPORT / IMPORT
   ============================================================ */

const DURABILITY_EXPORT_VERSION = 1;

/* Full-universe export: the whole U (every world + roster + revealed-state), pretty-printed. Caller
   wraps this in a Blob/download — this function stays pure (string in, string out) so it's testable
   without a DOM. */
function exportUniverseJSON(u){
  const payload = { version: DURABILITY_EXPORT_VERSION, kind: "universe", exportedAt: Date.now(), universe: u || {} };
  return JSON.stringify(payload, null, 2);
}

/* Single-world export: one world wrapped in a minimal U shape (so importUniverseJSON can treat both
   export kinds identically — a minimal universe with exactly one world). */
function exportWorldJSON(w){
  if(!w) return null;
  const minimalU = { worlds: { [w.id]: w }, activeWorldId: w.id };
  const payload = { version: DURABILITY_EXPORT_VERSION, kind: "world", exportedAt: Date.now(), universe: minimalU };
  return JSON.stringify(payload, null, 2);
}

/* Validate a parsed export payload's shape (not yet the world contents — migrateWorld handles that).
   Returns {ok:true} or {ok:false, reason, message} — the caller surfaces `message` to the player. */
function validateImportPayload(parsed){
  if(!parsed || typeof parsed !== "object")
    return { ok:false, reason:"not-an-object", message:"That file isn't a Genesis export (not valid JSON)." };
  if(parsed.version == null)
    return { ok:false, reason:"no-version", message:"That file isn't a Genesis export (missing version)." };
  if(!parsed.universe || typeof parsed.universe !== "object" || typeof parsed.universe.worlds !== "object")
    return { ok:false, reason:"bad-shape", message:"That file isn't a Genesis export (missing worlds)." };
  return { ok:true };
}

/* Import: parse → validate → merge each incoming world into U BY WORLD ID. A world id already present
   locally is NEVER silently overwritten — it's duplicated as a copy with a fresh id (a new uid suffix
   on the name, same convention as the rest of the app's "never destroy, always fork" discipline). Every
   incoming world runs through migrateWorld (old saves upgrade on the way in, same as a normal boot).
   Returns {ok:true, imported:[ids], duplicated:[{fromId,toId}]} or {ok:false, reason, message}. */
function importUniverseJSON(jsonText, u){
  let parsed;
  try{ parsed = JSON.parse(jsonText); }
  catch(e){ return { ok:false, reason:"parse-error", message:"That file isn't valid JSON." }; }
  const v = validateImportPayload(parsed);
  if(!v.ok) return v;
  u.worlds = u.worlds || {};
  const imported = [], duplicated = [];
  Object.keys(parsed.universe.worlds).forEach(id=>{
    let w = parsed.universe.worlds[id];
    if(!w || typeof w !== "object") return;
    let targetId = id;
    if(u.worlds[id]){
      // conflict: duplicate-as-copy with a new id, never overwrite.
      targetId = id + "-import-" + uid();
      w = JSON.parse(JSON.stringify(w));
      w.id = targetId;
      w.name = (w.name || "World") + " (imported copy)";
      duplicated.push({ fromId:id, toId:targetId });
    } else {
      w.id = targetId;
    }
    if(typeof migrateWorld === "function") migrateWorld(w);
    u.worlds[targetId] = w;
    imported.push(targetId);
  });
  return { ok:true, imported, duplicated };
}

/* ---------- DOM glue (download/file-picker) — guarded so this file stays jsdom-testable headless;
   jsdom provides `document` but not a real download, so these are exercised only by a real browser. ---------- */
function durabilityDownload(filename, text){
  if(typeof document === "undefined") return false;
  try{
    const blob = new Blob([text], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
    return true;
  }catch(e){ console.warn("[durability] download failed", e); return false; }
}
function fmtExportDate(){ const d=new Date(); const p=n=>String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; }

/* ⚙ Menu handlers (docs/DURABILITY-TRIO.md §1). */
function exportUniverseFile(){
  if(typeof U==="undefined") return;
  const ok = durabilityDownload(`genesis-universe-${fmtExportDate()}.json`, exportUniverseJSON(U));
  if(typeof toast==="function") toast(ok?"Universe exported ✦":"Export failed — see console");
}
function exportWorldFile(){
  const w = (typeof activeWorld==="function") ? activeWorld() : null;
  if(!w){ if(typeof toast==="function") toast("No world to export"); return; }
  const json = exportWorldJSON(w);
  const ok = durabilityDownload(`genesis-world-${slug(w.name||"world")}-${fmtExportDate()}.json`, json);
  if(typeof toast==="function") toast(ok?`${w.name} exported ✦`:"Export failed — see console");
}
/* the file <input type=file> onchange handler (genesis.html) calls this with the read text. */
function importUniverseFile(text){
  if(typeof U==="undefined" || typeof text!=="string") return;
  const r = importUniverseJSON(text, U);
  if(!r.ok){ if(typeof toast==="function") toast(r.message||"Import failed"); return; }
  if(typeof saveU==="function") saveU(U);
  const dupNote = r.duplicated.length ? ` (${r.duplicated.length} duplicated as copies)` : "";
  if(typeof toast==="function") toast(`Imported ${r.imported.length} world${r.imported.length===1?"":"s"}${dupNote} ✦`);
  if(typeof renderShelf==="function") renderShelf();
  if(typeof renderWorld==="function") renderWorld();
}

/* ============================================================
   §2. ENVIRONMENTAL RUST
   ============================================================ */

/* Runtime-local rust vocabulary. `rusted` already ships in data/items.js's ITEM_CONDITIONS (parked,
   docs/ITEMS.md §D); `rusting` (the first-exposure TELL) does NOT — that file is GENERATED (never
   hand-edit, CLAUDE.md). applyRustExposure below writes directly to inst.conditions (mirrors how
   engine.combat's enchActive/cmEquippedDamage read conditions directly) rather than routing through
   the generic condition_add event, whose ITEM_CONDITIONS gate would reject "rusting". */
const RUST_TELL = "rusting";
const RUST_TEETH = "rusted";

/* Weapon names that are NOT metal (wood/leather/rope construction) — data/items.js carries no
   material field (only category/damage), so this is a name-based heuristic reconciling the spec's
   "metal weapon" trigger against what the generated data actually exposes (BATCH2-GUARDRAILS G6:
   "reconcile the material/category fields" — logged as an uncertainty; no material field exists to
   reconcile against, so this list is the closest honest substitute). Every weapon NOT in this set,
   with a `kind:"weapon"` def, is treated as metal. */
const RUST_NONMETAL_WEAPONS = new Set([
  "club","greatclub","quarterstaff","blowgun","dart","javelin","sling","shortbow","longbow","whip"
]);
/* Armor categories: Light armor in data/items.js is leather/padded/hide-family (leather armor, padded
   armor) except studded leather — still leather-based, non-metal. Medium/Heavy are metal-plated
   (breastplate/half-plate/chain/ring/scale/splint/plate) or metal rings/discs (ring mail) — treated
   as metal. A shield (category "Shield") is wood-and-metal-rimmed in SRD flavor but functionally
   metal-bound; included as rustable (armor slot parity — the spec says "weapons AND armor"). */
function rustIsMetalItem(inst){
  const def = (typeof baseDef === "function") ? baseDef(inst) : null;
  if(!def) return false;
  if(def.kind === "weapon"){
    const key = String((inst && (inst.base||inst.name)) || "").toLowerCase().trim();
    return !RUST_NONMETAL_WEAPONS.has(key);
  }
  if(def.kind === "armor"){
    const cat = def.category || "";
    return cat === "Medium Armor" || cat === "Heavy Armor";           // Light Armor (leather/padded) is non-metal
  }
  if(def.kind === "shield" || def.category === "Shield") return true;
  return false;
}

/* Is this instance IMMUNE to rust? Magic gear is immune (spec §2) — any active enchantment overlay,
   attuned or not (a +1 sword doesn't rust waiting to be attuned either; the immunity is the item
   BEING magic, not the bonus being active). enchOf (not enchActive) so a not-yet-attuned magic item
   still counts as magic for this purpose. */
function rustImmune(inst){
  if(!inst) return true;
  const e = (typeof enchOf === "function") ? enchOf(inst) : null;
  return !!e;
}

/* Does the qualifying exposure kind rust a mundane metal item? kinds: "rain-combat" (combat while it's
   raining/storming), "submersion" (water crossing / underwater fighting), "acid" (acid/slime contact).
   All three route through this one gate so the exposure SOURCE stays swappable without touching the
   rust math. */
const RUST_EXPOSURE_KINDS = ["rain-combat","submersion","acid"];
function rustQualifyingExposure(kind){ return RUST_EXPOSURE_KINDS.indexOf(kind) >= 0; }

/* Apply one qualifying exposure to one inventory instance: mundane+metal+not-already-rusted-max only.
   First exposure → rusting (TELL). Second (already rusting, un-maintained) → rusted (TEETH) — never
   worse than rusted (gentle, no death spiral, spec §2). Returns {ok, applied, condition} — applied
   false + a reason when the item doesn't qualify (magic / non-metal / already at the rusted floor). */
function applyRustExposure(w, itemId, kind){
  const t = (typeof livingSheet === "function") ? livingSheet(w) : null;
  if(!t) return { ok:false, reason:"no-pc" };
  const it = (t.sh.inventory||[]).find(x=>x.id===itemId);
  if(!it) return { ok:false, reason:"no-such-item" };
  if(!rustQualifyingExposure(kind)) return { ok:false, reason:"non-qualifying-exposure", kind };
  if(rustImmune(it)) return { ok:true, applied:false, reason:"magic-immune" };
  if(!rustIsMetalItem(it)) return { ok:true, applied:false, reason:"non-metal" };
  it.conditions = it.conditions || [];
  if(it.conditions.indexOf(RUST_TEETH) >= 0)
    return { ok:true, applied:false, reason:"already-rusted", condition:RUST_TEETH };
  if(it.conditions.indexOf(RUST_TELL) >= 0){
    // second un-maintained exposure: upgrade tell -> teeth.
    it.conditions = it.conditions.filter(c=>c!==RUST_TELL);
    it.conditions.push(RUST_TEETH);
    if(typeof addLedger === "function")
      addLedger(w,"outcome",{kind:"item-rust",pc:t.c.name,itemId:it.id,name:it.name,stage:RUST_TEETH,exposure:kind},
        "◆ "+t.c.name+"'s "+it.name+" has rusted through — a bloom of orange gone to pitting and bite.");
    return { ok:true, applied:true, condition:RUST_TEETH };
  }
  // first qualifying exposure: the tell.
  it.conditions.push(RUST_TELL);
  if(typeof addLedger === "function")
    addLedger(w,"outcome",{kind:"item-rust",pc:t.c.name,itemId:it.id,name:it.name,stage:RUST_TELL,exposure:kind},
      "◆ "+t.c.name+"'s "+it.name+" shows a bloom of orange at the fuller — it wants oil and a stone.");
  return { ok:true, applied:true, condition:RUST_TELL };
}

/* Maintenance: clears rusting/rusted off ONE instance (a whetstone & oil kit application, or a smith's
   1gp flat service — docs/DURABILITY-TRIO.md §2). Returns true if anything was cleared. */
function rustMaintainItem(it){
  if(!it || !Array.isArray(it.conditions)) return false;
  const before = it.conditions.length;
  it.conditions = it.conditions.filter(c=>c!==RUST_TELL && c!==RUST_TEETH);
  return it.conditions.length !== before;
}

/* Auto-maintain EVERYTHING the resting PC carries — "downtime 'work' weeks auto-maintain everything
   carried" AND "a whetstone & oil kit... clears rusting/rusted DURING ANY REST" (§2): both resolve to
   the same call site (passTime, any kind). Returns the count cleared (0 = nothing to do, no-op, no
   ledger noise). Does not consume the kit's uses here — the kit item's own `uses` bookkeeping (if the
   player carries one) is a separate inventory concern; this call represents "the maintenance HAPPENED"
   whether by kit or by simply resting at leisure, matching the spec's "during any rest" wording (no
   gate on possessing the kit item — the spec ties the free clear to the rest itself, and prices the
   kit/smith as the OUT-OF-REST options for the same clear). */
function rustMaintainAll(w){
  const t = (typeof livingSheet === "function") ? livingSheet(w) : null;
  if(!t) return 0;
  let n = 0;
  (t.sh.inventory||[]).forEach(it=>{ if(rustMaintainItem(it)) n++; });
  if(n && typeof addLedger === "function")
    addLedger(w,"outcome",{kind:"item-rust-maintained",pc:t.c.name,count:n},
      "✦ "+t.c.name+" tends their gear — "+n+" piece"+(n>1?"s":"")+" of rust cleared.");
  return n;
}

/* Combat-side damage-die step-down for a `rusted` weapon (spec §2: "weapon damage die steps down one
   size"). d4→d6→d8→d10→d12 is the SRD weapon-die ladder; a d12 has nowhere lower to step (floor at
   d12 — gentle, never worse than one whole size, matching "never worse than rusted"). Called from
   engine.combat's cmEquippedDamage (this file loads AFTER engine.combat in loadOrder, so combat.js
   calls this function name at call-time — the same late-binding convention walk.js uses for
   dwalkBudget/dwalkAssignLoot from engine.dungeon-walk). Pure: takes/returns a die size number. */
const RUST_DIE_STEPDOWN = { 4:4, 6:4, 8:6, 10:8, 12:10 };
function rustSteppedDie(die){ return RUST_DIE_STEPDOWN[die] != null ? RUST_DIE_STEPDOWN[die] : die; }

/* ============================================================
   §3. CHRONICLE ⇐ LEDGER
   ============================================================ */

/* Render ONE ledger entry as its Chronicle prose line. Every entry already carries e.text (addLedger's
   signature bakes it in) — this formatter is mostly passthrough + a per-type style wrapper, matching
   the spec's "mostly passthrough + styling" framing. Returns an HTML string (the ledger already embeds
   <strong>/<em> markup at the call sites, same as the old logEvent lines did).
   NOTE (reconciled against merged reality): the "existing Chronicle UI" the spec says to keep rendering
   with is world.render's renderLedger (src/world/render.js) — it ALREADY renders straight off the
   ledger (`e.text||JSON.stringify(e.data)`, newest-first, sliced 20), not off w.log; there is no
   separate w.log-reading view to retarget. renderLedger is L2 and this module is L4 (docs/SCALING.md
   layers) — routing it through chronicleLine would be a fresh layer inversion for a cosmetic-only
   factor-out, so renderLedger's inline equivalent is left as-is (zero behavior change, G0 minimal
   diffs) and chronicleLine ships here as the reusable formatter for this unit's own call sites /
   future consumers (e.g. an eventual full-Chronicle export) — logged as an uncertainty. */
const CHRONICLE_TYPE_CLASS = {
  canon:"chron-canon", transition:"chron-transition", spatial:"chron-spatial", clock:"chron-clock",
  drift:"chron-drift", "npc-life":"chron-npc-life", outcome:"chron-outcome", session:"chron-session"
};
function chronicleLine(entry){
  if(!entry) return "";
  const cls = CHRONICLE_TYPE_CLASS[entry.type] || "chron-outcome";
  const text = entry.text || (entry.data ? JSON.stringify(entry.data) : "");
  return `<div class="chron-line ${cls}">${text}</div>`;
}

/* One-time, idempotent migration: legacy w.log prose lines that have NO ledger twin (a pre-DURABILITY-
   TRIO save whose logEvent lines outran their paired addLedger — or a genuinely orphaned log-only
   line) are imported as session-type ledger entries, stamped so a second call is a no-op (mutation
   check: run twice, confirm no duplicates). Runs from migrateWorld (idempotent by construction — the
   `_chronicleMigrated` flag mirrors the codebase's existing simple-truthy-flag migration convention,
   e.g. U.plane). After this runs once, w.log is left in place (untouched) but nothing reads it anymore
   (logEvent is a no-op shim below) — old saves keep their raw log as an inert relic, never deleted. */
function chronicleMigrateLegacyLog(w){
  if(!w || w._chronicleMigrated) return 0;
  const log = Array.isArray(w.log) ? w.log : [];
  const ledgerTexts = new Set((w.ledger||[]).map(e=>e && e.text));
  let n = 0;
  log.slice().reverse().forEach(line=>{           // oldest-first, matching ledger's push-append order
    if(!line || !line.text) return;
    if(ledgerTexts.has(line.text)) return;         // already has a ledger twin — skip (dedupe the common case)
    addLedger(w,"session",{kind:"legacy-log-import"}, line.text);
    ledgerTexts.add(line.text);
    n++;
  });
  w._chronicleMigrated = true;
  return n;
}

/* logEvent itself (spec §3: "new events write NO world.log lines") is now a one-line no-op shim
   defined in src/world/state.js — where it's manifest-owned, check-manifest.py enforces single-
   definition per symbol, so it can't also be declared here. Its 16 existing call sites across
   world.play/creator.sheet/creator.levelup/world.fate/world.rebirth/engine.world-gen are ALMOST ALL
   paired with an equivalent addLedger call immediately before/after it — EXCEPT world.play's session
   tarot-draw line (beginSession), which has no addLedger twin (an intentional player-facing feed line,
   not persisted to history; see world/state.js's logEvent comment for the full note). So no-op'ing it
   drops nothing the Chronicle UI shows (renderLedger already reads w.ledger, never w.log; w.log was
   write-only dead weight even before this unit) — it just means that one omen line was already, and
   remains, invisible in the Chronicle. See world/state.js's logEvent definition for the one-line change. */
