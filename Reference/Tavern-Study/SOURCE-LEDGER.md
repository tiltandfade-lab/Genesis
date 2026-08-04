# Tavern / Hospitality Venue study — source ledger

date: 2026-07-26  
scope: real-roll Tavern audit plus initial cross-tradition hospitality research  
rule: all external material is linked reference evidence; no external source image is
copied into this packet

## Architecture, operation, and hospitality practice

| id | source | type / context | rights/use | facts used |
|---|---|---|---|---|
| TV-01 | [Historic England, *The Angel Inn, Andover*](https://historicengland.org.uk/listing/the-list/list-entry/1093460?section=official-list-entry) | official statutory heritage record; purpose-built mid-15th-century English inn | linked reference; user-contributed/list-entry images not copied | a large route inn coupled street-aligned gatehouse, hall, cellar, parlour, chambers, kitchens, stables, two gates, courtyard, galleries, records, and later civic reuse; it proves one large host family, not the universal tavern plan |
| TV-02 | [UNESCO, *The Persian Caravanserai*](https://whc.unesco.org/en/list/1668/) | World Heritage serial property; Iranian route inns over more than two millennia | UNESCO page text CC-BY-SA IGO 3.0 where marked; linked, not copied | shelter, food, and water followed trade/pilgrimage routes, water, geography, and security; venues were short-term cross-cultural meeting points and formed a network rather than isolated rooms; ancillary cisterns and other external providers mattered |
| TV-03 | [ICOMOS evaluation, *The Persian Caravanserai*](https://whc.unesco.org/archive/2023/whc23-45com-inf8B1-en.pdf) | official advisory-body evaluation, 2023 | linked PDF; no pages or images copied | courtyard is not universal: cold mountain types often use a large enclosed hall; hot, humid Gulf types can omit the courtyard for a cross-shaped central room, peripheral rooms, shade, and airflow; urban land cost and out-of-city security also change storeys and enclosure |
| TV-04 | [Pompeii Archaeological Park, *Thermopolium of Regio V*](https://pompeiisites.org/en/press-releases/from-the-12th-august-the-thermopolium-of-regio-v-is-opening-to-the-public/) | official excavation/site interpretation, Roman Pompeii | linked reference; images not copied | a common hospitality/meal service can be a compact street counter with hot food and drink stored in embedded vessels; lower- and middle-class midday service does not require a common hall, bar, or lodging |
| TV-05 | [Pompeii Archaeological Park, *Shops VII, 14*](https://pompeiisites.org/en/excavations-plan-en/shops/) | official archaeological research summary | linked reference; images not copied | a thermopolium could use two spaces: street-facing service/counter and rear kitchen, possibly with a latrine beneath a stair; earthquake repair could change the use of the premises |
| TV-06 | [Colonial Williamsburg, *Shields Tavern Archaeological Report*](https://research.colonialwilliamsburg.org/DigitalLibrary/view/index.cfm?doc=ResearchReports%5CRR1626.xml&highlight=) | foundation research report using archaeology and documentary records | linked reference; quoted historical material not reproduced here | hospitality emerged from household labor and management; licenses, price controls, credit, nonpayment, discriminatory access laws, weights/measures, food/drink/lodging, drinking and sanitation vessels, supply, stabling, and business precarity were operating facts |
| TV-07 | [Colonial Williamsburg, *Chowning's Tavern Architectural Report*](https://research.colonialwilliamsburg.org/DigitalLibrary/view/index.cfm?doc=ResearchReports%5CRR1440.xml) | foundation architectural report and period synthesis | linked reference; images not copied | inn, tavern, ordinary, alehouse, and coffeehouse were overlapping but non-identical labels; small taverns could be domestic conversions whose sign was the main exterior tell; booth, settle, fixed-table, club, gossip, food, drink, and lodging programs varied |
| TV-08 | [Colonial Williamsburg, *Wetherburn's Tavern Interpretive Report*](https://research.colonialwilliamsburg.org/DigitalLibrary/view/index.cfm?doc=ResearchReports%5CRR1176.xml&highlight=) | official historical interpretation plan | linked reference; images not copied | public and private rooms, lodging tiers, operator family, barkeeper, cook, cleaner, hostler, enslaved labor, outbuildings, garden, service/stable yards, laundry, livestock, vehicles, and after-hours work formed one venue system; room furnishing varied with clientele and privacy |
| TV-09 | [Colonial Williamsburg, *Raleigh Tavern*](https://www.colonialwilliamsburg.org/locations/raleigh-tavern/) | official site history | linked reference; images not copied | a major tavern combined lodging, food, drink, entertainment, games, public events, stable, supplies, and labor; overnight guests could share beds or floors, so lodging capacity and privacy are separate variables |
| TV-10 | [British Museum, *Life in a cup: coffee culture in the Islamic world*](https://www.britishmuseum.org/exhibitions/life-cup-coffee-culture-islamic-world) | museum exhibition synthesis | linked reference; images not copied | coffeehouses brought different positions, ethnicities, and religions together; authorities sometimes treated gathering as a threat; coffee hospitality had ritual and etiquette, showing that service practice and political tolerance alter venue behavior |
| TV-11 | [UNESCO ICH, *Traditional tea processing techniques and associated social practices in China*](https://ich.unesco.org/en/RL/traditional-tea-processing-techniques-and-associated-social-practices-in-china-01884) | official intangible-cultural-heritage record, inscribed 2022 | linked reference; media not copied | tea is served in homes, workplaces, teahouses, restaurants, and temples; greeting guests, relationship-building, ceremony, multiple ethnic groups, producers, pastry makers, families, and apprenticeships connect hospitality to practice and supply rather than one building type |
| TV-12 | [Government of Japan, *Meet You at Andy's!*](https://www.gov-online.go.jp/eng/publicity/book/hlj/html/201611/201611_04_en.html) | government cultural magazine; contemporary izakaya profile | supplementary source; linked, images not copied | shared dishes and beverages, after-work use, group events, repeat customers, close seating, staff language/accessibility, fresh-seafood supply, nightly schedule, and occupation under elevated rail infrastructure demonstrate a compact living venue expression; this one profile is not a universal izakaya model |
| TV-13 | [Metropolitan Museum of Art, *Coffee, Tea, and Chocolate in Early Colonial America*](https://www.metmuseum.org/essays/coffee-tea-and-chocolate-in-early-colonial-america) | museum scholarly essay | linked reference; images not copied | coffeehouse, tea garden, and domestic ritual were different social institutions; coffeehouses supported news and idea exchange; service vessels and imported supply carried status and practice |
| TV-14 | [Historic England, *Protecting Historic Pubs*](https://historicengland.org.uk/advice/caring-for-heritage/englands-historic-pubs/protecting-historic-pubs/) | official heritage guidance and current community examples | linked reference; images not copied | public houses can add market, pawn, meeting, postal, library, work, grocery, takeaway, and other community services; changing demand and operating cost can transform a venue without erasing its social identity |

## Local implementation and prior-study evidence

| id | source | use | result |
|---|---|---|---|
| TV-L01 | `Reference/Tavern-Study/ROLL-RECEIPTS.json` | twelve deterministic live-path captures | exposes strong story/cast persistence, broad general-interior range, and an ungated typed-selection/operator/culture gap without hand correction |
| TV-L02 | `dev/capture-tavern-study.mjs` | capture method | overrides the current global random surface with a recorded deterministic seed, selects first-roll Watering-hole/Lodging contexts, and keeps live versus unwired lanes separate |
| TV-L03 | `Engine/02. _Procedures/Tavern Generator 2.0.md` | archived authored source | preserves progressive disclosure and many high-value scene prompts; several deep sections remain unextracted and unwired |
| TV-L04 | `Engine/03. _Tables/03. Session Mechanics/Tavern/` | compiled source tables | name, four foundation subtables, sensory, barkeep quirk, and in-media-res are callable; only the name table is consumed by the current typed-building roll |
| TV-L05 | `data/building-kits.js`, `data/place-skins.js`, `src/engine/codex-roll.js`, `src/world/urban.js` | live engine path | supplies place skin, typed label, generic interior, name, codex proprietor/cast, lifecycle, Distant Word, and chance encounter |
| TV-L06 | `Reference/Camp-Study/contact/l3-caravanserai-plan.jpg`, `l3-coaching-inn-george.jpg`, and `lane-3-waystation-typology.md` | already-retained route-hospitality comparison | provides local visual/form evidence for route compound and coaching-inn expressions; this packet does not duplicate those images |
| TV-L07 | `docs/FFT-TS-RESEARCH-EXTERNAL.md` | direct FFT corpus audit | records that the 121-map FFT corpus contains no inn, tavern, camp, or waystation by name or visual inspection; Golden Venue FFT proof must therefore use relational surrogate grammar, not claim a direct tavern precedent |

## Evidence / inference boundary

- **OBSERVED:** a cited source or live receipt directly supports the stated
  relationship.
- **SYNTHESIZED:** several observations support a generator rule; the source does not
  claim the game mechanic.
- **ADAPTER:** Genesis binds a rolled impossible fact or reuses a host in another
  realm. The adapter must preserve the hospitality obligations and receipt lineage.

The sources document unequal, coerced, exclusionary, colonial, classed, gendered, and
otherwise harmful systems as well as convivial ones. Their presence in the ledger is
not endorsement. Access and labor facts must remain attributable to the fictional
authority or culture that produces them, not naturalized as generic tavern color.

## Declared gaps

- The pass is broad enough to reject a universal medieval tavern, but it is not a
  comprehensive global history of hospitality.
- The Japanese source is a government magazine profile, useful but weaker than the
  archaeological and statutory sources.
- Tea and coffee sources establish social practice more strongly than measured
  architecture.
- No direct FFT tavern map exists in the audited corpus.
- No source decides Genesis cell dimensions, camera fit, standee capacity, tactical
  reservations, or the final first fixture.
- No external image is approved as shipping art.
