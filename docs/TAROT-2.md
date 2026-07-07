---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
---

# TAROT-2 — Tarot Maturation: strict Major schema, op vocabulary, landing receipt, minors metadata

Successor to `docs/TAROT-SESSION.md` (which stays canonical for the DRAW/vector/roller-hook layer —
this spec extends it; it supersedes only TAROT-SESSION's Major *entry shape* and the four remapped
op assignments listed in §2.3). Source of the outside read: `GPT-5.5-advice-for-Claude/README.md`
§Tarot Authoring Advice + §5 Tarot Receipt.

**Problem being solved (GPT read, confirmed against `data/tarot.js` — counts re-verified
2026-07-06 by `grep -oE 'op:"[a-zA-Z]+"' data/tarot.js | sort | uniq -c`):** too many Majors
collapse onto the same generic knobs — `archetypeWeight` appears **11×** across the 44 authored
polarities (the single most-used op — more than the next two combined), `noNudge` **4×** (The Fool
×2, Temperance up, The World rev = four blank cards). Cards differ poetically but land identically
in play. And nothing ever measures whether a card *landed* — tarot is untunable because it is
unobserved.

**Binding rulings honored (Adam 2026-07-06):** no model call anywhere in this unit (SPEED —
inference cost delta: **zero**); script owns nouns/numbers, DM owns verbs (every target is
script-picked at draw time; every landing is detected where mechanics allow, DM-declared only
where interpretation is genuinely required — the DETECTED-FIRST HYBRID pattern); `offerBargain` is
never forced; no new visual panel (blind-parity: every new surface is ledger/digest prose).

**Verified code refs (all re-read 2026-07-06):**
- `data/tarot.js:112-179` — `TAROT_MAJORS` (44 polarity entries `{omen,op,params,note}`)
- `src/engine/tarot.js:22-37` `tarotDraw` · `:44-52` `TAROT_DEFAULT_VECTOR` · `:82-94`
  `tarotMajorVector` · `:173-177` `tarotDigestCard` · `:183-191` `tarotFrontispiece`
- `src/world/play.js:256-290` `beginSession` (draw fires at :270-274) · `:306-319` `endSession`
- `src/world/dm.js:1218` `DM_EVENT_TYPES` (87 entries) · `:1237` `DM_EVENT_FIELDS` · `:1412`
  `applyEvent` · `:2649` `case "clock_advanced"` · `:2476` `case "codex_reveal"` · digest card at
  `:350` (`sessionLean.card`) and `:357` (top-level `tarot`)
- `src/world/dm.js:808` `findClockTarget(w,clockId)` — DEFINED at line 808 (line 818 is a body
  line); resolves FACTIONS by `slug(f.name)` and FRONTS by `slug(p.danger||p.kind)` — NOT by `p.id`
  (load-bearing for the §2.5 clock-resolver id vocabulary, finding 4/9)
- Live event payload field vocabulary (re-read 2026-07-06 from `DM_EVENT_FIELDS`, load-bearing for
  §3.2 D3): `clock_advanced` = `{clockId, delta}` · `clock_fired` = `{clockId, factionId, forPlayer}` ·
  `front_closed` = `{factionId, frontId, how, ledgerId}` · `fact_canonized` = `{factId, what}` (NO
  `id`) · `codex_reveal`/`codex_contact` = `{id}` · `codex_update` = `{id, …}` · `prep_contact` = `{enter, nodeId}`
- Codex record shape (re-read 2026-07-06, `src/world/codex.js:102-108`, `src/engine/codex-roll.js:124/165/250`):
  every record carries `.kind` ∈ `{"npc","item","location","creature","thing"}` (NOT `.type`; NEVER
  `"place"`) and node location `.status.at` (NOT `.at`) — load-bearing for §2.5 (finding 1/2/7/8)
- `src/world/seam.js:56-79` `seamHarvest` · `:26-44` `seamSalienceOf` · `:47-52` `seamProximity`
- `src/world/prep.js:416-428` `walkSetActive` · `src/world/saga.js:16-58` `computeSaga`
- `src/engine/skin-grants.js:231-269` `skinApplyMotif` · `:279-297` `applySkinGrants` (function
  DEFINED at line 279; body: line 282 `const motifKey`, line 283 BLANK, line 284 `skinApplyMotif(walk, motifKey);`)
- `src/engine/prep-bundle.js:73-76` `pbundleRollEnv` · `:135-138` (vector threading)
- `data/skin-motifs.js:20-256` — `SKIN_MOTIF_KITS` (13 real keys + `none`): `flood ice fire
  overgrowth fungal bone ash vermin void mirror clockwork consecrated timelost`
- `dev/verify-tarot.mjs` — 29 checks today (`29 passed, 0 failed`)
- Walk rollers accept `opts.world` already: `src/engine/dungeon-walk.js:613`,
  `src/engine/walk.js:619`, `src/engine/wild-walk.js:260`

---

## §1. The strict Major schema

Each `TAROT_MAJORS` entry keeps its card-level shape `{name, ordinal, up, rev}`. Each polarity
object (`up` / `rev`) is upgraded from `{omen, op, params, note}` to:

```js
{
  omen,        // string, 6–12 words, player-facing — UNCHANGED text (all 44 already authored;
               //   Adam's 5 anchors stay byte-verbatim — verify §2 check 2a keeps guarding this)
  op,          // string — MUST be a key of TAROT_OPS (§2.1, engine registry)
  params,      // object — exact per-op shape (§2.2); {} when the op takes none
  dmNote,      // string — concrete session instruction to the DM (replaces `note`; where the op
               //   is unchanged, start from the existing note text)
  visibleTell, // string ≤14 words — ONE concrete world observation the DM can plant in the first
               //   two scenes (what the player notices early)
  payoff       // string ≤18 words — the durable consequence path, NAMING the typed event or
               //   state bucket it lands through (ledger/clock/codex/walk/faction/item/NPC)
}
```

Rules:
- `dmNote`/`visibleTell`/`payoff` are **DM-only**: they ride `w.tarot.mutator` → digest. They
  never reach `tarotFrontispiece` (existing check 6g already guards the frontispiece key-set;
  extend it per §5).
- Back-compat alias: `tarotDraw` sets **both** `mutator.dmNote` and `mutator.note` (same string)
  so existing consumers (verify check 3c, digest readers, manifest desc) keep working. `note` is
  deprecated-but-present; do not remove it in this unit.
- **Text authoring split (per tonight's ruling):** the 44 `omen` strings are untouched. The 44×3
  new strings (`dmNote`, `visibleTell`, `payoff`) are drafted by the executor from the formula
  above + the worked examples in §2.4, and the whole text batch is **PROVISIONAL — Adam skims**
  (schema/ops/telemetry are locked executor work; card prose is Adam-supervised craft).

## §2. The op vocabulary

### §2.1 `TAROT_OPS` — the explicit registry (new, `src/engine/tarot.js`)

`data/tarot.js`'s header has always claimed ops live in "src/engine/tarot.js's TAROT_MAJOR_OPS" —
**no such symbol exists** (the `tarotMajorVector` switch is the de-facto registry). This unit
creates the real one and ends the doc-vs-code drift:

```js
const TAROT_OPS = Object.freeze({
  // numeric class — mechanized into the session vector (tarotMajorVector)
  noNudge:{cls:"numeric"}, archetypeWeight:{cls:"numeric"}, spiceNudge:{cls:"numeric"},
  ambientPoolBonus:{cls:"numeric"}, stockBias:{cls:"numeric"}, stealthDcBump:{cls:"numeric"},
  alterWalkTexture:{cls:"numeric"},                      // NEW — mechanized via vector.walkMotif (§2.2)
  // directive class — ride op/opParams(+target) through the digest; DM applies via typed events
  advanceHottestClock:{cls:"directive", target:"clock"},
  nominateOldestThread:{cls:"directive", target:"thread"},
  revealSecretOnStrange:{cls:"directive"},
  crackedLensBias:{cls:"directive"},                     // legacy — card-orphaned after §2.3; stays legal
  spotlightThread:{cls:"directive", target:"thread"},    // NEW
  surfaceHiddenFact:{cls:"directive", target:"codex"},   // NEW
  markOmenTarget:{cls:"directive", target:"codex"},      // NEW
  twistReward:{cls:"directive"},                         // NEW
  pressureFaction:{cls:"directive", target:"clock"},     // NEW
  offerBargain:{cls:"directive"},                        // NEW
  echoPast:{cls:"directive", target:"echo"},             // NEW
  openDoor:{cls:"directive"}, closeDoor:{cls:"directive"} // NEW ×2
});
```

`target:` names which resolver branch (§2.5) computes the card's script-picked carrier at draw
time. Ops without `target` are pure directives (no noun to pick, or the trigger picks it in play).

### §2.2 Exact param shapes + the engine seam each op drives

| op | params (exact) | class | engine seam it drives |
|---|---|---|---|
| `spotlightThread` | `{order:"salient"\|"oldest"}` | directive | thread carrier resolved at draw from codex hook/thread-seed records (same filter as `seamHarvest` src/world/seam.js:62-65); DM biases prep/walk/recall narration toward `mutator.target`; lands detected via `codex_update`/`codex_reveal`/`codex_contact`/`prep_contact`/`front_closed` id-match (§3.2) |
| `surfaceHiddenFact` | `{}` | directive | codex record with a real `dm.secret`/`dm.fear`/`dm.leverage` (rolled by `src/engine/codex-roll.js:130,278`) resolved at draw; DM surfaces the hidden field through a scene; lands via `codex_reveal`/`fact_canonized` id-match |
| `markOmenTarget` | `{prefer:"npc"\|"location"\|"item"\|null}` | directive | one codex record tagged the card's carrier for the session (target only — **no codex write at draw**; codex mutations stay event-driven). `prefer` values are the LIVE codex `.kind` vocabulary (`npc`/`location`/`item`/`creature`/`thing`) — **`"location"`, never `"place"`** (the codex kind is `location`; there is no `place` kind — findings 1/2). `prefer:null` → any kind. Lands via any §3.2 codex-family event id-match |
| `twistReward` | `{shape:"treasure"\|"bargain"\|"access"\|"truth"}` | directive | the next significant reward this session arrives reshaped (loot→bargain, coin→access, etc.); interpretive — lands **DM-declared** (`tarot_landed {via:"loot"}`) |
| `pressureFaction` | `{mode:"advance"\|"expose"}` | directive | hottest eligible clock resolved at draw via the §2.5 `target:"clock"` picker — normally a **faction** (`target.id` = `slug(f.name)`), falling back to a front (`target.id` = `slug(p.danger\|\|p.kind)`) only when no faction clock is eligible. Both id shapes are **exactly** what `findClockTarget` (src/world/dm.js:**808** — factions keyed `slug(f.name)`, fronts keyed `slug(p.danger\|\|p.kind)`) resolves, so both auto-detect at §3.2 D2 (the finding-4 front-id fix closed the old front false-negative). `advance` → DM emits `clock_advanced` on it (script applies the number, existing case :2649); `expose` → the power's hand shows in-fiction; both land detected on `clock_advanced`/`clock_fired` id-match; `expose` may also land via `tarot_landed {via:"faction-clock"}` |
| `alterWalkTexture` | `{motif:<one of the 13 real SKIN_MOTIF_KITS keys>}` | **numeric** | `vector.walkMotif` (§2.6) → `applySkinGrants` fills a motif-less walk's motif with the session motif (§2.7) — the ONE fully script-owned op; lands detected on `walk_advance`/`walk_complete` of a tarot-textured walk |
| `offerBargain` | `{price:"coin"\|"favor"\|"secret"\|"time", grants:"access"\|"item"\|"truth"\|"passage"}` | directive | a typed, **refusable** bargain presented through an NPC (DM-agency: the DM's will moves only through NPCs; the dmNote formula MUST include "offered, never forced"); lands DM-declared (`tarot_landed {via:"bargain"}`) |
| `echoPast` | `{}` | directive | one saga/past-life element resolved at draw from `computeSaga` (src/world/saga.js:16) / dead-PC roster; DM weaves it into prep; lands DM-declared (`tarot_landed {via:"echo"}`) |
| `openDoor` | `{}` | directive | one blocked path/clue/contact becomes unusually available; lands DM-declared (`tarot_landed {via:"door"}`) |
| `closeDoor` | `{}` | directive | one easy route closes while a stranger route is pointed to; lands DM-declared (`tarot_landed {via:"door"}`) |

Unknown/invalid `motif` key ruling: `tarotMajorVector` validates against `SKIN_MOTIF_KITS`
(`typeof SKIN_MOTIF_KITS!=="undefined" && params.motif in SKIN_MOTIF_KITS && params.motif!=="none"`);
invalid → `walkMotif` stays `null` (H3 discipline: degrade, never invent).

### §2.3 The complete 44-entry op assignment (LOCKED — zero latent decisions)

Omens all unchanged. **Changed rows are bold.** Every new op is used ≥1×; `noNudge` usage drops to
**zero** (the no-blank-Fool/Temperance ruling); `crackedLensBias` becomes card-orphaned (stays in
the registry as a legal legacy op — the Moon's old nearest-implementable substitute is retired by
a real visible-distortion op).

| Card | up | rev |
|---|---|---|
| 0 The Fool | **`openDoor {}`** (was noNudge — the existing note already says "an open door somewhere unexpected") | **`closeDoor {}`** (was noNudge — the foreseeable fall shuts the easy way) |
| 1 The Magician | `archetypeWeight {domain:"magic",mult:1.3}` | **`twistReward {shape:"bargain"}`** (was archetypeWeight — "the trick is played on you": the next reward has a hook in it) |
| 2 High Priestess | **`surfaceHiddenFact {}`** (was revealSecretOnStrange — now a NAMED target: "a secret sits patiently, waiting to be asked for") | `stealthDcBump {dc:1}` |
| 3 The Empress | `ambientPoolBonus {n:1}` | `stockBias {mult:0.7}` |
| 4 The Emperor | **`pressureFaction {mode:"expose"}`** (was archetypeWeight — order asserts itself: the dominant power shows its hand) | `spiceNudge {dir:1}` |
| 5 Hierophant | `archetypeWeight {domain:"social",mult:1.2}` | `spiceNudge {dir:1}` |
| 6 The Lovers | **`markOmenTarget {prefer:"npc"}`** (was archetypeWeight — one person carries the trust choice) | `ambientPoolBonus {n:-1}` |
| 7 The Chariot | **`openDoor {}`** (was archetypeWeight — momentum outruns planning) | **`closeDoor {}`** (was stockBias — wheels turning, going nowhere) |
| 8 Strength | `stealthDcBump {dc:-1}` | `archetypeWeight {domain:"threat",mult:1.25}` |
| 9 The Hermit | **`surfaceHiddenFact {}`** (was revealSecretOnStrange — the lone light now names what it shines on) | `ambientPoolBonus {n:-1}` |
| 10 Wheel of Fortune | `stockBias {mult:1.3}` | `stockBias {mult:0.6}` |
| 11 Justice | `nominateOldestThread {}` | **`surfaceHiddenFact {}`** (was archetypeWeight — the thumb on the scale can be found) |
| 12 Hanged Man | `revealSecretOnStrange {}` (kept — the Strange-trigger IS the inverted-perspective mechanic) | `spiceNudge {dir:-1}` |
| 13 Death ⚑ | `nominateOldestThread {}` (flagship anchor — unchanged) | `nominateOldestThread {softenClose:true}` |
| 14 Temperance | **`offerBargain {price:"favor",grants:"passage"}`** (was noNudge — the pouring angel is a brokered exchange; no blank Temperance) | `archetypeWeight {domain:"magic",mult:1.2}` |
| 15 The Devil | **`offerBargain {price:"secret",grants:"item"}`** (was stockBias — "a bargain tonight is better than it looks", literally) | **`pressureFaction {mode:"advance"}`** (was archetypeWeight — the chosen chain comes due as a predatory power's clock) |
| 16 The Tower ⚑ | `advanceHottestClock {}` (flagship anchor — unchanged) | `advanceHottestClock {ownedByPC:true}` |
| 17 The Star | `ambientPoolBonus {n:1}` | `stockBias {mult:0.8}` |
| 18 The Moon ⚑ | **`alterWalkTexture {motif:"mirror"}`** (flagship VISIBLE distortion — replaces the crackedLensBias substitute; the mirror kit's doubles/reflections literally ARE "Two roads tell two truths tonight") | **`surfaceHiddenFact {}`** (was revealSecretOnStrange — "the fog lifts on something worse than guessed", now named) |
| 19 The Sun ⚑ | `stealthDcBump {dc:1}` (kept — exposure mechanized; the new visibleTell/payoff carry the exposure doctrine: inventories, lies, wounds, motives all SEEN) | `stealthDcBump {dc:2}` (Adam anchor — unchanged) |
| 20 Judgement | **`echoPast {}`** (was nominateOldestThread — the overdue reckoning summons the past itself) | **`markOmenTarget {prefer:"npc"}`** (was archetypeWeight — the wrongly-blamed party carries the card) |
| 21 The World | `nominateOldestThread {completion:true}` | **`spotlightThread {order:"salient"}`** (was noNudge — "nothing quite finishes": the most-alive thread refuses to close) |

### §2.4 Worked text examples (the pattern for the 44×3 PROVISIONAL drafts)

**The Moon up** (op now `alterWalkTexture {motif:"mirror"}`):
- `dmNote`: `"every walk this session carries the mirror motif — doubles, reflections, a second of things; narrate the distortion as real and visible, never explain it"`
- `visibleTell`: `"Reflections are wrong tonight — puddles and blades show a second version."`
- `payoff`: `"a mirrored walk walked = auto-landing; a distrusted reflection proven true resolves via codex_reveal"`

**The Fool up** (op now `openDoor {}`):
- `dmNote`: `"one blocked path, clue, or contact is unusually available tonight — no cost attached; the leap is the player's to take or refuse"`
- `visibleTell`: `"A door that is always locked stands ajar."`
- `payoff`: `"taking the opening lands via tarot_landed {via:'door'}; the path taken persists on the map"`

**The Devil up** (op now `offerBargain {price:"secret",grants:"item"}`):
- `dmNote`: `"an NPC offers a genuinely valuable item priced in a secret — offered, never forced; honor a refusal completely; the hook is real but so is the value"`
- `visibleTell`: `"Someone is holding exactly what the party needs, and smiling."`
- `payoff`: `"an accepted bargain lands via tarot_landed {via:'bargain'}; the secret paid enters the codex dm-tier"`

### §2.5 `tarotResolveTarget(w, op, params)` — the draw-time noun picker (new, `src/engine/tarot.js`)

Pure read, no world mutation. Returns `{kind, id, label}` or `null`. Called by `tarotDraw` for ops
whose `TAROT_OPS[op].target` is set; result stored at `mutator.target`. All ties break
**deterministically**: higher score wins; tie → earlier in iteration order (array order /
`Object.keys` insertion order). All external symbols guarded `typeof x==="function"` (classic-
script call-time deps — register in manifest).

- `target:"thread"` — candidates: `w.codex.records` values where `legs`/`dm.legs` ∈
  {`"hook"`,`"thread-seed"`} and `!resolved` (byte-same filter as `seamHarvest`,
  src/world/seam.js:60-63). `params.order==="oldest"` → first by insertion order; else (`"salient"`
  and the `nominateOldestThread` op maps to `"oldest"` semantics per its name) score =
  `seamSalienceOf(e)` (guarded; fallback 0), tie → higher `(e.clock&&e.clock.val||0)/(e.clock&&e.clock.max||1)`.
  Result `{kind:"thread", id:e.id, label:e.name||e.id}`.
- `target:"clock"` — candidates, in this exact iteration order:
  1. `(w.factions||[])` as `{id:slug(f.name), label:f.name, filled:(f.clock&&f.clock.filled)|0, size:(f.clock&&f.clock.size)|0, fkind:"faction"}`
  2. `(w.pressures||[])` as `{id:slug(p.danger||p.kind||""), label:p.danger||p.kind, filled:(p.clock&&p.clock.filled)|0, size:(p.clock&&p.clock.size)|0, fkind:"front"}`

  **The front `id` MUST be `slug(p.danger||p.kind)` — NOT `p.id`, NOT `"front:"+kind`** — because
  that is the ONLY key `findClockTarget` (src/world/dm.js:808, front branch line 820) resolves a
  front by; a stored `p.id`-shaped id could never equal a folded `p.clockId` at §3.2 D2 (finding 4).
  **Exclude** `size<=0` and already-full (`filled>=size`) clocks. Score = `filled/size`; tie →
  faction before front (iteration order), then array order. Result `{kind:fkind, id, label}` — `id`
  is exactly the `clockId` vocabulary `findClockTarget` resolves.
  **Detection scope (locked):** both live `target:"clock"` ops — `pressureFaction` and
  `advanceHottestClock` — auto-detect at §3.2 D2 for BOTH a faction target (`t.id===slug(f.name)`)
  and a front target (`t.id===slug(p.danger||p.kind)`), because the stored `t.id` now equals
  exactly what `findClockTarget` resolves the folded `p.clockId` to (that was the whole point of the
  finding-4 front-id fix). No silent false-negative: a card that pressured a front lands the same as
  one that pressured a faction. (`pressureFaction`'s dmNote still frames a *faction* in fiction — a
  front target only occurs when no faction clock is eligible, and still lands cleanly.)
- `target:"codex"` — candidates: `w.codex.records` values, `!e.resolved`. For `surfaceHiddenFact`:
  require a truthy `e.dm && (e.dm.secret || e.dm.fear || e.dm.leverage)`. For `markOmenTarget`:
  prefer records whose **`e.kind===params.prefer`** (compare **case-insensitively** on the live
  codex kind vocabulary `npc`/`location`/`item`/`creature`/`thing` — **`e.kind`, NOT `e.type`**,
  which does not exist on codex records: src/world/codex.js:102, src/engine/codex-roll.js:124/165/250
  — finding 1/7; `prefer:null` → any); if no preferred-kind candidate exists, fall back to any kind.
  Score = `seamSalienceOf(e)` `+3` when **`e.status && e.status.at===w.currentNodeId`** (the node
  location is `.status.at`, NOT `.at`: src/world/codex.js:104,284 — finding 8).
  Result `{kind:(e.kind||"thing").toLowerCase(), id:e.id, label:e.name||e.id}` — the result `kind`
  is the record's REAL `.kind` (so §3.2 D3's `t.kind==="npc"` via-selection actually fires), never
  the literal `"codex"` (finding 1c).
- `target:"echo"` — take the last `status==="living"` PC in `w.characters` (else the most recent
  character of any status); run `computeSaga(w,c)` (guarded); pick the top-scored entry whose
  `type!=="place"` — fallback: top entry of any type — fallback: the most recent **non-living**
  character as `{kind:"echo", id:"char:"+slug(c.name), label:c.name}` — fallback `null`.
  Saga result → `{kind:"echo", id:entry.key, label:entry.name}`.

`null` target ruling: the op degrades to a directive-without-target — the DM improvises the
carrier in-fiction; landing then only via `tarot_landed`. Never a crash, never an invented noun.

### §2.6 Vector + engine plumbing changes (`src/engine/tarot.js`)

Before → after, per site:

**`TAROT_DEFAULT_VECTOR` (line 44):**
```js
// BEFORE (…stealthDcBump:0,)          // AFTER — one new field, same freeze:
  stealthDcBump:0,                        stealthDcBump:0,
                                          walkMotif:null,   // alterWalkTexture (§2.2) — session walk motif key, null = inert
```

**`tarotMajorVector` switch (line 85-92):** add one case before `default`:
```js
case "alterWalkTexture":
  v.walkMotif = (typeof SKIN_MOTIF_KITS!=="undefined" && p.motif && p.motif!=="none" && (p.motif in SKIN_MOTIF_KITS)) ? p.motif : null;
  break;
```

**New hook (beside `tarotStealthDcBump`, line 168):**
```js
function tarotWalkMotif(vector){ return (vector||TAROT_DEFAULT_VECTOR).walkMotif || null; }
```

**`tarotDraw` (line 22-37):** the `draw` object gains, before `w.tarot = draw`:
```js
// minors: computed metadata (§4) — never authored per-card
// majors: the strict-schema mutator + script-picked target (§2.5)
mutator: card.major ? {
  op:pol.op, params:pol.params||{},
  dmNote:pol.dmNote||null, note:pol.dmNote||null,        // `note` = deprecated alias (§1)
  visibleTell:pol.visibleTell||null, payoff:pol.payoff||null,
  target:(typeof tarotResolveTarget==="function" && TAROT_OPS[pol.op] && TAROT_OPS[pol.op].target)
           ? tarotResolveTarget(w, pol.op, pol.params||{}) : null,
} : null,
tone:  card.major ? null : tarotMinorMeta(card.suit, card.rank, reversed).tone,
handle:card.major ? null : tarotMinorMeta(card.suit, card.rank, reversed).handle,
rankSense: card.major ? null : (typeof TAROT_RANK_GRAMMAR!=="undefined" ? TAROT_RANK_GRAMMAR[card.rank]||null : null),
sense: (typeof TAROT_REVERSAL_SENSE!=="undefined") ? TAROT_REVERSAL_SENSE[reversed?"rev":"up"] : null,
landed: [],                                              // §3 telemetry — capped at 8
```
(Call `tarotMinorMeta` once into a local, not twice.)

**`tarotDigestCard` (line 173-177):**
```js
// AFTER
function tarotDigestCard(w){
  const d = w && w.tarot;
  if(!d) return null;
  const c = { name:d.name, reversed:d.reversed, omen:d.omen, sense:d.sense||null, mutator:d.mutator||null };
  if(!d.major){ c.tone=d.tone||null; c.handle=d.handle||null; c.rankSense=d.rankSense||null; }
  return c;
}
```
Digest byte cost (declared per SPEED): Major sessions ≈ +180 B (dmNote/visibleTell/payoff/target),
minor sessions ≈ +90 B (tone/handle/rankSense/sense) — ≤ +0.2 KB against the 9.0 KB median. The
`landed[]` array does **not** ride the per-turn digest (digest diet; it is end-of-session
telemetry only).

`tarotFrontispiece` is **untouched** — player surface stays name/omen/glyph only.

### §2.7 `alterWalkTexture` consumption seam (`src/engine/skin-grants.js:279-284` + prep-bundle)

The one mechanized new op. Rule: the session motif **fills a gap, never overrides a rolled fact** —
a walk whose skin rolled its own motif keeps it.

**`applySkinGrants` before (function DEFINED at line 279; the block below is lines 279-284
byte-verbatim — note the BLANK line 283 between `const motifKey` and `skinApplyMotif`, which the
executor's exact-string match MUST preserve):**
```js
function applySkinGrants(walk, skin, w){
  if(!walk || !skin) return walk;
  const grantsStr = skin.grants || "";
  const motifKey = skin.motif || "none";

  skinApplyMotif(walk, motifKey);
```
**After:**
```js
function applySkinGrants(walk, skin, w){
  if(!walk || !skin) return walk;
  const grantsStr = skin.grants || "";
  let motifKey = skin.motif || "none";
  // TAROT-2 §2.7 — alterWalkTexture: a motif-less walk takes the SESSION motif (The Moon et al.).
  // Gap-fill only: a skin that rolled its own motif keeps it. Guarded: no draw / no tarot module
  // → byte-identical behavior.
  if(motifKey==="none" && w && typeof tarotWalkMotif==="function" && typeof tarotVectorOf==="function"){
    const sessionMotif = tarotWalkMotif(tarotVectorOf(w));
    if(sessionMotif){ motifKey = sessionMotif; walk.motifSource="tarot"; walk.motifSession=w.session||0; }
  }
  skinApplyMotif(walk, motifKey);
```
Exact-edit note: the two site changes are (1) `const motifKey` → `let motifKey` on line 313, and
(2) the BLANK line 314 (between `motifKey` and `skinApplyMotif`) is replaced by the guarded
gap-fill block above. Everything downstream of `skinApplyMotif(walk, motifKey);` (the `grantsStr`
early-return, token loop) is untouched.
**`pbundleRollEnv` (src/engine/prep-bundle.js:73-76)** gains a 4th param `world`, passed as
`world:` into all three roller calls (they already read `opts.world` — dungeon-walk.js:613,
walk.js:619, wild-walk.js:260); the caller at :138 passes `opts.world`:
```js
// BEFORE: function pbundleRollEnv(env, region, tarot){ … rollDungeonWalk({ segCount:…, region, tarot }); }
// AFTER:  function pbundleRollEnv(env, region, tarot, world){ … rollDungeonWalk({ segCount:…, region, tarot, world }); }
// caller: const walk = pbundleRollEnv(env, region, tarot, opts.world||null);
```

## §3. The landing receipt — `tarotLanded[]` telemetry

### §3.1 Storage + writer (`src/engine/tarot.js`, new symbols)

Entry shape (LOCKED): `{card, via, ref, detected}` — `card` = the drawn card name (self-contained
when aggregated across sessions), `via` ∈ `TAROT_VIA`, `ref` = string id or `null`, `detected` =
`true` (script-captured) / `false` (DM-declared). Lives at `w.tarot.landed` (per-session by
construction — `tarotDraw` overwrites `w.tarot` each `beginSession`).

```js
const TAROT_VIA = Object.freeze(["walk-skin","faction-clock","thread","codex","npc","loot","bargain","door","echo","dm"]);

function tarotMarkLanded(w, entry){
  const d = w && w.tarot;
  if(!d || !entry || !entry.via) return null;
  const via = TAROT_VIA.indexOf(entry.via)>=0 ? entry.via : "dm";   // unknown via → coerce, warn
  if(via!==entry.via) console.warn("[tarot] unknown landing via, coerced to 'dm':", entry.via);
  d.landed = d.landed || [];
  const key = via+"|"+(entry.ref||"");
  const hit = d.landed.find(x => (x.via+"|"+(x.ref||""))===key);
  if(hit){ if(entry.detected && !hit.detected) hit.detected = true; return hit; }  // detected upgrades declared
  if(d.landed.length >= 8) return null;                              // cap — quiet drop
  const rec = { card:d.name, via, ref:entry.ref||null, detected:!!entry.detected };
  d.landed.push(rec); return rec;
}

function tarotReceiptOf(w){
  const d = w && w.tarot;
  if(!d) return null;
  return { card:d.name, reversed:!!d.reversed, major:!!d.major, landed:(d.landed||[]).slice() };
}
```
Captures are **quiet** (no per-capture ledger line); the single receipt line writes at endSession
(§3.4).

### §3.2 Detected capture — ONE insertion point (`src/world/dm.js` `applyEvent`, line 1412)

New engine function `tarotDetectFromEvent(w, type, p)` (in `src/engine/tarot.js`), called as the
**first statement after the folded payload `p` is bound and before the event `switch`** in
`applyEvent` — one guarded line, never per-case:

```js
// TAROT-2 §3.2 — detected-first landing capture (quiet; reads only, plus tarotMarkLanded)
try{ if(typeof tarotDetectFromEvent==="function") tarotDetectFromEvent(w, e.type, p); }catch(err){ console.warn("[tarot] detect failed", err); }
```

```js
function tarotDetectFromEvent(w, type, p){
  const d = w && w.tarot; if(!d || !type) return;
  p = p || {};
  const m = d.mutator, op = m && m.op, t = m && m.target;
  // D1 — alterWalkTexture: a tarot-textured walk actually walked THIS session
  if(type==="walk_advance" || type==="walk_complete"){
    if(typeof prepOf==="function" && typeof walkOfFrontier==="function"){
      const P = prepOf(w), wk = P && P.activeWalkId ? walkOfFrontier(w, P.activeWalkId) : null;
      if(wk && wk.motifSource==="tarot" && wk.motifSession===(w.session||0))
        tarotMarkLanded(w, { via:"walk-skin", ref:wk.motif||null, detected:true });
    }
    return;
  }
  if(!t) return;   // remaining detections all need a script-picked target
  // D2 — clock ops
  if((type==="clock_advanced" || type==="clock_fired") &&
     (op==="pressureFaction" || op==="advanceHottestClock") && p.clockId===t.id){
    tarotMarkLanded(w, { via:"faction-clock", ref:t.id, detected:true }); return;
  }
  // D3 — thread/codex ops: any codex-family event referencing the target id.
  // Per-type id key (verified against DM_EVENT_FIELDS, src/world/dm.js:1273-1305):
  //   codex_update/codex_reveal/codex_contact → p.id · fact_canonized → p.factId (NO p.id — finding 3)
  //   prep_contact → p.nodeId · front_closed → p.ledgerId/p.frontId. Read all, first non-null wins.
  if(["codex_update","codex_reveal","codex_contact","fact_canonized","prep_contact","front_closed"].indexOf(type)>=0){
    const id = p.id || p.factId || p.ledgerId || p.frontId || p.nodeId || null;
    if(id && id===t.id){
      const via = (op==="spotlightThread" || op==="nominateOldestThread") ? "thread"
                : (op==="markOmenTarget") ? (t.kind==="npc" ? "npc" : "codex")
                : "codex";                                    // surfaceHiddenFact + anything else targeted
      tarotMarkLanded(w, { via, ref:t.id, detected:true });
    }
  }
}
```
Placement ruling: top-of-applyEvent (before the handler runs) is accepted — the id-match against a
script-picked target is itself the evidence the card entered play; a failing handler with a
matching id is rare and tolerable. One insertion point beats seven per-case edits.

### §3.3 DM-declared capture — the `tarot_landed` event (new, `src/world/dm.js`)

For the interpretive ops (`twistReward`/`offerBargain`/`echoPast`/`openDoor`/`closeDoor`, plus any
minor-card landing the DM judges real). Registration — three exact edits:

1. `DM_EVENT_TYPES` (line 1218): append `"tarot_landed"` (87 → **88** entries).
2. `DM_EVENT_FIELDS` (line 1237 map): add `tarot_landed: { accept:["via","ref"] },`.
3. `applyEvent` switch — new case (place it beside `case "shrine_omen"`, the other omen-family
   event):
```js
case "tarot_landed":{                             // TAROT-2 §3.3 — the DM judges an interpretive landing real
  if(typeof tarotMarkLanded!=="function") return {ok:false, reason:"tarot-unavailable"};
  if(!w.tarot) return {ok:false, reason:"no-draw"};
  const rec = tarotMarkLanded(w, { via:p.via, ref:p.ref||null, detected:false });
  return { ok:true, landed:(w.tarot.landed||[]).length, deduped:!rec };
}
```
No ledger line here (quiet capture, §3.1). No XP, no reveal — pure telemetry.

### §3.4 End-of-session receipt (`src/world/play.js` `endSession`, lines 306-319)

Insert **after** the `seamHarvest` try-block (line 315) and before `saveU(U)` (line 316) — so
`w.carryForward` exists and the receipt rides it *without touching seam.js* (existing verify check
6e — `seam.js` must never reference tarot — **stays law**; the double-lean guard holds):

```js
// TAROT-2 §3.4 — the tarot receipt: did the card land? One ledger line + carry-forward telemetry.
try{
  if(typeof tarotReceiptOf==="function"){
    const tr = tarotReceiptOf(w);
    if(tr){
      if(w.carryForward) w.carryForward.tarotReceipt = tr;
      addLedger(w,"session",{kind:"tarot-receipt",card:tr.card,reversed:tr.reversed,landed:tr.landed},
        tr.landed.length
          ? `✦ ${tr.card}${tr.reversed?" (reversed)":""} — the card landed: ${tr.landed.map(x=>x.via).join(", ")}.`
          : `✦ ${tr.card}${tr.reversed?" (reversed)":""} — the omen went unspent.`);
    }
  }
}catch(e){ console.warn("[tarot] receipt failed",e); }
```
Blind-parity: the receipt IS prose (a ledger line in the existing accessible feed). No new visual
surface anywhere in this unit → no new prose twin owed.

## §4. Minors metadata — {tone, handle}, rank grammar, reversal semantics

Minors stay **systemic** (never 112 bespoke mechanical branches). All metadata is **computed at
draw time**, never authored per-card.

### §4.1 `tarotMinorMeta(suit, rank, reversed)` (new, `src/engine/tarot.js`)

Rank classes: `Ace`→`seed` · `Two/Five/Seven`→`tension` · `Three/Four/Six`→`structure` ·
`Eight/Nine/Ten`→`pressure` · `Page/Knight/Queen/King`→`court`.

`handle` matrix (suit × class) — *what the omen points at*:

| | seed | tension | structure | pressure | court |
|---|---|---|---|---|---|
| Swords | cost | person | clock | clock | person |
| Cups | person | person | place | cost | person |
| Coins | item | cost | place | item | person |
| Wands | place | cost | place | clock | person |

`tone`: if upright AND class===`pressure` → `"pressure"`; else upright by suit
{Swords:`"threat"`, Cups:`"offer"`, Coins:`"offer"`, Wands:`"reveal"`}; reversed by suit
{Swords:`"loss"`, Cups:`"loss"`, Coins:`"pressure"`, Wands:`"threat"`}. (All five tones reachable.)

**Matrix values PROVISIONAL** (taste — Adam may retune cells); the *mechanism* (computed, this
function, this signature, both enums exactly `tone ∈ threat|offer|loss|reveal|pressure`,
`handle ∈ person|place|item|clock|cost`) is LOCKED.

### §4.2 Rank grammar + reversal semantics (new consts, `data/tarot.js`)

```js
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
```
These ride the digest card (§2.6) so the DM reads reversal as *blocked/inward*, never flatly
"bad." Verbatim strings — do not paraphrase.

## §5. Verifier extensions — `dev/verify-tarot.mjs`

Current harness: **29 checks**, `29 passed, 0 failed` (re-verified 2026-07-06: `node
dev/verify-tarot.mjs` → last line `29 passed, 0 failed`). This unit ADDS **21 checks** (the §5-end
tally is authoritative: 9a-d=4, 10a-c=3, 11a-c=3, 12a-c=3, 13a-f=6, 14a-b=2 → 21) and AMENDS one
(3c). Final acceptance: **`node dev/verify-tarot.mjs` → exit 0, last line exactly `50 passed, 0
failed`** (29 + 21 = 50).

**RED-FIRST (rubric #7):** every new check MUST be written defensively (`typeof` guards /
try-catch per block — a missing symbol fails the check, never crashes the harness) and the
executor MUST run the extended harness against un-built master FIRST — expected output:
**`29 passed, 21 failed`** (every §9–§14 check red: fields/registry/telemetry don't exist yet).
Commit that red run's output in the branch's verification note, then build, then re-run to
`50 passed, 0 failed`.

Amendment — check 3c: when the draw is a Major, additionally assert
`typeof draw.mutator.dmNote==="string" && typeof draw.mutator.visibleTell==="string" && typeof draw.mutator.payoff==="string"`
and `draw.mutator.note===draw.mutator.dmNote` (alias intact).

New checks (IDs + assertions LOCKED; mutation checks assert the value MOVED — the BUG-01 lesson):

- **9a** — all 44 Major polarity entries carry non-empty string `omen/dmNote/visibleTell/payoff`,
  string `op`, object `params` (count the failures; expect 0).
- **9b** — `TAROT_OPS` exists (via a new `__tarotOps()` accessor, same const-via-eval pattern as
  line 41-42) and every one of the 44 `op` values is a key of it.
- **9c** — no-blank ruling: `noNudge` usage count across all 44 entries `=== 0`.
- **9d** — flagship pins (single check, 8 asserts): Tower up op `advanceHottestClock`; Death up op
  `nominateOldestThread`; Moon up op `alterWalkTexture` with `params.motif==="mirror"`; Moon up
  `visibleTell` non-empty; Sun rev op `stealthDcBump` `dc:2`; Fool up `openDoor`; Fool rev
  `closeDoor`; Temperance up `offerBargain`.
- **10a** — `tarotMinorMeta`: for all 4 suits × 14 ranks × 2 polarities (112 calls), `tone` ∈ the
  5-enum and `handle` ∈ the 5-enum (zero out-of-vocabulary results).
- **10b** — all court ranks map `handle:"person"` for every suit, both polarities (16 asserts).
- **10c** — a drawn minor's `tarotDigestCard` carries `tone/handle/rankSense/sense`, and
  `rankSense` for an Ace is exactly `"seed / first sign"`; a drawn Major's digest card carries
  `sense` but no `tone/handle/rankSense` keys.
- **11a** — resolver/thread: seed a world with two codex thread records (`dm.legs:"hook"`), one
  with `interactions:2` (salient) — `tarotResolveTarget(w,"spotlightThread",{order:"salient"})`
  returns the salient record's id; `{order:"oldest"}` returns the first-inserted id.
- **11b** — resolver/clock: `w.factions` = two factions with clocks 1/6 and 4/6 →
  `tarotResolveTarget(w,"pressureFaction",{mode:"advance"})` returns
  `{kind:"faction", id:slug(<4/6 faction name>)}`; a full 6/6 clock is never picked.
- **11c** — resolver degrade: an empty world (no codex/factions/pressures/characters) returns
  `null` for all four target classes; `tarotDraw` on that world still succeeds with
  `mutator.target===null` when a targeted Major is forced.
- **12a** — Moon-up vector: build `w.tarot` as The Moon upright → `tarotVectorOf(w).walkMotif==="mirror"`;
  `tarotWalkMotif(null)===null`; default vector `walkMotif===null`.
- **12b** — gap-fill: `applySkinGrants(walk, {motif:null,grants:""}, moonWorld)` sets
  `walk.motif==="mirror"`, `walk.motifSource==="tarot"`, `walk.motifSession===moonWorld.session`.
- **12c** — no override: `applySkinGrants(walk, {motif:"ash",grants:""}, moonWorld)` keeps
  `walk.motif==="ash"` and sets no `motifSource`.
- **13a** — `tarotMarkLanded` appends `{card,via,ref,detected}`; `landed.length` moves 0→1.
- **13b** — dedupe upgrade: declared then detected same via+ref → length STAYS 1 and the entry's
  `detected` MOVED `false→true` (assert both values).
- **13c** — cap: 10 distinct marks → `landed.length===8`.
- **13d** — `applyEvent(w,{type:"tarot_landed",payload:{via:"door"}})` on a drawn world →
  `ok:true`, length 0→1; unknown via `"xyzzy"` coerces to entry `via:"dm"`; on a world with
  `w.tarot` absent → `{ok:false, reason:"no-draw"}`. Also assert
  `DM_EVENT_TYPES.indexOf("tarot_landed")>=0` and `DM_EVENT_TYPES.length===88`.
- **13e** — detected clock landing end-to-end: force `w.tarot` = Devil reversed
  (`pressureFaction`) with `mutator.target={kind:"faction",id:slug(name),label:name}` matching a
  seeded faction; `applyEvent(w,{type:"clock_advanced",payload:{clockId:slug(name),delta:1}})` →
  `landed` gains `{via:"faction-clock", detected:true}` (0→1 moved) AND the clock itself moved
  (filled 1→2 — the detection never eats the real handler).
- **13f** — receipt: on a live session with one landed entry, `endSession()` writes a ledger line
  with `data.kind==="tarot-receipt"`, `data.landed.length===1`, `data.card===w.tarot.name`… and
  `w.carryForward.tarotReceipt.landed.length===1`; on a zero-landed session the prose contains
  `"went unspent"`. (Existing check 6e — seam.js contains no `/tarot/i` — MUST still pass; the
  receipt enters carryForward from play.js only.)
- **14a** — MUTATION shown RED then restored: neuter `tarotMarkLanded`'s dedupe key (source-string
  replace `const key = via+"|"+(entry.ref||"");` → `const key = Math.random().toString(36);`,
  rebuild the jsdom scope from mutated source — same §8 pattern) → two identical marks yield
  `landed.length===2` under the mutation (the leak is VISIBLE); restored source yields 1.
- **14b** — MUTATION shown RED then restored: force `TAROT_DEFAULT_VECTOR`'s `walkMotif:null` →
  `walkMotif:"mirror"` in mutated source → `tarotWalkMotif(null)` leaks `"mirror"` under the
  mutation; restored source returns `null` (the no-draw inertness guard is load-bearing).

Count (LOCKED, matches the §5 intro): 9a-d (4) + 10a-c (3) + 11a-c (3) + 12a-c (3) + 13a-f (6) +
14a-b (2) = **21 new checks**. 29 existing + 21 new = **50 total**. LOCKED FINAL: **50 checks, last
line `50 passed, 0 failed`**; red-first run against un-built master `29 passed, 21 failed`.

## §6. Full file/edit manifest

| file | edit |
|---|---|
| `data/tarot.js` | 44 polarity entries → strict schema (§1) with the §2.3 op table; `TAROT_RANK_GRAMMAR` + `TAROT_REVERSAL_SENSE` (§4.2). Hand-authored source — edit directly (header says so). |
| `src/engine/tarot.js` | `TAROT_OPS`, `TAROT_VIA`, `tarotMinorMeta`, `tarotResolveTarget`, `tarotWalkMotif`, `tarotMarkLanded`, `tarotDetectFromEvent`, `tarotReceiptOf`; amend `tarotDraw`, `TAROT_DEFAULT_VECTOR`, `tarotMajorVector`, `tarotDigestCard` (§2.5-2.6, §3.1-3.2). |
| `src/engine/skin-grants.js` | `applySkinGrants` gap-fill seam (§2.7). |
| `src/engine/prep-bundle.js` | `pbundleRollEnv` 4th param `world` + caller (§2.7). |
| `src/world/dm.js` | `DM_EVENT_TYPES` +`"tarot_landed"`; `DM_EVENT_FIELDS` entry; `applyEvent` detect call + new case (§3.2-3.3). |
| `src/world/play.js` | `endSession` receipt block (§3.4). |
| `dev/verify-tarot.mjs` | +21 checks, 1 amended (§5). |
| `manifest.json` | `data.tarot` owns += `TAROT_RANK_GRAMMAR`,`TAROT_REVERSAL_SENSE`; `engine.tarot` owns += the 8 new symbols, callTimeDeps += `seamSalienceOf`,`computeSaga`,`slug`,`walkOfFrontier`,`prepOf` (+`SKIN_MOTIF_KITS` if check-manifest tracks data symbols in callTimeDeps); `engine.skin-grants` callTimeDeps += `tarotWalkMotif`,`tarotVectorOf`; `world.dm` callTimeDeps += `tarotDetectFromEvent`,`tarotMarkLanded`; `world.play` callTimeDeps += `tarotReceiptOf`; update both tarot module `desc` strings (`{omen,op,params,note}` → the strict schema). |

**DON'T TOUCH (hard list):** `tables.json` / `tables.js` / `data/bestiary.js` /
`data/realm-bestiary.js` / `data/class-progression.js` / `data/wiki.js` (generated — spec
generator edits only, and this unit needs none) · **`src/world/seam.js`** (check 6e law — the
receipt enters carryForward from play.js) · `src/world/dm.js`'s digest blocks at :350/:357 (they
already call `tarotDigestCard`; the shape change flows through untouched) · `tarotFrontispiece` +
`beginSession`'s frontispiece log line (player surface frozen) · `data/skin-motifs.js` ·
`docs/DM-BRIDGE.md` (never mid-live-session; the EVENT-CONTRACT line lands via Registry updates) ·
existing verify-tarot checks 1–8 semantics (3c amended as specified, nothing else).

## §7. Edge cases — enumerated rulings

1. **Session 1 / empty world** — resolvers return `null`; targeted ops degrade to
   directive-without-target; landing only via `tarot_landed`. Never invent a noun (H3).
2. **Minor drawn** — `mutator:null` as today; `tarot_landed` still legal (any via, detected:false).
3. **Two events hit the same target** — dedupe keeps one entry; `detected:true` wins in place.
4. **`tarot_landed` with out-of-enum via** — coerce `"dm"`, console.warn, still counted.
5. **`tarot_landed` before any draw** — `{ok:false, reason:"no-draw"}`, no crash, no ledger.
6. **`alterWalkTexture` invalid motif key** — vector `walkMotif` stays `null` (validated against
   `SKIN_MOTIF_KITS` at vector build; `"none"` counts as invalid).
7. **Walk textured in session N, walked in session N+1** — `motifSession` stamp mismatch →
   detection skips (the old card's landing is forfeit; the new card gets no false credit).
8. **Several walks textured the same session** — via `"walk-skin"` + same motif ref dedupes to one
   entry.
9. **Deck absent / draw failed** — `w.tarot` null; every new surface (`tarotDetectFromEvent`,
   receipt, digest) is null-safe no-op (existing guard pattern).
10. **Zero eligible clocks (all full or none)** — clock resolver returns `null` (rule 1 applies).
11. **`echoPast` with no living PC** — most recent character of any status; none → `null`.
12. **Landed cap (8) reached** — further captures dropped silently; the receipt notes only what's
    recorded.
13. **`clock_advanced` untracked branch** (dm.js:2664) — detection matched only against the stored
    target id; untracked clockIds never match; the untracked handler runs unchanged.
14. **`markOmenTarget {prefer:"item"}` with no item records** — falls back to any-kind candidate;
    none → `null` (rule 1).
15. **DM emits `clock_advanced` on the target with `delta:0`** — id matches → landing recorded
    (the card reached the table; magnitude is the clock system's business, not telemetry's).

## §8. Acceptance (commands + expected numbers)

Run from repo root, in order:

1. `node dev/verify-tarot.mjs` **before building** (extended harness, un-built code) →
   exit 1, last line `29 passed, 21 failed` (RED-FIRST proof — capture in the branch note).
2. Build per §6, then `node dev/verify-tarot.mjs` → exit 0, last line **`50 passed, 0 failed`**.
3. `python3 build/check-manifest.py` → exit 0 (all new symbols registered, no orphans/drift).
4. `node dev/verify-dm-events.mjs` → exit 0, `0 failed` in its summary (it asserts behavior, not
   the DM_EVENT_TYPES count — verified 2026-07-06; if any check newly references the event-type
   count, the expected value is 88).
5. `node dev/verify-tarot.mjs` twice more (draw randomness soak) → `50 passed, 0 failed` both.
6. Full sweep: every other `dev/verify-*.mjs` that ran green on master still exits 0 (notably
   `verify-gap-callers.mjs` §6 — `crackedLensBias` rides op/opParams; the op stays registered even
   though card-orphaned, so its resolution path still verifies).

Executor discipline: orchestrator re-runs 1–6 personally (never trust self-reported green).

## §9. PROVISIONAL summary (Adam's skim list)

- The 44×3 new card strings (`dmNote`/`visibleTell`/`payoff`) — executor-drafted per §2.4 formula.
- The §4.1 tone/handle matrix cell values (mechanism locked, values tunable).
- The receipt ledger prose pair (`"the card landed: …"` / `"the omen went unspent."`).
- Everything else in this spec is LOCKED.

## Registry updates

*(Fable applies these one-liners; this spec's executor does NOT.)*

- `docs/DESIGN.md` — add decision row: "TAROT-2 (2026-07-06): strict Major schema
  {omen,op,params,dmNote,visibleTell,payoff}; 10-op vocabulary + TAROT_OPS registry; script-picked
  draw-time targets; tarotLanded[] receipt (detected-first hybrid + tarot_landed event, 87→88);
  minors {tone,handle} computed never authored; no blank Fool/Temperance; Moon=visible distortion
  (mirror motif) → docs/TAROT-2.md."
- `docs/NEXT-STEPS.md` — under the specced-deferred block: "⭐ TAROT-2 — ☑ SPEC-LOCKED 2026-07-06
  (`docs/TAROT-2.md`), build DEFERRED post-Fable; depends on nothing in-flight; unblocks tarot
  tunability (receipt telemetry)."
- `docs/README.md` — index line after TAROT-SESSION.md's: "`TAROT-2.md` — tarot maturation: strict
  Major schema, op vocabulary, landing receipt, minors metadata (SPEC-LOCKED 2026-07-06,
  type: system-spec)."
- `docs/TAROT-SESSION.md` — top note: "Extended by `docs/TAROT-2.md` (2026-07-06): Major entry
  shape + 4 op remaps superseded there; the crackedLensBias Moon substitute is retired by
  alterWalkTexture{mirror}."
- `docs/EVENT-CONTRACT.md` — event list gains `tarot_landed {via, ref?}` (telemetry; quiet; DM
  declares an interpretive card landing; unknown via coerces "dm").
- Cowork auto-memory (project-genesis tarot line) — append: "TAROT-2 SPEC-LOCKED 07-06: ops/receipt
  /minors-meta; build deferred."
