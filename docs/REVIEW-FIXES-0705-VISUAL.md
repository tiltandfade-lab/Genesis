---
type: fix-spec
project: Genesis
status: SPECCED — rulings by Fable (2026-07-05); build-ready
provenance: deep /code-review PASS 2 over the battle-visual arc (0943071..HEAD, ~9.4K lines —
  theater-boot/parts/figures/verbs/theater-data/render.js, never previously reviewed);
  8 render-tuned finder angles → adversarial verify; 11 survivors (8 CONFIRMED, 1 PLAUSIBLE-
  confirmed-in-note, 2 latent-LOW). Anchors re-pinned against post-wave-1 master (578936b).
updated: 2026-07-05
---

# Review-Fixes (VISUAL) — the battle-theater arc

The first-ever review of the 2026-07-03→04 renderer core. The survivors cluster into two
subsystems: the **GL lifecycle** (shared-material corruption, undisposed texture cache, tween/FX
survival across board swaps) and **builder determinism** (Math.random in creature geometry).
These are also the hard prerequisite for the BESTIARY-MANUAL lazy grid (docs/BESTIARY-MANUAL.md).

**Note for executors:** theater-boot.js is the sealed ES-module (the ONE exception to
classic-globals); theater-verbs.js is its ES sibling. Post-U2 line anchors verified 2026-07-05.

## The queue (wave 2)

| unit | branch | files | depends on |
|---|---|---|---|
| W2-A | `fix/theater-gl-lifecycle` | src/ui/theater-boot.js, src/ui/theater-verbs.js | — |
| W2-B | `fix/creature-builder-determinism` | dev/model-qa/creatures/*.js (grep-sweep), src/engine/theater-data.js (one comment) | — |
| W2-C | `refactor/bestiary-resolve-index` | per docs/REVIEW-FIXES-0705.md §U6 (unchanged; run it as written) | — |

Disjoint file sets — all three run parallel. The BESTIARY manual (wave 3) builds only after W2-A
lands.

---

## W2-A — the GL-lifecycle unit (findings 1,3,4,6,10,8 + 2,5)

### A1. Shared-material corruption by hurt/down verbs (CONFIRMED HIGH)
`wholeObjectMaterialsFor` memoizes ONE material array per opacity in `WHOLE_MATERIALS_CACHE`,
shared by every whole-object figure at that opacity. `setUnits` knows this (its D8 guard skips
`desaturateGroup` for `isWholeObject`), but `vHurt` (theater-verbs.js:226) and `vDown` (:257)
`traverse` and `material.color.setRGB(...)` with NO shared guard — one goblin taking damage
flashes/greys every co-sharing figure on the board, and concurrent tweens race on the same
`material.color`.

**⚑ RULED — clone-for-tween, not skip.** Whole-object figures are now ~100% of creatures; the
D8-style "skip for whole-object" would kill the hurt flash game-wide. Instead: at verb start, for
every mesh whose material will be color-mutated, if the material is shared (tag shared materials
`userData.shared = true` at the cache — `disposeMeshMaybeShared` already respects that
convention), swap in `material.clone()` (tag the clone `userData.tweenClone = true`), mutate the
clone freely, and on tween cleanup (`onDone`) dispose the clone and restore the original.
Non-shared materials keep the current direct-mutation path (cheap, correct). The clone must copy
`map` by reference (never clone the texture).

### A2. Tweens/FX survive board and unit swaps (CONFIRMED HIGH ×2 + MED + LOW)
- `setUnits` (theater-boot.js:3660) disposes unit meshes via `clearGroup` while live tweens in
  `S.tweens` still close over those Object3D/material handles → stale mutation + `onDone` against
  torn-down state.
- `setBoard` (:3334) clears only tile/prop groups — never `S.fxGroup` or `S.tweens` → a new board
  inherits the old board's debris/glyphs, still animating (obliterate debris, cast glyphs).
- `retire` (:3953) cancels the rAF loop then disposes, abandoning in-flight tweens' `onDone`
  (latent use-after-dispose for future async verbs).

**⚑ RULED — force-drain, one helper.** Add `drainTweens(S)` (theater-boot.js, beside
`startTweenLoop` :3627): synchronously run each live tween's cleanup/`onDone` (guarded try/catch,
same posture as `tickTweens`) and empty `S.tweens`. Call it FIRST in `setUnits`, `setBoard`
(which additionally `clearGroup(S.fxGroup)`), and `retire` (before any dispose). Tweens are
sub-second; forced completion on a swap is visually correct. With A1's clone-restore in `onDone`,
draining also restores shared materials before disposal — the two fixes compose.

### A3. PIXEL_SKIN_CACHE never disposed + textures retained forever (CONFIRMED HIGH + MED)
`PIXEL_SKIN_CACHE` (:730) retains every CanvasTexture ever minted (key space is
part:channel:variant:colorHex × realm grading) and `retire()` never touches it — asymmetric with
`disposeWholeObjectCaches` (:3939), which got the D7 treatment.

**⚑ RULED — dispose at retire + bounded LRU.** (a) In `retire()`, dispose every cached texture
and empty the cache (symmetric with D7). (b) Convert the cache to a bounded LRU, **cap 128**
entries: on insert past cap, dispose + evict the least-recently-fetched (a `Map` gives ordered
re-insertion for free). 128 comfortably covers a board's live variety while bounding a long
session. `figureMaterialFor` (:781) is the only consumer — touch nothing about its signature.

### A4. discR falsy-zero (LOW, latent — one line)
`figure.userData.wholeObjectDiscR || 0.42` (:3848) silently replaces an intentional `discR: 0`
with 0.42. Fix: `!= null ? : 0.42` (and the same guard where it's stamped from `wEntry.discR`).

**Out of scope:** any verb's motion/timing values; the PSX shader; figure geometry; adding new
verbs; theater-data.js.

### Verification (extend dev/verify-theater-verbs.mjs; jsdom asserts on the plain-object state —
no real GL needed for the cache/tween checks)
1. ⊗ RED-FIRST (A1): two whole-object figures sharing a material; run `vHurt` on one to
   mid-tween; assert the OTHER figure's material color is unchanged. Prove it fails pre-fix.
2. (A1) after the tween completes: the hurt figure's material is the ORIGINAL shared instance
   (restored), and the clone is disposed (`.disposed` flag via a dispose-spy, or absence from the
   mesh).
3. ⊗ RED-FIRST (A2): start a tween, call `setBoard` → assert `S.tweens.length === 0` AND
   `S.fxGroup.children.length === 0`; same for `setUnits` (tweens drained). Prove pre-fix red.
4. (A3) mint >128 distinct skin textures → assert cache size ≤ 128 and evicted textures got
   `dispose()` called (spy). `retire()` → cache empty, all disposed.
5. (A4) a figure with `wholeObjectDiscR: 0` renders a 0-radius disc (assert the stored value, not
   0.42).
6. Full sweep: `verify-theater-verbs`, `verify-theater-figures`, `verify-theater-data`,
   `verify-battlemap`, `verify-theater-lighting` green; `check-manifest.py` OK.
7. VISUAL (orchestrator): re-render a battle capture with a hurt flash mid-frame if the capture
   rig allows; otherwise the sheet re-render suffices as a no-regression check.

---

## W2-B — builder determinism (findings 7,11 + the sweep's third hit + 9)

`Math.random()` in whole-object creature builders makes the SAME creature render differently
across sessions/reloads (geometry is cached per page-load only) — against the engine-owns-rolled-
facts doctrine and the builders' own "deterministic, no Math.random" contract. Known offenders:
`rlm-corrosive-splice-ooze.js:49`, `rlm-the-unfinished-cathedral-made-flesh.js:107`,
`prop-sin-eaters-bowl-stand.js` (found by sweep — the finders' lists are NOT exhaustive).

**Fix by SWEEP, not by list.** `grep -rn "Math.random" dev/model-qa/creatures/` and fix EVERY
hit: replace each with a deterministic positional pick derived from the loop index / vertex
position (e.g. `(i % 2)`, or a tiny integer hash of the spot coordinates — match the
`theaterLightSeedHash` discipline). The visual intent (variety across spots) must survive; the
variety just becomes fixed per spot instead of per build.

**Rider (finding 9):** theater-data.js:1188 comment claims light armor gets "no armor module" but
`THEATER_ARMOR_BAND_MODULES.light` (:1201) emits a pauldrons module. Fix the COMMENT to match the
code (the code is the shipped intent — `none` is the empty band).

**Out of scope:** any actual geometry/silhouette change; new decoration logic.

### Verification (new dev/verify-creature-determinism.mjs, or extend verify-theater-figures)
1. ⊗ RED-FIRST: build each formerly-offending creature's geometry TWICE in fresh contexts →
   assert identical vertex counts AND an identical hash of the color/position attributes. Prove
   at least one pre-fix red (the ooze's bubble quad).
2. Grep-gate: `Math.random` has ZERO hits under `dev/model-qa/creatures/`.
3. Full `verify-theater-figures` + a capture-sheet spot render of the 3 fixed creatures
   (orchestrator eyeballs: decorations still present, nothing bald).

---

## W2-C — U6 as specced

Run docs/REVIEW-FIXES-0705.md §U6 exactly as written (bestiaryResolve + lazy slug index +
bestiaryActivityOf; replace 5 sites; determinism diff is the gate). Anchors there were verified
against the same tree and are unaffected by wave 1's landings except combat.js — re-grep
`resolveCreature` (combat.js) before starting; U5 landed `cmStampFoeStory` in that file.

---

## Banked from pass 2 (not this wave)
- The retire()/drain interaction beyond A2's helper (finding 10 is covered by A2; no further
  work unless a future async verb lands).
- Any LRU tuning beyond cap-128 (measure in the bestiary manual's soak, then revisit).
