/* Verify the Consequence-Ladder resolver (docs/CONSEQUENCE-LADDER.md) — full-app jsdom load + compiled tables.js.
   Asserts: the legs ladder (dead-end/hook/thread-seed/canon-shift → store/sink/thread/clock); the band↔legs
   DECOUPLING (a thread-seed opens a clock at ANY band; band only sets intensity); rollTable exposes the new
   legs/pool fields; the Art Depiction tags carried through compile; clResolveEffect reads the Watcher pool
   (Hungering-Stone columns) for the player's open roll incl. the dead-end floor; unbuilt pools degrade to null;
   and clBindFirst scores reincorporation (bind-first) vs. roll-on-miss.

   Run:  node dev/verify-consequence.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── globals present ───────────────────────────────────────────────────────────
for (const f of ["consequenceFor","clResolveEffect","clParsePoolRow","clBindFirst","clOnMissPlan"])
  check(`global ${f}`, typeof win[f] === "function");
// CL_LEGS/CL_POOLS are top-level `const` — lexically reachable by the resolver fns (proven by every check
// below), but not a window property under jsdom eval (the const-via-eval gotcha). Assert the pool REGISTRY
// behaviorally: Watcher is built (hasPool), Passage is registered-but-unbuilt (no pool yet).
check("CL_POOLS registry gates Watcher(built) vs Passage(unbuilt)",
  win.consequenceFor({pool:"Watcher"}).hasPool===true && win.consequenceFor({pool:"Passage"}).hasPool===false);

// ── the legs ladder (§3) ────────────────────────────────────────────────────────
const dead = win.consequenceFor({ legs:"dead-end", band:"Grounded" });
check("dead-end: not stored, no sink, no thread", dead.store===false && dead.sink===null && dead.opensThread===false);
const hook = win.consequenceFor({ legs:"hook", band:"Textured" });
check("hook: stored handle, no thread", hook.store===true && hook.sink==="handle" && hook.opensThread===false && hook.clock===false);
const seed = win.consequenceFor({ legs:"thread-seed", band:"Strange" });
check("thread-seed: stored, opens a thread + clock", seed.store===true && seed.sink==="thread" && seed.opensThread===true && seed.clock===true);
const canon = win.consequenceFor({ legs:"canon-shift", band:"Mythic" });
check("canon-shift: canon sink, opens thread", canon.sink==="canon" && canon.opensThread===true);
check("unknown legs → dead-end (graceful)", win.consequenceFor({legs:"???"}).sink===null);

// ── the band↔legs DECOUPLING (§4): a thread-seed clocks at ANY band; band only sets intensity ──────
const sStrange = win.consequenceFor({ legs:"thread-seed", band:"Strange" });
const sVolatile = win.consequenceFor({ legs:"thread-seed", band:"Volatile" });
check("clock exists for a Strange-band thread-seed (NOT gated on Volatile band)", sStrange.clock===true && sStrange.opensThread===true);
check("band only changes INTENSITY, not clock-existence", sStrange.clock===sVolatile.clock && sVolatile.intensity > sStrange.intensity);
check("intensity ladder: Grounded<Strange<Mythic", win.consequenceFor({legs:"hook",band:"Grounded"}).intensity===0 && sStrange.intensity===2 && canon.intensity===4);

// ── rollTable exposes the new tags; the Art Depiction tags compiled through ──────────────────────
const ad = win.GENESIS_TABLES["art-depiction"];
const rowFor = (n) => ad.rows.find((r) => n>=r[0] && n<=r[1]);
check("art-depiction row 89 = thread-seed / Watcher (Listening Portrait)", rowFor(89)[6]==="thread-seed" && rowFor(89)[7]==="Watcher");
check("art-depiction row 1 = dead-end (Grounded)", rowFor(1)[6]==="dead-end");
check("art-depiction row 100 = canon-shift / Identity", rowFor(100)[6]==="canon-shift" && rowFor(100)[7]==="Identity");
const rt = win.rollTable("art-depiction");
check("rollTable exposes .legs/.pool", typeof rt.legs==="string" && typeof rt.pool==="string");
check("rollTable on an untagged table → legs/pool empty", (()=>{const u=win.rollTable("urban-pressure"); return u.legs==="" && u.pool==="";})());
// the descriptor straight off a real rolled row
const liveDesc = win.consequenceFor({ legs:rowFor(89)[6], band:rowFor(89)[2], pool:rowFor(89)[7] });
check("real row → descriptor has a pool + opens a thread", liveDesc.hasPool===true && liveDesc.opensThread===true);

// ── the Watcher effect pool (§8, Hungering-Stone columns) — the PLAYER's open roll ─────────────────
const e1 = win.clResolveEffect("Watcher", 1);
check("Watcher d8=1 → the dead-end floor ('Just Craft')", e1 && /just craft/i.test(e1.nature) && e1.use==="None.");
const e6 = win.clResolveEffect("Watcher", 6);
check("Watcher d8=6 → Fear-Eater, all 4 columns parsed", e6 && /fear-eater/i.test(e6.nature) && e6.use && e6.tell && e6.escalation);
check("Watcher d8=8 → Collector (the ceiling)", /collector/i.test(win.clResolveEffect("Watcher",8).nature));
check("effect carries the table id + roll", e6.table==="watcher-effect-pool" && e6.roll===6);
check("unbuilt pool degrades to null (DM/on-the-fly)", win.clResolveEffect("Passage", 4)===null && win.clResolveEffect("Omen",1)===null);
check("clParsePoolRow maps 4 cols", (()=>{const p=win.clParsePoolRow(["N","U","T","E"]); return p.nature==="N"&&p.use==="U"&&p.tell==="T"&&p.escalation==="E";})());
// captured bespoke die (prep-time / on-the-fly generated, stored on the codex) — structured object rows
const bespoke = { dice:"d6", pool:"Watcher", rows:[
  {lo:1,hi:3,nature:"A drowned saint's gaze",use:"pray → +1 vs fear",tell:"brine on the frame",escalation:"none"},
  {lo:4,hi:6,nature:"The chapel's drowned god stirs",use:"speak its name → it answers once",tell:"the water rises",escalation:"thread-seed clock"} ]};
check("clResolveStoredEffect: a captured die beats the pool, roll=5 → the high face", (()=>{const r=win.clResolveStoredEffect(bespoke,5); return r && /drowned god/.test(r.nature) && r.source==="captured" && r.escalation==="thread-seed clock";})());
check("clResolveStoredEffect: null/empty die → null", win.clResolveStoredEffect(null,3)===null && win.clResolveStoredEffect({rows:[]},3)===null);

// ── bind-first → roll-on-miss (§4/§7) ─────────────────────────────────────────────────────────────
check("no candidates → null (roll-on-miss)", win.clBindFirst([], {pool:"Watcher"})===null);
check("no relevant candidate → null", win.clBindFirst([{id:"x",tags:["harvest"]}], {pool:"Watcher",tags:["spy"]})===null);
const cand = win.clBindFirst(
  [{id:"front-a",tags:["smuggling"]},{id:"front-b",tags:["watcher"],active:true}], {pool:"Watcher",tags:["dock"]});
check("relevant candidate bound (reincorporation)", cand && cand.id==="front-b");
check("clOnMissPlan names a generator + capture provenance", (()=>{const p=win.clOnMissPlan("Watcher"); return p.generator==="rollQuestHook" && /rolled-at-resolution/.test(p.provenance);})());

// ── the art hook: rollPlace({art:true}) attaches player-facing art + DM-only handles (§11) ──────────
let sawArt=false, sawHandle=false, handlesWellFormed=true;
for (let i=0;i<300 && (!sawArt || !sawHandle);i++){
  const p = win.rollPlace({ art:true });
  if (p.fields && Array.isArray(p.fields.art) && p.fields.art.length) sawArt=true;
  if (p.dm && Array.isArray(p.dm.artHandles) && p.dm.artHandles.length){
    sawHandle=true;
    for (const h of p.dm.artHandles){ if (!h.legs || h.legs==="dead-end" || !h.text) handlesWellFormed=false; }
  }
}
check("rollPlace({art:true}) attaches player-facing art", sawArt);
check("rollPlace art produces hook/thread-seed HANDLES (never dead-end)", sawHandle && handlesWellFormed);
check("rollPlace() WITHOUT art is unchanged (opt-in)", (()=>{const p=win.rollPlace(); return !p.fields.art && !(p.dm&&p.dm.artHandles);})());

// ── the effect-die capture loop (§8) — composes from EXISTING events, no new code ───────────────────
// prep sets the request flag → DM generates the bespoke die → codex_update stores it → clResolveStoredEffect reads it.
const wCap = {};
const rec = win.codexAdd(wCap, { id:"art-x", kind:"art", provenance:"prep",
  dm:{ legs:"thread-seed", pool:"Watcher", effectDie:null, needsEffectDie:true } });
check("effect-die: prep sets the generation REQUEST flag", rec.dm.needsEffectDie===true && rec.dm.effectDie===null);
win.applyEvent(wCap, { type:"codex_update", payload:{ id:"art-x",
  dm:{ effectDie:{ dice:"d4", pool:"Watcher", rows:[ {lo:1,hi:4,nature:"the drowned god stirs",use:"u",tell:"t",escalation:"thread-seed clock"} ] }, needsEffectDie:false } } });
const stored = win.codexGet(wCap,"art-x").dm.effectDie;
check("effect-die: DM captures the generated die via codex_update", !!stored && stored.rows.length===1 && win.codexGet(wCap,"art-x").dm.needsEffectDie===false);
check("effect-die: clResolveStoredEffect reads the captured die", win.clResolveStoredEffect(stored, 2).nature==="the drowned god stirs");

console.log(`\nverify-consequence: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
