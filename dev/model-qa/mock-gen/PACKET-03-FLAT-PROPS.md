# PACKET-03 — FLAT PROPS (the extrusion-render class; flagships deep)

type: codex-packet
status: READY (Adam's codex window. The PROP PERSPECTIVE LAW's generation side: every
surface-attached prop renders FLAT — front elevation for wall items, top-down plan for floor
items — then mounts in-engine as a shallow extrusion with edge-sampled sides. NO baked
perspective, ever, on anything in this packet.)

## Standing prompt header (paste atop EVERY prompt)

> Generate a pixel-art SPRITE SHEET of flat, perspective-free prop faces for a diorama dungeon
> game. Each cell is drawn DEAD FLAT — wall items as straight-on front elevations (as if
> photographed perpendicular to the wall), floor items as straight top-down plans — with ZERO
> vanishing-point perspective, no 3/4 view, no isometric angle. Background pure magenta
> #FF00FF. Flat ambient light only (no cast shadows, no directional light — the engine lights
> it). Crisp pixel-art finish, colors from the realm's palette. Grid layout as specified;
> every cell fully inside its cell bounds.

Sheets are 4×4 grids at 1024×1024 (256px cells) unless a row says otherwise. Save to
`ui-sketches/flat-props/<realm>-<sheet>-fp-<n>.png` (additive law, -take2 for retries).
STATES sit in ADJACENT cells (per the objects convention: same footprint, same silhouette,
only the state differs).

## Extrusion depth table (the fold emits these; listed here so art suggests the right bulk)

thin surface (poster, sigil, stain, rug): 0.01-0.02 · framed flat (painting, sign, mirror,
screen): 0.04-0.05 · fixture (sconce, keypad, intercom, gauge): 0.08 · shallow furniture
(notice board w/ shelf lip, reliquary niche, breaker box): 0.12 · deep wall unit (bookshelf,
weapon rack, server rack, vending machine, fire cabinet): 0.25-0.3 · floor volume (coffin,
conveyor, projector puck): 0.1-0.25

---

## FANTASY (3 sheets)

**fantasy-wall-fp-01** (front elevations): framed painting empty-frame variant · tapestry
(heraldic) · hanging banner (realm crest) · wall sconce UNLIT · wall sconce LIT · iron
candelabra sconce · mounted shield · crossed swords mount · wall weapon rack (spears+axe) ·
bookshelf stocked · notice board w/ pinned papers · wanted poster · stained-glass window LIT ·
stained-glass window DARK · barred window · mounted stag trophy head
**fantasy-wall-fp-02** (front elevations): wall shrine niche w/ idol · ornate mirror ·
region map on wall · coat hooks w/ hung cloaks · shelf of potion bottles+jars · heraldic
crest plaque · hanging keys on hook board · chains+manacles set (dungeon wall) · murder-hole
grate · wall fountain face (lion head) · bell in bracket · candle cluster shelf · portcullis
face CLOSED · portcullis face RAISED (open gap) · ivy trellis panel · torn banner (battle-worn)
**fantasy-floor-fp-03** (top-down plans): round rug (the shop mock's green register) · long
runner rug · trapdoor CLOSED · trapdoor OPEN (dark hole) · floor grate · mosaic medallion ·
summoning circle (chalk+candles) · hearthstone w/ embers · coin/loot scatter · dropped-weapons
scatter · straw bedding patch · puddle · cracked-tile patch · root cluster breaking tiles ·
floor candle cluster · stone well cap

## GLOOM (3 sheets)

**gloom-wall-fp-01** (front elevations): cracked portrait (askew frame) · funeral wreath ·
propped coffin lid · bone wind-chimes · boarded-up window · taxidermy crow mount · cracked
mirror · candle sconce cluster (wax-dripped) UNLIT · same LIT (green flame) · rusted tool rack
(embalming hooks) · reliquary niche w/ relic · moth-eaten drape · stopped clock (3:07) ·
gargoyle head spout · ossuary bone panel (stacked femurs+skulls) · warning sign (KEEP OUT,
hand-painted)
**gloom-wall-fp-02** (front elevations): ritual chalk sigil set (3 sigils in 1 cell ok) ·
bloody handprint smears · dead-ivy trellis · hanging rusted keys · iron maiden face (shut) ·
iron maiden face (ajar, dark slit) · VHS-horror movie poster (in-world diegetic) · memorial
photo wall (small frames cluster) · barred cell window · hanging lantern bracket UNLIT · same
LIT (sickly yellow) · curtained alcove · plague-doctor mask mount · mourning banner (black) ·
scratched tally marks panel · rat holes baseboard strip
**gloom-floor-fp-03** (top-down plans): ritual circle (blood) · bloodstain pool set (3 sizes) ·
bone scatter · body drag-marks · floor hatch (rusted) · sewer grate · rat nest · moldy carpet
(pattern barely visible) · chalk body outline · burnt patch w/ embers · open coffin (interior
visible, top-down) · closed coffin lid (top-down, mounts as 0.2 extrusion) · grave-dirt mound ·
scattered funeral flowers · broken planks hole · black-water puddle

## CHROME (3 sheets)

**chrome-wall-fp-01** (front elevations — the cyber-screen family FLAT this time): wall screen
LIVE (scrolling data) · wall screen STATIC · wall screen NO-SIGNAL (the mock's) · wall screen
SHATTERED · CCTV camera mount · intercom/speaker panel · keypad w/ glow keys · control panel
(switches+readouts) · breaker box (door shut) · breaker box (door open, wiring) · coolant gauge
cluster · biohazard sign · airlock control plate · magnetic lock plate (red LED) · (green LED)
· vent grate
**chrome-wall-fp-02** (front elevations): server rack face (LED rows) · vending machine face
LIT · vending machine face DEAD · fire-hose cabinet · propaganda poster set (2 designs) ·
holo-ad panel frame (emitter off) · neon sign OPEN · neon sign broken-flicker (half-lit) ·
conduit junction box · cable-snarl wall run (horizontal strip cell) · wall drone dock (empty) ·
wall drone dock (docked drone) · graffiti tag set · warning stripe panel · terminal alcove
(screen+keyboard shelf) · pipe manifold w/ valves
**chrome-floor-fp-03** (top-down plans): illuminated floor panel ON · illuminated floor panel
OFF · floor hatch (hydraulic) · charging pad (glow ring) · warning-stripe floor panel · oil
stain set · cable channel run (straight strip) · cable channel run (corner) · under-lit grate ·
hologram projector puck (off) · same (emitting — faint cone base) · pressure plate · drone-
wreck scatter · scorch mark set · magnetic rail strip · painted zone marking (loading bay)

---

## NOT in this packet (stays camera-facing — do NOT generate flat)

Free-standing dressing (trees, gravestones, statues, barrels, crates — crates' FACES came in
PACKET-02), creatures/NPCs, hanging-from-ceiling items (chandeliers, cages, hook chains —
those stay ¾ hanging cards), and anything that walks. Ceiling-attached is deferred entirely.

## Return handling (orchestrator)

Arrivals → `ui-sketches/flat-props/` → slice per this packet's grids (chroma #FF00FF, defringe
standard) → each cell joins the dressing/objects manifests with `facing: front|top`, its depth
from the table, and `states[]` where adjacent cells pair → mounts through BW2-5's
`extrusionPropFor` (edge-sampled sides). Fold gate flags any cell with detectable perspective
(non-parallel verticals on a wall item = reject, regenerate). ROOM-GRAMMAR's templates consume
these (notice boards to taverns, reliquaries to shrines, server racks to chrome corridors).
