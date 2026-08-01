---
type: founder-questionnaire
project: Genesis
status: OPEN — answer before contained-launch implementation
created: 2026-07-31
owner: Adam
answers_feed:
  - docs/LAUNCH-SCOPE.md
  - docs/FICTION-ORACLE.md
  - docs/ARCHIVE-LEDGER.md
---

# CONTAINED LAUNCH — founder questionnaire and legality audit

This is the decision pass that must happen before `LAUNCH-SCOPE.md` becomes a build spec.
It is deliberately deeper than a keep/kill pass. The contained launch should feel like a
perfectly legal town-and-dungeon situation inside full Genesis, while making it mechanically
impossible for launch play to roll a promise the contained game cannot honor.

## How to answer

Use these answers unless a question asks for prose:

- **KEEP** — legal and good without reinterpretation.
- **KEEP + BIAS** — all rows remain legal, but weights or premise projection should change.
- **ROW-GATE** — some rows are illegal; identify them by stable row key, never row number alone.
- **RESKIN** — the underlying function is legal; its surface noun must be projected through the
  rolled premise or fantasy realm.
- **REWRITE** — the table's job is needed, but its present rows do not serve the container.
- **DORMANT** — preserved and tested in the full build, unreachable in launch.
- **KILL CONTRACT** — the game must not promise this kind of result at launch.
- **SPIKE** — evidence or a felt test is required before ruling.

For every `ROW-GATE`, also answer: **what capability makes the row legal again?** This turns the
archive ledger into an expansion map rather than a graveyard.

## 0. The scenario's hard boundary

### Founder answers — 2026-08-01

These answers substantially change the program's classification. This is provisionally a **new
game derived from Genesis**, not merely a launch compile profile. Preserve Genesis intact; decide
the repository/product boundary before implementation.

1. **Hard physical container.** The PC is confined to one town and the infinite dungeon. Food and
   other imports need an in-fiction supply law, potentially rolled per world.
2. **The outside exists but is unreachable.** Other places may be mentioned, always from the
   perspective that the same power enforcing town peace also enforces the town boundary.
3. **One entrance at first.** Its placement/form may be rolled, but there is exactly one functional
   dungeon entrance. Diablo's church entrance is the current structural model.
4. **One playable town.** Other towns may exist fictionally. The game needs a new, limited TIYL
   explaining the PC's mysterious arrival in this fixed scenario. Non-monster dungeon dwellers may
   create intermittent social and trade play below.
5. **One friendly dungeon zone at first.** Camps, markets, shrines, prisons, farms, inns, and other
   friendly-zone types are possible expansion content, but only one type ships initially.
6. **Overlord enforcement.** When a town argument reaches the equivalent of “roll initiative,” the
   overlords teleport the participants to a random dungeon room, where inhabitants and escape
   difficulty create the punishment. Abuse cases are acknowledged. Alternative rolled town-combat
   laws—arena, voluntary combat culture, and others—remain candidates, not initial law.
7. **No town combat.** Combat occurs only in the dungeon or an explicitly dedicated combat zone.
8. **Violence has harsh immediate consequences.** Evading surveillance may allow hidden violence;
   this is a possible play system, not permission for ordinary town combat.
9. **Monsters cannot enter town.** The overlords obliterate them.
10. **Town state may transform through conflict**, despite the absence of town tactical combat.
11. **Nobody may leave town.** The boundary applies to all residents, not only the PC.
12. **The dungeon is mechanically infinite.** Reaching/solving the bottom is initially legend;
    detailed victory implementation may come later.
13. **Campaign victory:** defeat the overlords and liberate the town.
14. **“Infinite” is both fiction and generator guarantee.**
15. **Experience targets:**
    - 30 minutes: premise/lore, town orientation, basic equipment purchase, first descent.
    - 3 hours: several dungeon rooms, several elite enemies, potentially one or two bosses.
    - 30 hours: deep descent, many bosses, excellent gear, likely several deaths and successor PCs.

### Derived constraints requiring later confirmation

- A town initiative trigger must be detected before tactical combat begins and must have a complete,
  deterministic teleport contract: participants, destination safety, separation, escape, return,
  witnesses, consequences, and adversarial abuse.
- “Random room” cannot mean an arbitrary unconstrained room if instant unavoidable death is possible;
  its danger distribution and escape floor need a founder ruling.
- Hidden violence requires a surveillance/evidence system or must be explicitly deferred. It cannot
  be left solely to DM improvisation while “no town combat” is a hard rule.
- The boundary and monster-obliteration rules need a source of authority, observable tells, edge
  cases, and victory-facing weaknesses. These overlord mechanics are the campaign spine.
- Food/imports need a closed supply model that cannot accidentally provide an exit route. Candidate
  shapes include overlord delivery, one-way apertures, conjured supply, dungeon agriculture, tribute,
  or shipments whose carriers cannot cross the boundary.
- Town transformation must be expressed through social, economic, faction, structural, and premise
  state rather than town battle maps.

1. Is the player physically confined to the town and dungeon, or may prose establish nearby farms,
   roads, ruins, kingdoms, seas, wilderness, and distant settlements that cannot yet be visited?
2. If the wider world may be mentioned, which verbs are forbidden: visit, travel, flee, escort,
   pursue, trade with, send to, receive from, conquer, govern, or return home?
3. Is the town literally built over the dungeon entrance, or can the entrance be adjacent, beneath
   a civic building, reached by a short safe road, or reached through multiple town entrances?
4. Is there exactly one town per world, one mechanically active town with other fictional towns, or
   a home town plus dungeon settlements?
5. Can the dungeon contain friendly settlements, markets, camps, shrines, prisons, farms, or inns?
6. Does “battles resolve downstairs” mean every intended combatant voluntarily relocates, a law or
   force transports them, town conflict is adjudicated nonlethally, or the dungeon encounter later
   represents the town conflict's resolution?
7. Can violence begin in town even if tactical combat cannot? What exact player actions are legal?
8. Can NPCs injure, imprison, rob, curse, or kill in town without entering tactical combat?
9. Can monsters enter town? If yes, what does the resolution law do with them?
10. Can town structures burn, collapse, become occupied, or otherwise transform through conflict?
11. Can the PC permanently leave town? If “The Door” truth ends the container, is that an ending,
    retirement, credits-and-continue, or the future expansion handoff?
12. Does the dungeon have a discoverable bottom in launch, or must every apparent bottom open more
    depth? Can a campaign be won without exhausting the dungeon?
13. What is the launch campaign's finish condition: truth revealed, peace law broken, town saved,
    personal objective completed, deepest authored band cleared, death, or no formal ending?
14. Is “never-ending” an in-fiction belief, a generator guarantee, or both?
15. Which launch promises must be true in a 30-minute first play, a 3-hour run, and a 30-hour world?

## 1. Preserve the engine or author a scenario

### Founder answers received — 2026-08-01

16. Town visuals are out of initial scope: dialog/menu-driven town, perhaps with placeholders. The
    world still rolls enough visual identity to establish a felt setting.
17. World mint should roll at least the premise axes, town identity, factions, cast, sites, opening,
    dungeon history/families/threats, and truth progression, but through a much smaller replacement
    TIYL appropriate to mysterious arrival in the fixed container.
18. Recurring signature NPCs/sites across worlds are allowed.
19. All three authored-anchor forms are allowed: identical recurring entities, archetypal roles with
    rolled identity, and optional exemplars.
20. The same seed must reproduce the complete premise and founding town.
21. Authorship priority: authored scenario beats → curated table rows → fixed anchors → weights → DM
    synthesis voice.
22. **Clarification needed:** “second world” means the player starts a second fresh save/seed after
    already experiencing one world. The question asks how much recognizable authored material should
    recur versus recombine differently.
23. Which Genesis laws this game proves versus merely borrows requires a separate design conversation.
24. Required identity: death/rebirth; fascinating town social play with rising tension/pressure; cool
    dungeon vignettes.
25. Failure identity: scripted NPC responses; fixed dungeon design; an easy loot fiesta.

16. Which things are fixed across every launch world: town layout, named cast, faction count,
    dungeon entrance, tutorial beat, first floor, first boss, economy, or only the container frame?
17. Which things must be rolled per world: all five premise axes, town name, factions, cast, sites,
    opening situation, dungeon history, room families, threats, and truth progression?
18. May Adam hand-author recurring signature NPCs or sites that appear in every world?
19. If yes, are they identical people, archetypal roles with rolled names, or optional exemplars?
20. Should the same seed reproduce the complete world premise and founding town?
21. Is authorship primarily exercised through curated table rows, weights, fixed anchors, authored
    scenario beats, or the DM's synthesis voice? Rank these.
22. What percentage of launch content should be recognizably handcrafted on a second world?
23. Which full-Genesis laws are being proven by this build, and which are merely being preserved?
24. Name three experiences that would make the launch feel like “small Genesis.”
25. Name three experiences that would make it feel like an unrelated dungeon crawler.

## 2. The legality model (must be ruled before tagging)

The current proposed single tag (`wide`, `realm:*`, or `rung:*`) cannot represent independent
facts. A fantasy town row can also require wilderness travel; a dungeon row can also require a
party; a core social hook can promise another settlement. Rule the model before touching rows.

26. Approve a multi-axis eligibility record instead of “at most one scope tag”?

**Plain-language restatement:** a single parking label cannot answer all the questions a roller must
ask. An entry might be fantasy-appropriate but still illegal because it needs wilderness travel or
four party members. The proposed record simply lists every prerequisite separately. Founder has not
yet ruled the implementation shape and is open to a stronger parking/re-authoring system.

```text
requires: [town, dungeon, travel, overworld, party, sidekick, spellcasting, faction, ...]
allowsRealm: [fantasy, ...]       # absent = universal
minTier / maxTier: ...            # absent = ordinary tier law
launch: keep | gate | dormant     # explicit founder disposition
reentry: <manifest capability>    # required when dormant/gated
```

27. Should eligibility attach at table, row, sub-result/column, or all three?

**Plain-language restatement:** sometimes an entire table is out, sometimes only five rows are out,
and sometimes a single column—such as “destination”—creates the illegal promise. The question is
whether the tool must support all three levels. This may be superseded by new-game reauthoring.
28. Must every launch-reachable row be explicitly adjudicated, or is untagged implicitly legal?

**Plain-language restatement:** should silence mean “allowed,” or should every surviving result need
an affirmative keep decision? The founder's later direction—cut far more than keep—strongly suggests
an allowlist where silence means unavailable, pending explicit confirmation.
29. Should unknown eligibility tokens fail compilation? (Recommended: yes.)
30. Should a launch row be legal only when `requires ⊆ activeCapabilities`?

**Plain-language restatement:** only deal a result when the game currently has every system needed to
honor it. Example: an escort result requiring a follower and wilderness travel is unavailable until
both followers and wilderness travel exist.
31. Should exclusions live solely in source markdown, or may curated allowlists exist for monsters,
    spells, items, and fixed code arrays?
32. Do rows need stable authored keys so gates survive row insertion/reordering?
33. When a d100 table loses rows, should the launch compiler renormalize surviving weights, preserve
    original probability mass as rerolls, or require an authored launch weight column?
34. Are rerolls ever acceptable at runtime, or must every dealt face be legal on the first draw?
35. Does legality mean “can be narrated coherently,” “can be mechanically completed,” or both?
36. Who may RESKIN an illegal noun into a legal one: compiler, deterministic projection, or DM?
37. What information must provenance retain after reskinning so the original roll remains visible?

**Plain-language restatement:** if a generic roll says “caravan master” and the contained game turns
that into “keeper of the one-way provision gate,” should the save remember both the original result
and its new presentation? This matters for debugging, honoring the dice, and deterministic replay.
38. When individually legal rows compose into an impossible bundle, should the engine repair,
    reroll one component, reject the entire bundle, or send it to DM synthesis with constraints?
39. Must the launch verifier test individual draws, composed bundles, and simulated campaigns?

**Plain-language restatement:** a table can be legal row-by-row but become illegal in combination.
Example: a legal NPC want plus a legal quest type plus a legal destination might combine into “escort
someone out of town.” The proposed gate tests single results, assembled hooks/scenes, and repeated
full loops. Founder has not yet ruled the required depth.

### Founder direction received — 2026-08-01

- Unknown eligibility vocabulary must fail loudly.
- Curated allowlists will likely be needed across nearly every content family.
- The game is cutting far more than it keeps; archive-and-reauthor may be more honest than tagging
  the existing corpus.
- Filtered dice tables should generally be shrunk and reauthored, not silently renormalized.
- Every dealt result must already be legal; no routine runtime rerolls to hide illegal content.
- Legality means both fictionally coherent and mechanically fulfillable.
- Social mode may use DM reskinning; battle mode requires deterministic/compiler projection.
- Impossible composed social bundles may go to the DM for reconciliation.
- Leakage reports must identify the source, stable entry, call path, and missing capability.
40. Should a leakage failure report source file + stable row key + call path + missing capability?

## 3. What “town” means to the existing generators

41. Is the existing urban walk dormant, or does it become the town's noncombat scene grammar?
42. If urban walks remain, must Enemy/Hazard results become social/consequence scenes, or are those
    branches illegal in town?
43. Do the 16 urban topologies remain useful for investigations, faction stories, festivals, and
    social pressure inside one town?
44. Can an urban walk ever end in the dungeon, or must the engaged hook mint a dungeon walk?
45. Are districts mechanically distinct nodes, prose-only neighborhoods, or not present at launch?
46. How many founding town sites should exist before lazy generation begins?
47. Which site roles are mandatory: gathering place, lodging, market, authority, shrine, healer,
    craft/workplace, dungeon gate, graveyard, home, guild, prison?
48. Which site roles are forbidden because they imply unsupported play?
49. Can new buildings be minted indefinitely within the same town?
50. Can the town grow, shrink, change government, or be rebuilt over a campaign?
51. Does every town scene need a lever now? Define a machine-testable lever: want, resource,
    relationship, clock, choice, price, secret, or dungeon-facing hook.
52. Can a town scene exist only for texture/rest, or must every visit change state?
53. Are settled-life systems (home, work, relationships, downtime) core to launch or future rungs?
54. Is the PC a resident, newcomer, condemned person, pilgrim, employee, or may premise/start dice
    select among these?
55. Can TIYL produce a birthplace or history outside the town if that place is never visitable?
56. If yes, may past NPCs arrive in town, or are off-map relationships dormant until expansion?

## 4. World founding and starting-state tables

Adjudicate: Master Setting, Region Identity, Starting State Entry/Factions/Pressures/World Depth,
Opening Register and hot situations, Place Nearby, Place History, Place Mythology, Place Relevancy,
Place Race Relations, Place Ruler Status, Place Traits, Place Secret, World Name Patterns, and the
Tarot world triggers.

57. Does `Master Setting` become fixed “town above dungeon,” dormant, or remain as a subordinate
    town/dungeon skin roll?
58. Is `Region Identity` meaningful without an explorable region? If kept, what mechanics consume it?
59. Does the world still mint an internal and external pressure? What can “external” legally do when
    the overworld is inert?
60. Does the existing Impending Doom/crowning structure survive, point downward, or go dormant?
61. How many factions should found a launch world: 1, 2, 3–4 as today, or premise-dependent?
62. Must every faction have a town institution, dungeon interest, or both?
63. Can a faction's headquarters or agenda be outside town?
64. May faction names imply empires, navies, intercity leagues, nomads, or distant churches?
65. Are “dominant power” and “ruler status” allowed to disagree? If so, what useful tension results?
66. Which PEACE LAW entry owns town authority, and how does it constrain faction/ruler rolls?
67. Can pressures threaten the wider world, or only town/dungeon state?
68. May grim portents occur off-screen outside the container?
69. Which opening-register bands remain legal? Several hot rows presently imply road, wilderness,
    river, cliff, caravan, or mid-journey situations.
70. Should hot openings be reauthored inside town/dungeon, allowed as a one-scene prologue, or gated?
71. Does the founding gazetteer contain only town sites and the dungeon entrance?
72. Is `Place Nearby` dormant, reinterpreted as nearby-within-town/within-dungeon, or row-gated?
73. Can place history reference former kingdoms, wars, migrations, or civilizations beyond town?
74. Can mythology and rumor describe unreachable geography?
75. Do race-relations rows remain appropriate with the launch ancestry roster and one town?
76. Is the public premise shown before character creation, after creation, or discovered in play?

## 5. Fiction oracle coherence and authority

77. Is each axis rolled uniformly at d4, or should entries have authored weights?
78. Can players reroll, choose, lock one axis, or enter a seed?
79. Is PEACE LAW a physical law, magical enforcement, civic custom, divine covenant, or allowed to
    vary by entry? The engine needs to know what kinds of violations it can resolve.
80. Does each PEACE LAW entry need an explicit authority projection because AUTHORITY was folded in?
81. What happens mechanically on attempted town violence for P1, P2, P3, and P4?
82. Is banishment-to-depth always possible, merely one consequence row, or premise-weighted?
83. Can innocent victims be sent down? Can authorities exploit the law?
84. Must every WOUND skin remain compatible with infinite generated floors?
85. Does WOUND constrain dungeon architecture, inhabitants, loot, lore, bosses, and environmental
    transformations, or merely color them?
86. Can incompatible dungeon-origin rows roll beneath a WOUND (e.g. natural cave under Buried City)?
87. If yes, is that layering, contradiction, or evidence about TRUTH?
88. Does LICENSE set the primary economy, or bias a general economy that may contain other motives?
89. Must every launch quest ultimately relate to LICENSE, BELIEF, a personal NPC want, or may it be
    wholly incidental?
90. Does BELIEF have institutional believers, skeptics, and profiteers generated automatically?
91. How quickly may TRUTH evidence surface? Define depth/session bands.
92. Can TRUTH “As believed” copy any belief without additional interpretation rules?
93. Who authored “The Plant,” and must the answer be generated at world mint?
94. Does “The Protection” require a concrete protected-against entity at mint?
95. Is “The Door” a launch ending that deliberately promises unbuilt realms? What exact UI/state
    behavior occurs when reached before expansion exists?
96. Should combinations have hard compatibility exclusions, or must all 1,024 work?
97. Eight worst-case combinations is a prose test; how many full mechanical founding bundles should
    the gate synthesize and inspect?
98. Must every oracle entry specify allowed/skewed tables, forbidden capabilities, clocks, economy
    modifiers, consequence modifiers, DM triggers, and reveal cadence—not only town/dungeon/hook prose?
99. Are oracle modifiers allowed to change probabilities only, or can they guarantee one founding
    site/NPC/faction/room family?
100. When premise and a later table conflict, which wins: premise rerolls row, deterministic reskin,
     marks contradiction as mystery, or forbids the combination?

## 6. Quest, hook, rumor, and destination tables

Adjudicate every row in Quest Destination, Macguffin, Complication, Urgency, Questgiver Avoidance,
NPC Hook, NPC Side Quest/Job Board, Child Saw, Animal Tell, Useful Knowledge, Distant Word, Plot Item,
Plot Lock, dungeon discoveries/secrets/revelations, and hook-walk routing.

101. Is every accepted quest required to end in the dungeon?
102. May a quest be completed entirely in town through social play?
103. May a town hook unlock a dungeon destination without combat?
104. Are fetch, escort, chase, delivery, rescue, investigation, sabotage, diplomacy, defense, and
     bounty all launch verbs? Mark each KEEP/DORMANT.
105. Can an escort target accompany the solo PC? If so, are they a noncombat dependent or a party
     member that violates `partySize: 1`?
106. Can a rescue add a temporary follower in tactical combat?
107. Can a quest destination be another town, road, wilderness, ruin, ship, planar site, or “where
     the target went”? If not, row-gate every source, not just Quest Destination.
108. Do hook walks always terminate in dungeon space, or can “place-thing” hooks terminate in town?
109. Does reward-scaled walk length survive inside the never-ending dungeon?
110. Are wilderness accommodations in HOOK-WALKS dormant, deleted from the launch build, or retained
     only in the full profile?
111. Can rumors concern unreachable places if the player cannot engage them?
112. If a rumor is unengageable, is it honest world texture or a broken affordance?
113. Must every surfaced hook expose its legal destination type before the player commits?
114. Can Distant Word report events outside town? Can those reports affect local clocks?
115. What happens when NPC Want + Hook + Quest Destination compose into a legally impossible job?
116. Should the hook generator accept a capability context and filter before rolling each component?
117. Are generic macguffins reskinned through WOUND/LICENSE, or do they remain independent?
118. Which quest complications imply unavailable systems: naval travel, wilderness survival, multiple
     factions, allies, siege, chase, law enforcement, crafting, resurrection, or planar travel?
119. Can a job promise a reward not in the curated launch item/economy set?
120. Must every dungeon revelation advance BELIEF↔TRUTH, or only tagged premise beats?

## 7. Social engine and NPC tables

121. Which ancestries/species can the PC choose, and which can NPCs roll?
122. Is `realms: [fantasy]` enough, or must race, names, roles, animals, items, art, and vocabulary
     each be pinned to a named fantasy projection?
123. Which NPC role-spine entries are mandatory/forbidden in one dungeon economy town?
124. Are soldiers, sailors, caravaners, diplomats, nobles, farmers, hunters, and explorers legal as
     residents with past careers, or only if their present function is local?
125. Can NPC Relationship to Town produce visitor, exile, traveler, refugee, emissary, or foreigner?
126. Can NPC Faction Ties point to an unminted/outside faction?
127. Do NPC Resource Control rows reference unsupported assets or institutions?
128. Can NPC Wants be fulfilled without leaving the container?
129. Can NPC Bonds/Fears/Secrets/Traumas reference people or places outside town?
130. If yes, must the DM translate the object into a local proxy, or may it remain off-map canon?
131. Can If-Ignored regional effects fire when there is no active region simulation?
132. Does “regional effect” become town/dungeon state, or is that table dormant?
133. Are child hooks and animal tells allowed to mint dungeon walks?
134. Are wild animals dormant? Are dungeon animals and town animals separate legal pools?
135. Can an animal become an escort/sidekick despite the solo-party rule?
136. Are faction turns core? What can a faction do that would require overworld simulation?
137. How many recurring NPCs should the town sustain before new NPC minting is suppressed?
138. Must every important NPC have a dungeon relationship (descender, beneficiary, victim, keeper,
     supplier, believer), or can some live entirely above?
139. Do social conflicts ever produce tactical encounters, and what deterministic transition sends
     them below without stealing player agency?
140. Which social systems require live model narration, and which can resolve engine-only?

## 8. Dungeon tables and the two-layer law

141. Does the current dungeon walk become a FLOOR, a ROOM-CLUSTER, or is a new wrapper required?
142. Which current topology grammar owns floor graphs, and which owns tactical-room adjacency?
143. How many rooms comprise a normal floor, and how many tactical encounters per floor?
144. Can a floor contain no combat? Can every room-cluster contain social/parley resolution?
145. Which existing dungeon types/origins conflict with each WOUND?
146. Are environment skins independent variation, WOUND-projected variants, or redundant?
147. Can dungeon exits lead to wilderness, urban districts, another realm, surface elsewhere, or
     only deeper/up/home/shortcut?
148. Must every exit-destination row be gated by capabilities?
149. Can secret doors or portals bypass floors? Can they return to town?
150. Can the dungeon contain windows/skies/weather/ships/forests as magical rooms? If yes, does that
     violate the contained promise or demonstrate Genesis breadth in miniature?
151. Are puzzles launch-core? What happens if the PC's class lacks the presumed capability?
152. Are traps/hazards built for one PC, or do existing rows assume party redundancy?
153. How does retreat work during a room-cluster battle?
154. What persists after retreat: enemies, damage, doors, loot, hazards, clocks, topology?
155. Where can the PC rest: any cleared room, fixed sanctuaries, town only, premise-dependent?
156. Does returning to town reset monsters, refill rooms, advance clocks, or transform the floor?
157. Can previously cleared rooms be repopulated? Under what disposition and with what telegraph?
158. Is backtracking playable room-by-room, abstracted, or instant after a shortcut is unlocked?
159. Can the PC be stranded below without food/healing/resources?
160. Does dungeon depth map to character tier, threat tier, lore reveal, WOUND intensity, and loot?
161. What prevents infinite generation from outrunning authored tactical/material assets?
162. Are Mythic dungeon results reachable at launch, and can the game mechanically honor them?

## 9. Combat, solo balance, classes, and monsters

163. Is “SRD-exact” about player rules/stat blocks only, or must encounter math remain SRD guidance?
164. What level range ships: 1–10 as current Tier Scope, a smaller cap, or endless post-cap play?
165. Does the PC start at level 1? Can the first descent be survived solo without hidden assistance?
166. What compensates for a one-PC action economy: encounter size, healing, reactions, extra turns,
     retreat, hirelings, blessings, checkpoints, or class-specific tuning?
167. Which of those would stop the classes being SRD-exact?
168. Are subclasses truly absent, or automatically fixed per class? What happens at subclass levels?
169. Which class features assume travel, wilderness, a party ally, broad spell access, or downtime?
170. What does “honed” mean separately for fighter, rogue, and wizard: UI clarity, build options,
     encounter support, unique dungeon verbs, item support, tutorial, balance, or authored content?
171. Is multiclassing dormant? Are feats dormant? Are backgrounds full, filtered, or rewritten?
172. Which spells create out-of-scope promises: long-range travel, planar travel, teleportation,
     summoning allies, overland navigation, settlement-scale creation, resurrection?
173. Are such spells unavailable, mechanically constrained, or allowed with contained interpretations?
174. How is the monster allowlist curated: CR, solo encounter math, sprite readiness, tactical AI,
     dungeon habitat, premise fit, size/footprint, summon compatibility, and parley support?
175. Does every allowed monster need a deterministic AI profile before it can ship?
176. Does every allowed monster need a valid solo encounter at at least one launch level?
177. Are humanoid NPC enemies drawn from the monster roster, NPC roles, or a separate combatant pool?
178. Can monsters be factions, patrons, prisoners, merchants, or town residents?
179. Are boss tables restricted to allowlisted monsters before or after threat composition?
180. What happens when a legal enemy-category/composition row cannot be filled from the roster?
181. Should the roster be premise-biased per WOUND, depth, and faction without creating branches?
182. What are the minimum roster counts per CR band, role, size, and WOUND compatibility?

## 10. Items, loot, economy, crafting, and restock

183. Is the town economy closed, or can imports/exports exist as fiction without travel simulation?
184. Does LICENSE replace, bias, or merely contextualize existing economy tables?
185. What currencies exist? Can dungeon yield be directly spent, or must it be appraised/fenced/refined?
186. Which shops/services must always exist for each class to remain viable?
187. Can inventory roll travel gear, vehicles, ships, mounts, maps, realm items, or party-only gear?
188. Are consumables balanced for solo survival? Is healing reliably purchasable?
189. Do item tables include T3/T4 or realm rows that the launch profile must never deal?
190. Can a plot item require an unreachable place, outside institution, absent spell, or companion?
191. Does loot persistence include items left in rooms, sold items, stolen items, and merchant stock?
192. When and how does town stock refresh?
193. Who owns restock logic: LICENSE/premise, depth band, time, cleared floors, or a dedicated system?
194. Can grinding shallow floors generate infinite money? What sinks/risk escalation prevent it?
195. Are crafting, durability, repair, identification, attunement, and encumbrance launch-core?
196. Can an item open an overworld/realm capability that is dormant?
197. Must every reward be usable by at least one launch class, or are trade/sell rewards sufficient?
198. What happens to a class-critical item if the PC dies and a successor is a different class?

## 11. Time, consequence, death, persistence, and world simulation

199. What advances time: room turns, floor completion, rest, town scenes, descent/return, DM events?
200. Do faction and pressure clocks tick while the PC is below?
201. Can a clock demand action outside the container?
202. Which consequence-ladder outcomes imply exile, travel, allies, property, regional harm, or realm
     change—and how are those gated?
203. Is “sentenced downward” a reusable consequence without becoming a repetitive teleport?
204. Can town consequences remove access to shops, rest, NPCs, or the dungeon entrance?
205. Can the town be destroyed? If so, does the world remain playable?
206. What does PC death do: successor in same town, immediate rebirth, world continues, dungeon resets?
207. Can past-PC gear/body remain in the dungeon and be recovered?
208. Does successor generation ever produce an origin outside the town?
209. Are multiple dead PCs a de facto party/legacy roster that affects the solo rule?
210. What state is write-once, transformable, recyclable-soft, or ephemeral? Rule town, floor,
     room, NPC, item, faction, rumor, hook, monster, and premise truth separately.
211. How are impossible old soft-prep bundles handled after a scope/premise change?
212. Although old-save migration is deprioritized, must the launch build refuse, hide, or safely
     read existing wide worlds?

## 12. DM boundary and synthesis constraints

213. Is town play continuously DM-narrated while dungeon play is engine-only except triggers?
214. Who narrates ordinary dungeon exploration between battles?
215. If the DM is summoned only at triggers, who presents room prose twins, choices, NPC dialog,
     search results, and consequences?
216. Which exact event types summon the DM? Provide a closed enum.
217. Can a table result itself require a DM summon? How is that declared in source?
218. Does every social contact summon the DM, including shopkeepers and repeated conversations?
219. How are several triggers batched without delaying an immediate player choice?
220. What deterministic fallback runs if no model is available?
221. May synthesis repair a composed illegality, or must illegal bundles never reach it?
222. Add a launch prompt law forbidding offers of travel, other realms, party recruitment, unsupported
     classes, or unimplemented verbs?
223. Must DM output events be capability-validated exactly like table draws?
224. Can the DM introduce nouns not rolled or present in canon? Under what bounded rule?
225. How does the DM know which fictional outside-world references are texture-only and cannot become
     actionable hooks?
226. What is the maximum model cost/call cadence per floor and per town return?

## 13. UI, maps, onboarding, and player promise

227. Does world creation show the fixed container before rolling, or reveal it through play?
228. What choices exist at new game beyond class: name, ancestry, background, appearance, premise
     lock/reroll, difficulty, seed?
229. Are dormant classes/realms visible as “coming later,” hidden entirely, or documented elsewhere?
230. Is the overworld map removed, hidden, replaced by a town/floor navigator, or preserved in dev UI?
231. What is the canonical navigation model: town site list ↔ floor graph ↔ tactical room-cluster?
232. Does town have a rendered map, illustrated tray, prose list, or hybrid?
233. Can the player see dungeon depth/floor topology before exploring it?
234. How are unreachable outside-world nouns visually distinguished from actionable destinations?
235. What prevents a text command from requesting an unsupported action such as “leave town”?
236. Does the game explain why combat relocates below, or let the premise demonstrate it?
237. What is the first ten-minute tutorial loop for fighter, rogue, and wizard?
238. Which accessibility and blind-playable surfaces must remain fully supported at launch?

## 14. Source-family disposition sheet

Fill one row per **table**, then one exception row per gated source row. Do not approve a folder in
bulk merely because its title sounds in-scope.

| Source family | Default question | Founder disposition |
|---|---|---|
| World Building / Place Generation | Can every result describe this town, its dungeon, or non-actionable history? | |
| World Building / Starting State | Can every pressure/faction/opening act inside the container? | |
| World Building / Mythic Events | Can every permanent change be represented and persisted locally? | |
| World Building / Sensory/Architecture | Is it realm- and WOUND-compatible without false traversal? | |
| Social / Factions | Can every agenda/method/relationship operate locally? | |
| Social / Quests & Problems | Can every surfaced promise be completed in town/dungeon? | |
| Social / Sentient NPCs | Can every role/want/bond/resource/effect function locally and solo? | |
| Session / Dungeon | Can every origin, exit, encounter, reward, and transformation honor WOUND + roster? | |
| Session / Urban | Is this town social grammar, or is the entire roller dormant? | |
| Session / Wilderness | DORMANT unless a specific row is intentionally used as dungeon skin. | |
| Session / Travel/Journey/Chase | Can it occur inside a floor/town, or does it promise overworld movement? | |
| Session / Consequences | Can every outcome change supported state without inventing a surface? | |
| Session / Downtime/Economy | Does every result work in a closed one-town economy? | |
| Character Genesis | Can every past/origin/relationship be honored without leaving? | |
| Realms / fantasy skins/items/places | Is fantasy a fully named launch projection rather than generic fallback? | |
| Realms / non-fantasy | DORMANT in launch; full compile and harnesses retained. | |
| Fixed JS arrays/constants | Are all non-markdown rollers included in the legality census? | |
| DM prompt examples/contracts | Can examples cause unsupported offers even when tables are clean? | |

For each table record:

```text
table id/path:
runtime callers:
launch disposition: KEEP | KEEP+BIAS | ROW-GATE | RESKIN | REWRITE | DORMANT | KILL CONTRACT | SPIKE
legal contexts: [town, dungeon-floor, room-cluster, founding, downtime, ...]
required capabilities:
premise axes that skew/project it:
illegal stable row keys:
composition hazards:
replacement/depth work needed:
re-entry manifest field/capability:
verification fixture:
Adam approval/date:
```

## 15. “No illegal roll” acceptance gate

239. Approve a capability-based `RollContext` passed through every launch dealer rather than a
     global scope flag alone?
240. Approve validation at these four layers: source lint, compiled eligibility, draw-time context,
     and composed-bundle validation?
241. How many draws per table/context are sufficient? A global 1,000-walk census will miss rare
     d300 rows and uncalled generators.
242. Require exhaustive enumeration for finite source rows and Monte Carlo only for compositions?
243. Require coverage proving every kept row was reached by at least one launch test?
244. Require a negative fixture for every dormant capability (travel, wilderness, other realm,
     party/sidekick, extra class, overworld)?
245. Require DM-contract fuzzing so emitted events cannot introduce disabled capabilities?
246. Require campaign simulations covering world mint → town → descent → battle → loot → return →
     restock → faction turn → repeated descent?
247. What is the allowed repair rate? Recommended: zero illegal raw draws, measured reskin/repair
     only where explicitly licensed.
248. Must CI compile and test both FULL and LAUNCH artifacts from clean source on every change?
249. Should launch artifacts be separately named rather than overwriting committed full artifacts?
250. Must a table row newly added without eligibility fail launch CI until adjudicated?

## 16. Preservation and rollback gate

No scope implementation begins until this block is green.

251. Name the exact baseline commit for “Genesis before contained launch.”
252. Create and push an annotated tag such as `pre-contained-launch-2026-07-31` at that commit?
253. Does “current state” include any uncommitted files in any active worktree? If yes, their owner
     must commit/stash/archive them; a Git commit cannot preserve dirty state.
254. Confirm all active branches and the baseline tag exist on `origin`, not only locally.
255. Capture `git status`, `git worktree list`, branch upstreams, and commit hashes in a preservation
     ledger at the moment the baseline is declared?
256. Does the full current game build and pass its gates from a fresh checkout of the baseline?
257. Export or fixture one representative pre-scope world and one deterministic roll transcript for
     regression comparison?
258. Keep FULL as the default developer profile until LAUNCH passes acceptance, or switch defaults
     earlier? (Recommended: keep FULL default until proven.)
259. Must every contained-launch wave land as a separate `--no-ff` merge so it can be reverted alone?
260. Define rollback levels: disable launch profile; revert one wave; revert entire program to tag;
     restore old save schema/data.
261. Does rollback need to preserve worlds minted by the launch build, or is launch-world rollback
     explicitly unsupported during development?
262. Run a rehearsed rollback in a disposable worktree before declaring the rescope safe?
263. Require a one-command comparison that builds/tests FULL at baseline vs FULL at launch HEAD?
264. Who may move/delete the baseline tag? Recommended: nobody; make a new tag for later baselines.

## 17. Definition of ready to spec

The drafts may advance from founder-direction to build-authorized only when:

1. The scenario boundary (§0) and ending are explicit.
2. The multi-axis legality model (§2) replaces or decisively overrules single-tag taxonomy.
3. Every runtime source family—including fixed code arrays and DM event outputs—has an owner and
   disposition protocol.
4. Quest/social/world/dungeon composition rules prevent mechanically unfulfillable promises.
5. Solo combat, class progression, spell scope, roster, rest/retreat, economy, death, and dungeon
   persistence are ruled enough to test a complete loop.
6. Oracle entries project into actual mechanics and have a defined conflict-precedence law.
7. Exhaustive row eligibility plus composed-campaign verification is specified.
8. The pre-contained baseline is clean, named, pushed, fresh-checkout verified, and rollback-rehearsed.
