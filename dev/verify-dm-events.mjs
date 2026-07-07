/* Verify the EVENT-CONTRACT runtime AND the DM-feed render — in one full-app jsdom load.
   Spec: docs/DM-BRIDGE.md §"Build order" step 5 + docs/EVENT-CONTRACT.md.

   Loads EVERY module in manifest load order into one jsdom global scope — concatenated as a single
   <script> so classic-script top-level const/function share scope (the "const-via-eval" gotcha:
   cross-<script> const sharing is what bites; one eval avoids it). Then:
     1. feeds the fixture responses' events[] to applyEvent and asserts the world mutated correctly
        (ledger appended, faction/front clocks advanced by exactly delta, discovery minted a node,
        adjudication written as canon, unknown types no-op), and dmDigest() reflects post-event state;
     2. renders renderDMFeed(w) + renderWorld() and asserts the "The DM" chat panel wires up.

   Run:  node dev/verify-dm-events.mjs
   (jsdom is installed per-environment in a scratch dir — see CLAUDE.md "headless test".
    Override the dir with JSDOM_HOME=/path/to/dir containing node_modules/jsdom.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const fix  = (n) => JSON.parse(read(join("dev/fixtures", n)));

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

// every module, in real load order
const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
// the inline globals that live in genesis.html itself (functions reach them only at call-time)
// STAGES/WORLDBEATS/GUIDE/LIFE_STEP are real module consts now (data/creation-flow.js) — don't restub.
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`, { runScripts: "dangerously" });
const win = dom.window;
win.eval(harness + "\n" + src);

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// all DM-bridge globals present after a real load
const need = ["applyEvent","dmDigest","sendTurn","pollResponse","applyResponse","dmSend","dmRollFor",
              "findClockTarget","renderDMFeed","escHtml","dmLogOf","pushDmLog"];
check("all DM-bridge globals present after full load", need.every((n) => typeof win[n] === "function"),
      need.filter((n) => typeof win[n] !== "function").join(", "));

// --- the Saltmarsh Shrine world the fixtures share ---
const world = {
  id: "w-saltmarsh", name: "The Mere of Saltmarsh",
  seed: {
    master: { name: "Saltmarsh Shrine", desc: "A collapsed nave half-swallowed by the marsh." },
    smell: { name: "brine" }, sound: { name: "dripping water" }, arch: { name: "salt-bleached stone" },
    taboo: { name: "Naming the drowned", desc: "the dead are never named" },
    myth:  { name: "The Tide that Remembers", desc: "the marsh keeps a ledger of every debt" },
  },
  characters: [{ status: "living", name: "Brunn Graniteback", headline: "a dwarf cleric", spark: "a dwarf cleric", pronouns: "he",
    sheet: { species: "Dwarf", class: "Cleric", background: "Acolyte", level: 3, hp: "19/24", ac: 15,
             profBonus: 2, scores: {}, mods: { wis: 3 }, saveProfs: ["wis","cha"],
             skillProfs: ["Investigation","Insight","Religion","Medicine"], feat: "Magic Initiate (Cleric)" } }],
  gazetteer: [], log: [], ledger: [], clock: { day: 2, min: 434 }, session: 3,
  map: { nodes: {}, edges: [] }, currentNodeId: null,
  factions: [{ name: "Tide-Wardens", dominant: true, agenda: "recover the stolen tide-ledger",
               method: "ritual law", tags: ["zealous"], clock: { filled: 3, size: 6 } }],
  pressures: [{ kind: "external", danger: "The marsh rises a hand each night", impersonal: "tidal",
                clock: { filled: 2, size: 4 }, real: { text: "the ledger is a lock holding the tide back" },
                doom: "the shrine floods and the ledger is lost for good" }],
  revealed: { powers: 1, map: 1, ledger: 1, gaz: 1 }, dmlog: [],
};
const originId = win.addNode(world, "Saltmarsh Shrine", "Setting");
world.currentNodeId = originId;
win.U.worlds[world.id] = world;
win.U.activeWorldId = world.id;
win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null };

const ledgerLen = () => win.ledgerOf(world).length;
const facClock  = () => world.factions[0].clock.filled;
const frtClock  = () => world.pressures[0].clock.filled;

// === 1. EVENT RUNTIME ===
{ const before = ledgerLen(), fc = facClock();
  fix("social.response.json").events.forEach((e) => win.applyEvent(world, e));
  // +3 = the original 2 + the detected-XP line fact_canonized now writes (ADVANCEMENT.md)
  check("social: 3 ledger entries appended (incl. detected XP)", ledgerLen() === before + 3, `+${ledgerLen()-before}`);
  check("social: Tide-Wardens clock 3→4", facClock() === fc + 1, `now ${facClock()}`);
  const canon = win.ledgerOf(world).filter((x) => x.type === "canon" && x.data.factId === "ledger-was-taken");
  check("social: fact_canonized wrote a canon ledger entry", canon.length === 1);
  check("social: fact_canonized accrued XP", win.ledgerOf(world).some((x) => x.data && x.data.kind === "xp")); }

{ const fr = frtClock();
  fix("travel.response.json").events.forEach((e) => win.applyEvent(world, e));
  const node = win.mapOf(world).nodes[win.slug("Eel-Fishers' Stilt-Village")];
  check("travel: discovery minted a map node", !!node && node.name === "Eel-Fishers' Stilt-Village");
  check("travel: marsh-rises front clock advanced by 1", frtClock() === fr + 1, `now ${frtClock()}`); }

{ const before = ledgerLen();
  fix("combat-resolve.response.json").events.forEach((e) => win.applyEvent(world, e));
  // +5 = encounter line + detected-XP line (objective-tied, ADVANCEMENT.md) + kill line + the new DETECTED
  // faction-escalation clock advance (COMBAT.md / DIFFICULTY.md: kill{factionId} → clock_advanced) + adjudication
  check("combat: 5 ledger entries appended (incl. detected XP + escalation)", ledgerLen() === before + 5, `+${ledgerLen()-before}`);
  const adj = win.ledgerOf(world).filter((x) => x.data && x.data.kind === "adjudication");
  check("combat: adjudication written as canon precedent",
        adj.length === 1 && adj[0].type === "canon" && adj[0].data.precedentId === "civilian-death-saltmarsh");
  const kill = win.ledgerOf(world).filter((x) => x.data && x.data.kind === "kill");
  check("combat: kill recorded with victimClass", kill.length === 1 && kill[0].data.victimClass === "civilian");
  // the kill{factionId:"eel-fishers"} fires a detected clock_advanced; eel-fishers isn't a tracked faction
  // in this world, so it lands as an untracked escalation line (the wire still fires — DIFFICULTY.md).
  const esc = win.ledgerOf(world).filter((x) => x.type === "clock" && x.data && x.data.clockId === "eel-fishers");
  check("combat: kill{factionId} fires faction-escalation clock_advanced", esc.length === 1 && esc[0].data.untracked === true); }

{ const sh = world.characters[0].sheet;
  sh.inventory = [{ id: "fix-1", name: "Mace", conditions: [] }, { id: "fix-2", name: "Shield", conditions: [] },
                  { id: "fix-3", name: "Holy Symbol", conditions: [] }]; sh.gold = 13;
  const before = ledgerLen();
  const r1 = win.applyEvent(world, { type: "item_changed", payload: { removeAll: true, gold: -13, note: "confiscated" }, source: "declared" });
  check("item_changed removeAll strips inventory + zeroes gold", r1.ok && sh.inventory.length === 0 && sh.gold === 0, JSON.stringify(sh));
  check("item_changed removeAll reports every removed item", r1.removed.length === 3, JSON.stringify(r1.removed));
  check("item_changed logs an outcome ledger line", ledgerLen() === before + 1);
  const r2 = win.applyEvent(world, { type: "item_changed", payload: { add: [{ name: "Mace" }, { name: "Shield" }] } });
  check("item_changed add mints real instances (id+name+conditions)", r2.ok && sh.inventory.length === 2
    && sh.inventory.every(it => it.id && it.conditions) && sh.inventory.some(it => it.name === "Mace"), JSON.stringify(sh.inventory));
  const maceId = sh.inventory.find(it => it.name === "Mace").id;
  const r3 = win.applyEvent(world, { type: "item_changed", payload: { removeIds: [maceId] } });   // id-targeted, not name-matched
  check("item_changed removeIds targets one instance precisely", r3.ok && sh.inventory.length === 1 && sh.inventory[0].name === "Shield", JSON.stringify(sh.inventory));
  const r4 = win.applyEvent(world, { type: "item_changed", payload: { gold: -999 } });
  check("item_changed gold delta clamps at 0, never negative", r4.ok && sh.gold === 0, sh.gold); }

{ const before = ledgerLen();
  const r = win.applyEvent(world, { type: "totally_made_up", payload: {}, source: "declared" });
  check("unknown event type is a safe no-op", r.ok === false && ledgerLen() === before); }

{ const d = win.dmDigest();
  check("dmDigest: location is current node", d.location === "Saltmarsh Shrine", d.location);
  check("dmDigest: Tide-Wardens clock now 4/6", d.powers[0].clock === "4/6", d.powers[0].clock);
  check("dmDigest: front carries the dmOnly truth", !!d.fronts[0].dmOnly.truth);
  check("dmDigest: pc present with class+level", d.pc && d.pc.class === "Cleric" && d.pc.level === 3); }

// === 2. DM-FEED RENDER ===
{ win.pushDmLog(world, "player", "I search the shrine.", { rolls: [{ label: "Investigation", total: 19 }] });
  win.pushDmLog(world, "dm", "The nave still smells of brine and old incense.", { events: [{ type: "fact_canonized" }] });
  win.GS.dm.rollReq = { skill: "Stealth", ability: "dex", dcHidden: true };
  const feed = win.renderDMFeed(world);
  check("render: 'The DM' header", /The DM/.test(feed));
  check("render: player turn shown", /I search the shrine/.test(feed));
  check("render: DM narration shown", /smells of brine/.test(feed));
  check("render: event chip shown", /fact canonized/.test(feed));   // eventChip() humanizes the type (_ → space) into a readable chip
  // the contextual roll prompt (mockup "THE DM CALLS FOR A ROLL"): names the check in the prose and
  // wires the ROLL button to dmRollFor (the button label is just "ROLL" now, skill lives in the prompt).
  check("render: roll-handshake prompt names the check + ROLL button wires dmRollFor",
    /Stealth/.test(feed) && /dmRollFor/.test(feed) && /roll-btn/.test(feed));
  check("render: action box present", /id="dmAction"/.test(feed));
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;
  check("render: renderWorld embeds the DM section", /The DM/.test(html) && /dmAction/.test(html)); }

// === 3. CODEX PANEL RENDER (Phase 6) ===
{ const cw = { id:"cxw", name:"CodexUI", gazetteer:[], factions:[], ledger:[], clock:{day:1,min:360} };
  win.codexAdd(cw, { kind:"npc", name:"Sabarra", fields:{role:"a nervous shrine-clerk"}, dm:{secret:"hides the key"}, provenance:"rolled" });
  win.codexAdd(cw, { kind:"location", name:"Saltmarsh Shrine", fields:{desc:"a brine-soaked nave"}, provenance:"rolled" });
  win.codexAdd(cw, { kind:"npc", name:"Quill (unmet)", fields:{role:"a hidden watcher"}, provenance:"rolled" }); // stays unknown
  win.codexReveal(cw,"npc:sabarra"); win.codexReveal(cw,"location:saltmarsh-shrine");
  win.codexLink(cw,"npc:sabarra","located-in","location:saltmarsh-shrine");
  win.codexUpdate(cw,"npc:sabarra",{status:{at:"location:saltmarsh-shrine"}});
  const panel = win.codexPanel(cw);
  check("codexPanel: shows a known record", /Sabarra/.test(panel));
  check("codexPanel: shows known field", /nervous shrine-clerk/.test(panel));
  check("codexPanel: groups by kind", /People/.test(panel) && /Places/.test(panel));
  check("codexPanel: link rendered as clickable cross-ref", /codexJump\('location:saltmarsh-shrine'\)/.test(panel) && /located in/.test(panel));
  check("codexPanel: knowledge-gated — unknown record hidden", !/Quill/.test(panel));
  check("codexPanel: dm-only secret never leaks to player view", !/hides the key/.test(panel));
  check("codexPanel: empty world → gentle empty state", /No one and nowhere known yet/.test(win.codexPanel({id:"e",codex:{records:{}}}))); }

// === 4. THEATER-NEXT §1 — terrain_change (DE block, 13 checks) ===
// DE-1: pre-combat (no GS.combat.active) → ok:false "no-combat", ledger UNMOVED.
{ win.GS.combat = null;
  const before = ledgerLen();
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "flood", zone: "near:C" }, source: "declared" });
  check("DE-1. terrain_change pre-combat → ok:false 'no-combat', ledger unmoved",
    r.ok === false && r.reason === "no-combat" && ledgerLen() === before, JSON.stringify(r)); }

// Start a real fight (real combat_start applyEvent path) so GS.combat/scene/grid are the genuine shape.
// (not itself one of the 13 counted DE checks — pure fixture setup, asserted implicitly by every
// check below succeeding against a live GS.combat.)
win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name: "Marsh Ghoul", cr: 1 }], scene: { cover: {}, hazards: [], exits: [], zoneCover: { "near:C": "half" } } }, source: "declared" });

// DE-2: unknown op → ok:false "unknown-op", ledger unmoved (RED on un-fixed code per the spec).
{ const before = ledgerLen();
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "melt", zone: "near:C" }, source: "declared" });
  check("DE-2. op:'melt' → ok:false 'unknown-op', ledger unmoved", r.ok === false && r.reason === "unknown-op" && ledgerLen() === before, JSON.stringify(r)); }

// DE-3: zone absent from the live grid.
{ const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "flood", zone: "out:Q" }, source: "declared" });
  check("DE-3. zone:'out:Q' → ok:false 'bad-zone'", r.ok === false && r.reason === "bad-zone", JSON.stringify(r)); }

// DE-4: flood → hazardZones grows by one, entry deep-equals the shape.
{ const before = (win.GS.combat.scene.hazardZones || []).length;
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "flood", zone: "near:C", note: "the cistern wall lets go" }, source: "declared" });
  const hz = win.GS.combat.scene.hazardZones;
  check("DE-4. flood: hazardZones.length 0→1, entry deep-equals {zone,kind,revealed:true}",
    r.ok && hz.length === before + 1 && hz[hz.length-1].zone === "near:C" && hz[hz.length-1].kind === "the cistern wall lets go" && hz[hz.length-1].revealed === true,
    JSON.stringify(hz)); }

// DE-5: flood ledger +1, new line's text contains the note verbatim.
{ const before = ledgerLen();
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "flood", zone: "far:R", note: "a burst pipe floods the far wall" }, source: "declared" });
  const entries = win.ledgerOf(world);
  const last = entries[entries.length - 1];
  check("DE-5. flood ledger: +1 entry, text contains the note verbatim",
    r.ok && ledgerLen() === before + 1 && last.text.indexOf("a burst pipe floods the far wall") >= 0, JSON.stringify(last)); }

// DE-6: raise → elevZones.length 0→1, member equals the zone.
{ const before = (win.GS.combat.scene.elevZones || []).length;
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "raise", zone: "melee:L" }, source: "declared" });
  check("DE-6. raise: elevZones.length 0→1, member equals the zone",
    r.ok && win.GS.combat.scene.elevZones.length === before + 1 && win.GS.combat.scene.elevZones.indexOf("melee:L") >= 0,
    JSON.stringify(win.GS.combat.scene.elevZones)); }

// DE-7: raise restamps — move the PC onto the raised zone, then trigger a restamp with another raise
// elsewhere is not how it works: the spec's restamp happens AT raise time. So: raise a zone the PC
// already occupies (move PC there first) and confirm .elev flips false→true on THAT raise call.
{ win.GS.combat.pc.band = "melee"; win.GS.combat.pc.lane = "R";
  win.GS.combat.pc.elev = false; // reset explicitly to prove the mutation moves it
  const before = win.GS.combat.pc.elev;
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "raise", zone: "melee:R" }, source: "declared" });
  check("DE-7. raise restamps: PC standing at the raised zone has .elev moved false→true",
    r.ok && before === false && win.GS.combat.pc.elev === true, `before=${before} after=${win.GS.combat.pc.elev}`); }

// DE-8: raise again same zone → ok:false "already-elevated", elevZones.length unchanged.
{ const before = win.GS.combat.scene.elevZones.length;
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "raise", zone: "melee:R" }, source: "declared" });
  check("DE-8. raise again same zone → ok:false 'already-elevated', elevZones.length unchanged",
    r.ok === false && r.reason === "already-elevated" && win.GS.combat.scene.elevZones.length === before, JSON.stringify(r)); }

// DE-9: break → scene.zoneCover["near:C"] moved "half"→undefined AND mods[0].op==="break".
{ const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "break", zone: "near:C" }, source: "declared" });
  check("DE-9. break: zoneCover['near:C'] moved 'half'→undefined AND a mods entry op==='break' exists",
    r.ok && win.GS.combat.scene.zoneCover["near:C"] === undefined && win.GS.combat.scene.mods.some(m=>m.op==="break" && m.zone==="near:C"),
    JSON.stringify(win.GS.combat.scene.zoneCover) + " / " + JSON.stringify(win.GS.combat.scene.mods)); }

// DE-10: collapse on an elevated zone (melee:R, raised above) → elevZones 1→0, mods sunk===false, PC.elev true→false.
{ const before = win.GS.combat.scene.elevZones.length;
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "collapse", zone: "melee:R" }, source: "declared" });
  const modsEntry = win.GS.combat.scene.mods.filter(m=>m.op==="collapse" && m.zone==="melee:R").slice(-1)[0];
  check("DE-10. collapse on elevated zone: elevZones 1→0, mods sunk===false, PC.elev true→false",
    r.ok && win.GS.combat.scene.elevZones.length === before - 1 && modsEntry && modsEntry.sunk === false && win.GS.combat.pc.elev === false,
    `elevZones=${JSON.stringify(win.GS.combat.scene.elevZones)} mods=${JSON.stringify(modsEntry)} pcElev=${win.GS.combat.pc.elev}`); }

// DE-11: hole then burn same zone → first ok:true (hazard entry present), second ok:false "zone-holed",
// mods.length still 1 hole-entry deep for that zone.
{ const holeZone = "far:L";
  const r1 = win.applyEvent(world, { type: "terrain_change", payload: { op: "hole", zone: holeZone }, source: "declared" });
  const hzEntry = win.GS.combat.scene.hazardZones.find(hz=>hz.zone===holeZone);
  const r2 = win.applyEvent(world, { type: "terrain_change", payload: { op: "burn", zone: holeZone }, source: "declared" });
  const holeMods = win.GS.combat.scene.mods.filter(m=>m.op==="hole" && m.zone===holeZone);
  check("DE-11. hole then burn same zone: first ok:true (hazard present), second ok:false 'zone-holed', exactly 1 hole-entry",
    r1.ok && !!hzEntry && r2.ok === false && r2.reason === "zone-holed" && holeMods.length === 1,
    JSON.stringify({r1, hzEntry, r2, holeModsLen: holeMods.length})); }

// DE-12: cap — prefill 24 mods → 25th returns ok:false "mods-cap", mods.length stays 24.
{ win.GS.combat.scene.mods = []; // reset for a clean cap test
  for(let i = 0; i < 24; i++){ win.GS.combat.scene.mods.push({op:"burn", zone:"out:C", note:"filler", round:1}); }
  const r = win.applyEvent(world, { type: "terrain_change", payload: { op: "burn", zone: "out:C", note: "one too many" }, source: "declared" });
  check("DE-12. cap: 25th mod → ok:false 'mods-cap', mods.length stays 24",
    r.ok === false && r.reason === "mods-cap" && win.GS.combat.scene.mods.length === 24, `len=${win.GS.combat.scene.mods.length}`); }

// DE-13: digest — a fresh fight, flood + raise → combatDigest(w).scene.terrain deep-equals
// ["flood@near:C","raise@far:L"] (order = append order).
{ win.GS.combat = null;
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name: "Bog Rat", cr: 0 }], scene: { cover: {}, hazards: [], exits: [] } }, source: "declared" });
  win.applyEvent(world, { type: "terrain_change", payload: { op: "flood", zone: "near:C" }, source: "declared" });
  win.applyEvent(world, { type: "terrain_change", payload: { op: "raise", zone: "far:L" }, source: "declared" });
  const d = win.combatDigest(world);
  check("DE-13. digest: after flood + raise, scene.terrain deep-equals ['flood@near:C','raise@far:L'] (append order)",
    JSON.stringify(d.scene.terrain) === JSON.stringify(["flood@near:C","raise@far:L"]), JSON.stringify(d.scene.terrain));
  win.GS.combat = null; }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
