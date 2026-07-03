/* Verify the CODEX (Phase 1) — full-app jsdom load (every module in manifest order, one eval).
   Asserts: record CRUD, typed links (both-way query), reveal/contact lifecycle, recontextualization
   (soft only; refuses on hard), the soft pool, sanitized player projection vs all-seeing DM digest,
   gazetteer/faction migration, and codex_* events through the real applyEvent runtime.

   Run:  node dev/verify-codex.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval("var U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// globals present
for (const f of ["codexAdd","codexLink","codexLinksOf","codexUpdate","codexReveal","codexContact",
                 "codexRecontextualize","codexSoftPool","codexDigest","codexPlayerView","ensureCodex","applyEvent"])
  check(`global ${f}`, typeof win[f] === "function");

const w = { id:"w1", name:"Test", gazetteer:[], factions:[], ledger:[], clock:{day:1,min:360} };

// add + get
const sab = win.codexAdd(w, { kind:"npc", name:"Sabarra", rolled:{fear:"the deep"}, fields:{role:"clerk"}, dm:{secret:"hid the key"}, provenance:"rolled" });
check("codexAdd mints an id from kind+name", sab.id === "npc:sabarra");
check("new rolled record is soft", sab.status.soft === true && sab.status.known === false);
check("codexGet returns it", win.codexGet(w,"npc:sabarra").name === "Sabarra");
win.codexAdd(w, { kind:"item", name:"The Key", source:{type:"plot",ref:"x"}, provenance:"rolled" });
win.codexAdd(w, { kind:"npc", name:"Quill", provenance:"rolled" });
win.codexAdd(w, { kind:"location", name:"Cinderyard", provenance:"rolled" });

// links + both-way query
win.codexLink(w, "npc:sabarra", "holds", "item:the-key");
win.codexLink(w, "npc:sabarra", "hunted-by", "npc:quill");
win.codexLink(w, "npc:sabarra", "works-at", "location:cinderyard");
check("link stored on source", win.codexGet(w,"npc:sabarra").links.length === 3);
const keyLinks = win.codexLinksOf(w, "item:the-key");
check("codexLinksOf reads inbound links (the-key is held)", keyLinks.some(l=>l.dir==="in" && l.rel==="holds" && l.from==="npc:sabarra"));

// merge / idempotent add
win.codexAdd(w, { kind:"npc", name:"Sabarra", fields:{demeanor:"wary"} });
check("re-add merges fields, doesn't duplicate", Object.keys(win.codexOf(w).records).length === 4 && win.codexGet(w,"npc:sabarra").fields.demeanor === "wary");

// recontextualize a SOFT entity
const r1 = win.codexRecontextualize(w, "npc:quill", { fields:{role:"toll-clerk"}, name:"Quentis", at:"location:cinderyard" });
check("recontextualize a soft entity succeeds", r1.ok === true);
check("recontextualize preserves the rolled soul, reassigns context", win.codexGet(w,"npc:quill").name === "Quentis" && win.codexGet(w,"npc:quill").provenance === "recontextualized");

// soft pool
check("soft pool lists untouched NPCs", win.codexSoftPool(w,"npc").length === 2);

// reveal + contact lifecycle
win.codexReveal(w, "npc:sabarra");
check("reveal flips known", win.codexGet(w,"npc:sabarra").status.known === true);
win.codexContact(w, "npc:sabarra");
check("contact locks soft→hard", win.codexGet(w,"npc:sabarra").status.soft === false);
const rLocked = win.codexRecontextualize(w, "npc:sabarra", { name:"Nope" });
check("recontextualize REFUSES on a hard/contacted record (canon is sacred)", rLocked.ok === false && rLocked.reason === "locked");
check("...and the locked record is untouched", win.codexGet(w,"npc:sabarra").name === "Sabarra");

// player projection vs DM digest
const pv = win.codexPlayerView(w);
const pvSab = pv.find(r=>r.id==="npc:sabarra");
check("playerView shows only KNOWN records", pv.length === 1 && !!pvSab);
check("playerView strips DM-only fields", pvSab && pvSab.dm === undefined && pvSab.fields.role === "clerk");
check("playerView prunes links to UNKNOWN entities (no leak)", pvSab && pvSab.links.length === 0);
const dg = win.codexDigest(w);
check("DM digest is all-seeing (all 4 records, with dm fields)", dg.length === 4 && dg.find(r=>r.id==="npc:sabarra").dm.secret === "hid the key");

// migration from gazetteer/factions
const w2 = { id:"w2", name:"Mig", ledger:[], clock:{day:1,min:360},
  factions:[{name:"Charcoal Syndicate", dominant:true, agenda:"a", method:"b", known:true}],
  gazetteer:[{type:"Setting", name:"The Canal-Knot", desc:"x", known:true},
             {type:"Place", name:"Far Vale", desc:"y"}, {type:"Myth", name:"Old Lie", desc:"z"}] };
win.ensureCodex(w2);
check("migration: faction → faction record", !!win.codexGet(w2,"faction:charcoal-syndicate"));
check("migration: Setting/Place → location records", !!win.codexGet(w2,"location:the-canal-knot") && !!win.codexGet(w2,"location:far-vale"));
check("migration: Myth (no codex kind) is skipped", !win.codexGet(w2,"location:old-lie"));
check("migration carries known flag", win.codexGet(w2,"location:the-canal-knot").status.known === true);
win.ensureCodex(w2);
check("migration is idempotent (no dupes on re-run)", Object.keys(win.codexOf(w2).records).length === 3);

// grounded migration: a world-gen PLACE that carried its dice forward (g.rolled) → mechanical, drift-proof
const w2b = { id:"w2b", name:"Ground", ledger:[], clock:{day:1,min:360}, factions:[],
  gazetteer:[{type:"Setting", name:"The Gravity-Well", desc:"a floating black stone", known:true,
               rolled:{table:"master", roll:73, idx:72, cat:"", desc:"a floating black stone"}},
             {type:"Place", name:"Legacy Vale", desc:"prose only"}] };  // no rolled → stays authored
win.ensureCodex(w2b);
const ground = win.codexGet(w2b,"location:the-gravity-well");
check("grounded migration: rolled place → provenance 'rolled'", ground.provenance === "rolled");
check("grounded migration: rolled payload pinned (drift-proof)", ground.rolled && ground.rolled.roll === 73);
check("grounded migration: counts as mechanical", win.codexIsMechanical(ground) === true);
check("grounded migration: rolled place is hard (world-gen canon, not soft prep)", ground.status.soft === false);
check("legacy prose place (no dice) stays authored", win.codexGet(w2b,"location:legacy-vale").provenance === "authored");

// provenance buckets are the SPEC definition (CODEX.md §7): rolled/recontextualized/prep = mechanical,
// everything else (authored, dm) = invented — measured by provenance, NOT by rolled-payload presence.
check("bucket: 'prep' provenance is mechanical", win.codexIsMechanical({provenance:"prep"}) === true);
check("bucket: 'recontextualized' is mechanical", win.codexIsMechanical({provenance:"recontextualized"}) === true);
check("bucket: 'authored' is invented", win.codexIsMechanical({provenance:"authored"}) === false);
check("bucket: a from-scratch 'dm' invention is invented even with a rolled payload",
  win.codexIsMechanical({provenance:"dm", rolled:{x:1}}) === false);
{ const rep = win.codexProvenanceReport(w2b);
  check("provenanceReport: report shape (total/mechanical/ratio/byProvenance)",
    rep.total === 2 && rep.mechanical === 1 && rep.mechanicalRatio === 0.5 && rep.byProvenance.rolled === 1); }

// codex_* events through applyEvent
const w3 = { id:"w3", name:"Ev", ledger:[], clock:{day:1,min:360}, gazetteer:[], factions:[], revealed:{} };
win.applyEvent(w3, { type:"codex_add", payload:{ kind:"npc", name:"Mire", provenance:"rolled" }, source:"declared" });
check("event codex_add mints a record", !!win.codexGet(w3,"npc:mire"));
win.applyEvent(w3, { type:"codex_add", payload:{ kind:"location", name:"Weeping Quarry" }, source:"declared" });
win.applyEvent(w3, { type:"codex_link", payload:{ from:"npc:mire", rel:"located-in", to:"location:weeping-quarry" }, source:"declared" });
check("event codex_link wires a relationship", win.codexGet(w3,"npc:mire").links.some(l=>l.rel==="located-in"));
win.applyEvent(w3, { type:"codex_update", payload:{ id:"npc:mire", status:{condition:"taken"} }, source:"declared" });
check("event codex_update revises status", win.codexGet(w3,"npc:mire").status.condition === "taken");
win.applyEvent(w3, { type:"codex_contact", payload:{ id:"npc:mire" }, source:"play" });
check("event codex_contact locks the record", win.codexGet(w3,"npc:mire").status.soft === false);
check("codex_contact wrote a canon ledger line", (w3.ledger||[]).some(e=>e.type==="canon" && /encountered; locked/.test(e.text)));

// soft-pool eviction cap (the code-review follow-up): bound the reusable soft pool, protecting the
// sacred (hard / known / linked / keepIds) and keeping the freshest by mint seq.
const w4 = { id:"w4", name:"Evict", ledger:[], clock:{day:1,min:360}, gazetteer:[], factions:[] };
for(let i=0;i<10;i++) win.codexAdd(w4,{ kind:"npc", name:"Soft "+i, provenance:"prep" });   // 10 soft
win.codexAdd(w4,{ kind:"npc", name:"Hardy", provenance:"prep", status:{soft:false} });        // hard — sacred
win.codexAdd(w4,{ kind:"npc", name:"Seen",  provenance:"prep", status:{known:true} });        // known — sacred
win.codexLink(w4,"npc:soft-0","ally-of","npc:hardy");                                          // soft-0 now linked — sacred
check("evict: no-op under the cap", win.codexEvictSoft(w4,{cap:50}) === 0);
const evBefore = Object.keys(win.codexOf(w4).records).length;
const evDropped = win.codexEvictSoft(w4,{cap:3, keepIds:["npc:soft-9"]});
check("evict: dropped the oldest untouched soft beyond the cap", evDropped === 5);   // 8 evictable (soft-1..8) − 3 cap
check("evict: hard record survives (touched = canon)", !!win.codexGet(w4,"npc:hardy"));
check("evict: known record survives", !!win.codexGet(w4,"npc:seen"));
check("evict: linked soft record survives (would orphan a relationship)", !!win.codexGet(w4,"npc:soft-0"));
check("evict: keepId survives", !!win.codexGet(w4,"npc:soft-9"));
check("evict: freshest soft kept over oldest (seq order)", !win.codexGet(w4,"npc:soft-1") && !!win.codexGet(w4,"npc:soft-8"));
check("evict: total shrank by the dropped count", Object.keys(win.codexOf(w4).records).length === evBefore - evDropped);

// MODEL-GRAMMAR G2 §4b — the shape canon-lock (codexResolveShapeOnMint, src/world/codex.js).
// Red-first: check "shape refused a second write" would go RED if the canon-lock guard in
// codexAdd's merge branch / codexUpdate were deleted (proven inline below via a live mutation,
// not just asserted in a comment — same discipline dev/verify-model-parts.mjs's mutation check
// uses for the anchor-completeness assertion).
const w5 = { id:"w5", name:"Shape", ledger:[], clock:{day:1,min:360}, gazetteer:[], factions:[] };
const mogwai = win.codexAdd(w5, { kind:"npc", name:"Glimmer", provenance:"rolled",
  shape: { base:"blob-mass", modules:[{part:"glow-halo",anchor:"head"}], channels:{glow:"radiant"} } });
check("codex_add resolves+canon-locks a valid shape hint onto the record",
  mogwai.shape && mogwai.shape.base === "blob-mass" && mogwai.shape.modules.length === 1,
  JSON.stringify(mogwai.shape));
check("a valid shape hint logs ZERO shape-gap ledger lines",
  !w5.ledger.some(e => e.data && e.data.kind === "shape-gap"));

const weird = win.codexAdd(w5, { kind:"npc", name:"Weird Thing", provenance:"rolled",
  shape: { base:"not-a-real-part", modules:[{part:"nope",anchor:"mainHand"}] } });
check("an unknown base drops to the archetypes-2 fallback (torso-biped)", weird.shape.base === "torso-biped");
check("an unknown module part is omitted, not substituted", weird.shape.modules.length === 0);
const gapLines = w5.ledger.filter(e => e.data && e.data.kind === "shape-gap");
check("2 shape-gap ledger lines written (1 base + 1 module)", gapLines.length === 2, gapLines.length);
check("shape-gap ledger lines are type:drift (the growth-signal convention)",
  gapLines.every(e => e.type === "drift"));

// canon-lock: a re-add with a DIFFERENT shape must NOT change the already-resolved shape.
const beforeShape = JSON.stringify(win.codexGet(w5, mogwai.id).shape);
win.codexAdd(w5, { id: mogwai.id, kind:"npc", name:"Glimmer", shape: { base:"torso-biped", modules:[] } });
const afterShape = JSON.stringify(win.codexGet(w5, mogwai.id).shape);
check("canon-lock: re-adding with a different shape does NOT overwrite the resolved shape",
  beforeShape === afterShape);

// canon-lock via codexUpdate too (the OTHER write path patch.shape can arrive through).
win.codexUpdate(w5, mogwai.id, { shape: { base:"torso-biped", modules:[] } });
check("canon-lock: codexUpdate also refuses to overwrite an already-resolved shape",
  JSON.stringify(win.codexGet(w5, mogwai.id).shape) === beforeShape);

// a record minted with NO shape hint at all never gets a `.shape` field (no false-positive lock).
const noShape = win.codexAdd(w5, { kind:"npc", name:"Plain NPC", provenance:"rolled" });
check("a record with no shape hint mints with no .shape field", noShape.shape === undefined);
// ...but CAN receive one later via codexUpdate (shape arriving after mint, e.g. first real
// description) — proves the lock is "once resolved," not "forever if absent at mint."
win.codexUpdate(w5, noShape.id, { shape: { base:"torso-quad", modules:[] } });
check("codexUpdate CAN set a shape on a record that had none yet",
  win.codexGet(w5, noShape.id).shape && win.codexGet(w5, noShape.id).shape.base === "torso-quad");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
