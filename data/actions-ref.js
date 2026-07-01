/* GENESIS DATA — data/actions-ref.js — the standard-actions reference vocabulary
   (docs/IN-SESSION-UI.md §5b). Static reference cards for the Actions panel's "Actions"
   tab — INFORM-ONLY: the player reads these, then types their action; nothing here is a
   command button (no onclick anywhere the cards render). Classic <script>, shared global
   scope. Hand-authored (small + stable); no generator.
   Named STANDARD_ACTIONS_REF (not STANDARD_ACTIONS) — engine.combat-actions already owns
   STANDARD_ACTIONS as its mechanical action-kind list; this is the player-facing prose twin. */
const STANDARD_ACTIONS_REF = [
  { name: "Attack",     desc: "Make one melee or ranged attack (more with Extra Attack)." },
  { name: "Dash",       desc: "Gain extra movement equal to your Speed this turn." },
  { name: "Disengage",  desc: "Your movement doesn't provoke opportunity attacks this turn." },
  { name: "Dodge",      desc: "Attacks against you have disadvantage; you have advantage on Dex saves, if you can see the attacker." },
  { name: "Help",       desc: "Aid an ally's check (advantage) or set up their attack against a creature near you." },
  { name: "Hide",       desc: "Make a Dexterity (Stealth) check to become unseen." },
  { name: "Ready",      desc: "Prepare an action to trigger on a chosen circumstance before your next turn." },
  { name: "Search",     desc: "Devote your attention to finding something — usually a Perception or Investigation check." },
  { name: "Study",      desc: "Devote your attention to learning about a creature or object — usually an Insight or Investigation check." },
  { name: "Influence",  desc: "Try to influence a creature's attitude through negotiation, deception, or intimidation." },
  { name: "Utilize",    desc: "Use a nonweapon object — pull a lever, light a torch, uncork a potion." },
  { name: "Grapple",    desc: "A Strength (Athletics) contest to seize and restrain a creature." },
  { name: "Shove",      desc: "A Strength (Athletics) contest to push a creature 5 ft away or knock it prone." }
];
