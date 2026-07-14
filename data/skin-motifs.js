/* GENESIS DATA — data/skin-motifs.js — the 14 motif KITS (docs/SKIN-GRANTS.md §1b, BATCH3-GUARDRAILS J3)
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Hand-authored source data (like data/tarot.js) — NOT a compiled artifact; edit here directly.

   Skin rows carry a DM-only `Motif` column keying into one of these 14 kits (a family; the row's own
   text stays the unique flavor, the kit does the PERVASION across the walk's layers). Each kit ships:
     entrance   — the segment-1 presentation line (LEADS the finale/first-segment beat)
     tints      — 6–10 short sensory fragments (composed onto a segment's rolled sensory line, appended
                  after an em-dash — never replacing the base roll: SKIN-GRANTS.md §1b point 2)
     threatBias — archetype tags fed to resolveArchetypePool (§1b point 3)
     reskinVerb — a DM-facing note riding the encounter object ("the same skeletons, frozen mid-reach")
     hazardTint — { prefix } a short fragment composed onto a rolled hazard/footing line (point 4)
     palette    — 4 colors for the Blockwright tileset hookup (point 5; consumed later, inert data here)

   BATCH3-GUARDRAILS J3: the anchors below are Fable-authored LAW — ship verbatim among the 6–10 tints/
   entrance; the remaining tints in each kit extend the register (Sonnet-authored, non-contradicting).
   `none` carries no fields — the rolled base speaks for itself (SKIN-GRANTS.md §1b band placement:
   Grounded stays mostly `none`; Textured = natural transformations; Strange+ = the exotic). */

const SKIN_MOTIF_KITS = {
  flood: {
    entrance: "The doorway weeps; the steps go down into black water.",
    tints: [
      "a current tugs through the arrow slits",
      "the waterline on the walls is older than the furniture",
      "footsteps come back as ripples before they come back as sound",
      "everything wooden has swollen soft at the edges",
      "the air tastes of standing water and rust",
      "a slow drip keeps its own private rhythm somewhere unseen",
      "silt has settled into every low corner, fine as flour",
      "the damp has climbed the walls in a stain shaped like a tideline",
    ],
    threatBias: ["amphibious","aquatic"],
    reskinVerb: "the same threat, wading — every step announced by the water",
    hazardTint: { prefix: "the footing gives like a wet sponge" },
    palette: ["#1b3a4b","#2f6690","#7fb8c4","#0d1b24"],
  },
  ice: {
    entrance: "The threshold glitters; your breath arrives before you do.",
    tints: [
      "the torch sconces wear candle-wax beards of ice",
      "something under the floor-ice is darker than shadow",
      "breath hangs long enough to read by",
      "every metal surface bites bare skin on contact",
      "the quiet has a brittle, held-breath quality",
      "frost has drawn its own maps across every flat surface",
      "sound arrives sharper here, and carries too far",
      "the cold has a weight, like standing under something patient",
    ],
    threatBias: ["cold","frost"],
    reskinVerb: "the same threat, rimed white — frost bearding every joint and blade",
    hazardTint: { prefix: "the ground is glassed over and unkind to footing" },
    palette: ["#dff3f8","#a9d6e5","#5b8ca6","#0f2431"],
  },
  fire: {
    entrance: "Heat leans on the door from the other side.",
    tints: [
      "the mortar glows faint orange in its seams",
      "iron fittings tick as they cool — or warm",
      "the air shimmers before it's felt",
      "ash drifts down like the wrong kind of snow",
      "every breath tastes faintly of char",
      "shadows flicker with a light that has no visible source yet",
      "sweat starts before exertion does",
      "the walls radiate a low, patient warmth that never fully fades",
    ],
    threatBias: ["fire","elemental"],
    reskinVerb: "the same threat, smoldering — embers riding in its wake",
    hazardTint: { prefix: "the heat alone is a tax on every action here" },
    palette: ["#3a0d0d","#a12a12","#e0762b","#f4c542"],
  },
  overgrowth: {
    entrance: "The door lost to the hinge-side ivy years ago; you enter through the wall's slow green wound.",
    tints: [
      "roots have opened the floor along old grief-lines",
      "the light comes down green through three seasons of canopy",
      "vines have found every handhold and taken it",
      "the air is thick with pollen and old rain",
      "moss has softened every hard edge into something gentler and slower",
      "insects work at a volume just below conversation",
      "something green is always, quietly, still growing",
      "the smell of turned earth follows every footstep",
    ],
    threatBias: ["plant","beast"],
    reskinVerb: "the same threat, root-bound — vines threading through its frame",
    hazardTint: { prefix: "roots snag every other step" },
    palette: ["#1e3d1a","#3f6b2e","#8fae5a","#12200f"],
  },
  fungal: {
    entrance: "The air is thick, sweet, and interested.",
    tints: [
      "shelf-brackets of fungus stair the walls",
      "spore-motes hang where the draft should move them",
      "the sweetness in the air has a rot underneath it",
      "everything soft has a faint, patient bloom on it",
      "footsteps release small clouds that don't quite disperse",
      "the walls have a give to them that stone shouldn't have",
      "a low luminescence traces the largest growths after dark",
      "the quiet has a listening quality, damp and unhurried",
    ],
    threatBias: ["fungal","ooze"],
    reskinVerb: "the same threat, spore-caked — blooming faintly where it's been still",
    hazardTint: { prefix: "the spores make every breath here a small risk" },
    palette: ["#2b1f33","#6b4a7a","#b98fd1","#efe6f5"],
  },
  bone: {
    entrance: "The lintel is a jawbone. It was not carved to look like one.",
    tints: [
      "the gravel underfoot is not gravel",
      "the columns wear vertebrae the way trees wear rings",
      "every surface has been polished by something patient",
      "the dust has a particular, unmistakable weight to it",
      "small bones collect in the corners like fallen leaves",
      "the architecture repeats a shape that's almost, uncomfortably, anatomical",
      "footsteps here land softer than the ear expects, cushioned by old marrow-dust",
      "the walls hold a chill that has nothing to do with stone",
    ],
    threatBias: ["undead"],
    reskinVerb: "the same threat, bleached and stacked — assembled rather than born",
    hazardTint: { prefix: "loose bone shifts and clatters underfoot" },
    palette: ["#e8e2d0","#c9bfa0","#8a7f66","#2c2820"],
  },
  ash: {
    entrance: "Gray drifts against the door like patient snow.",
    tints: [
      "footprints ahead of yours, filled in soft",
      "everything touched leaves a clean shape behind",
      "the air carries a fine gray hush that never fully settles",
      "sound arrives muffled, as if the ash absorbs it on the way",
      "color has gone out of everything but the torchlight",
      "a taste of char sits at the back of the throat",
      "the drifts pile deeper in every corner the wind can't reach",
      "nothing here casts a shadow quite the color it should",
    ],
    threatBias: ["fire","undead"],
    reskinVerb: "the same threat, ash-dusted — moving slow through the drifts",
    hazardTint: { prefix: "the ash swallows footing and sound alike" },
    palette: ["#4a4a4a","#7d7d7d","#b8b3a8","#211f1c"],
  },
  vermin: {
    entrance: "The scratching stops when the door opens. All of it. At once.",
    tints: [
      "the walls have a pulse if you watch the holes",
      "something has been eating the structural parts",
      "droppings mark every surface at exactly nose height",
      "the scratching resumes the moment attention wanders",
      "gnaw-marks pattern the woodwork in overlapping generations",
      "small eyes catch torchlight and vanish before you're sure you saw them",
      "the air carries a close, animal must",
      "nests fill every gap the architecture left open",
    ],
    threatBias: ["vermin","beast"],
    reskinVerb: "the same threat, swarmed-over — carrying its own vermin retinue",
    hazardTint: { prefix: "the footing is treacherous with nests and droppings" },
    palette: ["#3b3226","#5c4d36","#8a7a54","#1c1712"],
  },
  void: {
    entrance: "The dark past the door does not do what torchlight asks.",
    tints: [
      "sounds arrive without echoes, like the room ate them",
      "the far wall is a rumor",
      "shadows fall at angles the light doesn't explain",
      "the torchlight reaches less far here than it should",
      "silence has a texture, thick enough to lean on",
      "something at the edge of sight refuses to resolve into a shape",
      "the cold here isn't temperature — it's absence",
      "distances measure wrong, and no one agrees by how much",
    ],
    threatBias: ["aberration","shadow"],
    reskinVerb: "the same threat, edge-blurred — harder to fix in the eye than it should be",
    hazardTint: { prefix: "the dark itself seems to resist the torchlight's claim" },
    palette: ["#0a0a12","#1c1c2e","#3a3a5c","#5e5e8a"],
  },
  mirror: {
    entrance: "Your reflection enters first, in a surface that shouldn't hold one.",
    tints: [
      "the symmetry here is slightly too good",
      "in polished things, the room is furnished differently",
      "every reflective surface holds a half-second's lag",
      "a second version of the room hangs just behind the first, glimpsed and gone",
      "footsteps sometimes arrive from the wrong direction in a polished floor",
      "your own face looks back a beat slower than it should",
      "the architecture repeats itself in ways the eye keeps re-checking",
      "reflected light bends at angles the room's geometry doesn't support",
    ],
    threatBias: ["aberration"],
    reskinVerb: "the same threat, doubled — a half-step out of sync with itself",
    hazardTint: { prefix: "the reflected footing doesn't quite match the real one" },
    palette: ["#c9d6e0","#8fa3b3","#4a5b6b","#1c2530"],
  },
  clockwork: {
    entrance: "Somewhere below, something enormous keeps excellent time.",
    tints: [
      "the sconces relight one corridor ahead",
      "a seam in the wall exhales, warm and oiled, on the count of eight",
      "gears turn behind the plaster, patient and precise",
      "every door here closes on its own schedule, not yours",
      "brass fittings tick faintly even at rest",
      "the air smells of oil and warm metal",
      "a rhythm underlies the whole place, felt more than heard",
      "dust never settles evenly — something keeps sweeping certain paths clean",
    ],
    threatBias: ["construct"],
    reskinVerb: "the same threat, geared and ticking — moving on the complex's own schedule",
    hazardTint: { prefix: "the mechanism underfoot shifts on its own timetable" },
    palette: ["#3a2a1a","#8a6a3a","#c9a45c","#1a1410"],
  },
  consecrated: {
    entrance: "The threshold has been kissed smooth by ten thousand foreheads.",
    tints: [
      "the candle stubs are all the same holy inch",
      "your footsteps hush themselves out of respect you don't feel yet",
      "the air carries old incense, faint but unmistakable",
      "every worn surface has been worn by devotion, not neglect",
      "a stillness sits over the space that feels attended, not empty",
      "carved names crowd every dedicated surface, generations deep",
      "light behaves gently here, softened rather than merely dim",
      "the quiet asks something of you before you've decided to give it",
    ],
    threatBias: ["celestial","fiend"],
    reskinVerb: "the same threat, robed in the old rites — moving like it still remembers being watched",
    hazardTint: { prefix: "the worn stone underfoot is smooth enough to betray a hurried step" },
    palette: ["#f4ecd8","#d8c48a","#9c8348","#2e2716"],
  },
  timelost: {
    entrance: "The dust hangs mid-fall, deciding.",
    tints: [
      "the torch brackets hold torches at three different centuries of burn",
      "your footprints age behind you",
      "a held moment repeats itself just slightly, like a skipped page",
      "objects here wear decades unevenly, some fresh, some ancient, side by side",
      "clocks and shadows disagree with each other by hours",
      "sound takes a beat too long to catch up to its cause",
      "the air has the stillness of a held breath that's forgotten to exhale",
      "faces in old portraits seem to have shifted expression since you last looked",
    ],
    threatBias: ["undead","aberration"],
    reskinVerb: "the same threat, unstuck in time — a half-step out of the present moment",
    hazardTint: { prefix: "the footing itself seems uncertain what age it's standing in" },
    palette: ["#5a4a3a","#8a7860","#c9b896","#2a2018"],
  },
  none: {
    entrance: null,
    tints: [],
    threatBias: [],
    reskinVerb: null,
    hazardTint: null,
    palette: [],
  },
};

// resolve a motif key to its kit, falling back to `none` for an unknown/absent key (forward-compatible:
// SKIN-GRANTS.md §1 "unknown grant token → log + no-op" discipline extended to motif keys).
function skinMotifKit(key){
  return SKIN_MOTIF_KITS[key] || SKIN_MOTIF_KITS.none;
}
