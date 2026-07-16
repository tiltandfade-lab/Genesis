#!/usr/bin/env node
/* dev/verify-board-admission-dirty-key.mjs — KENNEY-SOCKET-WAVE.md CR-1 item 6 (addendum): the A/B
   flip rig's own finding, banked in the 66fc7a0b merge message ("setInteriorBoard dirty-key can serve
   stale textures across registry-only flips") and documented at length in
   dev/battle-gate/ab-flip-cards/capture-ab-flip.mjs's "LIVE-DEBUGGED FINDING" header comment.

   THE GAP (src/ui/theater-boot.js's setInteriorBoard, ~line 9679):
     const dirtyKey = "interior:" + JSON.stringify(variant) + ":" + JSON.stringify(data);
     if(dirtyKey === S.boardKey){ window.Theater.stats.boardSkips++; return; }
   `dirtyKey` is derived ONLY from `variant` + `data` (the board object itself) — it never reads
   SPRITE_REGISTRY. A registry-ONLY admission flip (SPRITE_REGISTRY[slug].runtimeAdmitted mutated
   live, in-page, WITHOUT a page reload — exactly what dev/battle-gate/ab-flip-cards/capture-ab-flip.mjs
   does to compare legacy vs. candidate art from the SAME live session) changes nothing about `data`,
   so the SECOND setInteriorBoard(SAME board object) call produces a BYTE-IDENTICAL dirtyKey and is
   silently skipped. This is NOT a texture-cache design flaw: spriteTextureFor's own per-slug cache
   (SPRITE_TEXTURE_CACHE keyed by slug, SPRITE_TEXTURE_SRC[slug] remembering which path is loaded
   under that key — see that function's own header, ~line 3012) ALREADY detects a resolved-path
   mismatch and evicts/reloads correctly, EVERY TIME IT'S ACTUALLY CALLED. The whole bug is that the
   dirty-key skip prevents it from ever being called again for an unchanged board object — a
   DIRTY-KEY COVERAGE gap, not a cache-correctness gap.

   WHY NOT FIXED INLINE HERE: KENNEY-SOCKET-WAVE.md CR-1's own scope note restricts this unit's ONLY
   src/ui/theater-boot.js edit to item 4 (spriteEntryFor's TIER 2 console.warn de-dupe) — LL-1 owns
   the light/post regions of that file concurrently this session, and setInteriorBoard sits well
   outside item 4's isolated hunk. CR-1's item 6 text itself offers two paths — "add a cheap
   admission-state component to the dirty key, or a documented guard comment + a red-first test
   capturing current behavior honestly" — and the concurrent-edit restriction picks the second one
   for this session: this file IS that documented guard comment (this header) plus that red-first
   test (below), formalizing what was previously only prose in a capture script's header into a
   first-class, re-runnable regression check.

   THE RECOMMENDED FIX (for whoever next owns that region of theater-boot.js): fold a CHEAP admission
   fingerprint into `dirtyKey` — not a full `JSON.stringify(SPRITE_REGISTRY)` (~4,400 entries; real,
   avoidable per-mount cost) but a single pass, one field read per entry, e.g. a position-weighted
   parity sum over `runtimeAdmitted` values (a bare COUNT of "candidate" entries would miss an
   equal-count swap — N slugs flip candidate->legacy while N others flip the other way, same count,
   different identities — a weighted sum by registry-key sort position catches that case too):

     function spriteRegistryAdmissionFingerprint(){
       if(typeof SPRITE_REGISTRY === "undefined" || !SPRITE_REGISTRY) return "none";
       let sum = 0, i = 0;
       for(const slug in SPRITE_REGISTRY){
         if(SPRITE_REGISTRY[slug] && SPRITE_REGISTRY[slug].runtimeAdmitted === "candidate") sum += (i + 1);
         i++;
       }
       return i + ":" + sum;
     }
     // then: const dirtyKey = "interior:" + JSON.stringify(variant) + ":" +
     //         spriteRegistryAdmissionFingerprint() + ":" + JSON.stringify(data);

   This does NOT redesign SPRITE_TEXTURE_CACHE/SPRITE_TEXTURE_SRC/DRESSING_TEXTURE_CACHE (explicitly
   out of scope per the review — those per-slug caches are already sound) — it only widens what makes
   setInteriorBoard decide a rebuild is needed, so a rebuild actually happens and spriteTextureFor's
   own already-correct self-heal gets the chance to run.

   Checks (real headless Chrome + THREE — no lightweight jsdom substitute exists here: setInteriorBoard
   early-returns unless S.mounted, which needs a real WebGLRenderer):
     1. boot + mount + resolve a REAL dual-corpus slug (status:"cut", legacyAsset AND candidateAsset
        both present — so a runtimeAdmitted flip actually changes the resolved path) at its CURRENT
        registry admission state.
     2. mutate SPRITE_REGISTRY[slug].runtimeAdmitted LIVE, in-page (the exact AB-rig technique) to the
        OTHER admission state — remount the BYTE-IDENTICAL board object, no cache-bust marker.
     3. RED (current, honest behavior): the remount is SKIPPED (stats.boardSkips climbs) and the
        loaded-texture-src cache (SPRITE_TEXTURE_SRC[slug]) stays pinned to the OLD path even though
        spriteAssetPathFor(the now-mutated entry) would resolve a DIFFERENT path if asked — the
        board's live corpus is now silently out of sync with the registry's own admission state.
     4. restored-GREEN (the AB-rig's own known-working escape hatch, confirmed here rather than only
        asserted in a capture script's prose): the SAME two boards, but the SECOND mount carries an
        inert `_abCacheBust` marker (never read by any product code) so JSON.stringify(data) differs
        -> the skip does NOT fire, spriteTextureFor runs again, and SPRITE_TEXTURE_SRC[slug] updates
        to the NEW, correct path. Proves the gap is real (check 3), proves it's genuinely a dirty-key
        coverage hole and not some deeper unfixable cache defect (check 4), and gives the recommended
        fix's exact would-be trigger a concrete, passing counter-example to compare against.

   Run: node dev/verify-board-admission-dirty-key.mjs --with-render   (real headless Chrome + THREE;
        no flag = skip, matching dev/verify-dungeon-dressing.mjs's own convention) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

// the real, committed registry — pick a slug with BOTH a legacyAsset and a candidateAsset (so a
// runtimeAdmitted flip actually changes spriteAssetPathFor's output; a candidate-only orphan
// wouldn't discriminate this check at all). Read here (node-side, off the real generated file — the
// SAME "never re-derive the shape by hand" discipline every other verify-*.mjs harness in this repo
// follows) rather than re-picked in-page, so the chosen slug is visible in this file's own diagnostics
// if the corpus ever changes shape.
function pickDualCorpusSlug() {
  const src = read("data/sprite-registry.js");
  const registry = new Function(src + "\nreturn SPRITE_REGISTRY;")();
  const [slug, e] = Object.entries(registry).find(
    ([, entry]) => entry.status === "cut" && entry.verdict !== "fail" && entry.legacyAsset && entry.candidateAsset
  ) || [];
  return slug ? { slug, name: e.name } : null;
}

async function bootAndRun(page, BASE, target) {
  await page.goto(`${BASE}/genesis.html`, { waitUntil: "load", timeout: 30000 });
  for (let i = 0; i < 40; i++) {
    const ready = await page.evaluate(() => !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"));
    if (ready) break;
    await new Promise((r) => setTimeout(r, 150));
  }
  return await page.evaluate(async (target) => {
    const out = { ok: false };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    try {
      const el = document.createElement("div");
      el.style.width = "800px"; el.style.height = "600px";
      document.body.appendChild(el);
      if (!window.Theater.mount(el)) return Object.assign(out, { stage: "mount-failed" });

      // same lexical-const access as verify-vp1c-kaiju-leak.mjs's own bootAndRun (SPRITE_REGISTRY is
      // a top-level `const`, never a `window.` property under classic-script rules).
      // eslint-disable-next-line no-eval
      const registry = eval("typeof SPRITE_REGISTRY !== 'undefined' ? SPRITE_REGISTRY : null");
      if (!registry) return Object.assign(out, { stage: "no-sprite-registry-global" });
      const entry = registry[target.slug];
      if (!entry) return Object.assign(out, { stage: "target-slug-missing-from-live-registry" });
      out.startingRuntimeAdmitted = entry.runtimeAdmitted;
      const otherAdmitted = entry.runtimeAdmitted === "candidate" ? "legacy" : "candidate";

      const waitForPieces = async () => {
        const deadline = Date.now() + 8000;
        let resolved = window.Theater.interiorPiecesResolved();
        let requested = window.Theater.interiorPiecesRequested();
        while (Date.now() < deadline && resolved < requested) {
          await sleep(150);
          resolved = window.Theater.interiorPiecesResolved();
          requested = window.Theater.interiorPiecesRequested();
        }
        return { resolved, requested, timedOut: resolved < requested };
      };

      const baseBoard = {
        kind: "interior3d", env: "dungeon", realmId: "fantasy", cellSize: 1, wallHeightBase: 2.4,
        fog: { color: "#000000" }, tileKit: {}, instances: { floor: [], wall: [], doorframe: [], pillar: [] },
        bounds: { minX: -3, maxX: 3, minZ: -3, maxZ: 3 },
        pieces: [{ slug: target.name, fid: "f1", cellX: 0, cellY: 0 }],
      };

      // 1) FIRST mount — resolves at the registry's CURRENT (starting) admission state.
      window.Theater.setInteriorBoard(baseBoard);
      const settle1 = await waitForPieces();
      out.mount1 = {
        piecesResolved: settle1.resolved, piecesRequested: settle1.requested, timedOut: settle1.timedOut,
        boardSkipsAfter: window.Theater.stats.boardSkips,
        resolvedPath: window.Theater._spriteAssetPathForTest(entry),
        srcCacheAfter: window.Theater._spriteTextureSrcCache[target.slug],
      };

      // 2) LIVE, in-page admission flip — the exact AB-rig technique (SPRITE_REGISTRY[slug] is the
      // SAME live object every closure in this page already reads; mutating a field on it is exactly
      // what a mid-session flip looks like — never touches disk, never reloads the page).
      const boardSkipsBeforeRemount = window.Theater.stats.boardSkips;
      entry.runtimeAdmitted = otherAdmitted;
      out.afterFlip = { runtimeAdmitted: entry.runtimeAdmitted, freshResolvedPath: window.Theater._spriteAssetPathForTest(entry) };

      // 3) RED — remount the BYTE-IDENTICAL board object (same literal shape, no cache-bust marker).
      window.Theater.setInteriorBoard(JSON.parse(JSON.stringify(baseBoard)));
      const settle2 = await waitForPieces();
      out.mount2NoBust = {
        piecesResolved: settle2.resolved, piecesRequested: settle2.requested,
        boardSkipsDelta: window.Theater.stats.boardSkips - boardSkipsBeforeRemount,
        srcCacheAfter: window.Theater._spriteTextureSrcCache[target.slug],
      };

      // 4) restored-GREEN — SAME board, this time WITH the AB-rig's own inert cache-bust marker (never
      // read by any product code — interiorBuildBoard/setInteriorBoard only ever look at their own
      // known field names) so JSON.stringify(data) genuinely differs.
      const boardSkipsBeforeBust = window.Theater.stats.boardSkips;
      const bustedBoard = JSON.parse(JSON.stringify(baseBoard));
      bustedBoard._abCacheBust = "verify-board-admission-dirty-key";
      window.Theater.setInteriorBoard(bustedBoard);
      const settle3 = await waitForPieces();
      out.mount3WithBust = {
        piecesResolved: settle3.resolved, piecesRequested: settle3.requested,
        boardSkipsDelta: window.Theater.stats.boardSkips - boardSkipsBeforeBust,
        srcCacheAfter: window.Theater._spriteTextureSrcCache[target.slug],
      };

      out.ok = true;
      return out;
    } catch (e) {
      return Object.assign(out, { error: String((e && e.stack) || e) });
    }
  }, target);
}

async function runRenderCheck(target) {
  group("1 — first mount resolves the dual-corpus slug at its starting admission state");
  const { createRequire } = await import("node:module");
  const { spawn } = await import("node:child_process");
  const net = await import("node:net");
  const require = createRequire(import.meta.url);
  let puppeteer;
  try {
    puppeteer = require(join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
  } catch (e) {
    fail++;
    console.error("  FAIL: puppeteer-core not available at ~/.genesis-jsdom — cannot run the render-mount check");
    return;
  }
  const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5241, 5242, 5243, 5244, 5245];
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
      if (await portInUse(port)) { if (await probeRoot(port)) return { proc: null, port }; continue; }
      const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] });
      for (let i = 0; i < 40; i++) {
        if (await portInUse(port)) { if (await probeRoot(port)) return { proc, port }; break; }
        await sleep(150);
      }
      try { proc.kill("SIGTERM"); } catch (e) {}
    }
    throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
  }

  let server = null, browser = null;
  try {
    server = await startServer();
    const BASE = `http://127.0.0.1:${server.port}`;
    const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=800,600"];
    browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 800, height: 600, deviceScaleFactor: 1 } });
    const page = await browser.newPage();
    const result = await bootAndRun(page, BASE, target);

    ok(result.ok, "boot + mount + setInteriorBoard sequence ran without throwing: " + JSON.stringify(result.stage || result.error || "ok"));
    if (!result.ok) return;

    ok(result.mount1.piecesResolved === 1 && !result.mount1.timedOut,
      `first mount resolved the target piece (${result.mount1.piecesResolved}/${result.mount1.piecesRequested})`);
    ok(result.mount1.srcCacheAfter === result.mount1.resolvedPath,
      `first mount's SPRITE_TEXTURE_SRC entry matches the resolved path (${result.mount1.srcCacheAfter})`);

    group("2 — RED (current, honest behavior): a registry-only admission flip + byte-identical remount is silently skipped");
    ok(result.afterFlip.freshResolvedPath !== result.mount1.resolvedPath,
      `the flip genuinely changes what spriteAssetPathFor would now resolve to (${result.mount1.resolvedPath} -> ${result.afterFlip.freshResolvedPath})`);
    ok(result.mount2NoBust.boardSkipsDelta === 1,
      `RED: the byte-identical remount (no cache-bust) was SKIPPED — stats.boardSkips advanced by exactly 1 (got ${result.mount2NoBust.boardSkipsDelta})`);
    ok(result.mount2NoBust.srcCacheAfter === result.mount1.resolvedPath,
      `RED: SPRITE_TEXTURE_SRC stays pinned to the OLD (pre-flip) path (${result.mount2NoBust.srcCacheAfter}) even though the registry now says ${result.afterFlip.freshResolvedPath} — the corpus is silently stale`);
    ok(result.mount2NoBust.srcCacheAfter !== result.afterFlip.freshResolvedPath,
      "RED, restated: the stale cached path and the fresh registry-resolved path genuinely disagree (this check is discriminating, not vacuous)");

    group("3 — restored-GREEN: the SAME flip, remounted WITH an inert cache-bust marker, self-heals");
    ok(result.mount3WithBust.boardSkipsDelta === 0,
      `GREEN: the cache-busted remount was NOT skipped — stats.boardSkips did not advance (delta=${result.mount3WithBust.boardSkipsDelta})`);
    ok(result.mount3WithBust.piecesResolved === 1,
      `GREEN: the cache-busted remount's piece resolved again (${result.mount3WithBust.piecesResolved}/${result.mount3WithBust.piecesRequested})`);
    ok(result.mount3WithBust.srcCacheAfter === result.afterFlip.freshResolvedPath,
      `GREEN: SPRITE_TEXTURE_SRC now matches the POST-flip path (${result.mount3WithBust.srcCacheAfter}) — spriteTextureFor's own per-slug self-heal works perfectly once it's actually given the chance to run`);
  } catch (e) {
    fail++;
    console.error("  FAIL: render-mount check threw: " + (e && e.message));
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
    if (server && server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

const withRender = process.argv.includes("--with-render");
if (withRender) {
  const target = pickDualCorpusSlug();
  if (!target) {
    fail++;
    console.error("  FAIL: no dual-corpus slug (status:\"cut\", legacyAsset AND candidateAsset both present) found in data/sprite-registry.js — cannot run this check");
  } else {
    console.log(`(target slug: ${target.slug} / "${target.name}")`);
    await runRenderCheck(target);
  }
} else {
  console.log("\n(skipping — pass --with-render to boot real headless Chrome + THREE and exercise the repro)");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
