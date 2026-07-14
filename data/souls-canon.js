/* GENESIS MODULE — data/souls-canon.js — CANON Wandering Souls (shipped source data)
   These are Adam's hand-made characters, considered CANON to the game: they ship
   as source and are seeded into every player's roster on load (see world.state's
   seedCanonSouls). End-users' own banked souls live only in their localStorage;
   the live roster (U.souls) is the union of canon + local.

   Record shape mirrors what the in-app banker (soulFromCGEN / the old ROBIN_SEED)
   produced — plus a stable `id` (so seeding is idempotent), `canon:true`, and
   `pronouns` (a PRONOUN_SETS id — see data/pronouns.js — for DM narration).
   To add a character: bank it in-app to inspect its shape, then transcribe a
   record here with a stable `canon-<name>` id. Classic <script>, shared global scope. */

const CANON_SOULS = [
  {
    id: "canon-robin-hartley", name: "Robin Hartley", pronouns: "he", bornAt: 0, seed: true, canon: true,
    sheet: {
      species: "Human", class: "Ranger", background: "Folk Hero",
      feat: "Savage Attacker", tool: "Vehicles (land)",
      scores: { str: 15, dex: 16, con: 15, int: 8, wis: 16, cha: 13 },
      hp: 12, ac: 13, profBonus: 2, passivePerception: 13, hitDie: "d10",
      saveProfs: ["str", "dex"], skillProfs: ["Animal Handling", "Survival"]
    },
    life: { origins: {}, decisions: {}, age: "", events: [
      { summary: "You committed a crime — or were blamed for one.", detail: "Burglary — cleared after being accused.", hook: "committed a crime — or was blamed for one" }
    ] },
    headline: "a Human Ranger of modest birth — when the moment came for someone to stand up, it was him",
    note: "The first Wandering Soul. A weathered tracker taught him the wild's hidden grammar."
  },
  {
    id: "canon-brunn-graniteback", name: "Brunn Graniteback", pronouns: "he", bornAt: 0, seed: true, canon: true,
    sheet: {
      species: "Dwarf", class: "Fighter", background: "Bog-Iron Digger",
      feat: "Skilled", tool: "Mason's tools",
      scores: { str: 15, dex: 12, con: 13, int: 8, wis: 9, cha: 11 },
      hp: 11, ac: 11, profBonus: 2, passivePerception: 9, hitDie: "d10",
      saveProfs: ["str", "con"], skillProfs: ["Athletics", "Survival"]
    },
    life: { origins: {}, decisions: {}, age: "", events: [
      { summary: "You made a fast friend of a wanderer like yourself.", detail: "Your friend is a dragonborn explorer or wanderer, friendly to you, alive but doing poorly.", hook: "made a fast friend of a wanderer" },
      { summary: "You met someone who mattered.", detail: "They are a dwarf scholar, friendly to you, alive and quite successful.", hook: "met someone who mattered" },
      { summary: "You made an enemy of a wanderer like yourself.", detail: "Your enemy is a dwarf laborer, hostile to you, alive and well.", hook: "made an enemy of a wanderer" },
      { summary: "A bit of good fortune found you.", detail: "You saved a commoner's life; they owe you a life-debt and travel with you.", hook: "a bit of good fortune (life-debt companion)" },
      { summary: "You fought in a battle.", detail: "You took only minor wounds, all healed clean.", hook: "fought in a battle" },
      { summary: "A bit of good fortune found you.", detail: "You saved a commoner's life; they owe you a life-debt and travel with you.", hook: "a bit of good fortune (life-debt companion)" }
    ] },
    headline: "a Dwarf Fighter of modest birth — the foundry took him young; he learned the weight of ore before his letters",
    note: "Banked from the Ironvale session. A Bog-Iron Digger who made a fast friend of a wanderer; carries two life-debt companions."
  },
  {
    id: "canon-milo", name: "Milo", pronouns: "he", bornAt: 0, seed: true, canon: true,
    sheet: {
      species: "Halfling", class: "Rogue", background: "Charlatan",
      feat: "Skilled", tool: "Disguise kit",
      scores: { str: 15, dex: 17, con: 15, int: 15, wis: 11, cha: 12 },
      hp: 10, ac: 13, profBonus: 2, passivePerception: 10, hitDie: "d8",
      saveProfs: ["dex", "int"], skillProfs: ["Deception", "Sleight of Hand"]
    },
    life: { origins: {}, decisions: {}, age: "", events: [
      { summary: "You fought in a battle.", detail: "You bore yourself so well you are remembered as a hero.", hook: "fought in a battle (remembered a hero)" },
      { summary: "You suffered a tragedy.", detail: "You lost everything you owned in a disaster and had to start over.", hook: "suffered a tragedy (lost everything)" }
    ] },
    headline: "a Halfling Rogue of wealthy birth — talked his way out of trouble so often the talking became a trade",
    note: "Banked from the Slategloom session. A Charlatan who learned a thief's craft well enough to beat them at it."
  }
];
