# PACKET-F15 — The PC roster: 9 ancestries × 12 classes × 2 presentations (216 identities)

**Authority:** laws identical to PACKET-F1 — the **§0 ART-DIRECTION RULINGS** and chroma rule
apply verbatim; reread them before firing. Compile every sheet from
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8 with the **PC insertion**: exact loadout +
class cues + **neutral-ready pose** (a playable protagonist at rest-alert — not a monster's
menace, not an NPC's occupation slouch, not a hero-pose).

**What this packet is:** the full player-character portrait roster. This is a GRID, not a list —
every identity is `spr-pc-<ancestry>-<class>-<sex>` and its seed is composed mechanically:

> **seed = ANCESTRY cue row + CLASS cue row + sex presentation.**

**Namespace: these are `spr-pc-`, NOT `spr-fantasy-`.** Filenames keep the exact grid slug.

## DISCIPLINE (identical across all F-packets; F1 audit lessons baked in)
1. **Filenames:** exact grid slug (`spr-pc-dwarf-ranger-female-candidate-001.png`); sheet files join the cell slugs' short forms with full slugs recorded in provenance. Candidates numbered **per-slug from 001** (never a lane-global counter — F1 lanes 3–5 collided).
2. **Provenance:** per-lane JSON at `fantasy-pilot/provenance/<packet>-<lane>-generation-calls.json` (packet prefix mandatory, e.g. `f8-lane-u-…` — bare lane names collide across packets) (file / callId / cells). Never append to the shared AUDIT.md.
3. **Chroma:** flat uniform magenta **#FF00FF**; the chroma color must never appear IN a figure (F1 shipped a magenta-tinted shoe). No gradient, floor, shadow, or horizon.
4. **Crop:** generous padding — staff tips, bow limbs, weapon hafts, feet WELL inside the frame. Near-edge extremities were F1's most common defect.
5. **Cells:** exactly N figures in N equal vertical 4:8 cells, hard boundaries, no overlap, no shared props, varied poses — the two presentations on a sheet must NOT mirror each other.
6. **Props:** exactly ONE of each carried item (F1 produced a doubled kite shield).
7. **Faces/finish:** grounded, weathered, adult — **no BG3-glamour prettiness** (F1 lane-4 drift; the #1 risk for a PC roster), no MMO gloss, no candy saturation. These are people who work for a living and fight for their lives.
8. **§0 laws:** lanky house bias (class-diegetic mass only: see barbarian/fighter cues); COMPACT support; adult register; realistic dark-fantasy horror with a stylized triangulated low-poly twist.
9. **No VFX in sources:** casters carry foci, not spell effects — no glowing hands, no arcane swirl. Magic is implied by KIT, never rendered.
10. Every output is a candidate — `runtimeAdmitted:false`; save to `fantasy-pilot/raw-figures/`; record every generation call id.
**Sheet economy (§0):** Medium ancestries = 2 per sheet (the two presentations of one ancestry+class) · Small ancestries (halfling, gnome) = 4 per sheet (both presentations × both small ancestries, same class).

## THE GRID

**Ancestries (9):** dragonborn · dwarf · elf · gnome · goliath · halfling · human · orc · tiefling
**Classes (12):** barbarian · bard · cleric · druid · fighter · monk · paladin · ranger · rogue · sorcerer · warlock · wizard
**Presentations (2):** female · male — same kit and class silhouette; differ by build/face/hair, never by armor coverage (no bikini-plate drift; both presentations get the same practical kit).

### Ancestry cue table (one row feeds every class of that ancestry)

| ancestry | size | cues |
|---|---|---|
| dragonborn | M | broad draconic head, scale color muted (choose per-figure from brass/blue/green/rust spread across the roster), tail balanced close to body, digitigrade stance kept compact |
| dwarf | M | dense low center of mass (diegetic), braided or cropped beard/hair traditions, stonework textures in kit trim |
| elf | M | tall spare frame (the house-lanky exemplar), angular faceted features, long ears back along the skull, quiet economy of stance |
| gnome | S | small wiry frame, oversized craft-tools relative to body, bright-eyed but weathered — never child-like, never cute |
| goliath | M | head taller than human norm, stone-mottled skin patches, mass that reads climbing-strong not bodybuilder |
| halfling | S | small sturdy frame, practical rural dress under the class kit, bare or soft-shod feet — grounded, never child-like |
| human | M | the roster's baseline; vary age, build, and skin tone widely across classes — humans carry the roster's diversity load |
| orc | M | heavy jaw and tusks worn plainly, workman's musculature (diegetic), kit repaired with visible care — dignity, never brute caricature |
| tiefling | M | horn shapes varied per figure, tail wrapped low and close (§0), skin in deep muted tones — worn like any other trait, not theatrical |

### Class cue table (one row feeds every ancestry; loadout is EXACT per §6.8)

| class | loadout + class cues | neutral-ready pose |
|---|---|---|
| barbarian | greataxe carried easy, hide-and-plate piecemeal armor, trophies few and personal; diegetic mass allowed — a laborer's power, not inflated | axe head resting on ground, both hands on haft |
| bard | rapier at hip, a worn instrument (vary: lute/drum/horn across ancestries) slung, traveling clothes with one fine flourish | instrument half-raised, weight on one hip |
| cleric | mace + shield bearing a plain holy sigil, chain shirt under vestment tabard, prayer-strand at belt | shield low, mace across body at rest |
| druid | wooden staff, layered natural-fiber and leather dress, living sprig woven somewhere in the kit (material, not glow) | staff planted, free hand open at side |
| fighter | longsword + heater shield, practical full mail kept field-worn, kit maintained like a soldier's | sword sheathed, hand on pommel, shield slung forward |
| monk | no weapon or a plain staff, wrapped hands and feet, simple layered wraps that show the frame's discipline | balanced square stance, hands loose at guard-rest |
| paladin | longsword + shield with an oath-mark, half-plate polished but campaign-dented, oath-cord on the sword grip | both hands folded on pommel of grounded sword |
| ranger | longbow strung across back, shortsword at hip, oiled travel cloak and quiver, terrain-worn boots | bow in hand unraised, checking the middle distance |
| rogue | two daggers (one visible, one implied at boot), dark practical leathers with no shine, coil of cord at belt | weight on the back foot, thumbs in belt |
| sorcerer | no focus but a bloodline TELL as faceted material (a scale patch, a burn-that-never-healed, pale-fire hair — vary per ancestry), fine-but-strange dress | one hand half-open studying its own palm |
| warlock | pact focus worn openly (an amulet, a bound tome, a graven rod — vary), dress with one WRONG element the eye keeps finding | focus gripped, gaze slightly off-center |
| wizard | quarterstaff + belted spellbook, layered scholar's robes with ink-stained cuffs, component pouch | staff crooked in arm, book open on the free hand |

## RUN ORDER — 4 lanes by ancestry block, disjoint, parallel

Sheet = one ancestry + one class, both presentations (2 cells, varied pose). Small sheet = both
small ancestries + one class, all four presentations (2×2). Name sheet files
`spr-pc-<ancestry>-<class>-candidate-NNN.png` (cells recorded in provenance).

- **LANE PC-1 — human, elf, dwarf** (36 identities, 36 sheets… 3 ancestries × 12 classes = 36 sheets of 2)
- **LANE PC-2 — orc, goliath, dragonborn** (36 sheets of 2)
- **LANE PC-3 — tiefling** (12 sheets of 2)
- **LANE PC-4 — halfling + gnome combined smalls** (12 classes × 1 sheet of 4 = 12 sheets)

Total: **96 generation calls for 216 identities.** This is the largest packet — run lanes across
multiple sittings if needed; each lane is independently consolidatable.

## PC-specific Step-E additions

- The two presentations on a sheet must read as the SAME class kit — a kit delta is a reject.
- Armor coverage parity between presentations (rule: same protection, same practicality).
- Caster hands empty of effects (rule 9) — a glowing palm is a source reject.
- Class silhouette must survive at standee scale: a wizard and a warlock must be tellable apart
  at a glance by KIT (book+staff vs focus+wrongness), not by color alone.

---

## After the returns

Chroma removal → despill/dilation → bounds/anchor/scale → canonical isolated renders → blind
visual judge → integrated theater matrix → admission record or typed rejection (§9 Steps E–L).
Generation is never completion; nothing ships without `in-game-pass`; the legacy sprite stays the
fallback until admission.
