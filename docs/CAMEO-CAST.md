---
type: system-spec
project: Genesis
status: SPEC — drafted by Fable 2026-07-08, awaiting Adam's review
created: 2026-07-08
origin: Adam design ask 2026-07-08 ("ET as a rare NPC in the suburb world… CRAFTED NPCs added to the realm with a chance to roll — power for me as game writer, and modders will go wild")
related:
  - "[[NPC-PRESENCE-AND-HOOKS]]"
  - "[[NPC-COHERENCE-DIAL]]"
  - "docs/NPC-ROLE-REALMS.md"
  - "src/engine/codex-roll.js (PLOT-ITEM-RECURRENCE — the origin-stamp precedent)"
  - "docs/ON-DEMAND-GEN.md"
  - "docs/DM-CHARTER.md"
---

# CAMEO-CAST — hand-authored named NPCs with a chance to roll

## The thesis

Everything the engine mints today is **assembled from atoms** — rollNPC chains race/role/want/
leverage tables into a person the DM names and connects. That's the right default, but it has a
ceiling: it can never produce *the stranded star-child in the cornfield*. Some NPCs are **written,
not rolled** — fully-realized characters with an authored voice, an authored want, and (optionally)
an authored quest-seed — and the game gets dramatically richer if a rolled world has a **rare
chance to contain them**.

Two audiences, one mechanism:

1. **Adam as game-writer** — shipping serial-numbers-filed-off homages into the realm vocabulary
   (the suburb realm *wants* a stranded star-child the way noir wants an honest cop).
2. **Modders** — dropping anyone they like into their own local worlds. Their content, their
   machines. The mod seam must be **data-only**: a modder appends an object to a registry file and
   never touches engine code.

The closest existing tech is **PLOT-ITEM-RECURRENCE** (`src/engine/codex-roll.js` ~L391,
`genApply` in `src/world/dm.js` ~L776): a Mythic plot-item fire stamps `origin:"plot-item:<row>"`
on the payload, and the mint seam recognizes "this exact legendary thing already exists in this
world" and hands back the existing record instead of duplicating. A cameo is the same shape —
**a stable identity behind a random draw, unique per world** — applied to people instead of
macguffins. This spec deliberately mirrors that seam rather than inventing a second uniqueness
mechanism.

---

## §1 The record shape — `data/cameo-cast.js`

**Decision: one new hand-authored data module, `data/cameo-cast.js`, manifest-registered, classic
`<script>` global (`CAMEO_CAST`), same posture as `data/realms.js` (hand-authored source, NOT a
compiled artifact).** Rationale: modders edit a file, never code; the manifest already knows how to
validate registration; classic-global matches house architecture (no ES modules until the graphics
migration).

A cameo entry is a **full authored NPC + a placement contract**:

```js
var CAMEO_CAST = [
  {
    // ---- identity (required) ----
    id: "star-child",              // stable slug; unique across the registry; becomes origin:"cameo:star-child"
    name: "Whistle",               // the character's name as the world knows it
    species: "unknown",            // free text — cameos are not bound to CHAR_NAMES species
    role: "stranded visitor",      // free text role label (NOT forced through the role spine)
    want: "to signal home before the men in gray vans find it first",   // authored, replaces the npc-want roll
    // ---- authored depth (optional but the point) ----
    leverage: "it is dying slowly here; anyone who knows that owns its trust",
    voice: "does not speak the language; mimics phrases back with uncanny warmth; three-word sentences at most",
    fear: "open sky during the day",
    bond: "the first person who feeds it instead of screaming",
    statRef: "bestiary:sprite",     // pointer into data/bestiary.js — mechanics stay D&D (pointer pattern, §8b)
    model: null,                    // optional render key (WHOLE_OBJECT_REGISTRY / bestiary id); null = blank-meeple fallback
    hook: {                         // optional authored quest-seed (see §6 — feeds the hook/walk machinery)
      text: "Its beacon needs three things scavenged from three human places; it can show you, not tell you.",
      ifIgnored: "the gray vans find it. There is a closed-door facility on the map afterward, and it is not empty."
    },
    // ---- placement contract (required) ----
    place: {
      realms: ["suburb"],          // which realm worlds this cameo can mint in (data/realms.js ids)
      scenes: ["wilderness-edge", "field", "shed", "backyard"],   // free-text affinity tags matched loosely at mint (see §2)
      minBand: "Mythic",           // spice-band floor — never appears below this band
      weight: 1,                   // rarity weight within the cameo draw (see §2; Adam ruling on absolute rate)
      unique: "world"              // uniqueness scope; v1 supports only "world" (see §3)
    }
  },
  // ... modder entries appended here
];
```

Field disciplines, with rationale:

- **`id` is the canon key.** `origin:"cameo:<id>"` stamps every minted payload — the uniqueness
  seam (§3) keys on it, mirroring `plot-item:<row>` exactly. Ids never change once shipped (a
  renamed id would let the same cameo re-mint in old worlds).
- **`want` is required.** House invariant (NPC-COHERENCE-DIAL: "a person without a want is just a
  job title") applies doubly to authored characters — a cameo with no want is a wax figure.
- **`statRef` is a pointer, not a stat block** (§8b pointer pattern, same as rollItem's
  `source:{ref}`). A cameo that can fight/flee/be killed resolves mechanics through an existing
  bestiary/sidekick chassis. `statRef:null` = pure social presence (a shopkeeper cameo never needs
  initiative).
- **`hook` is authored, optional, and carries its own `ifIgnored`** — it drops into the
  NPC-PRESENCE-AND-HOOKS attention machinery as a bespoke hook (Component 4 already prefers "the
  hook's own If-Ignored column" over the generic table; an authored cameo hook is the best case of
  that rule).
- **`group`** (see §7, map-kids): an optional `members:[{name, note}]` array — the cameo mints as
  ONE codex record (one identity, one uniqueness check, one hook) whose members are named texture
  the DM voices. Rationale: groups-as-one-record keeps uniqueness/recurrence/death simple; if the
  fiction ever needs one kid to peel off as a full NPC, the DM mints a linked rollNPC-class record
  then — engine stays out of it.

## §2 The roll seam — ONE pre-empt draw, not scattered checks

**Decision: cameos enter through a single seam — a rare pre-empt draw inside `rollNPC` itself
(top of the function, before any table fires), gated on realm + scene affinity + spice band +
world-uniqueness.** When the draw fires, `rollNPC` returns the cameo's authored payload (stamped
`provenance:"authored-cameo"`, `origin:"cameo:<id>"`) instead of rolling atoms.

```
rollNPC(opts):
  cameo = cameoDraw({ realm, sceneTags: opts.sceneTags, band: opts.band, world })
  if (cameo) return cameoPayload(cameo)       // pre-empt: no atom rolls happen
  ...existing atom chain unchanged...
```

Why ONE seam, argued:

- **Every mint path already funnels through `rollNPC`** — prep casting, `gen[]` on-demand mints
  (`GEN_ROLLERS.npc`), ambient fill (NPC-PRESENCE-AND-HOOKS Component 2 stubs mint via the same
  roller), capture's jailer, walk encounters. Intercepting at the funnel mouth means every one of
  those call sites gets cameo capability **for free, with zero call-site edits**.
- **Scattered checks are the HQ2-1 bug shape.** Per-call-site cameo probes would each hand-roll
  their own gating (realm read, band read, dedup read) — the exact "normalization in handlers"
  class the contract-boundary discipline exists to kill. One seam = one gate = one place rarity is
  tuned and one place a bug can live.
- **The pre-empt is null-safe and additive**: `cameoDraw` returning null (registry absent, no
  eligible entry, dice miss) leaves every existing payload byte-identical — the same degradation
  contract as the breach-touch rider and roleForRealm fallback.

Gating inside `cameoDraw`, in order (cheap checks first):

1. **Registry filter**: entries whose `place.realms` includes the active realm.
2. **Uniqueness**: drop entries already minted in this world (`codexFindByOrigin(w,"cameo:<id>")`
   — the existing helper, no new index).
3. **Band floor**: drop entries whose `minBand` exceeds the current scene/world spice band
   (`opts.band`, threaded by callers that have one; absent band = treat as floor-band = only
   band-less cameos eligible — a caller with no spice context never over-fires a Mythic cameo,
   same posture as touchedNpcChance's no-fray floor).
4. **Scene affinity**: if the entry declares `scenes` and the caller passed `opts.sceneTags`,
   require ≥1 loose match (substring, case-folded). No sceneTags passed = affinity check skipped
   (affinity is a *preference*, not a lock — a star-child CAN turn up somewhere odd; the realm +
   band gates are the hard walls).
5. **The rarity roll**: one d100-style gate — `Math.random() < CAMEO_BASE_CHANCE` fires the draw
   at all; on fire, weighted-pick among survivors by `place.weight` (reusing the roleForRealm
   weighted-pick idiom). **`CAMEO_BASE_CHANCE` is a named const with a placeholder of 0.02 —
   Adam's ruling (§9) sets the real number.** Rationale for chance-then-weight (vs folding cameos
   into a big weighted pool with rolled-NPCs): the base chance is the ONE knob answering "how
   often does a world surprise you with a written character," independent of how many cameos the
   registry holds — a modder adding 50 cameos makes each rarer, not the world cameo-saturated.

**Recommendation against**: a second seam at prep-casting or walk-encounter level. Both already
call rollNPC; a dedicated cameo pass there would double-gate and double-roll. If a future need
arises for *guaranteed* cameo placement (a scripted scenario), that's `rollNPC({cameoId:"star-child"})`
— a forced-draw opt-in through the same seam, not a new one.

## §3 Uniqueness — a cameo is world canon, forever

**Decision: `unique:"world"` (the only v1 scope). Once minted, a cameo is THAT world's canon
permanently — one codex record, `origin:"cameo:<id>"`, never re-minted, persisting across sessions
exactly as every codex record does. Killed = dead.** Worlds are permanent (the founding law);
a cameo that could respawn would be the quantum-ogre in a trenchcoat.

Mechanism — deliberately identical to PLOT-ITEM-RECURRENCE, both halves:

- **Mint-time pre-filter** (§2 step 2): `cameoDraw` never offers an already-minted id. This is the
  primary guard.
- **The genApply belt-and-suspenders**: the payload carries `origin`, so the EXISTING recurrence
  check in `src/world/dm.js` genApply (`payload.origin && codexFindByOrigin(...)`) already catches
  any race the pre-filter misses (e.g. a reserve-drawn payload minted before a live draw of the
  same id) and hands back the existing record flagged `recurrence:true` — "the world remembers."
  **Zero new code in genApply**; the seam was built origin-generic on purpose and this is its
  second customer.
- **Death is a codex status, not a registry event.** A dead cameo's record stays (corpse-decay,
  legacy, rumors); `codexFindByOrigin` still finds it, so it still never re-mints. The registry
  entry itself is never mutated at runtime — `data/*.js` is read-only vocabulary; **all world
  state lives in `w` (codex)**, per the state discipline.

Per-world means per-world: a player's OTHER worlds each get their own independent chance to meet
Whistle. That's a feature (the multiverse rhymes), not a bug.

## §4 Authorship + the legal line

House law, stated once and enforced editorially, not mechanically:

- **Shipped cameos (in the repo) are serial-numbers-filed-off homages.** Original names, original
  prose, the *shape* of the beloved thing with no protected expression: the stranded star-child,
  never the trademark. The three worked examples in §7 are the standard — if a shipped entry
  wouldn't survive that test, it doesn't ship. This is a content-review gate (Adam's craft pass),
  not a validator's job.
- **Modder-added cameos are the modder's own local content on the modder's own machine.** The
  SYSTEM is content-neutral — a registry loader neither knows nor cares what a modder writes, the
  same way a text editor doesn't. Genesis ships no infringing content and no mechanism whose only
  purpose is infringement; what a player types into their own local data file is theirs.
- Corollary: **no shipped tooling ever fetches, bundles, or redistributes modder cameo files.**
  Sharing is the modder's act, out of scope.

## §5 The mod seam — zero engine knowledge

A modder's entire workflow, v1:

1. Open `data/cameo-cast.js`.
2. Copy the documented entry template (the file header carries a commented blank template +
   field-by-field docs — the file IS the modding manual).
3. Append their object to the `CAMEO_CAST` array. Save. Reload.

That's it — no manifest edit (the file is already registered), no engine file, no build step.

**Validation: `validateCameoCast()`** in the same file (hand-written, like `roleForRealm` living
inside generated npc-role-skins.js), run once at load by the module itself:

- checks per entry: `id` present + unique + slug-shaped; `name`/`want` present; `place.realms`
  is a non-empty array of known `REALMS` ids (read defensively via `typeof REALMS` guard);
  `place.weight` positive number; `minBand` a known band or absent; `statRef`, if present,
  resolvable shape (`"bestiary:<id>"`) — resolution deferred to use-time, never a load failure.
- **Graceful skip, loud console**: a malformed entry is dropped from the live pool with a
  `console.warn("[cameo-cast] entry skipped: <id or index> — <reason>")`; the rest of the registry
  (and the game) loads untouched. Rationale: a modder's typo must never brick the game — but it
  must never be silent either (validators tell the truth; a skipped entry that hides is a lying
  green).
- The engine consumes only the validated pool (`cameoCastValid()` accessor), never raw
  `CAMEO_CAST`.

**Future (explicitly out of v1): a JSON side-load** (`cameo-cast.local.json`, fetch-at-boot,
git-ignored) so mods survive game updates without merge conflicts. Deferred because `file://`
fetch and the update story both need design; the JS registry proves the shape first.

## §6 Interaction with existing systems

- **Coherence dial — cameos are EXEMPT from flattening.** A cameo arrives with authored depth;
  gating its atoms by region temperature would delete the writing. The pre-empt (§2) returns
  before `pickCoherence` ever runs; the payload carries `coherence:"authored"` (a new value the
  dial machinery must treat as pass-through — it never enters COHERENCE_GATED_ATOMS logic).
  This does NOT violate the dial's law (it simplifies the *person*, and only rolled persons):
  an authored person was never the dial's jurisdiction.
- **Hooks + walks.** A cameo with an authored `hook` enters NPC-PRESENCE-AND-HOOKS as that scene's
  guaranteed/discovered hook **already written** — no d300 draw needed; the hook is attached at
  mint, immutable per ON-DEMAND-GEN's revealed-is-canon rule. Its `ifIgnored` feeds the
  three-tier attention model's "the hook's own If-Ignored column" path directly. Where a hook
  implies a fetch/journey (the star-child's three scavenged things), the DM resolves it through
  the existing walk grammar (JOB-WALKS/TRAVEL-WALKS) — an authored hook may mint a
  reward-terminated walk exactly as a rolled hook may; no new walk machinery.
- **DM contract.** New DM-CHARTER clause (registered at build, not re-litigated here): *the DM
  voices a cameo from its authored `voice`/`want`/`fear`/`bond` notes and never invents
  contradicting canon — authored fields are load-bearing canon at the same tier as revealed names.
  Within those walls, the DM improvises freely (motivated lies included, per Charter).* The
  digest surfaces the cameo's authored fields in `dm` exactly where rolled NPCs carry their
  levers — same shape, so the DM-side prompt needs no new plumbing.
- **Presence/ambient fill.** Ambient stubs mint through rollNPC, so a cameo CAN arrive as the
  stranger at the edge of a market — but ambient callers pass no band in v1, and the band-absent
  floor rule (§2 step 3) means only band-less cameos can fire there. Shipped cameos all carry
  band floors; the practical result is cameos surface at *significant* mints (prep casting, gen
  npc, hook scenes), which is the right dramatic register.
- **Theater/models.** `model` is an optional render key resolved through the existing registry;
  null falls back to the blank meeple (TABLETOP-VISION's own fallback law). No model work is
  gated by this spec.

## §7 Worked examples (the shipped standard)

These three ship in `data/cameo-cast.js` v1 — they are the reference entries the template
documentation points at.

**1. Whistle, the star-child** — realm `suburb`, `minBand:"Mythic"`, scenes
`["wilderness-edge","field","shed","backyard"]`, `unique:"world"`, `weight:1`, `statRef:"bestiary:sprite"`.
The full entry is the §1 example above. A dying visitor from somewhere else, hiding in the
mundane, hunted by quiet institutional men; its authored hook is a three-part scavenge with a
hard ifIgnored (the facility). Mythic floor because its chain can change the world forever —
the band-calibration ruling's definition, met exactly.

**2. The Map-Kids (GROUP cameo)** — realm `suburb`, `minBand:"Strange"`, scenes
`["attic","basement","street","dead-end"]`, `weight:2`, `statRef:null`.
One record: `name:"the Cul-de-Sac Irregulars"`, `role:"kids with a dead man's map"`,
`want:"to find the pirate's cellar before the bank takes all their houses on Saturday"`,
`members:[{name:"Dizzy",note:"talks the group into everything"},{name:"Wren",note:"gadget belt, none of it works twice"},{name:"Marco",note:"older brother energy, secretly terrified"},{name:"June",note:"the only one who can actually read the map"}]`.
Group law (per §1): one identity, one uniqueness check, one hook (`the map is real; so are the
people who buried what it points to`); members are DM-voiced texture. Strange floor — a
Twilight-Zone-sized episode, not a world-changer, per the band calibration. Note the partials
seam: these kids are a *cameo*, not `rollPartial("child")` output — authored group presence
outranks the partial stub, and the hook lives on the group.

**3. Brick, the gentle giant** — realms `["suburb","gloom"]` (dual-realm entry — `place.realms`
is an array precisely for this), `minBand:"Strange"`, scenes `["basement","cellar","boarded-house"]`,
`weight:2`, `statRef:"bestiary:ogre"` (chassis only — his authored disposition overrides the
chassis's hostility; statRef is mechanics, never behavior).
`name:"Brick"`, `role:"the family's chained secret"`, `want:"a friend who doesn't flinch"`,
`voice:"few words, names things wrong in ways that are righter"`, `bond:"anyone who shares candy
— sweets are the only kindness he's ever been handed"`, `fear:"the upstairs voices when they get
loud"`. Discovery-scene shaped: he is *found*, chained in a basement by the family that is
ashamed of him — a hook (`the family's crime is upstairs; Brick knows where they buried it`)
with an ifIgnored that stays diegetic. In `gloom`, the same entry reads as horror discovered;
in `suburb`, as tragedy behind a cheerful door — one authored character, two registers, zero
duplicated content: the argument for the realms-array in one entry.

## §8 Build units (Sonnet-executable) + acceptance + red-first tests

Ordered; each unit is independently gate-able. Run `python3 build/check-manifest.py` after every
module edit (house law).

**U1 — `data/cameo-cast.js` registry + validator.**
New file: header docs + blank template comment, `CAMEO_CAST` with the three §7 entries,
`validateCameoCast()` + `cameoCastValid()`. Register in `manifest.json` (owns
`CAMEO_CAST`/`validateCameoCast`/`cameoCastValid`; layer = data; loadOrder before
`src/engine/codex-roll.js`) + the `<script>` tag in `genesis.html`.
*Red-first*: a jsdom load with a deliberately malformed entry (missing `want`; unknown realm id;
duplicate id) — assert the bad entries are absent from `cameoCastValid()`, a console.warn fired
per skip, AND the three good entries survive. Green only after first watching it fail.
*Acceptance*: check-manifest green; malformed-skip proven; valid pool = 3.

**U2 — `cameoDraw` + the rollNPC pre-empt.**
In `src/engine/codex-roll.js`: `cameoDraw(opts)` (pure, §2 gate order, `CAMEO_BASE_CHANCE`
const), `cameoPayload(entry)` (codexAdd-shaped: `kind:"npc"`, `provenance:"authored-cameo"`,
`origin:"cameo:"+id`, `coherence:"authored"`, authored fields into `rolled`/`fields`/`dm`,
`source:{type:"cameo",ref:id}`, group `members` passed through), and the pre-empt at the top of
`rollNPC` (typeof-guarded — registry absent ⇒ byte-identical legacy behavior). New rollNPC opts:
`sceneTags`, `band`, `cameoId` (forced draw, still uniqueness-checked).
*Red-first*: (a) registry stubbed out ⇒ 500 rollNPC payloads byte-identical in shape to a
pre-change fixture; (b) `CAMEO_BASE_CHANCE=1` forced ⇒ wrong-realm and below-band entries never
fire; (c) `cameoId` forced draw returns the authored payload with origin stamped.
*Acceptance*: all three probes green; check-manifest green; no other rollNPC caller edited.

**U3 — uniqueness under re-mint pressure.**
Wire the world into the §2 pre-filter (`cameoDraw` takes `w`, calls `codexFindByOrigin`).
Verify — do not modify — genApply's existing origin-recurrence branch catches a cameo payload
(it keys on `payload.origin`, kind-parameterized; confirm the `kind:"npc"` path).
*Red-first (the pressure test)*: jsdom world, force `CAMEO_BASE_CHANCE=1` + one eligible entry,
mint 50 NPCs at the same node ⇒ exactly ONE codex record with `origin:"cameo:star-child"`;
subsequent draws fall through to rolled NPCs; a direct genApply replay of a stale cameo payload
returns the existing record flagged `recurrence:true`, no duplicate. Kill the cameo (status
dead) ⇒ still never re-mints.
*Acceptance*: 1 record under 50-mint pressure; recurrence flag proven; dead-stays-dead proven.

**U4 — coherence exemption + DM surface.**
`coherence:"authored"` passes through the dial untouched (no gated-atom nulling); digest carries
the cameo's `dm` fields wherever rolled-NPC levers already flow; DM-CHARTER gains the §6 voicing
clause; register the spec in docs/DESIGN.md + NEXT-STEPS.
*Red-first*: mint a cameo in a `sleepy` region (max flattening pressure) ⇒ every authored atom
present in the payload; a rolled NPC in the same region still flattens (the dial itself
unbroken).
*Acceptance*: exemption proven both directions; docs registered together (anti-drift law).

**U5 — rarity distribution harness (verification, no product code).**
`dev/verify-cameo-rarity.mjs`: N=2000 simulated suburb worlds × M mints each at real
`CAMEO_BASE_CHANCE` ⇒ report per-cameo appearance rate, co-mint rate, and the weight ratio
between weight-1 and weight-2 entries (expect ≈1:2 among fired draws). Output is the exhibit for
Adam's rarity ruling (§9) — the number gets *felt*, then set.
*Acceptance*: harness runs headless; report lands in dev/; observed weight ratio within ±15% of
declared.

## §9 Adam's rulings needed

1. **How rare is the star-child?** `CAMEO_BASE_CHANCE` placeholder = 0.02 per significant NPC
   mint (≈ "most worlds never meet one; the world where you do is *that* world"). Run U5's
   harness, feel the per-world rate, then rule. Also: flat const vs fray/temperature-scaled
   (recommend FLAT — cameos are destiny, not weather).
2. **Can two different cameos co-mint in one world?** Recommend YES, uncapped in v1 (each is
   independently rare; a world with both Whistle and Brick is a jackpot, not a bug) — but a
   one-line `CAMEO_WORLD_CAP` is cheap if you want scarcity-of-wonder enforced. Rule it.
3. **Do cameos enter the realm-neutral / legacy d300 pool?** I.e. can a `place.realms` value of
   `["*"]` exist so a cameo can surface in ANY world? Recommend NO for shipped content (realm
   affinity is what makes a cameo land) but YES as a supported wildcard for modders. Rule it.
4. **Group member fidelity** — is the one-record group law (§1/§7) right, or do you want members
   as linked partial records from mint? (Recommend one-record; peel-off on demand.)
5. **The three shipped entries themselves** — §7 prose is draft canon; your craft pass owns the
   final text (names, wants, hooks), same as any hand-authored table.

## RESOLVED — Adam (2026-07-08 night)
**Defaults accepted as drafted** ("i think your default cameo spec is accurate") — 2% base chance,
uniqueness scope, group handling, wildcard posture all stand as the draft's recommendations.
