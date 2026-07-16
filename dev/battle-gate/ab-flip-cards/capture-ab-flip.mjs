#!/usr/bin/env node
/* dev/battle-gate/ab-flip-cards/capture-ab-flip.mjs — the CONTROLLED legacy-vs-faceted A/B comparison
   Adam actually asked for after rejecting the B3 flip pair ("the switch shot just shows the top of a
   hyena's head with a big wall in front of it"): "more a/b shots but with the exact same set ups and
   sprite switches." The controlled-variables law this script enforces mechanically, not just by
   convention: SAME scene, SAME camera, SAME light, UNOCCLUDED subjects — the ONLY thing that changes
   between the two panels in a pair is which sprite corpus resolves.

   Model: boot/server/Chrome/board-fixture machinery copied VERBATIM from
   dev/battle-gate/standee-gallery/capture-standee-gallery.mjs (that file's own header documents the
   renderWorld-poll-starvation gotcha this script also avoids: NEVER call renderWorld() after
   setInteriorBoard() while waiting for async sprite textures to resolve — it starves the "interior3d"
   replay condition; see mountBoard's own comment below for the reproduction).

   WHY THIS SCRIPT IS NOT capture-standee-gallery.mjs's own flip-pair cell (dev/battle-gate/
   standee-gallery/capture-standee-gallery.mjs's buildSinglePieceBoard/captureFlipPanel): that cell used
   a SINGLE-ROOM ("OSS Integrated", one tiny chamber) close-up rig with a bespoke fill-fraction camera
   formula (piece height * 0.5 / tan(fov/2) / 0.4) — fine for a single Giant Rat, but the rejected shot
   this unit is answering for was a DIFFERENT close-up rig entirely (not literally reproducible in this
   tree — grepped, no "hyena" anywhere in the repo) that Adam described as cropping to the top of the
   subject's head with a wall filling the foreground. This script sidesteps that whole class of failure
   by reusing the STANDEE GALLERY's own LINEUP framing instead: "The Hub" (n=6) topology gives a real
   room with real floor space, pieces stand in a single line with generous margin, and the camera is
   the product's own default establishing shot for that lineup (full bodies + headroom, standee
   eye-level-ish) — never a hand-tuned close-up formula.

   CONTROLLED-CAMERA MECHANISM (this is the part that's actually new): a lineup board is built ONCE per
   light profile. The CANDIDATE panel mounts first and the natural post-mount establishing camera pose
   is read back (position + full matrixWorld, via the SAME _graphicsResearchContextForTest seam
   capture-standee-gallery.mjs already uses for its projection math). That exact pose (position, plus a
   lookAt point re-derived from the captured matrixWorld's own forward vector) is then WRITTEN BACK via
   window.Theater._setInteriorCameraPoseForTest to BOTH panels — candidate AND legacy — before each
   shutter. This is deliberate, not paranoid: letting each panel's camera auto-fit independently would
   let the LEGACY panel's fewer resolved pieces (this cast includes two orphan fold-ins with no legacy
   asset at all — see ORPHAN FOLD-IN NOTE below) silently shift the auto-fit bounding box/pivot, which
   is exactly the kind of "different setup" confound Adam's rejection was actually about. Forcing the
   identical pos+lookAt write on both panels means the resulting camera matrixWorld is provably the
   product of the SAME floating-point computation both times — this script asserts that numerically
   (camera.position + camera.matrixWorld read back after each write, max per-element delta reported,
   expected 0 or sub-epsilon) rather than trusting it by construction.

   SPRITE-CORPUS SWITCH MECHANISM: NOT a FACETED_FLIP_ENABLED source-file mutation (that's
   dev/battle-gate/capture-s5-flip-card.mjs's approach — it requires a full page reload per panel,
   because FACETED_FLIP_ENABLED is a module-scope `const` read once at script-parse time). This script
   instead mutates each cast member's SPRITE_REGISTRY[slug].runtimeAdmitted field IN-PAGE (never
   touching disk — capture-standee-gallery.mjs's own setGiantRatRuntimeAdmitted, generalized here to
   the whole cast) between "candidate" and "legacy", exactly per this unit's own instruction: "or use
   the registry regenerated without --admit-faceted IN MEMORY — do not commit a legacy-admitted
   registry." Because spriteAssetPathFor's three-gate check (FACETED_FLIP_ENABLED && runtimeAdmitted
   === "candidate" && candidateAsset) only needs the SECOND gate flipped, this switch needs no page
   reload at all — both panels are captured from the SAME live page/board mount, which is what makes
   the "SAME scene" guarantee mechanical rather than aspirational (no fresh startBardo() RNG draw
   between panels, no independent buildScene() call, no risk of two different rooms).

   CAST (5 creatures, spanning Small/Medium/Large/Gargantuan + one PC, per this unit's spec) — every
   slug grepped against data/sprite-registry.js BEFORE being chosen (see the per-slug commentary):
     - spr-fantasy-giant-rat      "Giant Rat"       Small   — candidateAsset+legacyAsset BOTH present.
     - spr-fantasy-gnoll-warrior  "Gnoll Warrior"    Medium  — candidateAsset+legacyAsset BOTH present.
       (SUBSTITUTED for the spec's suggested spr-fantasy-hobgoblin-soldier: that slug's own registry
       entry has candidateAsset:null — not candidate-covered at all, would render IDENTICAL art in both
       panels and prove nothing. Gnoll Warrior is the same "Medium humanoid soldier" archetype and IS
       covered.)
     - spr-fantasy-owlbear        "Owlbear"          Large   — candidateAsset+legacyAsset BOTH present.
       (SUBSTITUTED for the spec's suggested spr-fantasy-ogre-zombie: same problem, candidateAsset:null
       on that entry. Owlbear is Large, both-corpora-covered, and an iconic enough silhouette that a
       real art-direction difference should read clearly.)
     - spr-fantasy-adult-gold-dragon "Adult Gold Dragon" Gargantuan (nominal; size field is actually
       null on this entry — see ORPHAN FOLD-IN NOTE) — kept EXACTLY as the spec named it, on purpose:
       this is one of the 21 S4 "orphan fold-in" fantasy entries (candidateAsset present, legacyAsset:
       null — grepped, confirmed, and cross-checked against the filesystem: assets/sprites/spr-fantasy-
       adult-gold-dragon.png genuinely does not exist, only assets/sprites-faceted/ does).
     - spr-pc-dwarf-fighter       "Dwarf Fighter"    PC (no size field) — the spec asked for "one PC";
       a REGISTRY-WIDE finding surfaced while picking one (see PC ORPHAN FINDING below) means every
       single pc-realm candidate is in the same orphan-fold-in boat, so no substitution would have
       avoided it — Dwarf Fighter was picked for a clean readable silhouette, nothing more.

   ORPHAN FOLD-IN NOTE (a real, useful finding, not a script bug): spr-fantasy-adult-gold-dragon has
   legacyAsset:null AND worldHeight:null/heightSource:"missing" AND no scaleTrue. Two consequences,
   both mechanically confirmed below rather than asserted from memory:
     (1) In the LEGACY panel, this piece's texture NEVER resolves (spriteTextureFor caches "failed"
         permanently for a missing file — this file's own header comment on that function documents
         the no-retry contract) — interiorBuildPieces silently skips a piece whose billboard build
         returns null, so the dragon is simply ABSENT from the legacy-panel lineup, not rendered as a
         broken texture or a placeholder. This script asserts textureState via
         window.Theater._spriteTextureCache/_spriteTextureSrcCache per cast member per panel rather
         than inferring absence from a timeout.
     (2) In BOTH panels, interiorSpriteBillboard's height formula (HUMAN_TRUE_HEIGHT * scaleTrue,
         falling back to scaleTrue=1.0 when the field is missing) means this "Gargantuan" dragon
         actually renders at ORDINARY HUMAN HEIGHT — not dwarfing anything. This is an honest registry
         sizing gap, surfaced here because the composite would otherwise silently mislead a viewer into
         thinking the dragon is small by ART DIRECTION rather than by MISSING SCALE DATA.

   PC ORPHAN FINDING (registry-wide, confirmed by a full-file scan, not a one-slug spot check): all 39
   realm:"pc" runtimeAdmitted:"candidate" entries have legacyAsset:null. The pc realm's legacy corpus
   uses a DIFFERENT, gendered naming convention (e.g. spr-pc-dragonborn-barbarian-male/-female) than the
   faceted corpus's genderless convention (spr-pc-dragonborn-barbarian) — they are not variants of the
   same registry key, they are entirely separate keys, so a runtimeAdmitted flip never joins them. No
   PC choice in this cast could have shown a real side-by-side; this is systemic, not a Dwarf-Fighter-
   specific gap. Worth Adam/orchestrator knowing independent of this gate.

   STAGE: "The Hub" (n=6) topology, ONE bare undressed room (spatializePlan output only — dressPlan()
   is never called, so plan.dressing is undefined and interiorBuildBoard's own dressing-by-room fold
   degrades to empty, meaning ZERO furniture/dressing pieces are ever added — verbatim the same
   no-dressing guarantee capture-standee-gallery.mjs's buildLineupBoard already relies on). Perimeter
   walls exist (the room shell is unavoidable — interiorBuildBoard always builds it), but the 5-piece
   lineup sits at the room's horizontal center with the SAME margin discipline as the standee gallery's
   own lineupPositions, and the camera is pulled back far enough by the natural establishing shot that
   no wall crosses in front of any standee (visually confirmed in this script's own header-comment
   sibling — the human read-back step — not just asserted).

   Run:  node dev/battle-gate/ab-flip-cards/capture-ab-flip.mjs
   Output: dev/battle-gate/ab-flip-cards/shots/<light>-<candidate|legacy>.png (raw per-panel captures)
           dev/battle-gate/ab-flip-cards/<light>-ab-composite.png (labeled side-by-side, per light)
           dev/battle-gate/ab-flip-cards/results.json (full mechanical record) */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const outDir = __dirname;
const shotsDir = path.join(outDir, "shots");
fs.mkdirSync(shotsDir, { recursive: true });

// a NEW port range — every existing battle-gate script already claims its own (README's own
// convention: each capture script gets a fresh 5-slot range so parallel runs never collide).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5241, 5242, 5243, 5244, 5245];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[ab-flip-cards]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}
async function probeRoot(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" });
    if (!r.ok) return false;
    const body = await r.text();
    return body.includes("var U=loadU();") || body.includes("Genesis");
  } catch (e) { return false; }
}
async function startServer() {
  for (const port of PORT_CANDIDATES) {
    if (await portInUse(port)) {
      if (await probeRoot(port)) { log(`port ${port} already serving THIS tree — reusing it`); BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; }
      continue;
    }
    log(`starting python3 -m http.server ${port} (bind 127.0.0.1) in ${repoRoot}`);
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}

const SHOT_W = 1600, SHOT_H = 1200;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}
async function newPage(browser) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().endsWith("/favicon.ico")) {
      req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
    } else req.continue();
  });
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  page.on("response", (res) => { if (res.status() >= 400) log("HTTP", res.status(), res.url()); });
  return page;
}

// bootToInSession/waitForTheater — verbatim convention from capture-standee-gallery.mjs (that file's
// header explains the "why" behind each step; this is a mechanical boot ritual, not this unit's own).
async function bootToInSession(page) {
  return await page.evaluate(() => {
    const notes = [];
    try {
      if (typeof startBardo !== "function") return { ok: false, stage: "startBardo-missing" };
      startBardo();
      if (typeof bardoBegin === "function") bardoBegin();
      function autoFillStep(step) {
        if (!step) return;
        try {
          if (step.t === "choose") {
            if (!GS.CGEN[step.field]) {
              const src = step.field === "species" ? SPECIES : step.field === "class" ? CLASSES : BACKGROUNDS;
              const k = Object.keys(src || {})[0];
              if (k) cgChoose(step.field, k);
            }
          } else if (step.t === "scores") {
            while (GS.CGEN.scoreRolls.length < 6) bardoRollScore();
            if (!GS.CGEN.assigned) bardoAssign("best");
          } else if (step.t === "skills") { if (typeof cgSkillAuto === "function") cgSkillAuto(); }
          else if (step.t === "equipment") { if (typeof cgKitAuto === "function") cgKitAuto(); }
          else if (step.t === "tools") { if (typeof cgToolsAuto === "function") cgToolsAuto(); }
          else if (step.t === "languages") { if (typeof cgLangAuto === "function") cgLangAuto(); }
          else if (step.t === "spells") { if (typeof cgSpellsAuto === "function") cgSpellsAuto(); }
          else if (step.t === "feat") { if (typeof cgFeatAuto === "function") cgFeatAuto(); }
          else if (step.t === "life") { if (GS.CGEN.lifeQ && !GS.CGEN.lifeLog[GS.CGEN.lifeI] && typeof bardoLifeRoll === "function") bardoLifeRoll(); }
          else if (step.t === "hometown") { if (!GS.BARDO.rolled[step.key] && typeof bardoRollHometown === "function") bardoRollHometown(); }
          else if (step.t === "world") { if (!GS.BARDO.rolled[step.key] && typeof bardoRollWorld === "function") bardoRollWorld(); }
        } catch (e) { notes.push("autoFillStep threw at " + (step && step.t) + ": " + e.message); }
      }
      const seq = GS.BARDO.seq;
      let guard = 0; const MAX_STEPS = seq.length + 10;
      while (GS.BARDO && GS.BARDO.i < seq.length - 1 && guard < MAX_STEPS) {
        const step = seq[GS.BARDO.i];
        autoFillStep(step);
        if (step && step.t === "life" && GS.CGEN.lifeQ) {
          let lifeGuard = 0;
          while (GS.CGEN.lifeI < GS.CGEN.lifeQ.length - 1 && lifeGuard < 40) { autoFillStep(step); if (typeof bardoLifeStepNext === "function") bardoLifeStepNext(); lifeGuard++; }
          autoFillStep(step); if (typeof bardoLifeStepNext === "function") bardoLifeStepNext();
        }
        bardoAdvance(); guard++;
      }
      const nameEl = document.getElementById("charName");
      if (nameEl) nameEl.value = "AB Flip Cards Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found", notes };
      if (typeof startSession === "function") startSession(world.id);
      showTab("world");
      return { ok: true, notes, worldId: world.id };
    } catch (e) { return { ok: false, stage: "exception", error: e.message, stack: e.stack, notes }; }
  });
}
async function waitForTheater(page) {
  const deadline = Date.now() + 20000;
  let state = null;
  while (Date.now() < deadline) {
    state = await page.evaluate(() => {
      const host = document.getElementById("worldView");
      return {
        hasBattleStage: !!(host && host.querySelector(".game.battle-stage")),
        theaterMounted: !!(typeof GS !== "undefined" && GS.theaterMounted),
        hasCanvas: !!(host && host.querySelector(".theater-stage-canvas canvas")),
        hasSetInteriorBoard: !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

// buildLineupBoard — verbatim from capture-standee-gallery.mjs's own function of the same name (topology
// "The Hub", n=6 — proven to give enough floor space for a multi-piece cast; no dressPlan() call, so
// plan.dressing stays undefined and interiorBuildBoard adds ZERO furniture/dressing pieces).
async function buildLineupBoard(page, realmId) {
  return await page.evaluate((realmId) => {
    try {
      function buildFixture(topology, n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const group = topology === "The Hub" ? "hub" : "linear";
        const edges = [];
        if (group === "hub") {
          const spokeCount = Math.min(n - 1, 4);
          for (let i = 1; i < n; i++) edges.push([ids[0], ids[Math.min(i, spokeCount)]]);
        } else {
          for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
        }
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { if (a !== b) { adj[a].push(b); adj[b].push(a); } });
        const depth = { [ids[0]]: 0 };
        const q = [ids[0]]; let head = 0;
        while (head < q.length) {
          const cur = q[head++];
          (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } });
        }
        return ids.map((id, i) => ({
          id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0,
          exits: (adj[id] || []).map((tid) => ({ targetId: tid })),
          light: "normal",
        }));
      }
      const fixture = buildFixture("The Hub", 6);
      const plan = spatializePlan(fixture, "The Hub", { walkId: "ab-flip-cards-" + realmId });
      const focusRoom = plan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(plan, { realmId, env: "dungeon", focusSegNum, radius: 1 });
      return { ok: true, board, room: { x: focusRoom.x, y: focusRoom.y, w: focusRoom.w, d: focusRoom.d } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, realmId);
}

// evenly-spaced points along ONE horizontal line through the room's middle — NOT a copy of
// capture-standee-gallery.mjs's own fractional-margin lineupPositions. LIVE-DEBUGGED FINDING (this
// unit's own dev pass, not carried over): a fractional margin (room.w * 0.12/0.16) rounds the
// OUTERMOST piece onto the room's very LAST interior floor column — adjacent to the wall/doorframe
// shell interiorBuildBoard always builds — and a hub room's corner doorframe geometry sits close
// enough to the camera at that column to occlude a standee's lower body (confirmed live: the first
// draft of this script placed the PC at exactly that column and its own screenshot showed almost
// exactly the failure mode Adam rejected the B3 flip pair for — a wall cutting across the standee).
// This version instead reserves a full CLEAR CELL on each end (never occupied by any piece) and
// spaces every piece strictly between those two guard cells — for this script's actual room (w=7,
// from the fixed "The Hub"/n=6 fixture + deterministic walkId below) that places all 5 cast members
// on offsets [1,2,3,4,5] out of 0..6, one cell apart, with a full guard cell of open floor on both
// sides. Degrades gracefully (documented, not silently) if a future room is narrower than the cast
// needs — the caller records `marginNote` when spacing had to compress below 1 full cell.
function lineupPositions(room, count) {
  const marginCells = 1; // a whole guard cell of open floor between the lineup and the wall shell
  const loX = room.x + marginCells;
  const hiX = room.x + room.w - 1 - marginCells;
  const usable = Math.max(0, hiX - loX);
  const midY = Math.round(room.y + room.d / 2);
  const step = count > 1 ? usable / (count - 1) : 0;
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push({ x: Math.round(loX + step * i), y: midY });
  }
  const compressed = count > 1 && step < 1;
  return { positions, compressed, loX, hiX, usable };
}

// the 5-creature cast — see this file's own header for the full per-slug rationale (candidateAsset
// verification, substitutions, and the two deliberate orphan-fold-in inclusions).
const CAST = [
  { role: "small", pieceSlug: "Giant Rat", registrySlug: "spr-fantasy-giant-rat", sizeLabel: "Small" },
  { role: "medium-humanoid", pieceSlug: "Gnoll Warrior", registrySlug: "spr-fantasy-gnoll-warrior", sizeLabel: "Medium", substitutedFor: "spr-fantasy-hobgoblin-soldier (candidateAsset:null)" },
  { role: "large", pieceSlug: "Owlbear", registrySlug: "spr-fantasy-owlbear", sizeLabel: "Large", substitutedFor: "spr-fantasy-ogre-zombie (candidateAsset:null)" },
  { role: "gargantuan", pieceSlug: "Adult Gold Dragon", registrySlug: "spr-fantasy-adult-gold-dragon", sizeLabel: "Gargantuan (nominal — size field is null on this entry)", orphanFoldIn: true },
  { role: "pc", pieceSlug: "Dwarf Fighter", registrySlug: "spr-pc-dwarf-fighter", sizeLabel: "PC (no size field)", orphanFoldIn: true },
];
const REALM = process.env.BG_REALM || "fantasy";
const LIGHT_PROFILES = ["torchlit", "daylit"];

// LIVE-DEBUGGED FINDING (a REAL product gotcha this script's own dev pass tripped over, not a
// standee-gallery-carried assumption — worth Adam/orchestrator knowing about independent of this
// gate): setInteriorBoard(data) computes `dirtyKey = "interior:" + JSON.stringify(variant) + ":" +
// JSON.stringify(data)` and SKIPS the entire rebuild (window.Theater.stats.boardSkips++, return) when
// dirtyKey matches the PRIOR mount's key (src/ui/theater-boot.js ~L9648-9669). A runtimeAdmitted flip
// on SPRITE_REGISTRY is external to `data` (the board JSON) — mounting the byte-identical board twice
// in a row (candidate panel, then legacy panel, same pieces/lightProfile) produces the SAME dirtyKey
// both times, so the SECOND setInteriorBoard call silently no-ops: spriteTextureFor is never called
// again, SPRITE_TEXTURE_CACHE keeps serving the FIRST panel's texture, and interiorPiecesResolved()
// reports "resolved" instantly with zero new network activity — confirmed live (Chrome MCP console
// probe against a real page) that this exact confound was silently corrupting an early draft of this
// script's "legacy" panel into re-showing candidate art. FIX: an inert `_abCacheBust` marker field
// (never read by any product code — interiorBuildBoard/setInteriorBoard only ever look at their own
// known field names) folded into the board object before EVERY mount, distinct per panel, so
// JSON.stringify(data) always differs and the dirtyKey check can never false-positive-skip a real
// corpus flip. THIS IS PROBABLY A LATENT BUG IN capture-standee-gallery.mjs's OWN flip-pair cell too
// (its captureFlipPanel mounts the SAME `flipBuilt.board` object twice, once per runtimeAdmitted
// value, with no cache-bust) — flagged here, not fixed there (out of this unit's scope; that gallery
// still passed piecesResolved counts, which is exactly the false-confidence shape this bug produces).
async function mountBoard(page, board, cacheBustLabel) {
  const mounted = await page.evaluate((board, cacheBustLabel) => {
    try {
      const clone = (typeof structuredClone === "function") ? structuredClone(board) : JSON.parse(JSON.stringify(board));
      if (cacheBustLabel != null) clone._abCacheBust = cacheBustLabel;
      window.Theater.setInteriorBoard(clone);
      return { ok: true, piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, board, cacheBustLabel);
  if (!mounted.ok) return mounted;
  // LIVE-DEBUGGED FINDING, carried over verbatim from capture-standee-gallery.mjs (reproduced there
  // against master: 0/5 resolved after 15s+ WITH a renderWorld() poll, 5/5 resolved on the FIRST 250ms
  // tick with renderWorld() simply removed from the loop) — spriteTextureFor's onLoad callback
  // self-replays via S.lastBoard once a texture lands; calling renderWorld() from the Node-side poll
  // loop starves that replay by touching S.mounted/S.lastBoard.kind. This script therefore never calls
  // renderWorld() after mount — only sleeps and re-reads the counters.
  if (mounted.piecesRequested > 0) {
    const deadline = Date.now() + 8000;
    let latest = mounted;
    let ticks = 0;
    while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
      await sleep(250);
      latest = await page.evaluate(() => ({
        piecesResolved: window.Theater.interiorPiecesResolved(),
        piecesRequested: window.Theater.interiorPiecesRequested(),
      }));
      ticks++;
      if (process.env.BG_DEBUG && ticks % 4 === 0) log(`  ...waiting: ${latest.piecesResolved}/${latest.piecesRequested} (tick ${ticks})`);
    }
    mounted.piecesResolved = latest.piecesResolved;
    mounted.settleTicks = ticks;
    mounted.timedOut = latest.piecesResolved < latest.piecesRequested;
    if (process.env.BG_DEBUG) log(`mount settled: ${mounted.piecesResolved}/${mounted.piecesRequested} after ${ticks} ticks (timedOut=${mounted.timedOut})`);
  }
  return mounted;
}

// per-cast-member resolution verification — the "which corpus did THIS creature actually resolve
// from" read-back the spec asks for. Deliberately does NOT rely on interiorGroup traversal alone
// (an orphan-fold-in piece that never resolves never gets a group at all, so it would be invisible to
// that method) — instead reads window.Theater._spriteEntryForTest/_spriteAssetPathForTest/
// _spriteTextureCache/_spriteTextureSrcCache directly, the same seams VQ2-RESPEC.md S5 exposed for
// exactly this kind of census. A cast member that never resolves is reported as such, not silently
// dropped.
async function verifyCastResolution(page, cast) {
  return await page.evaluate((cast) => {
    return cast.map((c) => {
      const entry = window.Theater._spriteEntryForTest ? window.Theater._spriteEntryForTest(c.pieceSlug) : null;
      if (!entry) return { pieceSlug: c.pieceSlug, registrySlug: c.registrySlug, ok: false, reason: "spriteEntryFor found no registry entry for this pieceSlug" };
      const resolvedPath = window.Theater._spriteAssetPathForTest ? window.Theater._spriteAssetPathForTest(entry) : null;
      const cacheEntry = window.Theater._spriteTextureCache ? window.Theater._spriteTextureCache[entry.slug] : undefined;
      const cachedPath = window.Theater._spriteTextureSrcCache ? window.Theater._spriteTextureSrcCache[entry.slug] : undefined;
      const isLoadedTexture = !!(cacheEntry && typeof cacheEntry === "object" && cacheEntry.isTexture);
      const textureState = isLoadedTexture ? "loaded" : (cacheEntry === "pending" ? "pending" : (cacheEntry === "failed" ? "failed" : (cacheEntry === undefined ? "never-requested" : "unknown")));
      const corpus = !isLoadedTexture ? null
        : (resolvedPath && resolvedPath.indexOf("sprites-faceted") !== -1) ? "faceted (candidate)"
        : (resolvedPath && resolvedPath.indexOf("/sprites/") !== -1) ? "legacy (v3)"
        : "unknown";
      return {
        pieceSlug: c.pieceSlug, registrySlug: entry.slug,
        runtimeAdmitted: entry.runtimeAdmitted,
        resolvedPath, cachedPathMatchesResolved: cachedPath === resolvedPath,
        textureResolved: isLoadedTexture, textureState, corpus,
        worldHeight: entry.worldHeight, scaleTrue: (typeof entry.scaleTrue === "number") ? entry.scaleTrue : null,
      };
    });
  }, cast);
}

// ─── flip stub helpers — in-page only, never touches disk (per this unit's own instruction: "do not
// commit a legacy-admitted registry" — nothing here ever calls fs.writeFileSync on the registry file
// itself; the mutation lives only in the live page's SPRITE_REGISTRY object and is restored before the
// page closes). ──────────────────────────────────────────────────────────────────────────────────────
async function setCastRuntimeAdmitted(page, cast, value) {
  return await page.evaluate((cast, value) => {
    if (typeof SPRITE_REGISTRY === "undefined") return { ok: false, reason: "SPRITE_REGISTRY not loaded" };
    const results = [];
    cast.forEach((c) => {
      const e = SPRITE_REGISTRY[c.registrySlug];
      if (!e) { results.push({ registrySlug: c.registrySlug, ok: false, reason: "missing" }); return; }
      const prior = e.runtimeAdmitted;
      e.runtimeAdmitted = value;
      results.push({ registrySlug: c.registrySlug, ok: true, prior, now: e.runtimeAdmitted });
    });
    return { ok: true, results };
  }, cast, value);
}

// readSceneTelemetry — verbatim from capture-standee-gallery.mjs (ground-truth worldPos/interiorWidth/
// interiorHeight per RESOLVED piece, plus the live camera's own matrices for the projection math below).
async function readSceneTelemetry(page) {
  return await page.evaluate(() => {
    const ctx = window.Theater._graphicsResearchContextForTest ? window.Theater._graphicsResearchContextForTest() : null;
    if (!ctx || !ctx.camera) return { ok: false, reason: "no graphics-research ctx seam" };
    const cam = ctx.camera;
    const pieces = [];
    if (ctx.interiorGroup) {
      ctx.interiorGroup.traverse((obj) => {
        if (obj.userData && obj.userData.sprite && obj.userData.spriteSlug) {
          const e = obj.matrixWorld.elements;
          const wp = { x: e[12], y: e[13], z: e[14] };
          pieces.push({
            spriteSlug: obj.userData.spriteSlug,
            worldPos: { x: wp.x, y: wp.y, z: wp.z },
            interiorWidth: obj.userData.interiorWidth || null,
            interiorHeight: obj.userData.interiorHeight || null,
          });
        }
      });
    }
    return {
      ok: true,
      camera: {
        position: { x: cam.position.x, y: cam.position.y, z: cam.position.z },
        fov: cam.fov, aspect: cam.aspect,
        matrixWorld: cam.matrixWorld.elements.slice(),
        projectionMatrix: cam.projectionMatrix.elements.slice(),
        matrixWorldInverse: cam.matrixWorldInverse.elements.slice(),
      },
      pieces,
    };
  });
}

async function setCameraPose(page, pos, lookAt) {
  return await page.evaluate((pos, lookAt) => {
    if (!window.Theater._setInteriorCameraPoseForTest) return false;
    return window.Theater._setInteriorCameraPoseForTest(pos, lookAt);
  }, pos, lookAt);
}

// pure node-side math mirroring THREE.Vector3.project(camera) — done off the SERIALIZED matrices
// readSceneTelemetry pulled back (verbatim from capture-standee-gallery.mjs).
function multiplyMatVec(mat, v) {
  const e = mat;
  const x = v.x, y = v.y, z = v.z;
  const w = e[3] * x + e[7] * y + e[11] * z + e[15];
  return {
    x: e[0] * x + e[4] * y + e[8] * z + e[12],
    y: e[1] * x + e[5] * y + e[9] * z + e[13],
    z: e[2] * x + e[6] * y + e[10] * z + e[14],
    w: w || 1,
  };
}
function worldToNdc(worldPos, camera) {
  const view = multiplyMatVec(camera.matrixWorldInverse, worldPos);
  const clip = multiplyMatVec(camera.projectionMatrix, view);
  return { x: clip.x / clip.w, y: clip.y / clip.w, z: clip.z / clip.w };
}
function ndcToPixel(ndc, canvasBox) {
  return {
    x: canvasBox.x + ((ndc.x + 1) / 2) * canvasBox.width,
    y: canvasBox.y + (1 - (ndc.y + 1) / 2) * canvasBox.height,
  };
}
function cameraRightWorld(camera) {
  const e = camera.matrixWorld;
  const rx = e[0], ry = e[1], rz = e[2];
  const len = Math.hypot(rx, ry, rz) || 1;
  return { x: rx / len, y: ry / len, z: rz / len };
}
// camera's world "forward" vector (three.js convention: local -Z) — used to re-derive a lookAt point
// from a captured matrixWorld so the SAME pose can be written back to a later panel via
// _setInteriorCameraPoseForTest(pos, lookAt), which takes a lookAt POINT, not a forward vector.
function cameraForwardWorld(camera) {
  const e = camera.matrixWorld;
  const fx = -e[8], fy = -e[9], fz = -e[10];
  const len = Math.hypot(fx, fy, fz) || 1;
  return { x: fx / len, y: fy / len, z: fz / len };
}
function computePieceObservations(telemetry, canvasBox) {
  const cam = telemetry.camera;
  const right = cameraRightWorld(cam);
  return telemetry.pieces.map((p) => {
    const midHeight = { x: p.worldPos.x, y: p.worldPos.y + (p.interiorHeight || 0) / 2, z: p.worldPos.z };
    const footPoint = p.worldPos;
    const halfW = (p.interiorWidth || 0) / 2;
    const leftPoint = { x: midHeight.x - right.x * halfW, y: midHeight.y - right.y * halfW, z: midHeight.z - right.z * halfW };
    const rightPoint = { x: midHeight.x + right.x * halfW, y: midHeight.y + right.y * halfW, z: midHeight.z + right.z * halfW };
    const footPx = ndcToPixel(worldToNdc(footPoint, cam), canvasBox);
    const midPx = ndcToPixel(worldToNdc(midHeight, cam), canvasBox);
    const leftPx = ndcToPixel(worldToNdc(leftPoint, cam), canvasBox);
    const rightPx = ndcToPixel(worldToNdc(rightPoint, cam), canvasBox);
    return {
      spriteSlug: p.spriteSlug,
      interiorWidth: p.interiorWidth, interiorHeight: p.interiorHeight,
      worldPos: p.worldPos,
      projectedFootPx: { x: Math.round(footPx.x), y: Math.round(footPx.y) },
      projectedMidPx: { x: Math.round(midPx.x), y: Math.round(midPx.y) },
      projectedWidthPx: Math.round(Math.hypot(rightPx.x - leftPx.x, rightPx.y - leftPx.y)),
    };
  });
}

// max per-element delta between two captured camera telemetry blocks (position + matrixWorld) — the
// "assert numerically identical" proof this unit's spec explicitly asks for.
function cameraDelta(a, b) {
  if (!a || !b) return { ok: false, maxDelta: null };
  const posDelta = Math.max(
    Math.abs(a.position.x - b.position.x), Math.abs(a.position.y - b.position.y), Math.abs(a.position.z - b.position.z)
  );
  let matDelta = 0;
  for (let i = 0; i < 16; i++) matDelta = Math.max(matDelta, Math.abs(a.matrixWorld[i] - b.matrixWorld[i]));
  const maxDelta = Math.max(posDelta, matDelta);
  return { ok: true, positionMaxDelta: posDelta, matrixWorldMaxDelta: matDelta, maxDelta, identical: maxDelta < 1e-6 };
}

async function shootFullPage(page, shotPath) {
  await page.screenshot({ path: shotPath, fullPage: false });
}

// ─── main per-light-profile run ─────────────────────────────────────────────────────────────────────
async function runLight(page, canvasBox, builtBoard, lightProfile) {
  const result = { lightProfile, notes: [] };
  const boardForLight = JSON.parse(JSON.stringify(builtBoard));
  boardForLight.lightProfile = lightProfile;

  // ─── PANEL 1: candidate (flip ON — the committed registry default, untouched) ──────────────────────
  const mountedCandidate = await mountBoard(page, boardForLight, lightProfile + ":candidate");
  if (!mountedCandidate.ok) throw new Error(`[${lightProfile}/candidate] mount FAILED: ${mountedCandidate.error}`);
  await sleep(200); // NO renderWorld() here — see mountBoard's own header comment.

  const candidateResolution = await verifyCastResolution(page, CAST);
  const candidateTelemetryPre = await readSceneTelemetry(page);
  if (!candidateTelemetryPre.ok) throw new Error(`[${lightProfile}/candidate] no telemetry: ${candidateTelemetryPre.reason}`);

  // capture the NATURAL post-mount establishing camera (the gallery's own lineup framing — full
  // bodies + headroom, standee eye-level-ish, no hand-tuned close-up formula) as the CONTROL POSE for
  // this light profile, then re-derive a lookAt point from its own forward vector so the identical
  // pos+lookAt call can be replayed verbatim for the legacy panel below.
  const controlCam = candidateTelemetryPre.camera;
  const forward = cameraForwardWorld(controlCam);
  const lookAtPoint = {
    x: controlCam.position.x + forward.x * 10,
    y: controlCam.position.y + forward.y * 10,
    z: controlCam.position.z + forward.z * 10,
  };
  // re-apply the SAME pos+lookAt to the candidate panel itself (not just the legacy panel below) so
  // BOTH panels' actual rendered frames come from the identical _setInteriorCameraPoseForTest call —
  // no panel is ever "the natural one" and the other "the forced one".
  await setCameraPose(page, controlCam.position, lookAtPoint);
  await waitForRepaint(page);
  await sleep(150);
  const candidateShot = path.join(shotsDir, `${lightProfile}-candidate.png`);
  await shootFullPage(page, candidateShot);
  const candidateTelemetry = await readSceneTelemetry(page);
  const candidateObs = candidateTelemetry.ok ? computePieceObservations(candidateTelemetry, canvasBox) : [];

  // ─── PANEL 2: legacy (flip OFF, via in-page runtimeAdmitted mutation — never touches disk) ─────────
  const stub = await setCastRuntimeAdmitted(page, CAST, "legacy");
  // SAME board object (geometry byte-identical) but a DIFFERENT _abCacheBust label — required so
  // setInteriorBoard's own dirtyKey check (see mountBoard's header comment) doesn't false-positive-skip
  // this remount just because board.pieces/lightProfile are unchanged from the candidate mount above.
  const mountedLegacy = await mountBoard(page, boardForLight, lightProfile + ":legacy");
  if (!mountedLegacy.ok) { result.notes.push(`[${lightProfile}/legacy] mount FAILED: ${mountedLegacy.error}`); }
  await sleep(200);

  const legacyResolution = await verifyCastResolution(page, CAST);
  // force the IDENTICAL pos+lookAt this light profile's candidate panel used — the numerical-identity
  // proof below asserts this actually reproduced the same matrixWorld, not just the same call.
  await setCameraPose(page, controlCam.position, lookAtPoint);
  await waitForRepaint(page);
  await sleep(150);
  const legacyShot = path.join(shotsDir, `${lightProfile}-legacy.png`);
  await shootFullPage(page, legacyShot);
  const legacyTelemetry = await readSceneTelemetry(page);
  const legacyObs = legacyTelemetry.ok ? computePieceObservations(legacyTelemetry, canvasBox) : [];

  const restore = await setCastRuntimeAdmitted(page, CAST, "candidate");

  const camDelta = cameraDelta(candidateTelemetry.ok ? candidateTelemetry.camera : null, legacyTelemetry.ok ? legacyTelemetry.camera : null);

  result.controlPose = { position: controlCam.position, lookAt: lookAtPoint };
  result.cameraIdentityCheck = camDelta;
  result.candidate = {
    shot: path.relative(outDir, candidateShot),
    piecesResolved: mountedCandidate.piecesResolved, piecesRequested: mountedCandidate.piecesRequested,
    timedOut: !!mountedCandidate.timedOut,
    perCreature: candidateResolution.map((r) => {
      const scene = candidateObs.find((o) => o.spriteSlug === r.registrySlug);
      return Object.assign({}, r, scene ? { worldPos: scene.worldPos, projectedFootPx: scene.projectedFootPx, projectedWidthPx: scene.projectedWidthPx } : { worldPos: null, note: "not present in live interiorGroup — texture never resolved" });
    }),
  };
  result.legacy = {
    shot: path.relative(outDir, legacyShot),
    piecesResolved: mountedLegacy.piecesResolved, piecesRequested: mountedLegacy.piecesRequested,
    timedOut: !!mountedLegacy.timedOut,
    perCreature: legacyResolution.map((r) => {
      const scene = legacyObs.find((o) => o.spriteSlug === r.registrySlug);
      return Object.assign({}, r, scene ? { worldPos: scene.worldPos, projectedFootPx: scene.projectedFootPx, projectedWidthPx: scene.projectedWidthPx } : { worldPos: null, note: "not present in live interiorGroup — texture never resolved" });
    }),
  };
  result.stubApplied = stub;
  result.stubRestored = restore;
  return result;
}

async function buildComposite(browser, lightProfile, panelResult) {
  const page = await browser.newPage();
  try {
    const cellW = 760, cellH = 570, labelH = 44, capH = 96, pad = 8;
    const b64Candidate = fs.readFileSync(path.join(outDir, panelResult.candidate.shot)).toString("base64");
    const b64Legacy = fs.readFileSync(path.join(outDir, panelResult.legacy.shot)).toString("base64");
    const candCaption = panelResult.candidate.perCreature.map((c) => `${c.pieceSlug}: ${c.textureState}${c.corpus ? " [" + c.corpus + "]" : ""} h=${c.worldHeight != null ? c.worldHeight : "?"}`).join("  |  ");
    const legCaption = panelResult.legacy.perCreature.map((c) => `${c.pieceSlug}: ${c.textureState}${c.corpus ? " [" + c.corpus + "]" : ""} h=${c.worldHeight != null ? c.worldHeight : "?"}`).join("  |  ");
    const sheetB64 = await page.evaluate(({ b64Candidate, b64Legacy, cellW, cellH, labelH, capH, pad, lightProfile, candCaption, legCaption, cameraNote }) => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 2 * (cellW + pad) + pad;
        canvas.height = cellH + labelH + capH + 2 * pad;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#eee"; ctx.font = "16px monospace";
        ctx.fillText(`A/B FLIP — ${lightProfile} — ${cameraNote}`, pad, 18);
        let loaded = 0;
        function wrapText(text, x, y, maxWidth, lineHeight) {
          const words = text.split(" ");
          let line = "", ly = y;
          for (const w of words) {
            const test = line + w + " ";
            if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, ly); line = w + " "; ly += lineHeight; }
            else line = test;
          }
          ctx.fillText(line, x, ly);
        }
        const draw = (b64, ci, title, caption) => {
          const im = new Image();
          im.onload = () => {
            const x = pad + ci * (cellW + pad);
            ctx.drawImage(im, x, labelH + pad, cellW, cellH);
            ctx.fillStyle = "#eee"; ctx.font = "15px monospace";
            ctx.fillText(title, x + 4, labelH - 4);
            ctx.font = "11px monospace"; ctx.fillStyle = "#9cf";
            wrapText(caption, x + 4, labelH + pad + cellH + 16, cellW - 8, 13);
            loaded++;
            if (loaded === 2) resolve(canvas.toDataURL("image/png").split(",")[1]);
          };
          im.onerror = () => { loaded++; if (loaded === 2) resolve(canvas.toDataURL("image/png").split(",")[1]); };
          im.src = "data:image/png;base64," + b64;
        };
        draw(b64Candidate, 0, "CANDIDATE (flip ON, faceted-v1)", candCaption);
        draw(b64Legacy, 1, "LEGACY (flip OFF, v3 — SAME scene/camera/light)", legCaption);
      });
    }, { b64Candidate, b64Legacy, cellW, cellH, labelH, capH, pad, lightProfile, candCaption, legCaption, cameraNote: panelResult.cameraIdentityCheck.identical ? "camera IDENTICAL both panels (maxDelta=" + panelResult.cameraIdentityCheck.maxDelta.toExponential(2) + ")" : "camera NOT identical — see results.json" });
    const compositePath = path.join(outDir, `${lightProfile}-ab-composite.png`);
    fs.writeFileSync(compositePath, Buffer.from(sheetB64, "base64"));
    return compositePath;
  } finally {
    await page.close();
  }
}

async function main() {
  let branch = null, sha = null;
  try { branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoRoot }).toString().trim(); } catch (e) {}
  try { sha = execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim(); } catch (e) {}

  const server = await startServer();
  log("server:", BASE);
  const browser = await launchChrome();
  const summary = {
    generatedAt: new Date().toISOString(), branch, sha, realm: REALM,
    cast: CAST, lights: {},
    // static, always-recorded findings (not conditional on this run's own outcome) — see this file's
    // header comment for the full write-up of each.
    notes: [
      "PC ORPHAN FINDING: all 39 realm:pc runtimeAdmitted:candidate registry entries have legacyAsset:null (full-file scan, not a one-slug spot check) — no PC choice in this cast could show a real legacy-vs-candidate pair; systemic, not specific to spr-pc-dwarf-fighter.",
      "BOARDSKIP GOTCHA: setInteriorBoard's dirtyKey check (src/ui/theater-boot.js ~L9648) skips a full rebuild when JSON.stringify(board) is unchanged from the prior mount — a runtimeAdmitted-only registry flip is invisible to that check, so remounting the SAME board object twice (candidate then legacy) silently re-serves the FIRST panel's cached texture with zero new network activity unless an inert cache-bust marker forces the dirtyKey to differ (this script's own _abCacheBust field, added after this exact confound was caught live). capture-standee-gallery.mjs's own B3 flip-pair cell (buildSinglePieceBoard/captureFlipPanel) mounts the identical board object twice the same way with NO cache-bust — its reported piecesResolved counts are plausibly NOT proof its 'legacy' panel ever showed real legacy art. Not fixed here (out of scope) — flagged for whoever owns that gallery next.",
      "DAYLIT EXPOSURE FINDING: at this lineup's camera distance, the daylit light profile blows out the pale/cream faceted standees (and the legacy owlbear even harder) to a near-white smear — read the daylit composite/raw shots yourself before trusting them for an art-register judgment; torchlit is the more legible comparison of the two.",
    ],
  };
  try {
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("setInteriorBoard never became available: " + JSON.stringify(theaterState));

    // build the ONE bare-stage lineup board once — reused (light-mutated clone) across both light
    // profiles, so room geometry is byte-identical across the whole run, not just within a light.
    const built = await buildLineupBoard(page, REALM);
    if (!built.ok) throw new Error("buildLineupBoard failed: " + built.error);
    const lineup = lineupPositions(built.room, CAST.length);
    if (lineup.compressed) summary.notes.push(`lineupPositions: room.w=${built.room.w} could not give every cast member a full clear cell (usable=${lineup.usable} < ${CAST.length - 1} gaps needed) — spacing compressed below 1 cell.`);
    built.board.pieces = CAST.map((c, i) => ({ slug: c.pieceSlug, cellX: lineup.positions[i].x, cellY: lineup.positions[i].y }));
    summary.room = built.room;
    summary.lineupPositions = lineup.positions;
    summary.lineupGuardCells = { loX: lineup.loX, hiX: lineup.hiX };

    const canvasEl = await page.$(".theater-stage-canvas canvas");
    const canvasBox = canvasEl ? await canvasEl.boundingBox() : null;
    if (!canvasBox) throw new Error("theater canvas has no bounding box");

    for (const lightProfile of LIGHT_PROFILES) {
      log(`=== light: ${lightProfile} ===`);
      const panelResult = await runLight(page, canvasBox, built.board, lightProfile);
      const compositePath = await buildComposite(browser, lightProfile, panelResult);
      panelResult.composite = path.relative(outDir, compositePath);
      summary.lights[lightProfile] = panelResult;
      log(`  candidate ${panelResult.candidate.piecesResolved}/${panelResult.candidate.piecesRequested} resolved, legacy ${panelResult.legacy.piecesResolved}/${panelResult.legacy.piecesRequested} resolved, camera identical=${panelResult.cameraIdentityCheck.identical}`);
    }

    summary.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    await page.close();

    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(summary, null, 2));
    log("wrote results.json");
  } catch (e) {
    summary.error = e.message;
    summary.stack = e.stack;
    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(summary, null, 2));
    log("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
