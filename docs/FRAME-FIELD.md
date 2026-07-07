---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
---

# FRAME-FIELD — the frame-field schema (per-variant stat/mechanics chassis for pooled rows)

> **⚠ WHOLE-DOC PROVISIONAL.** Adam delegated this design to Fable on 2026-07-06 ("Frame-field
> schema" quick pick, FABLE-WINDOW-2026-07-06.md §Rulings item 5). Adam skims and can veto the
> artifact; nothing here is his taste ruling until he does. The §6 Frontier/Noir rows are
> PROVISIONAL *content* on top of a PROVISIONAL *schema*. Everything else in the doc is
> engineering fact, verified against the tree on 2026-07-06.

## §0 What this locks, and the exact blocker it dissolves

**The blocker (verbatim from merge `46bcd62`, 2026-07-03):**

> Frontier and Noir are BLOCKED, not applied: both proposals assign per-variant Frame values that
> conflict within a single row's one Frame cell — the table schema has no per-variant Frame field,
> so applying either verbatim would require inventing table structure not in the approved proposal.

State of the tree today (all verified):

- 11 realm item tables (`Engine/03. _Tables/05. Realms/Realm Items - *.md`, ids
  `realm-items-*`) use the columns `| d50 | Band | Item | Frame | Ranks | Note |`. Frame = an id
  resolvable in `data/items.js` ("frameless would be a spec bug" per each table's own frontmatter).
- All 11 row-27 Mythic entries are **gateway d4 pools** ("roll d4:" + 4 numbered variants). The 9
  Adam-approved pools landed via `feat/realm-mythic-pools` (merge `46bcd62`); Frontier + Noir got
  interim pools in review pass 2 (`3666340`) with the per-variant frames **flattened to one cell
  value** — Frontier's homestead patent / golden spike / marshal's commission all currently
  resolve as `pistol`; Noir's key / record / map all as `robe`. That flattening is the live bug
  this schema removes.
- The Frame cell compiles to `cells[2]` of the row's cells array (`tables.json`, read at runtime by
  `rollTable` in `src/engine/compiled.js:16-23`, which returns `cells: row[5]||null`). The
  compiler strips `**bold**` markers: source `**1.**` compiles to `1.` (verified against
  `realm-items-ash` row 27 in `tables.json`).
- No runtime code rolls `realm-items-*` yet (grep of `src/` finds zero consumers — the
  walk-assembly draw seam is a later unit). The schema locks the data contract *before* that
  consumer exists, which is exactly why it can be locked without touching play.
- The creature corpus already runs the sibling convention: `REALM_BESTIARY[realm][i].frame` = a
  `BESTIARY` chassis id; stats resolve off the chassis (`src/ui/ref-bestiary.js:79`
  `_realmEntries` — `ac/hp/speed/abilities/actions` all read from `bestiary[e.frame]`;
  `src/engine/combat.js` `combatFromEncounter` resolves `BESTIARY[statId]` and applies the
  entry's `traits` override blob via `cmStampFoeStory` → `cmApplyTraits`, combat.js:671/167).

**What this spec locks:** (1) one unified **frame doctrine** across both corpora; (2) the
**Frame-cell grammar** — uniform vs slotted — that lets one pooled row carry per-variant frames;
(3) the pure **parser pair** the future draw seam will call; (4) a **lint gate** so frame ids can
never rot silently; (5) the **re-proposed Frontier + Noir Mythic pools** authored against the
locked grammar (PROVISIONAL content for Adam's skim).

**Inference cost: zero.** No model call anywhere in this system — grammar, parser, lint, and
table data are all deterministic script (SPEED doctrine: nothing here enters a mechanical loop
with a model in it).

---

## §1 The frame doctrine (both corpora)

A **frame** is a pointer from a flavor-owning row to a mechanics-owning chassis. The row owns the
words; the chassis owns the numbers. This is the engine-owns-NOUNS discipline applied to stats.

| corpus | frame namespace | resolver (existing, unchanged) | flavor owner |
|---|---|---|---|
| items (`realm-items-*` Frame cell) | keys of `ITEMS_BY_NAME` (175) ∪ `MAGIC_ITEMS_BY_NAME` (261) in `data/items.js` — 436 ids total | `itemDef(name)` / `magicDef(name)` (`src/engine/combat.js:387/393`), both via `itemKey` normalization (curly→straight apostrophe, whitespace collapse, trim, lowercase) | the table row's Item/Ranks/Note text |
| creatures (`REALM_BESTIARY[*].frame`) | keys of `BESTIARY` (`data/bestiary.js`) | `_realmEntries` (`src/ui/ref-bestiary.js:79`) for reference display; `BESTIARY[statId]` + `cmFoeFrom` for combat (`src/engine/combat.js` combatFromEncounter / cmResolveFoe) | the realm entry's name/desc/flavor/model |

Doctrine clauses (all four are LOCKED):

1. **A frame must always resolve.** Never null, never an invented id. An unresolvable frame is a
   spec bug caught by the §4 lint (items) or by generator discipline (creatures).
2. **The default chassis for a wondrous/held oddment with no mechanical analog is `robe`.**
   This is already the de-facto convention across all 11 tables (shopping carts, ledgers, records,
   keys all ride `robe`); this clause makes it de jure. Executors never agonize over "what frames
   a shellac record" — if it isn't worn armor, a weapon, a tool, a container, a document
   (`paper`/`map`/`book`), or a nameable SRD object, it is `robe`.
3. **Differences from the chassis are expressed only through the row's own text and (creatures)
   the traits-override whitelist** — `{note, hp, ac, actions:[{name, replaces?, text}]}` applied
   by `cmApplyTraits` (combat.js:167; additive actions hard-capped at chassis+2, every drop
   console.warned). No new override surface is added by this spec.
4. **NEAREST-SUB rule for anomalous entities** (no clean SRD analog): pick the nearest chassis by,
   in order, (a) CR match, (b) role (mook/elite/boss), (c) size/type; then reskin via clause 3.
   *PROVISIONAL — this ordering is a taste heuristic; recommended default as written. It codifies
   the practice already visible in `data/realm-bestiary.js` (e.g. Dust-Broke Drifter →
   `desperate-bandit`), it does not change any data.* Chassis CR wins at combat resolution
   (`combatFromEncounter`: `if(n.cr != null && f.cr == null) f.cr = n.cr` — chassis first, entry
   cr only fills a gap); the entry's own `cr` remains display/selection metadata. Unchanged.

---

## §2 The Frame-cell grammar (the new part)

A Frame cell is exactly one of two forms:

**UNIFORM (existing, unchanged, 549 of 550 realm-items rows after this spec builds):** the whole
trimmed cell is one frame id. Commas and spaces are id characters, never separators —
`lantern, hooded`, `pot, iron`, `boots of striding and springing` are single ids.

**SLOTTED (new — legal ONLY on a pooled row, i.e. a row whose Item cell contains `roll dN`):**
the cell is N numbered segments, one frame id per pool variant:

```
source markdown:   **1.** pistol **2.** paper **3.** piton **4.** paper
compiled cells[2]: 1. pistol 2. paper 3. piton 4. paper
```

Grammar rules (LOCKED):

- Markers are `**N.**` in source (matching the numbering the Item and Ranks cells of every pooled
  row already use), which the compiler strips to `N.`. Markers run 1..N with no gaps, N = the
  pool die size from the Item cell's `roll dN`.
- **Detection rule:** a cell whose trimmed, asterisk-stripped text starts with `1.` followed by
  whitespace is SLOTTED; anything else is UNIFORM. (No item id starts with a digit — verified
  against all 436 namespace keys.)
- A slotted cell must cover every variant explicitly — no defaulting inside a slotted cell.
- A UNIFORM cell on a pooled row remains legal and means "all variants share this chassis" (this
  is the 9 applied realms today; they are NOT rewritten by this spec).
- A slotted cell on a non-pooled row is malformed (lint ERROR, §4).
- Separator between segments is whitespace only. No `·`, no commas between segments (commas
  belong to ids).

---

## §3 The parser pair — exact surface

**Home: `src/engine/compiled.js`** (the compiled-table reading layer; a Frame cell is
compiled-table cell data, so its parser lives beside `rollTable`). Classic script, global scope,
pure functions — no `GS`, no `w`, no DOM, no model. Register in `manifest.json` module
`engine.compiled`: `owns` gains `"frameFieldParse"` and `"frameFieldResolve"` (current owns:
`['CT','rollExpr','rollTable']`).

```js
/* frameFieldParse(cell) -> null | {slotted:false, frame:string}
                          | {slotted:true, frames:{"1":string,...}, count:number} */
function frameFieldParse(cell){
  if(cell == null) return null;
  const t = String(cell).replace(/\*/g, "").trim();   // tolerate source-form bold markers
  if(!t) return null;
  if(!/^1\.\s/.test(t)){ return { slotted:false, frame:t }; }   // UNIFORM
  const frames = {}; let count = 0;
  // split on N.-markers; frame ids never contain digit-period tokens (verified, all 436 keys)
  const parts = t.split(/(?:^|\s)(\d+)\.\s+/).filter(s => s !== "");
  for(let i = 0; i + 1 < parts.length; i += 2){
    const k = parts[i], v = parts[i+1].trim();
    if(!/^\d+$/.test(k) || !v) continue;              // skip malformed segment, never throw
    frames[k] = v; count++;
  }
  return count ? { slotted:true, frames, count } : null;
}

/* frameFieldResolve(cell, variant) -> frame id string | null.
   variant = the d4 (etc.) pool roll, 1-based. Uniform ignores variant. Slotted returns the
   variant's frame; a missing variant key falls back to frames["1"] (variant 1 is always the
   legacy anchor row by pool construction) — a well-formed slotted cell never resolves null. */
function frameFieldResolve(cell, variant){
  const p = frameFieldParse(cell);
  if(!p) return null;
  if(!p.slotted) return p.frame;
  const k = String(variant == null ? 1 : variant);
  return p.frames[k] || p.frames["1"] || null;
}
```

These two functions are the whole runtime surface. Validation against the namespace is NOT the
parser's job (that's §4 lint at build time, and the eventual draw seam's own `itemDef || magicDef`
fallback at play time — that seam is a **later unit, out of scope here**).

---

## §4 Lint gate — CHECK 6 in `build/lint-tables.py`

New check, same `Finding` mechanics as CHECKs 1–5 (`build/lint-tables.py` — `Finding` class
line ~118, checks live in `lint_file`, severities per the file's own header doctrine: never
tighten beyond what compile-tables.py tolerates, only ADD).

**Scope:** tables whose tid starts with `realm-items-` (the only family that declares the Frame
contract today; other families adopt later via TABLE-ROW-CONTRACT if ever — explicitly out of
scope tonight).

**Namespace loader** (once per lint run): slice `data/items.js` between `const ITEMS_BY_NAME` and
`const ITEM_CONDITIONS`; collect `re.findall(r'^ "([^"]+)": \{', slice, re.M)` → exactly **436
keys** (175 mundane + 261 magic; verified — the one-space-indent top-level-key pattern matches
nothing else in the file). Normalize both sides with the Python mirror of `itemKey`:
`s.replace('’',"'")`, collapse whitespace, strip, lower.

**Per row of a scoped table** (Frame column = header cell whose lowercased text is `frame`; a
scoped table with no Frame column → one WARN and skip):

| condition | severity | message gist |
|---|---|---|
| Frame cell empty | ERROR | frameless row in a realm-items table (the family's own frontmatter calls this a spec bug) |
| UNIFORM id not in namespace | ERROR | unknown frame id |
| SLOTTED but Item cell has no `roll dN` (regex `roll d(\d+)`, case-insensitive) | ERROR | slotted frame cell on a non-pooled row |
| SLOTTED with count ≠ N, or markers not exactly 1..N | ERROR | frame variants don't cover the pool |
| SLOTTED with any variant id not in namespace | ERROR (one per bad id) | unknown frame id in variant k |

**Expected numbers:** on the current corpus CHECK 6 adds **zero findings** (all 550 realm-items
rows carry valid uniform frames — verified by script against the 436-key namespace on
2026-07-06). Lint header stays `errors: 3 | warnings: 901` (the 3 pre-existing In-Building
Complications band errors; baseline captured same day). After §6's table edit it STAYS
`errors: 3 | warnings: 901` — the two edited rows keep Band=Mythic at roll 27, so the existing
band-regression WARNs for those files neither appear nor vanish.

---

## §5 Creature-corpus clause (codification only — zero build)

The creature side of the frame convention is already built and live; this section only binds it
to the same doctrine so future agents stop half-reinventing it:

- `REALM_BESTIARY` entries carry `frame` (BESTIARY chassis id) + optional `traits` override blob;
  generated by `build/gen-realm-bestiary.py` from `dev/model-qa/realm-bestiary-draft.json` —
  **generated file, never hand-edit; spec generator/draft edits instead.**
- Stats always resolve off the chassis; the override whitelist and cap are §1 clause 3; the
  nearest-sub selection heuristic is §1 clause 4 (PROVISIONAL).
- Per the GPT-5.5 outside read (bestiary section): the Bestiary Manual should stay **loud** that
  realm stats come from `frame` while flavor/model come from the row — `_realmEntries` already
  separates them correctly; any future manual copy that blurs it is a bug.
- **No slotted grammar on the creature side.** Creature pools don't exist (each realm row is one
  creature); if a pooled creature row ever appears, it adopts this grammar as-is. Decided now so
  no executor invents a second grammar.

---

## §6 Re-proposed Frontier + Noir Mythic pools (PROVISIONAL — Adam skims these rows)

Base = the rows committed in review pass 2 (`3666340`) — the newest Adam-queue authoring, already
doers-only and lint-clean — with (a) the Frame cell rewritten to the §2 slotted grammar with
per-variant frames, and (b) binding slots added to the Item text using ONLY the clean-binding
slots from `dev/realm-mythic-proposals.md`'s slot dictionary (`[the region]`,
`[this settlement]`, `[a name from the local name-culture]` — all engine-rolled, canon, no
DM-fill flags), restoring the top-band-uniqueness property (two worlds rolling the same variant
still localize differently). Ranks and Note cells are **byte-identical to the committed rows** —
effects unchanged. The superseded per-variant-frame drafts in `dev/realm-mythic-proposals.md`
§5/§9 are retired by this section (see Registry updates).

Frame assignments (each id verified in the §1 namespace): Frontier — unfired bullet `pistol`,
homestead patent `paper`, golden spike `piton`, marshal's commission `paper`. Noir — Mayor's
pardon `paper`, key to the city `robe` (no key def exists in items.js — §1 clause 2 default),
shellac record `robe` (same clause), getaway map `map`.

### 6a `Engine/03. _Tables/05. Realms/Realm Items - Frontier.md`, row 27 (currently line 60) — full replacement row

```
| 27 | Mythic | **The thing the territory was settled by — roll d4:** **1.** The unfired bullet — the last round of the war that named `[the region]`, casing blank, waiting for a name. **2.** The homestead patent, blank, bearing `[the region]`'s territorial seal — the last one ever printed, never filed. **3.** The golden spike from the railroad that was never finished — the line stopped where the money did, a day's ride short of `[this settlement]`. **4.** The marshal's commission, counter-signed by the territory itself, last carried by `[a name from the local name-culture]`, sworn to no town in particular. | **1.** pistol **2.** paper **3.** piton **4.** paper | <RANKS CELL BYTE-IDENTICAL TO CURRENT LINE 60> | <NOTE CELL BYTE-IDENTICAL TO CURRENT LINE 60> |
```

### 6b `Engine/03. _Tables/05. Realms/Realm Items - Noir.md`, row 27 (currently line 52) — full replacement row

```
| 27 | Mythic | **The thing this city would kill to keep — roll d4:** **1.** The Mayor's pardon, pre-signed, undated, seal genuine — the blank where the name goes has never been filled. **2.** The key to `[this settlement]` — the literal one, iron, from before the ceremony ever used a replica. **3.** The torch singer's last set, one shellac record, the only pressing — the song `[a name from the local name-culture]` sang the night the war between the families stopped for six hours. **4.** The getaway route — a hand-drawn map of the one way out of `[this settlement]` nobody has ever been caught on. | **1.** paper **2.** robe **3.** robe **4.** map | <RANKS CELL BYTE-IDENTICAL TO CURRENT LINE 52> | <NOTE CELL BYTE-IDENTICAL TO CURRENT LINE 52> |
```

`<... BYTE-IDENTICAL ...>` is an executor instruction, not literal text: copy the current row's
cell 5 and cell 6 verbatim (the executor edits ONLY cells 3 and 4 of each row). Spicy-world
stance note for Adam's skim: both pools stay Mythic-band reality-benders with map-redraw R2s —
band voice matches the 9 applied realms; the 25/25/25/17/8 baseline adopted tonight doesn't
change these rows' band labels (Spice Ruler = labeling discipline, and roll 27 stays the d50's
Mythic peak).

---

## §7 Worked before→after (the load-bearing site)

Frontier row 27, Frame cell, as the future draw seam will see it:

| | source cell | compiled `cells[2]` | `frameFieldResolve(cells[2], 3)` (rolled variant 3, the golden spike) |
|---|---|---|---|
| **before** | `pistol` | `pistol` | `"pistol"` — a railroad spike resolving as a firearm chassis: wrong weight, wrong kind, wrong equip slot the moment the draw seam instantiates it |
| **after** | `**1.** pistol **2.** paper **3.** piton **4.** paper` | `1. pistol 2. paper 3. piton 4. paper` | `"piton"` — and `frameFieldResolve(cell, 1)` still returns `"pistol"` (the value MOVED between variants; both asserted in the §8 harness) |

---

## §8 Build units (deferred queue; each = one branch, `--no-ff` merge)

### U1 `feat/frame-field-parser` — parser + harness

1. Add §3's two functions to `src/engine/compiled.js`; add both names to `engine.compiled.owns`
   in `manifest.json`.
2. New harness `dev/verify-frame-field.mjs` — jsdom, real modules in manifest order, same loading
   convention as `dev/verify-theater-data.mjs` (copy its classic-script filter). **RED-FIRST:
   write and run the harness BEFORE step 1; it must fail `frameFieldParse is not a function`.**
   Then build, then green. 14 checks:
   1. `frameFieldParse(null)` → null; `("")` → null; `("  ")` → null.
   2. uniform: `("robe")` → `{slotted:false, frame:"robe"}`.
   3. uniform with comma-id: `("lantern, hooded")` → frame `"lantern, hooded"` (never split).
   4. slotted compiled form: `("1. pistol 2. paper 3. piton 4. paper")` → slotted, count 4,
      frames 1–4 exactly `pistol/paper/piton/paper`.
   5. slotted source form (bold survives an uncompiled read):
      `("**1.** pistol **2.** paper **3.** piton **4.** paper")` → same result as check 4.
   6. MUTATION: `frameFieldResolve(c, 3)` === `"piton"` AND !== `frameFieldResolve(c, 1)`
      (`"pistol"`) — the value must MOVE across variants, not merely be non-null.
   7. resolve on uniform ignores variant: `(c_uniform, 4)` → `"robe"`.
   8. resolve fallback: slotted cell missing key `"3"` (`"1. pistol 2. paper 4. paper"` — parser
      keeps declared keys) → `resolve(c,3)` === `"pistol"` (variant-1 anchor), never null.
   9. `resolve(c_slotted, undefined)` → frames["1"].
   10. non-1-start cell `("2. paper 3. robe")` → UNIFORM with frame `"2. paper 3. robe"`
       (detection rule: slotted only when it starts `1.` — the lint, not the parser, screams).
   11. multi-word magic id uniform: `("boots of striding and springing")` round-trips whole.
   12. every §6 frame id resolves in the real namespace: for each of
       `pistol,paper,piton,map,robe`, `itemDef(id) || magicDef(id)` is truthy in the loaded page.
   13. purity: two calls on the same cell return equal results; no global state touched
       (`window.GS` snapshot unchanged).
   14. MUTATION (harness self-proof): with a locally monkey-patched `frameFieldParse` that drops
       the `frames["1"]` fallback, check 8 goes RED — proving check 8 is load-bearing.
   Output line: `frame-field: 14/14 green`, exit 0.
3. Gates: `python3 build/check-manifest.py` exit 0; `node dev/verify-frame-field.mjs` → 14/14.

### U2 `chore/lint-frame-check` — CHECK 6 (depends: nothing; parallel-safe with U1)

1. Implement §4 in `build/lint-tables.py`.
2. Acceptance: `python3 build/lint-tables.py --warn-only` header reads
   `errors: 3 | warnings: 901` (unchanged — CHECK 6 finds nothing on the current corpus).
3. **RED-FIRST probe (on the branch, then revert):** append to
   `Engine/03. _Tables/05. Realms/Realm Items - Ash.md` a scratch row
   `| 51 | Mythic | test — roll d4: junk | **1.** zzz-not-a-frame **2.** paper | | |`
   → run lint → header must read `errors: 5` (**moved 3→5**: one unknown-id ERROR + one
   pool-coverage ERROR (2 variants vs d4)); `git checkout --` the file → `errors: 3` again.
   Assert the COUNT moved, not just that new lines printed (the BUG-01 lesson).

### U3 `feat/frontier-noir-mythic-frames` — the table edit (depends: U2 merged, so the new lint
gates the very edit it was built for; U1 not required first)

1. Apply §6a/§6b — cells 3 and 4 of each row only; Ranks/Note byte-identical (executor must diff
   the two files and confirm the ONLY changed cells are Item and Frame in the two row-27 lines).
2. Recompile: `python3 "Engine/00. _System/compile-tables.py" --emit`.
3. Acceptance (all exact):
   - `python3 -c "import json;print(len(json.load(open('tables.json'))))"` → `378` (table count
     as of 2026-07-06; this unit adds/removes no table).
   - `python3 - <<'E'` … load `tables.json`, `realm-items-frontier` row spanning 27, print
     `cells[2]` `E` → exactly `1. pistol 2. paper 3. piton 4. paper`; same for
     `realm-items-noir` → `1. paper 2. robe 3. robe 4. map`.
   - `python3 build/lint-tables.py --warn-only` → `errors: 3 | warnings: 901` (unchanged).
   - With U1 also merged: `node dev/verify-frame-field.mjs` → `frame-field: 14/14 green`.
4. No module edit in this unit → no check-manifest requirement, but running it costs nothing:
   exit 0.

**Executor sizing:** U1 = S, U2 = S, U3 = S (three small units; the design was the hard part and
it's in this doc).

---

## §9 Don't-touch list

- **Generated — never hand-edit; regenerate only:** `tables.json`, `tables.js` (recompile via
  the §8 U3 command), `data/bestiary.js`, `data/realm-bestiary.js` (via
  `build/gen-realm-bestiary.py`), `data/class-progression.js`, `data/wiki.js`.
- **The 9 applied realm pools** (Ash, Bright-Kingdom, Chrome, Cosmic, Gloom, High-Seas,
  Lost-World, Suburb, Theater row 27) — Adam-approved verbatim, merged `46bcd62`. Not touched by
  any unit here; their uniform Frame cells are legal under §2 forever.
- **Frontier/Noir rows 1–26 and 28–50** — untouched; U3 edits exactly two cells in two lines.
- `src/engine/breach.js`, `src/engine/dungeon-walk.js`, the walk-assembly/loot draw seam — the
  CONSUMER of this schema is a later unit; nothing in this spec wires a draw.
- `dev/realm-mythic-proposals.md` — historical artifact; gets a one-line superseded banner
  (Registry updates), no content edits.
- `docs/DM-BRIDGE.md` mid-live-session, the Shifting Vale/Playtest Sandbox vaults — standing law.

---

## §10 Edge cases — enumerated rulings

1. **Empty/null Frame cell** → parser null; lint ERROR in the realm-items family. Ruled: the
   family frontmatter already calls frameless a spec bug — the lint just enforces it.
2. **Uniform id containing commas/spaces** (`pot, iron`) → one id, never split. Ruled in §2.
3. **Cell starting at `2.`** → UNIFORM (detection needs a leading `1.`), which then fails the
   lint as an unknown id. Ruled: loud failure over silent guesswork.
4. **Slotted with a gap (1,2,4 on a d4)** → parser keeps declared keys; `resolve(_,3)` returns
   the variant-1 anchor (never null at play); lint ERROR (coverage). Ruled: runtime is graceful,
   build-time is strict.
5. **Uniform cell on a pooled row** → legal, means all variants share the chassis (the 9 applied
   realms). Ruled in §2.
6. **Slotted cell on a non-pooled row** → lint ERROR. Ruled in §4.
7. **Pool size ≠ 4 someday (`roll d6`)** → grammar and lint are dN-agnostic (`roll d(\d+)`);
   markers 1..N. Ruled: no d4 hardcode anywhere.
8. **Bold markers reaching the parser** (someone parses source, not compiled) → parser strips
   `*` first; both forms parse identically (harness check 5). Frame ids never contain `*`.
9. **Case/apostrophe variance** (`Healer's Kit`, curly quote) → validity is checked through the
   `itemKey` fold on both sides (JS and the lint's Python mirror). Parser preserves the authored
   string; it never normalizes ids itself.
10. **Frame id valid in namespace but semantically absurd** (a patent framed `pistol` — today's
    actual bug) → not machine-detectable; owned by Adam's skim of PROVISIONAL rows. The schema's
    job is to remove the *structural excuse* for it, which it does.
11. **Creature frame missing from BESTIARY** → out of scope tonight (no such row exists;
    generator-side gate is a possible future chore, deliberately NOT queued — scoped out, not
    forgotten).
12. **Two sessions/worlds rolling the same variant** → binding slots localize per world
    (`[the region]` etc. are engine-rolled canon); plus Plot-Item-style resurface rules don't
    apply here (realm relics are draw-once table rows, not codex-minted legends). No change.

## §11 Blind-playable + player surface

This spec ships **no visual surface and no player-facing surface** — it is a data schema, two
pure functions, and a build gate. Frame ids are DM/engine-side (the player sees the Item prose,
which is already the prose twin of everything here). When the future draw seam surfaces a drawn
relic in the UI, THAT spec owes the prose twin per the BLIND-PLAYABLE doctrine; noted here so the
obligation lands on the right unit.

---

## Registry updates

Fable applies these one-liners on spec-lock (this doc does NOT apply them):

- **docs/DESIGN.md** (decision registry, dated 2026-07-06): "FRAME-FIELD schema locked (`docs/FRAME-FIELD.md`): uniform-vs-slotted Frame cells (`**N.** id` per pool variant), 436-id items namespace (`ITEMS_BY_NAME` ∪ `MAGIC_ITEMS_BY_NAME`), `robe` = default oddment chassis, creature frame+override doctrine codified, lint CHECK 6; Frontier+Noir Mythic pools re-proposed against it (PROVISIONAL, Adam-skim). Build deferred: U1 parser / U2 lint / U3 table edit."
- **docs/NEXT-STEPS.md**: in the Batch C line ("rule the Frame-field schema so Frontier + Noir can re-propose") mark the ruling ☑ SPEC-LOCKED 2026-07-06 → `docs/FRAME-FIELD.md`; add U1/U2/U3 to the deferred build queue (all size S; U3 depends on U2).
- **docs/DIRECTION.md §6 Batch C**: same strike — "Frame-field schema" moves from *pending Adam* to *spec-locked, Adam skims the PROVISIONAL doc + §6 rows*.
- **docs/README.md** (System specs index): add "`FRAME-FIELD.md` — the frame-field schema: per-variant stat-chassis declaration for pooled table rows + the creature frame doctrine (SPEC-LOCKED 2026-07-06, build deferred)."
- **docs/HANDOFF.md**: clear the queued "Frontier/Noir Frame schema call" open item → points at `docs/FRAME-FIELD.md`.
- **dev/realm-mythic-proposals.md**: prepend one line under the status header: "§5 Frontier / §9 Noir frame handling SUPERSEDED by `docs/FRAME-FIELD.md` §6 (2026-07-06); the 9 applied sections remain the historical record of merge `46bcd62`."
