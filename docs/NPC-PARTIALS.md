---
type: system-spec
project: Genesis
status: SPEC — Adam requested 2026-07-08 ("spec it"); tables craft-lane, engine unit pending
created: 2026-07-08
origin: Adam — "are there children in this world? it can't all be adults with adult problems"
related:
  - "[[NPC-PRESENCE-AND-HOOKS]]"
  - "[[NPC-COHERENCE-DIAL]]"
  - "[[NPC-ROLE-REALMS]]"
---

# NPC-PARTIALS — children, animals, and the living scenery

## The gap

The world is currently all **full adult NPCs with adult problems**. A place doesn't feel alive
without **children** underfoot and **animals** around — and neither should carry the full adult
atom-stack. They're **partial NPCs**: real presence, their own small stuff, reduced depth. And in
the Amblin/Stranger Things key, they're not just texture — **the kid who saw the thing** and **the
dog that won't go in the cellar** are some of the best hooks in the genre.

## The partial class

A lightweight sibling to `rollNPC` — `rollPartial(kind, opts)` — that never fires the adult lever
stack (want-2d50 / leverage / fear / flaw / bond). Each kind gets its own small stack:

### Children
- **Kid-want** (its own small table): concrete, child-scaled — *find the dog · not get caught · be
  believed · stay up for the thing · get back what was taken.* Occasionally a kid-want cracks an
  adult situation open (they want the shiny thing they found — which is the murder weapon).
- **What they saw** (its own table): children are **witnesses** — they see what adults miss and
  don't know which part matters. This is their leverage/hook contribution: a child can **carry a
  real hook**, kid-framed (*"the nice man who visits the widow only comes on the nights her husband's
  away"*). Decent hook-carrier rate — kids drive plots.
- Coherence: **always Archetype** (a child is legible by default); the hook, when it fires, is the
  interest, not a complex inner life.

### Animals
- **Kind** (realm-flavored): dog/cat/livestock/working-beast/stray — reskinned per realm (Chrome's
  "pet" is a drone-companion; Bright-Kingdom's animals are a shade too clever; Theater's is a war-mule).
- **Tell** (its own table): an animal is a **living detector** — it *points at* a hidden thing rather
  than being a thread. *Won't enter the cellar · growls at one specific person · brings home a bone
  it shouldn't have · stares north every dusk.* The tell is a breadcrumb to a nearby hook/secret.
- Not a moral agent, no want/fear stack — just kind + tell + a need (hungry, guarding, lost, loyal).

**Extensible:** the same class later covers other partials (the infirm elder, the town innocent, a
revenant-presence) — anything that populates and occasionally points, without adult agency.

## Population & routing (fits the presence-and-hooks architecture)

- Ambient-fill ([[NPC-PRESENCE-AND-HOOKS]] Component 2) includes partials by **scene-type**: a market
  has kids + dogs; a war-front has camp-orphans + mules; an 80s suburb has latchkey kids + BMX bikes
  + a stray; wilderness has strays + livestock.
- **Hook rules (scaled):** children **carry** hooks (lower rate than adults, kid-framed, and they can
  crack an adult situation); animals **point at** hooks (the tell surfaces a nearby hidden thing).
  Neither generates the full ratcheting if-ignored drift on its own — a child thread the player
  *engages* can be tracked (scaled); an animal tell just resolves into the thing it pointed at.
- Coherence dial hard-defaults partials to **Archetype** — never the atom-weirdo.

## TONE & CONTENT-SAFETY (binding)

**Genesis is graphically brutal by design — Game-of-Thrones register.** Graphic death and violence
are a *feature*: they make the stakes real, and they are exactly what makes a hero take up the blade.
The DM does **not** shy from gnarly, graphic death for adults, monsters, and the world at large.

- **Children are the sole carve-out.** Not plot-armored — children can suffer and **die**, real,
  permanent, consequential — but their death or suffering is **never depicted graphically**. The
  weight, the loss, and the consequence land in full; the physical detail does not.
- **Animals are no exception to the brutality.** A beloved animal can die as graphically as anyone,
  and that gut-punch is often the point (the loyal beast's death is a blade-taking-up moment).
- **Absolute:** no sexualized content involving children, under any framing, ever.

(Game-wide tone ruling, Adam 2026-07-08 — reflect in DM-CHARTER / tone docs. The Theater realm's
separate *"real atrocity is never loot"* rule still stands on its own; it's about looting atrocity,
not about graphic depiction.)

## Build units

- **Tables (craft-lane): ✅ AUTHORED 2026-07-08** — `Child Want.md` (d20, `child-want`),
  `Child Saw.md` (d50 witness/hook-carrier, `child-saw`), `Animal Kind.md` (d12, `animal-kind`, realm
  reskin as an in-place note pending Adam's ruling on animal skins), `Animal Tell.md` (d20,
  `animal-tell`). All exempt from the situation family (lever/witness/pointer atoms); die coverage
  clean; tags in-format.
- **Engine unit:** `rollPartial(kind, opts)` + ambient-fill integration (scene-type partial counts,
  realm-flavored) + the scaled hook-carrier / tell-points-at-hook wiring + coherence hard-default.
- Register in DESIGN.md/NEXT-STEPS at build time (deferred — parallel graphics session on shared docs).

## Open questions for Adam (later)

- Child **hook-carrier rate** vs adults — lower, or *higher* in Amblin-heavy realms (Suburb/Bright-Kingdom)?
- Do animals get a **realm-skin** table like roles (drone-pets in Chrome, talking-ish in Bright-Kingdom)?
- Any **third partial kind** worth a stack now (the infirm elder? the town innocent?), or start with
  children + animals only?
