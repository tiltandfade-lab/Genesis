---
type: system-spec
branch: Genesis
status: Phases 1–3 built (2026-06-24); Phases 4–6 pending
created: 2026-06-24
related:
  - "[[DESIGN]]"
  - "[[SESSION-PREP]]"
  - "[[EVENT-CONTRACT]]"
  - "[[DM-CHARTER]]"
  - "[[NEXT-STEPS]]"
---

# CODEX — the relational entity layer (NPCs · Locations · Items · Factions)

## Why this exists (the playtest that forced it)

In the 2026-06-23/24 Saltrest playtest the DM (AI) **invented the entire cast** — Quill, his alias and
fear, cousin Sabarra, the Cinderyard, the counting-house, Tinker's Stair, the gran's house, the key,
Coll & Mire. None of it was rolled, none of it was stored as data, and the AI then had to *remember
every line* — which it failed (the Orrel bleed). Two root causes, both confirmed by reading the code:

1. **Session-Prep rolls the *stage*, not the *players*.** `assemblePrepBundle` produces three environment
   walks (segment topology + encounters + loot composition) and three **abstract** quest hooks. It mints
   **zero** NPCs, **zero** named places, **zero** specific items.
2. **There is no entity store.** NPCs/places live as **prose in the ledger** (`fact_canonized` lines) and
   flat `gazetteer` rows (`{type,name,desc,known}`). There are no records, no fields, no relationships.

This is a direct violation of the DESIGN north star (*maximize what the script serves; the AI is the
interpreter, never the source of truth*). The Codex is the fix: **the engine rolls and stores a cast of
relational entity records; the AI's job narrows to assigning meaning and wiring relationships.**

> **The division of labor (locked intent).** The engine `rollNPC()`s a name, role, secret, fear, bond.
> The **AI** is the one who says *"this rolled NPC is a good fit for Pendleton's cousin — link her to the
> Cinderyard, mark her the keeper of the key."* Atoms from the dice; **meaning and connections from the
> DM.** The DM should never be *generating* the cast, only *interpreting and connecting* it.

This is the Genesis analog of how a human DM runs a campaign in Obsidian: **every established NPC gets its
own note, wikilinked to the locations, NPCs, items, and plot threads it touches.**

---

## §1. The record model

All entities are records in **`w.codex`** (a new container on the world, sibling to `gazetteer`/`ledger`/
`map`/`factions`). One shape, four kinds:

```jsonc
{
  "id":   "npc:sabarra",          // "<kind>:<slug>" — stable, the wikilink target
  "kind": "npc",                  // npc | location | item | faction
  "name": "Sabarra Perrybottom",
  "rolled": {                     // PROVENANCE: the raw table outputs, verbatim (never rewritten)
    "role": "factor/clerk", "flawSecret": "...", "bond": "...", "fear": "...", "want": "..."
  },
  "fields": {                     // kind-specific, AI-interpreted FROM the rolled atoms (see §2)
    "role": "keeps the books at the Cinderyard",
    "demeanor": "wary, dry", "secret": "hid the key and ran"
  },
  "links": [                      // typed, directional relationships (the wikilinks)
    { "rel": "kin-of",    "to": "npc:pendleton" },
    { "rel": "works-at",  "to": "loc:cinderyard" },
    { "rel": "holds",     "to": "item:the-key" },
    { "rel": "hunted-by", "to": "npc:quill" }
  ],
  "status": {                     // mutable live state
    "known": false,               // player-facing knowledge gating (DM-CHARTER slow drip; see render.initKnown)
    "soft": true,                 // prep-rolled & unconfirmed vs. hard canon (mirrors SESSION-PREP soft-until-contact)
    "at": "loc:grans-house",      // current location (a link, kept on status for quick lookup)
    "condition": "alive"          // alive | fled | dead | … (NPC), intact|taken (item), etc.
  },
  "provenance": "rolled",         // rolled | authored | prep   (was it dice-born, hand-made, or prep-staged?)
  "ledgerRefs": []                // ids of the ledger beats that fleshed this entity (prose lives in the ledger, not here)
}
```

**Design rules:**
- **`rolled` is sacred** — the dice outputs are stored verbatim (the SYNTHESIS-CONTRACT "annotate, never
  rewrite" rule, applied to entities). `fields` is the AI's *interpretation*; the two are kept separate so
  drift is auditable.
- **`links` are typed and stored once, queried both ways.** A `kin-of` from Sabarra→Pendleton is the same
  edge read from either end. A small relation vocabulary (`kin-of`, `ally-of`, `enemy-of`, `member-of`,
  `works-at`, `located-in`, `holds`, `hunts`/`hunted-by`, `knows-about`, `owes`/`owed-by`, …); unknown
  rels are allowed (forward-compatible) but the core set drives the UI graph.
- **The ledger stays the event log.** Records hold *identity + relationships + current status*; the
  *narrative beats* (what happened) stay in the ledger, linked by `ledgerRefs`. No prose duplication.
- **`known` and `soft`** reuse the two gating axes we already have: `known` = the player has learned of it
  (panels gate on it, per `render.initKnown`); `soft` = prep-staged/rumored vs. confirmed-on-contact.

### Relationship to existing structures (migration, not replacement)
- **`gazetteer`** is the proto-codex (discovered entities, flat). The codex **subsumes** it: gazetteer
  entries become `location`/`npc`/`faction` records. A lazy migration mints records from existing
  gazetteer rows so in-progress saves don't break (current=record, links empty until enriched).
- **`factions`** become `faction:` records (agenda/method/clock move to `fields`/`status`); the live
  faction-clock logic keeps working, now reading the record.
- **`map.nodes`** stay the spatial layer but each node **links to** its `location:` record (`node.codexId`).
  A frontier node's prep entity becomes a soft `location` record.
- **The PC** is `npc:<pc-slug>` (so kin/ally links resolve to a real node).

---

## §2. The rollers (engine mints the atoms)

New deterministic rollers in `src/engine/` (callable by prep **and** on-demand mid-session). Each returns
a record's `rolled` + a *suggested* `fields`; the **AI fills final `fields` + all `links`**.

### `rollNPC(opts?)` — the on-demand NPC roller
Chains the **already-compiled** NPC atom tables (recon: 37 exist; ~24 wired into the markdown "Quick NPC
Generator"). Recommended chain (the playable minimum):

| Stage | Tables | Produces |
|---|---|---|
| identity | `npc-race-weighted` → `npc-name-megatable`, `npc-role` | who they are |
| surface | `npc-visual-quirk`, `npc-mannerisms` | how they read at a glance |
| **levers** | `npc-flaws-secrets` (d300), `npc-bonds` (d300), `npc-fear`, `npc-leverage`, `npc-want` | what moves them (the playable core) |
| hook | `npc-hook` | why they enter play |

`opts.roleHint` biases the role roll (e.g. prep asks for a "questgiver" or "muscle"). Output = a *statted,
motivated* NPC the DM only has to **name-confirm, voice, and connect**. This is the single highest-leverage
piece: it's what turns "the AI invents Quill" into "the dice deal a patient, frightened, secret-keeping
knife-man and the DM decides he's the one squeezing the Syndicate."

### `rollPlace(opts?)` — location identity
`place-master-setting` (named place) + `place-traits` + `place-secret` (+ `place-history` when depth is
wanted). Produces a named location record with a defining trait and a hidden truth. (Today prep rolls walk
*topology* but never place *identity* — this closes that.)

### `rollItem(opts?)` — significant objects ⚠ needs new tables (§5)
`quest-macguffin` only yields a *category* ("Relic," "Written Record"). `rollItem` needs a real
**plot-item / key / relic** table set to produce "a small old key" or "a sealed, sender-less letter."

---

## §3. Events (EVENT-CONTRACT additions)

The codex is written **only through events** (consistent with EVENT-CONTRACT; the AI never writes `w`
directly). New types for `applyEvent(w,e)`:

- **`codex_add`** `{ kind, name, rolled?, fields?, provenance, soft? }` → mint a record (id from kind+slug;
  idempotent — re-add merges).
- **`codex_link`** `{ from, rel, to }` → add a typed relationship (stored once, both-ways queryable).
- **`codex_update`** `{ id, fields?, status? }` → revise interpreted fields / status (condition, `at`, …).
- **`codex_reveal`** `{ id }` → flip `known=true` (slow-drip; supersedes the ad-hoc `discovery.reveal` we
  bolted on during the playtest — that gets folded in here).
- Contact/lock reuses SESSION-PREP's `prep_contact`/`lockOnContact`: entering a soft location flips its
  record `soft→hard`.

The existing `fact_canonized` stays for pure facts that aren't entities; entity facts now prefer
`codex_add`/`codex_update` so they're structured, not prose.

---

## §4. Prep casts the world; the session flow runs it

### Prep populates the codex (extends SESSION-PREP)
`assemblePrepBundle` gains a **casting pass**: for each rumored frontier it rolls, as **soft** records —
- 1 **location** (`rollPlace`) → the frontier's real identity (not just "A quarter (rumored)"),
- 1–2 **NPCs** (`rollNPC`, one biased to the hook's questgiver),
- 0–1 **item** (`rollItem`) when the hook implies an object.

These land in `w.codex` as `provenance:"prep", soft:true`. The **synthesis pass** (SYNTHESIS-CONTRACT)
then does what it's good at: **connect** them (wire links, assign which NPC is whose kin, bind the item to
a holder) and **reskin** prose — over a cast the dice already dealt. The DM stops inventing nouns.

### Start / End Session (the missing buttons)
Today `beginSession()` is buried in the in-world "⚙ World & transitions" menu and the wake cinematic only
fires from character creation. Replace with an explicit session frame:

- **Start Session** — a button on the **world-select / shelf screen** (and in-world when no session is
  live). It: `beginSession()` → `startPrep()` (casts the codex) → raises the **prep/loading cinematic**
  (the `#wakePrep` overlay we built) → fades into the chat **once prep + casting are done** → the DM opens
  the scene. By the time the chat appears, **the cast exists as hard data**; the DM reads records, doesn't
  memorize lines.
- **End Session** — closes the session cleanly (cliffhanger beat, increments nothing until next Start),
  recycles unvisited soft prep (existing `prepRecycleStale`), returns to the world-select screen.

---

## §5. Missing tables to author (the gaps the playtest exposed)

Confirmed by recon — these have **no adequate table** today and were the things I had to invent whole:

1. **Building / interior generator.** Only a thin `In-Building Complications` (d20) exists. Need a set that,
   given a building kind (home / counting-house / shrine / warehouse), rolls **a small interior** —
   a few connected spaces, a feature or two, who/what's inside. *(This is the "gran's house had nothing to
   roll" gap Adam flagged.)* Likely a compact walk-style roller (like the urban/dungeon walks but
   building-scale).
2. **Plot-item / key / relic generator.** Beyond loot rarity: a table that yields a **specific** significant
   object + *why it matters* + *what it opens/unlocks/proves* (the key, the sealed letter, the forged
   charter). Cross-indexed with NPC `want`/`leverage`.
3. **(Optional) "where is this NPC found"** connector — given a rolled NPC's role/faction, suggest a place
   record to bind them to, so casting auto-wires NPC→location.

Author via the established 5-band spice protocol + the compile pipeline; archive originals; recompile.

---

## §6. Surfacing (digest + UI)

- **Digest** (`dmDigest`): replace the flat `gazetteer` slice with the **relevant codex slice** — known
  records near the PC + everything they link to (1 hop) + the PC's own record. The DM gets a *connected*
  view ("Sabarra → kin-of Pendleton, holds the-key, hunted-by Quill") instead of scanning ledger prose.
  DM-only fields (an NPC's hidden secret/fear) stay flagged for the DM, gated from the player.
- **UI** — a **Codex panel** in the rail (or fold into the Gazetteer panel): records grouped by kind, each
  showing name + known fields + its links as clickable cross-refs (the Obsidian feel). Knowledge-gated
  (`known`) exactly like the current panels. A small relationship view (who-connects-to-whom) is a stretch
  goal.

---

## §7. Phasing & verification

1. ☑ **Codex data model** (2026-06-24) — `w.codex`, the record shape, `codex_*` events in `applyEvent`,
   lazy migration from `gazetteer`/`factions`, digest slice. *(Foundation — everything writes here.)*
2. ☑ **Rollers** (2026-06-24) — `src/engine/codex-roll.js`: `rollNPC` + `rollPlace` chain the compiled
   tables (`npc-*`, `place-*`) via `rollTable` into `codexAdd`-ready payloads (`rolled`/`fields`/`dm`);
   they return atoms, don't write — prep/the DM emit `codex_add`. `rollItem` waits on the §5 tables.
   `dev/verify-codex-roll.mjs` 27/27.
3. ☑ **Prep casting** (2026-06-24) — `assemblePrepBundle` gains `pbundleCast`: each frontier rolls a soft
   **location + 1–2 NPCs** (one biased `roleHint:"questgiver"`) as codexAdd-ready payloads in the bundle;
   `startPrep` mints them into `w.codex` as `provenance:"prep", soft:true`, binds the location to the
   frontier node (`node.codexId`) and places the NPCs there (`status.at`). `lockOnContact` locks the
   location soft→hard on entry (touch=canon); its NPCs stay a soft pool until met. The summary carries a
   compact cast (names/roles) for Stage-1; the full bundle carries the full payloads for the DM to
   **connect**. `dev/verify-prep-bundle.mjs` 47 · `verify-prep.mjs` 34.
4. **Session flow** — Start/End Session buttons + prep→cinematic→chat on world entry.
5. **Missing tables** (§5) — building-interior + plot-item/key.
6. **Codex UI panel** + the relationship view.

Each phase: `build/check-manifest.py` + a jsdom harness (`dev/verify-codex.mjs`) asserting record CRUD,
link both-way queries, event application through real mutators, gating, and (for prep) that a cast is
minted. Follow the branch-per-phase `--no-ff` git workflow.

---

## §8b. Locked refinements (2026-06-24 — Adam approved)

These supersede the leanings in §8 where they conflict.

- **Large cast + a recontextualization engine (generic, all data types).** Roll a *big* soft cast; nothing
  is wasted. An NPC rolled as a maid who never gets touched isn't discarded — she returns to the **soft
  pool** and can be **recontextualized** into a new casting role later (e.g. recast as a tavern-keeper),
  her rolled *soul* (personality/secret/fear) preserved, only her role/links/placement reassigned. This is
  how a real DM preserves crafted work under time pressure; the same constraint binds the AI DM.
  **Recontextualization is a first-class engine, applied to every entity type** (NPCs, locations, items,
  quests), not an NPC hack. `codexRecontextualize(id, ctx)` **preserves `rolled` + identity, reassigns the
  context; refuses on any hard (contacted) entity.** *(Mode default: preserve-identity recast. A second
  "reuse-the-bones-as-a-new-person" mode is deferred until needed.)*
- **The codex is the all-knowing store, never shown raw.** It is casting + lighting + set-design + the
  whole crew, ready to move scenes and recontextualize props/cast/quests at any moment. The **player only
  ever sees a sanitized projection** — `codexPlayerView(w)` filters to `known` records and strips DM-only
  fields + soft/uncontacted entities. The gazetteer becomes that projection (a *view*), not a second store.
- **Touch = canon, forever (sacred).** The instant the player touches an entity it **locks**
  (`soft→hard`). A hard entity is **never recontextualized and never duplicated.** Time and events may
  evolve its *state* (`status.condition`, `status.at`) — never its *identity* — unless the story explicitly
  calls for a duplicate. (Locations auto-detect lock on map-entry; NPCs/items lock via a DM-declared
  `codex_contact` event in v1, migrating to name-match auto-detection — "detected > declared.")
- **Core link vocabulary (locked starter set, extensible):** `kin-of`, `ally-of`, `enemy-of`, `member-of`,
  `serves`, `leads` · `located-in`, `near` · `holds`, `controls` · `wants`, `knows-about`,
  `hunts`/`hunted-by`, `owes`/`owed-by` · `unlocks`, `proves`, `part-of`. Directional with implied inverses;
  symmetric set = {`kin-of`,`ally-of`,`enemy-of`,`near`}.
- **Items are pointers, never copies.** An `item` record carries `source:{type, ref}` →
  `srd` (`Reference/SRD-Data/magic-items.json`, 258 items, or `equipment-weapons-armor.json` for mundane),
  `loot` (`dungeon-loot-*#row` — Adam's curated rows 1–N are verbatim, the rest are SRD pointers), or
  `plot` (the new tables below). One source of truth; the codex holds the *instance + relationships*, not a
  duplicated definition.
- **New item tables to author (Phase 5):** a **specific plot-object generator** (the macguffin *categories*
  in `quest-macguffin` → actual objects: "a small old key," "a sealed sender-less letter") + a **key/lock
  table** (what it opens + where the key is kept). Spice-graded, compiled.
- **Success metric — measured by the SCRIPT, not a model.** The **mechanical-vs-invented ratio test** must
  be a deterministic tally over `w.codex.records[].provenance` (+ item `source`), **never** a model
  self-report (any tier — Sonnet or Opus — is an unreliable, biased narrator of its own invention). Buckets:
  `rolled` / `recontextualized` / `prep` = **mechanical**; `authored` = **invented**. Build a small
  `codexProvenanceReport(w)` (a tally → a ratio) and surface it at session end. The codex's job is to move
  that ratio hard toward mechanical. Baseline (Saltrest, pre-codex): ~20% mechanical / 80% invented. A
  model (Sonnet is fine) may add an optional *qualitative* read — "was the invented share good connective
  tissue or gap-filling the tables should cover?" — but the **number is data, not judgment.**

## §8. Open questions

- **Relation vocabulary** — lock the core `rel` set, or keep it open and let the UI handle the common ones?
- **How much does prep cast?** 1–2 NPCs/frontier (lean) vs. a fuller population (richer, more tokens to
  synthesize). Start lean.
- **Codex vs gazetteer** — fully replace gazetteer, or keep gazetteer as the "discovered" view *over* the
  codex? (Leaning: codex is the store; gazetteer becomes a filtered view.)
- **Item depth** — do items need their own roller now, or fold into NPC `want` until §5 tables land?
- **Pre-rolled world cast** — roll a standing cast of N NPCs at world *founding* (not just per session)?
  (Recon's long-term idea; defer.)
