---
id: npc-role-skin-cosmic
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Skin — Cosmic (correspondences are load-bearing; the wonder answers back when you spell it right)

> **DRAFT re-key 2026-07-08 — Adam taste pass pending (docs/COSMIC-REKEY.md).** Re-keyed from
> Lovecraft-void into **Egyptian funerary cosmology + hermetic esoterica + Enochian angelic myth**.
> The role SHAPES are unchanged (35-row spine + adds preserved, weights untouched) — only the LABELS
> and flavor re-key: star-readers become temple astrologers and Enochian scryers, cultists become
> temple scribes and initiates of the grades, the touched become embalmers and the heart-weighed.
> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). Cosmic is a **thin-labor,
> thick-margin/faith** skin: it **drops** the archetypes that assume an ordinary economy under an
> ordinary sky (no one tills a field the geometry keeps rearranging), **reweights** hard toward the
> touched, the cultic, and the inexplicable-presence roles this realm is built to hold, and **adds**
> the shapes that exist only at the edge of something vast. Soul/note/class inherit from the spine;
> only the LABEL changes. Blank Weight = spine default, `0` = drop. Kin-agnostic / recontextualize
> per convention. Lever/atom — exempt from the situation family (do NOT tag `table_family`).
>
> **Drops:** Land-worker and Hauler — the two most literally dirt-and-cargo labor archetypes go to
> `0`; there is no season to till and no ordinary freight route under a sky that argues with itself.
> Delver survives the labor purge by being *reskinned wholesale* into the realm's central verb —
> going into the wrong places (tombs, breach-mouths, the geometry) on purpose — and gets reweighted
> **up**, not down.
>
> **Reweights:** margin and faith classes climb across the board (Cipher, Touched-adjacent roles,
> Hidden-fanatic, Recruiter, Outsider, Recluse) — this is a realm that produces the changed, the
> devoted, and the merely unexplained faster than it produces farmhands. Rite-keeper climbs too: a
> place with an actual answering thing needs more vigil than doctrine.

## Reskin map (spine archetype → Cosmic label)

| Archetype key | Cosmic label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | — | 0 |
| 2 · Wild-provider | Omen-forager (gathers what falls when the sky argues with itself; reads the flight of birds) | 4 |
| 3 · Hauler | — | 0 |
| 4 · Delver | Breach-delver / tomb-robber (works the tears in the world and the sealed vaults; patient in the wrong places) | 8 |
| 5 · Servant | Astrologer's aide (attends the star-reader; hears what each reading costs) | |
| 6 · Destitute | Star-mad beggar (lost everything to a reading that wouldn't stop) | 5 |
| 7 · Maker | Instrument-wright (builds the orreries, astrolabes, and listening-horns) | |
| 8 · Metalworker | Sigil-smith (engraves the planetary seals and kameas that keep the callers out) | |
| 9 · Feeder | Vigil-cook (feeds the ones who keep the watch; never asks what for) | 2 |
| 10 · Builder | Ward-mason (raises the walls whose proportions hold the geometry outside) | |
| 11 · Clothier | Linen-wrapper (hems the sigils into cloth; notices whose wrappings are already wrong) | |
| 12 · Outfitter | Star-tide chandler (preps vessels for currents the moon doesn't make) | |
| 13 · Trader | Relic-trader (deals in scarabs that remember, and coin stamped in no known reign) | |
| 14 · Host | Way-house keeper (runs the inn at the edge of the charted world) | |
| 15 · Remedy-maker | Wrongness-tender (treats what the sky does to people; recipes half-guessed) | |
| 16 · Healer | Heart-tender (holds the touched together; trusted, and fraying under it) | |
| 17 · Rite-keeper | Vigil-keeper (maintains the watch-ritual and the hours of the Calls, not the doctrine behind them) | 4 |
| 18 · Performer | Echo-singer (performs Calls half-borrowed from something that answered) | |
| 19 · Enforcer | Ward-line sentry (authority-adjacent; patrols where the geometry leaks) | |
| 20 · Hired-blade | Breach-mercenary (paid to stand where the wrongness runs thickest) | |
| 21 · Road-guard | Waypoint-warder (wary of paths that don't lead where they used to) | |
| 22 · Outlaw | Boundary-breaker (desperate or reckless; crosses the drawn lines meant to stay closed) | |
| 23 · Smuggler | Relic-runner (moves the sealed and the never-opened; speaks only in euphemism) | |
| 24 · Thief | Sigil-picker (steals the wards and seals themselves, and doesn't grasp what that undoes) | |
| 25 · Hidden-fanatic | Cult-of-the-answer initiate behind a mundane face | 3 |
| 26 · Recruiter | Belonging-seller (charisma aimed at the desperate; sells a place in something vast) | 3 |
| 27 · Outsider | The kept-on (chose to stay after being changed; the reasons stay unclear) | 3 |
| 28 · Recluse | Desert-hermit (known of, rarely seen; talks to something that isn't there — or is) | 2 |
| 29 · Stand-in | Borrowed warden (filling in for someone the Duat took) | |
| 30 · Unofficial-power | Reading-broker (power without a title; controls who gets an augury, and when) | |
| 31 · Misfit | The unqualified reader (never should have picked up the deck or the charts, and can't put them down) | |
| 32 · Pampered-elite | Augury patron (wealthy, bored, insulated — commissions readings like art) | 1 |
| 33 · Magnate | Relic magnate (sees every wonder as inventory) | |
| 34 · Secret-scholar | Archive-warden of the impossible (hoards the correspondence-knowledge that costs its reader) | |
| 35 · Cipher | The unexplained presence | 3 |

## Adds (cosmic-only roles — layer over the reskin)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Temple astrologer / augur | 3 | faith | Reads the geometry that argues with itself and the wandering stars, and pays for each reading a piece at a time. |
| [ADD] | True-name speaker | 1 | margin | Knows the name too long to finish; the only one who can pronounce it, and it's costing them. |
| [ADD] | Silence-keeper | 2 | authority | Tends the thing that must not be heard; the town's quiet is their whole job. |
| [ADD] | Heart-weighed pilgrim | 3 | margin | Came back from the edge changed, following a Call with no source; certain their heart already tipped the scale. |
| [ADD] | Cult-of-the-answer | 2 | faith | Worships what answered back. Recruiting. Patiently. Forever. |
| [ADD] | Cartographer-of-the-impossible | 1 | craft | Maps the geometry that won't hold still; the maps are never twice the same. |
| [ADD] | The returned | 2 | margin | Went in and came back subtly wrong; their loved ones aren't quite sure it's them. |
| [ADD] | Enochian scryer | 1 | faith | Speaks the tongue of the Aethyrs — but only in trance, and can't be woken safely. |
| [ADD] | Embalmer / opener-of-the-mouth | 1 | craft | Prepares the dead for the Duat; knows which rites keep a thing from getting back up wrong. |
| [ADD] | Scholar-gone-too-far | 1 | elite | Knew too much of the correspondences; now the knowing lives in them and pays no rent. |
^npc-role-skin-cosmic
