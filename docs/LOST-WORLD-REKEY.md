---
title: LOST WORLD re-key — the deep-time saurian dominion
type: design-note
status: DRAFT — awaiting Adam's taste pass
branch: craft/lost-world-rekey-draft
date: 2026-07-08
---

# LOST WORLD re-key — from elegy to struggle

Adam's ruling (2026-07-08): re-key the LOST WORLD realm off "vanished civilizations / dead
antiquity" and onto a **deep-time saurian-dominion key** (the 65,000,000-BC register — serial
numbers filed off; no franchise names appear anywhere in the tables). The elegiac "a wonder that
outlived everyone who built it" is retired. The new register is a live power struggle in a world
that is not yours.

This note is the DRAFT spec for the re-key. Everything here is **PROVISIONAL — awaiting Adam's
taste pass.** No generated artifacts were touched; no recompiles were run.

## The key in prose — three strata

The realm stacks three layers of time, and the game can dig down through them:

1. **The scaled court (the present power).** An advanced saurian civilization rules the valley
   right now. It has cities, castes, obsidian tooling, penned beasts, and a tithe. It does **not
   consider mammals people** — not with malice, mostly, but the way you don't consider a rat a
   citizen. Humankind is the clever vermin in the high country: scrabbling foragers, delvers, and
   tithe-bearers, with a rebel edge that the court calls vermin-culling and the clans call the war.
   The "yet" in the register is load-bearing — the court's contempt is a thing that could change,
   and the player is the reason it might.

2. **The ones before the scales (the ruined predecessors).** Every ruin, monument, tomb, and idol
   that already existed in the realm **survives the re-key, demoted one stratum down**: these are no
   longer "the lost civilization" — they are the works of whoever came *before the saurians*. Even
   the great lizards walk on somebody's bones. This is the KEEP-NOT-TRASH move: the existing
   ruin-content stays exactly as authored mechanically, reframed as older-than-the-current-rulers
   rather than the top of the timeline.

3. **The impossible layer beneath (the mystery stratum).** Below the predecessors, hints of an
   *ascended / floating magocracy age* — the ones who lived above the weather. It is **seeded, never
   stated**: a stone that still hums, glyphs that rearrange themselves politely when read wrong, a
   shard of something that fell from higher than any mountain, glass that has not clouded in an age.
   Restricted to **high-band rows only** (Mythic / high-band Strange). The player should feel it
   before they can name it, and there is no proper noun for it anywhere in the tables.

**Volatile force of the realm:** volcanic/ashen doom hangs over everything — ash on the wind that
isn't from any fire you lit, the mountain always about to open. (Seeded in the realm voice + item
notes; the full Volatile-force wiring is a taste-pass question, see below.)

## Per-surface changes

### `data/realms.js` — the `lost-world` entry (DONE)
- `register:` rewritten from the elegy to the struggle: the scaled court rules and does not count
  you as people *yet*; humankind is vermin in the high country; the mountain is always about to open.
- `voice:` all four cues re-keyed (verdict-passed-over-your-head / mammal-warren-under-a-giant's-
  footprint / ash-on-the-wind / older-stone-beneath-the-old-stone-humming — the last is the Zeal seed).
- `render:` block **unchanged** (sat 1.00, tint #c89a3c, tintAmt 0.15, contrast 1.05) — the warm
  gold grade still reads for a sun-baked deep-time valley.
- `check-manifest.py` re-run: **RESULT OK** (only the pre-existing unrelated layer WARNs).

### `Engine/03. _Tables/05. Realms/Realm Items - Lost-World.md` (DONE)
- **Mechanics / frames / bands FROZEN.** Only fiction reflavored; ADAM-REVIEW-2 §3/§3b doers-only
  compliance carried forward unchanged.
- Rows 1–50 reflavored across the three strata: predecessor finds now read as pre-scale works;
  court presence (tithe-scribes, wardens, scholars who scrape inconvenient text away) threaded into
  the notes; Zeal seeds placed on high-band rows only (24 humming clear-glass hourglass, 43 lamp
  answering from the deep, 27 rewritten as the impossible-layer wonder).
- **Row 27 (Mythic)** is now explicitly the pre-scale / impossible-layer wonder (the d4 = the sky-
  charter / impossible orrery / uncloudable vault-seed / self-rearranging history-tablet). Ranks and
  L9/L12 mechanics unchanged.
- **Row 45 (Signature)** — the scenario anchor (BATCH3-GUARDRAILS J2's Fenced Valley, techWorks +
  huntRules) re-keyed as the **scaled court's dinosaur game-preserve** where the great lizards were
  penned before the fences failed. Mechanics unchanged; this is now the cleanest fit the anchor has
  ever had.
- **Four new-key rows appended, die grown d50 → d54** (verified contiguous 1–54, no gaps/dupes):
  - **51 (Grounded)** obsidian court-blade — `scimitar` frame — court-made current tech (doer).
  - **52 (Textured)** saurian tithe-cutter — `dagger` frame — obsidian tool/weapon (doer); carrying
    it openly marks you as someone who deals with the scales.
  - **53 (Textured)** court passage-token — `robe` frame — the "counted stock, not prey, not people"
    token; downgrades a court creature's reaction one step for one exchange.
  - **54 (Strange)** the mount rig — `robe` frame — "a saddle for something that shouldn't be
    saddled"; the dino-mount seam (see note below).

### `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Role Skin - Lost-World.md` (DONE)
- **35-row spine, all weights, the Pampered-elite hard-drop, and the [ADD] convention all preserved
  intact.** Only labels reflavored + the reweight rationale re-justified in the new key's terms.
- Spine labels re-keyed to the mammal underclass the party moves among (foragers, delvers, tithe-
  porters, obsidian-knappers, egg-runners, sky-cult zealots — the Zeal seed at archetypes 25/26).
- **Adds reworked to inject the saurian layer + the new archetypes Adam named:** Scale-court
  overseer + Court scholar-scale (the ruling scales), Beast-tamer, Hill-clan rebel, Tribute-bearer,
  plus Keeper-of-the-deep-voice (Zeal seed). Count, classes, and weight conventions kept.

## `data/realm-bestiary.js` — AUDIT ONLY (no edits; models lane owns this file)

120 entries in the `lost-world` section. The re-key is kind to almost all of it — the tomb/ruin/
guardian roster simply becomes the works and wardens of the **ones-before**, and the realm already
ships a real dinosaur spine. Recommendations for the models/engine lane:

**KEEP AS-IS (reads correctly under the new key, no reflavor needed):**
- The whole **dinosaur spine** — it is now the realm's living present, not set dressing:
  Raptor of the Ruined Plaza / Sun-Baked Scrap Raptor / Feathered Sickle-Claw / Sickle-Toed Ambush
  Runner / Raptor Pack-Hunter (allosaurus, giant-lizard, axe-beak, wolf frames), Living Armor-Back
  (ankylosaurus), Horned Terror / Triceratops, Apex Titan-Lizard / Tyrannosaurus Rex, Allosaurus,
  Pteranodon Screecher. These are the court's beasts, prey, and mounts-to-be.
- All **ruin guardians / undead / constructs** — reframe verbally (DM voice) as the ones-before's
  works, not the current rulers': Sand-Choked Sentry, Cracked Watch-Idol, Plinth-Fused Sentinel,
  Marching Colossus, Ever-Marching Automaton King, The Standing Monument, Caretaker-construct kin,
  mummy/wight/ghast/skeleton lines, the naga/sphinx wardens. No stat or model change.

**REFLAVOR (verbal only — text-layer/`flavor`/`desc` reword, no model change; models lane may
batch these into a future text pass):**
- **Snake-Cult / serpent-cult humanoids** (Snake-Cult Zealot, Snake-Cult Priest of the Hollow Coil,
  Sun-Cult Acolyte, Dead-Tongue Initiate, Whisper-Idol Cultist, Death-Cultist Herald, Archpriest of
  the Dead Liturgy): the strongest re-key candidates. Point their worship at **the ones above / the
  layer beneath** (the Zeal seed) rather than a generic dead sun-god — this is where the mystery
  stratum earns cult NPCs.
- **Scaled/serpent humanoid frames** (Scaled Temple-Guard [orc-warrior], Feather-Cloaked Sentinel
  [hobgoblin], the yuan-ti-framed zealot): re-read as **low-caste court soldiery** rather than
  cultists — the visual is already right for the scaled court.
- Egypt-flavored proper nouns (Anubis's Jackal-Priest, "the Mummy", the god-king apex line) still
  work as the ones-before's relics, but their flavor text leans hard on a specific dead-Egypt read;
  a light reword toward stratum-neutral deep-time would tighten coherence.

**NEW TARGETS for the models lane (net-new bespokes; none exist yet):**
1. **Saurian warrior-caste** — the court's soldiery as a proper bipedal saurian, NOT a reskinned
   orc/hobgoblin. Obsidian weapons, upright carriage, contempt in the silhouette. (~CR 1–3 mook/elite.)
2. **Saurian scholar/overseer-caste** — the counting, cataloguing ruling scale; a thinker
   silhouette (robed/adorned, tool not weapon). Pairs with the Court-scholar NPC add. (~CR 2–4.)
3. **Rideable dino mount ×2–3** — mounts sized for a mammal rider: a fast **raptor-mount** (light,
   Medium/Large), a **ceratopsian charger** (heavy, the tank), and optionally a **pack-hadrosaur**
   (the utility/hauler mount). These are creature entries the mount rig (item 54) attaches to under
   SRD mounted-combat rules. The allosaurus/triceratops frames already in the roster can be the
   starting geometry.
4. **One Zeal-stratum sentinel** — the guardian of the impossible layer beneath. Must read as of a
   *different make* than the ruin-constructs above it: too-clean geometry, a value/material that
   doesn't belong to either mammal or scale, faintly luminous. High-band only (~CR 8–13). This is
   the single model that must carry the mystery stratum visually.

## Dino-mount mechanics note (craft, not engine)

Adam ruled dino mounts IN. The re-key implements the **seam**, not a new subsystem:
- **SRD mounted-combat rules already exist** — mounts are handled by the DM off SRD "Mounted
  Combat" (controlled vs. independent mount, mount/dismount cost, the mount's own actions). No engine
  work is required to *ride*.
- A mount is therefore just **a creature entry** (the rideable dino targets above) **plus an item
  seam**: item 54 (the rider's rig) is the craft object that lets an already-tamed beast be ridden;
  it explicitly does **not** tame — taming is a DM-adjudicated Animal Handling arc, and the
  Beast-tamer NPC add is the in-world route to it.
- The court reads a mammal in a great lizard's saddle as an unbearable joke, then a threat — the
  mount is a faction-clock lever, not just a stat line.

## Open taste questions (for Adam)

1. **Court contempt vs. playability.** How hard should "does not consider you people" bite at the
   table? Straight-up unspeakable-to (the party is livestock) reads strong but can wall off social
   play. The current draft leaves a "yet" — the token (item 53) and the circlet (item 47) are the
   pressure valves. Right amount of valve?
2. **Zeal explicitness ceiling.** Draft keeps the layer-beneath strictly seeded (high-band rows,
   no name). Confirm it should *never* resolve to a stated cosmology in this realm's own tables —
   or is there a single Mythic payload where the player is allowed to actually touch it and know?
3. **Volcanic Volatile force.** Seeded in voice/notes only right now. Should the re-key add a
   realm-level volcanic clock/hazard (ash-fall, the mountain opening) as an explicit Volatile-band
   mechanic, or keep it atmospheric and let the DM fire it?
4. **Bestiary reflavor scope.** The audit recommends verbal reflavor for the cult/serpent-humanoid
   lines and 4 new bespokes. Confirm the new-target priority order and whether the cult reword
   should happen in this craft lane (text) or ride entirely with the models lane.
5. **Serial-numbers check.** No franchise proper nouns used (no "Reptite", no "Zeal"; the strata are
   "the scaled court" / "the ones before the scales" / "the ones above / the layer beneath"). Do you
   want fixed coined proper nouns for any of the three strata, or keep them descriptive-only?

## RESOLVED — Adam's rulings (2026-07-08 night)
1. **Court contempt bites by APPROACH, not flat:** "a magic party full of social magic can do
   pretty much anything, but if you're a guy with a big sword? You're probably going to fight a
   monster in a pit for entertainment." Social/arcane finesse can transact with the court;
   martial-read outsiders get the pit. DM guidance line, not a stat gate.
2. **Zeal stratum: strictly seeded** — no explicit discovery row.
3. **The volcanic clock lives in REALM-HOOKS** (specced separately per tonight's ruling): a clock
   that surfaces and ticks through play — hooks you can catch wind of — never ambient-lethal
   ("not going to just kill you for hanging out with cave people and riding dinosaurs").
