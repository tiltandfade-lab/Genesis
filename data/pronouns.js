/* GENESIS MODULE — data/pronouns.js — pronoun sets for creation + DM narration.
   A text-based adventure needs to know how to refer to a character. The player picks a
   set during creation; it's stored on the soul/character and surfaced to the AI DM in the
   handoff so narration uses the right words. `pronounSet(id)` expands an id to its forms.
   Classic <script>, shared global scope. */

const PRONOUN_SETS = [
  { id: "they", label: "they / them", subj: "they", obj: "them", poss: "their", reflex: "themself" },
  { id: "she",  label: "she / her",  subj: "she",  obj: "her",  poss: "her",   reflex: "herself" },
  { id: "he",   label: "he / him",   subj: "he",   obj: "him",  poss: "his",   reflex: "himself" }
];

function pronounSet(id){ return PRONOUN_SETS.find(p => p.id === id) || PRONOUN_SETS[0]; }
