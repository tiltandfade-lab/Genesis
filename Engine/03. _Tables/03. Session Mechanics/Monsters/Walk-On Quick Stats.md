---
id: walk-on-quick-stats
type: table
domain: Session Mechanics / Monsters
status: source
table_class: Fork
player_facing: plumbing
voice_critical: false
---

#walk-on-quick-stats
> **Instant numbers for an unnamed walk-on — so the DM never invents combat stats mid-scene.** When a nameless figure turns hostile and the engine has no sheet for them — a town guard who decides you're trouble, a merchant who pulls a knife, a back-alley thug, a panicked farmhand with a pitchfork — the DM grabs a CR row here instead of guessing an AC and a damage die. This is a **reference, not a roll table** (the first column is the CR label, non-numeric, so the compiler serves it to the DM and never rolls it). The full combat engine is parked for a later build (`COMBAT.md`); until then run combat loose and theater-of-mind (`DM-CHARTER §6.5`) and reach for these when a number is needed *now*.
>
> **The reskin method (the actual anti-drift move).** Don't build a creature — **take a benchmark and reflavor it.** A "guard" *is* a CR 1/8 body with a tabard and a spear; a "cutthroat" is the *same* CR 1/8 body with a dagger and a worse attitude; a "merchant who turns" is that body with a cudgel and shaking hands. Pick the CR row that matches how dangerous this walk-on should feel, keep the numbers, and change only the **name, the weapon, and the flavor of the damage type** (slashing/piercing/bludgeoning — all read the same at the table). The numbers stay honest across the whole campaign because they came from one fixed ladder, not the DM's mood. For anything with a real role in the story, stop reskinning and pull a proper sheet from `Asset Library/Monsters & Enemies/` (the `Guard`, `Bandit`, `Commoner`, `Tough`, `Spy` lineage) — these quick stats are for the body that exists for one scene and then is gone.
>
> **Scope: Tier 1–2 only (`TIER-SCOPE`).** The ladder stops at CR 3 — past that a walk-on isn't a walk-on, it's an antagonist, and it deserves a named sheet. Numbers below are Genesis-authored, rounded for fast use; they track the standard low-CR power curve without reproducing any published by-CR statistics table.
>
> **How to read a row.** *AC* = the number to beat. *HP* = a flat pool (no need to roll it; halve it if you want a glass walk-on, double it for a tough one). *Atk* = the bonus added to the attacker's d20. *Dmg/round* = the damage one hit lands (a single attack at the low end; a multiattack body at CR 1+ already folds two swings into the figure). *Save DC* = the DC the **player** rolls against when this walk-on does something that forces a save (a net, a shove, thrown sand, a thug's grapple). *PB* = proficiency bonus, if you need to derive a skill or a missing save.

**The DC ladder (shared consistency spine — see `Tool Proficiency Uses` and the DMG anti-drift "DC ladder" scaffold):**
Very Easy **5** · Easy **10** · Medium **15** · Hard **20** · Very Hard **25** · Nearly Impossible **30**. A walk-on's Save DC above is *its* effects against the player; the ladder above is for *the player's* actions against the world.

| CR | Feels like | AC | HP | Atk | Dmg/round | Save DC | PB | Reskin as |
|---|---|---|---|---|---|---|---|---|
| CR 0 | A bystander, not a fighter | 10 | 4 | +2 | 1–2 | 10 | +2 | Cornered farmhand · drunk · starving stray · pickpocket who got caught |
| CR 1/8 | A trained body, one weapon | 13 | 11 | +3 | 4 (one hit) | 11 | +2 | Town guard · road bandit · dock tough · debt-collector's muscle |
| CR 1/4 | A real threat one-on-one | 14 | 18 | +3 | 6 (one solid hit) | 12 | +2 | Veteran sentry · knife-fighter · poacher · cult footsoldier |
| CR 1/2 | Dangerous; makes you commit | 14 | 30 | +4 | 9 (two light swings) | 12 | +2 | Mercenary · enforcer · duelist · armored watch-sergeant |
| CR 1 | Two hits a round, hits hard | 15 | 38 | +4 | 12 (multiattack) | 13 | +2 | Brute · ogre-blooded bruiser · seasoned soldier · gang lieutenant |
| CR 2 | Outmatches a green PC alone | 15 | 52 | +5 | 16 (multiattack) | 13 | +3 | Bandit captain · champion brawler · ranking officer · hired killer |
| CR 3 | Edge of "this needs a sheet" | 16 | 65 | +5 | 21 (multiattack) | 14 | +3 | Knight-errant · veteran captain · monster-hunter · warlord's right hand |
^walk-on-quick-stats
