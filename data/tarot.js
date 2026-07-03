/* GENESIS DATA — data/tarot.js — the 78-card RWS deck for the SESSION DRAW (docs/TAROT-SESSION.md).
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Hand-authored source data (like data/economy.js) — NOT a compiled artifact; edit here directly.

   §0 Adam's fork (2026-07-01): HYBRID mapping. The 56 minors (suit × rank) map MECHANICALLY — one
   upright + one reversed omen line each (authored, FRAG-register 6-10 words), everything else
   (domain weight/intensity/valence) computed at draw time by src/engine/tarot.js from suit/rank/
   reversal, never authored per-card. The 22 Majors get a BESPOKE authored mutator per polarity (44
   entries total) — a DM-read directive {omen, op, params, note}. `op` names a real, implementable
   operation in src/engine/tarot.js's TAROT_MAJOR_OPS; an op with no live backing degrades to a
   no-op (never a silently invented mechanic — BATCH2-GUARDRAILS H3).

   Anchored VERBATIM to Adam's 5 approved samples (TAROT-SESSION.md §4: The Tower up/rev, The Moon
   up, Death up, The Sun rev) — the other 17×2 authored in that voice per the review protocol. The
   Moon's mutator substitutes a real hook (crit-magnitude lens count) for the spec's literal "every
   Distant Word rolls two lenses" (no Distant-Word→lens hook exists in the merged codebase) — the
   nearest-implementable version per H3; flagged in the build's uncertainties.
   RE-CHECKED 2026-07-03 (gap-wiring CALLER unit, docs/BATCH3-PLAN.md unit 1): Distant Word now FIRES
   in-app (the `distant_word` event + the drift `rep` tag), so the ref was re-audited — but
   `distantWordRoll` returns ONE lens per roll (Distortion|Color) with no lens-COUNT parameter, so the
   spec's "two lenses" still has no natural hook. `crackedLensBias` remains the correct
   nearest-implementable substitute; it resolves cleanly (rides op/opParams to the DM layer, verified by
   dev/verify-gap-callers.mjs §6). No change needed — the substitution stands.

   Card IMAGES are DEFERRED (BATCH2-GUARDRAILS H3 — a curated morning task): every entry's assetKey
   ships null; the frontispiece renders a name + suit-glyph placeholder until the RWS scan batch lands. */

// ─── suits: domain + the roller each suit weights (TAROT-SESSION.md §1) ───────
const TAROT_SUITS = {
  Swords: { domain:"threat",  label:"Swords", glyph:"⚔" },   // archetype-pool + encounter-type weights up
  Cups:   { domain:"social",  label:"Cups",   glyph:"⚱" },    // ambient pool +1, attitude events likelier
  Coins:  { domain:"economy", label:"Coins",  glyph:"⛁" },    // stock quality, valuables chance
  Wands:  { domain:"magic",   label:"Wands",  glyph:"🜂" },    // spice-tail weight on skins/drift
};
const TAROT_RANKS = ["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"];
const TAROT_COURT = { Page:true, Knight:true, Queen:true, King:true };   // court cards additionally bias toward a PERSON as the vector

// ─── MINORS: 56 base cards (suit × rank). Omen varies upright/reversed (112 authored lines). ──
const TAROT_MINOR_OMENS = {
  Swords: {
    Ace: { up:"A blade is drawn somewhere near tonight.", rev:"The first cut lands somewhere unintended." },
    Two: { up:"Two paths, and only steel decides between them.", rev:"The standoff breaks the wrong way tonight." },
    Three: { up:"Something is about to break, cleanly.", rev:"The break already happened; no one's noticed." },
    Four: { up:"A held breath before the strike lands.", rev:"The rest is interrupted before it began." },
    Five: { up:"Someone wins tonight by losing something first.", rev:"The loss tonight buys nothing worth having." },
    Six: { up:"Passage costs more than the fare tonight.", rev:"The passage back is not open anymore." },
    Seven: { up:"Someone is taking more than their share.", rev:"The theft is discovered at the worst moment." },
    Eight: { up:"You are more surrounded than you think.", rev:"The trap was sprung and no one's caught yet." },
    Nine: { up:"Sleep does not come easy tonight.", rev:"The worry tonight was aimed at the wrong thing." },
    Ten: { up:"An old wound finally finishes what it started.", rev:"The worst has already happened, and worse follows." },
    Page: { up:"A messenger arrives armed with bad news.", rev:"The messenger is the danger, not the news." },
    Knight: { up:"Someone is charging in without a plan.", rev:"The charge arrives with no one behind it." },
    Queen: { up:"A sharp mind is watching this whole table.", rev:"The sharp mind at this table means you harm." },
    King: { up:"Authority tonight answers only to force.", rev:"Authority here has already turned violent." },
  },
  Cups: {
    Ace: { up:"Someone is about to matter to you.", rev:"The feeling arriving tonight is not a kind one." },
    Two: { up:"Two people are about to understand each other.", rev:"An understanding breaks before it forms." },
    Three: { up:"A reunion is closer than anyone expects.", rev:"The reunion tonight is not the happy kind." },
    Four: { up:"An offer sits ignored on the table tonight.", rev:"The offer on the table was a trap." },
    Five: { up:"Grief is easier to see than what's left standing.", rev:"What's left standing is worse than the loss." },
    Six: { up:"The past sends someone to your door tonight.", rev:"The past arrives owed, not owing." },
    Seven: { up:"Every option looks like the right one tonight.", rev:"Every open door tonight leads somewhere bad." },
    Eight: { up:"Someone walks away from something they earned.", rev:"Someone stays who should have walked away." },
    Nine: { up:"Satisfaction hides what it actually cost.", rev:"What was wanted turns out hollow tonight." },
    Ten: { up:"A whole household is watching tonight unfold.", rev:"The household unravels in front of everyone." },
    Page: { up:"A young face brings news wrapped in feeling.", rev:"The young face means harm without knowing it." },
    Knight: { up:"A romantic gesture arrives at the worst time.", rev:"The romantic gesture is a manipulation tonight." },
    Queen: { up:"A kind ear is listening more than it lets on.", rev:"The kind ear tonight is not on your side." },
    King: { up:"Calm authority is steering something unseen.", rev:"Calm authority tonight is a mask for cruelty." },
  },
  Coins: {
    Ace: { up:"Fortune leaves a door unlocked tonight.", rev:"The money is the problem tonight." },
    Two: { up:"Someone is juggling more than they can hold.", rev:"Both costs come due at once tonight." },
    Three: { up:"Skilled hands are building something worth seeing.", rev:"Cooperation here is about to fall apart." },
    Four: { up:"Someone is holding on too tight to let this go.", rev:"What's hoarded is already slipping away." },
    Five: { up:"Someone outside is looking in at what they lack.", rev:"The hardship tonight is closer than it looks." },
    Six: { up:"Generosity comes with an unspoken price tonight.", rev:"The generosity tonight is a debt in disguise." },
    Seven: { up:"Patience is the only currency that matters here.", rev:"The harvest fails, and everyone notices at once." },
    Eight: { up:"Careful work is paying off, slowly, tonight.", rev:"The careful work tonight was wasted effort." },
    Nine: { up:"Comfort here was earned the hard way.", rev:"The comfort tonight was never really earned." },
    Ten: { up:"Wealth here comes bound to family and debt.", rev:"The fortune tonight breaks the family that built it." },
    Page: { up:"Someone young is studying how the world pays.", rev:"The small opportunity tonight is a swindle." },
    Knight: { up:"Diligence moves slow but doesn't stop tonight.", rev:"The reliable one drops something important tonight." },
    Queen: { up:"Someone here manages more than they let on.", rev:"The practical kindness tonight has a hidden cost." },
    King: { up:"Someone built real wealth and means to keep it.", rev:"The wealth here was built on someone's ruin." },
  },
  Wands: {
    Ace: { up:"Something impossible leans in to look.", rev:"The spark catches something it shouldn't have." },
    Two: { up:"A choice about the wider world sits waiting.", rev:"The wider plan collapses before it starts." },
    Three: { up:"A distant venture is finally paying off.", rev:"The distant venture tonight has failed quietly." },
    Four: { up:"A homecoming feels closer than the map admits.", rev:"The homecoming tonight isn't the one hoped for." },
    Five: { up:"A dispute breaks out over nothing that matters.", rev:"The dispute tonight has real stakes after all." },
    Six: { up:"A victory is about to be seen by everyone.", rev:"The victory tonight belongs to the wrong side." },
    Seven: { up:"Someone is defending ground worth defending.", rev:"The ground being held tonight is already lost." },
    Eight: { up:"Events are about to move very quickly.", rev:"Everything arrives at once, and none of it good." },
    Nine: { up:"Someone is exhausted but not yet finished.", rev:"The exhaustion tonight has nothing left to give." },
    Ten: { up:"A burden is being carried alone tonight.", rev:"The burden tonight breaks whoever carries it." },
    Page: { up:"A young voice brings an idea too big for it.", rev:"The idea tonight is bigger than anyone can handle." },
    Knight: { up:"Someone is riding toward a fight they chose.", rev:"Impulse tonight leads somewhere no one can follow." },
    Queen: { up:"Someone commands a room without raising their voice.", rev:"The confidence tonight is covering for fear." },
    King: { up:"A bold vision is already reshaping the room.", rev:"The bold vision tonight belongs to someone dangerous." },
  },
};

// ─── MAJORS: 22 cards, bespoke upright/reversed mutator each (44 authored entries). Each mutator
// is a DM-read DIRECTIVE {omen, op, params, note} — `op` names a real operation in
// src/engine/tarot.js's TAROT_MAJOR_OPS (the numeric/pool ops are mechanized; the clock/thread ops
// ride the digest as text for the DM to apply in-fiction, matching sessionLean's existing
// DM-reads-a-directive pattern — DM-agency rules: the script never decides the PC's actions or
// invents canon on its own). An op with no live backing is a safe no-op, never a silent invention. ──
const TAROT_MAJORS = [
  { name:"The Fool", ordinal:0,
    up:  { omen:"The next step is taken without looking down.", op:"noNudge", params:{}, note:"a leap of faith — no mechanical bias, just an open door somewhere unexpected" },
    rev: { omen:"The fall was foreseeable and ignored anyway.", op:"noNudge", params:{}, note:"a foolish choice already made — the consequence is due, not invented" } },
  { name:"The Magician", ordinal:1,
    up:  { omen:"Every tool at hand is suddenly enough.", op:"archetypeWeight", params:{domain:"magic",mult:1.3}, note:"resourcefulness rewarded — the strange/skilled option works tonight" },
    rev: { omen:"The trick tonight is being played on you.", op:"archetypeWeight", params:{domain:"threat",mult:1.2}, note:"cleverness turned against the party — a deception-flavored threat leans in" } },
  { name:"The High Priestess", ordinal:2,
    up:  { omen:"A secret sits patiently, waiting to be asked for.", op:"revealSecretOnStrange", params:{}, note:"the next Strange+ roll surfaces one hidden dm-field fact, script-picked" },
    rev: { omen:"What's hidden tonight wants to stay that way.", op:"stealthDcBump", params:{dc:1}, note:"concealment is harder to pierce — a small DC bump on perception-adjacent checks" } },
  { name:"The Empress", ordinal:3,
    up:  { omen:"Something here is quietly, generously fertile.", op:"ambientPoolBonus", params:{n:1}, note:"the world is a little more populated and giving tonight" },
    rev: { omen:"Abundance tonight has quietly gone to rot.", op:"stockBias", params:{mult:0.7}, note:"what should be plentiful is thin — shop stock leans scarce" } },
  { name:"The Emperor", ordinal:4,
    up:  { omen:"Order asserts itself, whether anyone likes it.", op:"archetypeWeight", params:{domain:"threat",mult:1.15}, note:"structure and authority push back — an ordered, institutional threat leans in" },
    rev: { omen:"The one in charge has lost their grip tonight.", op:"spiceNudge", params:{dir:1}, note:"instability where control used to be — the spice curve tilts stranger" } },
  { name:"The Hierophant", ordinal:5,
    up:  { omen:"Tradition has an answer, if anyone will ask it.", op:"archetypeWeight", params:{domain:"social",mult:1.2}, note:"institutions and elders have something to offer tonight" },
    rev: { omen:"The old rule doesn't apply here anymore.", op:"spiceNudge", params:{dir:1}, note:"orthodoxy fails — the strange gets a longer leash" } },
  { name:"The Lovers", ordinal:6,
    up:  { omen:"A choice tonight is really about who you trust.", op:"archetypeWeight", params:{domain:"social",mult:1.3}, note:"relationship stakes rise — an attitude-bearing NPC beat leans in" },
    rev: { omen:"A bond frays over something small and true.", op:"ambientPoolBonus", params:{n:-1}, note:"the social world tonight is a little thinner, a little colder" } },
  { name:"The Chariot", ordinal:7,
    up:  { omen:"Momentum carries you further than planning did.", op:"archetypeWeight", params:{domain:"threat",mult:1.15}, note:"a decisive, forward-driving encounter leans in — willpower over caution" },
    rev: { omen:"The wheels are turning but going nowhere.", op:"stockBias", params:{mult:0.85}, note:"stalled momentum — resources tonight feel a little scarcer" } },
  { name:"Strength", ordinal:8,
    up:  { omen:"Patience tonight succeeds where force would fail.", op:"stealthDcBump", params:{dc:-1}, note:"a gentler hand on the world — stealth-adjacent checks ease by one" },
    rev: { omen:"Restraint runs out sooner than expected tonight.", op:"archetypeWeight", params:{domain:"threat",mult:1.25}, note:"something's temper snaps — a volatile, aggressive threat leans in" } },
  { name:"The Hermit", ordinal:9,
    up:  { omen:"A lone light is worth following tonight.", op:"revealSecretOnStrange", params:{}, note:"solitary insight — the next Strange+ roll surfaces a hidden dm-field fact" },
    rev: { omen:"Isolation tonight is not the safety it seems.", op:"ambientPoolBonus", params:{n:-1}, note:"withdrawal costs company — the ambient pool runs a little thin" } },
  { name:"Wheel of Fortune", ordinal:10,
    up:  { omen:"The wheel turns, and turns in your favor.", op:"stockBias", params:{mult:1.3}, note:"luck runs generous — shop stock and valuables lean rich" },
    rev: { omen:"The wheel turns, and turns against you.", op:"stockBias", params:{mult:0.6}, note:"luck runs thin — shop stock and valuables lean scarce" } },
  { name:"Justice", ordinal:11,
    up:  { omen:"Accounts are about to be settled fairly.", op:"nominateOldestThread", params:{}, note:"the script nominates the OLDEST open thread — tonight it gets an honest hearing" },
    rev: { omen:"The scales tonight are thumbed by someone's hand.", op:"archetypeWeight", params:{domain:"threat",mult:1.15}, note:"corruption in the process — an institutional/authority threat leans in" } },
  { name:"The Hanged Man", ordinal:12,
    up:  { omen:"A different angle changes everything tonight.", op:"revealSecretOnStrange", params:{}, note:"suspended perspective — the next Strange+ roll surfaces a hidden fact" },
    rev: { omen:"Nothing moves no matter how hard you pull.", op:"spiceNudge", params:{dir:-1}, note:"stuckness — the spice curve tilts a shade more grounded tonight" } },
  { name:"Death", ordinal:13,
    up:  { omen:"An ending has been patient long enough.", op:"nominateOldestThread", params:{}, note:"the script nominates the OLDEST open thread for closure; walks/drift/recall bias toward it — it ends this session, one way or the other" },
    rev: { omen:"Something refuses to die when it should.", op:"nominateOldestThread", params:{softenClose:true}, note:"the oldest thread is nominated but the ending stalls — it lingers, worse for the wait" } },
  { name:"Temperance", ordinal:14,
    up:  { omen:"Balance holds, and holding is its own reward.", op:"noNudge", params:{}, note:"an even keel — no bias, a quiet confirming session" },
    rev: { omen:"Something has been mixed that shouldn't combine.", op:"archetypeWeight", params:{domain:"magic",mult:1.2}, note:"an unstable combination — a strange/volatile encounter leans in" } },
  { name:"The Devil", ordinal:15,
    up:  { omen:"A bargain tonight is better than it looks.", op:"stockBias", params:{mult:1.2}, note:"temptation with real value attached — stock and valuables lean rich, with a hook" },
    rev: { omen:"Whatever chains you tonight was chosen, once.", op:"archetypeWeight", params:{domain:"threat",mult:1.2}, note:"a self-inflicted bind comes due — a predatory, cornering threat leans in" } },
  { name:"The Tower", ordinal:16,
    up:  { omen:"Something long-standing has been leaning for years.", op:"advanceHottestClock", params:{}, note:"the script advances the FULLEST clock to firing this session; the session opens with the crack, not the fall" },
    rev: { omen:"The crack runs through your own floor.", op:"advanceHottestClock", params:{ownedByPC:true}, note:"the breaking thing is the PC's — a bond, an asset, a standing; softer landing, longer debris (a thread mints from the wreckage)" } },
  { name:"The Star", ordinal:17,
    up:  { omen:"Hope tonight is quiet, and it is real.", op:"ambientPoolBonus", params:{n:1}, note:"a gentle, hopeful world — the ambient pool runs a little richer" },
    rev: { omen:"Even hope is running short tonight.", op:"stockBias", params:{mult:0.8}, note:"a starved world — stock and valuables lean thin" } },
  { name:"The Moon", ordinal:18,
    up:  { omen:"Two roads tell two truths tonight.", op:"crackedLensBias", params:{extra:1}, note:"distortion doubles — nearest-implementable substitute for the spec's 'every Distant Word rolls two lenses' (no Distant-Word→lens hook exists in the merged codebase): the next mythic-tier crit this session draws one extra lens. possiblyFalse-flagging a digest fact is likewise unbuilt — flagged in uncertainties, not invented." },
    rev: { omen:"The fog lifts on something worse than guessed.", op:"revealSecretOnStrange", params:{}, note:"clarity arrives unwelcome — the next Strange+ roll surfaces a hidden fact" } },
  { name:"The Sun", ordinal:19,
    up:  { omen:"Nothing stays hidden under a sky this clear.", op:"stealthDcBump", params:{dc:1}, note:"everything is seen — stealth-adjacent checks tick up a notch" },
    rev: { omen:"No shade anywhere today.", op:"stealthDcBump", params:{dc:2}, note:"everything is seen — stealth-type checks +2 DC, every Strange+ roll surfaces a secret, NPCs notice what the party carries openly" } },
  { name:"Judgement", ordinal:20,
    up:  { omen:"A reckoning arrives, and it is overdue.", op:"nominateOldestThread", params:{}, note:"a call to account — the oldest open thread is nominated to answer for itself" },
    rev: { omen:"The reckoning tonight judges the wrong party.", op:"archetypeWeight", params:{domain:"threat",mult:1.15}, note:"misplaced blame turns dangerous — an accusatory, cornering threat leans in" } },
  { name:"The World", ordinal:21,
    up:  { omen:"Something whole closes, and something opens.", op:"nominateOldestThread", params:{completion:true}, note:"a completion beat — the oldest thread closes cleanly, the session can end on arrival" },
    rev: { omen:"Nothing quite finishes the way it should tonight.", op:"noNudge", params:{}, note:"loose ends persist — no mechanical bias, just an incomplete feeling worth honoring" } },
];

// ─── the flat 78-card deck (56 minors + 22 majors), assembled once from the tables above. Each
// entry: {name, major, suit, rank, court, ordinal, up:{omen,...}, rev:{omen,...}}. Card IMAGES are
// deferred (assetKey always null — H3); the frontispiece renders name + suit-glyph until the RWS
// scan batch lands. ──
const TAROT_DECK = (function(){
  const deck = [];
  Object.keys(TAROT_SUITS).forEach(suit => {
    TAROT_RANKS.forEach(rank => {
      const o = TAROT_MINOR_OMENS[suit][rank];
      deck.push({
        name: rank+" of "+suit, major:false, suit, rank, court: !!TAROT_COURT[rank],
        domain: TAROT_SUITS[suit].domain, glyph: TAROT_SUITS[suit].glyph,
        up: { omen:o.up }, rev: { omen:o.rev },
        assetKey: null,
      });
    });
  });
  TAROT_MAJORS.forEach(m => {
    deck.push({
      name: m.name, major:true, suit:null, rank:null, court:false, ordinal:m.ordinal,
      domain: null, glyph:"✦",
      up: m.up, rev: m.rev,
      assetKey: null,
    });
  });
  return deck;
})();
