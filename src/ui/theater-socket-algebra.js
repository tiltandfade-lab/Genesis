/* GENESIS MODULE — src/ui/theater-socket-algebra.js
   ══════════════════════════════════════════════════════════════════════════════════════════════
   THE ONE SOCKET VOCABULARY.  Authority: docs/CLAYROOM-PROOF-BACKLOG.md § A1 "One socket algebra"
   (Tier 0, root of the clayroom architectural backlog; blocks A2, A4, A5, A6, A7, A8, A12), whose
   Decision-log row D1 this module implements.  Secondary authorities it reconciles:
     · docs/KENNEY-SOCKET-WAVE.md KS-1 — Adam's ruling "adopt their conventions, don't invent a
       schema".  Honoured literally: every TYPE NAME below is a name some live writer already
       emits.  Only the RECORD SHAPE is unified.  No type was renamed to suit this module.
     · docs/STRUCTURE-KIT-CATALOG.md §4 — "One merged registry, one authority, owed at C1H
       validator time."  This file is that registry; dev/verify-socket-algebra.mjs is that
       validator.
     · docs/ART-DIRECTION-CANON.md — `SOCKET` is a protected production scope the Clayroom must
       not silently rewrite.  A persisted socket record now exists to be protected.
   Status: PROPOSED (docs/DESIGN.md, dated entry).  Codex revision invited.

   ── WHAT A SOCKET IS, PHYSICALLY ───────────────────────────────────────────────────────────────
   A builder does not "attach"; he SEATS one thing into a prepared receiver.  A hinge pin drops
   into a knuckle.  A joist end sits in a pocket.  A sconce bracket takes two lead anchors at a
   known height on a known face.  A wall run butts a quoin at a known plane.  Every entry in
   SOCKET_TYPES below therefore carries a `join:` line naming the real-world join it represents;
   a socket kind with no honest physical join is either an ORIGIN (a declared emission point that
   seats nothing) or a DECLARED-OPEN (a face deliberately left unterminated), and both are marked
   `seating: false` rather than pretended into receivers.

   ── THE RECORD (A1's shape, verbatim, plus two recorded additions) ─────────────────────────────
     {
       id,                                  // stable within the owner, e.g. "butt-join-e#0"
       type,                                // a registered SOCKET_TYPES id — the kit's own name
       ownerRef,                            // what carries it: "procedural:axle", "donor:pack/slug"
       frame: { position:[x,y,z],           // owner-local, world units (1 unit = one 5-ft cell)
                normal:[x,y,z],             // unit; the direction the RECEIVER FACES
                tangent:[x,y,z] },          // unit; in-face reference axis (a hinge's PIN AXIS)
       accepts: [typeIds],                  // which socket types may legally seat INTO this one
       capacity: n,                         // how many may be seated at once (0 = seats nothing)
       occupiedBy: [refs],                  // ADDITION 1 — see below
       envelope: {…}|null,                  // ADDITION 2 — see below
       scaleRule: "fixed"|"stretch-u"|"stretch-uv",
       provenance: { source, version, frameSource }
     }

   ADDITION 1 — `occupiedBy` is an ARRAY, not A1's literal `refOrNull`.  Grounds: A1's own
   `capacity: n` is unrepresentable by a single ref once n > 1, and A1's stated purpose for the
   pair ("makes representation 4's one-slot-per-wall limit VISIBLE instead of silent") requires
   counting.  `null` normalises to `[]`.  Codex revision invited.

   ADDITION 2 — `envelope` carries the dimensional clearance a receiver offers (radius / width /
   height / span / pitchRadius).  Grounds: (a) A1's "a rule about what may enter it" is only half
   expressible by type — a shaft too fat for a bore is a construction error no type check catches;
   (b) theater-procedural-kit.js ALREADY emits these numbers as loose `extra` keys today, so
   dropping them at migration would be a regression, not a simplification.  Codex revision invited.

   `provenance.frameSource` records HOW the frame was obtained — "authored" | "euler" | "measured"
   | "type-default".  Donor pieces stamped by build/normalize-donors.py carry POSITION ONLY; their
   normal/tangent is derived from the type's declared default.  That is a real weakness and it is
   recorded in the record rather than hidden by a plausible-looking vector.

   ── THE FRAME CONVENTION (the yaw-correctness rule) ────────────────────────────────────────────
   `normal` is the direction the receiver faces — out of the receiving face, along which a mating
   part approaches.  `tangent` is the receiver's in-face reference axis: for a pin join it IS the
   pin axis; for a run end it is the joint plane's up; for a bearing plane it is the in-plane
   heading (default -Z = north).  `right = tangent × normal` completes a right-handed basis in
   which (right, tangent, normal) are the seated child's local (+X, +Y, +Z).  Consequence: a wall
   mount is correct at ANY yaw, including non-axis-aligned faces, because nothing anywhere assumes
   a world axis.  A caller that wants three.js Euler XYZ back gets it from socketEulerXYZ(), which
   round-trips the pre-migration `rotation:[x,y,z]` triples exactly (proven by the validator).

   ── WHY THIS MODULE IMPORTS NOTHING ────────────────────────────────────────────────────────────
   Zero dependencies (no three, no DOM).  That is deliberate: the contract must be checkable by a
   plain `node` process, so dev/verify-socket-algebra.mjs is a fast CI-safe harness rather than
   another puppeteer/browser harness.  Vector maths here is 12 lines of arithmetic; importing a
   renderer to add three floats would put the contract behind a GPU.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

export const SOCKET_ALGEBRA_VERSION = 1;

/* ── join classes ──────────────────────────────────────────────────────────────────────────────
   A small closed set of PHYSICAL join kinds.  `receives` is the mating table: which classes may
   seat into this one.  Per-type `accepts` lists are expanded from it at module init, so the
   record still carries the flat `accepts: [typeIds]` A1 asked for while the rule stays authored
   in one place.  `seating:false` means the kind is a declaration, not a receiver. */
export const SOCKET_JOIN_CLASSES = Object.freeze({
  "bearing-plane": Object.freeze({
    join: "a prepared horizontal face that carries weight downward — a slab, a landing, a bed",
    receives: Object.freeze(["fastener-foot", "bearing-plane", "shaft-end", "station", "load-bed"]),
    seating: true, defaultNormal: [0, 1, 0], defaultTangent: [0, 0, -1], scaleRule: "stretch-uv",
  }),
  "wall-face": Object.freeze({
    join: "a vertical face prepared to take anchors at a known height — two lead anchors, a bracket bed",
    receives: Object.freeze(["fastener-foot", "pin-axis", "keeper", "load-bed"]),
    seating: true, defaultNormal: [0, 0, -1], defaultTangent: [0, 1, 0], scaleRule: "fixed",
  }),
  "run-end": Object.freeze({
    join: "the end plane of a run — a wall butting a quoin, a roof plane meeting an eave, a foundation meeting ground",
    receives: Object.freeze(["run-end"]),
    seating: true, defaultNormal: [0, 0, -1], defaultTangent: [0, 1, 0], scaleRule: "stretch-u",
  }),
  "pin-axis": Object.freeze({
    join: "a knuckle — a pin dropped through aligned barrels so one member swings about the other",
    receives: Object.freeze(["pin-axis"]),
    seating: true, defaultNormal: [0, 0, -1], defaultTangent: [0, 1, 0], scaleRule: "fixed",
  }),
  bore: Object.freeze({
    join: "a hole, journal or pocket that receives a member end — a hub bore, a bearing journal, a joist pocket",
    receives: Object.freeze(["shaft-end"]),
    seating: true, defaultNormal: [0, 0, 1], defaultTangent: [0, 1, 0], scaleRule: "fixed",
  }),
  "shaft-end": Object.freeze({
    join: "the end of a member that enters a bore or stands on a plate — a shaft end, a post foot, a spike tip",
    receives: Object.freeze(["bore", "bearing-plane"]),
    seating: true, defaultNormal: [0, 0, 1], defaultTangent: [0, 1, 0], scaleRule: "fixed",
  }),
  "fastener-foot": Object.freeze({
    join: "a bolted, strapped or lashed foot that fixes one member onto another's face",
    receives: Object.freeze(["bearing-plane", "wall-face"]),
    seating: true, defaultNormal: [0, -1, 0], defaultTangent: [0, 0, -1], scaleRule: "fixed",
  }),
  "line-terminal": Object.freeze({
    join: "where a flexible member is made off or turned — a fairlead throat, a spool tangent, a shackle eye",
    receives: Object.freeze(["line-terminal"]),
    seating: true, defaultNormal: [0, 0, 1], defaultTangent: [0, 1, 0], scaleRule: "fixed",
  }),
  "load-bed": Object.freeze({
    join: "a holding allocation — the volume or bed a load occupies (A7 owns the real counts)",
    receives: Object.freeze(["load-bed", "bearing-plane"]),
    seating: true, defaultNormal: [0, 1, 0], defaultTangent: [0, 0, -1], scaleRule: "stretch-uv",
  }),
  keeper: Object.freeze({
    join: "a prepared feature that arrests a load — a latch strike, a ratchet tooth, a grapple purchase (§6a)",
    receives: Object.freeze(["keeper"]),
    seating: true, defaultNormal: [0, 0, -1], defaultTangent: [0, 1, 0], scaleRule: "fixed",
  }),
  station: Object.freeze({
    join: "a reserved standing/reaching position — where a body stands, where a hand reaches, a threshold",
    receives: Object.freeze(["figure-base"]),
    seating: true, defaultNormal: [0, 1, 0], defaultTangent: [0, 0, -1], scaleRule: "fixed",
  }),
  "figure-base": Object.freeze({
    join: "a figure's own attachment frame — the seven frozen body anchors (theater-parts.js)",
    receives: Object.freeze(["figure-base"]),
    seating: true, defaultNormal: [0, 0, -1], defaultTangent: [0, 1, 0], scaleRule: "fixed",
  }),
  origin: Object.freeze({
    join: "NOT A JOIN — a declared emission point (flame, light, signal). Seats nothing, ever.",
    receives: Object.freeze([]),
    seating: false, defaultNormal: [0, 1, 0], defaultTangent: [0, 0, -1], scaleRule: "fixed",
  }),
  "declared-open": Object.freeze({
    join: "NOT A JOIN — a face or aperture deliberately left unterminated, or a clear passage envelope",
    receives: Object.freeze([]),
    seating: false, defaultNormal: [0, 0, -1], defaultTangent: [0, 1, 0], scaleRule: "stretch-u",
  }),
});

/* ── the registry ──────────────────────────────────────────────────────────────────────────────
   Rows: [ typeId, joinClass, physical-join restatement, overrides? ]
   `sources` records which of A1's seven representations already emits the name — that is what
   makes this a MERGED registry rather than a new eighth vocabulary.  Overrides may set
   `normal` / `tangent` / `capacity` / `scaleRule` / `accepts` / `aliasOf`.

   ALIASES.  Three Meshy-pack names are the same join as an existing structural name.  They are
   registered as first-class rows with `aliasOf` set rather than renamed in the data, because
   Adam's KS-1 ruling forbids inventing schema over a donor's own conventions; the alias makes the
   equivalence explicit and machine-readable instead of silent.  socketsOfKind() resolves aliases.

   THE ONE GENUINE COLLISION.  `catch` is emitted by BOTH the procedural kit (a latch's strike
   keeper) AND the structure catalog (a grapple purchase, §6a).  Physically these are the same
   thing — a prepared feature that arrests a load under tension — so the registry keeps ONE row
   with both readings named, rather than forking the name or silently privileging one caller.
   The figure anchors (rep 3) are namespaced `figure:*` because THREE of their seven frozen names
   (`head`, `base`, `mount`) collide with kit names carrying different joins; merging those flat
   would produce exactly the "a joist pocket that accepts a sconce" error A1 opens with. */
const TYPE_ROWS = [
  // ── architectural: the Kenney/structure vocabulary (reps 2, 5, 6) ───────────────────────────
  ["floor-mount", "bearing-plane", "the piece's underside bearing plane — a sill plate resting on the slab", { sources: ["kit", "donor", "structure", "meshy"] }],
  ["top-surface", "bearing-plane", "the finished top of a slab or landing — what the next storey bears on", { sources: ["donor", "structure", "meshy"] }],
  ["walk-surface", "bearing-plane", "the standable contract (§6 access classes) — a tread or deck a body may stand on", { sources: ["structure"] }],
  ["wall-mount", "wall-face", "two lead anchors at a known height on a known vertical face — a sconce bracket bed", { sources: ["structure", "meshy", "room-mesh"] }],
  ["butt-join-n", "run-end", "the run's NORTH end plane — butts the south end of the next piece", { normal: [0, 0, -1], accepts: ["butt-join-s", "terrain-join", "roof-pitch-join", "corner", "join-west", "join-east"], sources: ["donor", "structure"] }],
  ["butt-join-s", "run-end", "the run's SOUTH end plane — butts the north end of the next piece", { normal: [0, 0, 1], accepts: ["butt-join-n", "terrain-join", "roof-pitch-join", "corner", "join-west", "join-east"], sources: ["donor", "structure"] }],
  ["butt-join-e", "run-end", "the run's EAST end plane — butts the west end of the next piece", { normal: [1, 0, 0], accepts: ["butt-join-w", "terrain-join", "roof-pitch-join", "corner", "join-west"], sources: ["donor", "structure"] }],
  ["butt-join-w", "run-end", "the run's WEST end plane — butts the east end of the next piece", { normal: [-1, 0, 0], accepts: ["butt-join-e", "terrain-join", "roof-pitch-join", "corner", "join-east"], sources: ["donor", "structure"] }],
  ["join-west", "run-end", "Meshy pack's own west end plane — the same join as butt-join-w", { normal: [-1, 0, 0], aliasOf: "butt-join-w", sources: ["meshy"] }],
  ["join-east", "run-end", "Meshy pack's own east end plane — the same join as butt-join-e", { normal: [1, 0, 0], aliasOf: "butt-join-e", sources: ["meshy"] }],
  ["join-top", "bearing-plane", "Meshy pack's own upper bearing face — the same join as top-surface", { aliasOf: "top-surface", sources: ["meshy"] }],
  ["terrain-join", "run-end", "a structure's foot meeting ground that is not a slab — a rubble/rock transition", { sources: ["structure"] }],
  ["roof-pitch-join", "run-end", "an eave or ridge line where a roof plane meets a wall head or another plane", { sources: ["structure"] }],
  ["corner", "run-end", "a quoin return — where two runs change direction and share a corner mass", { sources: ["kit", "structure"] }],
  ["hinge", "pin-axis", "a knuckle — the pin line a door or gate leaf swings about", { tangent: [0, 1, 0], sources: ["donor", "structure", "meshy"] }],
  ["open", "declared-open", "a face DELIBERATELY left unterminated — a declared absence, not a missing socket", { sources: ["structure"] }],
  ["entrance", "station", "a doorway threshold — where a body crosses into the piece", { sources: ["meshy"] }],

  // ── mechanical: the procedural kit's own vocabulary (rep 1) ──────────────────────────────────
  ["axle", "bore", "the hub bore — the hole a wheel turns on", { sources: ["kit"] }],
  ["bearing", "bore", "a bearing-block journal — the seat a turning shaft rides in", { sources: ["kit"] }],
  ["jaw", "bore", "a clamp's throat — the opening that closes on a workpiece", { sources: ["kit"] }],
  ["mesh", "bore", "a gear's pitch contact — where a mating tooth form enters", { sources: ["kit"] }],
  ["set-screw", "bore", "a tapped hole taking the screw that locks a collar to its shaft", { sources: ["kit"] }],
  ["shaft", "shaft-end", "a shaft end entering a bore or bearing", { sources: ["kit"] }],
  ["shaft-left", "shaft-end", "the LEFT shaft end of a two-ended member", { normal: [-1, 0, 0], sources: ["kit"] }],
  ["shaft-right", "shaft-end", "the RIGHT shaft end of a two-ended member", { normal: [1, 0, 0], sources: ["kit"] }],
  ["wheel-left", "bore", "the axle's prepared LEFT wheel seat — a shouldered journal with a retaining collar", { sources: ["kit"] }],
  ["wheel-right", "bore", "the axle's prepared RIGHT wheel seat", { sources: ["kit"] }],
  ["chassis", "bearing-plane", "the underside a running gear bolts up to — a cart bed's frame face", { normal: [0, -1, 0], sources: ["kit"] }],
  ["mount", "fastener-foot", "a bolted foot fixing a member onto another's face", { sources: ["kit"] }],
  ["mount-left", "fastener-foot", "the LEFT bolted foot of a two-footed member", { sources: ["kit"] }],
  ["mount-right", "fastener-foot", "the RIGHT bolted foot of a two-footed member", { sources: ["kit"] }],
  ["pivot", "pin-axis", "a lever fulcrum — the pin the arm rocks about", { sources: ["kit"] }],
  ["pin", "pin-axis", "a retaining pin's seat — the drilled line a quick-release pin drops through", { sources: ["kit"] }],
  ["hinge-axis", "pin-axis", "the kit's own hinge pin line — the same join as `hinge`", { tangent: [0, 1, 0], aliasOf: "hinge", sources: ["kit"] }],
  ["fixed-leaf", "pin-axis", "the hinge plate screwed to the FRAME — the half that does not move", { sources: ["kit"] }],
  ["moving-leaf", "pin-axis", "the hinge plate screwed to the LEAF — the half that swings", { sources: ["kit"] }],
  ["fixed", "keeper", "a latch's fixed plate — the half screwed to the jamb", { sources: ["kit"] }],
  ["catch", "keeper", "a keeper that arrests a load under tension: the latch's strike (kit) AND the grapple purchase on a wall head (structure §6a) — one join, two readings", { sources: ["kit", "structure"] }],
  ["strike", "keeper", "the struck face — where a tongue, tooth or head lands", { sources: ["kit"] }],
  ["ratchet-contact", "keeper", "the pawl's tooth contact — the one-way arrest", { sources: ["kit"] }],
  ["bow", "line-terminal", "a shackle's bow — the curved bearing the pin closes across", { sources: ["kit"] }],

  // ── routing: flexible members (rep 1) ────────────────────────────────────────────────────────
  ["rope", "line-terminal", "where a rope is made off to the fitting", { sources: ["kit"] }],
  ["rope-anchor", "line-terminal", "the fixed made-off end of a rope", { sources: ["kit"] }],
  ["rope-entry", "line-terminal", "the throat a rope enters — a fairlead or sheave lead-in", { sources: ["kit"] }],
  ["rope-exit", "line-terminal", "the throat a rope leaves", { sources: ["kit"] }],
  ["rope-left", "line-terminal", "the LEFT rope terminal of a two-legged bridle", { sources: ["kit"] }],
  ["rope-right", "line-terminal", "the RIGHT rope terminal of a two-legged bridle", { sources: ["kit"] }],
  ["chain-entry", "line-terminal", "the throat a chain enters — a sprocket or guide lead-in", { sources: ["kit"] }],
  ["chain-exit", "line-terminal", "the throat a chain leaves", { sources: ["kit"] }],
  ["line-entry", "line-terminal", "the throat a generic line enters", { sources: ["kit"] }],
  ["line-exit", "line-terminal", "the throat a generic line leaves", { sources: ["kit"] }],
  ["line-start", "line-terminal", "a spool's tangent point where the line begins", { sources: ["kit"] }],
  ["start", "line-terminal", "the first point of a swept path (rope/chain run)", { sources: ["kit"] }],
  ["end", "line-terminal", "the last point of a swept path (rope/chain run)", { sources: ["kit"] }],
  ["end-a", "line-terminal", "terminal A of a two-ended flexible or rigid link", { sources: ["kit"] }],
  ["end-b", "line-terminal", "terminal B of a two-ended flexible or rigid link", { sources: ["kit"] }],
  ["suspension", "fastener-foot", "the hook's own hanging point — where the hook takes its own load", { normal: [0, 1, 0], sources: ["kit"] }],
  ["strap", "fastener-foot", "a lashing point — where a strap passes and takes tension", { sources: ["kit"] }],
  ["strap-fixed", "fastener-foot", "the sewn/riveted end of a strap", { sources: ["kit"] }],
  ["strap-adjustable", "fastener-foot", "the free end of a strap taken up by a buckle", { sources: ["kit"] }],
  ["tow-point", "line-terminal", "the towing eye a draught line makes off to", { sources: ["meshy"] }],

  // ── load / cargo (reps 1, 6) ─────────────────────────────────────────────────────────────────
  ["load", "load-bed", "the bearing point a hung or borne load acts through", { sources: ["kit"] }],
  ["load-front", "load-bed", "the FRONT bearing point of a two-point load", { sources: ["kit"] }],
  ["load-rear", "load-bed", "the REAR bearing point of a two-point load", { sources: ["kit"] }],
  ["cargo", "load-bed", "one divided cargo slot on a rack", { sources: ["kit"] }],
  ["contents", "load-bed", "a container's interior holding volume", { sources: ["kit"] }],
  ["supply", "load-bed", "a stores allocation on a Meshy silhouette piece", { sources: ["meshy"] }],
  ["cargo-bed", "load-bed", "a flat bed a load is set down on", { sources: ["meshy"] }],
  ["stack-top", "bearing-plane", "the top of a stack — where the next item in the stack bears", { sources: ["meshy"] }],

  // ── occupancy / interaction (reps 1, 6) ──────────────────────────────────────────────────────
  ["occupant", "station", "a reserved standing position at the piece", { sources: ["kit", "meshy"] }],
  ["interaction", "station", "where a hand reaches to work the piece — the exact interaction reach", { sources: ["meshy"] }],
  ["hand", "station", "the grip — where a hand closes on the member", { sources: ["kit"] }],
  ["repair", "station", "where repair material is applied to the piece", { sources: ["kit"] }],
  ["passage", "declared-open", "the clear opening THROUGH a barrier — an envelope, not a seat", { sources: ["kit"] }],
  ["concealment", "station", "a hiding allocation — the volume a body or item may be concealed within", { sources: ["prop-library"] }],

  // ── member ends, faces, edges (rep 1) ────────────────────────────────────────────────────────
  ["base", "shaft-end", "a member's ground-bearing foot", { normal: [0, -1, 0], sources: ["kit"] }],
  ["tip", "shaft-end", "a member's free far end", { normal: [0, 1, 0], sources: ["kit"] }],
  ["head", "shaft-end", "a struck member's head — a hammer or maul head boss", { sources: ["kit"] }],
  ["post", "shaft-end", "a post foot entering a cup or socket in the ground", { normal: [0, 1, 0], sources: ["kit"] }],
  ["top", "bearing-plane", "the finished top of a cap or post", { sources: ["kit"] }],
  ["top-edge", "bearing-plane", "the upper edge a sign or banner is hung from", { sources: ["kit"] }],
  ["ground-contact", "shaft-end", "the runner or foot face that rides on the ground", { normal: [0, -1, 0], sources: ["kit"] }],
  ["wall", "fastener-foot", "the face of a bracket that goes against the wall", { sources: ["kit"] }],
  ["outer-face", "wall-face", "the outward face of a disc or plate", { sources: ["kit"] }],
  ["face-a", "wall-face", "plate face A of a corner plate", { sources: ["kit"] }],
  ["face-b", "wall-face", "plate face B of a corner plate", { sources: ["kit"] }],
  ["edge-horizontal", "run-end", "a gusset's horizontal edge — the leg that lands on the rail", { sources: ["kit"] }],
  ["edge-vertical", "run-end", "a gusset's vertical edge — the leg that lands on the post", { sources: ["kit"] }],
  ["surface-mount", "wall-face", "a decal's own mounting face — flush against a host surface", { sources: ["kit"] }],
  ["display-face", "wall-face", "the reading face of a sign or notice", { sources: ["meshy"] }],
  ["writing-surface", "bearing-plane", "the working top of a lectern or desk", { sources: ["meshy"] }],

  // ── origins: declared emission points, NOT receivers (reps 1, 6) ─────────────────────────────
  ["effect-origin", "origin", "the emission point of a procedural FX volume", { sources: ["kit"] }],
  ["flame-origin", "origin", "where a flame is emitted", { sources: ["meshy"] }],
  ["fire-origin", "origin", "where a fire is emitted (forge/hearth)", { sources: ["meshy"] }],
  ["light-origin", "origin", "where a practical light is emitted", { sources: ["meshy"] }],
  ["signal-origin", "origin", "where a signal (bell, horn) is emitted", { sources: ["meshy"] }],
  ["signal-top", "origin", "the high emission point of a signal piece", { sources: ["meshy"] }],
  ["loot-origin", "origin", "where loot is presented for taking — a declared point, not a receiver (EXTRUDED-SPRITE-PROP-LIBRARY §6)", { sources: ["prop-library"] }],

  // ── figures: rep 3, namespaced (three of the seven frozen names collide with kit names) ───────
  ["figure:mainHand", "figure-base", "the main hand's grip frame on a body", { sources: ["figure"] }],
  ["figure:offHand", "figure-base", "the off hand's grip frame on a body", { sources: ["figure"] }],
  ["figure:back", "figure-base", "the back-carry frame on a body", { sources: ["figure"] }],
  ["figure:head", "figure-base", "the head attachment frame on a body", { sources: ["figure"] }],
  ["figure:shoulders", "figure-base", "the shoulder attachment frame on a body", { sources: ["figure"] }],
  ["figure:base", "figure-base", "the body's own ground frame — what stands on a station", { normal: [0, -1, 0], sources: ["figure"] }],
  ["figure:mount", "figure-base", "the riding frame on a body", { sources: ["figure"] }],
];

function buildRegistry() {
  const byClassMembers = {};
  for (const [typeId, cls] of TYPE_ROWS.map((r) => [r[0], r[1]])) {
    (byClassMembers[cls] ||= []).push(typeId);
  }
  const out = {};
  for (const [typeId, cls, join, over] of TYPE_ROWS) {
    const klass = SOCKET_JOIN_CLASSES[cls];
    if (!klass) throw new Error(`socket-algebra: type ${typeId} names unknown join class ${cls}`);
    const o = over || {};
    let accepts = o.accepts;
    if (!accepts) {
      accepts = [];
      for (const rc of klass.receives) for (const m of (byClassMembers[rc] || [])) accepts.push(m);
    }
    out[typeId] = Object.freeze({
      type: typeId,
      joinClass: cls,
      join,
      seating: o.seating != null ? o.seating : klass.seating,
      aliasOf: o.aliasOf || null,
      accepts: Object.freeze(accepts.slice().sort()),
      capacity: o.capacity != null ? o.capacity : (klass.seating ? 1 : 0),
      scaleRule: o.scaleRule || klass.scaleRule,
      defaultNormal: Object.freeze((o.normal || klass.defaultNormal).slice()),
      defaultTangent: Object.freeze((o.tangent || klass.defaultTangent).slice()),
      sources: Object.freeze((o.sources || []).slice()),
    });
  }
  return Object.freeze(out);
}

export const SOCKET_TYPES = buildRegistry();
export const SOCKET_SCALE_RULES = Object.freeze(["fixed", "stretch-u", "stretch-uv"]);
export const SOCKET_FRAME_SOURCES = Object.freeze(["authored", "euler", "measured", "type-default"]);

export function socketTypeInfo(type) {
  return SOCKET_TYPES[type] || null;
}
/** Resolve an alias to the type id that owns the join law (e.g. "join-west" -> "butt-join-w"). */
export function socketCanonicalType(type) {
  const info = SOCKET_TYPES[type];
  if (!info) return type;
  return info.aliasOf || type;
}

/* ── vector helpers (no dependency; three floats do not need a renderer) ───────────────────────── */
function vec3(v, fallback) {
  if (Array.isArray(v) && v.length >= 3) return [+v[0] || 0, +v[1] || 0, +v[2] || 0];
  if (v && typeof v === "object" && ("x" in v || "y" in v || "z" in v)) return [+v.x || 0, +v.y || 0, +v.z || 0];
  return fallback ? fallback.slice() : [0, 0, 0];
}
function norm(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return l > 1e-9 ? [v[0] / l, v[1] / l, v[2] / l] : null;
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
/** Gram-Schmidt: make `t` unit and perpendicular to unit `n`; fall back to any perpendicular. */
function orthoTangent(n, t) {
  const raw = t ? norm(t) : null;
  if (raw) {
    const d = dot(raw, n);
    const proj = norm([raw[0] - d * n[0], raw[1] - d * n[1], raw[2] - d * n[2]]);
    if (proj) return proj;
  }
  const seed = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [0, 0, -1];
  const d = dot(seed, n);
  return norm([seed[0] - d * n[0], seed[1] - d * n[1], seed[2] - d * n[2]]) || [0, 1, 0];
}

/* ── three.js Euler XYZ <-> basis (exact; mirrors Matrix4.makeRotationFromEuler / Euler.setFromRotationMatrix) ── */
/** Basis columns (localX, localY, localZ) for a three.js Euler XYZ triple. */
export function socketBasisFromEuler(euler) {
  const [x, y, z] = vec3(euler, [0, 0, 0]);
  const a = Math.cos(x), b = Math.sin(x), c = Math.cos(y), d = Math.sin(y), e = Math.cos(z), f = Math.sin(z);
  const ae = a * e, af = a * f, be = b * e, bf = b * f;
  return {
    right: [c * e, af + be * d, bf - ae * d],
    tangent: [-c * f, ae - bf * d, be + af * d],
    normal: [d, -b * c, a * c],
  };
}
/** The seated child's local axes: right = +X, tangent = +Y, normal = +Z. */
export function socketBasis(record) {
  const n = record.frame.normal, t = record.frame.tangent;
  return { right: cross(t, n), tangent: t.slice(), normal: n.slice() };
}
/** three.js Euler XYZ for a record's frame — round-trips the pre-migration `rotation` triples. */
export function socketEulerXYZ(record) {
  const { right, tangent, normal } = socketBasis(record);
  const m11 = right[0], m21 = right[1], m31 = right[2];
  const m12 = tangent[0], m22 = tangent[1], m32 = tangent[2];
  const m13 = normal[0], m23 = normal[1], m33 = normal[2];
  const y = Math.asin(Math.max(-1, Math.min(1, m13)));
  if (Math.abs(m13) < 0.9999999) return [Math.atan2(-m23, m33), y, Math.atan2(-m12, m11)];
  return [Math.atan2(m32, m22), y, 0];
}

/* ── the funnel ─────────────────────────────────────────────────────────────────────────────────
   EVERY socket record in Genesis is born here.  A writer that hand-rolls the object literal is a
   bug shape, and dev/verify-socket-algebra.mjs fails on it (the same "normalization lives at the
   contract boundary, not in handlers" discipline CLAUDE.md already binds the DM payload path to). */
export function makeSocket(spec) {
  const type = spec && spec.type;
  const info = SOCKET_TYPES[type];
  if (!info) throw new Error(`socket-algebra: unregistered socket type "${type}" (register it in SOCKET_TYPES — see docs/CLAYROOM-PROOF-BACKLOG.md A1)`);

  let frameSource = spec.frameSource || null;
  let normalRaw = spec.normal;
  let tangentRaw = spec.tangent;
  if (spec.euler != null && normalRaw == null && tangentRaw == null) {
    const b = socketBasisFromEuler(spec.euler);
    normalRaw = b.normal; tangentRaw = b.tangent;
    frameSource ||= "euler";
  }
  if (normalRaw == null) { normalRaw = info.defaultNormal; frameSource ||= "type-default"; }
  if (tangentRaw == null) { tangentRaw = info.defaultTangent; frameSource ||= "type-default"; }
  frameSource ||= "authored";

  const normal = norm(vec3(normalRaw, info.defaultNormal.slice())) || info.defaultNormal.slice();
  const tangent = orthoTangent(normal, vec3(tangentRaw, info.defaultTangent.slice()));

  const capacity = spec.capacity != null ? spec.capacity : info.capacity;
  return {
    id: spec.id || `${type}#${spec.ordinal != null ? spec.ordinal : 0}`,
    type,
    ownerRef: spec.ownerRef != null ? spec.ownerRef : null,
    frame: { position: vec3(spec.position, [0, 0, 0]), normal, tangent },
    accepts: spec.accepts ? spec.accepts.slice() : info.accepts.slice(),
    capacity,
    occupiedBy: spec.occupiedBy ? spec.occupiedBy.slice() : [],
    envelope: spec.envelope && Object.keys(spec.envelope).length ? Object.assign({}, spec.envelope) : null,
    scaleRule: spec.scaleRule || info.scaleRule,
    provenance: {
      source: (spec.provenance && spec.provenance.source) || spec.source || "unknown",
      version: (spec.provenance && spec.provenance.version) != null ? spec.provenance.version : SOCKET_ALGEBRA_VERSION,
      frameSource: (spec.provenance && spec.provenance.frameSource) || frameSource,
    },
  };
}

/* ── validation ─────────────────────────────────────────────────────────────────────────────── */
const UNIT_EPS = 1e-6;
export function validateSocket(record, label) {
  const errs = [];
  const at = label ? `${label}: ` : "";
  if (!record || typeof record !== "object") return [`${at}not an object`];
  const info = SOCKET_TYPES[record.type];
  if (!info) errs.push(`${at}unregistered type "${record.type}"`);
  if (typeof record.id !== "string" || !record.id) errs.push(`${at}missing id`);
  if (!("ownerRef" in record)) errs.push(`${at}missing ownerRef`);
  const f = record.frame;
  if (!f || typeof f !== "object") { errs.push(`${at}missing frame{position,normal,tangent}`); return errs; }
  for (const k of ["position", "normal", "tangent"]) {
    if (!Array.isArray(f[k]) || f[k].length !== 3 || f[k].some((v) => typeof v !== "number" || !Number.isFinite(v))) {
      errs.push(`${at}frame.${k} is not a finite [x,y,z]`);
    }
  }
  if (Array.isArray(f.normal) && f.normal.length === 3 && Math.abs(Math.hypot(...f.normal) - 1) > UNIT_EPS) errs.push(`${at}frame.normal is not unit length`);
  if (Array.isArray(f.tangent) && f.tangent.length === 3 && Math.abs(Math.hypot(...f.tangent) - 1) > UNIT_EPS) errs.push(`${at}frame.tangent is not unit length`);
  if (Array.isArray(f.normal) && Array.isArray(f.tangent) && Math.abs(dot(f.normal, f.tangent)) > UNIT_EPS) errs.push(`${at}frame.normal and frame.tangent are not perpendicular`);
  if (!Array.isArray(record.accepts)) errs.push(`${at}accepts is not an array`);
  else for (const a of record.accepts) if (!SOCKET_TYPES[a]) errs.push(`${at}accepts unregistered type "${a}"`);
  if (!Number.isInteger(record.capacity) || record.capacity < 0) errs.push(`${at}capacity is not a non-negative integer`);
  if (!Array.isArray(record.occupiedBy)) errs.push(`${at}occupiedBy is not an array`);
  else if (record.occupiedBy.length > record.capacity) errs.push(`${at}occupiedBy (${record.occupiedBy.length}) exceeds capacity (${record.capacity})`);
  if (!SOCKET_SCALE_RULES.includes(record.scaleRule)) errs.push(`${at}scaleRule "${record.scaleRule}" is not one of ${SOCKET_SCALE_RULES.join("|")}`);
  if (record.envelope != null && typeof record.envelope !== "object") errs.push(`${at}envelope is neither null nor an object`);
  const p = record.provenance;
  if (!p || typeof p !== "object") errs.push(`${at}missing provenance{source,version,frameSource}`);
  else {
    if (!p.source) errs.push(`${at}provenance.source is empty`);
    if (typeof p.version !== "number") errs.push(`${at}provenance.version is not a number`);
    if (!SOCKET_FRAME_SOURCES.includes(p.frameSource)) errs.push(`${at}provenance.frameSource "${p.frameSource}" is not one of ${SOCKET_FRAME_SOURCES.join("|")}`);
  }
  if (info && !info.seating && record.capacity !== 0) errs.push(`${at}type "${record.type}" is non-seating (${info.joinClass}) but declares capacity ${record.capacity}`);
  return errs;
}
export function validateSocketRecords(list, label) {
  const errs = [];
  if (!Array.isArray(list)) return [`${label || "socket list"}: not an array`];
  const seen = new Set();
  list.forEach((r, i) => {
    errs.push(...validateSocket(r, `${label || "socket"}[${i}]`));
    if (r && r.id) {
      if (seen.has(r.id)) errs.push(`${label || "socket"}[${i}]: duplicate socket id "${r.id}" on one owner`);
      seen.add(r.id);
    }
  });
  return errs;
}

/* ── seating (the typed rejection A1's illegal-pairing capture needs) ──────────────────────────── */
export function canSeat(parentSocket, childSocket) {
  if (!parentSocket || !childSocket) return { ok: false, reason: "missing-socket", detail: "seat needs both a parent and a child socket" };
  const pInfo = SOCKET_TYPES[parentSocket.type], cInfo = SOCKET_TYPES[childSocket.type];
  if (!pInfo) return { ok: false, reason: "unregistered-type", detail: `parent type "${parentSocket.type}" is not registered` };
  if (!cInfo) return { ok: false, reason: "unregistered-type", detail: `child type "${childSocket.type}" is not registered` };
  if (!pInfo.seating) return { ok: false, reason: "non-seating-socket", detail: `"${parentSocket.type}" is a ${pInfo.joinClass}; it declares a point, it does not receive a part` };
  const childCanon = socketCanonicalType(childSocket.type);
  const accepted = parentSocket.accepts.some((a) => a === childSocket.type || socketCanonicalType(a) === childCanon);
  if (!accepted) return { ok: false, reason: "socket-type-mismatch", detail: `"${parentSocket.type}" accepts [${parentSocket.accepts.join(", ")}] — "${childSocket.type}" is not among them` };
  if (parentSocket.occupiedBy.length >= parentSocket.capacity) return { ok: false, reason: "capacity-exceeded", detail: `"${parentSocket.type}" capacity ${parentSocket.capacity} already holds ${parentSocket.occupiedBy.length}` };
  const pe = parentSocket.envelope, ce = childSocket.envelope;
  if (pe && ce) {
    for (const k of ["radius", "width", "height", "span"]) {
      if (typeof pe[k] === "number" && typeof ce[k] === "number" && ce[k] > pe[k] + 1e-6) {
        return { ok: false, reason: "envelope-exceeded", detail: `child ${k} ${ce[k]} exceeds receiver ${k} ${pe[k]}` };
      }
    }
  }
  return { ok: true, reason: null, detail: null };
}
export function seatSocket(parentSocket, childSocket, childRef) {
  const verdict = canSeat(parentSocket, childSocket);
  if (!verdict.ok) return verdict;
  parentSocket.occupiedBy.push(childRef != null ? childRef : (childSocket.ownerRef || childSocket.id));
  return verdict;
}
export function releaseSocket(parentSocket, childRef) {
  const i = parentSocket.occupiedBy.indexOf(childRef);
  if (i >= 0) parentSocket.occupiedBy.splice(i, 1);
  return i >= 0;
}
/** The owner-local seat position of a record — the ONE accessor a reader should use.  Readers must
    never reach for a flat `.position`: that key belonged to the pre-A1 kit vocabulary and its
    absence is what makes a stale reader fail loudly instead of silently placing at the origin. */
export function socketPosition(record) {
  return record && record.frame && Array.isArray(record.frame.position) ? record.frame.position : [0, 0, 0];
}
/** Typed reader — matches exact type OR an alias of the same join (join-west finds butt-join-w). */
export function socketsOfKind(list, type) {
  const all = Array.isArray(list) ? list : [];
  if (!type) return all.slice();
  const want = socketCanonicalType(type);
  return all.filter((s) => s && (s.type === type || socketCanonicalType(s.type) === want));
}

/* ── projections: A1's seven representations become views of the one record ────────────────────── */

/** Rep 1 — procedural kit `{type, position, rotation:[x,y,z], …extra}`. */
export function socketFromEulerSpec(type, position, euler, extra, meta) {
  const e = extra || {};
  const envelope = {};
  for (const k of ["radius", "width", "height", "span", "pitchRadius"]) if (typeof e[k] === "number") envelope[k] = e[k];
  const ordinal = (meta && meta.ordinal != null) ? meta.ordinal : (typeof e.slot === "number" ? e.slot : 0);
  return makeSocket({
    type, position, euler, envelope, ordinal,
    ownerRef: meta && meta.ownerRef,
    source: (meta && meta.source) || "procedural-kit",
  });
}

/** Rep 2 — donor GLTF `extras.genesisDonor.sockets` = `{type, position}` (+ the owning node name).
    build/normalize-donors.py stamps POSITION ONLY, so orientation comes from the type's declared
    default and provenance.frameSource records that honestly as "type-default". */
export function socketFromDonorExtras(entry, meta) {
  const m = meta || {};
  return makeSocket({
    type: entry.type,
    position: entry.position,
    normal: entry.normal, tangent: entry.tangent,
    ordinal: m.ordinal,
    ownerRef: m.ownerRef ? (entry.node ? `${m.ownerRef}#${entry.node}` : m.ownerRef) : (entry.node || null),
    source: m.source || "donor-normalizer",
  });
}

/** Rep 3 — figure body anchors `{pos:{x,y,z}, rot?}` under seven frozen names (theater-parts.js). */
export function socketFromFigureAnchor(name, anchor, meta) {
  const a = anchor || {};
  const pos = a.pos || a;
  const rx = a.rot ? (a.rot.rx || 0) : (a.rx || 0);
  const ry = a.rot ? (a.rot.ry || 0) : (a.ry || 0);
  const rz = a.rot ? (a.rot.rz || 0) : (a.rz || 0);
  return makeSocket({
    type: `figure:${name}`,
    position: [pos.x || 0, pos.y || 0, pos.z || 0],
    euler: [rx, ry, rz],
    ownerRef: (meta && meta.ownerRef) || null,
    source: (meta && meta.source) || "figure-parts",
  });
}

/** Rep 4 — room-mesh `mountSlots[] = {slotId, ownerSegIndex, u, worldPos, normal, tangent}`.
    The one already-yaw-correct representation; capacity 1 makes its one-slot-per-segment limit
    VISIBLE rather than silent (A1 grounds (d)). */
export function socketFromMountSlot(slot, meta) {
  return makeSocket({
    type: "wall-mount",
    id: slot.slotId,
    position: slot.worldPos,
    normal: slot.normal,
    tangent: slot.tangent,
    frameSource: "measured",
    capacity: 1,
    ownerRef: (meta && meta.ownerRef) || (slot.ownerSegIndex != null ? `wall-seg:${slot.ownerSegIndex}` : null),
    source: (meta && meta.source) || "room-mesh",
  });
}

/** Rep 5 — CL-F01 structure specimens `{id, type, axis:{x,z}}` — face-typed, planar axis, NO
    position.  The planar axis IS the face normal; position is unknown at spec level and is
    reported as the owner-local origin with frameSource "authored". */
export function socketFromStructureSpec(spec, meta) {
  const axis = spec.axis || {};
  const hasAxis = (axis.x || 0) !== 0 || (axis.z || 0) !== 0;
  return makeSocket({
    type: spec.type,
    id: spec.id,
    position: spec.position || [0, 0, 0],
    normal: hasAxis ? [axis.x || 0, 0, axis.z || 0] : null,
    tangent: hasAxis ? [0, 1, 0] : null,
    frameSource: hasAxis ? "authored" : "type-default",
    ownerRef: (meta && meta.ownerRef) || null,
    source: (meta && meta.source) || "structure-catalog",
  });
}

/** Rep 6/7 — bare or dotted citizenship strings: "wall-mount", "interaction.front", "loot.origin".
    The dotted suffix is a FACING hint, not a type; it maps to the frame, never to a new type id. */
const DOTTED_FACING = Object.freeze({
  front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0], right: [1, 0, 0], top: [0, 1, 0], bottom: [0, -1, 0],
});
export function socketFromCitizenshipString(text, meta) {
  const raw = String(text || "");
  const dot = raw.indexOf(".");
  const head = dot >= 0 ? raw.slice(0, dot) : raw;
  const tail = dot >= 0 ? raw.slice(dot + 1) : "";
  const type = SOCKET_TYPES[raw] ? raw : (SOCKET_TYPES[head] ? head : (SOCKET_TYPES[`${head}-origin`] ? `${head}-origin` : head));
  const facing = DOTTED_FACING[tail] || null;
  return makeSocket({
    type,
    position: (meta && meta.position) || [0, 0, 0],
    normal: facing,
    frameSource: facing ? "authored" : "type-default",
    ordinal: meta && meta.ordinal,
    ownerRef: (meta && meta.ownerRef) || null,
    source: (meta && meta.source) || "meshy-runtime",
  });
}

export const SOCKET_ALGEBRA = Object.freeze({
  version: SOCKET_ALGEBRA_VERSION,
  types: SOCKET_TYPES,
  joinClasses: SOCKET_JOIN_CLASSES,
  scaleRules: SOCKET_SCALE_RULES,
  frameSources: SOCKET_FRAME_SOURCES,
  typeInfo: socketTypeInfo,
  canonicalType: socketCanonicalType,
  make: makeSocket,
  validate: validateSocket,
  validateAll: validateSocketRecords,
  basis: socketBasis,
  basisFromEuler: socketBasisFromEuler,
  eulerXYZ: socketEulerXYZ,
  canSeat,
  seat: seatSocket,
  release: releaseSocket,
  ofKind: socketsOfKind,
  position: socketPosition,
  fromEulerSpec: socketFromEulerSpec,
  fromDonorExtras: socketFromDonorExtras,
  fromFigureAnchor: socketFromFigureAnchor,
  fromMountSlot: socketFromMountSlot,
  fromStructureSpec: socketFromStructureSpec,
  fromCitizenshipString: socketFromCitizenshipString,
});

// classic-script bridge — same republish pattern theater-donor.js/theater-materials.js use (a
// top-level `export function` never auto-attaches to `window`).
if (typeof window !== "undefined") window.TheaterSocketAlgebra = SOCKET_ALGEBRA;
