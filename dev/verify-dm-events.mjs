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
  check("render: event chip shown", /fact_canonized/.test(feed));
  check("render: roll-handshake button wires dmRollFor", /Roll Stealth/.test(feed) && /dmRollFor/.test(feed));
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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
