---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
created: 2026-07-06
source: GPT-5.5 outside read §"Outside The Seat" item 2 + §"Seat-Specific Notes" (GPT-5.5-advice-for-Claude/README.md:199, :207-209)
---

# DM-CONTRACT-ARTIFACT — the machine-readable runtime contract (`dm-contract.json`)

**One generated artifact carries the whole DM↔engine contract:** every event type, its
accepted payload fields, its aliases, the source enum, the digest's top-level shape, and one
worked example per event — extracted from the declared registries `src/world/dm.js` already
owns, never hand-copied. Prompts, probes, verify harnesses, and future providers all read the
same file, so the `attitude_shift {id, to:"hostile"}` drift class (a prompt teaching field
names the engine doesn't read — BUG-16/BUG-17) becomes **mechanically impossible to ship
silently**. This is the anti-drift keystone: convert "the prompt author remembered the field
names" (invention) into "the generator copied them" (mechanism).

Zero model calls anywhere in this spec. The only inference-cost delta is ~+0.6 KB on the seat
system prompt (§4), a cache-stable prefix.

---

> **DOCTRINE (2026-07-07, GPT round-2 — Adam-endorsed): the contract boundary owns ALL payload
> normalization.** `dmFoldPayload` + the `DM_EVENT_FIELDS` registry are where aliases AND type
> coercion (numeric today — HQ2-1's `num:` tags; any future enum/date coercion likewise) live,
> exactly once. Handlers receive canonical, typed payloads and never repair their own inputs —
> scattered per-handler coercion is the bug class that produced the clock sign-inversion and the
> "172" grapple total. When a new field class needs repair, extend the registry + fold, never a case.

## §0 Verified current surface (all refs checked 2026-07-06)

The three registries are **already declared data literals** in `src/world/dm.js` — no lifting
refactor is needed for events (the unit's conditional "minimal refactor" applies only to the
digest shape, §3 R1):

| symbol | where | content |
|---|---|---|
| `DM_EVENT_TYPES` | `src/world/dm.js:1218` | 87 event type strings (pure JSON array literal) |
| `DM_EVENT_SOURCES` | `src/world/dm.js:1226` | `["detected","declared","player","branch"]` |
| `DM_EVENT_FIELDS` | `src/world/dm.js:1237–1320` | 81 per-event `{accept:[…], alias:{…}?}` entries; 6 types are whole-payload pass-through (`hire`, `prep_applied`, `capture`, `downtime`, `shrine_omen`, `xp_granted`) |
| `dmFoldPayload` | `src/world/dm.js:1325` | folds aliases → canonical, keeps+warns unknown keys (one `drift` ledger line) |
| `validateEvent` / `validateTurnResponse` | `src/world/dm.js:1348` / `:1361` | envelope gates (unknown types PASS — forward-compatible) |
| `dmDigest` | `src/world/dm.js:270` | returns exactly 21 top-level keys (§3 R1 declares them) |
| alias table (complete, today) | `dm.js` FIELDS entries | `fact_canonized: text→what` · `discovery: name→what` · `clock_advanced`/`clock_fired`: `id→clockId, faction→clockId, by→delta` · `front_closed: clockId→ledgerId, id→ledgerId` · `gift: to→target, item→what` · `epithet_grant: epithet→text` |

**The GPT-flagged consumer to retire:** `seatEventVocabulary` (`src/world/seat.js:181–193`)
derives the vocabulary by **regexing `Function.prototype.toString.call(applyEvent)`** for
`case "x":` lines. GPT-5.5 flags this directly (README.md:199): use `DM_EVENT_TYPES` — the
explicit registry — instead. §3 R2 does that.

**The known drifts (the RED targets, code-verified today):**

- **D-1 (BUG-17):** `dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md:90` teaches
  `attitude_shift {id:"npcId", to:"friendly|neutral|hostile"}`. Handler
  (`dm.js:2573–2582`) reads `p.target` (accept `["cause","target","to"]`, **no `id` alias**)
  and needs int −2…2 (`Number("hostile")||0 → 0`). Verbatim-per-prompt events no-op.
- **D-2 (BUG-16):** prompt line 79 teaches `condition_add`/`condition_remove`
  `{cond:"grappled"}`; the engine reads `condition` (`dm.js:1261–1262`). `cond` is neither
  accepted nor aliased.
- **D-3 (coverage):** the prompt's §"Common event types" (lines 76–96) never teaches
  `cast`/`slot_spent` — the caster-discoverability gap (FABLE-WINDOW-2026-07-06.md Unit S3).
- **D-4 (stale prose):** prompt line 76 claims the engine "SILENTLY DROPS unknown field
  names" — false since the warn-keep fold (`dmFoldPayload` keeps + ledgers drift); and the
  line 81 claim "THERE IS NO `note` FIELD" on `codex_update` is stale (`note` is accepted,
  `dm.js:1276`). Both die when the section becomes generated (§4).

**Build-order dependency:** this unit executes **after** FABLE-WINDOW S1 (BUG-17 repair: `id`
alias + string→int attitude map), S2 (`social_check` `dc` field), and S3 (caster
discoverability) land, in the same executor queue. The generator reads whatever the registries
say at gen time, so S1–S3's accept-list/alias changes flow into the artifact automatically —
no coordination beyond ordering. (If S1–S3 slip, this unit still builds green; the artifact
just records today's contract and regenerates in their merge gates.)

---

## §1 The artifact — `dm-contract.json` (repo root)

**Location:** repo root, beside the precedent generated-JSON artifacts `table-registry.json`
and `tables.json`. Committed **and** generated — never hand-edit (same law as `tables.json`).

**Exact schema (top-level keys, all always present):**

```json
{
  "contractVersion": 1,
  "generatedBy": "build/gen-dm-contract.py",
  "sourceOfTruth": "src/world/dm.js",
  "eventSources": ["detected", "declared", "player", "branch"],
  "defaultSource": "declared",
  "envelope": {
    "required": { "type": "string (non-empty)" },
    "optional": {
      "payload": "object (non-array)",
      "source": "one of eventSources",
      "ledgerRefs": "array"
    },
    "note": "validateEvent (src/world/dm.js:1348) — a well-formed event with an UNKNOWN type still passes (unknownType flag; applyEvent no-ops it). Forward-compatible by design."
  },
  "turnResponse": {
    "seatRequired": ["narration", "events"],
    "optional": ["rollRequest", "ask", "gen", "dmNotes", "turnId"],
    "note": "validateTurnResponse (dm.js:1361) is NON-BLOCKING (applies what's valid); the seat's own gate (seat.js SEAT_REQUIRED_KEYS) hard-requires narration+events."
  },
  "unknownFieldPolicy": "kept + console.warn + one drift ledger line (kind:payload-drift) — never dropped (dmFoldPayload, dm.js:1325)",
  "unknownTypePolicy": "well-formed unknown types pass validateEvent and no-op in applyEvent (forward-compatible)",
  "digest": {
    "topLevelKeys": ["worldId","worldName","clock","location","setting","pc","powers","fronts","recentLedger","gazetteer","codex","codexRoster","minted","revealed","sessionLean","tarot","activeWalk","combat","prepPending","levelUp","arrivalBrief"],
    "notes": { "<key>": "one-line description (generator's DIGEST_NOTES, §2)" }
  },
  "events": {
    "<type>": {
      "fields": ["…"],
      "aliases": { "<alias>": "<canonical>" },
      "valueNotes": { "<field>": "…" },
      "example": { "type": "<type>", "payload": { } }
    }
  }
}
```

Per-event rules:

- `fields` is the verbatim `accept` list for the 81 mapped types; **`null`** for the 6
  pass-through types (meaning: payload passes unjudged to the handler — `dmFoldPayload`
  returns it untouched).
- `aliases` is the verbatim `alias` map (or `{}`).
- `valueNotes` present only where the generator's `VALUE_NOTES` table (§2) has an entry.
- `example` is the generator's `EXAMPLES` entry (§5) — **canonical field names only, never
  aliases**; validated at gen time (§2 hard-fail 3) and at runtime (§6 section C).

**Explicit v1 non-goals (decided, not deferred-by-omission):** no per-field type schema
(the example is the type witness; `valueNotes` covers the known traps); no per-event
"usual source" column (that narrative lives in docs/EVENT-CONTRACT.md — copying it here
would create a second prose source to drift); no digest sub-shapes (DIGEST-DIET.md owns
those; the contract pins only the top-level key set).

---

## §2 The generator — `build/gen-dm-contract.py`

Python 3, stdlib only, executable, same CLI convention as `build/gen-table-registry.py`:
**no flag = check mode** (report + nonzero exit on drift, writes nothing), `--emit` writes.

### Extraction strategy (DECIDED — the unit's fork)

**Parse the three declared const literals out of `src/world/dm.js` source text. NEVER parse,
regex, or evaluate `applyEvent`'s body** (the GPT-flagged fragility — minification/refactor
breaks it; the declared registries are the maintained truth and `dev/verify-dm-seam.mjs:99–121`
already enforces registry↔switch parity, so the switch adds no information).

Algorithm, per symbol (`DM_EVENT_TYPES`, `DM_EVENT_SOURCES`, `DM_EVENT_FIELDS`,
`DM_DIGEST_KEYS` — the last added by §3 R1):

1. Find the line matching `^const <NAME> = ` (exactly one occurrence; 0 or 2+ ⇒ exit 2).
2. Balanced-scan from the opening `[`/`{` to its matching closer, **string-aware** (bracket
   depth ignores brackets inside `"…"`/`'…'` literals). This survives any future
   reformatting (one-line → multi-line) — no line-shape assumptions.
3. JS-literal → JSON transform, in order: (a) strip `//` comments outside string literals;
   (b) quote bare identifier keys — regex `([{,\[]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:` →
   `\1"\2":`, applied outside string literals only; (c) strip trailing commas before `}`/`]`.
4. `json.loads`. **Any failure ⇒ exit 2** printing the symbol name + a ≤200-char snippet at
   the failure offset. The generator must never emit a partial/guessy artifact.

### Generator-held tables (in the .py, each validated at gen time)

These live in the generator, not dm.js, because each is **validated against the parsed
source on every run** — they cannot drift silently, and they keep dm.js free of doc freight:

- `EXAMPLES` — dict of 87 entries, §5 verbatim. Hard-fails below keep it complete/correct.
- `VALUE_NOTES` — exactly these 9 entries (field must exist in that event's accept list —
  validated):
  - `attitude_shift.to`: "int −2…2 (Hostile −2 … Helpful +2); strings hostile/unfriendly/neutral/indifferent/friendly/helpful accepted post-S1"
  - `attitude_shift.target`: "codex id from the digest (post-S1 `id` is an accepted alias)"
  - `clock_advanced.clockId`: "copy digest `powers[].clockId` / `fronts[].clockId` verbatim"
  - `item_changed.removeIds`: "instance ids, never names"
  - `condition_add.condition`: "the condition name — the field is `condition`, `cond` is not read"
  - `check.d20`: "the PLAYER's own open roll — the engine never rolls the player's dice"
  - `codex_update.note`: "APPENDS to dm.notes[] (DM-only)"
  - `distant_word` → keyed as `"_payload"`: "empty {} by design (anti-invention); a supplied text warns loud" (the one field-less note; renderer prints it as the event's note)
  - `xp_granted` → `"_payload"`: "no-op by design — XP is the engine's job (DM-CHARTER §8.3b)"
- `DIGEST_NOTES` — 21 one-liners keyed by digest key (keys must set-equal parsed
  `DM_DIGEST_KEYS` — validated). Content: one clause each, e.g. `"combat": "present only while
  GS.combat.active — foe HP coarse words, never numbers"`, `"tarot": "session draw, DM-only"`,
  `"fronts": "pressure clocks incl. dmOnly truths"`. Executor writes all 21 from the inline
  comments already sitting in `dmDigest` (dm.js:270–374); no invention needed.
- `PROMPT_TAUGHT` (⚠ PROVISIONAL — the one taste call in this spec; recommended default
  below, Adam may trim/extend at skim): the 24 types the prompt §events section teaches:
  `hp_changed, temp_hp, condition_add, condition_remove, check, cast, slot_spent,
  concentration_broken, rest, item_changed, equip, attitude_shift, social_check, gift,
  codex_add, codex_update, codex_link, codex_reveal, codex_contact, discovery,
  fact_canonized, clock_advanced, stage_fx, combat_start`. (Everything else stays engine/
  digest-driven or rare enough to live in docs; the prompt diet holds.)
- `PROMPT_TARGETS` — `["dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md",
  "docs/SEAT-PROMPT.md"]`. First = the live bridgeless-rig prompt (Sella/Rennick continuity).
  Second = the future seat prompt (`src/world/seat.js:23` `SEAT_PROMPT_PATH`) — **absent
  today: skip with a printed note, exit unaffected** (edge E-4).

### Gen-time hard-fails (all exit 2 with the offending name printed)

1. Any `DM_EVENT_TYPES` member missing from `EXAMPLES` — adding an event **forces** adding
   its example.
2. Any `EXAMPLES` key not in `DM_EVENT_TYPES` (a zombie example).
3. For mapped types: any example payload key ∉ `accept` (examples are canonical — aliases
   are also rejected here, deliberately).
4. Any `DM_EVENT_FIELDS` key ∉ `DM_EVENT_TYPES` (mirrors the ROOT-B probe).
5. Any alias key that is also in the same event's `accept` list (collision).
6. Duplicate entries in `DM_EVENT_TYPES` (set size ≠ list length).
7. A `PROMPT_TARGETS` file that **exists but lacks the splice markers** (§4) — the message
   names the file and prints the two marker lines to add.
8. `VALUE_NOTES`/`DIGEST_NOTES` key validation as above.

### Modes & output

- **check (default):** regenerate in memory; byte-compare against committed
  `dm-contract.json` (missing ⇒ fail) **and** against each existing prompt target's spliced
  region. Clean ⇒ print `dm-contract: clean (87 events)` exit 0; drift ⇒ print a unified
  diff summary, exit 1.
- **`--emit`:** write `dm-contract.json` (2-space indent, sorted event keys, trailing
  newline — byte-deterministic) + splice prompt regions (§4). Print exactly:
  `dm-contract.json: 87 events (81 field-mapped, 6 pass-through), 4 sources, 21 digest keys; prompts spliced: 1, skipped-absent: 1`
  (counts computed, not hardcoded — they are the acceptance numbers while the registry holds
  87/81/6/4/21; S2's `dc` add changes no count).

---

## §3 Minimal source refactors (the only game-code edits in this unit)

### R1 — declare the digest shape: `DM_DIGEST_KEYS` (src/world/dm.js)

The digest's top-level shape currently exists only inside `dmDigest`'s return literal
(dm.js:270–374) — a function body, which the generator must not parse. Lift the **key list**
(not the values) into a declared table, the same pattern as `DM_EVENT_TYPES`:

**Before** (dm.js:270): `function dmDigest(){` with no adjacent registry.
**After** — insert immediately above `function dmDigest(){`:

```js
// The digest's top-level shape — the declared twin of dmDigest()'s return literal (every key
// below is ALWAYS present in the return object; many are null on a common turn). Machine truth
// for build/gen-dm-contract.py; parity with the live return object is enforced by
// dev/verify-dm-contract.mjs (add a key to dmDigest ⇒ add it here, the guard fails otherwise).
const DM_DIGEST_KEYS = ["worldId","worldName","clock","location","setting","pc","powers","fronts","recentLedger","gazetteer","codex","codexRoster","minted","revealed","sessionLean","tarot","activeWalk","combat","prepPending","levelUp","arrivalBrief"];
```

(21 keys — verified against the return literal: the `codexDigest` spread contributes exactly
`codex`+`codexRoster` in both its scoped and fallback branches, `src/world/codex.js:381–392`.)

**manifest.json:** add `"DM_DIGEST_KEYS"` to `world.dm`'s `owns` array (before:
`…"dmDigest",…` list without it; after: with it). Then `python3 build/check-manifest.py` → OK.

### R2 — retire the toString-regex: `seatEventVocabulary` (src/world/seat.js:181–193)

**Before** (verbatim today): caches `Function.prototype.toString.call(applyEvent)` scanned by
`/case\s+"([a-zA-Z0-9_]+)"\s*:/g`.

**After** — same name, same signature (the `force` param stays, now a no-op kept for API
compatibility with `dev/verify-seat.mjs:155`'s `seatEventVocabulary(true)` call):

```js
/* docs/DM-CONTRACT-ARTIFACT.md §3 R2: the vocabulary IS the declared registry. DM_EVENT_TYPES
   (src/world/dm.js) is the single source of truth, already parity-guarded against applyEvent's
   switch by dev/verify-dm-seam.mjs — deriving it a second time by regexing applyEvent's source
   (the old implementation) was the drift-prone duplicate GPT-5.5 flagged (breaks under bind/
   minification/refactor; the registry doesn't). `force` kept for call-site compatibility. */
function seatEventVocabulary(force){
  return (typeof DM_EVENT_TYPES !== "undefined" && Array.isArray(DM_EVENT_TYPES)) ? DM_EVENT_TYPES.slice() : [];
}
```

Delete `_seatEventVocabCache` (remove `"_seatEventVocabCache"` nowhere — it is not in
manifest owns; only the `let` line goes). `seatValidate` (seat.js:227–243) needs no edit —
it already consumes `seatEventVocabulary()`.

### R3 — verify-seat.mjs test update (dev/verify-seat.mjs:150–160)

**Before:** `check("event vocabulary is derived (non-empty) from applyEvent's own source",
Array.isArray(vocab) && vocab.length > 20, …)`.
**After** — two checks replace it (the `>20` check could never catch a partial list):

1. `"event vocabulary set-equals DM_EVENT_TYPES (87)"` — set equality against
   `win.DM_EVENT_TYPES` (expose it via the harness's `expose` string, same trick as
   `dev/verify-dm-seam.mjs:33`) **and** `vocab.length === win.DM_EVENT_TYPES.length`.
2. **RED-FIRST mutation check** proving the old fragility is gone:
   `win.eval("applyEvent = applyEvent.bind(null)")` (a bound function's `toString()` is
   `function () { [native code] }` — zero `case` lines), call `seatEventVocabulary(true)`,
   assert it **still returns 87**. Against un-refactored code this returns `[]` → the check
   is RED; after R2 it is GREEN. (This is the mutation that shows the value MOVED from
   `0 → 87`, not a label assertion.)

Keep the existing known-type/unknown-type/`seatValidate`-drop checks unchanged.

---

## §4 Prompt generation — killing the drift class at the source

The `### Common event types` section of every DM seat prompt becomes a **generated region**:

```
<!-- DM-CONTRACT:EVENTS:BEGIN (generated by build/gen-dm-contract.py — do not hand-edit this region) -->
…generated section…
<!-- DM-CONTRACT:EVENTS:END -->
```

Splice rule: the generator rewrites **only** the bytes between the markers; everything else
in the prompt (voice, agency, danger doctrine) stays hand-authored. Markers are matched
line-anchored, tolerating a trailing `\r`. A target file existing without markers ⇒ gen-time
hard-fail 7 (one-time manual step: the executor adds the markers around the existing
lines 76–96 of the sella prompt as part of this unit's build, replacing that hand-written
section).

**Generated section content (exact template):**

Header line:
`### Common event types — EXACT payload field names (generated from dm-contract.json; unknown field names are KEPT but flagged as drift — they usually mean the engine ignored your intent, so use these names precisely)`

Then one line per `PROMPT_TAUGHT` member, in `PROMPT_TAUGHT` order:

``- `<type>` — fields: `f1`, `f2`, … — e.g. `{"type":"<type>","payload":{…example…}}` ``
with, when present: `` (aliases accepted: `a`→`f1`)`` and each `valueNotes` clause appended
as `` — <field>: <note>``.

Fixed footer (verbatim, after the taught lines):

```
- Do NOT emit `xp_granted` — it is a no-op by design. XP is the engine's job; you narrate beats.
- Ids are never invented: copy `clockId` from the digest's `powers[]`/`fronts[]`, item ids from `pc.inventory[].id`, codex ids from `codex`/`codexRoster`.
- Every other event type in the engine's vocabulary also works (dm-contract.json is the full list); emit any event whose fields you know from this contract. If nothing mechanical happened, `events: []`. Never invent a die — emit a `rollRequest` instead.
```

**Worked before→after (the drift-class site, sella prompt line 90):**

Before (hand-written, wrong twice):
`` - `attitude_shift` `{payload:{id:"npcId", to:"friendly|neutral|hostile"}}`. ``

After (generated, canonical, assuming S1's alias landed):
`` - `attitude_shift` — fields: `target`, `to`, `cause` (aliases accepted: `id`→`target`) — e.g. `{"type":"attitude_shift","payload":{"target":"npc:maddan-strole","to":1,"cause":"returned the ledger"}}` — to: int −2…2 (Hostile −2 … Helpful +2); strings hostile/unfriendly/neutral/indifferent/friendly/helpful accepted post-S1 ``

Size discipline (SPEED doctrine): 24 generated lines + footer ≈ 3.4 KB vs today's ≈ 2.8 KB
hand section → **~+0.6 KB on the seat/system prompt**, a byte-stable cache prefix (seat.js §2
discipline unaffected). Declared cost delta: zero model calls; ~+150 prompt tokens/session.

---

## §5 The examples table (87 — the generator's `EXAMPLES` dict, verbatim)

Canonical fields only. These are **contract-vocabulary witnesses**: the guard folds them
through the real `dmFoldPayload` (§6 C) — it does **not** run them through `applyEvent`
handlers (that would need per-event staged state; explicitly out of scope, ruling E-9).
Payloads below are the exact JSON the executor copies into the dict.

| type | example payload |
|---|---|
| hp_changed | `{"delta":-4}` |
| death_save | `{"d20":14}` |
| temp_hp | `{"n":5}` |
| combat_start | `{"foes":[{"name":"Wolf","count":2,"cr":"1/4"}],"scene":"moonlit tree line"}` |
| combat_end | `{"outcome":"resolved"}` |
| attack | `{"d20":17,"targetAC":13,"attackIndex":0}` |
| action | `{"kind":"Dodge"}` |
| opportunity_attack | `{"foe":"f1"}` |
| move_zone | `{"who":"pc","band":"Melee","dash":false}` |
| grapple | `{"target":"f1","d20":12,"bonus":5}` |
| shove | `{"target":"f1","d20":9,"bonus":5,"intent":"prone"}` |
| hazard_tick | `{"kind":"fall","feet":20}` |
| slot_spent | `{"level":1}` |
| cast | `{"spell":"Charm Person","level":1,"concentration":true}` |
| concentration_start | `{"spell":"Charm Person"}` |
| concentration_broken | `{"cause":"damage-save-failed"}` |
| resource_spent | `{"key":"rage"}` |
| rest | `{"kind":"short"}` |
| item_changed | `{"add":[{"name":"Dagger","qty":1}],"gold":-2}` |
| item_split | `{"itemId":"it-12","qty":5}` |
| item_use | `{"itemId":"it-7"}` |
| charge_spend | `{"itemId":"it-3","n":1}` |
| charge_restore | `{"itemId":"it-3"}` |
| condition_add | `{"target":"pc","condition":"frightened","ttl":{"rounds":2}}` |
| condition_remove | `{"target":"pc","condition":"frightened"}` |
| item_rust_exposure | `{"kind":"rain-combat"}` |
| condition_expired | `{"target":"pc","condition":"frightened"}` |
| round_tick | `{"phase":"end","round":2}` |
| foe_morale | `{"foe":"f1","trigger":"half-hp"}` |
| foe_action | `{"foe":"f1"}` |
| equip | `{"itemId":"it-2","slot":"mainHand"}` |
| unequip | `{"slot":"offHand"}` |
| set_grip | `{"grip":"2h"}` |
| attune | `{"itemId":"it-9"}` |
| unattune | `{"itemId":"it-9"}` |
| fact_canonized | `{"what":"The harbor bell rings itself before a drowning."}` |
| codex_add | `{"kind":"npc","name":"Maddan Strole","fields":{"role":"netmender"},"dm":{"wants":"the splinter"}}` |
| codex_link | `{"from":"npc:maddan-strole","rel":"fears","to":"faction:the-hooks"}` |
| codex_update | `{"id":"npc:maddan-strole","dm":{"tell":"watches the fist not the face"}}` |
| codex_reveal | `{"id":"npc:maddan-strole"}` |
| codex_contact | `{"id":"npc:maddan-strole"}` |
| social_check | `{"target":"npc:maddan-strole","skill":"Persuasion","total":18,"natural":14,"lever":"debt"}` |
| attitude_shift | `{"target":"npc:maddan-strole","to":1,"cause":"returned the ledger"}` |
| morale_check | `{"creature":"f1","trigger":"leader-down"}` |
| parley_open | `{"creature":"f1","want":"food","openingAttitude":-1}` |
| insight_read | `{"target":"npc:maddan-strole","total":16,"dc":14}` |
| discovery | `{"what":"The Traitor's Tree","makeNode":true}` |
| clock_advanced | `{"clockId":"the-hooks","delta":1}` |
| clock_fired | `{"clockId":"the-hooks","forPlayer":false}` |
| front_closed | `{"ledgerId":"harbor-smugglers","how":"records burned"}` |
| encounter_resolved | `{"foes":[{"cr":"1/4","victimClass":"monster"}],"method":"stealth","outcome":"bypassed"}` |
| kill | `{"victimClass":"monster","cr":"1/2"}` |
| claim_deed | `{"deedRef":"led-88","factionKey":"the-hooks","weight":2}` |
| gift | `{"target":"npc:maddan-strole","what":"ironwood splinter","weight":1}` |
| epithet_grant | `{"text":"the Seam"}` |
| hire | `{"codexId":"npc:corran-vale","role":"guide","wage":2}` *(pass-through; fields per `hireCompanion`, src/world/companions.js:41)* |
| dismiss | `{"hirelingId":"h-1"}` |
| tend_pet | `{"target":"npc:ash-hound"}` |
| companion_update | `{"hirelingId":"h-1","action":"levelSync","pcLevel":4}` |
| recruit_creature | `{"codexId":"npc:ash-hound","role":"pet"}` |
| choice_logged | `{"weight":"major","forecloses":["the-hooks-truce"]}` |
| inspiration_granted | `{"pc":"Sella Voss","reason":"honored the taboo at cost"}` |
| inspiration_spend | `{"on":"check","d20b":17}` |
| check | `{"kind":"skill","key":"Stealth","dc":15,"d20":11}` |
| crit_outcome | `{"natural":20,"magnitude":9,"tier":"amplified","scope":"scene","lenses":[]}` |
| stage_fx | `{"verb":"lunge","who":"f1","note":"the wolf lunges the gap"}` |
| adjudication | `{"situation":"rope cut mid-climb","ruling":"DEX save 12 or fall to the ledge","precedentId":"adj-3"}` |
| level_applied | `{"pc":"Sella Voss","from":3,"to":4}` |
| prep_applied | `{"frontiers":[]}` *(pass-through; payload = the synthesis result `applyPrep` consumes, src/world/prep.js:313)* |
| prep_contact | `{"nodeId":"n-14","enter":true}` |
| walk_advance | `{"toSeg":2}` |
| walk_update | `{"seg":2,"overlay":{"effectDie":8,"rolledFace":3}}` |
| walk_complete | `{}` |
| capture | `{}` *(pass-through; all fields script-filled from live state, src/world/capture.js:148)* |
| chase_start | `{"npcId":"npc:rook","terrain":"rooftops"}` |
| chase_round | `{"pursuerWon":true}` |
| chase_yield | `{"side":"quarry"}` |
| downtime | `{"intent":"work"}` *(pass-through)* |
| distant_word | `{}` |
| shrine_omen | `{}` *(pass-through)* |
| xp_granted | `{}` *(pass-through; no-op by design)* |
| open_shop | `{"archetype":"provisioner","name":"Brindle's","tier":2}` |
| district_mint | `{"nodeId":"n-2","tier":2}` |
| building_approach | `{"nodeId":"n-2","buildingType":"tavern","name":"The Gulls' Rest","tier":2}` |
| building_contact | `{"id":"bld-7"}` |
| job_board_read | `{"nodeId":"n-2","tier":2}` |
| job_accept | `{"postingId":"job-2"}` |

---

## §6 The drift guard — `dev/verify-dm-contract.mjs`

Same harness pattern as `dev/verify-dm-seam.mjs` (jsdom from `JSDOM_HOME` ∥
`~/.genesis-jsdom`; manifest `loadOrder` sources const-via-eval into one scope; `expose`
string surfaces `DM_EVENT_TYPES`, `DM_EVENT_SOURCES`, `DM_EVENT_FIELDS`, `DM_DIGEST_KEYS`,
`dmFoldPayload`, `dmDigest`, `seatEventVocabulary`, `seatValidate` onto `window`). Stage ONE
founded world (reuse verify-dm-seam's world-staging approach) for the digest/ledger checks.

**Three-way agreement, as check sections (exact counts):**

- **A. artifact ↔ generator (2 checks):**
  A1 `execFileSync("python3", ["build/gen-dm-contract.py"])` exits 0 (check mode clean —
  regenerating from source reproduces the committed artifact byte-identically).
  A2 `dm-contract.json` parses and `contractVersion === 1`.
- **B. artifact ↔ runtime (4 checks):**
  B1 `Object.keys(contract.events)` set-equals `window.DM_EVENT_TYPES`, both length 87.
  B2 `contract.eventSources` deep-equals `DM_EVENT_SOURCES`.
  B3 `Object.keys(dmDigest())` on the staged world set-equals `contract.digest.topLevelKeys`
  (21) **and** set-equals `DM_DIGEST_KEYS`.
  B4 for every mapped event, `contract.events[t].fields` deep-equals
  `DM_EVENT_FIELDS[t].accept` and `aliases` deep-equals `alias||{}`; the 6 pass-through
  carry `fields: null`.
- **C. examples fold clean (88 checks):**
  C1–C87 per event: record `ledgerOf(w).length`, run
  `dmFoldPayload(w, {type, payload: contract.events[type].example.payload})`, assert **zero
  new ledger lines** (no `payload-drift`) and, for pass-through types, that the returned
  object deep-equals the input payload.
  C88 **mutation assertion (the BUG-01 lesson — assert the detector MOVES):** fold
  `{type:"hp_changed", payload:{delta:-1, zzz_bogus:1}}` and assert ledger length grew by
  **exactly 1** with a line whose `data.kind === "payload-drift"` and `data.keys` deep-equals
  `["zzz_bogus"]` — value-level, not label-level.
- **D. artifact ↔ prompt (3 checks per existing PROMPT_TARGET; sella prompt only today = 3):**
  Region = between the splice markers; **pre-splice fallback** (the RED phase): from the line
  matching `^### Common event types` to the section's end (next `^###` or EOF). Scanner:
  - *Taught types:* per `^- ` line, the first backtick token (plus the second when joined by
    `` ` / ` ``) matching `/^[a-z][a-z0-9_]*$/`.
  - *Fields:* per taught line, take the substring from the first `{` to the last `}`, strip
    quoted strings (`/"[^"]*"/g`), then collect identifier-before-colon names at **brace
    depth 1 relative to the `payload` object only** (depth-tracked scan; nested `dm:{…}`/
    `fields:{…}` interiors are open key-value by contract and are NOT validated).
  D1 every taught type ∈ `contract.events`.
  D2 every collected field ∈ `fields ∪ aliasKeys` of its taught type(s) (pass-through types
  skipped).
  D3 `REQUIRED_TAUGHT = ["cast","slot_spent","attitude_shift","hp_changed","codex_update","clock_advanced","fact_canonized","discovery","condition_add"]`
  ⊆ taught set.
- **E. seat consumer (2 checks):**
  E1 `seatEventVocabulary()` set-equals `DM_EVENT_TYPES`, length 87 — **after**
  `win.eval("applyEvent = applyEvent.bind(null)")` (the R3 mutation: proves the vocabulary no
  longer depends on `applyEvent`'s source text).
  E2 `seatValidate({narration:"t", events:[{type:"hp_changed",payload:{delta:-3}},{type:"totally_made_up",payload:{}}]})`
  → `kept.length === 1 && dropped.length === 1` (values moved, not just ok-flag).

**Final line (the acceptance number):** `verify-dm-contract: 99/99 green`, exit 0.
(2 + 4 + 88 + 3 + 2 = 99.)

### RED-FIRST demonstrations (mandatory executor order — run and capture each failure before fixing)

Build the harness **first**, run it against un-modified master at each stage, and record the
red output in the branch's verify log:

| stage | expected RED (exact) |
|---|---|
| 1. harness only, no generator/artifact | A1+A2 fail (`dm-contract.json` missing) — plus B/C/E fail on missing artifact/`DM_DIGEST_KEYS`. Baseline red. |
| 2. + generator emitted, **before** the prompt splice (today's hand-written sella §events) | D2 fails with exactly **3 findings**: `attitude_shift` field `id` (line 90 — D-1/BUG-17); `condition_add` field `cond` and `condition_remove` field `cond` (line 79 — D-2/BUG-16). D3 fails with exactly **2 missing**: `cast`, `slot_spent` (D-3/S3 gap). |
| 3. + R2 not yet applied | E1 RED: after the `bind(null)` mutation the old regex derivation returns `[]` → set-equality fails `0 ≠ 87` (the value moved to zero — the fragility, demonstrated). |
| 4. R1 not yet applied | B3 RED: `DM_DIGEST_KEYS` undefined. |

All green only when generator + artifact + splice + R1 + R2 + R3 have landed (and, for D2's
`attitude_shift` line to render with the `id` alias, S1 has landed first — the declared
build-order dependency, §0).

### Probe-rig consumer (one addition, `dev/playtest-bug-probes.mjs`)

Add `probe("CONTRACT-1", "dm-contract.json examples fold clean through the live dmFoldPayload (contract↔runtime agreement)")`
— loads the artifact, folds all 87 examples (same as §6 C1–C87, condensed to one probe),
expects `PASS (87/87 examples fold clean)`. No existing probe is edited.

---

## §7 Edge cases (enumerated rulings)

- **E-1 registry reformatting** (one-line → multi-line, added comments): handled by the
  string-aware balanced scan + comment strip; if the transform still can't `json.loads`,
  the generator exits 2 with a snippet — **never** emits a guess.
- **E-2 new event type without an example:** gen hard-fail 1. The failure message is the
  maintenance contract: "add EXAMPLES['<type>'] to build/gen-dm-contract.py".
- **E-3 prompt teaches a not-yet-built type:** D1 fails. Ruling: prompts teach **live**
  vocabulary only; forward-compatible types enter the prompt only after they enter
  `DM_EVENT_TYPES`.
- **E-4 `docs/SEAT-PROMPT.md` absent** (true today, seat.js:18–21): generator prints
  `skipped (absent): docs/SEAT-PROMPT.md` and continues, exit unaffected. When the
  frontier-authored seat prompt lands (DM-SEAT.md §5 item 4), its author adds the markers and
  the same generator owns its §events from day one.
- **E-5 target exists, markers missing:** hard-fail 7 (prints the marker lines). Prevents a
  silent un-spliced prompt from masquerading as generated.
- **E-6 alias/accept collision, duplicate types, zombie examples:** hard-fails 5/6/2.
- **E-7 `distant_word` (accept `[]`):** rendered in prompt/contract as
  `fields: (none — empty payload by design)`; its example `{}` folds clean (empty accept
  list + empty payload = no drift keys).
- **E-8 S1/S2/S3 land after this unit's artifact was emitted:** their accept-list/alias
  edits make check-mode exit 1 in *their* merge gates → regen `--emit` + commit is part of
  their landing checklist. This is the guard working, not a conflict. (Fable adds one line to
  each of S1–S3's acceptance: `python3 build/gen-dm-contract.py --emit` after the dm.js edit,
  if this unit lands first — see Registry updates.)
- **E-9 examples are folded, never applied:** running `applyEvent` per example would need 87
  staged world states (combat live, walk active, shop minted…). Out of scope — handler
  behavior is owned by the existing per-system verify harnesses; **this** guard owns
  vocabulary/shape agreement. Decided, not deferred.
- **E-10 live session safety:** never run `--emit` during a live bridge playtest — a
  mid-session prompt splice changes DM behavior between turns (same family as the
  verify-bridge/.dm mailbox gotcha). Check mode is always safe.
- **E-11 jsdom missing:** harness exits 2 with the CLAUDE.md install hint
  (`npm i jsdom` in `~/.genesis-jsdom`), matching verify-dm-seam's convention.

---

## §8 Don't-touch list

- **Generated — never hand-edit:** `tables.json`, `tables.js`, `data/bestiary.js`,
  `data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js`,
  `table-registry.json`, and (from this unit on) **`dm-contract.json`** + every
  `DM-CONTRACT:EVENTS` spliced region. Spec generator edits only.
- **Do not reformat or reorder `DM_EVENT_FIELDS` / `DM_EVENT_TYPES`** as part of this unit —
  the generator must prove itself against the file as it stands.
- **Do not touch** `dev/dm-bridge.py`, `docs/DM-BRIDGE.md`, the `.dm/` mailbox, or any
  `dev/playtest-saves/*/state.json`. The ONLY playtest-saves edit permitted is the
  marker-splice inside `sella-shimmering-maw/DM-SEAT-PROMPT.md`.
- **Do not edit** `applyEvent`'s switch, any event handler, `dmFoldPayload`,
  `validateEvent`, or `dmDigest`'s return values — this unit adds one const (R1) and rewrites
  one seat function (R2). Handler changes belong to S1/S2/S3.
- Adam's hand-authored Engine tables: untouched (this unit never enters `Engine/`).

---

## §9 Acceptance (command + expected output, in run order)

| # | command | expected |
|---|---|---|
| 1 | `python3 build/gen-dm-contract.py` (pre-emit, red) | exit 1, `dm-contract.json missing` |
| 2 | `python3 build/gen-dm-contract.py --emit` | exit 0, prints `dm-contract.json: 87 events (81 field-mapped, 6 pass-through), 4 sources, 21 digest keys; prompts spliced: 1, skipped-absent: 1` |
| 3 | `python3 build/gen-dm-contract.py` | exit 0, `dm-contract: clean (87 events)` |
| 4 | `python3 -c "import json;c=json.load(open('dm-contract.json'));print(len(c['events']), sum(1 for e in c['events'].values() if e['fields'] is None), len(c['digest']['topLevelKeys']))"` | `87 6 21` |
| 5 | `python3 build/check-manifest.py` | OK, exit 0 (after the R1 owns edit) |
| 6 | `node dev/verify-dm-contract.mjs` | `verify-dm-contract: 99/99 green`, exit 0 |
| 7 | `node dev/verify-seat.mjs` | exit 0, incl. the two R3 replacement checks green (vocab = 87 under the bind mutation) |
| 8 | `node dev/verify-dm-seam.mjs` | exit 0 (untouched — proves R1/R2 broke nothing) |
| 9 | `node dev/playtest-bug-probes.mjs` | existing probe statuses unchanged + `CONTRACT-1 … PASS (87/87 examples fold clean)` |

Plus the four staged RED captures from §6 logged in the branch before their fixes land.

**Blind-playable parity:** no player-facing visual surface exists in this unit —
`dm-contract.json` is machine-facing and the prompt splice is DM-facing text. The prose-twin
obligation is N/A (stated, not skipped).

**Inference cost declaration (SPEED doctrine):** zero model calls in generator, guard, splice,
or any runtime path; ~+0.6 KB (+~150 tokens) on the seat system prompt, cache-prefix-stable.

**Executor sizing:** one Sonnet executor, size **M** (generator ≈250 lines Python, harness
≈300 lines, two surgical source edits, one test edit, one probe add, one prompt splice).
Effort: medium. Branch: `feat/dm-contract-artifact`, merged `--no-ff` after Opus re-gates
every acceptance row independently (never trust self-reported green).

---

## Registry updates

*(Fable applies these — the executor does NOT edit these files.)*

- **docs/DESIGN.md** (decision registry, new line): `DM-CONTRACT-ARTIFACT (locked 2026-07-06): dm-contract.json (repo root, generated by build/gen-dm-contract.py from dm.js's declared registries — literals parsed, applyEvent's body never regexed) = the one machine truth for event types/fields/aliases/sources/digest shape + 87 worked examples; seat prompts' §events sections are generated regions; seatEventVocabulary reads DM_EVENT_TYPES (toString-regex retired per the GPT-5.5 read); three-way drift guard dev/verify-dm-contract.mjs (99 checks). Build deferred → post-Fable queue, after FABLE-WINDOW S1–S3.`
- **docs/NEXT-STEPS.md**: add to the deferred build queue, ordered AFTER units S1–S3: `DM-CONTRACT-ARTIFACT (docs/DM-CONTRACT-ARTIFACT.md, M) — generator + artifact + prompt splice + 99-check drift guard; depends on S1 (attitude alias), S3 (cast/slot_spent taught).`
- **docs/README.md** (docs index): add `DM-CONTRACT-ARTIFACT.md — type: system-spec — the generated machine-readable DM↔engine contract (dm-contract.json) + its drift guard.`
- **docs/EVENT-CONTRACT.md** (header, one line under the title): `Machine twin: dm-contract.json (generated — build/gen-dm-contract.py; see docs/DM-CONTRACT-ARTIFACT.md). This doc stays the narrative source; the JSON is the runtime/tooling truth.`
- **docs/DM-SEAT.md §3 item 2** (dm-seat.md:88–90, the "vocabulary derived at runtime from applyEvent's dispatch" line — supersession note): `Vocabulary derivation updated by DM-CONTRACT-ARTIFACT §3 R2: seatEventVocabulary reads the DM_EVENT_TYPES registry directly (the applyEvent.toString() scan is retired).`
- **docs/FABLE-WINDOW-2026-07-06.md** (units S1–S3, one shared line): `Landing checklist addendum: if DM-CONTRACT-ARTIFACT has built first, run python3 build/gen-dm-contract.py --emit after the dm.js/prompt edits and commit the regenerated artifact (the drift guard will otherwise fail your merge gate — by design).`
