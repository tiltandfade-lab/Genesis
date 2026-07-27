STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

# Lane 2 — Real-image reference lane

type: research-lane
date: 2026-07-27
status: COMPLETE for this pass
corpus: `images/` — 12 Wikimedia Commons photographs, all downloaded and **all read**
ledger: `images/LICENSE-LEDGER.md`
method: `docs/GOLDEN-SITE-CONCEPTING-GUIDELINES.md` — THE DEPTH LAW, image limb (b)

Every claim below is a read of a frame in `images/`. Where a claim came from a source's
caption rather than my own read of the pixels, it says so. Nothing here is a founder ruling.

## The twelve induced rules

### DA-1 — The roof goes first, and the roof is the only thing that must go

D1-01 (Lyndale) and D1-03 (Cefn Coch mill) are both total roof loss over standing walls.
D1-02 (Killypole) shows the interior of the same condition. In none of them is the wall the
thing that failed. This matches the building-pathology sequence in Lane 1 exactly: the roof
admits water, the water takes the floors, the walls go last.

**Generator posture.** Removing the cover is the *cheapest possible* transform and it is also
the most legible one. A single boolean per bay — `covered` / `open` — reproduces the most
recognisable ruin in the world without touching wall geometry.

### DA-2 — Openings survive as clean voids, and they become the silhouette

In D1-01 the door and window openings read as sharp bright rectangles punched through a dark
planar mass, against sky. The wall *heads* are ragged; the *openings* are not. Dressed
jambs, lintels and quoins hold their edge while random rubble walling loses its top courses.
D3-01 (St Felix) is the strongest case: the gothic arch's dressed voussoirs and respond pier
are effectively pristine while everything around them is decaying flint rubble.

**Generator posture.** Decay attacks the *top edge* of a wall run and the *bonding*, not the
dressed sockets. So a ruin's silhouette is: ragged wall-head profile + intact opening
geometry. That is one displaced top edge plus the unchanged opening kit.

### DA-3 — The wall-plate line survives as a horizontal scar band

D1-02 shows it directly: a continuous horizontal band of disturbed, exposed rubble at the
height where the roof structure was seated, with intact render below and a surviving gable
above. The building tells you where its missing floor and roof *were*.

**Generator posture.** A per-storey horizontal decal band at every removed structural
level, on the wall interior. One decal role, and it does the entire job of "there used to be
a floor here."

### DA-4 — Vegetation takes horizontals first, joints second, canopy last

D1-02: moss and grass tufts sit on the mantel shelf and on the wall head — the two horizontal
ledges in frame — and nowhere else. D3-01: ivy has climbed the wall *through the joints* and
is densest around openings. D2-01 (St Nicholas): full canopy inside the wall lines.

That is a three-stage succession, and it maps to the ruderal literature's substrate
preference. It is also an elapsed-time readout the player can learn.

**Generator posture.** Overgrowth is a **stage index**, not an intensity slider, and it
attaches to named surface roles (ledge → joint → floor → canopy) rather than being sprayed.

### DA-5 — Vegetation inherits the plan

D1-03: the mill's side walls are reduced to low kerbs and the hedgerow has grown *along the
wall lines*, so the building's footprint is now legible as a line of shrubs. D2-01: the same
effect one stage further on.

**Generator posture.** The overgrowth layer should be *emitted from the wall graph*, not
scattered. This is nearly free and it is the single most convincing "this was a place" cue.

### DA-6 — Below about one metre, the interior stops being an interior

D2-01 is the proof. Once the wall drops to roughly waist height and the canopy closes, the
former chancel reads as woodland floor bounded by a stone kerb, with a path through it.
D5-02 (Curdi) shows the same class in a different climate — waist-height block stubs on open
ground.

**Generator posture, restated as construction:** a surviving wall stub of ~0.5–1.2 m is
*half cover*, not a sight blocker, and the volume it encloses obeys outdoor rules — sky light,
weather, ranged fire from outside, no ceiling. That is a hard tactical class change at a
single rung boundary, and it is the most important gameplay consequence in the lane.

### DA-7 — The terminal rung is a height field, and differential deposit is what makes it read

D1-04 (Calcethorpe): no fabric at all. The village survives as low banks, platform terraces
and a hollow-way scar in grass. It is legible in the photograph *because snow is lying in the
hollows* — the low ground holds a different deposit from the high ground.

**Generator posture.** D5 is terrain, not props. And the presentation trick is free and
motivated: put snow, standing water, frost, moss, or a different grass value in the low
ground and the plan draws itself. No decoration required.

### DA-8 — Blocking is a distinct noun, and it is built in a cheaper material than the thing it blocks

D3-01 is unambiguous: a fine dressed arch, filled with a later flint-and-brick wall carrying
a small crude window. The blocking is visibly *not* the original work. This is exactly the
"deliberate closure" reading from Lane 1, and it is what separates *reduced* from *ruined*.

**Generator posture.** A blocking panel is a flat infill in an existing opening socket, with
its own material card (cheaper, later, different bond). Cheap geometry, enormous narrative
payload, and it changes access — which makes it mechanical, not decorative.

### DA-9 — Cut voids survive; built volumes fall

D4-01 and D4-02 (Domitilla) are two thousand years old and geometrically intact, because
nothing is holding anything up — the space is a hole in soft rock. D4-04 (Barclodiad) is a
grass mound with one masonry socket: the *mound* is terrain and the passage is a cut. D5-01
(Lochaline) is an intact adit. Against that, every above-ground structure in D1-* has lost
its roof and floors.

**Generator posture — the survivability rule.** Subtractive space is the *reliable playable
volume* of any dormant site; additive structure is its *silhouette*. This is why the
engine's own Sunken Estate row reads "Manor house / Basement levels": the dungeon is the
part that could not fall down.

### DA-10 — A tomb wall is a matrix of voids, and its state is one panel per void

D4-01: both gallery walls are stacked rectangular burial voids, four to six tiers, floor to
above head height, in a corridor about one person wide and two-and-a-half to three times
taller than wide. D4-02 close-up: tool-cut soft rock, rounded edges, a shelf-and-lintel
horizontal rhythm, and the *sealing slabs gone* — each niche is an open shelf with a broken
partition.

**Generator posture.** A niche wall is a wall run with a tiling niche socket array. Each
socket carries one state — `sealed` / `opened` / `robbed` / `reused` / `empty` — expressed as
one swappable panel plus its contents flag. That is the cheapest state machine in the whole
site, and every socket is simultaneously cover, concealment, a loot slot, a spawn slot, and a
piece of evidence about who has been here.

### DA-11 — A maintained funerary store is the opposite of dormant, and it looks it

D4-03 (Hallstatt): a barrel-vaulted chamber, skulls in tight rows on floor and timber shelf,
each one *painted* with a name, a date and a wreath or cross, a crucifix and candlesticks
making an altar line, one lit votive throwing a hard cast shadow on the vault wall.
Everything in the frame has an owner and a schedule.

**Generator posture — a boundary, not a feature.** This frame is the packet's anti-evidence.
If the cult is alive, the crypt is a maintained institution and **must not take the Dormant
transform**. It also supplies the one legal light owner a funerary interior can have: votive
flame belonging to a named practice.

### DA-12 — An unowned interior is nearly all black, and three things carry the read

D5-01 (Lochaline) is the CAUSAL LIGHT LAW rendered. Roughly nine-tenths of the frame is
black. What reads is: (i) the near rock rib at grazing incidence, (ii) the wet horizontal
floor's specular sheen, (iii) two high-albedo objects — a rust-orange steel drum and a pale
block. Nothing else in the volume is legible at all.

**Generator posture.** Dark dormant interiors are readable through *grazing wall light,
specular wet floor, and a small number of high-albedo objects*, not through ambient fill.
And note what the drum is: heavy, low value, left behind — Schiffer's de facto refuse, doing
double duty as the room's only value anchor.

### DA-13 (water) — Water is a datum, and it leaves a band

D5-02 (Curdi): reservoir drawdown exposes bare laterite ground, a surviving graded road, a
waist-high wall stub of eroded block, more stubs beyond, and a field of black tree stumps at
the water's edge. A distinct colour band marks where the water stood longest.

**Generator posture.** One water level, dead flat, plus one material band at the datum, plus
"stumps and stubs below, weathering above". Extremely cheap, extremely legible, and it is
the whole Sunken Estate read.

## What the lane did NOT find

- **No image of robbing.** The ROBBED vector is carried entirely by written sources in this
  packet. Recorded as a gap in `images/LICENSE-LEDGER.md`.
- **No image of a maintained-but-stopped (mothballed) site.** D0 is documentary only.
- **No animal occupation image.** The animal claimant is inferred from ecology sources and
  from the Site 7 lair packet, not from a frame here.
- **No non-European construction.** See Lane 1's declared gaps; the elapsed-time bands in the
  spec are stone-and-timber biased.
