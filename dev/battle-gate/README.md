# dev/battle-gate — battle-UI polish loop: the screenshot GATE HARNESS

Round 0 of a battle-UI polish loop (see `ACCEPTANCE.md` for the bar Adam set). This harness drives
the REAL `genesis.html` (never a mock page) through world creation and into a live fight in a real
headless Chrome, then screenshots the battle-stage layout at the states the acceptance criteria care
about. The orchestrator judges the pixels; this harness's only job is to get honest, representative
pixels + metrics in front of them.

## Run it (one command)

```
node dev/battle-gate/capture-stage.mjs
```

That's it — the script serves this worktree, boots two independent browser sessions (one for
stage-mode capture, one for the classic-fallback capture), drives each through guided character
creation into a live fight, screenshots, writes `round0/metrics.json`, and tears down the server. No
flags are required for a normal run. Optional env overrides:

| env | effect |
|---|---|
| `BG_PORT=NNNN` | pin the serve port (default: probes 5181→5185) |
| `BG_KEEP_SERVER=1` | leave the `python3 -m http.server` running after the script exits |
| `BG_ANGLE=1` | force `--use-angle=swiftshader` on the very first Chrome launch (skip the default-ANGLE probe) |

## What it shoots — `dev/battle-gate/round0/`

| file | what |
|---|---|
| `stage-1440.png` | full page, 1440×900, live fight, battle-stage mode |
| `stage-1280.png` | same live state, resized to 1280×800 |
| `stage-right-rail.png` | clipped to `.stage-feed-col`'s bounding box |
| `stage-composer.png` | clipped to `.dm-input` + 12px margin |
| `classic-fallback.png` | a SEPARATE fresh page/world/fight with the theater disabled — the classic combat-panel layout (`assets/battle/arena.png` grid) |
| `explore-1440.png` | in-session, no fight yet — sanity baseline for the normal explore layout |

Plus `metrics.json` — every measurement the acceptance criteria need (canvas rect/aspect/backing
size, right-rail readability numbers, composer geometry, page-scroll invariant, band-rail occupancy,
classic-mode arena.png HTTP status, console errors per mode). See its own top-level keys; each mirrors
one bullet in `ACCEPTANCE.md`.

## Port discipline (never break a live session)

- Never uses **5175** — a live DM bridge (`dev/dm-bridge.py`) may be serving there; this harness's own
  static server would either collide or (worse) get silently ignored while the bridge's mailbox
  routes are hit with requests they don't expect.
- Never uses **5178** — that's `dev/model-qa/capture.mjs`'s port; a parallel model-QA capture run
  could be using it.
- Probes **5181 → 5185**, and (like `dev/model-qa/capture.mjs`) will only *reuse* an already-listening
  port if a quick `fetch` of `genesis.html` confirms it's actually serving THIS tree — never blindly
  assumes a listening port is "close enough."
- Kills its own spawned `http.server` process on exit (success or failure) unless `BG_KEEP_SERVER=1`.
- Never touches `dev/dm-bridge.py`, never runs `dev/verify-bridge.py`, never reads/writes anything
  under `.dm/`. The world(s) this harness creates live only in the headless browser profile's own
  IndexedDB/localStorage (a fresh Puppeteer profile each launch) — they never touch your real browser
  profile or any saved Genesis world you play in normally.

## How it gets from a fresh page load into a live fight

This is the part worth reading if you're extending this harness. The mission target is the REAL app,
not a fixture page — but the guided-creation flow (`startBardo()` → species/class/background/scores/
skills/equipment/tools/languages/spells/feat/life/hometown×3/worldbeats×N/found) is ~20-30 steps deep.
Rather than drive that with literal DOM clicks (brittle, and this repo already has a proven pattern for
exactly this), `bootToInSession()` in `capture-stage.mjs` calls the app's own global functions inside
the page via `page.evaluate()` — the same functions a player's click would invoke
(`cgChoose`/`bardoRollScore`/`bardoAssign`/`cgSkillAuto`/etc.), auto-filling each step "choose for me"
style. This mirrors `dev/gauntlet-1-clicks.mjs`'s `stageGuidedCreation`/`autoFillBardoStep` almost
verbatim — that file stages the same flow inside jsdom for the click-sweep gauntlet; this harness
stages it inside a REAL browser so the REAL IndexedDB/ES-module theater boot are exercised for real.
No product code is bypassed or mocked — every function called is one the real UI wires to a real click.

Once `bardoFound()`/`bardoWake()` lands (a living PC exists in `activeWorld()`), the harness calls
`showTab('world')` (the same handler the World rail button calls) to enter the in-session layout, then
starts a fight the same way the DM bridge does — `applyEvent(world, {type:"combat_start",
payload:{foes:[...]}})` — mirroring `dev/verify-combat-lifecycle.mjs`'s canonical payload shape, using
real bestiary slugs (Goblin/Wolf) proven safe by that harness's own fixtures.

## The classic-fallback capture — how "disable the theater" actually works

`docs/BATTLE-THEATER.md` / `src/world/render.js` gate battle-stage mode on
`window.Theater && typeof window.Theater.mount==="function"` (read `theaterStageSync` in
`src/world/render.js`) — there is no separate `GS.flags.theater` kill switch anywhere in the shipped
code (checked by grep; none exists). So `disableTheater()` forces the classic path the same way a
genuinely WebGL-less browser would: it retires any live Theater instance, then sets
`window.Theater = undefined` and `GS.theaterMounted = false` **before** `combat_start` fires, so
`theaterStageSync`'s own `hasTheater` check reads false for the whole fight — the real, documented
degrade path, not an invented flag.

## A real WebGL-in-headless gotcha this harness had to solve (worth knowing before you extend it)

Puppeteer runs headless Chrome, so — same as `dev/model-qa/capture.mjs` — this harness launches with
default ANGLE first and, IF the battle-stage canvas ever looks blank for the full poll window, kills
the browser and relaunches with `--use-angle=swiftshader` before retrying the whole boot+fight once.
In practice the default ANGLE path has rendered correctly on every run of this harness.

Separately (NOT a headless-only issue — this is a genuine app-level gotcha independent of Puppeteer),
sampling the *live* theater canvas's pixels from OUTSIDE its own render loop (`ctx2d.drawImage(liveCanvas,
...)` then `getImageData`) reads back **empty/black** even when the compositor is showing a fully
painted board — because `src/ui/theater-boot.js`'s `THREE.WebGLRenderer` is constructed without
`preserveDrawingBuffer:true`, so the drawing buffer clears immediately after each present.
`dev/model-qa/capture.mjs`'s own header comment already documents this exact failure mode for its
scene-mode shots ("sampling a live WebGL canvas after present reads black... even when the compositor
shows a full scene") and works around it by having ITS OWN fixture page stash a same-frame snapshot
into a `#scene-probe` element — that page-cooperation trick isn't available here since `genesis.html`
is real product code this round must not touch. This harness's `canvasHealth()` instead takes a
Puppeteer **element screenshot** of the canvas (which correctly reads the compositor — proven, since
the full-page screenshots this same harness takes are correct) and feeds that PNG back into the page
as a plain `<img>` data URL for sampling — a plain `<img>` has no WebGL drawing-buffer-clear gotcha.
If you ever see `meanLum` reading suspiciously near zero on a screenshot that visually looks fine,
this is almost certainly the culprit; do not "fix" it by loosening the blank-canvas threshold instead
of using this sampling approach — see `canvasHealth()`'s inline comment for the full diagnosis.
