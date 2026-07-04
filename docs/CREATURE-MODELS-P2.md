---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — Phase 2 of the model-coverage program; Wave 1 (monstrosity) build-ready
created: 2026-07-04
related:
  - "[[MODEL-GRAMMAR]]"
  - "[[P1-WIRING]]"
  - "[[DESIGN-GUIDE]]"
---

# CREATURE-MODELS-P2 — the 66 net-new bespoke monsters

## §0 Context (why this exists)

Phase 1 (master `cb8074e`, `dev/model-qa/creature-coverage-audit.mjs`) lifted live-combat model
coverage 32% → 87% by aliasing 280 monsters to existing silhouettes. The residual **66 monsters
have NO honest existing silhouette** and need net-new whole-object models. They cluster in four
exotic types: **Monstrosity 21, Aberration 22, Fiend 14, Celestial 9.** This spec is the turn-key
build contract for all 66; **Wave 1 (4 monstrosities) is fully detailed and build-ready below.**

## §1 What a creature model IS (the authoring contract)

Each model is ONE bespoke ES module `dev/model-qa/creatures/mon-<slug>.js` exporting one function
`build<Name>()`, authored as a landmark table calling `../probe-lib.js` primitives — the SAME
grammar every shipped creature uses (exemplar: `dev/model-qa/creatures/mon-lizard.js`, read it
first). **Whole-object grammar (non-negotiable, MODEL-GRAMMAR §4b):** one function, one merged
geometry frame, NO anchors, NO part-object transforms — nothing can float or land 90° wrong.

**probe-lib.js API (import from `../probe-lib.js`):**
- `V(x,y,z)` → THREE.Vector3.
- `quad(a,b,c,d,hex,jitter=0.07)` — one flat quad (the atom; everything reduces to this).
- `tube(a,b,ra,rb,n,hex,opts)` — a tapered tube from a→b, radius ra→rb, n sides. `opts`:
  `{phase, raz, rbz, capA:{hex,lift}, capB:{hex,lift}}` (raz/rbz = elliptical z-radius).
- `ring(c,axis,rx,rz,n,phase)` / `stitch(rings,colFn,skip)` / `capFan(rng,apex,hex,flip)` — loft a
  banded surface (head/torso masses); `stitch`'s colFn is `(bandIndex)=>hex`.
- `stack(bands,n,opts)` / `blob(cx,cy,cz,rx,ry,rz,hex,n,bands)` — quick ovoid masses.
- `setChannels(map)` — OPTIONAL hex→material-channel map (skin/cloth/leather/bone/metal/…); improves
  PS1 material read. Untagged quads default to channel 0 (fine). Use it for obvious material splits.
- Authoring writes straight into the buffers; the module body just calls primitives (no return).

**Palette:** VS-desaturated (dirty, low-saturation) per DESIGN-GUIDE — mottled, never candy. Read
`mon-lizard.js`'s `P` block for the register. **NO eye quads** (house ruling reversed 2026-07-04 —
skulls/sockets are shape, not painted eyes).

**Base disc + size law (§1 of theater-figures.js):** every module ends with a base disc sized to
the bestiary `size`: Small 0.32 · Medium 0.42 · big-Medium 0.48 · Large 0.55 · Huge 0.68 ·
Gargantuan 0.72. The module's authored absolute geometry already encodes size (the whole-object
path never applies `sizeScaleFor`).

## §2 Registration (THREE places — all required for a model to go live)

For each new `mon-<slug>.js` with `build<Name>()`:

1. **The module** — `dev/model-qa/creatures/mon-<slug>.js` (per §1).
2. **The visual gate** — add a row to the appropriate SET in `dev/model-qa/ps1-sheet.html`'s `SETS`
   object: `{name:'<NAME>', file:'mon-<slug>.js', fn:'build<Name>'}`. Wave sets: add a `p2mon` set
   for Wave 1 (create it if absent).
3. **The engine registry** — add to `WHOLE_OBJECT_REGISTRY` in `src/ui/theater-figures.js`, keyed by
   the EXACT bestiary id: `"<slug>": { module: "../../dev/model-qa/creatures/mon-<slug>.js", fn: "build<Name>", discR: <size-law radius> }`.
   If a Phase-1 NEAREST_SUB alias currently points AT this slug's target as a stand-in, leave it —
   a direct registry key wins over an alias (resolveWholeObject checks direct first).

## §3 The gate (acceptance — VISUAL, per the design-mockup-port lesson)

Geometry is judged by eye, not by a unit test. Acceptance per model:
1. `python3 build/check-manifest.py` → `RESULT: OK` (theater-figures.js is a module edit).
2. `node dev/verify-theater-figures.mjs` → all pass (proves the builder resolves + loads a real fn;
   this is the "does it wire" check — the resolution-chain + completeness asserts).
3. **The render gate (orchestrator-run):** `node dev/model-qa/proof-sheets-capture.mjs` (or a
   targeted `ps1-capture.mjs --set p2mon`) → the orchestrator READS the PNG and judges the
   silhouette against the §Wave brief. First passes are often blocky (racecls F2/F3 precedent) — a
   fix pass is expected, not a failure. The bar: **reads as the creature at a glance, on its disc,
   VS-grit, no floating parts, no candy color.**

Mutation-testing (rubric item 7) does not apply to geometry authoring — it is not a behavior
change. The resolution harness (check 2) is the regression guard.

## §4 Out of scope

- No `data/bestiary.js` edits (ids already exist). No `sizeScaleFor` changes. No renderer/shader
  edits (theater-boot.js untouched — models feed the existing pipeline). No NEAREST_SUB deletions
  (a direct key already wins; leave the alias as harmless fallback). No animation/verbs.

## §5 The queue (66 units, waved by shared silhouette base)

Ordered by play-frequency (monstrosities/beasts hit wilderness+dungeon most; fiends/celestials are
rare high-band). Group headers name a reusable base a later unit can lift from.

**WAVE 1 — monstrosity proving set (4, build-ready, each seeds a base):**
| slug | size / discR | silhouette brief (the read) |
|---|---|---|
| `manticore` | Large / 0.55 | Lion-bodied quadruped + bat wings + a scorpion-spike tail that arcs over the back; human-ish snarling face. Seeds the winged-quadruped base (chimera, sphinxes). |
| `bulette` | Large / 0.55 | Armored land-shark: hunched armored quadruped, huge fin/plate cresting the back, blunt shovel head, thick digging claws. Seeds the armored-burrower base (umber-hulk-adjacent). |
| `hook-horror` | Large / 0.55 | Bipedal beetle-brute: hunched carapace torso, vulture-ish beaked head, two long arms ending in big curved HOOKS instead of hands. Seeds the arthropod-biped base (umber-hulk, grell-adjacent). |
| `purple-worm` | Gargantuan / 0.72 | Immense segmented burrowing worm reared up in an S-curve, ringed body segments, a round maw ringed with teeth at the top. Seeds the worm/tube base (remorhaz, carrion-crawler). |

**WAVE 2 — monstrosity remainder (17):** abominable-yeti, ankheg, axe-beak, behir, carrion-crawler,
chimera, displacer-beast, drider, giant-axe-beak, hydra, kraken, merrow, remorhaz, tarrasque,
umber-hulk, yeti, yuan-ti-abomination. (Lift Wave-1 bases: worm→remorhaz/carrion-crawler;
armored-burrower→umber-hulk; winged-quad→chimera.)

**WAVE 3 — aberration (22):** the chaos-frogs (blue/green/gray/red/death — one frog base, 5 tints),
fish-folk ×3 (one base + weapon swap), mind-thief ×2, void-monk ×3 (humanoid base + robe), grick +
grick-ancient (one base), grell, roper, otyugh, cloaker, eye-tyrant, elder-deep-thing, mind-thief,
astral-raider-dracomancer. (Heavy base-sharing — ~10 real bases cover 22.)

**WAVE 4 — fiend (14):** lemure/manes (blob base), barbed-devil/chain-devil (horned-humanoid base),
erinyes/succubus/incubus/cambion (winged-humanoid base), the yugoloths (arcanaloth/mezzoloth/
ultroloth/yochlol), night-hag, rakshasa. (Winged-humanoid + horned-humanoid bases cover most.)

**WAVE 5 — celestial (9):** deva/planetar/solar/empyrean/empyrean-iota (winged-humanoid, radiant
channel), the three sphinxes (winged-quad from Wave 1 base), unicorn (warhorse base + horn).

## §6 Build + verify (per unit)

1. `git checkout -b feat/model-<slug>` off master (Wave 1 units are INDEPENDENT — parallel worktrees).
2. Author `mon-<slug>.js` per §1 (read `mon-lizard.js` + the §Wave brief; ≤ ~200 lines).
3. Register in all THREE places (§2).
4. `python3 build/check-manifest.py` → OK. `node dev/verify-theater-figures.mjs` → all pass.
5. Report branch + SHAs + files + harness tails. Do NOT merge — the orchestrator gates the render
   and lands the `--no-ff` merge.

## §7 Decisions (flag only to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | Aliases stay even after a bespoke model lands | direct registry key wins; alias is harmless fallback (§2.3) |
| 2 | Visual gate, not unit test, is acceptance | geometry is taste; the mockup-port lesson (side-by-side, not prose) |
| 3 | Heavy base-sharing in waves 3–5 | one frog/fish/void-monk/winged base seeds many — cuts 66 real builds to ~35 distinct silhouettes |
| 4 | Wave order = play-frequency | monstrosities/beasts hit play most; fiends/celestials rare high-band |
