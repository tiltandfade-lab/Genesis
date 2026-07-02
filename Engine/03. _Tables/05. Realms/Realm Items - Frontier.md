---
id: realm-items-frontier
type: table
domain: Session Mechanics / Realms
status: source
table_class: Commitment
player_facing: reveal
voice_critical: true
---

#realm-items-frontier
> **PROVISIONAL — Adam spot-check pending.** The FRONTIER realm's item universe (docs/BREACH.md
> §2d "DEEP realm kits", BATCH3-GUARDRAILS.md J2 "realm-kits → REALM TABLES" restructure): a d50
> table, not a flat kit — breach draws inside a `frontier`-tagged walk roll THIS table; the
> legacy Outlandish d300 keeps its own separate role for anachronism-intrusions only (division
> of labor per J2). Register per J3b: Western — dust, debt, and a line nobody enforces till
> somebody does. Every item names its FRAME, an existing id in `data/items.js` (mundane
> ITEMS_BY_NAME or a MAGIC_ITEMS_BY_NAME slot-shape for wondrous types) — frameless would be a
> spec bug, so none are invented here. ~25 of the 50 rows are the frame-mapped item universe (12
> mundane + 8 enchanted + 4 signature wonders + realm consumables, THE RESKIN BOUNDARY: mechanics
> stay D&D, presentation is Western); the remaining rows are Grounded/Textured setting-texture
> items graded to `[[SPICE-RULER]]` (a realm's Mythic = its reality-breakers — filed to floor,
> not inflated). **Band shares run hotter than the H2 66/20/9/4/1 baseline by construction** — an
> item table is ~half enchanted/signature by the brief's own recipe (12 mundane + 8 enchanted + 4
> signature + consumables), and a functioning magic item is legitimately Strange-band under the
> ruler (a checkable, contained impossibility) far more often than a generic encounter row is;
> the mundane dressing rows still anchor Grounded/Textured, and Volatile/Mythic stay RARE and
> earned (this table: 2 Volatile, 1 Mythic, both graded against the ruler's calibration rows, not
> the ratio). Flagged for Adam's spot-check as a deliberate departure from H2's ratio, not a miss.
> **"Peacemaker,
> Blued" and "Trail-Iron Shoes" are the J3b-anchored ladders, landed verbatim among the signature
> wonders.** Rank ladders (2–4 rungs, attunement-level prereqs, active rank = highest rung
> reached, 3-slot cap governs) sit on the enchanted + signature rows; reality-breaking rungs
> floor at L9. Realm consumables (ammunition variants) are rust-EXEMPT because they ride the
> existing enchantment-immunity check (`rustImmune`, `src/world/durability.js`) — no engine
> change needed, just authored as enchanted-mechanic items. d50, Commitment ceiling.

| d50 | Band | Item | Frame | Ranks | Note |
|---|---|---|---|---|---|
| 1 | Grounded | A trail cook's battered coffee pot, dented from a hundred campfires. | lantern, hooded | | Boils water fast if you know how to bank a fire; no one will say whose it was first. |
| 2 | Grounded | A deck of dog-eared playing cards, one corner chewed by a mule. | robe | | Standard 52. A missing jack of clubs is a running argument at every table it joins. |
| 3 | Grounded | A hand-tooled leather gun belt, oiled soft from years of wear. | leather armor | | Fits any sidearm on the frontier standard; the tooling names its first owner in faded script. |
| 4 | Grounded | A tin star, unofficial — cut from a can, pinned crooked. | robe | | Confers no authority. Everyone treats you like it does anyway, for about a day. |
| 5 | Grounded | A bedroll rated for hard ground and colder nights than the label admits. | robe | | Advantage on the next Con save against exposure, once per long rest. |
| 6 | Grounded | A trail map, hand-drawn, three towns behind on its own information. | robe | | The rivers are right. The roads have moved twice since. |
| 7 | Grounded | A worn deck of wanted posters, faces gone soft with handling. | robe | | One bounty is real. The others expired years ago and nobody updated the stack. |
| 8 | Grounded | A tobacco tin, dented, half full, smells like better days. | robe | | Trade good in three towns out of five. |
| 9 | Grounded | A canteen that never quite loses the taste of the last thing it carried. | robe | | Currently tastes like creek water. Was whiskey, once, and everyone can tell. |
| 10 | Grounded | A saddle-worn Bible, spine cracked to Psalms. | robe | | Pressed flower at the bookmark. Nobody in the party will ask whose. |
| 11 | Grounded | A spare set of horseshoes, cold-forged, a little uneven. | robe | | A competent smith reshoes a mount in an hour with these on hand. |
| 12 | Grounded | A tally-stick ledger, notches for debts nobody's forgiven yet. | robe | | Legally worthless. Socially loaded — someone here knows whose marks these are. |
| 13 | Textured | A marshal's badge pulled off a body nobody's claimed. | robe | | Wearing it in the wrong town gets you served papers, drinks, or both, depending who's watching. |
| 14 | Textured | A deed to a claim that's either played out or hasn't been found yet — the seller wasn't specific. | robe | | Worth exactly what the next assay says. The paper itself is notarized and real. |
| 15 | Textured | A stagecoach line's manifest, three runs back, one strongbox unaccounted for. | robe | | Somebody's still looking for that box. So, evidently, is somebody else. |
| 16 | Textured | A hangman's rope, coiled, sold cheap by a man who swore it was "lucky." | robe | | It has hanged four men. All four, witnesses insist, deserved a fifth chance. |
| 17 | Textured | A telegraph key, disassembled, taken off a line the railroad hasn't finished laying. | robe | | Whoever's sending on the other end already knows the line isn't built. |
| 18 | Textured | A gambler's marked deck, the marks subtle enough to survive one honest inspection. | robe | | A second inspection, closer, finds them. The first inspector is dead. |
| 19 | Textured | A rustler's running iron, filed to change any brand into any other. | handaxe | | Illegal in every county with a courthouse. Priceless in the ones without. |
| 20 | Textured | A land-grant survey stake, pulled up, that two ranches both swear marks their line. | robe | | Whichever family holds it when the circuit judge arrives keeps the water rights. |
| 21 | Strange | A compass that points, without fail, toward the nearest unmarked grave. | robe | | R1(L1) points at the nearest grave within a mile · R2(L5) the needle also gives a rough count of the dead. |
| 22 | Strange | A deck of cards where the same three faces keep turning up no matter how well you shuffle. | robe | | The dealer swears he's never seen these three men. Two witnesses in town swear they buried them. |
| 23 | Strange | A saloon-door hinge, salvaged, that swings open on its own exactly at sundown. | robe | | Nothing comes through. It swings, waits a beat, and shuts. The bartender who sold it wouldn't say why he stopped locking up at dusk. |
| 24 | Strange | A branding iron that leaves a mark shaped like a symbol no rancher in three counties claims. | handaxe | | The cattle it's used on never stray, never sicken, and never quite look you in the eye again. |
| 25 | Volatile | A stick of dynamite that's already lit — somewhere close, right now, on a fuse nobody can find. | robe | | The whole street can hear the hiss. Nobody agrees on which building it's coming from. |
| 26 | Volatile | A runaway team's reins, still warm, torn loose mid-stampede. | robe | | Grab them and you're in the stampede's path in one round, whether you meant to be or not. |
| 27 | Mythic | The last bullet ever fired in the war that named this territory, still warm, still waiting for the second shot everyone agreed would end it. | pistol | R1(L9) the bullet finds any oath-breaker within sight · R2(L12) fired once, it ends a feud permanently — both sides, no survivors to reignite it, and the whole territory's maps redraw around the peace | The old-timers say firing it is how the border finally got settled the first time. Nobody's fired it since. |
| 28 | Grounded | A pair of leather chaps, scarred from a decade of mesquite and barbed wire. | leather armor | | Fine protection against thorns. Does nothing against teeth. |
| 29 | Grounded | A prospector's pan, dented, gold-flecked from wishful thinking more than luck. | robe | | Panning with it takes an hour per DC 12 Survival check for a chance at dust worth 1d6 sp. |
| 30 | Grounded | A hitching post's iron ring, pried loose, still bearing rope-groove scars. | robe | | Decent improvised bludgeon. Everyone recognizes it as stolen town property. |
| 31 | Grounded | A duster coat, sand-colored, weatherproofed with a recipe the tailor won't share. | robe | | Advantage on the next Con save against a dust storm, once per long rest. |
| 32 | Grounded | A tin of hardtack biscuits that could double as masonry. | robe | | Food for 6 days. A DC 10 Con save or lose an hour to indigestion the first time you eat one. |
| 33 | Grounded | A cattle-drive foreman's tally whip, more noise than sting. | handaxe | | 1d4 bludgeoning. Deals real damage to morale before it deals any to hide. |
| 34 | Textured | A land agent's brochure for a town that, on arrival, turns out to be four buildings and a well. | robe | | The brochure's illustration is suspiciously detailed for a town that small. |
| 35 | Textured | A retired gunslinger's holster, empty, oiled weekly by hands that no longer draw. | leather armor | | He'll sell it for a story, not coin. He wants to know it's going somewhere that still needs it. |
| 36 | Textured | A wanted poster with your own face on it, badly drawn, dated three weeks from now. | robe | | The bounty's already posted. Nobody in town has seen you do whatever it says you will. |
| 37 | Textured | **Enchanted** — "Six-Gun of the Fair Draw" — a revolver that seems to know it's being watched. | pistol | R1(L1) advantage on the first attack roll of any combat where you draw first · R2(L5) that attack, on a hit, always counts as a critical threat · R3(L9) you cannot be surprised while the holster is unbuckled | The wood grip is worn to the exact shape of a hand that isn't quite yours yet. |
| 38 | Textured | **Enchanted** — "The Widowmaker's Vest" — a leather vest, bullet-scarred, that's stopped more rounds than it should have. | leather armor | R1(L1) resistance to piercing damage from firearms once per long rest · R2(L6) the resistance no longer needs a rest to recharge | Every scar in the leather is a story the vest won't tell you, only show you. |
| 39 | Textured | **Enchanted** — "Boothill Boots" — spurs fused to the leather, jingling even when you're standing still. | leather armor | R1(L1) +10 ft speed while mounted · R2(L4) your mount gains advantage on saves vs. fear · R3(L8) you always know the fastest route out of any town | The jingle is audible for a full round before you round any corner. |
| 40 | Textured | **Enchanted** — "The Marshal's Coat" — a long duster with a star sewn faintly into the lining. | robe | R1(L1) advantage on Intimidation checks against those who've broken a law you've witnessed · R2(L6) once per day, deputize a willing NPC for one scene, granting them advantage on their next attack | Wearing it, you start noticing every unlatched holster in the room. |
| 41 | Textured | **Enchanted** — "Dead Man's Hand" — a poker hand, framed, that never leaves your coat pocket. | robe | R1(L1) once per long rest, reroll one failed save · R2(L7) the reroll may also be given to an ally within 30 ft | Aces and eights, black suits. The frame is bulletproof glass, for reasons the previous owner learned once. |
| 42 | Strange | **Enchanted** — "The Vigilante's Rope" — hemp gone stiff with age and old use. | leather armor | R1(L1) as a grapple restraint, the target cannot benefit from magical teleportation while bound · R2(L5) the rope tightens on its own if the bound target lies | It's been re-tied so many times the knots have their own names in three languages. |
| 43 | Strange | **Enchanted** — "Sundown Spectacles" — smoked glass in a tin frame, bent to fit a face that wasn't yours. | goggles of night | R1(L1) no disadvantage from bright desert glare · R2(L4) darkvision 60 ft | Through the lenses, high noon looks like dusk, and dusk looks like something worth worrying about. |
| 44 | Strange | **Enchanted** — "The Claim-Jumper's Pick" — a mining pick that hums faintly near anything worth digging up. | handaxe | R1(L1) advantage on checks to locate buried valuables within 30 ft · R2(L5) the hum's intensity roughly ranks the find's worth | It's never once hummed for a grave, which the last three owners found more unsettling than reassuring. |
| 45 | Strange | **Signature** — "Peacemaker, Blued" (frame: hand crossbow) — a revolver blued to near-black, balanced like it was made for one hand in particular. | hand crossbow | R1(L1) no reload · R2(L5) fan the hammer: two attacks, 1/short rest · R3(L9) the noon-draw: advantage on initiative, and everyone present knows it somehow | Canonical J3b anchor. Nobody remembers who blued it, only that the finish never wears. |
| 46 | Strange | **Signature** — "Trail-Iron Shoes" (wondrous) — horseshoes cast from rail-iron, warm to the touch even in snow. | boots of striding and springing | R1 your mount never tires on a road · R2(L4) +10 ft mount speed · R3(L8) the mount follows any NAMED road unguided | Canonical J3b anchor. Once shod, a mount stops flinching at gunfire — it's heard the noon-draw before. |
| 47 | Strange | **Signature** — "The Last Honest Badge" — tin, hand-cut, worn soft at the edges by a lawman three towns swear died a decade apart in each of them. | robe | R1(L1) advantage on Insight checks to detect a lie told for profit · R2(L6) once per day, a lie told to you aloud simply fails to land — the speaker stammers and the truth slips out instead · R3(L9) while worn, no one within earshot can draw a weapon against an unarmed party member first | The badge has no department. It has never needed one. |
| 48 | Strange | **Signature** — "The Debt Collector" — a coiled bullwhip, black leather, that never quite finishes uncoiling. | handaxe | R1(L1) 1d8 slashing, reach 15 ft · R2(L5) on a hit, the target owes you one favor it doesn't understand yet, tracked like a debt · R3(L9) you may call in any outstanding favor as a free action, once per long rest | Every claim ends the same way with this whip: paid in full, one way or the other. |
| 49 | Grounded | **Consumable** — A box of "Long-Nine" cartridges, hand-loaded, smelling faintly of sulfur and something sweeter. | pistol | | 6 shots. Rust-exempt (charge-mechanic ammunition — the enchantment IS the immunity). Standard ammunition outside frontier without a gunsmith's resupply. |
| 50 | Grounded | **Consumable** — A tin of "Snake-Oil" salve, three fingers left, label mostly worn away. | robe | | One use: heals 1d4+1 HP OR cures one level of exhaustion, DM's discretion which the label was actually telling the truth about this time. |
^realm-items-frontier
