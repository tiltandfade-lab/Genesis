---
title: Cosmic Realm Re-key — Egyptian / Hermetic / Enochian
type: design-note
status: DRAFT — awaiting Adam's taste pass
date: 2026-07-08
---

# Cosmic Realm Re-key — DRAFT

> **Status: DRAFT — awaiting Adam's taste pass before merge.** This documents a proposed re-key of
> the COSMIC realm from Lovecraft-void into Egyptian + Western hermetic + Enochian mythology. Adam's
> ruling: he has no authorial connection to Lovecraft; the material here (Agrippa, Enochian, Egyptian
> funerary myth) is public-domain esoterica he *does* want to build in. Nothing is locked. The
> monster roster is **untouched** (models lane owns `data/realm-bestiary.js`) — §5 is a recommendation
> ledger only.

## 1. The new key, in prose

The Cosmic realm is no longer the drowned dark of the deep-ones and the Great Old Ones. It is now a
world where **the occult is literally true and correspondence is load-bearing physics** — Agrippa's
*Three Books of Occult Philosophy* as an operating manual, not a superstition. The three braided
sources:

- **Egyptian funerary cosmology** — the Duat (the night-realm the sun-boat crosses), the weighing of
  the heart against the feather of Ma'at, the 42 Assessors, Ammit the devourer, the *ren* (the secret
  true name), canopic and reliquary jars, scarabs, linen wrappings, the opening-of-the-mouth rite,
  boundary stelae, the iron of heaven (meteoric iron).
- **Western hermetic esoterica** — "as above, so below"; the Emerald Tablet; planetary seals and
  *kameas* (magic squares); the scale of numbers; sacred geometry (the squared circle, the vesica);
  the tarot's Major Arcana; Thoth / Hermes Trismegistus as the patron of writing, measure, and magic.
- **Enochian angelic myth** — John Dee & Edward Kelley's angelic language, the Calls/Keys, the four
  Watchtowers and the Great Table, the 30 Aethyrs and their Governors, the choirs of angels that
  answer a properly-spoken Call.

### The spine survived the re-key intact
The realm's register was always *"symbols are load-bearing and the wonder answers back."* Every load-
bearing motif maps cleanly onto the new key — this is why the re-key is a reflavor, not a rebuild:

| Old (void) motif | New (hermetic/Egyptian/Enochian) motif |
|---|---|
| "a name too long to finish" / unfinishable names | **true names** — the Egyptian *ren*, the syllable that commands |
| "the drowned language" | **the tongue of the Aethyrs / the language of Thoth** — the correspondences, read aloud, answering |
| "geometry that argues with itself" | **sacred geometry that actively casts** — the squared circle, chalked seals that hold or open |
| "a sound with no source" / "the wonder that answers back" | **the Call and its answer** — you speak the correspondence correctly and the cosmos replies |
| "the Choir" (of the deep) | **the choirs of the Aethyrs** — the Enochian angelic choirs; the word "Choir" is *kept*, re-pointed |

## 2. The Tarot-Engine tie-in (the surprise) — §Tarot

Genesis already ships a full **Tarot Engine** (`Engine/03. _Tables/01. World Building/Tarot
Engine_MANUAL/` — 22 Major Arcana files + `_Tarot Triggers.md`; each card carries Dungeon effects
(constant / monster-mutation / loot-mutation / setting-mutation) and World effects (faction / binding-
agreement / world-shifting)). It has, to date, no in-world *acquisition* story — it just exists.

**The re-keyed Cosmic realm becomes the Tarot Engine's home and origin.** Encountering this realm can
*grant or awaken tarot as a byproduct* — a genuine surprise for the player, who did not know the game
had this oracle.

**Concrete mechanism** (item d22, *The Deck With One Extra Card*):
- **R1 (L1):** a reading drawn for a real question returns a true omen — the DM answers one yes/no
  about the near future honestly, in symbol. (Light, always-on flavor of "the wonder answers back.")
- **R2 (L6):** drawing the *unnumbered twenty-third card*, once, **awakens the Tarot Engine for this
  world** — from then on the Major-Arcana oracle is live in play: its card-draws feed real dungeon-
  and world-effects via the existing manual. The player acquires a standing oracle they didn't have.

Open wiring question for Adam (see §6): should awakening be *item-gated* (this deck only), or should
*any* deep contact with the Cosmic realm (a breach crossing, a heart-weighing, a named encounter)
carry a small chance to awaken tarot? The item is the safe floor; the ambient path is the richer
surprise. Recommend: item is the guaranteed path; add a low ambient chance on Mythic-band Cosmic
beats, DM-narrated.

## 3. Per-surface changes

### `data/realms.js` — cosmic `register` + `voice` (DONE, manifest OK)
- **register:** now *"Hermetic-Enochian esoterica — as above, so below, made literal: correspondences
  are load-bearing, true names command, sacred geometry casts, and the wonder answers back when you
  spell it right."*
- **voice** (4): `"a true name, spoken exactly once"`, `"a circle squared into a door"`,
  `"the tongue of Thoth, read aloud and answering"`, `"a heart laid on the scale"`.
- **render block unchanged** (sat 1.25, tint `#8a3ce0`, tintAmt 0.30, contrast 0.90) — the violet
  cast reads as occult/hermetic as readily as it read cosmic-weird.

### `Engine/03. _Tables/05. Realms/Realm Items - Cosmic.md` (DONE — d50, coverage verified)
Keep/reflavor/replace per row, frames untouched (render unaffected), doers-only preserved:
- **Grounded floor (d1–12, 28–33, 49–50):** reflavored sea/monastery → temple/scriptorium/desert
  (papyrus, sistrum-bell, scarab wing-case, heka-crook, reliquary jar, linen mantle, astrolabe,
  fowler's net, temple-beer, offering-bread). Meteor-iron dice kept verbatim ("iron of heaven").
- **Four new-key hero items** placed in the Strange band (d21–24), band-matched to the rows they
  replace:
  - **d21 · The Scarab of the Scale** — weighs a spoken claim like Ma'at weighs a heart (sinks to a
    lie, rises to a truth); won't weigh the same claim twice a day; remembers what it caught you saying.
  - **d22 · The Deck With One Extra Card** — the Tarot-Engine tie-in (see §2).
  - **d23 · The Squared Circle** — sacred geometry that casts: chalk-copy it and crossers move at
    half speed; the one who drew it walks it full speed.
  - **d24 · The Door-Chalk** — draws a real, temporary door on any wall (tomb-lime chalk; stub gets
    shorter with use).
  - *Displaced (moved out to make room; recoverable if Adam prefers them):* the grey tuning-fork
    (initiative), "The Librarian's Bookmark" (answer-marking ribbon), the protractor-diagram, and the
    dark-writing ink. Noted here rather than in the parked-pointers doc since all four are doers.
- **d27 Mythic d4** reflavored: the missing-verse hymn → the **Nineteenth Enochian Call**; the true
  name of the region → **kept** (already pure true-name); the Choir's seating chart → the **roster of
  the Aethyrs** (blank line still insists it's yours); the inked-out star → kept (astrological).
- **Signature ladders** reflavored not restatted: "The Left Gauntlet of the Choir" (J3b anchor —
  "Choir" now = angelic choirs of the Aethyrs; water re-pointed to the primordial waters of Nun);
  "The Boundary-Stela" (was Threshold Marker); "The Hierophant's Was-Sceptre" (was Choirmaster's
  Baton); "The Answering Cord" (far end now held by the **Ferryman of the far shore**).

### `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Role Skin - Cosmic.md` (DONE)
35-row spine + 10 adds structure preserved; drops (Land-worker, Hauler) and all weights untouched —
labels/flavor only. Star-readers → temple astrologers & Enochian scryers; cultists → temple scribes,
initiates of the grades, cult-of-the-answer; the touched → embalmers, heart-weighed pilgrims, the
returned. New adds swapped in-slot: True-name speaker (was Drowned-tongue speaker), Enochian scryer
(was Sleeper-medium), Embalmer/opener-of-the-mouth (was Void-beacon keeper).

## 4. Keep-not-trash: what carried over unchanged
- The **spice-band shape** of the items table (hot Strange band, plain Grounded floor).
- All **item frames** (`data/items.js` ids) — render is untouched, so no model/asset work is implied.
- All **NPC role weights** and the drop/add conventions.
- The **monster stat blocks** entirely (see §5).

## 5. Bestiary audit — RECOMMENDATIONS ONLY (models lane owns the file)

`data/realm-bestiary.js` cosmic section = **117 entries** (the ~26-entry gloom-adjacent core set, a
large drift/deep-court expansion, plus ~30 explicitly-named Lovecraft bespokes at the tail). **No
edits made here.** Recommendations, grouped by how cleanly they re-key:

### 5a. Reads almost unchanged — reflavor text only, keep name + stats + frame
These already sit on the surviving spine (true-names, answering-language, wrong-geometry):
- **Static-Born Whelp** (CR 1/8) — a half-uttered *true-name larva*: it chitters one syllable of an
  unfinishable name and forgets it. Reads perfectly as-is; just swap "drowned language" → "the tongue
  of the Aethyrs / a true name." **Keep verbatim mechanically.**
- **Length-Wrong Herald / Length-Wrong Runt / Herald of the First Syllable / Hollow-Throated
  Herald-Prime / Herald-Legion** — the whole herald line ("attacks mid-syllable of its own name",
  "forever mid-utterance") *is* the true-name motif. Reflavor "syllable of its name" as an Enochian
  Call it can't complete. **Keep.**
- **Angle-Wrong Creeper, Wrong-Angle Watcher, Basalt Geometer(+Scout), Cartographer of Wrong Angles,
  The Angle That Ate a City** — the geometry line maps straight onto sacred-geometry-gone-wrong.
  Reflavor: they enforce / embody a *broken correspondence*, a seal drawn wrong. **Keep.**
- **The Sound With No Source** (CR 15) — bodiless answering voice; = an unanswered Call given a
  borrowed shape. **Keep, reflavor as Enochian.**
- **Choir-Static Wisp / Swarm / Static-Fed Familiar** — "hums the wrong language" → hums a corrupted
  Call. **Keep.**

### 5b. The apex / benchmark — needs a real Egyptian-hermetic *identity*, not just a reflavor
- **The Wonder That Answers Back** (CR 18, apex, the realm's Great-Old-One) — Adam's spine phrase is
  literally this creature's name; it already fits. Recommend re-identifying it as **the principle of
  Correspondence itself given a face** — "a correct answer always costs you" becomes the Ma'at
  bargain (every true answer is weighed against your heart). Candidate identity: *Thoth-as-cosmic-
  law*, or the nameless thing the true name belongs to. **Keep name + stats; author a new identity
  paragraph with Adam.**
- **The Drift That Remembers Shapes** (CR 18, the source shoggoth-mass) + **Shoggoth Spawnling** +
  **Devouring Mass of the Drift** + **Choir-Grown Ooze Sculptor** — the **Shoggoth-class benchmark**
  (memory-model reference per MODEL-FOUNDRY). It cannot stay "shoggoth." Recommended Egyptian/hermetic
  identity: **the *materia prima* / the unformed clay of creation** — the primordial protoplasm out
  of the waters of **Nun** that *remembers every form pressed into it* (a hermetic "first matter" that
  has been shaped and un-shaped so many times it wears dissolved shapes back). Keeps the eye-budding /
  shape-recall mechanics verbatim; gives it a name in the new key (e.g. *"The Unformed of Nun" /
  "First Matter"*). **Flag: this is the visual benchmark — coordinate the rename with the models lane
  so the reference identity stays stable.**
- **The Waking Eye Beneath / Star-Spawn Bishop** — brain/mind-rearranging apexes → re-key as
  *correspondence overload* (your inner microcosm forced to mirror a macrocosm too large). **Keep.**

### 5c. Deep-one / drowned-court expansion (~40 entries) — the biggest re-key lift
The large "Deep-Kin / Drowned Court / reef / sunken" cluster (Deep-Kin Netcaster, Kelp-Draped
Netcaster, Grand Cantor of the Drowned Court, Warlord of the Sunken Court, Coral-Throned Cult Matron,
Colossal Sunken Guardian, etc.) is the most sea-specific and re-keys least cleanly. Two viable paths
for Adam to choose:
- **(A) Nile / primordial-waters path** — re-point "the drowned / the deep / the reef" onto the
  **waters of Nun and the flooded temple-districts of the Duat's river**. Fish-folk → *the river-
  drowned who serve the boat of night*; the Drowned Court → a **submerged temple-court of the Duat**.
  Preserves nearly every stat + frame; heaviest reflavor but no restat. **Recommended.**
- **(B) Retire the sea-court subset** — if the aquatic density feels off-key, cut the reef/net/
  drowned-court entries from the Cosmic pool and let the desert/tomb/star material carry the realm.
  Larger content loss; cleaner tone. **Not recommended — violates keep-not-trash.**

### 5d. The named-IP bespoke tail (~30 entries) — MUST re-key or retire (serial-numbers-filed)
The explicit Lovecraft/Chambers bespokes are named directly and cannot stay: **Deep One (+Whip,
+Archpriest), Byakhee, Shoggoth, Elder Thing, Elder Deep-Thing, Dagon, Nightgaunt, Hound of Tindalos,
The Colour, Yog-Sothoth's Herald, Nyarlathotep, Cthulhu, The King in Yellow (+Servant, +Cassilda's
Mourner), Mi-Go, Brain in a Cylinder, Ghast of the Underworld.** Recommended re-key targets (keep the
stat block + frame, rename + reflavor):
- **Hound of Tindalos** → *"Hound of the Sharp Angles"* / a **Watcher that seeps through any corner a
  seal was drawn wrong** — the angle motif is already generic-able. **Easy keep.**
- **Nightgaunt** → a **faceless Duat-ferryman's servant** that carries the unweighed off. **Easy.**
- **The Colour** → *"the Hue With No Name"* — an unnameable light; already near-generic. **Easy.**
- **Shoggoth / Dagon / Cthulhu / Nyarlathotep / Yog-Sothoth's Herald** → fold into §5b's benchmark
  identity (First Matter of Nun) and a new hermetic/Egyptian apex pantheon (a smiling messenger →
  **a masked Thoth-emissary**; the sunken god → **the drowned neter of the deep river**). **Needs
  Adam — these are the tentpoles; author their new identities deliberately.**
- **The King in Yellow / Cassilda's Mourner / Tatterling** → a **play/text that unmakes its reader**
  maps beautifully onto the *forbidden Call / the Nineteenth Key* — re-key as a **cursed Enochian
  Call given wearers**, not a Chambers reference. **Good keep.**
- **Elder Thing / Elder Deep-Thing** → *the first geometers / the builders of the correspondences*.
  **Keep.**
- **Mi-Go / Brain in a Cylinder** → *soul-jar harvesters* (canopic/ba-jar logic — extracting and
  storing the mind). Very on-key for Egyptian funerary. **Keep, strong fit.**
- **Ghast of the Underworld** → literally a **Duat corpse-thing**; barely needs a rename. **Easy.**

**Net:** ~60 entries are near-free reflavors (§5a + easy §5c-A + easy §5d); ~15 need deliberate new
identities authored with Adam (the apexes/tentpoles); 0 need restat. Nothing recommended for deletion.

## 6. Open taste questions for Adam
1. **Tarot awakening — item-only or ambient?** (see §2). Recommend item guaranteed + low ambient
   chance on Mythic Cosmic beats.
2. **Deep-one / drowned-court cluster — path A (waters of Nun) or path B (retire)?** Recommend A.
3. **The Shoggoth benchmark's new identity** — is *"First Matter / The Unformed of Nun"* the right
   hermetic read, or do you want it Egyptian-specific (the clay of Khnum)? Must be settled *with the
   models lane* since it's the memory-model reference.
4. **"Choir" retained** — I kept the word and re-pointed it to the Enochian angelic choirs (incl. the
   J3b-anchored "Left Gauntlet of the Choir"). Confirm you're happy keeping the word, or rename it.
5. **The apex "Wonder That Answers Back"** — Thoth-as-cosmic-law, or keep it nameless (the thing the
   true name belongs to)?
6. **Displaced item doers** (tuning-fork, Librarian's Bookmark, protractor-diagram, dark-ink) — leave
   retired, or fold any back in by growing the table past d50?
