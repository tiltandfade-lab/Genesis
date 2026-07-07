---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
created: 2026-07-06
related:
  - "[[SPICE-CURVE]]"
  - "[[SPICE-RULER]]"
  - "[[REGIONS-NAMES]]"
  - "[[WALK-REFRESH]]"
  - "[[BREACH]]"
  - "[[DM-CHARTER]]"
---

# SPICE-RAISE — the adopted spicy-world stance

**One sentence:** Genesis's baseline world becomes SPICY (25/25/25/17/8), hotter through the
fray, genuinely bizarre at the rim — implemented as a **band-first roll layer** (pick the band
from the region tier's weights, then a row within it) so the adopted distribution lands
**without touching a single authored table row** (row re-authoring is Adam's craft pass, out of
scope here). This SUPERSEDES the conservative 66/20/9/4/1 band-share law as a *play-time
distribution*; 66/20/9/4/1 survives only as an authoring **coverage** guarantee.

Adopted verbatim from `GPT-5.5-advice-for-Claude/README.md` §Spice Curve Update, ruled binding
by Adam 2026-07-06 ("the GPT spicy-world baseline is ADOPTED; Spice Ruler = labeling
discipline, not distribution cowardice").

**Inference cost: ZERO.** Every mechanism below is a client-side weighted pick + row filter. No
model call anywhere in the loop (SPEED-DOCTRINE compliant).

---

## §0. The stance (locked rulings)

1. **Distribution targets per region tier** (GPT distributions verbatim; percentages of 100):

   | Tier | Grounded | Textured | Strange | Volatile | Mythic | Geography (`hexDist` from origin) |
   |---|---|---|---|---|---|---|
   | `baseline` (spicy world) | 25 | 25 | 25 | 17 | 8 | `d ≤ FRAY_1` (15) |
   | `fray1` | 10 | 20 | 35 | 25 | 10 | `FRAY_1 < d ≤ FRAY_2` (15..28) |
   | `fray2` | 0 | 10 | 35 | 35 | 20 | `FRAY_2 < d ≤ FRAY_D` (28..40) |
   | `rim` (outer rim / deep breach) | 0 | 5 | 25 | 45 | 25 | `d > FRAY_D` (40) |

   GPT gave the rim as ranges (`0 / 0-5 / 25 / 45 / 25-30`). **LOCKED: 0/5/25/45/25** — the
   Textured sliver keeps contrast alive at the rim (pure wall-to-wall weird flattens into its
   own normal). ⚠ PROVISIONAL (taste): Adam may prefer the full-bizarre point `0/0/25/45/30`;
   flipping is a 2-number edit to `SPICE_WEIGHTS.rim`. Recommended default: as locked.

2. **Grounded is redefined** — concrete human pressure (scarcity, law, debt, weather, injury,
   jealousy, material stakes), **never filler**. §5 carries the verbatim SPICE-RULER edit.
3. **Spice Ruler survives as LABELING discipline** — it grades which band a row *enters*
   (honesty), never how often bands *fire* (distribution). §5.
4. **DM license** — explicit license to invent connective weirdness, scaled to tier, **iff**
   durable consequences are captured into typed events / codex / ledger / map. §4 carries the
   verbatim DM-CHARTER addendum.
5. **The 66/20/9/4/1 band-share law is superseded as distribution** everywhere it is taught
   (full enumeration + per-site instructions: §10 Supersession list). Row layout keeps that
   share as an authoring-coverage floor — every band represented, ceiling honest — because
   band-first selection makes layout share irrelevant to play frequency (layout now only
   controls within-band variety).
6. **Row re-authoring is OUT OF SCOPE** — that is Adam's craft pass (see
   `feedback-genesis-reauthoring-definition`). This spec is stance + mechanics + descriptions.

---

## §1. Where the old distribution actually lives (verified map: CODE vs AUTHORED)

**CODE-side distributions (the real levers — these change):**

| Site | What it is today (verified) |
|---|---|
| `src/engine/walk.js:183-188` `walkSpiceBand()` / `walkIsStrangePlus()` | THE code-side curve: hardcoded d100 thresholds `n<=66 Grounded / <=86 Textured / <=95 Strange / <=99 Volatile / 100 Mythic`. Gates walk-skin spice, Discovery macguffins (`dungeon-walk.js:437`, `wild-walk.js:107`, `walk.js:482`), monster-flavor d8 ceiling (`dm.js:1072`). |
| `src/engine/region.js:71-78` `fraySpiceFloor()` | The old fray answer: beyond FRAY_1, floor rises to Textured (re-roll-toward). Superseded by tier weights → **RETIRED** (§3-A). Sole live consumer: `regionEnsure` (region.js:156-167). |
| `src/engine/compiled.js:15-23` `rollTable(id)` | Flat honest dice over the authored row layout — the layout's 66/20/9/4/1 IS the play distribution for every compiled-table consumer today. `rollTable` itself stays untouched; new band-first primitives ride beside it (§3-B). |
| `src/world/turn.js:167-175` place-drift roll + escalation floor | Flat `rollTable("place-drift")`; escalation re-rolls toward Textured. Base roll converts to band-first (§3-H); the escalation re-roll mechanism is KEPT (demand-driven, orthogonal to geography). |
| `src/engine/breach.js:35-70` 2d10 bell + `breachFrayMod` | Already implements "hotter rim" for the nightmare/breach TAILS. **UNCHANGED** (ruled §6-E5). |

**AUTHORED shares (table row layout — NOT touched):** every d100/d300 spice-graded table lays
rows out 66/20/9/4/1 (or ×3). Under band-first rolling this layout stops mattering to play
frequency. No Engine markdown row/layout edits in this unit.

**Generators:** `Engine/00. _System/compile-tables.py` and `build/lint-tables.py` enforce
coverage + band-monotonic layout, NOT shares — no distribution lives there (verified: lint
checks band ordering per roll range only). `build/corpus-intensity-map.py` REPORTS measured
shares per table — legend edit only (§10 item 9).

---

## §2. New mechanical surface (exact symbols + signatures)

All new symbols follow the repo's classic-`<script>`/global + `typeof`-guard discipline.

### 2a. `src/engine/region.js` — the tier authority (owns the geography, so it owns the weights)

```js
/* SPICE-RAISE §2a — the adopted spicy-world tier weights (Adam, 2026-07-06; GPT distributions
   verbatim, rim locked 0/5/25/45/25). Percentages; each row sums to 100. */
const SPICE_WEIGHTS = {
  baseline: { Grounded:25, Textured:25, Strange:25, Volatile:17, Mythic:8  },
  fray1:    { Grounded:10, Textured:20, Strange:35, Volatile:25, Mythic:10 },
  fray2:    { Grounded:0,  Textured:10, Strange:35, Volatile:35, Mythic:20 },
  rim:      { Grounded:0,  Textured:5,  Strange:25, Volatile:45, Mythic:25 }
};
/* spiceTierAt(q,r) -> "baseline"|"fray1"|"fray2"|"rim". null/undefined coords -> "baseline"
   (headless / unplaced node: never assume rim-ward — same default as breachFrayMod). */
function spiceTierAt(q, r){
  if(q==null || r==null) return "baseline";
  const d=hexDist(q, r);
  if(d>FRAY_D)  return "rim";
  if(d>FRAY_2)  return "fray2";
  if(d>FRAY_1)  return "fray1";
  return "baseline";
}
/* spiceBandPick(tier) -> one band, weighted by SPICE_WEIGHTS[tier] (unknown tier -> baseline). */
function spiceBandPick(tier){
  const wts=SPICE_WEIGHTS[tier]||SPICE_WEIGHTS.baseline;
  let n=Math.random()*100;
  const ladder=["Grounded","Textured","Strange","Volatile","Mythic"];
  for(let i=0;i<ladder.length;i++){ n-=wts[ladder[i]]; if(n<0) return ladder[i]; }
  return "Mythic";
}
/* spiceTierForNode(w,nodeId) — READ-ONLY tier resolve for a placed node (mirrors regionPeekNode:
   never mints, never rolls). No coords -> "baseline". */
function spiceTierForNode(w, nodeId){
  if(!w || typeof nodeXY!=="function" || typeof worldToAxial!=="function") return "baseline";
  const xy=nodeXY(w, nodeId); if(!xy) return "baseline";
  const a=worldToAxial(xy.x, xy.y);
  return spiceTierAt(a.q, a.r);
}
```

### 2b. `src/engine/compiled.js` — band-first primitives (beside `rollTable`, never replacing it)

```js
/* SPICE-RAISE §2b — band-first row pick: uniform among the table's rows AT the target band,
   stepping DOWN the ladder when the band has no rows (a table's class ceiling is law — asking a
   Spark table for Mythic serves its hottest available band, never invents heat). Ungraded table
   (no row matches any band at/below target) -> honest flat rollTable fallback. Missing table -> null. */
function rollTableAtBand(id, band){
  const t=CT()[id]; if(!t) return null;
  const ladder=["Grounded","Textured","Strange","Volatile","Mythic"];
  let bi=ladder.indexOf(band);
  if(bi<0) return rollTable(id);
  for(; bi>=0; bi--){
    const rows=t.rows.filter(r=>r[2]===ladder[bi]);
    if(rows.length){
      const row=rows[Math.floor(Math.random()*rows.length)];
      const total=row[0]+Math.floor(Math.random()*(row[1]-row[0]+1)); // an honest total WITHIN the row's range, so "#total" refs stay real
      const dice=t.dice||("d"+t.die);
      return {id,dice,total,band:row[2],text:row[3],fragment:row[4],cells:row[5]||null,
              legs:row[6]||"",pool:row[7]||"",grants:row[8]||"",motif:row[9]||"",bandTarget:band};
    }
  }
  return rollTable(id);
}
/* rollTableSpiced(id,tier) — the one-call consumer surface: tier -> band -> row. Degrades to
   flat rollTable when engine.region hasn't loaded (lean harness). */
function rollTableSpiced(id, tier){
  if(typeof spiceBandPick!=="function") return rollTable(id);
  return rollTableAtBand(id, spiceBandPick(tier||"baseline"));
}
```

Return shape = `rollTable`'s exactly, plus one additive field `bandTarget` (the band the tier
weights asked for; equals `band` unless step-down fired). No existing consumer breaks: all
fields they read are present and same-typed.

### 2c. `src/engine/walk.js` — the curve reads the weights; tier context rides `GS`

```js
/* SPICE-RAISE §2c — walkSpiceBand now draws from the region tier's weights. `tier` optional;
   default = the active walk's tier (GS.walkSpiceTier, stamped at walk assembly) else baseline.
   Fallback thresholds (engine.region absent) = the ADOPTED baseline curve, cumulative 25/50/75/92/100. */
function walkSpiceBand(tier){
  const t=tier || (typeof GS!=="undefined" && GS.walkSpiceTier) || "baseline";
  if(typeof spiceBandPick==="function") return spiceBandPick(t);
  const n=1+Math.floor(Math.random()*100);
  if(n<=25) return "Grounded"; if(n<=50) return "Textured"; if(n<=75) return "Strange";
  if(n<=92) return "Volatile"; return "Mythic";
}
function walkIsStrangePlus(tier){ const b=walkSpiceBand(tier); return b==="Strange"||b==="Volatile"||b==="Mythic"; }
/* SPICE-RAISE loot-gate ratchet (§3-C ruling): item-minting gates step up one band with the
   hotter curve — Volatile+ is 25% at baseline / 70% at rim (vs old Strange+ 14% flat). */
function walkIsVolatilePlus(tier){ const b=walkSpiceBand(tier); return b==="Volatile"||b==="Mythic"; }
```

`rollWalkSkin` goes band-first (same signature + one optional arg):

```js
function rollWalkSkin(envKind, tier){
  if(typeof rollTable!=="function") return null;
  const t=tier || (typeof GS!=="undefined" && GS.walkSpiceTier) || "baseline";
  const r=(typeof rollTableSpiced==="function") ? rollTableSpiced("walk-skin-"+envKind, t)
                                                : rollTable("walk-skin-"+envKind);
  if(!r || !r.text) return null;
  return { text:r.text, band:r.band||null, ref:"walk-skin-"+envKind+"#"+r.total };
}
```

Because the default reads `GS.walkSpiceTier`, the entire existing bias chain
(`tarotSpiceBiasedSkin` → `regionBiasedWalkSkin` → `rollWalkSkin`, and `rollWalkSkinBreach`'s
`centerFn`) inherits band-first behavior **with zero signature changes through the chain**.

### 2d. `src/state.js` — the one new GS slot (CLAUDE.md: new mutable state goes in GS)

Add to the `GS = { ... }` literal (after `chase: null,`):

```js
  walkSpiceTier: "baseline",    // SPICE-RAISE: the active walk's region spice tier (baseline|fray1|fray2|rim), stamped at walk assembly; read by walkSpiceBand/rollWalkSkin defaults
```

---

## §3. Edit sites — worked before→after per site

### SITE A — `src/engine/region.js`

**A1.** Insert §2a's `SPICE_WEIGHTS` / `spiceTierAt` / `spiceBandPick` / `spiceTierForNode`
block immediately after `frayBeyond2` (line 66).

**A2. RETIRE `fraySpiceFloor`** (lines 68-78 incl. its comment). Superseded: the tier weights
ARE the floor (fray1 has its own Grounded 10, which the old hard floor-to-Textured would
wrongly forbid).

**A3.** `frayMythicUnlocked` (line 79-83): KEEP; update its comment's "top 1%" sentence to
"walkSpiceBand reaches Mythic everywhere (8% baseline → 25% rim, SPICE-RAISE) — this flag stays
forward-wiring for a future DM-facing Mythic-gate option, informational today."

**A4. `regionEnsure` roll block** — before (lines 155-167):

```js
  let roll=(typeof rollTable==="function") ? rollTable("region-identity") : null;
  const rim=frayBeyond1(at.center.q, at.center.r);   // §2: identities rolled beyond FRAY_1 skew stranger
  // §2: "Region identities rolled beyond FRAY_1 roll their character on the stranger sub-band" — ...
  if(roll && rim){
    const floored=fraySpiceFloor(roll.band, at.center.q, at.center.r);
    if(floored!==roll.band){
      const order=(typeof SPICE_ORDER!=="undefined")?SPICE_ORDER:["Grounded","Textured","Strange","Volatile","Mythic"];
      const r2=rollTable("region-identity");
      if(r2 && order.indexOf(r2.band)>=order.indexOf(floored)) roll=r2;
    }
  }
```

after:

```js
  // SPICE-RAISE: region identity rolls band-first at the cell's own tier — the tier weights
  // subsume the old fraySpiceFloor re-roll (retired).
  const tier=spiceTierAt(at.center.q, at.center.r);
  let roll=(typeof rollTableSpiced==="function") ? rollTableSpiced("region-identity", tier)
          : ((typeof rollTable==="function") ? rollTable("region-identity") : null);
  const rim=frayBeyond1(at.center.q, at.center.r);   // kept: the record's rim flag (consumers unchanged)
```

**A5.** Add `spiceTier: tier,` to the `rec` literal (after `rim,` at line 186) — additive
field, queryable via peek-state.

### SITE B — `src/engine/compiled.js`: append §2b verbatim after `rollTable`. `rollTable`
itself is byte-untouched.

### SITE C — `src/engine/walk.js`

**C1.** Replace lines 179-188 (comment + `walkSpiceBand` + `walkIsStrangePlus`) with §2c's
curve block (update the comment to cite SPICE-RAISE; note WALK-REFRESH §2.3's curve is
superseded).

**C2.** Replace `rollWalkSkin` (lines 213-218) with §2c's version; extend its doc comment
(lines 205-212) with one line: "SPICE-RAISE: band-first at the walk's tier — the authored
layout is coverage, the tier weights are the distribution."

**C3. Urban assembly stamp** — before (lines 507-511):

```js
  const nodeAt = (opts.world && typeof nodeXY==="function") ? nodeXY(opts.world, opts.world.currentNodeId) : null;
  const hexAt = (nodeAt && typeof worldToAxial==="function") ? worldToAxial(nodeAt.x, nodeAt.y) : null;
  const skin = (typeof rollWalkSkinBreach==="function")
      ? rollWalkSkinBreach("urban", { q: hexAt&&hexAt.q, r: hexAt&&hexAt.r, centerFn: centerSkinFn })
      : centerSkinFn();
```

after:

```js
  const nodeAt = (opts.world && typeof nodeXY==="function") ? nodeXY(opts.world, opts.world.currentNodeId) : null;
  const hexAt = (nodeAt && typeof worldToAxial==="function") ? worldToAxial(nodeAt.x, nodeAt.y) : null;
  // SPICE-RAISE: resolve + stamp the walk's region spice tier BEFORE any skin/segment roll fires,
  // so every downstream walkSpiceBand/rollWalkSkin default reads this walk's geography.
  const spiceTier=(typeof spiceTierAt==="function") ? spiceTierAt(hexAt&&hexAt.q, hexAt&&hexAt.r) : "baseline";
  if(typeof GS!=="undefined") GS.walkSpiceTier=spiceTier;
  const skin = (typeof rollWalkSkinBreach==="function")
      ? rollWalkSkinBreach("urban", { q: hexAt&&hexAt.q, r: hexAt&&hexAt.r, centerFn: centerSkinFn })
      : centerSkinFn();
```

**C4.** Add `spiceTier,` to the urban walk return literal, on the line after `skin,`
(line 614).

**C5. Finale macguffin gate** (line 482) — before:

```js
    out.macguffin=(typeof walkIsStrangePlus==="function" && walkIsStrangePlus() && typeof rollItem==="function") ? rollItem({}) : null;
```

after (comment line above it updates "Strange+" → "Volatile+ (SPICE-RAISE loot ratchet)"):

```js
    out.macguffin=(typeof walkIsVolatilePlus==="function" && walkIsVolatilePlus() && typeof rollItem==="function") ? rollItem({}) : null;
```

### SITE D — `src/engine/dungeon-walk.js`

**D1.** Same stamp as C3, inserted between the `hexAt` line (498) and the `const skin =` line
(499), env string unchanged. **D2.** Add `spiceTier,` after `skin,` in the walk return literal
(line 609). **D3.** Line 437 macguffin gate: same swap as C5 (`walkIsStrangePlus` →
`walkIsVolatilePlus`, comment "Strange+" → "Volatile+").

### SITE E — `src/engine/wild-walk.js`

**E1.** Same stamp as C3 between lines 163 and 164. **E2.** Add `spiceTier,` after `skin,`
(line 255). **E3.** Line 107 macguffin gate: same swap as C5.

### SITE F — `src/state.js`: §2d's one GS line.

### SITE G — `src/world/dm.js`

**G1.** `activeWalkDigest` (line 62) — before:

```js
    skin: walk.skin ? { text:walk.skin.text, band:walk.skin.band } : null,
```

after:

```js
    skin: walk.skin ? { text:walk.skin.text, band:walk.skin.band } : null,
    spiceTier: walk.spiceTier||null,   // SPICE-RAISE: the walk's region tier (baseline|fray1|fray2|rim) — sizes the DM's connective-weirdness license (DM-CHARTER §8.5c)
```

**G2. Explicitly UNCHANGED:** `dm.js:1072`'s monster-flavor ctx keeps `walkIsStrangePlus()` —
flavor texture rides the full curve (it's free color, not loot). Do not swap it to
`walkIsVolatilePlus`.

### SITE H — `src/world/turn.js` (place-drift goes band-first)

Before (lines 167-175):

```js
    const roll=(typeof rollTable==="function")?rollTable("place-drift"):null;
    ...
    let r=roll;
    if(esc.escalate && SPICE_ORDER.indexOf(r.band)<SPICE_ORDER.indexOf("Textured")){
      const r2=rollTable("place-drift"); if(r2 && SPICE_ORDER.indexOf(r2.band)>=SPICE_ORDER.indexOf(r.band)) r=r2;
    }
```

after:

```js
    // SPICE-RAISE: drift rolls band-first at the node's own region tier (read-only resolve).
    const dTier=(typeof spiceTierForNode==="function")?spiceTierForNode(w,nodeId):"baseline";
    const roll=(typeof rollTableSpiced==="function")?rollTableSpiced("place-drift",dTier)
              :((typeof rollTable==="function")?rollTable("place-drift"):null);
    ...
    let r=roll;
    if(esc.escalate && SPICE_ORDER.indexOf(r.band)<SPICE_ORDER.indexOf("Textured")){
      const r2=(typeof rollTableSpiced==="function")?rollTableSpiced("place-drift",dTier):rollTable("place-drift");
      if(r2 && SPICE_ORDER.indexOf(r2.band)>=SPICE_ORDER.indexOf(r.band)) r=r2;
    }
```

The escalation floor mechanism (re-roll-toward-Textured on the ⅔ predicate) is KEPT verbatim —
it is demand-driven (revisit pressure), orthogonal to geography.

### SITE I — `manifest.json` (exact registry deltas; then the validator is the referee)

- `engine.region.owns`: **remove** `"fraySpiceFloor"`; **add** `"SPICE_WEIGHTS"`,
  `"spiceTierAt"`, `"spiceBandPick"`, `"spiceTierForNode"`.
- `engine.region.callTimeDeps`: **add** `"rollTableSpiced"`.
- `engine.compiled.owns`: **add** `"rollTableAtBand"`, `"rollTableSpiced"`.
- `engine.compiled.callTimeDeps`: **add** `"spiceBandPick"`.
- `engine.walk.owns`: **add** `"walkIsVolatilePlus"`.
- `engine.walk.callTimeDeps`: **add** `"spiceBandPick"`, `"spiceTierAt"`, `"rollTableSpiced"`, `"GS"`.
- `engine.dungeon-walk.callTimeDeps`: **remove** `"walkIsStrangePlus"`; **add**
  `"walkIsVolatilePlus"`, `"spiceTierAt"`, `"GS"`.
- `engine.wild-walk.callTimeDeps`: **remove** `"walkIsStrangePlus"`; **add**
  `"walkIsVolatilePlus"`, `"spiceTierAt"`, `"GS"`.
- `world.turn.callTimeDeps`: **add** `"spiceTierForNode"`, `"rollTableSpiced"`.

Gate: `python3 build/check-manifest.py` exits 0 with its OK summary, 0 errors. If the
validator flags any residual drift, reconcile owns/deps to what the code actually references —
never the reverse.

### SITE J — `src/engine/tarot.js` comment hygiene (zero behavior)

Lines 9-10, 101, 130-131 name `fraySpiceFloor` as the precedent — replace each mention with
"spiceTierAt/spiceBandPick (SPICE-RAISE)". Comments only; no code change; no manifest change.

---

## §4. The DM license (connective weirdness, captured)

**Append to `docs/DM-CHARTER.md` §8.5** (after the existing bullet list at lines 183-185) as a
new sub-clause, verbatim:

> **§8.5c — Connective weirdness at tier (SPICE-RAISE, locked 2026-07-06).** The world's
> baseline is SPICY (25/25/25/17/8), hotter through the fray, bizarre at the rim — and the
> digest tells you where you stand (`walk.spiceTier`: `baseline` / `fray1` / `fray2` / `rim`).
> From `fray1` outward you hold an explicit license to invent CONNECTIVE weirdness — the tissue
> between rolled strange facts (why two impossible things in one region rhyme; what the rim's
> wrongness does between segments) — sized to the tier: restrained at baseline, ambient at
> fray1–2, pervasive at rim. The price is unchanged §8.5 law: every invention that would
> persist is CAPTURED the same turn — a typed event, a codex record, a Ledger fact, a
> map/faction handle. Persistent weirdness left as prose only is drift, not license. And
> Grounded beats remain CONCRETE HUMAN PRESSURE (scarcity, law, debt, weather, injury,
> jealousy, material stakes) — never filler: the spicy world does not abolish the ordinary, it
> makes the ordinary earn its screen time.

The mechanical hook is SITE G1's `spiceTier` digest field (~30 B/turn, inside DIGEST-DIET
budget). No other prompt/digest change.

---

## §5. Grounded redefined + the Spice Ruler stays labeling

Two verbatim edits to `docs/SPICE-RULER.md`:

1. **GROUNDED row, "The entry bar" cell** — replace
   `Life. Explicable, ordinary, no eyebrow raised.` with:
   `Life — CONCRETE HUMAN PRESSURE: scarcity, law, debt, weather, injury, jealousy, material stakes. Explicable, ordinary, no eyebrow raised — and never filler: a Grounded row still answers what the player can do about it, or what it costs. (SPICE-RAISE, 2026-07-06.)`
2. **Append working rule 8:**
   `8) **The Ruler grades ENTRY, never SHARES** — band labels are honesty about a row's heat; how often bands FIRE is SPICE-RAISE's tier weights (band-first rolling). Never file a row down to protect a quota — quotas no longer exist at play time.`

Rules 1-7 (incl. "when in doubt, file DOWN") stay LAW — filing down is labeling honesty and is
exactly what makes the hot tail trustworthy when the weights call for it.

---

## §6. Edge cases (enumerated, ruled)

- **E1. Ungraded table via `rollTableSpiced`** → no row matches any band at/below target →
  falls through to flat `rollTable`. Ruled: honest fallback, no synthetic banding.
- **E2. Target band has no rows** → step DOWN the ladder, never up — class ceilings
  (Spark→Textured / Fork→Strange / Commitment→Mythic) are automatically honored; a Spark table
  asked for Mythic serves its hottest authored band.
- **E3. No coordinates** (unplaced node, headless harness, `hexAt` null) → tier `"baseline"`.
  Never assume rim-ward (same ruling as `breachFrayMod`).
- **E4. `GS` absent** (lean load order) → `walkSpiceBand`/`rollWalkSkin` default `"baseline"`;
  `engine.region` absent → walkSpiceBand's inline fallback is the ADOPTED baseline curve
  (25/50/75/92/100 cumulative), never the old 66-curve.
- **E5. Breach interplay** — `rollWalkSkinBreach`'s 2d10 bell + `breachFrayMod` UNCHANGED: the
  center resolver inherits band-first via `GS.walkSpiceTier`; the nightmare/breach TAIL tables
  (six d20s) stay flat rolls — they are all-hot by construction, and the bell already widens
  the tails rimward. Layering tier weights onto the tails would double-count the rim.
- **E6. Tarot lean** (`tarotSpiceLean`/`tarotSpiceBiasedSkin`) — composes unchanged: it
  post-processes whatever the roller returns (region.js caller-bias precedent). A lean over a
  band-first roll is still a one-step re-roll preference.
- **E7. `GS.walkSpiceTier` staleness** — the slot is re-stamped at every walk assembly (C3/D1/E1)
  and initialized `"baseline"`; a mint that fires outside any walk (e.g. dm.js flavor at a
  town contact) reads the LAST walk's tier. Ruled acceptable for v1: the last-assembled walk is
  the live scene in every real flow, and the failure mode is one band-curve of drift, not a
  crash. (A per-scene tier resolve is a listed fast-follow, §9.)
- **E8. Loot-rate shift** — Discovery macguffins move from Strange+ (14% flat) to Volatile+
  under tier weights: **25% baseline / 35% fray1 / 55% fray2 / 70% rim**. Ruled intended:
  deeper = better loot (GPT difficulty ladder), and the Item Legacy Contract (approved tonight)
  makes items losable. Soak metric: items-minted-per-walk, watched in the first post-build
  playtest; the single revert knob is the C5/D3/E3 gate choice.
- **E9. Escalation floor vs fray2/rim zero-Grounded** — place-drift's escalation re-roll
  (SITE H) can only raise; tier weights already exclude Grounded at fray2+ — no conflict, the
  floor is simply inert there.

---

## §7. Acceptance (commands + expected numbers; RED-FIRST with mutation assertions)

**Build order is part of the contract:** write `dev/verify-spice-raise.mjs` FIRST, run it
against the un-fixed tree, capture the RED output (checks 1, 4, 5 failing with the OLD numbers
visible), then apply §3 and re-run GREEN. Never trust a subagent's self-reported green — the
orchestrator re-runs every gate.

**Step 0 (pre-change baseline):** run and record `N passed, 0 failed` for each of:
`node dev/verify-regions.mjs`, `verify-walk-refresh.mjs`, `verify-breach.mjs`,
`verify-world-turn.mjs`, `verify-tarot.mjs`, `verify-atmosphere.mjs`, `verify-dressing.mjs`,
`verify-gen.mjs`. Post-change, each must print the SAME `N passed, 0 failed` (verify-regions'
three replaced checks are 1:1, so its N is unchanged too).

**New harness `dev/verify-spice-raise.mjs`** — jsdom, full manifest load order + tables.js
(same const-via-eval pattern as `dev/verify-regions.mjs`). Run:
`node dev/verify-spice-raise.mjs` → **`12 passed, 0 failed`**. The 12 checks:

1. **Baseline curve moved (THE mutation check — BUG-01 lesson: assert the value MOVED).**
   20,000 × `walkSpiceBand()` (GS.walkSpiceTier deleted/unset): Grounded share in
   **[0.23, 0.27]** AND Mythic share in **[0.065, 0.095]**. RED against un-fixed code with the
   observed old values printed (expected ~0.66 / ~0.01 — the check message must cite them).
2. `walkSpiceBand("rim")` 20,000 draws: Grounded count **=== 0**, Volatile share in
   **[0.42, 0.48]**, Mythic share in **[0.22, 0.28]**.
3. `spiceBandPick("fray2")` 20,000 draws: Grounded **=== 0**, Textured **[0.08, 0.12]**,
   Strange **[0.32, 0.38]**, Volatile **[0.32, 0.38]**, Mythic **[0.17, 0.23]**.
4. **Band-first defeats the authored layout (mutation on the compiled path).**
   `rollTableSpiced("walk-skin-urban","baseline")` 10,000 draws: every band share within
   **±2.5 points** of 25/25/25/17/8. RED against un-fixed code (symbol absent → check reports
   missing; the paired flat-roll control in the same check shows Grounded ~0.66 from
   `rollTable("walk-skin-urban")`, proving the layout itself still carries the old shares —
   i.e. the DISTRIBUTION moved while the TABLE did not).
5. `rollTableAtBand("walk-skin-urban","Mythic")` 50 draws: every result has
   `band==="Mythic"`, `bandTarget==="Mythic"`, and `total` inside a row range whose `row[2]==="Mythic"`
   (verify against `window.GENESIS_TABLES["walk-skin-urban"].rows`). RED-first: absent pre-fix.
6. **Step-down ruling:** inject a fixture table
   `GENESIS_TABLES["spice-raise-fixture"]={dice:"d10",rows:[[1,6,"Grounded","g",""],[7,9,"Textured","t",""],[10,10,"Strange","s",""]]}` →
   `rollTableAtBand("spice-raise-fixture","Mythic")` 20 draws all return `band==="Strange"`,
   `bandTarget==="Mythic"`.
7. `spiceTierAt` boundaries: `(10,0)→"baseline"`, `(16,0)→"fray1"`, `(29,0)→"fray2"`,
   `(41,0)→"rim"`, `(null,null)→"baseline"`.
8. Gate shares: 2,000 × `walkIsStrangePlus()` with `GS.walkSpiceTier="baseline"` → true share
   in **[0.46, 0.54]**; then `GS.walkSpiceTier="rim"` → **[0.92, 0.98]**; and 2,000 ×
   `walkIsVolatilePlus("baseline")` → **[0.21, 0.29]**.
9. Walk stamp: `rollUrbanWalk({segCount:4})` (no world → baseline path) returns a walk with
   `walk.spiceTier==="baseline"`; `GS.walkSpiceTier==="baseline"` after the call.
10. `fraySpiceFloor` retired: `typeof win.fraySpiceFloor === "undefined"`.
11. `regionEnsure` at rim coords (e.g. cell containing hex (45,0)) mints a record with
    `spiceTier==="rim"` and `rim===true`; second call is still a pure cache read (no re-roll —
    reuse verify-regions' write-once technique).
12. Digest: with an active walk installed (reuse verify-walk-refresh's §5c technique),
    `activeWalkDigest(w)` carries `spiceTier` as a string in
    `{"baseline","fray1","fray2","rim"}`.

**`dev/verify-regions.mjs` edits** — replace checks 6e/6f/6g (lines 206-211) 1:1:

- 6e′: `spiceTierAt` boundary quad (as check 7 above, condensed).
- 6f′: 2,000 × `spiceBandPick("rim")` → zero `"Grounded"` draws AND Mythic count in
  **[400, 600]**.
- 6g′: `typeof win.fraySpiceFloor === "undefined"` (the retirement is real, not renamed).

Also update the harness header comment (§2 description of the fray floor).

**Static + registry gates:**

- `python3 build/check-manifest.py` → exit 0, 0 errors.
- `grep -rn "fraySpiceFloor" src/ manifest.json` → **0 hits**.
- `grep -c "SPICE-RAISE" docs/SPICE-CURVE.md docs/SPICE-RULER.md docs/WALK-REFRESH.md docs/REGIONS-NAMES.md docs/DM-CHARTER.md docs/BATCH-GUARDRAILS.md docs/BATCH2-GUARDRAILS.md docs/BATCH3-GUARDRAILS.md docs/TABLE-REAUTHORING-PREP.md docs/CORPUS-INTENSITY-MAP.md` → **every file ≥ 1**.
- `python3 build/corpus-intensity-map.py` regen after the legend edit → clean run, and the
  regenerated doc contains the new legend line.

---

## §8. Don't-touch list

- **Generated files — NEVER hand-edit:** `tables.json`, `tables.js`, `data/bestiary.js`,
  `data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js`,
  `docs/CORPUS-INTENSITY-MAP.md` (spec the generator edit, §10 item 9, then regenerate).
- **Engine table markdown rows/layout** — zero row edits in this unit (Adam's craft pass).
  The only Engine-adjacent change is NONE — even frontmatter stays (§10 rules the share
  statements still true as layout facts).
- `rollTable` in `src/engine/compiled.js` — byte-untouched.
- `src/engine/breach.js` — untouched (E5).
- `dm.js:1072` flavor ctx — untouched (G2).
- The escalation-floor predicate in `turn.js` (`turnDriftEscalation`) — untouched (SITE H only
  swaps the roll primitive).
- `docs/DM-BRIDGE.md` — no edits mid-live-session; the digest field is self-describing and
  documented here + in DM-CHARTER §8.5c.
- `Shifting Vale/` and `Playtest Sandbox/` vaults — never.

---

## §9. Out of scope (each an explicit ruling, not a latent fork)

1. **Row re-authoring / hot-tail authoring** — Adam's craft pass. This spec deliberately makes
   the craft pass about ROW QUALITY only (variety within bands), since shares no longer
   gate distribution.
2. **Opening Bundle (`ebRoll`/`rollTbl`, inline EB tables)** — stays flat this unit. One roll
   per world at founding; converting means touching the creator flow + inline data for a
   one-shot distribution. Listed fast-follow: `ebRollSpiced` at founding tier (always
   baseline anyway — origin sits at hexDist 0). Net effect of deferral: ~nil.
3. **SPICE-RAISE wave 2** — converting the remaining flat `rollTable` content sites
   (world-turn/gap-wiring rollers: shrine-and-omen, festival, npc-life-event, downtime-ledger,
   distant-word-when-built, urban-pressure) to `rollTableSpiced` at the node/region tier.
   Deferred until one soak playtest on wave 1 (DIRECTION.md soak-before-build). The primitives
   ship now; wave 2 is call-site swaps only.
4. **Per-scene tier resolve for out-of-walk mints** (E7) — fast-follow rider on wave 2.
5. **Distant Word roller** — unbuilt (TABLE-GAPS §2); when built, it consumes
   `rollTableSpiced` + `distantWordRegionBias` (region.js:367) natively.
6. **The DM-facing Mythic gate** (`frayMythicUnlocked`) — stays informational.

---

## §10. Supersession list — every site that teaches 66/20/9/4/1 (or the old 70/20/8/1/1), with per-site instructions

Verified by `grep -rn "66/20"` + curve-string sweeps over the main tree, 2026-07-06.
**Rule of thumb applied:** docs that teach the law FORWARD get edited; historical records
(changelogs, decision-registry history, as-run gate records, dev reports) get a banner or
nothing; statements about ROW LAYOUT stay because they remain true.

| # | Site | Instruction |
|---|---|---|
| 1 | `docs/SPICE-CURVE.md:25-27` (§1 static distribution) + §7 item 2 | REPLACE the static-distribution block with: "**Play-time distribution is tier-weighted — SUPERSEDED here 2026-07-06, see `SPICE-RAISE.md`:** the engine picks a BAND from the region tier's weights (baseline 25/25/25/17/8 → rim 0/5/25/45/25), then a row within it. A table's row layout is now a COVERAGE guarantee (every band present, ceiling honest), not the play distribution. §4's class ceilings still bind (band-first steps DOWN to the table's hottest band)." Mark §7 open decision 2 → "RESOLVED 2026-07-06: SPICE-RAISE tier weights." |
| 2 | `src/engine/walk.js:179-188` | SITE C1 (the code fix itself). |
| 3 | `docs/WALK-REFRESH.md:73` (§2.3 "standard curve 1–66·67–86·87–95·96–99·100") | Append: "(SUPERSEDED 2026-07-06: play distribution is now SPICE-RAISE's tier weights; the authored layout survives as coverage.)" |
| 4 | `docs/BATCH-GUARDRAILS.md:128` · `docs/BATCH2-GUARDRAILS.md:18` (H1) · `docs/BATCH3-GUARDRAILS.md:3` | ONE identical banner line under each file's frontmatter: "> ⚠ SUPERSEDED IN PART (2026-07-06, `SPICE-RAISE.md`): the 66/20/9/4/1 band-share law is an AUTHORING-COVERAGE floor only — play distribution is tier-weighted (band-first rolling). Gates recorded below stand as-run history." Do NOT edit the gate lines themselves. |
| 5 | `docs/TABLE-REAUTHORING-PREP.md:80` (1–70 curve) | Append the same one-line supersession note as #3. |
| 6 | `docs/REGIONS-NAMES.md` §2 (fray spice-floor language) | Append to §2: "> SPICE-RAISE (2026-07-06): `fraySpiceFloor` is retired — the fray floor/ceiling is now the tier weight tables (`baseline/fray1/fray2/rim`, `SPICE-RAISE.md` §2a). FRAY_1/FRAY_2/FRAY_D unchanged; they now also key `spiceTierAt`." |
| 7 | `docs/SPICE-RULER.md` | §5's two verbatim edits (Grounded bar + working rule 8). |
| 8 | `docs/DM-CHARTER.md` §8.5 | §4's verbatim §8.5c addendum. |
| 9 | `build/corpus-intensity-map.py` legend block (the `L.append` lines at ~:132) | ADD one legend line: `- **bands G/T/S/V/M** — row-LAYOUT shares (authoring coverage). Play distribution is tier-weighted band-first rolling per docs/SPICE-RAISE.md.` Then regenerate `docs/CORPUS-INTENSITY-MAP.md`. Never hand-edit the doc. |
| 10 | Engine table frontmatter/callouts naming shares — `Place Drift.md:23,30`, `NPC Side Quest - Job Board.md:13`, `NPC Flaws and Secrets.md:13`, `NPC Immediate Motivation.md:13`, `NPC Bonds.md:13`, `Building Interior.md:13`, `Plot Item.md:13`, `Plot Lock.md:13`, `Place Traits.md:13`, `Realm Items - Chrome.md:21`, `Realm Items - Frontier.md:22` | **NO EDIT** — these state the tables' ROW LAYOUT (still true; now a coverage fact). Enumerated so no future agent "fixes" them into a recompile for nothing. |
| 11 | `docs/CHANGELOG.md` (741, 1698, 2465, 2537) · `docs/DESIGN.md:68,189` · `docs/NEXT-STEPS.md:208,543,926` · `docs/ECONOMY-SINKS.md:45` · `docs/NPC-KNOWLEDGE-GRADES.md:44` | **NO EDIT** — history/records (NPC-KNOWLEDGE's 1–70 ladder is a knowledge-grade axis, not spice). DESIGN gets its NEW registry line via Registry updates below, never a rewrite of old lines. |
| 12 | `dev/table-order-report.md:31` · `dev/top-band-uniqueness-report.md:25` · `dev/adam-review-bench.md:117` | **NO EDIT** — dated dev reports. |
| 13 | `src/engine/region.js:71-78` (`fraySpiceFloor`) + `dev/verify-regions.mjs:206-211` | SITES A2 + I(6e′-6g′). |
| 14 | `src/engine/tarot.js:9-10,101,130-131` (comments) | SITE J. |
| 15 | `build/lint-tables.py` + `Engine/00. _System/compile-tables.py` | **NO EDIT** — verified: they enforce coverage + band-monotonic layout, not shares. Monotonic layout stays LAW (it is what keeps `rollTable`'s flat path honest for unconverted tables). |

---

## §11. Blind-playable parity + telemetry

- **No new visual surface.** The one player-facing spice surface (band juice exclamations,
  SPICE-CURVE §5) is already text-first and fires more often now by pure arithmetic — its
  prose twin is itself. The new digest field is DM-facing JSON. Parity: N/A-with-note; nothing
  ships a panel.
- **Soak telemetry (first post-build playtest):** items-minted-per-walk (E8 knob),
  Mythic-narrations-per-session, and a subjective "does baseline feel spicy or noisy" note to
  Adam's ledger. No code for this — the playtest clerk counts from the ledger.

---

## Executor sizing

**M** (one executor): 8 code files + 1 new harness + 1 harness edit + manifest + 8 doc edits +
1 generator legend + regen. No cross-unit dependency; independent of S1-S4 tonight's other
specs EXCEPT: if the Scene Risk Contract spec also touches `activeWalkDigest`, merge order is
free but the second lands on the first's diff (both edits are additive single lines at dm.js:62).

## Registry updates (Fable applies; the spec author does not)

- `docs/DESIGN.md` (decision registry) — ADD row: `| Spicy-world baseline (SPICE-RAISE) | Band-first rolling at region-tier weights — baseline 25/25/25/17/8, fray1 10/20/35/25/10, fray2 0/10/35/35/20, rim 0/5/25/45/25; 66/20/9/4/1 demoted to authoring coverage; fraySpiceFloor retired; loot gates ratchet to Volatile+; DM connective-weirdness license at tier (DM-CHARTER §8.5c). SPEC-LOCKED 2026-07-06, build deferred — docs/SPICE-RAISE.md |`
- `docs/NEXT-STEPS.md` — ADD to the build queue: `SPICE-RAISE (docs/SPICE-RAISE.md, SPEC-LOCKED 2026-07-06, size M, zero inference cost) — band-first spice at tier weights; queue after the Fable-window batch lands; SPICE-RAISE wave 2 (world-turn roller swaps) waits one soak playtest.`
- `docs/README.md` (docs index) — ADD under system specs: `SPICE-RAISE.md — type: system-spec — the adopted spicy-world stance: tier-weighted band-first rolling; supersedes the 66/20/9/4/1 share law as play distribution.`
- `docs/SPICE-CURVE.md` — frontmatter/related: add `SPICE-RAISE` and note "§1 static distribution SUPERSEDED by SPICE-RAISE 2026-07-06" (body edit itself is §10 item 1, executor work).
- `docs/PARKING.md` — if the parked "across-the-board spice" line from the Rennick runs is present, mark it RESOLVED → `SPICE-RAISE.md`.
