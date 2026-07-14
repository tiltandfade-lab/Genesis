---
type: vision
status: the far roadmap beyond DESIGN-GUIDE T0–T7 — dreamed 2026-07-02 with Adam; tiered by horizon distance. Not a build queue: a bearing. Revisit after each major arc lands.
created: 2026-07-02
related:
  - "[[DESIGN-GUIDE]]"
  - "[[SPEED-DOCTRINE]]"
  - "[[BLOCKWRIGHT]]"
  - "[[BATTLEMAP]]"
  - "[[EVENT-CONTRACT]]"
---

# The Dream Horizon

## §0. TWO DOCTRINES FIRST (binding NOW, not horizon)

**TEXT-FIRST, FOREVER:** a text-only Genesis must always be runnable. The text IS the game;
every visual layer (diorama, models, VTT, VR) is an OPTIONAL LENS over the same state — never a
dependency of it. Rationale (Adam): imagination outrenders anything; visuals limit the
experience to their own style, prose sets no ceiling. This is also WHY the visual canon is
low-poly and simple — restraint on what's shown leaves room for what's imagined. Every future
feature must degrade gracefully to text. (Ally of the SPEED doctrine: text costs nothing.)

**THE RENDERER IS REPLACEABLE:** the event-sourced state (ledger + EVENT-CONTRACT) is the game;
clients — browser text, diorama, VTT, someday VR — are views. Never let a view own state.

**BLIND-PLAYABLE, FULLY (Adam, 2026-07-02):** a blind player experiences the COMPLETE game —
not an accommodated subset — through the prose-only mode. Almost no mainstream games achieve
this; D&D's theater-of-mind always did, and Genesis inherits that birthright. The text-first
doctrine guarantees the data; this doctrine guarantees the DELIVERY: the narration feed is an
ARIA live region · every control keyboard-reachable · the dice overlay decorative-marked, its
result always announced in text (already is) · every visual surface (tracker, battlemap, sheet)
has a prose twin · built-in narrator voice optional, screen-reader semantics primary (SR users
prefer their own voice). **The acceptance gate: a full session — creation to walk to combat to
level-up — completed with the screen off, via screen reader, no sighted assistance.** Runs as
an audit item in the UI lane (H1); every new panel ships with its prose twin or it isn't done.

## §H1 — NEAR (the current arc's natural extensions; hooks already live)

- **Options surface** — expose the named-constants discipline (`XP_TUNE` pattern → `GAME_TUNE`):
  toggle breaches, lethality dials, customize-almost-everything. *Hook: every spec's tunables.*
- **SFX rail** — event→sound map over `applyEvent`. *Hook: the event stream is the trigger rail.*
- **Adaptive music** — the prophetic stub trio (Music Source/Style/Theme) authored + layered
  stems keyed to motif/region/combat. *Hook: motif kits carry the mood key already.*
- **Class game-pieces + visible equipment** — `bwFigure` v2: class silhouettes, equipment
  attachments, the painted-miniature read. *Hook: the weapon-block param + frame-mapped items.*
- **Reskin-reactive models** — motif geometry variants (ice crust, overgrowth) as kit fields.
  *Hook: palettes already flow; geometry variants are one field more.*
- **T3/T4** — content re-tune + un-cap. *Hook: `LEVEL_CEILING`, authored-but-inert by design.*
- **Multi-PC single player** — the party. *Hook: the sidekick IS the prototype; side-based
  initiative + the digest already tolerate a party.*
- **NARRATOR VOICE** — the DM's narration through streaming TTS (2026 tech suffices), timbre
  keyed to lane (deep beats sound different). An optional lens per §0 — and the perfect
  companion to eyes-closed prose-first play. *Hook: the narration stream exists; this is a pipe.*

## §H2 — MEDIUM (real lifts; the architecture already agrees)

- **DM TOOLS → DEV TOOLS → THE SPORE ARC (Adam's pull — staged):**
  1. *In-app authoring* — a table/adventure editor over the EXISTING compile pipeline (markdown
     schema = the validation layer; players author what Adam authors, with the same gates).
  2. *Hand-authored adventures as seeds* — authored adventures enter the seed dispatch with a
     `provenance:"authored"` lane and a CHANCE to surface in your own worlds (you can seed what
     you'll later meet, half-forgotten — the dream of surprising yourself).
  3. *Content packs* — export/import (the world-export machinery generalized to content):
     tables, monsters, items, adventures as shareable packs, compile-validated on ingest.
  4. *The commons* — player-created content populating OTHER players' worlds (the
     Spore/Neverwinter dream): curated ingestion, provenance-tagged, spice-graded on entry,
     surfacing by the same chance machinery. GATES: the content-safety compiler, IP scanning,
     curation before commons. *Hooks: compile-tables.py, frontmatter schema, export/import,
     the seed dispatch, PROVISIONAL discipline — the entire UGC validator already exists
     because Adam built his own authoring that way.*
- **VTT MODE** — the battlemap grown up: DM-facing controls (place/move/reveal), a shared
  spectate view, dynamic environments as the table. Part of the dynamic-environment feature and
  the multiplayer on-ramp — and OPTIONAL, per §0 (a VTT session and a pure-prose session are
  both first-class). *Hook: BATTLEMAP + Blockwright ARE a nascent VTT; `move_zone` is already
  a remote-safe command.*
- **MULTIPLAYER** — events over a wire + authority rules. *Hook: the ledger/EVENT-CONTRACT is
  event-sourcing; deterministic seeds make worlds shareable; the DM digest is already the
  server-side view. Hard, but the hard half is built.*

## §H3 — FAR (waits on the curve; never a rewrite)

- **Canon-woven mythic tables (parked 2026-07-03 — Adam: "the dream sounds badass... put it in
  the dream list, I'm not ready to make those calls today").** A Mythic table fire consults the
  world's OWN seed myth + saga through the gen handshake and manifests as a local expression of
  the world's central mystery — every mythic place echoing the same buried truth. Weaknesses
  weighed at parking: monomyth fatigue (mitigate by weaving only a d6 1-3 fraction — and note
  Adam's live-game counterpoint: a single sun-sacrifice myth CAN drive a whole campaign, so the
  fraction is a dial, not a fix), prose-floor variance vs authored rows, inference cost/latency
  per fire (gated on the DM seat), and the TEXT-FIRST offline guarantee (the authored sub-pools
  are the REQUIRED substrate and fallback — build order settled: mid option first, weave as a
  later lens). Depends: DM-SEAT live · the sub-pool conversions landed.



- **DM-MODE (the flip: player DMs, AI plays)** — sequel-scale; AI-as-player is a different
  competence (goals, immersion, tactical desire). The engine is side-agnostic; the tables serve
  whoever holds the screen. *Genesis II: The Other Chair.*
- **Self-building 3D world** — the LOGIC layer already self-builds (hex/region/walk,
  deterministic, unbounded); what waits is rendering at scale. Blocky-form is reachable early;
  unique-mesh form waits on gen-3D.
- **Dynamic model/environment generation** — when text-to-3D matures, the motif kits BECOME the
  prompts (the slot-in was designed at BLOCKWRIGHT §5). Parametric primitives bridge until then.
- **THE WORLD-MODEL LENS (the Genie horizon — Adam's aim, validated by his own Tectonic Fort
  test: the walk data prompts a world model beautifully. Genesis's rolled output IS structured
  conditioning — dims/features/motif/palette are the specification these engines starve for):**
  - *Vista tier (~1–2 yrs):* pre-rendered explorable MOMENTS (entrances, membranes, horizons),
    generated at PREP TIME per the Speed Doctrine — never blocking a turn.
  - *Segment lens (~3–4 yrs):* explorable segment-scale environments GROUNDED in game state
    (render THIS room with THE dais the dice placed) — waits on state-conditioning + session-
    scale consistency; the curve's pace supports the estimate.
  - *Persistent world lens (~5+ yrs):* revisitable, deterministically re-rendered, hour-coherent
    — the full walk-around-your-world dream; lands in VR when it lands at all.
  Architecture stance: it is JUST ANOTHER RENDERER over the event-sourced state (§0) — adopted
  the day it's good enough, zero rewrite, text-first surviving underneath. We don't bet on WHEN;
  we've built so any answer is fine.
- **VR** — another renderer over the same event-sourced state; the low-poly fiat is
  accidentally the VR-performance choice. Farthest; never a rewrite.

## Dependencies, roughly

Options/SFX/music/pieces ride the current arc → multi-PC before multiplayer → DM tools stage 1–2
before the commons → battlemap→VTT before multiplayer's table → everything before the flip.
Text-first gates ALL of it: any tier that can't run prose-only isn't done.

## §H∞ — "The Private Cut" (Adam's dream, 2026-07-04)

The wish: a personal, at-home version unbound by the genericization — where the realms just *have
it all*, the specific characters Adam grew up loving, for his own solo play at his own table.

**Why it's already half-built:** Genesis's content architecture is a swap-cheap layer by design. The
reskin/Frame model keeps MECHANICS in the SRD chassis (`data/bestiary.js`, `data/items.js`) while
PRESENTATION — names, flavor, models, tints — lives in swappable layers (`data/realm-bestiary.js`,
the `theater-figures.js` model registry, the manifest seams; §II.0b "all art is placeholder,
everything enters through swap-cheap manifest seams"). So the engine is structurally a
**bring-your-own-content engine**: point the presentation layer at a different content pack and it
neither knows nor cares. The Frame stays; only the mask changes.

**The dream seam:** a local **content-pack overlay** — one gitignored file (`data/realm-bestiary.local.js`
or similar) a player drops in that overrides names/flavor/models per realm with whatever *they*
want. The public game loads the genericized layer; the overlay is purely local, purely personal,
authored by the individual for their own single seat.

**The hard line (why the project stays clean):** the SHIPPED / public Genesis — this repo, and its
tooling — stays **genericized and legal, always**. The tooling does not and will not author,
generate, or bundle a copyrighted-character layer; the batch generators explicitly refuse near-copies
of protected franchise characters (see the realm-content briefs + the public-domain/archetype legal
batch). "The Private Cut" is a *seam we leave open*, never a payload we ship — and the moment content
is distributed, personal homage becomes infringement, so the overlay is single-seat and local-only
by definition, never a shared artifact. Public stays public-domain-and-archetype; whatever a solo
player privately authors and runs on their own machine is theirs and lives entirely outside this repo.

*(Filed as a dream, not a roadmap item — the seam falls out of the architecture for free; nobody has
to build "The Private Cut," and the project never carries its contents.)*
