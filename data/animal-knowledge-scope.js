/* GENESIS DATA — data/animal-knowledge-scope.js — docs/ANIMAL-SOCIAL.md §5/§6 U6: "what the herd
   knows vs what the raven knows." A small CRAFTED mapping, hand-authored (NOT rolled), keyed by
   `wild-animal-kind`'s own d12 row number (Engine/03. _Tables/02. Social/Sentient NPCs/Wild Animal
   Kind.md) — one row IS one stable identity, so the scope rides the row, never a text/regex match
   against the (possibly realm-skinned) kind label. Classic <script> global, NOT an ES module.

   §5's four named scopes, verbatim:
     herd      = movement, weather, what spooked them and from which direction
     bird      = faces, shiny objects, carrion, everything within a day's flight (adjacent-node reach)
     predator  = who else hunts here, what the prey do differently lately
     burrower  = underground — voids, water, what the earth carries
   Two more, load-bearing but not named as a fourth/fifth kind in §5's prose:
     elder     = row 12, "the elder of the wood" — the territory-holder whose territory IS the node;
                 broadest scope (every channel) + adjacent reach, same posture as bird's day's-flight.
     generic   = every row §5 doesn't name a kind for (river/marsh dweller, old solitary beast,
                 half-wild fringe-dweller, the realm-beast slot) — today's unscoped behavior,
                 unchanged: every ledger channel, no adjacent-node reach. Never a regression for a
                 row §5 doesn't carve out — silence in the spec means "keep the wide net," not "cut
                 it off."

   Each entry: { category, ledgerTypes: string[]|null (null = no filter, every animalLedgerSenseFor
   composite/base type passes — the pre-U6 default), adjacentReach: bool (true = the witness's `seen`
   window extends to nodes adjacent to the animal's own status.at, same day's-flight/territory-reach
   grammar §2 already gives bird-kind text; U6 makes it row-driven instead of a name regex — see
   animalKnowledgeScopeFor below and its call site in src/world/codex.js's animalWitnessSeen). The
   ledgerTypes vocabulary matches src/world/codex.js's ANIMAL_LEDGER_SENSE composite/base keys
   ("drift", "npc-life", "outcome:kill", "outcome:social", "outcome:move-zone", "canon:discovery") —
   an entry with no matching key in ANIMAL_LEDGER_SENSE just falls through the filter (never crashes
   on an unrecognized ledger event type; animalWitnessSeen's own animalLedgerSenseFor already null-
   safes an unmapped type to a generic "something happened nearby" sound note, which no scope keeps
   out on purpose — see the fallback comment on that helper).

   Row map (Wild Animal Kind.md, verbatim label per row):
     1  Territory wolf / pack-runner        -> predator (its territory reading IS who-hunts-here)
     2  Grazing herd                        -> herd
     3  Watcher-bird                        -> bird
     4  River or marsh dweller              -> generic
     5  Burrower                            -> burrower
     6  Ambush predator                     -> predator
     7  Carrion-feeder                      -> predator (first to know when something has died —
                                                "who else hunts here" widened to "who else died here")
     8  Migrant flock                       -> bird ("passes through and carries news of where it's
                                                been" — day's-flight reach is the whole point of the row)
     9  Old solitary beast                  -> generic
     10 Half-wild fringe-dweller            -> generic
     11 The realm-beast (reskin slot)       -> generic (varies per realm; no fixed sense profile)
     12 The elder of the wood (landmark)    -> elder */
const ANIMAL_KNOWLEDGE_SCOPE_CATEGORIES = {
  herd:     { ledgerTypes: ["outcome:move-zone", "drift"], adjacentReach: false },
  bird:     { ledgerTypes: ["npc-life", "outcome:kill", "canon:discovery"], adjacentReach: true },
  // HQ-5 (docs/ANIMAL-SOCIAL-HQ.md D7): outcome:move-zone REMOVED — its from/to are combat
  // band:lane strings, structurally never map nodes, so it can never satisfy a node-scoped
  // witness. Re-add only once a node-stamped move-zone writer exists.
  predator: { ledgerTypes: ["outcome:kill"], adjacentReach: false },
  burrower: { ledgerTypes: ["drift", "canon:discovery"], adjacentReach: false },
  elder:    { ledgerTypes: null, adjacentReach: true },
  generic:  { ledgerTypes: null, adjacentReach: false },
};
const ANIMAL_KNOWLEDGE_SCOPE = {
  1:  "predator", 2: "herd",     3: "bird",     4: "generic",
  5:  "burrower", 6: "predator", 7: "predator", 8: "bird",
  9:  "generic",  10: "generic", 11: "generic", 12: "elder",
};

/* animalKnowledgeScopeFor(rec) -> { category, ledgerTypes, adjacentReach } for an animal partial
   record. Reads rec.dm.wildKindRow (stamped at mint by rollPartial for env:"wilderness" draws only
   — src/engine/codex-roll.js). No row (a domestic-band draw, or a record minted before this field
   existed) -> "generic" (the unscoped-by-category default, byte-identical to pre-U6 behavior: every
   ledger type, no adjacent reach beyond whatever the caller's own bird-text regex already grants).
   Pure; never mutates rec. */
function animalKnowledgeScopeFor(rec) {
  const row = rec && rec.dm && rec.dm.wildKindRow;
  const key = (row != null && ANIMAL_KNOWLEDGE_SCOPE[row]) || "generic";
  return Object.assign({ category: key }, ANIMAL_KNOWLEDGE_SCOPE_CATEGORIES[key]);
}
