/* GENESIS DATA — data/animal-realm-skins.js — docs/ANIMAL-SOCIAL.md RESOLVED ruling 1 (2026-07-08
   night): animal realm skins get the full spine/skin/extras treatment like roles
   (docs/NPC-ROLE-REALMS.md), not just an in-place DM reskin note. Classic <script> global, NOT an
   ES module — hand-authored (CRAFT-LANE, same as the two Animal Kind row-11 slots it labels), no
   generator script: this is a pure label overlay (relabel only, no drop/add/reweight machinery —
   animals don't have NPC-ROLE-REALMS' archetype-substitution problem, just a single reskin slot per
   table), so a Python data-seam step the way build/gen-role-skins.py exists for roles is overkill
   for one label per realm per table. Never hand-edit the *compiled* tables to bake these in — this
   overlay is applied at roll time (src/engine/codex-roll.js rollPartial) by matching the
   `realm-skin` tag on the drawn row, mirroring the role-skin "relabel, soul stays put" pattern.

   ANIMAL_REALM_SKINS[realmId] = { domestic: <row-11 label for animal-kind>,
                                    wild: <row-11 label for wild-animal-kind> }
   REALM_IDS (data/realms.js, excl. realm-neutral): frontier, chrome, noir, ash, suburb, cosmic,
   theater, high-seas, lost-world, gloom, bright-kingdom — all 11 present below; unknown/absent
   realmId -> animalRealmSkin returns null and rollPartial falls back to the table's own generic
   row-11 text (no regression, same posture as roleForRealm's frontier fallback). */
const ANIMAL_REALM_SKINS = {
  frontier: {
    domestic: "The realm-beast — a rangy cow-dog or a one-eyed mule that's outlived three owners.",
    wild: "The realm-beast — a lone coyote that trots the ridgeline at dusk like it's checking fences.",
  },
  chrome: {
    domestic: "The realm-beast — a scavenging drone-pet, chassis dented, still answers to a whistle.",
    wild: "The realm-beast — a storm-drain mutant, radiation-thick fur, territorial over a stretch of tunnel.",
  },
  noir: {
    domestic: "The realm-beast — an alley cat that knows every fire escape and trusts no one's hand.",
    wild: "The realm-beast — a lean city fox working the rail yards at the edge of the lamplight.",
  },
  ash: {
    domestic: "The realm-beast — a rad-scarred mongrel, patchy-coated, fiercely loyal past reason.",
    wild: "The realm-beast — a hardened dust-wolf, ribs showing, that has learned exactly where the fallout is safe.",
  },
  suburb: {
    domestic: "The realm-beast — a golden retriever that barks at 3am for reasons no one else can see.",
    wild: "The realm-beast — a too-still deer that grazes the cul-de-sac median and never startles.",
  },
  cosmic: {
    domestic: "The realm-beast — a too-clever shade of a cat, correspondences drawn in its coat like a sigil.",
    wild: "The realm-beast — a star-eyed owl that keeps a vigil no calendar explains.",
  },
  theater: {
    domestic: "The realm-beast — a war-mule, unfazed by artillery, carries what the quartermaster can't.",
    wild: "The realm-beast — a battlefield crow, thick in numbers where the fighting was worst.",
  },
  "high-seas": {
    domestic: "The realm-beast — a ship's cat, sea-legged and superstition-proof, worth more than the cargo.",
    wild: "The realm-beast — a reef-wise gull that reads a coming storm before the glass does.",
  },
  "lost-world": {
    domestic: "The realm-beast — a half-tamed saurian runt kept close for its nose, not its temper.",
    wild: "The realm-beast — a territorial pack-hunter saurian that reads as animal until it doesn't.",
  },
  gloom: {
    domestic: "The realm-beast — a black dog that shows up at the worst moment and won't be chased off.",
    wild: "The realm-beast — a pale stag glimpsed once at treeline, never twice from the same angle.",
  },
  "bright-kingdom": {
    domestic: "The realm-beast — a raven that's a shade too clever, keeps a running tally no one taught it.",
    wild: "The realm-beast — a luminous-eyed fox that seems to know the shortest path before you do.",
  },
};

/* animalRealmSkin(kind, realmId) -> label string | null. kind: 'domestic' (animal-kind row 11) or
   'wild' (wild-animal-kind row 11). Pure lookup, no rolling — codex-roll.js calls this only when
   the drawn row carries the 'realm-skin' tag. */
function animalRealmSkin(kind, realmId) {
  const skin = realmId ? ANIMAL_REALM_SKINS[realmId] : null;
  return (skin && skin[kind]) || null;
}
