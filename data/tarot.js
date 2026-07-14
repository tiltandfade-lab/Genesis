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

// ─── MAJORS: 22 cards, bespoke upright/reversed mutator each (44 authored entries). TAROT-2
// (docs/TAROT-2.md §1) upgrades each polarity to the STRICT schema
// {omen, op, params, dmNote, visibleTell, payoff}: `op` MUST be a key of TAROT_OPS
// (src/engine/tarot.js — the real registry that ends the old TAROT_MAJOR_OPS doc-vs-code drift);
// `params` matches the op's exact shape (§2.2); `dmNote` is the concrete session instruction to the
// DM (replaces the old `note` — tarotDraw sets both mutator.dmNote and mutator.note to the same
// string as a back-compat alias); `visibleTell` (≤14 words) is the ONE world observation the DM can
// plant early; `payoff` (≤18 words) names the typed event / state bucket the card lands through.
// dmNote/visibleTell/payoff are DM-ONLY (they ride the digest, never the player frontispiece).
// The numeric ops mechanize into the session vector (tarotMajorVector); directive ops ride
// op/params(+a script-picked target) through the digest and land via typed events — DM-agency rules:
// the script never decides the PC's actions or invents canon on its own.
// TEXT AUTHORING (docs/TAROT-2.md §1/§9): the 44 `omen` strings are UNCHANGED (Adam's 5 anchors stay
// byte-verbatim). The 44×3 dmNote/visibleTell/payoff strings are executor-drafted per the §2.4
// formula and are PROVISIONAL — Adam skims (card prose is Adam-supervised craft; schema/ops are locked). ──
const TAROT_MAJORS = [
  { name:"The Fool", ordinal:0,
    up:  { omen:"The next step is taken without looking down.", op:"openDoor", params:{},
           dmNote:"one blocked path, clue, or contact is unusually available tonight — no cost attached; the leap is the player's to take or refuse",
           visibleTell:"A door that is always locked stands ajar.",
           payoff:"taking the opening lands via tarot_landed {via:'door'}; the path taken persists on the map" },
    rev: { omen:"The fall was foreseeable and ignored anyway.", op:"closeDoor", params:{},
           dmNote:"one easy route quietly shuts tonight while a stranger, harder way is pointed to; name the closed way, don't force the strange one",
           visibleTell:"The road you meant to take is barred without warning.",
           payoff:"the reroute lands via tarot_landed {via:'door'}; the closed way persists on the map" } },
  { name:"The Magician", ordinal:1,
    up:  { omen:"Every tool at hand is suddenly enough.", op:"archetypeWeight", params:{domain:"magic",mult:1.3},
           dmNote:"resourcefulness rewarded — the strange/skilled option works tonight; the magic domain leans in on rolled encounters",
           visibleTell:"An old tool hums like it was waiting to be used.",
           payoff:"the biased magic-domain encounter lands through the rolled walk/threat" },
    rev: { omen:"The trick tonight is being played on you.", op:"twistReward", params:{shape:"bargain"},
           dmNote:"the trick is played on you — the next significant reward this session arrives with a hook in it, reshaped from what was expected; the value is real but so is the catch",
           visibleTell:"The prize on offer is a shade too easy to reach.",
           payoff:"the reshaped reward lands DM-declared via tarot_landed {via:'loot'}" } },
  { name:"The High Priestess", ordinal:2,
    up:  { omen:"A secret sits patiently, waiting to be asked for.", op:"surfaceHiddenFact", params:{},
           dmNote:"a script-picked codex record is hiding a real secret/fear/leverage tonight; surface that hidden field through a scene when the party leans close — named, not invented",
           visibleTell:"Someone here is holding a truth they haven't been asked for.",
           payoff:"the surfaced fact lands via codex_reveal / fact_canonized on the picked record" },
    rev: { omen:"What's hidden tonight wants to stay that way.", op:"stealthDcBump", params:{dc:1},
           dmNote:"concealment is harder to pierce tonight — a small DC bump on perception-adjacent checks; what's hidden fights to stay hidden",
           visibleTell:"Every shadow here seems to lean a little deeper.",
           payoff:"the DC bump rides the session vector into resolveCheck" } },
  { name:"The Empress", ordinal:3,
    up:  { omen:"Something here is quietly, generously fertile.", op:"ambientPoolBonus", params:{n:1},
           dmNote:"the world is a little more populated and giving tonight — the ambient cast pool runs one richer",
           visibleTell:"The place is fuller of life than it was yesterday.",
           payoff:"the +1 ambient pool rides the vector into prepCastAmbient" },
    rev: { omen:"Abundance tonight has quietly gone to rot.", op:"stockBias", params:{mult:0.7},
           dmNote:"what should be plentiful is thin — shop stock leans scarce tonight; the harvest here has soured",
           visibleTell:"The stalls are half-empty and the fruit has turned.",
           payoff:"the 0.7 stock multiplier rides the vector into makeShop's stock roll" } },
  { name:"The Emperor", ordinal:4,
    up:  { omen:"Order asserts itself, whether anyone likes it.", op:"pressureFaction", params:{mode:"expose"},
           dmNote:"the dominant power shows its hand tonight — the hottest faction's grip becomes visible in-fiction; order asserting itself, offered as a fact of the scene, never as a demand on the PC",
           visibleTell:"The powerful here stop pretending they aren't in charge.",
           payoff:"the exposure lands detected on the faction's clock_advanced/clock_fired, or DM-declared via tarot_landed {via:'faction-clock'}" },
    rev: { omen:"The one in charge has lost their grip tonight.", op:"spiceNudge", params:{dir:1},
           dmNote:"instability where control used to be — the spice curve tilts one step stranger tonight as authority slips",
           visibleTell:"Whoever ran this place isn't running it anymore.",
           payoff:"the +1 spice lean rides the vector into the walk/skin spice reroll" } },
  { name:"The Hierophant", ordinal:5,
    up:  { omen:"Tradition has an answer, if anyone will ask it.", op:"archetypeWeight", params:{domain:"social",mult:1.2},
           dmNote:"institutions and elders have something to offer tonight — the social domain leans in on rolled encounters",
           visibleTell:"An old authority here still keeps the old answers.",
           payoff:"the biased social-domain encounter lands through the rolled cast/attitude beat" },
    rev: { omen:"The old rule doesn't apply here anymore.", op:"spiceNudge", params:{dir:1},
           dmNote:"orthodoxy fails tonight — the strange gets a longer leash; the spice curve tilts one step stranger",
           visibleTell:"The rules everyone lived by just stopped meaning anything.",
           payoff:"the +1 spice lean rides the vector into the walk/skin spice reroll" } },
  { name:"The Lovers", ordinal:6,
    up:  { omen:"A choice tonight is really about who you trust.", op:"markOmenTarget", params:{prefer:"npc"},
           dmNote:"one person carries the session's trust choice tonight — a script-picked NPC is the card's target; let the party's read of them decide the beat, never nudge the choice",
           visibleTell:"One face here matters more than the party yet knows.",
           payoff:"the marked NPC lands via any codex-family event on that record (via:'npc')" },
    rev: { omen:"A bond frays over something small and true.", op:"ambientPoolBonus", params:{n:-1},
           dmNote:"the social world tonight is a little thinner, a little colder — the ambient cast pool runs one leaner",
           visibleTell:"The room is emptier and quieter than it should be.",
           payoff:"the -1 ambient pool rides the vector into prepCastAmbient" } },
  { name:"The Chariot", ordinal:7,
    up:  { omen:"Momentum carries you further than planning did.", op:"openDoor", params:{},
           dmNote:"momentum outruns planning tonight — one blocked path, clue, or contact opens up ahead of where the party expected; no cost, theirs to take",
           visibleTell:"A way forward opens faster than anyone planned for.",
           payoff:"taking the opening lands via tarot_landed {via:'door'}; the path taken persists on the map" },
    rev: { omen:"The wheels are turning but going nowhere.", op:"closeDoor", params:{},
           dmNote:"wheels turning, going nowhere — one easy route closes tonight and a stranger way is pointed to instead; name the closed way, don't force the strange one",
           visibleTell:"Every road out seems to circle back on itself.",
           payoff:"the reroute lands via tarot_landed {via:'door'}; the closed way persists on the map" } },
  { name:"Strength", ordinal:8,
    up:  { omen:"Patience tonight succeeds where force would fail.", op:"stealthDcBump", params:{dc:-1},
           dmNote:"a gentler hand on the world tonight — stealth-adjacent checks ease by one; patience opens what force couldn't",
           visibleTell:"The wary thing here calms when it isn't pushed.",
           payoff:"the -1 DC bump rides the session vector into resolveCheck" },
    rev: { omen:"Restraint runs out sooner than expected tonight.", op:"archetypeWeight", params:{domain:"threat",mult:1.25},
           dmNote:"something's temper snaps tonight — a volatile, aggressive threat leans in; the threat domain weights up on rolled encounters",
           visibleTell:"Something patient here is running out of patience.",
           payoff:"the biased threat-domain encounter lands through the rolled walk/threat" } },
  { name:"The Hermit", ordinal:9,
    up:  { omen:"A lone light is worth following tonight.", op:"surfaceHiddenFact", params:{},
           dmNote:"the lone light names what it shines on — a script-picked codex record is hiding a real secret/fear/leverage; surface that hidden field through a solitary insight, named not invented",
           visibleTell:"A single light burns where no one should be keeping one.",
           payoff:"the surfaced fact lands via codex_reveal / fact_canonized on the picked record" },
    rev: { omen:"Isolation tonight is not the safety it seems.", op:"ambientPoolBonus", params:{n:-1},
           dmNote:"withdrawal costs company tonight — the ambient cast pool runs one leaner; isolation that only looks like safety",
           visibleTell:"The party is more alone here than is comfortable.",
           payoff:"the -1 ambient pool rides the vector into prepCastAmbient" } },
  { name:"Wheel of Fortune", ordinal:10,
    up:  { omen:"The wheel turns, and turns in your favor.", op:"stockBias", params:{mult:1.3},
           dmNote:"luck runs generous tonight — shop stock and valuables lean rich; the wheel comes up for the party",
           visibleTell:"The stalls are unusually well-stocked tonight.",
           payoff:"the 1.3 stock multiplier rides the vector into makeShop's stock roll" },
    rev: { omen:"The wheel turns, and turns against you.", op:"stockBias", params:{mult:0.6},
           dmNote:"luck runs thin tonight — shop stock and valuables lean scarce; the wheel comes up against the party",
           visibleTell:"Everything the party needs is out of stock tonight.",
           payoff:"the 0.6 stock multiplier rides the vector into makeShop's stock roll" } },
  { name:"Justice", ordinal:11,
    up:  { omen:"Accounts are about to be settled fairly.", op:"nominateOldestThread", params:{},
           dmNote:"the script nominates the OLDEST open thread tonight — walks/drift/recall bias toward it; it gets an honest hearing this session",
           visibleTell:"An old unfinished matter surfaces asking to be answered.",
           payoff:"the nominated thread lands via codex_update/codex_reveal/front_closed on that record (via:'thread')" },
    rev: { omen:"The scales tonight are thumbed by someone's hand.", op:"surfaceHiddenFact", params:{},
           dmNote:"the thumb on the scale can be found — a script-picked codex record hides a real secret/fear/leverage tonight; surface that corruption through a scene, named not invented",
           visibleTell:"A verdict here was bought, and it can be traced.",
           payoff:"the surfaced fact lands via codex_reveal / fact_canonized on the picked record" } },
  { name:"The Hanged Man", ordinal:12,
    up:  { omen:"A different angle changes everything tonight.", op:"revealSecretOnStrange", params:{},
           dmNote:"suspended perspective — the next Strange+ roll this session surfaces one hidden dm-field fact, script-picked; the inverted view is the mechanic",
           visibleTell:"Seen upside down, the whole scene reads differently.",
           payoff:"the revealed fact lands via codex_reveal on the surfaced record" },
    rev: { omen:"Nothing moves no matter how hard you pull.", op:"spiceNudge", params:{dir:-1},
           dmNote:"stuckness tonight — the spice curve tilts one step more grounded; nothing gives no matter the effort",
           visibleTell:"Everything the party pushes on refuses to budge.",
           payoff:"the -1 spice lean rides the vector into the walk/skin spice reroll" } },
  { name:"Death", ordinal:13,
    up:  { omen:"An ending has been patient long enough.", op:"nominateOldestThread", params:{},
           dmNote:"the script nominates the OLDEST open thread for closure tonight; walks/drift/recall bias toward it — it ends this session, one way or the other",
           visibleTell:"Something long-dying is finally ready to end.",
           payoff:"the closed thread lands via front_closed / codex_update on that record (via:'thread')" },
    rev: { omen:"Something refuses to die when it should.", op:"nominateOldestThread", params:{softenClose:true},
           dmNote:"the oldest thread is nominated but the ending stalls tonight — it lingers, worse for the wait; the close softens, the thread persists",
           visibleTell:"The thing that should have ended is still here, festering.",
           payoff:"the lingering thread lands via codex_update on that record (via:'thread')" } },
  { name:"Temperance", ordinal:14,
    up:  { omen:"Balance holds, and holding is its own reward.", op:"offerBargain", params:{price:"favor",grants:"passage"},
           dmNote:"the pouring angel is a brokered exchange — an NPC offers safe passage in return for a favor; offered, never forced; honor a refusal completely",
           visibleTell:"Someone here can get the party through, for a price.",
           payoff:"an accepted bargain lands DM-declared via tarot_landed {via:'bargain'}" },
    rev: { omen:"Something has been mixed that shouldn't combine.", op:"archetypeWeight", params:{domain:"magic",mult:1.2},
           dmNote:"an unstable combination tonight — a strange/volatile encounter leans in; the magic domain weights up on rolled encounters",
           visibleTell:"Two things that shouldn't touch are touching here.",
           payoff:"the biased magic-domain encounter lands through the rolled walk/threat" } },
  { name:"The Devil", ordinal:15,
    up:  { omen:"A bargain tonight is better than it looks.", op:"offerBargain", params:{price:"secret",grants:"item"},
           dmNote:"an NPC offers a genuinely valuable item priced in a secret — offered, never forced; honor a refusal completely; the hook is real but so is the value",
           visibleTell:"Someone is holding exactly what the party needs, and smiling.",
           payoff:"an accepted bargain lands via tarot_landed {via:'bargain'}; the secret paid enters the codex dm-tier" },
    rev: { omen:"Whatever chains you tonight was chosen, once.", op:"pressureFaction", params:{mode:"advance"},
           dmNote:"the chosen chain comes due tonight as a predatory power's clock — the hottest faction advances against the party; the script applies the number, the DM frames the power's move",
           visibleTell:"An old debt to a dangerous power is coming due.",
           payoff:"the advance lands detected on clock_advanced/clock_fired for that faction (via:'faction-clock')" } },
  { name:"The Tower", ordinal:16,
    up:  { omen:"Something long-standing has been leaning for years.", op:"advanceHottestClock", params:{},
           dmNote:"the script advances the FULLEST clock to firing this session; the session opens with the crack, not the fall",
           visibleTell:"A structure that has stood for years is visibly failing.",
           payoff:"the advance lands detected on clock_advanced/clock_fired for the fullest clock (via:'faction-clock')" },
    rev: { omen:"The crack runs through your own floor.", op:"advanceHottestClock", params:{ownedByPC:true},
           dmNote:"the breaking thing is the PC's — a bond, an asset, a standing; softer landing, longer debris (a thread mints from the wreckage); the script advances the fullest clock",
           visibleTell:"The thing about to break is something the party owns.",
           payoff:"the advance lands detected on clock_advanced/clock_fired (via:'faction-clock'); a thread mints from the wreckage" } },
  { name:"The Star", ordinal:17,
    up:  { omen:"Hope tonight is quiet, and it is real.", op:"ambientPoolBonus", params:{n:1},
           dmNote:"a gentle, hopeful world tonight — the ambient cast pool runs one richer; the hope here is quiet but genuine",
           visibleTell:"Something small and kind is waiting to be found here.",
           payoff:"the +1 ambient pool rides the vector into prepCastAmbient" },
    rev: { omen:"Even hope is running short tonight.", op:"stockBias", params:{mult:0.8},
           dmNote:"a starved world tonight — shop stock and valuables lean thin; even hope is rationed here",
           visibleTell:"There is less of everything here than there should be.",
           payoff:"the 0.8 stock multiplier rides the vector into makeShop's stock roll" } },
  { name:"The Moon", ordinal:18,
    up:  { omen:"Two roads tell two truths tonight.", op:"alterWalkTexture", params:{motif:"mirror"},
           dmNote:"every walk this session carries the mirror motif — doubles, reflections, a second of things; narrate the distortion as real and visible, never explain it",
           visibleTell:"Reflections are wrong tonight — puddles and blades show a second version.",
           payoff:"a mirrored walk walked = auto-landing (via:'walk-skin'); a distrusted reflection proven true resolves via codex_reveal" },
    rev: { omen:"The fog lifts on something worse than guessed.", op:"surfaceHiddenFact", params:{},
           dmNote:"the fog lifts on something worse than guessed — a script-picked codex record hides a real secret/fear/leverage tonight; surface that hidden field through a scene, named not invented",
           visibleTell:"The fog clears on a truth no one wanted uncovered.",
           payoff:"the surfaced fact lands via codex_reveal / fact_canonized on the picked record" } },
  { name:"The Sun", ordinal:19,
    up:  { omen:"Nothing stays hidden under a sky this clear.", op:"stealthDcBump", params:{dc:1},
           dmNote:"everything is seen tonight — stealth-adjacent checks tick up a notch; inventories, wounds, motives all read plainly under a clear sky",
           visibleTell:"Nothing casts a shadow deep enough to hide in.",
           payoff:"the +1 DC bump rides the session vector into resolveCheck" },
    rev: { omen:"No shade anywhere today.", op:"stealthDcBump", params:{dc:2},
           dmNote:"everything is seen — stealth-type checks +2 DC; every hidden thing shows, NPCs notice what the party carries openly, lies and wounds and motives all laid bare",
           visibleTell:"There is no shade anywhere — every secret is in plain sight.",
           payoff:"the +2 DC bump rides the session vector into resolveCheck" } },
  { name:"Judgement", ordinal:20,
    up:  { omen:"A reckoning arrives, and it is overdue.", op:"echoPast", params:{},
           dmNote:"the overdue reckoning summons the past itself — a script-picked saga/past-life element is woven into prep tonight; the past comes to answer for itself",
           visibleTell:"Something out of the party's past has come looking for them.",
           payoff:"the echo lands DM-declared via tarot_landed {via:'echo'} when the past element enters play" },
    rev: { omen:"The reckoning tonight judges the wrong party.", op:"markOmenTarget", params:{prefer:"npc"},
           dmNote:"the wrongly-blamed party carries the card tonight — a script-picked NPC is the target; let the misplaced blame play out through them, never steer the party's verdict",
           visibleTell:"Someone here is about to answer for what they didn't do.",
           payoff:"the marked NPC lands via any codex-family event on that record (via:'npc')" } },
  { name:"The World", ordinal:21,
    up:  { omen:"Something whole closes, and something opens.", op:"nominateOldestThread", params:{completion:true},
           dmNote:"a completion beat tonight — the script nominates the oldest thread to close cleanly; walks/drift/recall bias toward it; the session can end on arrival",
           visibleTell:"A long story here is finally reaching its last page.",
           payoff:"the completed thread lands via front_closed / codex_update on that record (via:'thread')" },
    rev: { omen:"Nothing quite finishes the way it should tonight.", op:"spotlightThread", params:{order:"salient"},
           dmNote:"nothing quite finishes — the most-alive thread refuses to close tonight; the script spotlights the salient open thread and biases narration toward it, unresolved",
           visibleTell:"The one thing everyone wants finished stays stubbornly open.",
           payoff:"the spotlighted thread lands via codex_update/codex_contact on that record (via:'thread')" } },
];

// ─── TAROT-2 §4.2 — rank grammar + reversal semantics. Computed metadata (never authored per-card):
// these ride the digest card so the DM reads rank + reversal consistently. Verbatim strings — do
// not paraphrase (verify check 10c pins the Ace grammar). ──
const TAROT_RANK_GRAMMAR = Object.freeze({
  Ace:"seed / first sign", Two:"choice / tension", Three:"collaboration / expansion",
  Four:"stability / enclosure", Five:"conflict / loss", Six:"passage / recovery",
  Seven:"test / temptation", Eight:"motion / pressure", Nine:"accumulation / strain",
  Ten:"culmination / burden", Page:"message / novice / curiosity",
  Knight:"pursuit / momentum / recklessness", Queen:"mastery through perception",
  King:"mastery through authority",
});
const TAROT_REVERSAL_SENSE = Object.freeze({
  up:"outward, available, visible, flowing",
  rev:"inward, blocked, corrupted, misdirected",
});

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
