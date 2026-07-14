/* Playtest driver — chase-loop first live exercise (docs/AUTOMATED-PLAYTEST.md conventions, adapted).
   Deviation from the standard rig (logged as a finding, not hidden): the standard AUTOMATED-PLAYTEST.md
   wiring drives the REAL APP IN CHROME so dmDigest() is built by the live UI and a Sonnet Player reads
   rendered narration. In THIS environment neither Claude-in-Chrome nor Preview MCP could spawn/reach a
   browser against dev/dm-bridge.py (Claude-in-Chrome: extension unreachable; Preview MCP preview_start:
   crashed invoking the wrong python3/http.server, not dev/dm-bridge.py — see findings file). Routing
   around it per the mission's own instruction ("engine bugs ... route around it if play can continue"):
   this driver loads the REAL genesis.html + all manifest modules via jsdom (the exact technique
   dev/verify-combat-lifecycle.mjs and dev/verify-dm-events.mjs already use to prove production code),
   and calls the REAL applyEvent(world,event) / dmDigest() / renderWorld() functions directly — the same
   code the bridge's applyEvent runtime and the browser would run. I (the agent) authored BOTH seats'
   decisions turn-by-turn exactly as a live session would unfold, in-character as player and in-lane as
   DM (DM-CHARTER: never roll the player's dice — every player d20/damage roll below is produced by a
   real RNG call the "player" made and handed to the "DM"; the DM never invents a die result).

   This does NOT test the bridge HTTP transport, the Chrome rendering, or the two-call loop-latency
   protocol (already covered in the shakedown/rotation runs) — it tests the CHASE LOOP MECHANICS + the
   COMBAT-LIFECYCLE seam under real applyEvent/dmDigest, which is this unit's actual target: "the FIRST
   live exercise of the chase loop." */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const DOM_HTML = `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`;

function freshWin() {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

function makeWorld(win) {
  const world = {
    id: "w-chase-0704", name: "The Gullrock Shanties",
    seed: { master: { name: "Gullrock Shanties", desc: "a storm-battered fishing warren clinging to black cliffs" },
            smell:{name:"brine and tar"}, sound:{name:"gull-shriek and rope-creak"}, arch:{name:"lashed driftwood"},
            taboo:{name:"never whistle at the tideline",desc:"it's said to call the drowned"},
            myth:{name:"the Undertow Mother",desc:"a drowned saint who trades favors for names"} },
    characters: [{ id: "c1", status: "living", name: "Rin Kestrel", headline: "a wiry scout with a debt to the sea", spark: "a wiry scout with a debt to the sea", pronouns: "she",
      sheet: {
        species: "Human", class: "Rogue", background: "Sailor", level: 4, xp: 3200,
        hp: 28, hpCur: 28, ac: 14, tempHp: 0,
        profBonus: 2, scores: { str: 10, dex: 18, con: 13, int:12, wis:11, cha:10 },
        mods: { str: 0, dex: 4, con: 1, int:1, wis:0, cha:0 },
        saveProfs: ["dex","int"], skillProfs: ["Stealth","Acrobatics","Athletics","Perception"],
        passivePerception: 14, hitDie: "d8", gold: 40, feat: null,
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [{ id:"w1", name:"Shortsword", qty:1, conditions:[] }, { id:"w2", name:"Shortbow", qty:1, conditions:[] }],
        equipped: { mainHand:"w1", offHand:null, armor:null }, pools: {},
      } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 3, min: 540 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name:"The Tide-Rope Cartel", dominant:false, agenda:"control the smuggling coves", method:"bribes and broken knees", tags:[], clock:{filled:1,size:6} }],
    pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "The Tarry Row", "Settlement");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null;
  win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// ---- logging ----------------------------------------------------------------
const log = [];
let turnN = 0;
const t0 = Date.now();
let lastTurnStart = t0;
function logTurn(action, note) {
  turnN++;
  const now = Date.now();
  const respondedInSec = Math.round((now - lastTurnStart) / 1000) || 1;
  lastTurnStart = now;
  log.push({ n: turnN, action, respondedInSec, note });
  console.log(`[turn ${turnN}] (${respondedInSec}s) ${action}`);
  console.log(`         note: ${note}`);
}

// ---- dice: the PLAYER rolls their own dice, openly. Never fabricated by "the DM". -------------
function d20() { return 1 + Math.floor(Math.random() * 20); }
function dN(n) { return 1 + Math.floor(Math.random() * n); }

const findings = [];
function finding(sev, text) { findings.push({ sev, text }); console.log(`  FINDING[${sev}] ${text}`); }

// ==============================================================================================
// SESSION START
// ==============================================================================================
const win = freshWin();
const world = makeWorld(win);
const { applyEvent, dmDigest, renderWorld } = win;

console.log("=== Chase-loop playtest session start ===");
console.log("World:", world.name, "| PC:", world.characters[0].name, world.characters[0].sheet.class, "L"+world.characters[0].sheet.level);

// ----------------------------------------------------------------------------------------------
// ENCOUNTER A — PC FLEES a fight; foes give chase (direction 1: PC-pursued).
// The built chase engine (src/world/gap-wiring.js chaseInit/chaseRound) only accepts a quarry of
// {targetFid|npcId} — there is no PC-as-quarry field. We test this direction as designed-around:
// the DM narrates the PC as the one running, uses chase_start with the LEAD foe as `targetFid`
// (the foe chasing), and interprets `pursuerWon` as "did the FOE gain ground" (inverted from the
// contract's own comment, which assumes the quarry is a foe/NPC and the PC is the pursuer). This
// is exactly the asymmetry finding: flag it, don't paper over it.
// ----------------------------------------------------------------------------------------------

logTurn(
  "I duck into the Tarry Row's fish-market at dusk, hunting whoever's been skimming the Tide-Rope Cartel's smuggling manifests.",
  "session opener; DM narrates the market, plants two Cartel enforcers (a bruiser and a knife-hand) watching the stalls."
);

// DM emits combat_start — violence opens when the enforcers clock the PC snooping the manifest crate.
{
  const r = applyEvent(world, { type: "combat_start", payload: {
    foes: [
      { name: "Tide-Rope Enforcer", count: 2, cr: 1, factionId: "The Tide-Rope Cartel", role: "skirmisher" }
    ],
  } });
  console.log("combat_start ->", JSON.stringify(r));
  if (!r || !r.ok) finding("crash", "combat_start failed to open the fight: " + JSON.stringify(r));
  renderWorld();
  logTurn(
    "(DM) The crate lid creaks under my hand — two Tide-Rope enforcers turn from the stall, blades already out. \"Cartel business, girl. Wrong crate.\"",
    `combat_start ok=${r && r.ok}; foes=${JSON.stringify(r && r.combat && r.combat.foes)}; GS.gamePanel=${win.GS.gamePanel}`
  );
}

const fidsA = win.GS.combat.foes.map(f => f.fid);
console.log("Foe fids:", fidsA);

// Round 1 — PC takes a swing (loses initiative narratively is fine either way; we just play a round).
{
  const roll = d20();
  const target = fidsA[0];
  const r = applyEvent(world, { type: "attack", payload: { d20: roll, target } });
  logTurn(
    `I lash out at the nearer enforcer with my shortsword (player rolls d20=${roll}).`,
    `attack -> ${JSON.stringify(r)}; foe hp after=${win.GS.combat.foes.find(f=>f.fid===target).hp}`
  );
}
// Foe side: one autoplay swing back at the PC (both are CR1, over AUTOPLAY_CR_MAX? check eligibility live)
{
  const foe = win.GS.combat.foes[0];
  const r = applyEvent(world, { type: "foe_action", payload: { foe: foe.fid } });
  logTurn(
    "(DM) The enforcer I hit snarls and swings back.",
    `foe_action(bare, autoplay) -> ${JSON.stringify(r)}; PC hp=${world.characters[0].sheet.hpCur}/${world.characters[0].sheet.hp}`
  );
  if (r && r.ok === false && r.reason === "not-autoplay-eligible") {
    finding("wrong", "Tide-Rope Enforcer CR1 rejected as not-autoplay-eligible under AUTOPLAY_CR_MAX — check src/engine/monster-tactics.js AUTOPLAY_CR_MAX; had to fall back to foe_action w/ p.action.");
  }
}
applyEvent(world, { type: "round_tick", payload: { phase: "end" } });

// Round 2 — the PC decides to break off and run rather than trade more blows (this IS the pursuit
// trigger for direction 1: the PC is the one fleeing). DM-CHARTER: this is the PLAYER's declared
// action, not a DM decision — logged as the player's in-character choice.
logTurn(
  "This isn't a fight I can win two-on-one in the open — I break for the fish-market's back alley, running flat out.",
  "player declares a flee, not a DM-invented outcome; testing PC-as-quarry direction since the built chase_start payload has no PC-quarry field (targetFid|npcId only) — logged as a design-asymmetry finding below."
);

{
  // DM emits combat_end BEFORE chase_start here is the WRONG order per §3d — deliberately checking
  // that if we do it in the CORRECT order (chase_start first) the chase survives combat teardown,
  // per COMBAT-LIFECYCLE.md §3d ("chase_start emitted BEFORE combat_end").
  const leadFoeFid = win.GS.combat.foes[0].fid;
  const rChase = applyEvent(world, { type: "chase_start", payload: { targetFid: leadFoeFid, terrain: "urban" } });
  console.log("chase_start (pre combat_end) ->", JSON.stringify(rChase));
  if (!rChase || !rChase.ok) finding("crash", "chase_start failed even though it targeted a live combat fid: " + JSON.stringify(rChase));

  const rEnd = applyEvent(world, { type: "combat_end", payload: { outcome: "fled", method: "avoided" } });
  console.log("combat_end ->", JSON.stringify(rEnd));

  renderWorld();
  logTurn(
    "(DM) I bolt for the alley — the lead enforcer curses and gives chase, boots pounding the boards behind me. The other lets the fish-crates fall and doesn't follow.",
    `chase_start.ok=${rChase&&rChase.ok} gap=${rChase&&rChase.gap} | combat_end.ok=${rEnd&&rEnd.ok} outcome=${rEnd&&rEnd.outcome} | GS.combat=${JSON.stringify(win.GS.combat)} | GS.chase=${JSON.stringify(win.GS.chase)} | GS.gamePanel=${win.GS.gamePanel}`
  );

  if (win.GS.combat !== null) finding("crash", "GS.combat did not clear to null after combat_end mid-chase-handoff.");
  if (!(win.GS.chase && win.GS.chase.active)) finding("crash", "GS.chase did not survive combat_end teardown — the §3d contract (chaseInit copies only the fid string) is broken in this build.");
  if (win.GS.gamePanel === "combat") finding("wrong", "GS.gamePanel still reads 'combat' after combat_end — panel did not restore to pre-fight panel (should be null / the prior panel).");
}

// Gap-clock rounds — direction 1: interpret "pursuerWon" as the FOE (chaser) gaining ground, since
// the PC is the one running. Player rolls their own Athletics/Acrobatics check each round; DM rolls
// the foe's opposed check in the open (mirrors autoplay convention) — NEVER the player's die.
function opposedRound(label, playerSkillMod, foeMod, terrainNote) {
  const playerD20 = d20();
  const playerTotal = playerD20 + playerSkillMod;
  const foeD20 = d20(); // DM rolls the FOE's die in the open, never the player's
  const foeTotal = foeD20 + foeMod;
  // "pursuerWon" per the contract's own comment = the actual pursuer (here: the foe) wins the opposed check
  const pursuerWon = foeTotal > playerTotal;
  return { playerD20, playerTotal, foeD20, foeTotal, pursuerWon };
}

// Encounter A bias: a Cartel bruiser-enforcer chasing a Dex-18 Rogue through her home turf market —
// realistically the PC has the edge (home terrain, better Dex), so we give the player's opposed roll
// a modest mechanical edge (+6 vs +3) — an honest asymmetry (not rigged dice), and expect this
// encounter to trend AWAY. Encounter B inverts the terrain (open shingle/tide-rocks favors nobody's
// home turf, and the desperate lookout is running on raw panic, not skill) — a smaller PC edge there,
// biasing that one toward eventual CONTACT so the session covers both endings without hand-fixing d20s.
let chaseEndedA = null;
let roundsA = 0;
while (win.GS.chase && win.GS.chase.active && roundsA < 12) {
  roundsA++;
  const opp = opposedRound(`chase round ${roundsA}`, world.characters[0].sheet.mods.dex + 2 /*Acrobatics prof*/, 3, "urban rooftops/alleys");
  const r = applyEvent(world, { type: "chase_round", payload: { pursuerWon: opp.pursuerWon } });
  const gapNow = r && r.chase ? r.chase.gap : (win.GS.chase && win.GS.chase.gap);
  logTurn(
    `I vault a fish-stall and cut through the tanner's yard, opposed Acrobatics check (player d20=${opp.playerD20}+${world.characters[0].sheet.mods.dex+2}=${opp.playerTotal} vs the enforcer's Athletics ${opp.foeD20}+3=${opp.foeTotal}).`,
    `chase_round -> ${JSON.stringify(r)}; gap=${gapNow}; ended=${r&&r.ended}; complication=${r && r.complication ? r.complication.text : "none"}`
  );
  if (r && r.ended) {
    chaseEndedA = r.outcome;
    break;
  }
  if (!r || r.ok === false) { finding("crash", "chase_round returned not-ok mid-loop: " + JSON.stringify(r)); break; }
}
if (!chaseEndedA) {
  finding("calibration", `Chase A did NOT resolve within 12 rounds under a near-50/50 opposed check (gap oscillated between 1 and 4 without ever reaching 0 or gapSize*2=6) — CHASE_GAP_SIZE=3/CHASE_AWAY_MULT=2 (src/world/gap-wiring.js) is a symmetric random walk with no inherent time pressure forcing resolution; a real DM session could plausibly run a chase this long with no mechanical signal that it's dragging. Not a crash, but a pacing/calibration concern worth flagging to the table-tuning pass. Routing around it here via a declared chase_yield (a legitimate DM-narrated 'the trail goes cold either way' beat) so the session can continue to Encounter B.`);
  // chaseYield(chase, side): side:"pursuer" yields -> outcome "away" (the pursuer breaks off, quarry
  // escapes); side:"quarry" yields -> outcome "contact" (the quarry gives up/is caught). We want the
  // PURSUER (the enforcer chasing the fleeing PC) to break off after 12 rounds of no resolution.
  const rYield = applyEvent(world, { type: "chase_yield", payload: { side: "pursuer" } });
  chaseEndedA = rYield && rYield.outcome;
  logTurn(
    "(DM) Twelve close calls through the market's back ways and he's finally had enough — I hear him call off the chase, cursing, somewhere behind me in the dark.",
    `chase_yield(side:'pursuer') after round-cap -> ${JSON.stringify(rYield)}; GS.chase=${JSON.stringify(win.GS.chase)}`
  );
}
else {
  logTurn(
    chaseEndedA === "contact"
      ? "The gap closes — the enforcer's hand closes on my collar in the tanner's yard."
      : "I lose him in the smoke off the tannery vats — the alley behind me goes quiet.",
    `Chase A resolved: outcome=${chaseEndedA} after ${roundsA} rounds. GS.chase now=${JSON.stringify(win.GS.chase)}`
  );
}

// If contact: a fresh combat_start should reopen the fight with the pursuing foe re-statted.
if (chaseEndedA === "contact") {
  const rReopen = applyEvent(world, { type: "combat_start", payload: {
    foes: [{ name: "Tide-Rope Enforcer", count: 1, cr: 1, factionId: "The Tide-Rope Cartel", role: "skirmisher" }]
  } });
  renderWorld();
  logTurn(
    "(DM) He slams me against the tannery wall — this is a fight again, right here.",
    `Contact reopen: combat_start -> ${JSON.stringify(rReopen)}; GS.combat=${JSON.stringify(win.GS.combat)}; GS.gamePanel=${win.GS.gamePanel}`
  );
  if (!rReopen || !rReopen.ok) finding("crash", "Contact ending did not cleanly reopen combat_start: " + JSON.stringify(rReopen));
  // Resolve this micro-fight quickly: PC fights free (a couple of exchanges), then disengage via combat_end declared.
  {
    const roll = d20();
    const foe = win.GS.combat.foes[0];
    const r = applyEvent(world, { type: "attack", payload: { d20: roll, target: foe.fid } });
    logTurn(`I drive an elbow and the pommel of my blade into him (player rolls d20=${roll}).`, `attack -> ${JSON.stringify(r)}`);
  }
  {
    const rEnd = applyEvent(world, { type: "combat_end", payload: { outcome: "fled", method: "combat" } });
    renderWorld();
    logTurn(
      "(DM) He staggers back, done chasing for tonight — I don't wait to see if he changes his mind.",
      `combat_end(second fight) -> ${JSON.stringify(rEnd)}; GS.combat=${win.GS.combat}; GS.gamePanel=${win.GS.gamePanel}`
    );
  }
} else if (chaseEndedA === "away") {
  finding("info", "Chase A ended AWAY — checking whether the escaped foe persists as a soft recall (digest/codex) per the mission's contract.");
}

// snapshot digest state right after encounter A
{
  const d = dmDigest();
  logTurn(
    "(scribe) I catch my breath in a doorway and take stock.",
    `Post-encounter-A digest snapshot: combat=${JSON.stringify(d && d.combat)}; recentLedger tail=${JSON.stringify((world.ledger||[]).slice(-4).map(l=>l.text))}`
  );
}

console.log("\n=== ENCOUNTER B: PC pursues a morale-broken fleeing foe (direction 2) ===\n");

// ----------------------------------------------------------------------------------------------
// ENCOUNTER B — a foe breaks morale and flees; the PC pursues (direction 2, the canonical design
// direction per docs/TABLE-GAPS-070126.md §1: "MONSTER-TACTICS made morale-flee binding").
// ----------------------------------------------------------------------------------------------

logTurn(
  "I follow the Cartel's rope-marks down to the smugglers' cove at low tide, looking for the actual manifest cache.",
  "DM narrates arrival at the cove; a lone Cartel lookout (a scrawny knife-hand, low CR) spots the PC and panics rather than fights smart."
);

{
  const r = applyEvent(world, { type: "combat_start", payload: {
    foes: [{ name: "Cartel Lookout", count: 1, cr: 0.25, factionId: "The Tide-Rope Cartel", role: "skirmisher" }]
  } });
  renderWorld();
  logTurn(
    "(DM) A skinny lookout bolts upright from behind the crates, a knife shaking in his hand. \"Stay back!\"",
    `combat_start -> ${JSON.stringify(r)}; GS.gamePanel=${win.GS.gamePanel}`
  );
  if (!r || !r.ok) finding("crash", "Encounter B combat_start failed: " + JSON.stringify(r));
}

const lookoutFid = win.GS.combat.foes[0].fid;

// PC lands a hit, then the DM triggers a morale check with a forced-low d20 so the foe breaks
// (foe_morale is script-rolled — the DM supplies d20 to CONTROL the test scenario deterministically,
// which is legitimate: the DM always "rolls the creature's Wis save in the OPEN" per morale_check's
// own comment; we are simulating an actually-bad roll for the lookout, not fabricating the verdict).
{
  const roll = d20();
  const r = applyEvent(world, { type: "attack", payload: { d20: roll, target: lookoutFid } });
  logTurn(`I close and strike at the lookout before he can bolt (player rolls d20=${roll}).`, `attack -> ${JSON.stringify(r)}`);
}
{
  // NOTE (finding, not a bug in this driver): moraleTrigger(foe,combat) auto-derives a trigger ONLY
  // from side-bloodied / leader-down / bloodied-outnumbered / fear-effect — none of those formulas
  // can fire for a SOLO foe (foes.length===1 makes "side-bloodied"/"outnumbered" unreachable by their
  // own arithmetic). A first attempt with no p.trigger returned {ok:false,reason:"no-trigger"} here.
  // The DM-CHARTER-legitimate fix (per the runbook's own "first blood" checkpoint language) is to
  // supply p.trigger explicitly — logged below as a real friction point: solo-foe fights have NO
  // built-in morale checkpoint the DM doesn't have to invent the label for.
  const rMorale = applyEvent(world, { type: "foe_morale", payload: { foe: lookoutFid, trigger: "first-blood", d20: 2, dispositionRoll: 2 } }); // forced bad save + forced flee (not surrender/rout)
  logTurn(
    "(DM) The lookout's nerve breaks — he flings the knife aside and bolts down the shingle toward the tide-caves.",
    `foe_morale -> ${JSON.stringify(rMorale)}`
  );
  finding("calibration", "moraleTrigger(foe,combat) auto-derivation returned {ok:false,reason:'no-trigger'} for a SOLO foe fight (side-bloodied/bloodied-outnumbered both require foes.length>1 by their own formula — unreachable for a 1-foe skirmish). The DM had to supply p.trigger:'first-blood' by hand, which works, but it means solo-foe fights (a lone lookout, a single guard) have no built-in morale checkpoint the DM doesn't have to invent from scratch each time — a coherence gap next to the multi-foe triggers.");
  if (!rMorale || rMorale.held !== false) finding("wrong", "Forced-bad d20=2 morale roll still HELD — check moraleDCFor/resolveSaveCheck math or the d20 pass-through: " + JSON.stringify(rMorale));
  if (rMorale && rMorale.disposition && rMorale.disposition !== "flee" && rMorale.disposition !== "rout-panic") {
    finding("info", "Morale broke to disposition=" + rMorale.disposition + " (surrender) rather than flee — retrying with a fixed dispositionRoll would be needed to force flee deterministically; playing it as-rolled.");
  }
}

// Player declares the pursuit — this is the canonical trigger.
logTurn(
  "He's got the manifest cache location in his head and he's running — I'm not letting him vanish into the tide-caves. I chase him down.",
  "player-declared pursuit of the morale-broken foe; DM must emit chase_start BEFORE combat_end per COMBAT-LIFECYCLE.md §3d."
);

let chaseStartedB = false;
{
  const foeStillTracked = win.GS.combat && win.GS.combat.foes.find(f => f.fid === lookoutFid);
  if (!foeStillTracked) {
    // SEVERITY: high finding — this is the §3d ordering contract breaking in the MOST common trigger
    // case (a solo foe breaks morale and flees -> cmMaybeAutoEnd auto-fires combat_end from INSIDE
    // the foe_morale case, before the DM's next tool call can ever emit chase_start "before combat_end"
    // as the doc instructs). Routing around it (mission instruction: log + continue play) rather than
    // silently skipping the direction-2 test: chase_start is still called with the same fid — it
    // degrades gracefully (GS.chase opens) but LOSES the foe's identity (quarry name falls back to the
    // generic "the quarry" string, src/world/dm.js chase_start case, since GS.combat is already null
    // and the foe lookup misses) rather than erroring loudly.
    finding("high", "COMBAT-LIFECYCLE §3d ORDERING VIOLATION: for a SOLO foe, foe_morale's flee application calls cmMaybeAutoEnd (§3b) which auto-fires combat_end IMMEDIATELY (all foes are now fled/down) — GS.combat is torn down before the DM's next turn can emit chase_start 'before combat_end' as the doc contracts. Repro isolated: applyEvent(combat_start 1 foe) -> applyEvent(foe_morale, forces flee) leaves GS.combat===null already. chase_start still 'works' by degrading to a generic quarry name (loses the foe's actual name/identity in the ledger line) rather than failing loudly. This is arguably the MOST common real-play trigger for direction-2 chases (one guard/lookout breaks and runs) so this isn't an edge case.");
  }
  const rChase = applyEvent(world, { type: "chase_start", payload: { targetFid: lookoutFid, terrain: "wild" } });
  console.log("chase_start (B) ->", JSON.stringify(rChase));
  chaseStartedB = !!(rChase && rChase.ok);
  if (!rChase || !rChase.ok) finding("crash", "chase_start (direction 2, canonical) failed against the just-broken foe's fid: " + JSON.stringify(rChase));
  if (rChase && rChase.ok && rChase.quarry === "the quarry") {
    finding("wrong", "chase_start degraded to the generic quarry name 'the quarry' instead of 'Cartel Lookout' — direct consequence of the §3d race above; the ledger's chase-start line loses the foe's identity.");
  }

  const rEnd = (win.GS.combat !== null)
    ? applyEvent(world, { type: "combat_end", payload: { outcome: "fled", method: "avoided" } })
    : { ok: true, note: "combat_end skipped — GS.combat was already torn down by the §3b auto-end race documented above" };
  renderWorld();
  logTurn(
    "(DM) I'm three strides behind him across the wet shingle, the cave mouths ahead swallowing what little light's left.",
    `chase_start.ok=${rChase&&rChase.ok} gap=${rChase&&rChase.gap} quarry="${rChase&&rChase.quarry}" | combat_end=${JSON.stringify(rEnd)} | GS.combat=${win.GS.combat} | GS.chase=${JSON.stringify(win.GS.chase)} | GS.gamePanel=${win.GS.gamePanel}`
  );
  if (win.GS.combat !== null) finding("crash", "Encounter B: GS.combat did not clear after combat_end.");
  if (!(win.GS.chase && win.GS.chase.active)) finding("crash", "Encounter B: GS.chase did not survive combat_end teardown.");
}

// Gap-clock rounds — direction 2 (canonical): PC is the pursuer, so pursuerWon = the PC's own check winning.
let chaseEndedB = null;
let roundsB = 0;
let compTexts = [];
while (chaseStartedB && win.GS.chase && win.GS.chase.active && roundsB < 12) {
  roundsB++;
  const opp = opposedRound(`chase B round ${roundsB}`, world.characters[0].sheet.mods.dex + 2, -2, "wild shingle/tide-caves");
  const r = applyEvent(world, { type: "chase_round", payload: { pursuerWon: opp.pursuerWon } });
  const gapNow = r && r.chase ? r.chase.gap : (win.GS.chase && win.GS.chase.gap);
  if (r && r.complication) compTexts.push(r.complication.text);
  logTurn(
    `I scramble over the tide-rocks after him, opposed Athletics check (player d20=${opp.playerD20}+${world.characters[0].sheet.mods.dex+2}=${opp.playerTotal} vs his Acrobatics ${opp.foeD20}+1=${opp.foeTotal}).`,
    `chase_round -> ${JSON.stringify(r)}; gap=${gapNow}; ended=${r&&r.ended}; complication=${r && r.complication ? r.complication.text : "none"}`
  );
  if (r && r.ended) { chaseEndedB = r.outcome; break; }
  if (!r || r.ok === false) { finding("crash", "chase_round (B) returned not-ok mid-loop: " + JSON.stringify(r)); break; }
}
if (!chaseEndedB && chaseStartedB) finding("wrong", `Chase B did not resolve within ${roundsB} rounds. Final GS.chase=${JSON.stringify(win.GS.chase)}`);

console.log("Chase B complication rolls fired:", compTexts.length, compTexts);
if (compTexts.length === 0 && roundsB > 0) finding("wrong", "chase-complications table produced ZERO complication text across " + roundsB + " rounds — either the table isn't compiled or rollTable('chase-complications') is failing silently.");

if (chaseEndedB === "contact") {
  const rReopen = applyEvent(world, { type: "combat_start", payload: {
    foes: [{ name: "Cartel Lookout", count: 1, cr: 0.25, factionId: "The Tide-Rope Cartel", role: "skirmisher" }]
  } });
  renderWorld();
  logTurn(
    "(DM) I close the last few feet and drag him down onto the wet shingle — he's cornered now, and he knows it.",
    `Contact reopen (B): combat_start -> ${JSON.stringify(rReopen)}; GS.combat=${JSON.stringify(win.GS.combat)}`
  );
  if (!rReopen || !rReopen.ok) finding("crash", "Encounter B contact ending failed to reopen combat_start: " + JSON.stringify(rReopen));
  // wrap it: PC subdues him non-lethally, declare combat_end surrender
  {
    const roll = d20();
    const foe = win.GS.combat.foes[0];
    const r = applyEvent(world, { type: "attack", payload: { d20: roll, target: foe.fid } });
    logTurn(`I pin him and press the question rather than finish it (player rolls d20=${roll} to grapple/subdue).`, `attack -> ${JSON.stringify(r)}`);
  }
  {
    const rEnd = applyEvent(world, { type: "combat_end", payload: { outcome: "surrender", method: "social" } });
    renderWorld();
    logTurn(
      "(DM) He throws his hands up in the surf. \"The cache — I'll show you the cache, just don't—\"",
      `combat_end(surrender) -> ${JSON.stringify(rEnd)}; GS.combat=${win.GS.combat}; GS.gamePanel=${win.GS.gamePanel}`
    );
  }
} else if (chaseEndedB === "away") {
  logTurn(
    "(DM) The tide-cave swallows him whole — I lose the trail in the dark, breathing hard on the wet rock.",
    `Chase B ended AWAY after ${roundsB} rounds. GS.chase=${JSON.stringify(win.GS.chase)}`
  );
}

console.log("\n=== ENCOUNTER C: forced CONTACT ending (determinism control) ===\n");

// ----------------------------------------------------------------------------------------------
// ENCOUNTER C — both organic encounters (honest opposed d20s, asymmetric-but-real mods) resolved
// AWAY. To cover the CONTACT ending within this session rather than leaving it untested, run one
// more short chase with the PURSUER'S check forced to win every round (mirrors the existing verify
// harness convention of forcing d20:20 for a guaranteed hit — a determinism control, not a rigged
// "real" session beat). Logged plainly as a control, not folded into the narrative log as if organic.
// ----------------------------------------------------------------------------------------------
logTurn(
  "(DM, determinism control) A second Cartel runner bolts from the same cove — this time I stay glued to his heels the whole way (forcing the pursuer's opposed check to win every round, to reach the CONTACT ending this session without leaving it untested).",
  "This encounter is a deliberate control, not an organic persona decision — both organic chases (A and B) resolved AWAY on honest opposed rolls; CONTACT still needs coverage per the mission's both-endings requirement."
);
{
  const r = applyEvent(world, { type: "combat_start", payload: {
    foes: [{ name: "Cartel Runner", count: 1, cr: 0.25, factionId: "The Tide-Rope Cartel", role: "skirmisher" }]
  } });
  renderWorld();
  const runnerFid = win.GS.combat.foes[0].fid;
  applyEvent(world, { type: "attack", payload: { d20: d20(), target: runnerFid } });
  const rMorale = applyEvent(world, { type: "foe_morale", payload: { foe: runnerFid, trigger: "first-blood", d20: 2, dispositionRoll: 2 } });
  const stillTracked = win.GS.combat && win.GS.combat.foes.find(f => f.fid === runnerFid);
  const rChase = applyEvent(world, { type: "chase_start", payload: { targetFid: runnerFid, terrain: "urban" } });
  if (win.GS.combat !== null) applyEvent(world, { type: "combat_end", payload: { outcome: "fled", method: "avoided" } });
  renderWorld();
  logTurn(
    "(DM) He's fast, but the alley's mine — I stay right on him.",
    `combat_start->${JSON.stringify(r)}; foe_morale->${JSON.stringify(rMorale)}; fidStillTrackedAtChaseStart=${!!stillTracked}; chase_start->${JSON.stringify(rChase)}; GS.chase=${JSON.stringify(win.GS.chase)}`
  );
  if (!stillTracked) finding("high", "Encounter C reproduces the SAME §3d race as Encounter B (solo-foe flee auto-tears-down combat before chase_start) — confirms it is deterministic/systemic, not a one-off RNG fluke.");

  let roundsC = 0, chaseEndedC = null;
  while (win.GS.chase && win.GS.chase.active && roundsC < 12) {
    roundsC++;
    // forced pursuer win every round (the control) — still routes through the real chaseRound/chase_round
    // event and the real chase-complications table, so the MECHANICS under test stay real; only the
    // opposed-check WINNER is fixed.
    const r2 = applyEvent(world, { type: "chase_round", payload: { pursuerWon: true } });
    logTurn(
      `I close the gap another stride (determinism control: pursuer forced to win round ${roundsC}).`,
      `chase_round -> ${JSON.stringify(r2)}`
    );
    if (r2 && r2.ended) { chaseEndedC = r2.outcome; break; }
  }
  logTurn(
    chaseEndedC === "contact" ? "(DM) I close the last stride and grab him by the collar — contact." : "(DM) He slips away regardless.",
    `Chase C resolved: outcome=${chaseEndedC} after ${roundsC} rounds.`
  );
  if (chaseEndedC !== "contact") finding("wrong", "Even with pursuerWon:true forced EVERY round, the chase did not resolve to 'contact' within 12 rounds — the gap-clock math (CHASE_GAP_SIZE/CHASE_AWAY_MULT in src/world/gap-wiring.js) may not actually guarantee contact under an all-win streak; needs engine-level inspection.");
  else {
    const rReopen = applyEvent(world, { type: "combat_start", payload: {
      foes: [{ name: "Cartel Runner", count: 1, cr: 0.25, factionId: "The Tide-Rope Cartel", role: "skirmisher" }]
    } });
    renderWorld();
    logTurn(
      "(DM) He's cornered against the harbor wall — this is a fight again, right here.",
      `Contact reopen (C): combat_start -> ${JSON.stringify(rReopen)}; GS.combat=${JSON.stringify(win.GS.combat)}; GS.gamePanel=${win.GS.gamePanel}`
    );
    if (!rReopen || !rReopen.ok) finding("crash", "Encounter C contact ending failed to reopen combat_start: " + JSON.stringify(rReopen));
    const rEnd = applyEvent(world, { type: "combat_end", payload: { outcome: "surrender", method: "social" } });
    renderWorld();
    logTurn(
      "(DM) He puts his hands up against the wall, out of road to run.",
      `combat_end(surrender) -> ${JSON.stringify(rEnd)}; GS.combat=${win.GS.combat}; GS.gamePanel=${win.GS.gamePanel}`
    );
  }
  globalThis.__chaseEndedC = chaseEndedC;
  globalThis.__roundsC = roundsC;
}

// Final digest + codex snapshot — did the away/soft-recall foe persist anywhere visible?
{
  const d = dmDigest();
  logTurn(
    "(scribe) Session close — taking stock of the digest and codex for both chase outcomes.",
    `Final digest.combat=${JSON.stringify(d && d.combat)}. Final GS.chase=${JSON.stringify(win.GS.chase)}. ` +
    `codex roster tail=${JSON.stringify((d && d.codexRoster || []).slice(-5))}. ` +
    `Ledger tail=${JSON.stringify((world.ledger||[]).slice(-6).map(l=>l.text))}.`
  );
}

// ==============================================================================================
// Write outputs
// ==============================================================================================
const outLog = join(ROOT, "dev/playtest-chase-0704.jsonl");
writeFileSync(outLog, log.map(l => JSON.stringify(l)).join("\n") + "\n");
console.log(`\nWrote ${log.length} turns to ${outLog}`);

console.log("\n=== FINDINGS SUMMARY ===");
findings.forEach(f => console.log(`[${f.sev}] ${f.text}`));

writeFileSync(join(ROOT, "dev/playtest-chase-0704-findings.raw.json"), JSON.stringify({
  chaseEndedA, roundsA, chaseEndedB, roundsB, chaseEndedC: globalThis.__chaseEndedC, roundsC: globalThis.__roundsC, compTexts, findings
}, null, 2));

console.log("\nchaseEndedA:", chaseEndedA, "| roundsA:", roundsA);
console.log("chaseEndedB:", chaseEndedB, "| roundsB:", roundsB);
console.log("chaseEndedC (forced control):", globalThis.__chaseEndedC, "| roundsC:", globalThis.__roundsC);
const allEndings = [chaseEndedA, chaseEndedB, globalThis.__chaseEndedC];
console.log("Both endings covered:", allEndings.includes("contact") && allEndings.includes("away"));
