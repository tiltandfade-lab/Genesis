---
type: system-spec
project: Genesis
status: SPEC v1 2026-07-07 — Sonnet-ready; NO code written yet. Author: Opus spec pass off the 0707 marathon ledger.
consumers: the executor pipeline (genesis-orchestrate). Each unit is independently landable.
related:
  - "[[PLAYTEST-BUGS]]"      # BUG-08 (the persistence half), BUG-17/18 (attitude spine — now fixed)
  - "[[SOCIAL-SPINE-FIXES]]" # S1 attitude_shift fix this D2 builds ON
  - "[[SEAT-PROMPT]]"        # the frontier-locked seat prompt; §events is GENERATED (see D1/D2)
  - "[[DM-CONTRACT-ARTIFACT]]"
  - "[[EVENT-CONTRACT]]"
  - "[[CODEX]]"
source: dev/playtest-0707/FINDINGS.md — SET-02-F1, SET-10-F1, SET-12-F2, SET-01-F2/F3, SET-03-F2, SET-05-NOTE-A
---

# HQ3-D — PC durable state · codex coherence · harness ergonomics

Five units from the 0707 marathon, clustered because they share the seam between **persisted
world state** (`U`, via `world.state`/`codex`), the **DM digest**, and the **bridgeless harness**.
Nothing here invents a new subsystem — every unit hardens an existing persistence channel so a
**memoryless** production seat inherits what a warm-memory seat currently holds only in its head.

**Read the disciplines first (CLAUDE.md):** (1) normalization/coercion lives ONLY in
`dmFoldPayload`/`DM_EVENT_FIELDS` — never per-handler; (2) new mutable transient state goes in `GS`,
persistent universe state goes through `world.state`/`codex`; (3) run `python3 build/check-manifest.py`
after any module edit; (4) the events section of every seat prompt is **generated** by
`build/gen-dm-contract.py` — you edit the registries + the generator's tables, then re-emit; you do
NOT hand-edit the spliced region.

---

## Adam's ledger (defaults taken, overridable)

Every open design question is resolved here. An executor implements these verbatim; only Adam
overrides. Rationale is in each unit.

**D1 — durable marks**
- L1. **`sheet.marks[]` is UNIFIED on an object shape** `{id, text, kind, sinceDay, mechanical?}` —
  it is NOT a second parallel array. The existing string-valued `marks[]` (creator "This Is Your
  Life" seeds) migrates to objects at the source (`src/creator/life.js`).
- L2. **Legacy string marks in already-saved worlds are read tolerantly, NOT migrated by a script.**
  A `markText(m)` helper returns `typeof m==="string" ? m : m.text`; render + digest + the remove
  handler all read through it. No migration pass, no save rewrite.
- L3. **`kind` enum = `injury | curse | debt | other`.** TIYL creator seeds (scars/wounds/sickness/
  poison — all bodily) migrate as `kind:"injury"`, `sinceDay:0` (pre-play). An unknown/omitted `kind`
  on the event **clamps to `"injury"`** (the common case — a fresh wound).
- L4. **New event types: `mark_added` + `mark_removed`.** No existing event fits (`condition_add` is
  transient + ontology-gated; `epithet_grant` is reputation). Marks are durable, DM-authored, and
  need first-class contract docs. Both join `PROMPT_TAUGHT` (the memoryless seat MUST keep honoring a
  mark, so it must be taught).
- L5. **`id`/`sinceDay` are engine-stamped, never DM-supplied.** `id = "mk-"+uid()`,
  `sinceDay = clockOf(w).day`. `mechanical` is a free-text DM hint (e.g. "can't make two-handed
  somatic gestures") — narrated only, **never auto-enforced** in v1 (consistent with the
  DM-narrated-picks posture).
- L6. **Marks ride EVERY turn in the digest** (already do, line 347) — they are small and load-bearing.

**D2 — codex-note coherence**
- L7. **`dm.notes[]` entries become objects** `{text, day, min, supersedes?}` — stamped in
  `codexUpdate` via `clockOf(w)` (same precedent as `codexGift`, codex.js:176). Legacy string notes
  read tolerantly (a `noteText()` helper), never migrated.
- L8. **The digest slice orders notes NEWEST-FIRST** (reverse of storage/append order — append order
  is the reliable recency key, robust for legacy strings). The `{day,min}` stamp is for the seat to
  SEE when a claim was made; it is not the sort key.
- L9. **`supersedes` IS included** (not deferred) as an optional boolean on `codex_update` alongside
  `note`: when truthy it stamps the pushed note `supersedes:true`; the digest renders that note first
  with a `"(corrects earlier claims)"` prefix so the seat treats it as canon.
- L10. **Seat-prompt rule (hand-edited prose, ABOVE the generated marker):** a bullet instructing the
  seat that when prose commits a **durable relationship shift**, it MUST also fire `attitude_shift`
  so the structured `attitude.value` tracks the fiction (the SET-12-F2 divergence). Exact diff below.

**D3 — crit fall-through persistence**
- L11. **Persist the fall-through into `w.dm.pendingRoll`** `{action, rolls, ts}` at all three
  live-flow fall-through sites in `dm.js` (dmRollFor else, resolveBranch missing-branch, dmRollDice).
  Cleared naturally when `applyResponse` rebuilds `w.dm` (dm.js:602) — add `pendingRoll:null` there
  so a fresh turn drops it.
- L12. **Harness `cmdRoll`: a second `roll` with no `rollReq` but a live `w.dm.pendingRoll` SURFACES
  it** (`recovered:true`), never the bare `"no pending rollRequest"`.
- L13. **Harness `cmdDigest` preserves `w.dm.pendingRoll`** (never nulls it — it is a distinct field
  from `rollReq`) and **surfaces it + the about-to-be-cleared `rollReq`** in its output so a peek can
  never lose the die (the SET-05-NOTE-A footgun).

**D4 — absolute clock set (harness only)**
- L14. **`advance --toClock "D:HH:MM"`** sets the clock ABSOLUTELY by direct assignment
  (`w.clock.day`/`w.clock.min`), allowed to move backward. **Not** via `advanceClock` (which would
  fire wake logic on a backward set). `--toBand dawn|noon|dusk|night` sets to that band's canonical
  minute (see L15). Malformed input → `{ok:false, reason}`.
- L15. **Band → minute canon:** `dawn=360 (06:00)`, `noon=720 (12:00)`, `dusk=1080 (18:00)`,
  `night=1320 (22:00)` (aligned with `timeOfDay`, state.js:59). `--toBand` keeps the current `day`.

**D5 — digest note compaction**
- L16. **Per-record dm-note digest budget = newest 6 notes shipped full (newest-first), + one rollup
  count line when >6.** Stored `r.dm.notes` stays FULL — only the digest projection compacts. The
  rollup is a COUNT line (`{text:"…and N earlier notes (full history in stored state)", rollup:true}`),
  NOT a content summary (a lossy rewrite would need a model call — against SPEED-DOCTRINE; the script
  can only count). D2's newest-first ordering + this cap are ONE shared projection helper.

---

## Shared anchor table (verified 2026-07-07 against HEAD)

| symbol | file:line | note |
|---|---|---|
| `dmDigest()` | src/world/dm.js:316 | pc block 334–370; `marks:sh?(sh.marks||[]):[]` at **347** |
| creator mark push | src/creator/life.js:162 | `push(sd.text)` — the string source (D1 migrates) |
| marks render | src/world/render.js:1505 | `sh.marks.map(m=>escHtml(m))` (D1 reads via `markText`) |
| `dmRollFor` | src/world/dm.js:772 | fall-through else at **826–832** |
| `resolveBranch` | src/world/dm.js:843 | missing-branch fall-through at **864** |
| `dmRollDice` | src/world/dm.js:893 | clear at **903** |
| `sendTurn` | src/world/dm.js:452 | clears `w.dm.rollReq` at 477 |
| `applyResponse` w.dm rebuild | src/world/dm.js:602 | D3 adds `pendingRoll:null` here |
| `DM_EVENT_TYPES` | src/world/dm.js:1413 | append `mark_added`,`mark_removed` |
| `DM_EVENT_FIELDS` | src/world/dm.js:1439–1558 | add mark rows; `codex_update` row at **1485** |
| `dmFoldPayload` | src/world/dm.js:1564 | the ONE coercion seam |
| applyEvent switch | src/world/dm.js:1708 | new cases go near `condition_remove` (2566) |
| `condition_add` case | src/world/dm.js:2514 | PC-sheet handler pattern to mirror |
| `attitude_shift` case | src/world/dm.js:3044 | D2 reference |
| `epithet_grant` case | src/world/dm.js:3294 | closest analog (durable PC-sheet write) |
| `livingSheet(w)` | src/world/dm.js:939 | `→ {c, sh}` or null |
| `codexUpdate` | src/world/codex.js:135 | note append at **156** (D2/D5) |
| `codexFullRecord` | src/world/codex.js:337 | ships `dm:r.dm` at **338** (D2/D5 project here) |
| `codexDigest` | src/world/codex.js:416 | slice builder |
| `codexGift` day-stamp precedent | src/world/codex.js:176 | `clockOf(w).day` — D2 mirrors |
| `advanceClock` | src/world/state.js:81 | already handles negative deltas |
| `timeOfDay` | src/world/state.js:59 | band boundaries (D4 L15) |
| harness `cmdDigest` | dev/playtest-bridgeless.mjs:204 | nulls `w.dm.rollReq` at 215 (D3 guard) |
| harness `cmdRoll` | dev/playtest-bridgeless.mjs:258 | `"no pending rollRequest"` at 262 (D3) |
| harness `cmdAdvance` | dev/playtest-bridgeless.mjs:367 | forward-only (D4) |
| harness stubbed `sendTurn` | dev/playtest-bridgeless.mjs:85 | captures `__pendingRoll` |
| `gen-dm-contract.py` EXAMPLES | build/gen-dm-contract.py:~44 | add mark examples |
| `PROMPT_TAUGHT` | build/gen-dm-contract.py:185 | add both mark types (D1) |
| `PROMPT_TARGETS` | build/gen-dm-contract.py:195 | both prompts spliced on `--emit` |
| verify-roll-branches block 3b | dev/verify-roll-branches.mjs:174–184 | stubs sendTurn (D3 extends) |
| BUG-08 probe | dev/playtest-bug-probes.mjs:557–571 | D3 flips to the persistence assert |

---

## HQ3-D1 — durable injuries / maims (priority MED-HIGH)

**Problem (SET-02-F1).** Rennick's shattered left hand — mechanically load-bearing in the fiction —
has no engine representation: not in `conditions`, not surfaced in the digest, alive only in DM
memory. A memoryless seat reads a clean L10 Bard. Every durable debility (maim, curse, lingering
wound, a fog-debt) silently evaporates on seat-swap. The codex covers NPCs/places; the PC's own
durable non-HP state has no persistence channel.

**Design.** Promote the already-shipped `sheet.marks[]` (line 347) from a string list to a durable
object list, and give the DM two events to write it. Boundary law is respected — the events carry no
numeric/alias fields, so `dmFoldPayload` needs only accept-lists; the handler's `kind` enum-clamp is
domain validation (like `condition_add` lowercasing `cond`), not payload normalization.

### Shapes

```js
// a mark on sheet.marks[]
{ id:"mk-<uid>", text:"a ruined left hand", kind:"injury", sinceDay:14, mechanical?:"no two-handed somatic gestures" }

// mark_added payload  (id + sinceDay are ENGINE-stamped, never DM-supplied)
{ text:"a ruined left hand", kind?:"injury"|"curse"|"debt"|"other", mechanical?:"free-text DM hint" }

// mark_removed payload
{ id?:"mk-...", text?:"a ruined left hand" }   // id preferred (from digest pc.marks[].id); text is a fallback exact-match
```

### Changes

1. **`src/creator/life.js:162`** — migrate the seed push to an object:
   ```js
   else if(sd.kind==="mark"){ (c.sheet.marks=c.sheet.marks||[]).push(
     { id:"mk-"+uid(), text:sd.text, kind:"injury", sinceDay:0 }); }
   ```
2. **New helper near `livingSheet` (dm.js ~939):**
   ```js
   const MARK_KINDS=["injury","curse","debt","other"];
   function markText(m){ return (m&&typeof m==="object")?(m.text||""):String(m||""); }
   ```
   (Or colocate `markText` in a shared util the render layer also loads — but a duplicate one-liner
   in render.js is acceptable; the two readers are in different manifest layers.)
3. **`src/world/render.js:1505`** — read through the helper:
   ```js
   ...sh.marks.map(m=>escHtml(markText(m))).join(" · ")...
   ```
4. **`DM_EVENT_TYPES` (dm.js:1413)** — append `"mark_added","mark_removed"`.
5. **`DM_EVENT_FIELDS` (dm.js:1439–1558)** — add (no `num`, no `alias` — decisive per L-ledger):
   ```js
   mark_added:   { accept:["text","kind","mechanical"] },
   mark_removed: { accept:["id","text"] },
   ```
6. **applyEvent switch — new cases after `condition_remove` (dm.js:2584):**
   ```js
   case "mark_added":{
     const t=livingSheet(w); if(!t) return {ok:false,reason:"no-pc"};
     const text=String(p.text||"").trim(); if(!text) return {ok:false,reason:"no-text"};
     const kind=(MARK_KINDS.indexOf(p.kind)>=0)?p.kind:"injury";   // domain clamp, default injury (L3)
     const mk={ id:"mk-"+uid(), text, kind, sinceDay:clockOf(w).day };
     if(p.mechanical!=null && String(p.mechanical).trim()!=="") mk.mechanical=String(p.mechanical);
     t.sh.marks=t.sh.marks||[]; t.sh.marks.push(mk);
     addLedger(w,"outcome",{kind:"mark",pc:t.c.name,markId:mk.id,markKind:kind,text,source:src},
       "✦ "+t.c.name+" bears a lasting mark — "+text+(kind!=="injury"?(" ("+kind+")"):"")+".");
     return {ok:true, mark:mk};
   }
   case "mark_removed":{
     const t=livingSheet(w); if(!t) return {ok:false,reason:"no-pc"};
     const arr=t.sh.marks||[]; const before=arr.length;
     const gone=p.id ? arr.find(m=>m&&m.id===p.id)
                     : arr.find(m=>markText(m)===String(p.text||""));
     t.sh.marks=arr.filter(m=>m!==gone);
     if(t.sh.marks.length===before) return {ok:false,reason:"no-such-mark"};
     addLedger(w,"outcome",{kind:"mark",pc:t.c.name,removed:true,text:markText(gone),source:src},
       "✦ "+t.c.name+" is free of — "+markText(gone)+".");
     return {ok:true, removed:markText(gone)};
   }
   ```
7. **Digest (dm.js:347)** — no code change to the line itself; it already ships `sh.marks||[]`,
   which now carries objects. Confirm the objects are small enough for the diet budget (verify below).
8. **`build/gen-dm-contract.py`** — add EXAMPLES entries:
   ```py
   "mark_added":   {"text": "a ruined left hand", "kind": "injury", "mechanical": "no two-handed somatic gestures"},
   "mark_removed": {"id": "mk-3f2a"},
   ```
   and append `"mark_added","mark_removed"` to `PROMPT_TAUGHT` (line 185). Then
   `python3 build/gen-dm-contract.py --emit` (regenerates `dm-contract.json` + splices BOTH prompt
   targets' §events region).
9. **`docs/SEAT-PROMPT.md`** — hand-edit prose (ABOVE the generated marker, in "Hard rules" or a new
   "Durable marks" note under §"Danger, failure & saves"):
   > - **Durable marks persist — honor and update them.** `pc.marks[]` are lasting debilities/curses/
   >   debts (a ruined hand, a lingering curse). Narrate FROM them every relevant turn — they don't
   >   heal on their own. When play inflicts a new one, emit `mark_added {text, kind, mechanical?}`;
   >   when one is genuinely lifted, `mark_removed {id}`. A mark you leave in prose only is gone the
   >   next turn.

### Acceptance
- `mark_added {text:"a ruined left hand"}` → `sheet.marks[]` gains `{id,text,kind:"injury",sinceDay:<today>}`; digest `pc.marks` ships it; ledger line emitted.
- `mark_added {kind:"garbage"}` → `kind` clamps to `"injury"`.
- `mark_removed {id}` drops exactly that mark; a bad id → `{ok:false,reason:"no-such-mark"}`.
- A pre-existing save with string marks still renders (render.js) and still digests (no throw).
- `mark_added`/`mark_removed` appear in `docs/SEAT-PROMPT.md` §events after `--emit`; `dm-contract.json` --check is clean.

### Verify plan
- **`dev/verify-dm-events.mjs`** (add a section): feed `mark_added` then `mark_removed` to
  `applyEvent`; **mutation-test asserts** — (a) `sheet.marks.length` increased AND the pushed entry is
  an object with `id`/`kind`/`sinceDay` (not merely `res.ok`); (b) `kind` clamped; (c) removal
  decreased length; (d) a legacy `sheet.marks=["old scar"]` fixture digests + renders without throw.
- **`dev/verify-digest-diet.mjs`**: a PC with 6 marks stays inside the pc-block / total budget.
- **`python3 build/gen-dm-contract.py`** (check mode) is green; **`python3 build/check-manifest.py`** OK.
- **Regression:** run existing `verify-dm-events.mjs` — the string-mark render check must still pass.

---

## HQ3-D2 — codex-note coherence (priority MED)

**Problem.** (a, SET-10-F1) `dm.notes[]` is append-only bare strings, so a record accretes
CONTRADICTORY durable claims with no recency signal (the house-warden holds both "resisted / she" and
"succumbed / careful man"). (b, SET-12-F2) mechanical `attitude.value` diverges from the prose
relationship — a two-set "ally of respect" reads `0/Indifferent` because no `attitude_shift` ever
fired. A memoryless seat can surface either stale claim as canon.

**Design.** Two moves. **(1) Stamp + order notes** — `codexUpdate` pushes note OBJECTS with a `{day,
min}` timestamp; the digest slice orders them newest-first and (with D5) caps them, so recency is
legible. **(2) A seat-prompt rule** telling the seat to fire `attitude_shift` whenever prose commits a
durable relationship shift — closing the divergence at the contract, using the now-working (post-S1)
event. Boundary law: the note-object construction is domain logic inside `codexUpdate`, NOT a payload
alias — `codex_update` already accepts `note` (dm.js:1485); `supersedes` is added to that accept-list.

### Shapes
```js
// a dm.notes[] entry (was: a bare string; legacy strings still read via noteText())
{ text:"the warden is an ally of respect (earned, not charmed)", day:5, min:1225, supersedes?:true }
```

### Changes

1. **`src/world/codex.js:156`** (`codexUpdate`, the note-append) — push an object, stamped:
   ```js
   if(patch.note!=null && patch.note!==""){
     r.dm=r.dm||{}; (r.dm.notes=r.dm.notes||[]);
     const c=(typeof clockOf==="function")?clockOf(w):{day:null,min:null};
     const entry={ text:String(patch.note), day:c.day, min:c.min };
     if(patch.supersedes) entry.supersedes=true;
     r.dm.notes.push(entry);
   }
   ```
2. **`src/world/codex.js`** — add a tolerant reader near `codexFullRecord`:
   ```js
   function noteText(n){ return (n&&typeof n==="object")?(n.text||""):String(n||""); }
   ```
3. **`codexFullRecord` (codex.js:337)** — project a compacted, newest-first `dm.notes` view instead
   of shipping `r.dm` raw. **This is the SHARED helper D5 also uses** — implement it once in codex.js,
   called from `codexFullRecord`'s `dm:` assignment; it never mutates stored state (L16 budget=6):
   ```js
   const DIGEST_NOTE_BUDGET=6;   // L16
   function dmNotesForDigest(dm){
     const notes=(dm&&dm.notes)||[];
     if(notes.length<=0) return dm;
     const newestFirst=notes.slice().reverse();                 // append order → newest first (L8)
     const kept=newestFirst.slice(0, DIGEST_NOTE_BUDGET).map(n=>{
       const o={ text:noteText(n) };
       if(n&&typeof n==="object"){ if(n.day!=null)o.day=n.day; if(n.min!=null)o.min=n.min;
         if(n.supersedes){ o.supersedes=true; o.text="(corrects earlier claims) "+o.text; } }
       return o;
     });
     const extra=notes.length-kept.length;
     if(extra>0) kept.push({ text:"…and "+extra+" earlier note"+(extra===1?"":"s")+" (full history in stored state)", rollup:true });
     return Object.assign({}, dm, { notes:kept });               // clone — stored r.dm.notes stays full (L16/D5)
   }
   ```
   In `codexFullRecord`, change `dm:r.dm` (line 338) to `dm:dmNotesForDigest(r.dm)`.
4. **`DM_EVENT_FIELDS` codex_update row (dm.js:1485)** — add `"supersedes"` to `accept`:
   ```js
   codex_update: { accept:["id","name","shape","fields","dm","status","note","supersedes"] },
   ```
5. **`docs/SEAT-PROMPT.md`** — hand-edit prose (ABOVE the generated marker; extend the "Invention is
   licensed — but captured" bullet block, ~line 53, or add a sibling bullet):
   > - **A relationship shift is a mechanical event, not just prose.** When the fiction durably
   >   changes how an NPC regards the PC (an earned ally, a betrayed friend, a cowed enemy), emit
   >   `attitude_shift {target, to}` THE SAME TURN — the structured `attitude.value` must track the
   >   fiction, or the next DM reads a two-session ally as a cold stranger. If you are correcting an
   >   earlier note that is now wrong, add `codex_update {id, note:"…", supersedes:true}` so the newest
   >   claim reads as canon.

   Then regenerate (`python3 build/gen-dm-contract.py --emit`) so `codex_update`'s field list in the
   spliced §events region picks up `supersedes` (the accept-list drives the generated line).

### Acceptance
- Two successive `codex_update {id, note}` → `r.dm.notes` holds two OBJECTS each with `day`/`min`; the digest's `codex[<id>].dm.notes` lists them **newest-first**.
- `codex_update {id, note, supersedes:true}` → newest note carries `supersedes:true` and renders first with the "(corrects earlier claims)" prefix.
- A record whose stored `r.dm.notes` contains a legacy bare string still projects (via `noteText`), no throw.
- The seat-prompt relationship-shift + supersedes bullets are present; `dm-contract.json` --check clean (codex_update line now shows `supersedes`).

### Verify plan
- **`dev/verify-codex.mjs`** (add a section): call `codexUpdate` twice with notes, then a third with
  `supersedes:true`; **mutation-test asserts** — (a) stored `r.dm.notes[0]` is an object with a
  numeric `day` (NOT a bare string); (b) `codexFullRecord(w,r).dm.notes[0].text` is the NEWEST note
  (order flipped); (c) the supersedes note is first + flagged; (d) a fixture with a legacy string note
  projects without throw. Assert stored `r.dm.notes` is UNCHANGED length by the digest projection
  (projection is non-mutating).
- **`dev/verify-digest-diet.mjs`**: a record with 30 notes ships ≤7 note entries (6 + rollup) in the
  digest (shared with D5's check).
- **`python3 build/gen-dm-contract.py`** check + **`check-manifest.py`** OK.

---

## HQ3-D3 — persist the crit fall-through (priority MED — BUG-08's harness half)

**Problem (SET-01-F2, SET-05-NOTE-A).** When a nat-20/nat-1 falls through to live resolution,
`{action, rolls}` live ONLY in the ephemeral `__pendingRoll` printed to that one `roll` invocation's
stdout — nothing is persisted. A second `roll` returns `"no pending rollRequest"` (the die is lost);
worse, a `digest` run to peek nulls `w.dm.rollReq`, making the die unrecoverable. BUG-08's clear-half
is fixed; this is the queued persistence half.

**Design.** Persist the fall-through into `w.dm.pendingRoll` at all three live-flow sites; drop it
when the next turn's response is applied; make the harness surface (never silently clear) it. No
coercion involved — this is a state-durability + observability fix.

### Changes

1. **`src/world/dm.js` — dmRollFor else (826–832):** before `sendTurn(...)`:
   ```js
   } else {
     if(w.dm){ w.dm.rollReq=null; w.dm.pendingRoll={ action:"(I roll "+skill+advTag+": "+total+")", rolls:rolls, ts:Date.now() }; }   // BUG-08 persistence half
     sendTurn("(I roll "+skill+advTag+": "+total+")",rolls).catch(()=>{});
   }
   ```
2. **`src/world/dm.js` — resolveBranch missing-branch (864):**
   ```js
   if(!branch){ if(w.dm){ w.dm.rollReq=null; w.dm.pendingRoll={ action:"(I roll "+skill+": "+total+")", rolls:rolls, ts:Date.now() }; } sendTurn("(I roll "+skill+": "+total+")",rolls).catch(()=>{}); return; }
   ```
3. **`src/world/dm.js` — dmRollDice (903):**
   ```js
   GS.dm.rollReq=null; if(w.dm){ w.dm.rollReq=null; w.dm.pendingRoll={ action:"(I roll "+lab+": "+r.show+")", rolls:rolls, ts:Date.now() }; }
   ```
   (`rolls` is defined one line below today — hoist the `pendingRoll` set to AFTER `const rolls=[…]`
   at line 904 so it captures the array.)
4. **`src/world/dm.js` — applyResponse w.dm rebuild (602):** add `pendingRoll:null` to the rebuilt
   object so a delivered response clears the carried roll (the natural clear point).
5. **`dev/playtest-bridgeless.mjs` — `cmdRoll` (258):** when `!rq`, fall back to `pendingRoll`:
   ```js
   const rq = win.GS.dm.rollReq || (w.dm && w.dm.rollReq) || null;
   if (!rq) {
     const carried = (w.dm && w.dm.pendingRoll) || null;   // BUG-08 persistence half
     if (carried) { out({ ok:true, resolvedLocally:false, liveResolutionNeeded:true, pending:carried, recovered:true }); return; }
     out({ ok: false, reason: "no pending rollRequest" }); return;
   }
   ```
   And after a fresh fall-through, `save(dir,win)` already persists `w.dm.pendingRoll` (it is part of
   `win.U`) — no extra write needed. Surface `recovered:false` on the normal path for symmetry
   (optional).
6. **`dev/playtest-bridgeless.mjs` — `cmdDigest` (204–222):** it nulls `w.dm.rollReq` at 215 (production
   parity). Guard the peek footgun: (a) do NOT touch `w.dm.pendingRoll`; (b) surface both in the output
   BEFORE nulling:
   ```js
   const carriedRoll = (w.dm && w.dm.pendingRoll) || null;
   const outgoingRollReq = (w.dm && w.dm.rollReq) || null;   // captured before the null below
   ... (existing null of rollReq) ...
   out({ turnId, lane, laneReasons, lastResolution, pendingRoll: carriedRoll, clearedRollReq: outgoingRollReq, digestBytes, digest });
   ```
   (This makes a mid-roll `digest` non-destructive: the die was already in `pendingRoll`, and any
   unrolled `rollReq` it clears is echoed back so the runner can restore it — exactly the SET-05-NOTE-A
   manual recovery, now automatic.)

### Acceptance
- Nat-20 fall-through (real or seeded) → `state.json` holds `w.dm.pendingRoll={action,rolls,ts}`.
- A second `roll` returns `{ok:true, liveResolutionNeeded:true, pending:{…}, recovered:true}` — NOT `"no pending rollRequest"`.
- A `digest` between the fall-through and the follow-up turn preserves `w.dm.pendingRoll` and echoes it + the cleared `rollReq` in output.
- Applying the follow-up turn's response clears `pendingRoll` (applyResponse rebuild).

### Verify plan
- **`dev/verify-roll-branches.mjs` block 3b (174–184):** extend — after the stubbed-sendTurn nat-20
  fall-through, assert `world.dm.pendingRoll` is a **non-null object with `action`+`rolls`**
  (mutation-sensitive, sendTurn stubbed so the persistence isn't masked). Add a second assert: after
  a synthetic `applyResponse` the `pendingRoll` is null.
- **`dev/playtest-bug-probes.mjs` BUG-08 probe (557–571):** the old assert (`w.dm.rollReq!==null`
  PRESENT) is resolved; add a companion probe **BUG-08b** asserting the persistence half is present
  (`w.dm.pendingRoll` set after fall-through) — flips ● PRESENT → ○ resolved when D3 lands.
- **Harness self-check (new, `dev/verify-harness-d3.mjs` OR a section in an existing driver):** a
  scripted `init → digest → apply(rollRequest with branches) → roll(seed a nat-20) → [assert
  state.json pendingRoll] → roll again [assert recovered:true] → digest [assert pendingRoll preserved
  + echoed]`. Use `--seed` for a deterministic nat-20 (STATE-HYGIENE deterministic RNG).

---

## HQ3-D4 — absolute clock set in the harness (priority LOW, harness-only)

**Problem (SET-03-F2).** `advance` only moves the clock FORWARD by `--minutes`; a post-rest
double-advance overshoot was only correctable by hand-editing `state.json`. Need an absolute set,
allowed to move backward, for overshoot repair.

**Design.** Extend `cmdAdvance` with `--toClock "D:HH:MM"` (absolute, backward-allowed) and
`--toBand dawn|noon|dusk|night`. Direct assignment (L14) — NOT `advanceClock` (backward time must not
fire wake logic). Harness-only; no production code touched.

### Changes

1. **`dev/playtest-bridgeless.mjs` — dispatch (line 401):** parse the new args:
   ```js
   else if (cmd === "advance") cmdAdvance(args.dir, args.minutes ? parseInt(args.minutes,10) : 0, args.toNode || null, args.toClock || null, args.toBand || null);
   ```
2. **`cmdAdvance` (367):** add absolute-set logic BEFORE the `--minutes` block (an absolute set and a
   relative advance are mutually exclusive — if `toClock`/`toBand` given, ignore `--minutes`):
   ```js
   const BAND_MIN={ dawn:360, noon:720, dusk:1080, night:1320 };   // L15
   let setAbsolute=false;
   if (toClock) {
     const m=/^(\d+):(\d{1,2}):(\d{2})$/.exec(String(toClock).trim());
     if(!m){ out({ ok:false, reason:"bad --toClock (want \"D:HH:MM\")", got:toClock }); return; }
     const day=+m[1], hh=+m[2], mm=+m[3];
     if(hh>23||mm>59){ out({ ok:false, reason:"HH 0-23, MM 0-59", got:toClock }); return; }
     w.clock.day=day; w.clock.min=hh*60+mm; setAbsolute=true;
   } else if (toBand) {
     const b=String(toBand).trim().toLowerCase();
     if(BAND_MIN[b]==null){ out({ ok:false, reason:"bad --toBand (dawn|noon|dusk|night)", got:toBand }); return; }
     w.clock.min=BAND_MIN[b]; setAbsolute=true;   // keeps current day (L15)
   }
   if (!setAbsolute && minutes) win.advanceClock(w, minutes);   // existing relative path unchanged
   ```
   (`--toNode` still works alongside either mode.)

### Acceptance
- `advance --toClock "3:06:00"` → clock is Day 3, 06:00 exactly (dawn), regardless of prior value; a backward set (current Day 3 14:00 → `--toClock "3:06:00"`) succeeds.
- `advance --toBand dusk` → `min=1080`, day unchanged.
- `advance --toClock "3:99:00"` / `"garbage"` → `{ok:false,reason}`, state untouched.
- `--minutes` alone still advances forward exactly as before (regression).

### Verify plan
- **Harness self-check** (a section in `dev/verify-harness-d3.mjs` or a dedicated smoke): `init` a
  world, `advance --toClock "5:22:00"` → read `dmstate` clock == {day:5,min:1320}; `advance --toBand
  dawn` → min 360; a backward `--toClock` moves back; a malformed one returns `ok:false` AND the saved
  clock is unchanged (load the state after and compare).
- No production verify touched; **`check-manifest.py`** N/A (dev/ file), but run it anyway if any
  manifest-listed file changed (none here).

---

## HQ3-D5 — digest note compaction (priority LOW, characterization)

**Problem (SET-01-F3).** Over a continued thread the digest grew 14→20KB, driven by accumulating
codex `dm` notes. Need a compaction pass that bounds the per-record note payload in the DIGEST slice
without lossily rewriting stored state.

**Design.** **Already delivered by D2's `dmNotesForDigest` helper** (L16 budget = newest 6 + one
rollup count line). D5 is the explicit budget ruling + its own byte-regression guard. If D2 and D5
land together (recommended), D5 adds only the budget documentation + the dedicated diet check. If D5
lands separately, it is the `dmNotesForDigest` change from D2 §3 in isolation (the newest-first
ordering and the cap are one function).

### Ruling (defaults, L16)
- `DIGEST_NOTE_BUDGET = 6` newest notes shipped full, newest-first.
- When `notes.length > 6`, append ONE rollup line `{text:"…and N earlier notes (full history in
  stored state)", rollup:true}`.
- The rollup is a COUNT, never a content summary (no model call; SPEED-DOCTRINE).
- Stored `r.dm.notes` is NEVER truncated — only `codexFullRecord`'s projection compacts.

### Acceptance
- A record with 30 stored notes → digest `codex[<id>].dm.notes` has exactly 7 entries (6 newest + 1 rollup); the 6 are the newest, ordered newest-first; stored `r.dm.notes.length===30`.
- A record with ≤6 notes → all shipped, no rollup line.

### Verify plan
- **`dev/verify-digest-diet.mjs`**: build a record with 30 notes; assert (a) projected note count ==7;
  (b) rollup line present + `rollup:true`; (c) stored notes length still 30; (d) the per-record digest
  bytes fall under the diet budget with the cap vs. without (measure both, assert the cap wins).
- Shared with D2's verify-codex ordering asserts (do not duplicate — the ordering lives in D2's
  section, the byte budget in D5's).

---

## Build order & gates

1. **D1** (independent) — new events + marks migration; `--emit` the contract; verify-dm-events + diet.
2. **D2 + D5 together** (share `dmNotesForDigest`) — codex.js note stamping + digest projection + the
   two seat-prompt bullets + `supersedes` accept; `--emit`; verify-codex + diet.
3. **D3** (independent) — dm.js persistence + harness cmdRoll/cmdDigest; verify-roll-branches + BUG-08b
   probe + harness self-check.
4. **D4** (independent, harness-only) — cmdAdvance; harness self-check.

**Every unit, before merge:** `python3 build/check-manifest.py` (after any `src/` edit) + the unit's
named verify harness green + `python3 build/gen-dm-contract.py` (check mode) green for D1/D2. Never
trust a subagent's self-reported green — re-gate each unit personally (spec-rubric discipline).

**Boundary-normalization law compliance (audit before merge):** D1's `mark_added` handler clamps
`kind` (domain enum, like `condition_add`'s ontology gate) — no alias/numeric coercion added outside
`dmFoldPayload`. D2's note-object build is domain logic in `codexUpdate`; the only registry touch is
adding `supersedes` to `codex_update`'s accept-list. D3/D4 add no coercion. No handler hand-rolls a
`dmNum` or an alias — the HQ2-1 bug shape is not reintroduced.
