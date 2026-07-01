# Genesis — Changelog

All notable changes to Genesis, newest first. Started 2026-06-21 (earlier history lives in `DESIGN.md` and git, not backfilled here). Add a dated entry each working session; group changes under **Added / Changed / Fixed / Deferred**.

---

## 2026-07-01 (later) — ITEMS Part II BUILT (congruence + potions + charges + attack path + UI + grip + encumbrance + attunement)

The whole of ITEMS Part II shipped. Adam confirmed congruence ("keep all items congruent", store charges)
and authorized building every flagged item; the conditions cleanup, the six-decision build, and the three
remaining flagged items all landed in one session. Gates: `check-manifest` OK (57 modules) ·
**`verify-items.mjs` 117/117** · zero regressions across the full suite (verify-combat 51, verify-dm-events
36, verify-social 97, verify-walk 2798, +14 more).

### Added
- **Congruent magic-item model (`ITEMS.md` §E).** `MAGIC_ITEMS_BY_NAME` (261 items, generated from
  `Reference/SRD-Data/magic-items.json`) = reference catalog + parsed enchantment overlay (`bonus`,
  `damageRider`, `acBonus`, `charges`, `attunement`, `rarity`). A magic instance resolves BASE mechanics off
  `ITEMS_BY_NAME` via `inst.base` and carries per-copy magic in `inst.ench` + an optional `inst.codexId`
  link. New engine helpers `magicDef`/`enchOf`/`enchActive`/`baseDef`/`attunedCount`.
- **Potions mechanized (Decision 2).** All 27 potions carry a `consumable.effect`; `item_use` fires the four
  healing tiers numerically in-engine and stamps every other potion as a structured `buff` the DM honors.
- **Charges.** `charge_spend`/`charge_restore` events + a long-rest auto-refill.
- **The live attack path.** `pcAttack`→`resolveAttack` driven by the equipped weapon via a new `attack`
  event (closes "cmEquippedDamage is computed but nothing calls resolveAttack").
- **Interactive inventory UI** (`src/world/inventory.js`, new module): `equipItem`/`unequipSlot`/`useItem`/
  `setGrip`/`attuneItem`/`unattuneItem` + per-item Equip/Use/Grip/Attune buttons and ench/charge/attunement
  badges in `renderCharacterPanel`.
- **Versatile two-handed grip (Decision 1).** `versatile{n,die}` in the weapon index; `sheet.equipped.grip`
  (1h/2h, default 2h when the off-hand is free) swaps the die in `cmEquippedDamage`; `set_grip` + wield
  toggle; an occupied off-hand forces 1h.
- **Encumbrance ON (Decision 4).** `carryState(sh)` — canonical SRD (soft STR×15 → Speed 5, hard STR×30);
  `item_changed` refuses an over-hard-cap pickup (`force:true` overrides); the Carrying bar shows amber/red.
- **Attunement cap.** `attune`/`unattune` enforce the SRD max-3; a requires-attunement overlay is dormant
  (`enchActive`) until attuned; AC recomputes on attune/unattune.

### Changed
- `cmEquippedDamage`/`cmEquippedAC`/`defaultEquip` resolve `inst.base` and fold the (attunement-gated)
  overlay; the `equip` kind-check uses `baseDef` so magic weapons validate.
- `data/items.js` grew into a full catalog (mundane index + `MAGIC_ITEMS_BY_NAME`) — by design; regenerate,
  never hand-edit.

### Fixed / removed
- **Item conditions trimmed.** `frozen` and `waterlogged` cut from `ITEM_CONDITIONS` (invented, no SRD
  basis, unwanted); `rusted` parked as an inert tag (hardcore corrosion track deferred until specced).
  `ITEMS.md` §D updated to match.

### Deferred (flagged)
- Attunement-*cap* is enforced, but there is no per-item attunement *prerequisite* checking (class/alignment
  gates) — out of scope for v1.

## 2026-07-01 — ITEMS Part II decisions resolved (docs-only)

Adam resolved the 6 latent decisions from the overnight ITEMS Part II spec. Docs-only; captures the calls +
two design deliverables he asked for (the elemental-condition map, the magic-item-model argument).

### Changed (`docs/ITEMS.md`)
- **§Latent decisions → §Decisions (resolved 2026-07-01):** ① two-handed grip is **explicit** (a `grip`
  flag + a wield toggle, not inference); ② **mechanize all 24 SRD potions** (numeric effects in-engine,
  duration-buffs as structured DM-honored buffs); ③ **item conditions are mechanical**; ④ **encumbrance is
  ON** (canonical SRD — over STR×15 → Speed 5 ft, hard cap STR×30 — "no barrelmancers"); ⑤ magic items →
  **congruence recommended** (pending confirm); ⑥ withdrawn (not a real fork).
- **New §D — the item-condition effects map.** Grounded in the SRD where it exists (the 2024 **Burning**
  glossary state = 1d4 fire/turn for `on-fire`; **Basic Poison** = +1d4 for `poisoned-coated`; cursed/broken
  behaviors) and Genesis-authored, flagged, where the SRD is silent (5.5e has no general elemental-status
  system — "damage types have no rules of their own"). `frozen`/`rusted`/`waterlogged` mapped to their
  damage-type flavor.
- **New §E — the congruent item model.** The argument for unifying magic + mundane into ONE instance model
  (base type in the index + a per-instance enchantment overlay + an optional codex *link* for narrative — three
  orthogonal layers, one lookup), replacing the earlier mundane-index / magic-codex split. Magic items are
  SRD-generatable (`magic-items.json`, 258); the codex is a link, not a storage path.
## 2026-06-30 (night, ITEMS completeness + Part II spec) — index the rest, shared `itemDef`, and the wiring/UI spec

Third items unit of the night (an overnight autonomous run). Indexed the remaining gear, hardened the
generator, and specced everything that's left to wire + an inventory UI overhaul. Branch
`feat/items-completeness-and-ui-spec`. Gates: `check-manifest` OK · **all 13 verifiers green** (verify-items
71) · verify-bridge 29 · generator idempotent. A 2-agent code review ran; the real findings are folded in.

### Added
- **Item index is now ~complete (175 items).** `gen-items.py` also parses the SRD **Tools** table
  (24 tools — Thieves'/Disguise/Herbalism Kits, every artisan's tool, Gaming Set) and ships a hand-authored
  **supplement** (`EXTRA_ITEMS`): the spellcasting **foci by form** (Arcane/Druidic/Holy, with explicit
  `"X (form)"` keys so they exact-match), the **2014-style pack items** the 2024 SRD prices only inside
  bundles (Mess Kit, Pitons, Censer, …), and a distinct **Spellbook** (3lb/50gp, was collapsing to "Book").
  Pack/kit resolution is now ~99% (65/66 · 89/91); the only non-resolves are the two pick-placeholders +
  one oddly-named container.
- **Shared `itemDef`/`itemKey` (`engine.combat`)** — the ONE name→definition lookup, folding the curly
  apostrophe to match the generator's keys. Fixes a real runtime bug: `Thieves' Tools` (U+2019) was *in*
  the index but never resolved in-app because render/combat/dm lower-cased without folding. Replaces 4
  open-coded `ITEMS_BY_NAME[String(name).trim().toLowerCase()]` copies (the review's reuse finding).
- **`docs/ITEMS.md` Part II (spec, not built):** §A missing item fields (versatile 2H, structured props,
  range, tool, focusFor, consumable, container, slot — with which wiring each unblocks); §B the full
  ordered wiring plan (Versatile → structured props → live combat runtime → economy → consumables →
  condition effects → tools/weight); §C the **inventory UI overhaul** (interactive equipped-loadout zone,
  equip/use/split/drop, weight bar, item detail — Charter-safe, event-routed); and **§Latent decisions** —
  6 open calls gathered for Adam (see the morning summary).

### Changed
- **Generator hardened (review fixes):** section slices are now located by header TEXT (`_section`), not
  hardcoded line numbers (a fragility flagged in two reviews); `load_tools` accepts `(Varies)` headings and
  resets the pending tool on every `###` so a weightless tool can't mis-pair its successor's weight;
  placeholder `cost:{n:0}` flavor items → `cost:None` ("unpriced", not "free" — the economy will treat them
  right). All verified byte-idempotent.

### Notes
- Review findings dismissed with cause: the two "itemDef in `owns`" manifest findings were false (it's in
  `callTimeDeps`, which is why check-manifest passes); the JS-vs-Python `\s` divergence is real only for
  exotic control codepoints that item names never contain (comment softened, not overclaimed).

## 2026-06-30 (night, ITEMS review fixes) — `/code-review` (xhigh) on the items build: 14 findings, the real ones fixed

A 10-angle extra-high review of the merged ITEMS feature. Most findings confirmed; fixed every correctness
one (incl. a **red-master test** the build's own clean-close missed) and documented the scope gaps. Branch
`fix/items-review-followups`. Gates: `check-manifest` OK · **all 13 verifiers green** (verify-items 51,
verify-saga 47, verify-creation-picks 24 — was RED, dm-events 36, combat 51, triage 27, rebirth-flow 19,
levelup 90, advancement 35, social 97, prep 43, codex 57, wake-prep 47) · verify-bridge 29.

### Fixed
- **Red master:** `dev/verify-creation-picks.mjs` asserted kit inventory entries were instrument STRINGS
  (now instances) → 1 failing check shipped to master. The build's clean-close ran 11 verifiers but not
  this one. Fixed the assertions (read `.name`).
- **Corpse recovery aliased instances + broke on legacy saves** (`rebirth.js` `claimCorpse`): looted gear
  was transferred by reference (shared ids → ambiguous removeIds/equip; aliased objects → a condition on
  the looter bled onto the dead PC's record), and a pre-feature corpse's string items concatenated into the
  looter's instance array (mixed → an item rendered as "undefined"). Now re-mints a fresh id + deep-copies
  conditions on recovery, and coerces any legacy string item.
- **Banked souls never migrated** (`state.js`): `migrateAll` migrated world characters but not `U.souls`,
  so an old-format banked soul kept string inventory. Extracted `migrateSheetInventory` and applied it to
  souls too.
- **`item_changed` old-shape silent no-op** (`dm.js`): a DM still emitting the pre-instance `remove:[name]`
  silently removed nothing (the exact silent-confiscation failure this system was built to fix). Added a
  deprecated name-match back-compat path.
- **`equip` accepted kind/slot mismatches** (`dm.js`): armor could go in a hand slot. Now validated for
  indexed items (unindexed/flavor still allowed anywhere).
- **`item_split` qty coercion** (`dm.js`): `p.qty|0` 32-bit-overflowed huge values; now `Math.floor(Number())`
  with a `bad-qty` rejection for non-positive / non-numeric.
- **Generator data bugs** (`gen-items.py`): a curly-vs-ASCII apostrophe mismatch let all 7 starting-pack
  umbrella rows leak into `ITEMS_BY_NAME` as phantom gear (fixed by folding `’`→`'` in `norm()`); the
  substring-resolution fallback mis-typed compound/qualified names (`2 Map/Scroll Cases`→Map, `Druidic
  Focus (Quarterstaff)`→a weapon) — now bails on `(`/`/` names, leaving them honest flavor-only.
- **`KIT_ITEM_EXPANSIONS` was an undeclared global** — added to the manifest `owns` (check-manifest's
  owns-check is one-directional, so it never flagged it). `migrateSheetInventory`/`uid` registered too.
- **CLAUDE.md drift** — the spec list still said ITEMS was "drafted not built." Corrected.
- **Weight display** rounded float-multiply noise (`Arrow ×20` showed "1.0") — a `fmtLb` helper rounds clean.

### Added (the AC gap, fixed properly — Adam's call)
- **AC now derives from worn armor** (`ITEMS.md` P5). `cmEquippedAC` (5.5e Light/Medium/Heavy + shield) +
  `cmSheetAC` (folds the flat feat bonus `sheet.acBonus`, e.g. Iron Skin's +1) are the canonical recompute,
  fired at every AC write site: `equip`/`unequip`, character creation (auto-equips the kit via `defaultEquip`),
  the `migrateWorld` backfill for pre-feature saves (reconstructs `acBonus` from feats), and the level-up
  ripple — `luRecomputeFromScores` now **re-derives** AC instead of blindly adding the DEX delta, which was
  wrong for no-DEX heavy / DEX-capped medium armor. Before this, `sh.ac` was a flat `10+DEX` that ignored
  armor entirely (a Fighter in Studded Leather showed AC 12, now correctly 14). +12 `verify-items` checks.

### Deferred (documented in `ITEMS.md` fast-follows, not bugs)
- `cmEquippedDamage` ignores Versatile two-handed; ~18% of pack items are unindexed so the carrying total
  undercounts (informational only). Flagged for follow-up.

## 2026-06-30 (night, ITEMS build) — Items: the type/instance split for gear, specced and built same-session

A live playtest fix surfaced a design question (`sheet.inventory` is plain strings — no objective
damage, no per-copy disambiguation, no home for a status); Adam resolved all five open design calls in
one message, then authorized the build. `docs/ITEMS.md` went from spec to **fully built, all four
phases**, same session. One unit: branch `feat/items-type-instance-split`. Gates: `check-manifest` OK
(56 modules) · **`verify-items.mjs` 42/42** (new) · zero regressions across 11 other full-app
verifiers (599 checks total, 0 failed).

### Added
- **`build/gen-items.py` + `data/items.js` — the type index** (the bestiary pattern reapplied to
  gear). 134 items: 38 weapons + 13 armor/shield (`equipment-weapons-armor.json`, structured JSON) +
  78 adventuring-gear + 5 ammunition entries (`equipment.md`'s real tables, regex-parsed, incl.
  fixing a dropped row from an unhandled `(full)` annotation and a word-order resolver fallback for
  SRD's own "Lantern, Hooded"-style naming). `ITEM_CONDITIONS` — the fixed 8-entry status vocabulary
  (on-fire/frozen/poisoned-coated/cursed/broken/dropped/waterlogged/rusted). `PACK_EXPANSIONS` — all 7
  SRD starting packs resolved to real individual line items (54/66 lines mechanically matched; the
  rest honestly degrade to flavor-only, never invented). `KIT_ITEM_EXPANSIONS` — generalizes the same
  parsing to every `CLASS_KIT` item string, not just packs ("4 Handaxes" → `{name:"Handaxe",qty:4}`).
- **`sheet.inventory` is now `{id,name,qty?,conditions:[]}` instances**, not strings — `migrateWorld`
  backfills old saves idempotently; character creation (`cgSheetExtras`) mints real instances for
  every kit item, expanding packs to their full individual contents (no more one bundled "Explorer's
  Pack" entry — they arrived together but are independently their own things).
- **`sheet.equipped = {mainHand, offHand, armor}`** — named slots, not a single pointer, so two-weapon
  fighting (main + off hand equipped at once) is representable.
- **5 new EVENT-CONTRACT events**: `item_split` (divide a stack — a new instance, its own id),
  `condition_add`/`condition_remove` (validated against `ITEM_CONDITIONS`), `equip`/`unequip` (named
  slots). `item_changed.remove` → `removeIds` (instance-targeted, never name-matched again).
- **`cmEquippedDamage`** (`src/engine/combat.js`) — resolves the PC's objective weapon damage from the
  index via the equipped instance (Finesse → better of STR/DEX, ranged → DEX); honors the SRD **base**
  two-weapon-fighting rule (`equipment.md` "Light" property, not a feat): the off-hand attack adds the
  ability modifier only if it's negative. `dmDigest.pc.equippedWeapons` surfaces the resolved spec
  every turn — the actual fix for "the DM has to recall the weapon's dice from memory," since
  `resolveAttack` isn't wired into a live runtime path yet (combat stays theater-of-mind, `COMBAT.md`).
- **Render**: real inventory instances (name × qty, weight hint, condition badges), total carrying
  weight vs. capacity (`STR × 15`, informational — SRD's own carrying-capacity rule is GM-invoked, not
  an automatic penalty), and the currently-equipped slots (read-only this pass).
- **`dev/verify-items.mjs`** (42 checks) — generator correctness, migration idempotency, character
  creation expansion, all 5 new events incl. dual-wield, `cmEquippedDamage`'s 8 cases, digest
  surfacing, render robustness (incl. an unindexed-name item never crashing or vanishing).

### Changed
- **`docs/EVENT-CONTRACT.md`** — the new events documented; `item_changed`'s entry rewritten for the
  instance model.
- Dead CSS removed (`.pack-row`/`.pack-contents`/`.pack-item`/`.pack-n` — the old bundled-pack
  `<details>` dropdown, now unreferenced since pack contents are real individual instances).

### Deferred (flagged honestly in `ITEMS.md`)
- No live combat runtime path — `resolveAttack` itself still isn't called from anywhere in the running
  app; `cmEquippedDamage` is ready for whenever the Fable-era tracker UI wires it in.
- No interactive equip button (render is read-only this pass) — not one of the five resolved asks.
- The economy track's buy/sell spine is now unblocked (real prices + the `item_changed` mutator both
  exist) but still not built — its own open calls (sell ratio, shop/merchant wiring, UI) stand.

## 2026-06-30 (later) — WALK-CONSUMPTION: the DM stops forgetting the rolled walk

Session-Prep has rolled 3 full walks (urban/dungeon/wilderness) every session since 2026-06-23, but they
reached the DM exactly **once** — the `⎘ Prep handoff` at session start. `dmDigest()` carried no walk, so by
turn ~3 the DM forgot it and drifted to freehand; there was also no provenance, so the wrap couldn't report
whether a walk was even used. Adam's framing from a Hungering-Stone capture-loop discussion: *"the DM doesn't
need to forget the walk until the walk has been walked."* Spec'd as 5 ordered steps (`docs/WALK-CONSUMPTION.md`)
and built same session on branch `feat/walk-consumption`. Gates: `check-manifest` OK (55 modules) ·
**verify-walk-consumption 37 · verify-capture 21 · verify-prep 43 · verify-prep-bundle 50 · verify-seam 29 ·
verify-dm-events 30 — 0 failed**; full 24-harness regression sweep clean.

### Added
- **`activeWalkDigest()` (`src/world/dm.js`) — a new `activeWalk` block on `dmDigest()`, sent EVERY turn**
  (not just at prep). Carries the walk's segments with a `here`/`behind`/`ahead` cursor, the DM's reskin
  overlay by ref, and the pre-cast frontier cast — framed as a SOFT prior identical to the existing
  `sessionLean` contract (player intent → situation → the walk; never a railroad).
- **The walk-state layer (`src/world/prep.js`)** — `w.prep.activeWalkId` + a per-frontier `cursor`
  (`current`/`touched`/`done`); `walkSetActive`/`walkAdvance`/`walkStamp`/`walkComplete`/`walkPromoteNext`.
  `lockOnContact` now sets the active walk on entry (and resumes the cursor on re-entry).
- **Three new `EVENT-CONTRACT.md` events** (documented + wired in `applyEvent`): `walk_advance`
  `{toSeg}` (the DM moves the cursor as the party clears a segment), `walk_complete` `{abandoned?}`
  (finalizes provenance, clears the active walk, **promotes + reskins the next prepped frontier** — no
  fresh-space invention, the bundle already holds 3 rolled walks), and `capture` (below).
- **`walkProvenanceReport()` (`src/world/seam.js`)** — mirrors `codexProvenanceReport`'s anti-drift ratio
  test: planned-vs-walked, segments touched/rolled, a `consumption` ratio, surfaced via `seamHarvest`. **This
  is the instrument that answers "are the rolled walks even being used."**
- **Stage-scaled walk length (`src/engine/prep-bundle.js`)** — `pbundleSegCount`/`pbundleLegCount` read the
  living PC's level: L1–2 → 3 segments … L9–10 → 7 (wilderness 3→5 legs). Content/threat band stays
  tier-driven; only length changes now.
- **`src/world/capture.js` (new module, `world.capture`) — capture as re-entry.** A `capture` event drops a
  subdued PC into a **holding segment of the active walk** (reused if the topology has one — cell/pit/vault/
  oubliette-shaped segments are detected by tag; else a single node is minted, never a new prison
  subsystem), nominates a **pre-cast NPC** as the possible escape lever (DM decides ally/betray — verbs stay
  with the DM), and opens a **fireable** disposition front-clock (ransom/interrogation/labor/execution-
  pending/trade/trophy — execution-pending has a deliberately short fuse). Captor = the faction most
  advanced against the PC by clock fill (live state, not rolled); only 4 small noun tables are new dice
  (disposition/holding/confiscation/opening). Capture with no active walk mints a one-node holding walk.
  Generalizes Adam's Hungering-Stone capture loop (the party fell into Pip's holding chamber, beside an
  NPC already spying who became the escape lever) off rolled handles instead of DM freehand.
- **`dev/verify-walk-consumption.mjs` (37 checks)** + **`dev/verify-capture.mjs` (21 checks)**.

### Changed
- **`docs/DM-BRIDGE.md`** — new "Read `digest.activeWalk` every turn" + "Capture as re-entry" sections, plus
  three new bullets in "Mechanics the DM MUST fire" and a line in the runbook checklist. This is the piece
  that makes Steps A–E load-bearing instead of inert: without telling the DM loop to read the field and emit
  the new events, the digest addition would just sit unread — the same failure mode the build fixes.
- **`docs/EVENT-CONTRACT.md`** — `walk_advance`/`walk_complete`/`capture` added to the event taxonomy table
  (alongside the just-landed `item_changed`, below — combined cleanly, no overlap).
- Beat events that fire mid-walk (`discovery`/`encounter_resolved`/`kill`/`front_closed`) now stamp
  `{walkId, seg}` on their ledger entry for the provenance report to read.

### Deferred
- **A live Bridge playtest** is the real validation — confirm the DM actually narrates from `activeWalk`
  instead of freehanding, that `walkProvenanceReport` shows real consumption, and that a capture lands
  cleanly mid-walk. Tune the length curve and `CAPTURE_HOLDING_TAGS` detection by feel once played.
- Capture's confiscation currently moves gear via `codex_update`; reconcile with `item_changed` (below) so
  there's one path for inventory mutation, not two.

---

## 2026-06-30 (night, fast-lane playtest) — `item_changed`: the inventory event the EVENT-CONTRACT was missing

A live Bridge playtest of the fast-lane triage (`feat/fast-lane-triage`) surfaced a real EVENT-CONTRACT gap:
**no typed event could ever mutate `sheet.inventory`/`sheet.gold`.** Last session the DM narrated Crowfoot's
gear "stripped" by his captors and logged it to the ledger as canon — but with nothing in `applyEvent` able to
touch the inventory array, the Character panel still showed his full kit. Drift the engine exists to prevent,
caught live. One unit: branch `fix/playtest-inventory-and-icon`. Gates: `check-manifest` OK ·
**verify-dm-events 36/36** (+6 new).

### Added
- **`item_changed` (EVENT-CONTRACT.md) — the one event that touches gear/coin.** `removeAll` strips the whole
  inventory (a searched/bound prisoner); `remove:[name]` takes named items (case-insensitive); `add:[name]`
  appends (loot, or **recovering confiscated gear** — every removal is logged with exactly what left, so a
  later `add` restores it precisely); `gold` is a signed delta, clamped at 0. Always logged to the ledger
  (`kind:"inventory"`). Unblocks the eventual loot/buy-sell/consumables economy track for free.
- **`dev/verify-dm-events.mjs`** — 6 new checks (removeAll strips + zeroes gold, every removed item reported,
  ledger logged, recovery `add` restores, case-insensitive `remove`, gold delta clamps at 0).

### Fixed
- **Spells rail icon** (`src/world/render.js`) — pointed at the missing `assets/icons/wand.png`; the `onerror`
  fallback silently swallowed it to a bare glyph. Now uses the existing `book-arcane.png` (shared with Codex —
  a dedicated `wand.png` is queued polish, not a blocker).

### Deferred
- A dedicated `wand.png` icon so Spells and Codex don't share the glyph.
- **CLAUDE.md gotcha to add:** the DM Bridge needs `python3 dev/dm-bridge.py`, NOT the plain `http.server` from
  "Run it" — the plain server has no `/turn`/`/response` routes, which read as "bridge unreachable" this session.

## 2026-06-30 (night, fast-lane build) — Hybrid fast-lane triage: the model-routing decision, mechanized

Built the first leg of the latency story. `DM-BRIDGE.md` §"Hybrid fast-lane" was strategy-only; now the lane
decision is **script-owned + wired**: a pure classifier stamps each turn's model lane, so the DM loop routes
routine beats to a fast model (Sonnet 5) and memorable ones to Opus — without re-deciding per turn. One unit:
branch `feat/fast-lane-triage`. Gates: `check-manifest` OK (54 modules) · **verify-triage 27 · verify-dm-events
30 · verify-bridge 29 — 0 failed.**

### Added
- **`src/world/triage.js` (`world.triage`, owns `dmTriage`) — the pure lane classifier.** `dmTriage(w,action)`
  returns `{lane,model,reasons[]}`. Default **fast** (sonnet); escalates to **deep** (opus) only on signals
  knowable *before* the DM composes: `new-place` (first contact, via a new `w.dm.lastNarratedNodeId` marker),
  `combat-active` (forward-compat with the combat tracker's `GS.combat`) / `combat-action` (combat verbs incl.
  multi-word targeted casts), `pc-downed`/`pc-bloodied`/`pc-condition`, `clock-due` (a full *open* doom clock),
  `no-living-pc`. Anti-drift: the script owns the routing decision, the DM doesn't eyeball it per turn.
- **`sendTurn` stamps `lane`/`laneModel`/`laneReasons`** onto every turn (all roll/dice/free-text paths funnel
  through it). The bridge stays a dumb mailbox; the `/response` contract is unchanged.
- **`dev/verify-triage.mjs` (27 checks)** — every routing case + the `lastNarratedNodeId` fallback + the
  rollRequest-defer + the `sendTurn` stamping wire.

### Changed
- **`docs/DM-BRIDGE.md` §"Hybrid fast-lane" — the runbook now OBEYS `turn.lane`** instead of eyeballing stakes:
  `fast` → a `model: sonnet` subagent, `deep` → compose on Opus. The one override is **upgrade-only** (the DM
  may lift fast→deep for a Mythic crit / revelation only it can foresee mid-compose; never downgrade). *Script
  owns the floor; the DM owns the ceiling.*
- **`build/check-manifest.py`** — `world.triage` layered (L1).

### Fixed (pre-merge `/code-review` high — 4 of 5 findings)
- **First-contact fast-laned (the headline):** `applyResponse` stamped `lastNarratedNodeId` unconditionally, so
  a roll-on-arrival (DM asks for a Perception check *before* describing the place) marked the node "narrated" one
  turn early → the real reveal routed fast. The marker now only advances when the scene is delivered (no pending
  `rollRequest`), so the roll-submit turn still deep-lanes the arrival.
- **Combat-verb regex:** broadened `cast … at` to multi-word SRD spell names (`cast ray of frost at`); dropped
  idiom-dominant bare verbs (`strike`/`swing`/`loose`) that over-escalated routine turns to Opus.
- **Dead `opts` param** removed from `dmTriage`.
- **Manifest `\u` re-encoding churn** (a `json.dump` with `ensure_ascii=True` swept ~32 unrelated `desc` fields)
  — re-emitted clean (`ensure_ascii=False`).

### Deferred
- **1 review finding (structural):** `dmTriage` open-codes the active-living-PC lookup that `livingSheet` already
  encapsulates; the dup is *forced* by layering (helper L4, triage L1). Track for the `refactor/world-gen-layer` pass.

## 2026-06-30 (night, addendum) — On-demand generation decision: "the engine owns the nouns"

Companion to the playtest-hardening entry below — the **same Bridge playtest** also produced a design decision. Its two doc edits (`DESIGN.md` + `NEXT-STEPS.md`) were carried into master inside the `feat/playtest-hardening` merge (a tree-wide `git add` swept them in); this addendum backfills the changelog/handoff record so the decision isn't invisible. **Docs-only.**

### Changed
- **`DESIGN.md` — new locked-decision block "On-demand generation: 'the engine owns the nouns'".** Engine owns scene **NOUNS** (NPCs/places/interiors/objects via the existing `rollNPC`/`rollPlace`/`rollItem`/`rollBuildingInterior`); the DM owns **VERBS + meaning** (threads/motives). Validated both ways in play — a DM-invented *thread* (the vanished lover was a mage who tore a passage and fled) was approved; freehanded scene NPCs + the house interior were flagged as nouns that should be rolled (rolled handles = doors, not walls). **A WIRING gap, not authoring** — the rollers exist and are rich (incl. the d300 `building-interior`), but prep fires them at frontiers only and live play / the Bridge can't reach them at all.
- **`NEXT-STEPS.md` — new ⭐ track "On-demand generation"** (ambient NPC pool at inhabited/start locations → wire `rollBuildingInterior` on building-entry → the DM→engine "request a roll" handshake → the NPC tiering gate).

### Deferred
- **Calibration (auto-memory, not code):** skill checks resolve as **degrees of failure, margin-based** — near-miss (~1–2 under DC) softened with maxed pressure, a miss by ~3+/5 is a full failure.

## 2026-06-30 (night) — Playtest hardening: fog-of-war, spellbook, dice, latency + the prefetch spec

A long live-Bridge playtest, fixing what surfaced turn by turn — DM/player vision split, the spellbook, the player dice mechanic, and the turn-latency drag — plus the speculative-prefetch design. One unit: branch `feat/playtest-hardening`. Gates: `check-manifest` OK (53 modules, 481 symbols) · **verify-bridge 29 · verify-dm-events 30 · verify-social 97 · verify-combat 51 · verify-prep 43 — 0 failed.**

### Added
- **Spells panel** (new left-rail button, casters-only) — casting ability/save-DC/attack tags + a **dotted spell-slot tracker** (one row per level, ● held / ○ spent, pact + pools; grows vertically for L1–L9), every known spell as a uniform gridded card with hover→full-text (reuses `#spellTip`). Pulls **class AND feat-granted** spells. `renderSpellPanel`/`spellSlotTracker`/`spellByName`.
- **Character "Chronicle & history"** — collapsible backstory in the Character panel (origins / why-this-path / life events with their inner rolls) + an in-play journey from the ledger. `renderCharacterHistory`.
- **Non-d20 player dice** — `rollDiceExpr` (ui.dice) rolls any `NdM±K` combo with a readable trace; `dmRollDice`/`dmRollExprInput`; the DM can prompt a specific roll via **`rollRequest.dice`** (damage/healing/table dice), and a **free dice tray** under the input rolls anything on demand.
- **Pack contents** — `PACK_CONTENTS` (SRD, 7 packs) in `data/srd-creator.js`; the inventory unfolds a pack (e.g. Explorer's Pack) into a dropdown of its items.
- **Turn-latency timer** — each DM line shows `⏱ Ns` (your-send → DM-answer round-trip).
- **Feed event chips** — `hp_changed`/`slot_spent`/`resource_spent`/etc. render as colored mechanical chips (`−7 HP → 5/12`, `◇ L1 slot → 2/3`) so the number is visible even if the DM doesn't say it. `eventChip`.
- **`dev/prep-fanout.workflow.js`** — deep-prep fan-out: Stage-1 harvest → parallel Stage-2 reskin per environment (+ pre-extract monster stat blocks), so live turns are lean reads. The DM session invokes it at session start.
- **`docs/SPECULATIVE-PREFETCH.md`** (system-spec, draft) — pre-load the next turn's *assets* (never narration) in the player's idle window; unused recycles via the soft-cast/lock-on-contact model. Phased P1→P3. Decision block in `DESIGN.md`.

### Changed
- **Fog-of-war — map** shows only known nodes (current / origin / walked-`seen` / soft / known-gazetteer); the seeded "nearby" nodes stay hidden until reached. `seeNode` (state) + `mapVisibleIds` + edge filter.
- **Fog-of-war — ledger → "Chronicle"** shows only player-witnessed entries (`ledgerPlayerVisible` hides spatial/drift/clock/npc-life/origin-canon) with a **⛨/👁 DM-view toggle**.
- **Gazetteer + Codex merged** into one "Codex" panel (`knowledgePanel` = relational codex + a Lore section folding in setting/myth); freed the rail slot for Spells.
- **Advantage/disadvantage mechanized** — `dmRollFor` rolls 2d20 keep-highest/lowest on `rollRequest.adv`; the breakdown shows both dice. Roll feed now shows the **full breakdown** (incl. proficiency): `Stealth d20=14 +3 +2 prof = 19`.
- **DM emphasis** — `mdBold` now renders `**bold**` **and** `*italic*`/`_italic_`, colored the steel-blue accent.
- **Latency** — `/response` is now **long-poll** (bridge holds the GET, returns the instant the DM answers; client re-issues on 204 — `DM_LONGPOLL_S`); `postState` scoped to the active world; the "considering" line is now an on-tone, varied wait.
- **In-game left rail** fits the viewport (no scrollbar; `clamp()` sizing); **End-session** button moved under the clock; the **session counter** off-by-one fixed (worlds create at `session:0`).
- **Siblings** (and age / inline life-event dice) now show the resolved count **and** the inner roll (`rollDetail`); seed/world rerolls dedup so the same whisper can't repeat.
- **Docs** — `DM-BRIDGE.md` gained: mechanics-the-DM-must-fire (state HP + fire `hp_changed`/`slot_spent`), the `rollRequest.adv`/`.dice` forms, the **Sonnet fast-lane**, the **deep prep fan-out**; `DIFFICULTY.md` gained the **degrees-of-failure margin ladder** (miss by 5 = real failure; wiggle room only at −1/−2).

### Fixed
- The **prep/wake fade** could stick black if the bridge health fetch hung — overlay now lifts on a guaranteed backstop and holds for a live DM instead of pre-empting onto "considering".
- The **character sheet** dropped feat-granted spells (the "missing cleric spell") — now lists Cantrips + Spells separately incl. feat magic, with a `✶ Spellbook` link.
- `verify-dm-events` "event chip shown" assertion updated for the humanized chip label (`fact_canonized` → "fact canonized").
- **Code-review (high, 8-angle) follow-ups:** registered the 12 new globals in `manifest.json` `owns` (the convention is exhaustive per-module — `check-manifest` passed regardless but now matches); `eventChip` `hp_changed` shows a neutral `•` for a zero delta (was the heal glyph ✚); `renderLedger` now **defaults to the player-visible filter** so a bare call can't leak DM machinery (the DM-view path still passes the full ledger explicitly). The flagged onclick-escaping "XSS" was refuted (the `JSON.stringify`+`&quot;` pattern is correct and matches the existing reviewed convention; values are DM-supplied).

### Deferred
- Speculative Prefetch **build** (spec'd; P1 deterministic reserve is the buildable entry point).
- Enemy/NPC advantage as a visible roll chip (player side is mechanized; NPC rolls stay DM-narrated).
- Wiring the `prep-fanout` Workflow + `prep_applied` apply-back into the DM loop automatically.

## 2026-06-30 (evening) — Combat engine: spec firmed + bestiary wired + resolver built

The combat track. Promoted `docs/COMBAT.md` **sketch → spec** (two forks resolved with Adam), then built the MVP spine — the fix for *creature = dead name-string*. Branch `feat/combat-engine`. A `/code-review` (high) pass was folded in pre-merge. Gates: `check-manifest` OK (53 modules) · **`verify-combat` 51/51** (new) · **all 21 verifiers green, 0 failures** (`verify-dm-events` 28→30).

**The two forks (Adam's calls, logged in `COMBAT.md` + `DESIGN.md`):** ① the automation split — *the script owns the numbers, the DM owns the decisions* (engine owns stats/rolls/HP/conditions/bands/CR-XP/events; monster turn *choices* + narration stay DM-narrated in v1; the player rolls their own d20 open, the engine rolls the monsters'). ② **side-based initiative** (PC side vs enemy side — a legal 5.5 variant for solo pace; per-creature is the Fable upgrade).

### Added
- **Bestiary index — `data/bestiary.js` (GENERATED by `build/gen-bestiary.py`; never hand-edit).** Parses the 374 `Asset Library/Monsters & Enemies/*.md` → **510 stat-block entries** (multi-block files split), AC/HP/CR/abilities **100%** / attacks ~99%. Handles three ability-line grammars + the SRD-2024 Unicode-minus + Adam's custom `**AC:**`/`# Name` single-block format. **Adam's 95 hand-authored custom d-tables carried VERBATIM** as `customTables`, never mechanized. `BESTIARY_BY_CR` indexes ids by CR. Registered (`data.bestiary`, owns `BESTIARY`/`BESTIARY_BY_CR`).
- **The combat resolver — `src/engine/combat.js` (`engine.combat`).** PURE like `engine.social` (operates only on transient combat objects, never `w`/codex). `resolveCreature` (the threat→stat-block resolver: name → CR-band fallback → DMG quick-stats — bridges the walk threat-names, which come from the threat-identity tables not the asset library), side-based initiative (`rollInitiative`), attack/save/damage math (`resolveAttack`/`resolveSave`/`cmRollDamage`/`cmRollD20` — pre-rolled d20 → the player's open roll; nat-1 miss / nat-20 crit-doubles-dice / cover AC / resist-immune-vuln), range-band movement (`moveBand`/`CM_BANDS`), `combatStart` (builds `GS.combat`), `combatFromEncounter` (walk→combat wire), `combatOutcomeEvents` (derives the EVENT-CONTRACT payloads).
- **Standardized SRD CR→XP — `CR_XP` + `crXp()` in `src/engine/advancement.js`.** The advancement seam combat prices against.
- **`dev/verify-combat.mjs` — 51 assertions** (bestiary wiring, resolution fallback, CR-XP + gating, side-based init, attack/save/damage, band movement, `combatStart`/`combatFromEncounter`/`combatOutcomeEvents`, and the `applyEvent` integration surface).

### Changed
- **`encounter_resolved` pricing (`advancement.js`)** now prices from **real foe CR** (sum of `CR_XP`) instead of the flat `100 × tier` placeholder — still **objective-gated** (the milestone re-tune is deferred; *don't tune twice*).
- **`kill{factionId}` → detected `clock_advanced` escalation (`src/world/dm.js`).** Killing a faction's person advances its grievance clock; on the **transition to full** it promotes to `clock_fired` once (the agenda comes due — the named-response spawn itself is DIFFICULTY.md-deferred), `forPlayer:false` so no PC XP. Closes the `DIFFICULTY.md` escalation gap.
- **`COMBAT.md` sketch → spec**; `DESIGN.md` combat row updated with the two resolved forks.

### Fixed (`/code-review` pass, pre-merge)
- **Flee-and-bank exploit:** `combatOutcomeEvents` priced XP from *all* foes — dropping 1 of 3 and fleeing banked all 3. Now prices from **defeated** foes only (matches the kill events + the "stealth/talk-past pays no combat XP" intent).
- **Dead-end escalation + re-fire spam:** a kill filled the faction clock but never emitted `clock_fired`, and re-emitted the escalation line on every subsequent kill once full. Now fires `clock_fired` **once on the transition**.
- **`crXp`/`CR_XP` were unregistered** in the manifest `owns` (check-manifest only validates declared symbols). Registered.
- **Parser `is_table_section` guard widened** to the `**AC:**` form (was narrower than the parser it gates → a custom abbreviated-AC stat block containing a pipe could be silently dropped).
- **Python↔JS slug rule aligned** (`slugify` now strips a leading article like `cmSlug`): the 6 `the-*` ids (Faerie Dragon, the blights, …) now resolve by direct name lookup, not just the O(n) fallback scan. Generator now warns on an id collision instead of silently suffixing `-x`.
- Removed dead `cmAbilityMod` (duplicated `abilMod`); extracted the duplicated d20/advantage block to `cmRollD20`.

### Deferred (in `COMBAT.md`)
- The in-app combat tracker **UI**; auto-objectified **terrain→cover** from the walk specs (highest-leverage fast-follow); per-creature initiative; monster/companion **AI**; death-save automation.
- ⚑ **The advancement re-tune** — un-gate CR-XP into the *primary* spine + demote the milestone economy to a supplement + re-tune `front_closed`/`clock_fired`/`choice` against felt combat XP — deferred until a live playtest feels real combat XP.

---

## 2026-06-30 (later) — Whole-repo code review + fix sweep

A full-repo code review (5 parallel subsystem agents + a cross-cutting scan) → fixed every actionable finding on branch `fix/code-review-sweep`. No new systems — correctness / security / drift hardening before the combat track. Gates: `check-manifest` OK · **all 20 verifiers green, 0 failures** (social 97 · dm-events 29 · advancement 35 · levelup 90 · walk 2807 · crit 25 · codex 57 · consequence 38 · seam 29 · prep 43 · prep-bundle 50 · saga 45 · rebirth 19 · wake-prep 47 · session 16 · creation-picks 24 · codex-roll 38 · monster-density 13 · plane 16 · proximity 12).

### Fixed (security)
- **DM-bridge path traversal (`dev/dm-bridge.py`):** `turnId` — a filename component on `/turn` + `/response` (GET & POST) — was interpolated unvalidated, so a `../`-laden id could read/write arbitrary `.json` outside `.dm/`, reachable cross-origin via the `Access-Control-Allow-Origin: *` routes. Now validated against `^[A-Za-z0-9_.-]+$` (`..` rejected) on all three routes. Static serving was never affected (`SimpleHTTPRequestHandler` sanitizes its own paths).
- **HTML-escaping asymmetry (stored-XSS / markup-break):** the DM-feed + character-sheet paths were carefully `escHtml`'d, but sibling panels weren't. Now escaped — player-typed character name/species/class/headline (`src/creator/roster.js`), faction name/agenda/method + pressure danger (`renderPowers`), gazetteer name/desc/cat (`gazPanel`), Oracle table text + filter (`src/ui/oracle.js`), bardo/sheet option labels. The roll-request button (`src/world/render.js`) now passes DM-supplied skill/ability as `JSON.stringify`'d args (the option-button pattern) — `escHtml` alone can't guard a `'` in the JS-string-inside-onclick context.

### Fixed (correctness)
- **`lookup()` missing-table guard (`src/engine/core.js`):** was `T[name].die` with no guard → a hard crash on an unknown table name during world-gen; now warns + returns an empty result (matching the engine's graceful-fallback idiom elsewhere).
- **`applyLeverage` terminal attitude (`src/engine/social.js` + `dm.js`):** a Helpful/+2 NPC (`socialDC` → `null`, "can't be talked higher") was silently coerced to DC 5 (trivially passable); now propagates `{dc:null, terminal:true}`, and the `social_check` handler reports "already-max" instead of faking a roll.
- **`spendResource` over-spend (`src/engine/resources.js` + `dm.js`):** reported `ok:true` while only partially paying; now refuses an over-spend (`ok:false, reason:"insufficient"`) like `spendSlot`, and the `resource_spent` handler distinguishes "no pool" from "not enough."
- **`attitude_shift` no-op (`src/world/dm.js`):** a shift with a missing `to` echoed the current value → a spurious "Wary → Wary" canon line; now rejected (`no-target-attitude`).
- **`findClockTarget` mis-targeting (`src/world/dm.js`):** the both-ways prefix match returned the first hit → a clock advance could land on the wrong same-stem front; now exact-match-first, unambiguous-prefix-only (ambiguous → untracked, not a guess).

### Changed (tooling)
- **`build/check-manifest.py`** owns-regex also catches `class` declarations (was a drift blind spot).
- **`build/apply-creature-scrub.py`** archives every file into a timestamped `zz_Archive/` before overwriting (the destructive-edit discipline; was git-only).
- **`build/gen-table-usage-audit.py`** writes its intermediate dump to `tempfile.gettempdir()` (was a hardcoded `/tmp`); **`build/scan-ip-remaining.py`** dead `if False` comprehension removed.

### Fixed (drift / docs)
- **`SEED` phantom-global note corrected** (`src/world/state.js` + `manifest.json`): transient state lives in `GS` — there is no live `SEED` global. `let U` → `var U` in `genesis.html` for parity with `GS` (window-reachable by inline handlers). Duplicate `.danger` CSS rule removed; stale `seed? (unused)` walk-opts doc dropped.
- **Two silently-broken verifiers repaired (`dev/verify-plane.mjs`, `dev/verify-proximity.mjs`):** their harness predeclared `var STAGES…`, colliding with `data/creation-flow.js`'s `const STAGES` (added to `loadOrder` later) → a SyntaxError on every run, on master. Stub trimmed to only what isn't in the module load order. Now plane 16/16 · proximity 12/12.

### Deferred
- **`src/engine/world-gen.js` + `hexmap.js` layer purity** — they mutate `w` / call up into the app layer from the `engine` layer. A genuine refactor (own branch `refactor/world-gen-layer`), not a sweep edit. Flagged, not done.
- **`check-manifest.py` layer-check depth** — validates declared `callTimeDeps`, not actual call sites, so a stale dep can hide an up-call. A checker feature; noted as a known limitation.

---

## 2026-06-30 — Loose-end sweep: XP rebalance + firing discipline + git cleanup + Success-Payout reconcile

Cleared the standing loose ends before the next track (combat). Git debris pruned; the XP economy re-tuned after a second playtest still felt inflated; the two parked design threads (#2 the dropped `xp_granted`, #3 Success-Payout Binding) resolved by *decision*, not new systems. Branch `fix/xp-rebalance-and-loose-ends`. Gates: `check-manifest` OK · `verify-advancement` 35/35 · `verify-dm-events` 29/29.

### Changed
- **XP trickle gutted (`src/engine/advancement.js`):** `discovery`/`fact_canonized` per-fact **10 → 1** (the daily cap held at `DISCOVERY_XP_PER_DAY = 30`). A maximally chatty in-world day now tops out at 30 XP — a tenth of a single level — so clue-hunting and dice-roll wins read as *flavour*, never advancement. (2026-06-28 cut 50→10 + added the cap; a second playtest still leveled the PC after nearly every dialog → this cut.)
- **DM-CHARTER §8.3b — "XP is detected, not declared: the firing ladder" (locked).** The deeper fix: the DM was mis-firing the *milestone* events on conversational beats, not just spamming `fact_canonized`. The new clause splits the labor — the DM judges *when a beat lands* (emits the event), the script owns *the number* (no `xp_granted`, no DM-named amounts) — and defines what legitimately counts as `front_closed` (an arc ends, not a scene) vs `clock_fired` vs `choice_logged{major}` vs the discovery rounding-error. "When unsure, narrate without an event."
- **`xp_granted` is an explicit no-op guard (`src/world/dm.js`)** — surfaced (console-warned) rather than silently dropped through `default`, so a stray DM emit is visible. Reason `xp-not-dm-granted`.

### Fixed (docs / drift)
- **`docs/ADVANCEMENT.md`** reconciled to the new numbers + a pointer to the §8.3b firing ladder (the number was the smaller half of the fix).
- **`docs/NEXT-STEPS.md` — Success-Payout Binding marked ☑ SUBSUMED** by the Consequence Ladder: prose-fiat banned by §8.5; **bind-first = `clBindFirst`**, **roll-on-miss = `clOnMissPlan`** (authorship = the effect-die "generate-to-contract, then capture" pattern, so no new event-node table is needed); clocking answered by the Diversion Rule. **Scope locked social-first.** Only the mint+capture call-site remains (deferred to post-playtest, per Consequence-Ladder §12).

### Chore
- **Git debris pruned:** removed the stale merged remote branch `feat/table-pass-place-gen`, the stale local branch `worktree-agent-afcee388c34fa46b2`, and the leftover agent worktree `.claude/worktrees/cranky-darwin-a14804`. Tree back to `master` / `origin/master`, single worktree.

### Decisions logged
- **Combat is the next track** (Adam 2026-06-30): a rudimentary SRD/DMG combat system *before* Fable — abstract "one/two moves away" range bands over the walk-module terrain, standardized CR-XP as the eventual advancement spine. Needs its own spec (like SOCIAL / the Consequence Ladder). Not built this session.
- **Test PC retired** — no XP reset; a fresh playthrough starts next.

---

## 2026-06-29 — The Consequence Ladder: re-authoring craft pass → a spice-band consequence system

The table re-authoring craft pass began with **Art Depiction**, which surfaced a system worth building: spice bands should earn **mechanical story-weight**, not just describe rarity. Spec `docs/CONSEQUENCE-LADDER.md`; DM-side licence `DM-CHARTER §8.5`; decision block in `DESIGN.md`. Branch `feat/consequence-ladder`.

### Added
- **`docs/CONSEQUENCE-LADDER.md`** — the full spec: demand-not-supply thesis · `band ≠ legs` decoupling · the chain → 3 sinks (handle / closed event / bind) + the Diversion Rule (anti-fractal) · codex-as-handles + interaction-gated storage · the player-rolled effect die · salience/promotion · the **session seam** (§7.1) + the **session-shape pacing model** (§7.2, the "parameters of fun") · the effect-die **generation contract** (§8, AI-generated not pooled).
- **`art-depiction` re-authored** (Spark→**Commitment**; 100 world-agnostic archetypal rows, 66/20/9/4/1) — the single-world Forgotten-Realms lore-dump became portable archetypes (DM grounds each onto the world's rolled facts; folds the IP scrub into the craft rewrite). High tail = the art itself goes wrong (talking/enterable/self-editing; incl. the Garrulous Gallery, Open Landscape, Vacant Frame). Original archived in `zz_Archive/`.
- **DM-only `Legs` + `Pool` columns** on Art Depiction (the Consequence-Ladder tags); `compile-tables.py` extended to carry them (exact-header match; excluded from narration text + structured cols; emitted as `row[6]/[7]` only when present — untagged tables byte-identical).
- **`src/engine/consequence.js`** (`engine.consequence`) — the pure resolver: `consequenceFor` (legs→sink, band→intensity) · `clResolveEffect` (pooled exemplar) · `clResolveStoredEffect` (captured bespoke die) · `clBindFirst` (reincorporation) · `clOnMissPlan` · `CL_LEGS`/`CL_POOLS`. `verify-consequence` 38/38.
- **`src/world/seam.js`** (`world.seam`) — the session seam: `seamHarvest` (carry-forward) · `seamProposeShape` (the pacing-model proposer) · `seamWeave` (trivialize/sustain/escalate) · `SESSION_SHAPES`. `verify-seam` 29/29.
- **`watcher-effect-pool`** — the first effect pool, the Hungering-Stone-standard exemplar (Nature · Player Use · The "Tell" · Escalation; spice-ordered 1→8). Kept as exemplar/fallback; the other six pools are **not** authored (replaced by the §8 generation contract).
- **The art hook** — `rollPlace({art:true})` rolls 0–2 art pieces (opt-in); `prepCastFrontier` mints hook/thread-seed pieces as their own soft codex handles (tags in `dm`, placed via `status.at`); dead-end art = narrate-and-forget flavor.
- **`dmDigest.sessionLean`** — surfaces the next-session lean + the non-trivial weave decisions + the override rule *in the payload* (so the DM can't read it as a mandate).

### Changed
- **DM Charter §8.5 (constitutional amendment): "Invention is licensed, but captured."** The AI may invent; the invention must land in the circuitry (codex/event/Ledger/motif), never free prose-canon. Refines the anti-drift north star (+ a pointer in §0).
- **The effect die is AI-generated to a contract, not a pre-authored pool** (Adam's call — pools sand off the specificity that *is* the value). Prep-time generation (primary) + on-the-fly (fallback); captured via `codex_update {dm:{effectDie}}`; `clResolveStoredEffect` reads it (round-trip verified — composes from existing events, no new event type).
- **The session shape is a soft lean, never a track** (Adam's refinement) — override hierarchy player→situation→lean; revealed-preference dominates the contrast nudge; applies only in lulls. "It colors; it never conveys."

### Fixed
- **Soft-pool eviction leak** — art handles given a `part-of` link were un-evictable (`codexEvictSoft` protects linked records), breaking the plateau bound. Switched to `status.at` placement (like NPCs/items) + added `artIds` to the recycle keep-set. Pool bounded again (`verify-prep` 43/43).
- **Compiler header collision** — the first cut matched `Legs`/`Archetype` by substring, hijacking legitimate "Archetype" content columns (`patron-archetype`, `dungeon-boss`, …) and blanking some narration. Switched to exact-header match; renamed the tag column `Archetype → Pool`.

### Deferred
- A **live Bridge playtest** to feel the seam + art hook + the lean in play (AI-side generation + pacing taste can only be judged live).
- The faction `motif` slot · mechanical sink-B beyond existing events · cross-world dormant-clock management · medium normalization (paintings-only is honored; `Art Medium`/`Art Condition` deferred).

### Verification
`check-manifest` OK · `compile-tables.py` 0 bugs (348 tables) · consequence 38 · seam 29 · codex 57 · codex-roll 38 · prep 43 · prep-bundle 50 · dm-events 29 · social 97 · crit 25 · advancement 35 — all green, no regressions.

---

## 2026-06-28 (evening) — Live-session fixes: XP rebalance, char-menu level-up, DM-agency rules

Three fixes surfaced while playtesting the live DM over the bridge. Branch `feat/playtest-xp-and-agency`.

### Added
- **XP readout + un-gated level-up in the character menu** — `renderCharacterPanel` (`src/world/render.js`)
  now shows an XP badge, a progress bar + "N XP to level X" line, and a **Level Up** button when one's
  earned (or "Choose your level-N powers" when interpretive picks are owed). New global `claimLevelUp`
  (`src/creator/levelup.js`) applies the level immediately — **leveling is decoupled from rest** (Adam:
  "you don't have to rest in BG3 to level up"); the rest-gate stays as a convenience trigger. CSS for
  `.cp-xp*` in `genesis.html`.

### Changed
- **DM-CHARTER §3** — new locked bullet *"Never act or speak AS the PC"*: the DM never narrates the
  character doing/saying anything the player hasn't declared, **not even to summarize known info**
  (the "Arke tells her" railroad). Hands off at the threshold instead.
- **DM-CHARTER §8.3a** — `fact_canonized` is for canon, not narration: reserve it for option-changing
  truths, not atmosphere.

### Fixed
- **XP economy rebalance** — a 19-fact social binge was paying 950 XP (→ level 3 off two interactions).
  `discovery`/`fact_canonized` dropped **50 → 10 XP**, and a **script-owned daily cap**
  (`DISCOVERY_XP_PER_DAY = 30`, enforced in `grantXp`, `src/world/dm.js`) zeroes further discovery XP
  past the ceiling per in-world day. Resolved tension (`front_closed` 300 / `clock_fired` 200) stays the
  uncapped level-driver; dice rolls pay nothing. Verified: the same binge now pays 30, resets next day.
  `verify-advancement` 35/35, `verify-levelup` 90/90, `verify-dm-events` 29/29.

### Deferred
- Current PC is already at L3/~950 XP from the old rates — the fix is forward-only (offered to reset that
  character's XP between sessions).
- The DM emits an `xp_granted` bonus-XP event that `applyEvent` silently ignores (~400 XP of intent
  dropped) — not a leak, but a latent trap: either wire it through the daily cap or tell the DM XP isn't
  its to grant.

## 2026-06-28 (later) — Deck-clearing: monster tags + table collapses + full IP scrub

The "clear the deck" prep before the craft pass (recontext/IP/wiring = enabling work, not the
re-authoring itself). All on `feat/reauthoring-deck-clearing`, merged to master.

### Added
- **Bestiary ecology tags** — all **374 monster files** gained `cr/role/habitat/treasure/activity/
  faction_fit` frontmatter (additive, +6/−0 each; custom tables untouched). A 14-agent workflow; the
  substrate for the future ecology selector (`REAUTHORING-SWEEP-PLAN` Track D).
- **Read-only evidence** — `docs/DECK-CLEARING-FINDINGS.md` + `build/{find-dup-rows,scan-creature-ip,
  scan-ip-remaining}.py`. The dedup scan **corrected** the recontext plan: the NPC mood/temperament
  cluster is 0–5% overlap (distinct content, not duplicates) — only `urban-scene→urban-sensory` was a
  clean fold.

### Changed
- **3 copy-paste tables collapsed (lossless)** — Travel Biome 100→12, Travel Destination Type 100→10,
  Urban Lighting 50→9 (same die, same odds, same text; originals archived). `build/collapse-duped-tables.py`.
- **IP scrub — the table corpus + monster stat files are now creature/deity/brand-clean.** Creature
  cluster (23 trademark nouns → coinages: Beholder→Eye-Tyrant, Mind Flayer→Mind-Thief, Drow→Deep-Elf,
  Aboleth→Elder Deep-Thing, Underdark→Deeplands…) + 15 stat files renamed; deities/demon-lords genericized
  (Gruumsh→the One-Eyed, Vecna→the Whispered One, Orcus→the Death-Lord, Baphomet→the Horned King…); all
  **100 celebrity `_Analog:` labels → `_Archetype:`**; FR places/factions/campaign tokens cleared; faction
  stubs renamed (Harpers→Hidden Network, Zhentarim→Shadow Syndicate). **Kept:** Shou (SRD-reprieved) + the
  **required SRD 5.2 CC-BY attribution**. Re-runnable via `build/apply-creature-scrub.py`. Recompiled
  tables.json/js. Verify: final real-IP grep clean; check-manifest OK; monster-density 13/13.

### Deferred (out of scope by design)
- **Art Depiction's FR lore-dump** (#2) — a CRAFT rewrite (invented epics), the first craft-pass target.
- The DC-Comics "Bane" / Outlandish diegetic reskin — its own item.

---

## 2026-06-28 (later) — Fix: DM stream is sticky-but-escapable (scroll-up no longer fought)

### Fixed
- **The word-by-word DM stream trapped the reader.** `streamDMText` (`src/world/render.js`) scrolled to the
  new message's *top* and then auto-followed the cursor whenever the reader was within 48px of the bottom —
  so trying to scroll up (to read back) was fought by the 24ms auto-scroll, and you were forced to watch it
  type. Rewrote it as **sticky-but-escapable**: it follows the bottom only while you're parked there
  (tracking the exact scrollTop *we* set), and the instant you grab the scrollbar (current pos diverges from
  ours), it **completes the text immediately and stops following** — so you read freely. Gates:
  `check-manifest` OK · `verify-dm-events` 29/29.

---

## 2026-06-28 (later) — Fix: DM narration truncated to its first line (quote in `data-full`)

### Fixed
- **The freshest DM line only showed up to its first double-quote.** `escHtml` (`src/world/render.js`)
  escaped `&<>` but **not `"`**, and the streaming renderer carries the new narration in a
  `data-full="${escHtml(m.text)}"` attribute. Since DM narration almost always contains dialogue
  (`"Who goes there?"`), the first `"` closed the attribute early, so `streamDMText` only ever streamed the
  text up to that quote — "only the top line." On refresh the line renders as element *content* (not an
  attribute), so the full text reappeared. Hardened `escHtml` to also escape `"` → `&quot;` (correct for an
  HTML escaper; renders identically in content and attributes). Gates: `check-manifest` OK · `verify-dm-events` 29/29.

---

## 2026-06-28 (later) — Fix: wake cinematic stall + leading-options regression (playtest)

Two playtest bugs at session creation, same flow (`autoOpenScene`).

### Fixed
- **Black-screen stall on entering a world.** When the app is served by `dm-bridge.py`, `/dm/health`
  returns OK, so the OPENING turn is sent and the loading cinematic is raised — but if **no live DM is
  watching**, the turn never resolves and `wakeReveal()` never fires, sticking on the loading screen
  (the existing fallbacks only covered bridge-down / fetch-reject). Added an 8s **safety-net timeout** in
  `autoOpenScene` (`src/world/play.js`) that lifts the screen if `GS.wakePrep` is still up — a no-op when
  the DM answers first.
- **Leading 3-option menu reappeared** (violates DM-CHARTER §3 "open handoff, default OFF since
  2026-06-24"). Two causes: the OPENING prompt **explicitly requested** "an `ask` with 3 choices," and
  `renderDMFeed` rendered the option buttons with **no gate**. Rewrote the OPENING prompt to ask for an
  open handoff with hooks planted in narration (no menu), and **gated the option buttons** behind a
  default-off dial `U.dmOptions` (`src/world/render.js`) — the prompt + open input always show; a genuine
  either/or fork lives in the DM's prose, not buttons.

Gates: `check-manifest.py` OK · `node --check` both files · `verify-dm-events.mjs` 29/29.

---

## 2026-06-28 (later) — Re-authoring sweep planning: recontext scan + corpus intensity-map + rubric

A planning/docs unit (no table source or module changes). A 5-angle recontextualization workflow + a
monster-flavor/wiring recon agent, synthesized into an executable plan; then — after Adam clarified that
"re-authoring" means a **hands-on whole-corpus craft pass** (every row up to par + seed explosive high-band
twists), not triage — the craft-pass tooling (a generated corpus map + a rubric). The recontext / IP-strip /
monster-wiring work is reframed as the **deck-clearing prep**, not the main event.

### Added
- **`docs/REAUTHORING-SWEEP-PLAN.md`** — the executable **two-lane** plan: **Lane A (autonomous-safe,
  overnight)** = 3 recontext primitives (lens-operator / compose / merge-helper) + 4 SRD-mined lenses
  (Condition / Hazard-Effect / Trait→Behavior / Magic-Item) + new content tables + the **bestiary substrate**;
  **Lane B (propose-and-wait)** = consolidation (merge/retire ~11 items), the **creature IP scrub** (a
  scripted token-swap that doubles as the creature-reskin mechanism), the hand-authoring residue (#2 Art
  Depiction the long pole), the Outlandish reskin, and the **monster-into-game wiring** (the bestiary is 100%
  unwired today — creature = a dead name-string via `walkPickFromPool`).
- **`build/corpus-intensity-map.py` + `docs/CORPUS-INTENSITY-MAP.md`** (generated) — scores all **347 tables**
  on floor (copy-paste/ungraded) + ceiling (explosive headroom). Surfaced: **238 content tables, ~210
  UNGRADED** (no band column — spice unrecorded), **27 ★BAR exemplars** (the study set), **12 DUPED**
  (copy-paste-inflated → die-collapse). Re-run after edits.
- **`docs/REAUTHORING-RUBRIC.md`** — the craft-pass standard: the quality **floor** + the explosive
  **ceiling**, benched on the corpus's own best rows (Myth Costs "The Retroactive Author", Place-Secret "The
  Memory Sustains It", Plot Item "The First Door"); the "what makes a row explode" distillation + six
  explosive **seed-patterns** + the per-table working loop + the honest band-split target.

### Changed
- **`docs/NEXT-STEPS.md`** — the re-authoring section restructured into a pointer to the two-lane plan.
- **`docs/README.md`** — indexed the three new docs.
- **`docs/TABLE-REAUTHORING-PREP.md`** — banner: this is now the per-table **flavor brief** under the plan
  (the flat 38-item worklist framing is superseded).

### Deferred / carried forward
- The deck-clearing (consolidation / IP-strip / monster-wiring) and the whole-corpus craft pass are **queued**
  on a fresh branch. Destructive moves are **propose-and-wait** (Adam's call). The IP strip stays.
- Reframe saved to auto-memory: **"re-authoring" = a hands-on whole-corpus craft pass**, not recontext/triage;
  recontext/IP/wiring is enabling prep.

---

## 2026-06-28 (later) — SOCIAL Phases 3 + 4 (events + surfacing) + a `/code-review` fix pass

A general `/code-review` of the merged SOCIAL Phases 1–2, then the follow-ups Adam asked for: fix the
findings, **wire Phase 3** (the event layer), then **Phase 4** (surfacing). All on `master`'s working tree;
`check-manifest.py` green; the social verifier grew 68 → **97/97**. SOCIAL is now end-to-end.

### Added — Phase 4 (surfacing)
- **DM digest materializes attitude** (`codexDigest`): every NPC carries `attitude{value,label,opening,
  floor,ceiling,terrified,read,lazy}` via `codexGetAttitude` — the DM reads the stance even on a lazy-default
  NPC instead of guessing it.
- **The player-facing disposition tell** — a five-step dot ladder + label on the Codex panel (`codexPanel`),
  shown **only** for an NPC the player has *read*. New `insight_read` event prices the §6 scaled DC
  (`insightReadDC`) vs the player's open roll → on success flips `attitude.read` via the new
  `codexMarkAttitudeRead`; `codexPlayerView` gates the tell on `known && read` and exposes value+label only
  (never the DC/opening/clamps — those stay the DM's spine).

### Added — Phase 3 (events)
- **The typed events** (`src/world/dm.js` `applyEvent`): `social_check`, `attitude_shift`,
  `morale_check`, `parley_open`. `social_check` is **declared** (the PC's open roll + skill + visible levers);
  the script prices the DC from the NPC's CURRENT attitude (`socialDC` + `applyLeverage`), runs
  `resolveSocialCheck`, and COMMITS the delta via `codexSetAttitude`/`codexSetTerrified` — the DM reports the
  dice, never the verdict (§5 anti-drift). The **detected** `kill{civilian}`+co-location → witness-hostility
  cascade fires off the new `codexWitnessesAt` (the script remembers who saw). Faction-member group cascade
  stays declared via `attitude_shift` (§7 scope guard).
- `codexWitnessesAt(w, at, exceptId)` (`src/world/codex.js`, registered in `manifest.json`) — co-located NPC
  query for the witness cascade.
- 19 new `dev/verify-social.mjs` assertions (Phase 3 events + regression guards for every fix below).

### Fixed (from the review)
- **`codexSetTerrified` branded a never-frightened NPC permanently Hostile** when the resolver cleared the
  flag — clearing terror on an NPC with no attitude is now a no-op (no minted record).
- **A sworn enemy clamped below Indifferent returned `granted:true`** at its ceiling — now resolves to
  `outcome:"wall"`, `granted:false` (a telegraphed wall, not bought cooperation); a cap AT Indifferent or
  above still grants.
- **`applyLeverage` honored `decisive` only for `type:"leverage"`** — now ANY decisive lever auto-shifts, so
  a §4.2 buy-off encoded `{type:"want",decisive:true}` bypasses the roll.
- **`codexAdd`'s shallow `Object.assign` could clobber the nested attitude object** on an idempotent re-add —
  now deep-merges `status.attitude` (clamps/opening/terror survive a partial re-add).
- **`engine.social` had no layer** in `check-manifest.py` — added (L1, pure logic); the warning is gone.
- Clarified in `resolveSocialCheck` that the per-NPC floor intentionally bounds a Terrified result.

---

## 2026-06-28 — ANTI-DRIFT PUSH: XGtE/Tasha mining → content + the SOCIAL subsystem (Phases 1–2)

Adam added *Xanathar's Guide* + *Tasha's Cauldron* to `Reference/` and asked what mechanical content could replace
AI-DM invention. Mined both (+ the DMG) for structure, authored IP-clean, then built. All on branch
`feat/antidrift-content-gifts-tools` (one session; not yet merged). Edit-source → compile-artifact throughout;
`compile-tables.py` 0 coverage bugs; `check-manifest.py` green.

### Added
- **The SOCIAL subsystem — the social analog of combat** (`docs/SOCIAL.md`, new system-spec): a 5-state Attitude
  ladder (Hostile…Helpful) as per-NPC Standing, attitude-derived social-check resolution (one Cha check shifts one
  step; the existing `NPC Want/Fear/Leverage/Trust-Lever` tables become the DC modifiers), morale/fight-or-flight
  (shippable before the combat engine), and creature parley fed by `Monster Motivation`. Collapses the DMG
  NPC-attitude + morale and Tasha's *Parleying* candidates into one resolver. All 6 §9 open questions resolved w/ Adam.
  - **Phase 1 (data model):** `status.attitude` on the codex record + `codexGetAttitude` (lazy Indifferent default),
    `codexAttitudeOpen` (opening stamped once + per-NPC floor/ceiling clamps), `codexSetAttitude`, `codexSetTerrified`
    (per-encounter override), `attitudeLabel` (`src/world/codex.js`). Rides the DM digest; stripped from player view.
  - **Phase 2 (resolver):** `src/engine/social.js` (new module — pure/deterministic, returns deltas, no state writes):
    `socialDC` / `applyLeverage` / `resolveSocialCheck` / `moraleDC` / `resolveMorale` / `insightReadDC`.
  - **Verifier:** `dev/verify-social.mjs` **68/68** (the spec's §8 worked examples ride as fixtures).
  - **Dependent tables (rollable):** `NPC Opening Attitude` (Fork), `Creature Parley — What It Wants` (Fork),
    `Morale Outcome` (Commitment→Mythic).
- **Supernatural gifts — a reward currency** (rollable via the Oracle): `Supernatural Charms` (d20 Fork, finite-use
  perks) + `Supernatural Blessings` (d20 Commitment, lasting favors → Ledger canon). IP-clean Genesis-native.
- **Anti-drift content from the backlog:** `Puzzle Type/Mechanism/Solution Path/Failsafe` (the Failsafe = the solo
  no-wall-block), `Patron Archetype` (+ codex design note), `Tool Proficiency Uses` / `DC Ladder` / `Hazard Severity`
  / `Walk-On Quick Stats` (DM-reference lookups — not rolled).
- **Docs:** `docs/TABLE-REAUTHORING-PREP.md` (workflow-synthesized prep for the next flavor pass — ~26 weak tables
  prioritized, 6 resolve-first decisions, IP-scrub list, exemplars); XGtE/Tasha source map + ranked anti-drift
  candidates added to `DESIGN.md` + `NEXT-STEPS.md`.

### Changed
- **Stale band-vocab sweep:** `Less-Grounded` → `Textured` across **28 active tables** (all 21 Tarot cards,
  Architecture Material, Art Medium, Atmosphere Sounds, Master Setting, Faction–Basic, Social-taboos, Starting State
  Pressure); 3 `zz_Archive` snapshots left untouched. Recompiled.
- **Decision (Adam): `Dungeon Loot - Outlandish`** keeps its cross-IP joke loot but gets a **diegetic reskin**
  (describe the thing as a fantasy world perceives it — neutralizes the trademark-name IP risk) + a new backlog item
  for **anachronism-intrusion hooks**.

### Fixed
- `Creature Parley` row 20 carried a Volatile band on a Fork table → rebanded to Strange (caught by the workflow's
  adversarial review).
- `Urban Encounter Type` row 20 had an unclosed `**Complex Scene` bold → closed.
- `Walk-On Quick Stats` cited a nonexistent `Thug` sheet → `Spy`; `Patron Archetype` `owes` link-direction gloss.

### Deferred
- **SOCIAL Phase 3** (the `social_check`/`attitude_shift`/`morale_check`/`parley_open` events through `applyEvent`,
  incl. detected auto-shifts: kill-witnessed → hostility, faction clock → member drop) and **Phase 4** (digest +
  player-facing attitude tell).
- Wiring the gift/tool/DC references into the DM digest; codex `gifts[]` PC flag + granting hooks; puzzle/patron
  generator call-sites.
- The **table re-authoring pass** (prep doc ready) + the **IP scrub** it surfaced (`Art Depiction` rows ~46–96 are a
  Forgotten-Realms lore-dump; a ~15-file WotC creature/race/plane spread).
- The Outlandish diegetic reskin + anachronism hooks (direction decided, not built).

---

## 2026-06-26 — SCOPED TO TIER 2: level-10 ceiling + leveling 1→10 + balance guards

Decision (Adam): **cap this version at Tier 2 (levels 1–10)**; defer Tiers 3–4 to a future expansion.
Aim for a solid, complete T1–T2 experience. New decision doc **`docs/TIER-SCOPE.md`**. Shipped as 4
merges (Phases A–E across `feat/tier2-cap-guards`, `feat/tier2-advancement`, `feat/tier2-balance`).

### Added
- **The leveling spine — characters can now level 1→10** (was: level-1 forever). New
  `src/engine/advancement.js`: SRD `XP_THRESHOLDS` (in-code canon; full L1–20 with `levelForXp` clamping
  to `LEVEL_CEILING=10`), `xpForEvent` draft pricing, `awardXp`, `applyLevelUp` (re-derives + GROWS HP /
  proficiency / spell slots / pools). XP accrues via `grantXp` on the priced `applyEvent` cases; `passTime`
  is the rest-gate that claims a pending level-up. Interpretive picks (spells/ASI/subclass) are DM-narrated
  in v1; the in-app picker is a fast-follow.
- **Tier-2 cap guards** — `TIER_CAP=2` + `pbundleTierForLevel` (prep-bundle); the walk generators clamp
  `opts.tier ≤ 2`; the bundle `meta` carries `tierCap/levelCeiling/crCeiling`.
- **Wilderness tier-awareness + threat-signaling** — `rollWildernessWalk` is tier-aware; every Enemy leg
  telegraphs danger (fiction-only, via the sign-of-passage), closing the DIFFICULTY.md wilderness gap.
- **Verifiers** — `dev/verify-advancement.mjs` (35), `dev/verify-monster-density.mjs` (13, CR-roster audit:
  T1=234 / T2=97, flags CR9-10=14 thin); cap/guard assertions added to `verify-walk` (2801) +
  `verify-prep-bundle` (50).

### Changed
- `applyEvent` `level_applied` is now the real recompute (was a deferred stub), capped at the ceiling.
- `ensureResources` lazily heals pre-leveling saves (`level`/`xp`). `cgBind` stamps `level:1, xp:0`.

### Fixed (pre-merge /code-review)
- `applyLevelUp` no longer full-heals on level-up (would free-heal on a short rest) — it grows current HP
  by the gain only. Proficiency now reads CLASS_PROGRESSION's canonical `pb` (formula fallback).

### Deferred (authored-but-inert; docs/TIER-SCOPE.md) + content-backlog
- T3/T4 loot budgets + Legendary/Artifact tables, Outlandish d300 banding (L4), the 5 variant items (L3b),
  CLASS_PROGRESSION L11–20, the Encounter-template T3/T4 sections — all marked DEFERRED. Verify-guarded so
  the in-game loot path can't surface a deferred band.
- **Queued (T1/T2 polish):** the `wilderness-threat-identity-t1/-t2` tables (sample-review authoring pass);
  the in-app level-up choice picker; CR 9–10 capstone density.

---

## 2026-06-26 — Critical-Magnitude engine WIRED (the honest-dice spike)

`CRIT-MAGNITUDE.md`'s two remaining unbuilt pieces (the crit engine + the auto-canon Ledger write) are
now built — the lens oracle (built 2026-06-23) is wired to live d20 rolls. Branch `feat/crit-magnitude`.

### Added
- **`src/engine/crit.js`** (new module, 44 total) — `rollCritMagnitude(natural,{magnitude})`: a nat 20/1
  + the magnitude d20 → band (`critBand`: success ladder + the INVERTED failure ladder) → lens count →
  `critDrawLenses` draws that many DISTINCT lenses from the compiled `mythic-success/failure-lenses` (d12;
  reroll dupes). The row-1 "a place is transformed/scarred" lens routes into the Myth suite (rolls
  `myth-seeds`). Pure roller — returns an atom payload (rolled dice + lens vectors), never writes the world.
- **`crit_outcome` event** in `applyEvent` (`src/world/dm.js`) — writes a Mythic result to the Ledger as
  **canon** (the permanent boon/scar); amplified results log as `outcome`. The DM narrates the shape, then
  emits the event; the script owns the persistence (EVENT-CONTRACT).
- **`dmRollFor` hook** — on a nat 20/1 it rolls the magnitude die **openly** (Charter §6.1 dice
  transparency) and attaches the lens vector to the turn, so the DM narrates *from* the dice.

### Verified
- `dev/verify-crit.mjs` 23/23 (band table both ladders, distinct-lens draw, place→Myth handoff, crit_outcome
  canon-vs-outcome routing); `check-manifest` OK (44 modules; `engine.crit` layer 1); no regressions
  (`verify-dm-events` 28 / codex 57 / prep 43 / session 16). In-play handshake render to eyeball at the
  next live Bridge session.

---

## 2026-06-26 — CODEX loose ends closed (soft-pool eviction cap + prep item-casting) + consistency review

Tied off the two follow-ups the Codex track left open, after a cross-system architecture/style review
confirmed the recent systems (Codex / Session-Prep / Death & Rebirth / event runtime) are coherent —
consistent layering, naming (`roll*`/`codex*`/`apply*`), state discipline (GS vs U accessors), and
event-contract adherence. One drift flagged for a separate change: `rollVision` mutates despite the
`roll*` prefix (→ rename `fireVision`).

### Added
- **Soft-pool eviction cap** (`codexEvictSoft(w,{cap,keepIds})` in `src/world/codex.js`, default
  `CODEX_SOFT_CAP=24`) — the code-review follow-up. Records now carry a monotonic mint `seq`; eviction
  drops the OLDEST untouched soft records beyond the cap, keeping the freshest as the §8b reusable pool.
  SACRED (never evicted): hard (touched=canon), known, any link endpoint, anything in `keepIds`. Wired
  into `prepRecycleStale` (`src/world/prep.js`) — the recycle heartbeat computes `keepIds` from surviving
  frontier-bound cast, so the pool stays bounded **independent of session count** (the digest no longer
  grows unbounded over a long campaign).
- **Prep item-casting** — `pbundleCast` (`src/engine/prep-bundle.js`) now rolls the macguffin via
  `rollItem` (sometimes lock-sealed); `prepCastFrontier` mints + places it at the frontier location
  (status.at), the DM wires who-holds-it; `prepBundleSummary` surfaces it for Stage-1; the cast count
  includes it. (The roller existed since Phase 5; prep now calls it — the easy follow-on.)

### Verified
- `check-manifest` OK (43 modules, +2 owned symbols on codex.js, +`rollItem`/`codexEvictSoft` deps).
- `verify-codex` 57 (8 new eviction assertions), `verify-prep` 43 (item-casting + a 30-session
  eviction-plateau test proving boundedness), `verify-codex-roll` 38, `verify-prep-bundle` 47,
  `verify-session` 16, `verify-dm-events` 28 — all green.

---

## 2026-06-25 — Project relocated + stale path strings swept

Genesis was moved out of the Obsidian vault to its own home at `~/Desktop/Work/projects/Genesis`
(commits `bf3818c` → `8bb6a93`). It is no longer a sibling of the `Shifting Vale` / `Playtest Sandbox`
human-DM vaults (those now live at `~/Desktop/D&D/Obsidian Files/`). A follow-up pass swept the stale
`Obsidian Files/Genesis/` path strings the move left behind.

### Changed
- **Relocated the repo** to `~/Desktop/Work/projects/Genesis`; recorded the move in `CLAUDE.md`
  (the campaign vaults are "no longer siblings").
- **Swept stale path strings** (`docs/relocation-path-cleanup`, `9f11f6d` → `798d576`): `HANDOFF.md`
  ("Where to operate" + the manual `http.server` run command), `README.md` (docs-folder location),
  `DESIGN.md` (docs-organization decision entry). Verified all referenced paths resolve on disk
  (repo root, campaign vaults, `Open Genesis.command` launcher — the launcher already pointed at the
  new path).
- **Updated the `genesis` skill** to match — live `SKILL.md` **and** the plugin `manifest.json`
  description (the latter is what drives skill triggering), so a fresh session loads the correct
  `~/Desktop/Work/projects/Genesis` paths.

### Left as-is (history, not drift)
- Dated historical log lines in `CHANGELOG.md` (the repo-init entry) and `NEXT-STEPS.md` (the
  2026-06-18 ☑ engine-dedup entry) still name the old path — they record where things were *at that
  date*, so rewriting them would falsify the log.

---

## 2026-06-25 — CODEX Phases 2–5 REVIEWED + MERGED to master

Pre-merge `/code-review` (8 finder angles → 3 real fixes) then `--no-ff` merge of `feat/codex-phase2`
(Phases 2–5) to `master`; pushed to `origin` (`b3eee9a`), branch deleted.

### Fixed (from the review)
- **`startSession` flag ordering** (`play.js`) — set `w.sessionLive=true` BEFORE `beginSession()`, so a
  throw past `beginSession`'s inner catch can't strand a half-started session into a double-increment.
- **Prep-cast id collisions** (`prep.js`) — new `prepCastId()` disambiguates same-named cast records; two
  frontiers rolling the same place/NPC name now mint distinct records instead of silently merging via
  `codexAdd` (which would point both frontier nodes at one location and reveal the wrong one on contact).
- **`status` clobber** (`prep.js`) — merge the NPC status object rather than replacing it wholesale, so a
  future `rollNPC` status field survives the `{at:locId}` placement.
- `verify-prep.mjs` +2 (→36): same-named cast records stay distinct.

### Deferred (logged in NEXT-STEPS — design call needed)
- **Soft-pool eviction cap** — every session casts ~6 soft codex records that survive recycle (the §8b
  reusable pool), and `dmDigest` sends the whole codex each turn, so the digest grows unbounded over a long
  campaign. Needs a prune/cap policy (age-out untouched soft records, or digest only near-PC + 1-hop links).

**Codex Phases 1–5 are now on master.** The anti-drift loop is closed: dice deal the cast, the DM connects
rather than invents. Remaining: Phase 6 (Codex UI panel) + the soft-pool cap + a live re-playtest (eyeball
the Phase 4 shelf button/cinematic; run the `codexProvenanceReport` ratio test vs the ~20% Saltrest baseline).

---

## 2026-06-24 (session 11) — CODEX Phase 5 BUILT (the two missing table-sets)

The tables the Saltrest DM had to invent whole — now rolled. Three net-new **d300 Commitment** tables,
spice-graded 198/60/27/12/3, authored via 3 parallel Sonnet agents (one file each, disjoint lanes) and
compiled.

### Added (Engine tables)
- **`building-interior`** (`Engine/.../Place Generation/Building Interior.md`) — connected spaces + a
  notable feature + who/what's inside, for any building the players enter. The "gran's house had nothing
  to roll" fix. Ladder escalates the SPACE (ordinary rooms → hidden room → impossible geometry).
- **`plot-item`** (`Engine/.../Quests & Problems/Plot Item.md`) — a specific significant object + why it
  matters + what it opens/proves/unlocks. Replaces the abstract `quest-macguffin` *categories*.
- **`plot-lock`** (`Engine/.../Quests & Problems/Plot Lock.md`) — the key/lock complement: what's sealed +
  where the key is kept.
- **Mythic rescaled to cosmic** (Adam's review): the old Mythic read as Strange; the top band now rewrites
  a law of the world — a fact unmade, the inside/outside boundary, the death-and-rebirth wheel itself.
- Recompiled → **337 tables, 0 real coverage bugs**.

### Added (rollers)
- **`rollItem(opts)`** + **`rollBuildingInterior(opts)`** in `src/engine/codex-roll.js` — codexAdd-ready
  payloads. Items are **pointers** (§8b): `source:{type:"plot",ref:"plot-item#<row>"}`, optional `lock`
  rolls the `plot-lock` companion. Building interiors mint a `location` record (layout+feature player-side,
  who's-inside DM-side). `dev/verify-codex-roll.mjs` extended → 38.

Verified: codex-roll 38 · codex 39 · session 16 · prep 34 · prep-bundle 47 · dm-events 21 · check-manifest OK (43 modules).
**Phases 1–5 complete. Next: Phase 6 (Codex UI panel) + re-playtest with the mechanical-vs-invented ratio test.**

---

## 2026-06-24 (session 10) — CODEX Phase 4 BUILT (the session frame)

The explicit Start/End Session frame — by the time the chat appears, the cast exists as records.

### Added
- **`startSession(id)`** in `src/world/play.js` — the front door: enter the world → `beginSession`
  (casts the codex via `startPrep`) → `wakeIntoWorld` prep/loading cinematic → the DM opens the scene
  once the cast is hard data. Idempotent on a live session (`w.sessionLive` guard — won't double-cast).
- **`endSession()`** — clears `w.sessionLive`, writes a closing ledger/log beat, recycles unvisited soft
  prep (`prepRecycleStale`), returns to the world-select shelf. The soft codex cast survives as the
  reusable pool (§8b).
- **UI** — a **▶ Start session** button on every world card (`renderShelf`) and a session-aware Start/End
  control in the in-world actions (`worldActions`); a gold **"session live"** badge on the active card.
  `.wc-start` style.
- **`dev/verify-session.mjs`** (16) — start increments + casts + idempotent; end clears + recycles +
  returns to shelf + soft cast survives; a fresh start after end begins session 2.

### Changed
- The buried in-world "§ New session" button is replaced by the session-aware ▶ Start / ■ End control;
  time transitions split into their own labeled group.

Verified: session 16 · prep 34 · prep-bundle 47 · codex-roll 27 · codex 39 · dm-events 21 · check-manifest OK (43 modules).
**Browser render sandbox-blocked here — eyeball the shelf button + cinematic at playtest.** **Next:
re-playtest + the mechanical-vs-invented ratio test → Phase 5 (missing table-sets) → Phase 6 (Codex UI).**

---

## 2026-06-24 (session 9) — CODEX Phase 3 BUILT (prep casts the codex)

The casting pass — the structural fix for the Saltrest "DM invented the whole cast" failure.

### Added
- **`pbundleCast`** in `src/engine/prep-bundle.js` — for each frontier, the engine rolls a soft cast:
  1 named **location** (`rollPlace`) + **1–2 NPCs** (`rollNPC`, the first biased `roleHint:"questgiver"`),
  as codexAdd-ready payloads carried on `environment.cast` in the bundle. No-op (cast:null) if the codex
  rollers / compiled tables aren't loaded.
- **`prepCastFrontier`** in `src/world/prep.js` — `startPrep` mints the cast into `w.codex` as
  `provenance:"prep", soft:true`, binds the location to the frontier node (`node.codexId`), and places the
  NPCs at it (`status.at`). `ensureCodex` runs first (migrates factions/gazetteer). The prep-staged ledger
  line now reports the cast count.

### Changed
- **`lockOnContact`** — entering a rumored frontier now also locks its cast **location** soft→hard
  (touch=canon, §8b) and reveals it; the frontier's NPCs stay a reusable soft pool until actually met.
- **`prepBundleSummary`** — carries a compact cast (location name + NPC names/roles/species) so the
  Stage-1 synthesis-harvest sees the cast to **connect**; the full bundle carries the full payloads.

Verified: prep-bundle 47 · prep 34 · codex-roll 27 · codex 39 · dm-events 21 · check-manifest OK (43 modules).
**Next: Phase 4 — Start/End Session buttons (world-select → prep casts the codex → cinematic → chat),
then re-playtest + the mechanical-vs-invented ratio test.**

---

## 2026-06-24 (session 8) — CODEX Phase 2 BUILT (the rollers — the engine mints the atoms)

### Added
- **`src/engine/codex-roll.js`** (`engine.codex-roll`) — `rollNPC(opts)` + `rollPlace(opts)`. The engine
  mints the **atoms**: each chains the already-compiled `npc-*` / `place-*` tables (via `rollTable`) into a
  **`codexAdd`-ready payload** — `rolled` (raw dice verbatim), a player-safe `fields` glance-read
  (species/role/demeanor; place desc/trait/calamity), and DM-only `dm` levers (secret/fear/bond/want;
  place hidden truth + history). `rollNPC` also maps the rolled race → a `CHAR_NAMES` species pool for a
  provisional name (the DM name-confirms); `rollPlace` splits the setting cell's `"Name: desc"`. The
  rollers **don't write the world** — prep / the DM emit `codex_add` events; the AI assigns final meaning +
  wires links. `opts.roleHint` is recorded for the AI; `opts.depth` rolls place-history. `rollItem` waits
  on the Phase-5 plot-item tables.
- **`dev/verify-codex-roll.mjs`** (27 checks — payload shape, DM-secret never leaking into player `fields`,
  the race→species mapper, the name/desc split, and the payloads flowing through `codexAdd` + `codex_add`).

Verified: codex-roll 27/27 · codex (Phase 1) 39/39 · dm-events 21/21 · check-manifest OK (43 modules).
**Next: Phase 3 — prep casts the codex (extend `assemblePrepBundle`; synthesis connects a dice-dealt cast).**

---

## 2026-06-24 (session 7b) — CODEX Phase 1 BUILT (the relational entity store)

Adam approved the spec + refinements (large cast + recontextualization engine, codex-as-store with a
sanitized player projection, touch-locks-to-canon, core link vocab, item pointers). Phase 1 built.

### Added
- **`src/world/codex.js`** (`world.codex`) — the relational entity store. Records `{id, kind, name, rolled
  (verbatim), fields (player-safe), dm (DM-only), links[] (typed wikilinks), status{known,soft,at,
  condition}, source, provenance}`. CRUD, typed links with both-way query (`codexLink`/`codexLinksOf`), the
  **two-tier lifecycle** (`codexReveal`→known; `codexContact`→soft-locks to canon; `codexRecontextualize`
  preserves the rolled soul + reassigns context and **refuses on hard/contacted records**), the soft pool,
  the all-seeing `codexDigest` vs the knowledge-gated **sanitized** `codexPlayerView`, the core link
  vocabulary, and `ensureCodex` migration (gazetteer/factions → records, idempotent, non-destructive).
- **`codex_*` events** in `applyEvent` (`codex_add`/`codex_link`/`codex_update`/`codex_reveal`/
  `codex_contact`). **Digest** now serves the all-seeing `codex` slice.
- **`dev/verify-codex.mjs`** (39 checks).

Verified: codex 39/39 · dm-events 21/21 · wake-prep 47/47 · prep 22/22 · prep-bundle 32/32 ·
check-manifest OK (42 modules). **Next: Phase 2 (`rollNPC`/`rollPlace`) → Phase 3 (prep casts the codex).**

---

## 2026-06-24 (session 7) — Streaming scroll fix + CODEX spec (relational entity layer)

### Fixed
- **Streaming viewport: sticky-bottom, not locked-bottom.** The word-by-word reveal was force-following the
  cursor every token (rigid yank to bottom). Now it only follows if the reader is already at the bottom;
  streaming starts at the new block's top and fills downward at reading pace. `src/world/render.js`.

### Added (spec — no code)
- **`docs/CODEX.md`** — the relational entity layer (NPCs / Locations / Items / Factions as wikilinked
  records in `w.codex`; engine rolls the atoms via `rollNPC`/`rollPlace`, AI assigns meaning + links; prep
  casts the codex; Start/End-Session frame; the missing building-interior + plot-item table gaps). Born from
  the Saltrest playtest, where the DM invented the whole cast because Session-Prep rolls the stage, not the
  players, and there's no entity store. Decision rows in `DESIGN.md` (2026-06-24); `NEXT-STEPS.md` "Do next"
  updated; `README.md` index updated. **Status: spec draft, build pending — Phase 1 (data model) is the
  load-bearing call.**

---

## 2026-06-24 (session 6b) — Skills panel with live modifiers + consumable-resource tracking (slots/HP/pools)

Two features that landed together in the working tree (the resource system via the spawned task), verified
as a union. Branch `feat/skills-and-resources`.

### Added
- **Skill modifiers on the Character panel.** Full 18-skill list, each with its actual roll modifier
  (ability mod + prof if proficient), sorted best-first, ● = proficient — so the player can pick the right
  skill at a glance. New `SKILL_ABILITY` map (`data/srd-creator.js`); render in `renderCharacterPanel`.
- **Consumable-resource tracking (engine-owned).** New `src/engine/resources.js` (`engine.resources`):
  `deriveResources`/`ensureResources` (maxes from `CLASS_PROGRESSION`/`srd-creator`), `spendSlot`,
  `spendResource`, `applyHpDelta` (clamped), `RESOURCE_POOLS`. Sheet now carries current HP (`hpCur`),
  spell slots (`slots`/`slotsMax`, incl. pact), and class pools. A **resource tracker** renders in the
  Character panel (HP, slot pips per level, pools). Smoke-verified: Bard L1 → 2 L1 slots, spend decrements,
  HP clamps at 0.

### Note
- The engine can't know about slots spent **before** it existed — an in-progress save lazy-inits current=max
  on first load, so a mid-session character's counter resets to full once. Authoritative from then on.
- Restore-on-rest wiring + a dedicated resource verify harness are follow-ups (see `feat/resource-tracking` task scope).

Verified: wake-prep 47/47 · dm-events 21/21 · prep 22/22 · check-manifest OK (41 modules) · resource API smoke-test green.

---

## 2026-06-24 (session 6) — Chat: compact scene-head + word-by-word DM streaming + read-from-top scroll + bold + hide topbar

Playtest UX polish on the live chat surface. Branches `feat/chat-stream-compact-header` then `feat/chat-bold-hide-topbar`.

### Added
- **`**bold**` renders in DM narration** (`mdBold`, bold-only, applied over escHtml'd text). Works in the
  static feed and during streaming (re-renders each tick so bold resolves when its closing `**` arrives;
  an unclosed `**` stays literal until closed). XSS-safe — escapes first, then converts.

### Changed
- **Top breadcrumb bar hidden** (`.topbar{display:none}`, `body` padding-top 0) — Adam: useless, reclaim
  the space. `.wrap.ingame` height back to full `100vh`.

Playtest UX polish on the live chat surface. Branch `feat/chat-stream-compact-header`.

### Changed
- **Compact scene-head.** The location header ("Canal-Knot") + its container were eating vertical space —
  trimmed padding/margins and dropped the title 20→15px, clock 16→13px (roughly halved its height).
- **DM replies stream in word-by-word** (LLM-chat style). `applyResponse` sets `GS.dm.animate`; the freshest
  DM line renders as an empty `#dmStream` span carrying the text in `data-full`; `streamDMText()` types it in
  (~24ms/token) with a blinking caret.
- **Scroll lands at the TOP of a new narration, not the bottom.** Streaming scrolls the new message's top
  into view and only follows the cursor when the text runs past the fold — so long narration reads
  top→bottom instead of snapping to the end (the over-correction from session 5). Non-streaming renders
  (your own messages, reloads) still jump to the latest line.

Verified: wake-prep/stream 43/43 · dm-events 21/21 · check-manifest OK.

---

## 2026-06-23 (session 5) — Knowledge-gated panels + panel toggle + viewport-fit layout + font boost + roll-request persistence

### Fixed (roll-request persistence)
- **Roll buttons survived no longer vanish on reload.** The DM's pending `rollRequest` / `ask` lived only
  in transient `GS.dm`, so reloading mid-handshake wiped the roll button (the narration persisted, the
  button didn't). Now `applyResponse` persists them to `w.dm`; `renderWorld` rehydrates `GS.dm` from it on
  load; `sendTurn` clears it when a new turn supersedes. (Playtest-found: Insight button gone after a reload.)

### Fixed (chat ergonomics + reload resilience)
- **Enter sends** the action (Shift+Enter = newline); was Cmd/Ctrl+Enter.
- **Submitting no longer jumps the chat to the top.** The viewport-fit pass had made `.chat-col` the
  scroll container while the scroll-to-bottom still targeted `.dm-feed`; now the **feed** scrolls (head +
  input pinned) and the scroll-to-bottom lands correctly.
- **Reload resumes an in-flight turn.** `sendTurn` persists `w.dm.pendingTurnId`; on load `renderWorld`
  re-attaches `pollResponse`, so a reload mid-wait still receives the DM's reply (cleared on answer / on
  no-answer-timeout). (Playtest-found: reload → permanently stuck on "DM is considering".)
- **Process note:** never run `dev/verify-bridge.py` during a live session — it shares + `/reset`s the
  `.dm/` mailbox and deletes pending turns (memory: project-genesis-bridge-playtest-gotcha).


### Changed (font boost)
- **Type scaled ~30% game-wide** — scripted ×1.3 bump of all 168 `font-size:Npx` declarations across
  `genesis.html` + the render/creator/oracle modules (base body 16.5→21px). Font-size only; spacing,
  icons, and unitless line-heights unchanged. (Chose a scripted px bump over `zoom`, which would have
  fought the viewport-fit's `100vh` math.)


Playtest UX pass from live feedback. Branch `feat/known-gating-and-viewport-fit`.

### Added
- **Knowledge gating (DM-CHARTER slow drip).** The player's **Powers & Pressures** and **Gazetteer**
  panels now show only what the CHARACTER knows. `initKnown(w)` (render.js) idempotently seeds a `known`
  flag per faction / pressure / gazetteer entry — a fresh PC wakes knowing only where they stand and the
  faction they're tied to; everything else is hidden until learned. `explore()` flips discovered entries
  known; the `discovery` event gained `payload.reveal:{factions,pressures}` so the DM surfaces powers as
  the drip reveals them. The DM digest is unchanged — the DM always sees all.

### Changed
- **Panel toggle.** `openPanel(name)` now toggles — clicking an already-open rail item collapses it back
  to the Story view.
- **Viewport-fit layout.** The in-game view (`.wrap.ingame`) is capped at `100vh - topbar`; the chat and
  side panels scroll **internally** — no full-page scroll. (CSS-only; logic-verified headless, pixel-eyeball
  pending at playtest.)

Verified: wake-prep+gating 32/32 · dm-events 21/21 · prep 22/22 · prep-bundle 32/32 · bridge 29/29 · `check-manifest` OK.

---

## 2026-06-23 (session 4) — Waking cinematic: prep/loading screen → DM narration (kill the entry data-dump)

First live playtest over the Bridge surfaced the opening UX as the weak point: waking dropped the
player onto a raw entry-bundle **data dump** (Looming/Enemies/Friends/Complications/Things/Places)
plus a "DM is considering…" spinner, and Session-Prep never fired on a fresh world (it was wired only
to the manual "§ New session" button). Branch `feat/wake-prep-cinematic`.

### Added
- **Prep/loading cinematic** — a full-screen `#wakePrep` overlay (parchment, world-name title, pulsing
  mark + dots; `genesis.html`). `wakeIntoWorld` now raises it over the freshly-rendered world and lifts
  it (`wakeReveal`, cross-fading the chat in) **only when the DM's first words actually arrive** — not on
  a fixed 850ms timer. `GS.wakePrep` gates it; `src/world/play.js` owns `wakeShowPrep`/`wakeReveal`.
- **Auto-prep on first waking** — `wakeIntoWorld` calls `startPrep(w)` (idempotent) so a brand-new
  world's soft frontiers stage automatically; prep no longer depends on remembering the manual button.
- **`dev/verify-wake-prep.mjs`** (16 checks) — globals, overlay toggle gated on `GS.wakePrep`, auto-prep
  staging, and that `renderWorld` no longer emits the data dump.

### Changed
- **The player's opening is the DM's narration, not the data dump.** `renderWorld` no longer renders
  `renderOpening` (the entry bundle still lives in state → feeds `dmDigest`, so the DM weaves it into prose).
  `renderOpening` retained as a no-bridge reference card.
- `applyResponse` / `dmNoAnswer` / `dmBridgeDown` (`src/world/dm.js`) each call `wakeReveal()` so the
  loading screen never strands the player (success, no-DM-after-timeout, or bridge-down all lift it).

### Fixed
- **`dev/verify-dm-events.mjs` was silently broken** — its harness restubbed `STAGES`/`WORLDBEATS`/
  `GUIDE`/`LIFE_STEP`, which became real module consts (`data/creation-flow.js`), throwing a redeclare
  SyntaxError on load. Removed the stub; back to 21/21.

Verified: wake-prep 16/16 · dm-events 21/21 · prep 22/22 · bridge 29/29 · `check-manifest` OK.

---

## 2026-06-23 (session 3) — Session-Prep system, end-to-end (rollers → synthesis → prep state) + crit lens oracle + table audit

**The big one: the AI-DM Session-Prep system is built end-to-end and the game is playtestable over the
Bridge.** Also: the Critical-Magnitude lens oracle, and a full table-usage audit. ~10 `--no-ff` merges.

### Added
- **Crit-Magnitude lens oracle** — two d12 tables `Mythic Success Lenses` / `Mythic Failure Lenses`
  (`Session Mechanics/Consequences/`), each row a *vector* (kind of permanent change), AI fills content
  → fires on *any* d20 action. The magnitude die now also sets a **count** (how many lenses cascade):
  20/11–14:1 · 15–19:2–3 · 20:cascade; failure inverted. Resolves the CRIT-MAGNITUDE §4 "missing middle"
  without reworking the Myth suite. `docs/CRIT-MAGNITUDE.md` §1.1 + curve.
- **Table-usage audit** — `docs/TABLE-USAGE-AUDIT.md` (clickable catalog: every table → source → trigger)
  + `build/gen-table-usage-audit.py` (regenerable). Surfaced **89 of 248 source files Oracle-only** —
  whole unwired systems (Urban Segment walk, NPC depth, Place-Gen d100s, Quest suite) = the Session-Prep
  payload.
- **Session-Prep system** (`docs/SESSION-PREP.md`, `docs/SYNTHESIS-CONTRACT.md`) — the AI DM preps like a
  human DM; *"the story is in the dice"* (over-roll → synthesis pass). Generalizes DM-CHARTER §8.4
  (soft-until-contact) to a recurring heartbeat.
  - **Walk-rollers** (`src/engine/`): `rollUrbanWalk` (`walk.js`, ported from Obsidian Urban Procedure
    v3.1 — 16 topologies), `rollDungeonWalk` (`dungeon-walk.js`, from Dungeon Procedure v4.2 — 12
    topologies, depth-budgeted loot, Myth-Seed-affinity boss/revelation), `rollWildernessWalk`
    (`wild-walk.js`, authored fresh — linear leg journey). Each → a walk data structure (segments=nodes,
    transitions=edges). Consumes the orphaned segment/dungeon/wilderness families.
  - **Synthesis contract** — deterministic half: `quest-hook.js` (`rollQuestHook`) + `prep-bundle.js`
    (`assemblePrepBundle` fires the 3 rollers + binds a hook per env + extracts ledger context;
    `prepBundleSummary`). LLM half: two staged prompts `Engine/00. _System/AI Prompts/synthesis-{harvest,
    reskin}.md` — Stage 1 harvests the throughline latent in the pile; Stage 2 emits a roll-keyed overlay
    (role/reskin/ties/reveal-plan). Multi-environment · staged · overlay+briefing.
  - **Prep state** (`src/world/prep.js`): `startPrep` binds each prepped environment to a **soft "rumored
    frontier"** map node (soft edge = the quest hook); `applyPrep` enriches frontiers from the synthesis
    overlays + writes soft new-canon; `lockOnContact` flips soft→hard on entry (Charter §8.4); recycle +
    prep-debt. `beginSession()` fires prep every session; `⎘ Prep handoff` button; `renderHexMap` draws
    soft frontiers dashed.
- **Headless tests**: `dev/verify-walk.mjs` (2667 assertions, all 28 topologies + wilderness),
  `dev/verify-prep-bundle.mjs` (32), `dev/verify-prep.mjs` (22).

### Changed
- **Compiler — `compile-tables.py` now emits `row[5]` = structured per-row cells** (the die col dropped),
  so multi-column prep tables (segment Type|Desc|Transition; encounter Name|Roster|Tactic; NPC/Quest)
  keep their columns. The compiled `tables.json` was previously LOSSY (merged columns into one string).
  Additive — `row[0..4]` unchanged; `rollTable().cells` added. Recompiled (334 tables).
- **EVENT-CONTRACT** (`applyEvent`) gains `prep_applied` (apply synthesis overlays) and `prep_contact`
  (lock a frontier on entry).
- **DESIGN.md / NEXT-STEPS.md** decision rows + build status for crit-lens, Session-Prep, synthesis.

### Fixed
- **Frontier node id collision** — soft frontiers were keyed by slug-of-name, so two sessions rolling
  the same evocative label collided on one node id (resurrecting recycled rumors). Now unique per-session
  ids (`frontier-s{session}-{idx}`). Caught by `verify-prep.mjs`.

### Deferred
- The **LLM synthesis itself** runs over the DM Bridge at play time (qualitative). Known tune item:
  is Stage-1 harvest good enough on summaries alone?
- **Browser render of soft frontiers** unverified this session (preview server sandbox-blocked) — confirm
  visually at playtest.
- (#6) fuller **orchestrator** (plausibility-from-frontier; NPC/Place depth rollers); soft-canon ledger
  *persistence* of overlays is wired but lock/recycle get their real exercise in play.
- **Improvement candidates** flagged: the `quest-*` + NPC-hook tables (v1).

---

## 2026-06-23 (session 2) — T2 Myth tables → d100 + Urban Pressure oracle + Crit-Magnitude spec

**Table-improvement pass T2 — completes the 3-tier pass** (T1 Place Gen, T3 NPC atoms already done).

### Added
- **`myth-costs` d12→d100** and **`myth-becomes-geography` d10→d100** — rebuilt from thin 10–12-row
  tables to full Commitment ladders (66/20/9/4/1, every row unique). What a legend demands/attracts/
  inflicts; how a myth scars the land. Originals → `Mythic Events/zz_Archive/`.
- **`urban-pressure`** — NEW d100 Commitment oracle (`Session Mechanics/Pressure/`): single-roll
  citywide ambient pressure for slow urban play, distinct from the `Urban Encounter v2.5` node
  generator. Fills the slot freed by the (session 1) `urban-encounters → tavern-encounters` rename,
  under a distinct `urban-pressure` id.
- **`docs/CRIT-MAGNITUDE.md`** — full spec of the Critical-Magnitude system (formalizes the
  `SPICE-CURVE` §3 one-liner from Adam's design call): nat 20 / nat 1 → a second d20 scaling
  Standard → Amplified → Mythic (= Local → Regional → Planar/Cosmic). 20/20 = permanent boon written
  to the Ledger as canon (the Light-of-Lathander shrine); 1/1 = mirror failure (dark + permanent at
  high stakes). Locks the **generic-engine vs situational-Myth-payload** seam.
- ~300 new table rows. All three tables content-only, **deliberately NOT wired** (rollable via the
  Oracle tab); wiring waits on the generic mythic-outcome oracle (CRIT-MAGNITUDE §4).

### Changed
- **`DESIGN.md`** — three decision rows under a new 2026-06-23 Crit-Magnitude section.
  **`DM-CHARTER.md`** §6 — new item 6 (critical magnitude, player-rolled second d20).
  **`SPICE-CURVE.md`** §3 — pointer to the new spec.
- Recompiled `tables.json` / `tables.js` → **332 tables**, 0 real bugs.

### Fixed
- Self-review near-dup: `myth-costs` "Demanded Repeat" (14) overlapped "Demanded Verdict" (64) on the
  "judge" example → reworded row 14.

### Deferred
- The **generic context-tagged mythic-outcome oracle** (combat / social / exploration / place-deed) —
  the missing middle that routes a 20/20 or 1/1 to the Myth suite. Specced in CRIT-MAGNITUDE §4; the
  next clean-session task.
- Two band-placement judgment calls from review left as Strange (`myth-costs` 95 "Slowing Subject",
  `myth-becomes-geography` 89 "Returning Path").
- Wiring all three new tables into live play.

---

## 2026-06-23 — NPC atoms → d300 + tavern rename + Place Gen fixes

### Added
- **Four d300 NPC tables** (Commitment, spice 198/60/27/12/3), replacing the DMG/2e `NPC Hook Megatable`:
  `npc-immediate-motivation`, `npc-bonds`, `npc-flaws-secrets`, `npc-job-board` — the highest-churn
  (per-NPC) hot path in the engine, now its deepest. Built via Workflow `npc-atoms-flesh-out` (36 agents:
  overgenerate by band + disjoint thematic lane → dedup/trim to exact counts in code; generators on
  Sonnet/low). 1,200 new rows.

### Changed
- **`urban-encounters` → `tavern-encounters`** — the d12+d8 table was always a tavern/interior table,
  not the citywide tool (that's `Urban Encounter v2.5`). The freed `urban-encounters` id is reserved for
  a future citywide random-pressure oracle.
- **`npc-bond` → `pc-bond`, `npc-flaws` → `pc-flaws`** — these were first-person *player* tables mislabeled
  with an `npc-` prefix; renamed (domain `Character Genesis / PC Traits`) and ids de-collided from the new
  `npc-bonds`.
- **Place Traits row 20** rebuilt to a distinct lighthouse/salvage trait (was a near-dupe of row 67).
- **Place-Secret rows 1–20** concretized from abstract category stubs to specific situations (match rows 21+).
- Recompiled `tables.json` / `tables.js` → **331 tables**; `check-manifest` OK.

### Fixed
- **Quick NPC Generator 2.0** had been feeding NPCs the first-person *player* flaw table (latent bug) →
  repointed to `npc-flaws-secrets` + `npc-bonds`. `NPC Honesty` prose cross-links repointed too.

### Deferred
- T2 Myth content (`Myth Costs`, `Myth Becomes Geography`); the new citywide urban-pressure table;
  wiring `npc-immediate-motivation` / `npc-job-board` into encounter-time flow.

### Retired
- `NPC Hook Megatable`, `NPC Secret` → `zz_Archive/` (superseded).

---

## 2026-06-22 — Place Gen table pass + Hometown bardo wiring

### Place Generation — full d100/d200 rebuild (9 tables, via workflow)

All Place Generation tables rebuilt from range-batched or thin rows to full spice-graded d100s
(one row per number, Spice Curve dist 66/20/9/4/1), with one table expanded to d200. Workflow
pattern established: parallel agents per table + validation agent.

- **Master Setting, Place History, Place Mythology, Place Nearby, Place Race Relations,
  Place Relevancy, Place Ruler Status** — all now full d100 Commitment tables. Pre-spice
  originals archived to `Engine/…/Place Generation/zz_Archive/`.
- **Place Traits** — expanded from d20 (2-col, no Band) to d100 (4-col `| d100 | Band | Trait | Calamity |`).
  Calamity grows directly from its Trait (cause-and-effect). `table_class: Fork → Commitment`.
- **Place-Secret** — expanded from d20 to **d200** (first d200 table; `amax=200` in frontmatter,
  auto-derived by compile script). ~32% monster tie-ins (dragons, aboleths, fae, vampires, liches,
  hags, mind flayers, beholders, etc.). 4-col format `| d200 | Band | Hidden Mistake | Description |`.
- **Place Ruler Status row 93** (Strange): a dragon took the seat on a legal technicality three
  centuries ago; governance has been fair, the taxes are reasonable, and the Weavers' Guild petition
  from 287 years ago is still under review.
- `tables.json` / `tables.js` recompiled — 332 clean tables, 0 real bugs. d200 auto-derived.

### Hometown Bardo Wiring — 3 new beats in the creator flow

Three Track-B table rolls (place-master-setting → place-history → place-mythology) added after
Life and before the 9 world-genesis beats. Branch `feat/hometown-bardo`.

- **`data/creation-flow.js`** — 3 new GUIDE entries (`ht_setting`, `ht_history`, `ht_myth`).
- **`src/creator/bardo.js`** — `buildBardoSeq()` + `bardoSpine()` extended; 3 new functions
  (`bardoRollHometown`, `bardoHometownReroll`, `htMarkdown`); `bardoLog()` surfaces Hometown /
  Founded / Town Myth rows; `renderBardo()` now handles `{t:"hometown"}` with die + fragment +
  reroll (costs one shared reroll charge).
- **`src/world/play.js`** — `bindWorld()` seeds `world.seed.hometown` and writes a canon Ledger
  entry stripping markdown bold for storage.
- **`manifest.json`** — new owns + `rollTable` as call-time dep registered; `check-manifest OK`.

### Deferred
- Adam to **review all Place Gen tables** next session before compiling NPC/T2/T3 tables.
- T2 tables (Urban Encounters, Myth Costs, Myth Becomes Geography) — after the review pass.
- NPC atom tables (Demeanor, Mood, Under Pressure, etc.) — T3 pass pending.

---

## 2026-06-22 — The DM Charter (v1) — the flagship DM's operating contract

The DM-side behavior rules were scattered (Fragment veil, three-options, over-reveal discipline,
threat-signaling, agency). Consolidated into one constitution, authored from Adam's design
questionnaire this session. Branch `feat/dm-charter`. **Spec only — no app code touched.**

### Added
- **`docs/DM-CHARTER.md`** — the DM behavior spec behind the system prompt (Bridge + shipped DM).
  12 sections: the narrator (the **single voice across all lives** — bardo guide = waking DM),
  voice & prose, agency & handoff, **the slow drip**, danger/death/fairness, dice & mechanics
  surfacing, NPCs & the world's will, secrets/canon/pre-generated depth, tone & content, pacing
  & session management, integration, and open/flagged items.
- **3 draft tables (flagged for the table-improvement pass, NOT yet compiled):**
  - `Engine/…/Sentient NPCs/NPC Honesty.md` — a **2d10 bell-curve** disposition, *cannot-lie ↔
    cannot-tell-truth*, role-shifted; gated by motive (Secret/Fear/Leverage) × trust.
  - `Engine/…/Sentient NPCs/NPC Trust Lever.md` — d20, *what wins this NPC's trust* (the way in).
  - `Engine/…/Starting State/Starting State - World Depth.md` — deep secrets + over-the-horizon
    threats, pre-rolled at founding, **soft until contact → locked to canon on contact** (the
    foreshadowing fuel).

### Changed
- **`DESIGN.md`** — new dated section *Locked decisions (2026-06-22 — the DM Charter)*: 10 decision
  rows (single narrator voice, persona, prose, the slow drip, danger, dice surfacing, NPCs, secrets
  & canon, tone & content, pacing). The **single-voice** lock supersedes `NEW-GAME-FLOW`'s
  bardo/waking split at the level of *voice* (script still owns the bardo machinery).
- **`NEXT-STEPS.md`** — DM Charter track flipped ☐→☑ v1 specced; build follow-ups enumerated.

### Deferred
- **Recon, not rebuilt:** Secret/Fear/Leverage already exist (`_NPC Generation Raw` + template);
  the **hidden-`analog`** fiction-modeling pattern already exists in `_NPC Quick All-Stars` (100
  NPCs tagged Han Solo / Miranda Priestly / John Wick…). Formalize the field, don't reinvent it.
- **Not wired (specced in §12):** In-Media-Res escalation system (model: the *Low Tide* d20);
  pre-gen World Depth at founding; honesty/trust/`analog` onto the NPC generator + DM digest;
  a testable persona prompt over the Bridge; tutorial DM.
- Tables deliberately **uncompiled** — they're v1 drafts; recompile `tables.json` with the
  improvement pass, not before (avoids pulling half-baked rows into the artifact).

---

## 2026-06-22 — UI polish: gold corner filigree (the reskin's "approximated corners" gap)

- Extracted a real corner filigree from the decor sheets → `assets/borders/corner-{tl,tr,bl,br}.png`
  (4 oriented from one isolated piece). A reusable `.filigree` CSS class draws all four via a
  click-through `::after`; applied to the **bardo passage modal** now (bounded, clearly-framed surface).
  Graceful: a missing image just shows nothing.
- **Hex tiles prepped, not wired:** the `hex-tile-art` sheet (20 terrain hexes) was sliced + biome-mapped
  to `…/assets-iso/extracted/hexes/` (git-ignored). Deliberately **not** swapped into `renderHexMap` —
  photo tiles fight the deliberate *fraying-edge* aesthetic at the 460px minimap size; they belong in a
  future larger/zoomed map view. (Verify-blind constraint: preview sandbox couldn't run, so visual
  surfaces need an eyeball on refresh.)

---

## 2026-06-21 — Death & Rebirth, build step 6: the connected plane (loop complete)

The final step. All worlds are now **regions of one shared plane**, and a successor wakes far from
where the last soul fell. With this, the whole Death & Rebirth loop (steps 1–7) is built.

### Added (in `src/world/state.js`)
- **`regionRingPos`/`placeRegion`/`regionDistance`/`farthestRegion`** — each world carries a coarse
  `region {q,r}` coordinate spiralling outward from the plane centre; `bindWorld` places each new
  region; distance reuses `hexDist`.
- **`spawnSuccessorOnPlane`** (`fate.js`) — on death the successor wakes in the region **most distant**
  from where they fell (or stays if the plane has only one region so far). `closeBardo` now routes here.
- Shelf reframed as **"Regions of the plane"** with per-card distance hints (`render.js`).

### Changed
- **Migration is ADDITIVE** (supersedes the spec's "bank-and-restart"): `migrateAll` tags any
  region-less world with a position and sets a `U.plane={version:3}` marker — **nothing is reset,
  merged, or banked**; the `v2` storage key is kept. Chosen during build as the safe path that
  preserves all existing saves (`DESIGN.md` row updated).
- **`dev/verify-plane.mjs`** (14) — spiral distinctness, distance, farthest-region, additive
  migration, placement, successor-to-distant-region, single-region fallback. `check-manifest` clean
  (33 modules, 6 known warnings).

### Notes (emergent, intended)
- The bardo gap advances the death region's clock by up to 49 days, so **short-decay corpses
  (den/travelled) are usually gone** by the time anyone can return — only sealed/wild bodies keep
  their loot through the bardo. Thematic; kept.
- **Death & Rebirth steps 1–7 are all done — the loop is complete.** Remaining are polish: a region-map
  SVG + coarse region-to-region travel, authored vision/affinity tables, and wiring the icon assets.

---

## 2026-06-21 — Death & Rebirth, build step 5: corpse & loot decay

A fallen character's body and effects now linger in the world — and rot, or get carried off, on a
clock. Reach the body in time and the loot is yours.

### Added (in `src/world/rebirth.js`, now layer 2)
- **`killCharacter`** mints **`c.corpse`** — the carried items + gold and a rolled environmental
  **`context`** (`CORPSE_CONTEXTS`: sealed 120d / wild 30d / travelled 7d / den 2d) — and writes it
  to canon at the fall site.
- **`corpseStatus(w,c)`** decays **fresh → disturbed → gone** by elapsed *in-world* days (off
  `c.fellWhen`) vs the context's window; **`corpsesAt(w,node)`** surfaces still-recoverable bodies;
  **`claimCorpse(w,c,taker)`** transfers the haul to a living PC and marks it looted.
- **`recoverFallen`** (`fate.js`) + a **"⚰ Recover … effects"** button on the character panel,
  shown only when a living PC stands where a recoverable body lies.

### Changed
- `world.rebirth` reclassified **layer 4 → 2** (it only depends on L1/L2), so `render` can query
  `corpsesAt` with no layer inversion. `dev/verify-saga.mjs` → 45 assertions (corpse decay/claim);
  `dev/verify-rebirth-flow.mjs` → 19 (corpse at death + recovery through the real graph).
  `check-manifest` clean (33 modules, only the 6 pre-existing warnings).

### Notes
- Draft `CORPSE_CONTEXTS` (rolled); could later read the place / nearby pressures instead.
- **Death & Rebirth steps 1–5 + 7 are done — the loop is fully playable within the per-world model.**
  Only step 6 (connected plane / Universe v3) remains, for cross-region successor spawning.

---

## 2026-06-21 — Death & Rebirth, build step 4: faction proximity at creation

A character is now born near a local power — and a successor can be born inside a rival of the dead
PC's allies.

### Added
- **`rollFactionProximity(w,c)` + `factionKind(f)`** (`src/engine/world-gen.js`, called from `rollEntry`):
  rolls the relationship (**tie 55% > member 25% > none 20%**) and, if any, picks WHICH faction
  **weighted by the class's archetype** (`CLASS_FACTION_AFFINITY` × the faction's `factionKind`, read
  from its Method) — any class can still land near any power. Records `c.entry.proximity`, adds the
  faction to the opening bundle as a Friend, and writes a `canon`/`proximity` ledger entry.
- **`METHOD_KIND` + `CLASS_FACTION_AFFINITY`** data (`data/srd-creator.js`) — draft affinity vocabulary.
- **`dev/verify-proximity.mjs`** — 12 assertions: kind classification, class-weighted choice
  (Cleric → divine >50%), the tie>member>none distribution, and `rollEntry` integration + ledger.

### Changed
- Registered the new symbols (manifest owns/callTimeDeps). `check-manifest` clean (33 modules).

---

## 2026-06-21 — Death & Rebirth, build step 7: the bardo passage (death loop now playable)

The engine pieces (steps 1–3) are now wired into an actual death. Killing a character runs the whole
bardo and shows it; the loop plays end-to-end.

### Changed
- **`src/world/fate.js` REWORKED** — the d20 "spawn back into the same adventure" is **retired**.
  - `killCharacter` stamps **`c.fellWhen`** (the in-world clock, not `Date.now()`) and writes the
    fall to the ledger as `canon`/`death`.
  - `openBardo` runs **`runBardo`** (gap drift + 14 visions), then `renderBardoPassage` reveals the
    days passed + the 7 peaceful / 7 wrathful vision **Fragments** (player sees fragments only).
  - `closeBardo` rolls a **brand-new successor** (no inherited quests).
- **`genesis.html`** — repurposed `#fateModal` → `#bardoModal` (a scrollable passage), added bardo/
  vision CSS, removed the now-dead `FATE_THRESHOLD` const.

### Added
- **`dev/verify-rebirth-flow.mjs`** — 14 assertions, full-app jsdom: reworked fns present + legacy
  spawn-back gone, in-world `fellWhen`, death canon, visions dreamt, clock advanced, passage rendered,
  close → successor.

### Notes
- `check-manifest` clean (33 modules). The successor still spawns **in the same world** until the
  connected plane (step 6) lands — the only remaining gap to the full cross-region loop.
- Remaining Death & Rebirth steps: **4** (faction proximity at creation), **5** (corpse/loot decay),
  **6** (Universe v3). Steps 1–3 + 7 done.

---

## 2026-06-21 — Death & Rebirth, build step 3: the 14 vision-rolls

The Chönyi Bardo. While the hero is between lives, the world dreams its direction around the seven
things that mattered to them — and the next soul wakes to faint Fragments of it.

### Added (in `src/world/rebirth.js`)
- **`bardoVisions(w,c)`** — 7 peaceful + 7 wrathful visions over the dead PC's Saga (padded to 7
  from the faction web / gazetteer if the life was short); peaceful days precede wrathful.
- **`rollVision`** — each vision ~50% comes to pass. A fired vision **mutates an existing structure**
  via **`applyVision`** (faction agenda clock ±1, NPC/enemy gazetteer `fate` = risen/fallen, place
  `fate` = prospered/ruined; threads recorded), writes the **DM-side truth** to the ledger as a
  `drift`/`bardo-vision` entry, and surfaces only a **6–10 word Fragment** to the player.
- **`runBardo(w,c)`** — the orchestrator: refreshSaga → bardoGap (time + drift) → bardoVisions,
  storing the result on `c.visions` for the successor's passage.
- **`VISION_OUTCOMES` / `VISION_QUIET`** — draft peaceful/wrathful flavor (per Adam's call: mechanical
  effects + draft flavor now, an authored spice-graded vision table later).

### Changed
- `dev/verify-saga.mjs` now 34 assertions (14-vision count, peaceful-before-wrathful ordering,
  fragment-vs-truth split, ledger writes, faction-clock ± mutation, place-ruin, unfired-no-op,
  runBardo orchestration). `check-manifest` clean (33 modules); full-app jsdom boot runs the whole
  bardo through the real `rollStartingState` (31-day gap, 14 visions, 9 fired, Saga 7).

### Notes
- Not yet surfaced in UI — `c.visions` holds the Fragments; build step 7 (`fate.js` rework) routes
  deaths into `runBardo` and renders the passage.

---

## 2026-06-21 — Death & Rebirth, build step 2: the bardo gap + drift

The time between lives. When a hero dies, the world now moves on before the next soul enters.

### Added
- **`src/world/rebirth.js`** — the new death-flow module (visions + corpse will grow here).
  `rollBardoGap()` rolls a **0–49 in-world-day** triangular bell (mode ~3–4 weeks, rare instant/full
  tails — Tibetan *Bardo Thodol*'s 7×7). `bardoGap(w,[days])` advances the world clock by the gap and
  **turns the faction web once per elapsed week** via the existing `ssFactionTurn`, writing a `bardo`
  transition to the ledger — so a successor wakes into a genuinely later, drifted world.
- `dev/verify-saga.mjs` extended (now 20 assertions) — gap range/mean, explicit-day application,
  clock advance, one-turn-per-week, the `bardo` ledger entry, and the 0-day instant exit.

### Changed
- Registered `world.rebirth` (manifest + `<script>` + `check-manifest.py` LAYER L4). `check-manifest`
  clean — **33 modules**; full-app jsdom boot runs `bardoGap` through the real `rollStartingState` /
  `ssFactionTurn` (day 3→17, 2 turns, ledger writes).

### Notes
- Not yet wired into the death UI — `bardoGap` is the mechanic; build step 7 (`fate.js` rework) routes
  actual deaths through it, and step 3 layers the 14 vision-rolls on top of the gap.

---

## 2026-06-21 — Death & Rebirth, build step 1: Saga tracking

First code for the death loop. A character's **Saga** — their most significant entities — is now
derived from world state, ready for the bardo vision-rolls (step 3) to act on.

### Added
- **`src/world/saga.js`** (`computeSaga`/`refreshSaga`/`sagaKey`/`SAGA_MAX`) — ranks a character's
  top-7 entities (enemies / NPCs / factions / places / threads) from the ledger + gazetteer + faction
  web by **stake × frequency × recency**. A PC's own life-NPCs and the faction they stand against out-
  rank world-generic entries; `fellWhere` joins as a high-stake place once dead. Pure read; deterministic.
- **`dev/verify-saga.mjs`** — 12 logic assertions (vm-loaded, no DOM): capping, enemy/thread/faction
  capture, personal-out-ranks-stranger, standing-faction in top 3, persistence, determinism.

### Changed
- `cgBind` seeds `c.saga` at birth; `beginSession` refreshes each living PC's Saga.
- Registered `world.saga` (manifest + `<script>` in load order + `check-manifest.py` LAYER L2).
  `check-manifest` clean — **32 modules**; full-app jsdom boot loads the new module in order and runs
  `refreshSaga` through the real graph.

---

## 2026-06-21 — Death & Rebirth design lock (spec only, no code)

A design session locking the **persistent-sandbox death loop**. No code changed — captured as a new
`system-spec` so the next session builds from a blueprint.

### Added
- **`docs/DEATH-AND-REBIRTH.md`** — the full spec: death-is-expected posture, the **49-day bardo gap**
  (0–49 in-world-day bell roll) that drifts the world via `ssFactionTurn`, the **14 peaceful/wrathful
  vision-rolls** against the dead PC's **Saga** (their 7 most significant ledger entities) surfaced to
  the player as Fragments, optional chosen-one reincarnation memory, **class-weighted faction proximity**
  at creation, **corpse/loot decay** by clock+context, DM-driven companion rescue, and the
  **connected plane (Universe v3)** successor model. Includes a 7-step build order.

### Changed
- **`DESIGN.md`** — new "Locked decisions (2026-06-21, session 2 — death & rebirth)" section (12 rows),
  incl. **XP threshold curve = SRD 5.2.1 exactly** (resolves the `ADVANCEMENT.md` open question — slow
  climb is intended given death-expected play).
- **`ADVANCEMENT.md`** — threshold-curve open question marked RESOLVED (SRD-exact).
- **`NEXT-STEPS.md`** — new Death & Rebirth track with build order; XP-curve step flipped from a design
  call to a mechanical "author the SRD table" task.
- **`docs/README.md`** — indexed the new spec.

### Notes / reconciliation flagged for the build
- `src/world/fate.js`'s d20≥11 "spawn back into the same adventure" is **superseded** — death will route
  through the bardo to full new creation; the modal/FX get repurposed. `fellAt` must become an in-world
  clock stamp (currently `Date.now()`).
- The existing faction generator (`Starting State - Factions.md` + `rollStartingState`/`ssFactionTurn`)
  is **sufficient** — no new faction generator needed; the gap is the class-weighted proximity roll at
  creation.

---

## 2026-06-21 — Ivalice UI reskin — parchment-on-stone, light & luxurious

Reskinned the whole interface to the **Final Fantasy Tactics: The Ivalice Chronicles** look from
Adam's ChatGPT concept sketches + texture atlas (`ui-sketches/ivalice-style/`). The app is now
**light**: warm parchment pages with real paper grain floating on a dark textured stone ground;
**Cinzel** (engraved gold display caps) + **EB Garamond** (sepia body); a fixed top breadcrumb bar
(compass gem · gold small-caps crumbs, current in steel-blue); gold double-borders, parchment pill
buttons, and a steel-blue accent for active/links/sigils. Built across all five concept surfaces +
the shelf, verified each in-browser.

### Added / Changed
- **Design tokens** remapped to a parchment/stone/gold/steel palette (legacy `--vellum*` aliased so
  existing panels flipped to cream automatically). Google Fonts (Cinzel + EB Garamond) with serif
  fallback. `#wakeFade` and contrast cleanup of leftover dark-theme hardcodes (e.g. selected cards).
- **Textures:** sliced Adam's atlas into `assets/textures/parchment.jpg` (panel grain), `stone.jpg`
  (ground), `compass.png` (motif); wired parchment under the cream gradient on every page and stone
  under the warm radial on the body.
- **Surfaces:** start screen (concept #1) · soul-forging card grid + "So far" inset (#2) · chat-first
  play view — icon rail, slate scene-pill, sigil-gutter chronicle, parchment choice pills, fused
  input (#3) · character panel — portrait, ability boxes, HP/AC badges, skills/inventory columns (#4)
  · world-genesis engraved omen die (#5) · universe shelf cards · top nav rail.
- `render.js` markup updated (scene pill, message sigils, character panel, start page); `chrome.js`
  breadcrumb wired to `showTab`.

### Notes
- Fonts load from Google Fonts (online); they degrade to system serif offline — bundle the woff2
  locally later for true offline. Corner *filigree* is approximated (clean gold double-borders) —
  real SVG flourishes are a future polish. check-manifest clean (31 modules); 21/21 render + 29/29
  bridge tests still pass.

---

## 2026-06-21 — Live playtest pass — creator UX + DM-bridge robustness

Fixes from Adam's first live DM-bridge playtest:
- **Creator:** spell/cantrip cards now show the **full** text in a viewport-clamped tooltip (truncated native tooltip retired; `gen-spells-slim.py` emits full `text`); skill/equipment/spell/choice blocks are a responsive **grid** of title+description cards; **"Begin" lands straight on the first choice** (removed the redundant threshold/soul gates); the running creation list moved to a right-hand **"So far"** column with the "This Is Your Life" rolls **itemized**; **inline dice in life events roll at roll-time and bank gold** into starting gp (`cgMakeEvent` / `cgResolveInlineDice`); the "Wanderer (roll again)" NPC sub-roll resolves.
- **DM bridge:** the app waits up to **5 min** for a live DM instead of hanging on "considering" (and posts a clear message if no DM is watching); the bridge **re-creates its mailbox dir before any write** (a deleted `.dm/` no longer 500s POSTs — the "unreachable" bug); the auto-opening turn is **`hidden`** so its meta-prompt doesn't show in chat; runbook says to run the DM on **Sonnet**.

---

## 2026-06-21 — Chat-first World view + the waking transition (NEW-GAME-FLOW §9, the substantive part)

Built the locked-but-unbuilt chat-first interface from `NEW-GAME-FLOW.md` §9 — the World view is no longer a long scroll of sections; it's the **DM conversation, centered**, with the world's panels in a **left icon rail** that **slide in beside the chat** (Disco Elysium-style). Plus the **waking cinematic**: the bardo fades to black and dissolves into the DM's opening words. From live character-creation playtest feedback (items 5 + 6). `check-manifest` clean (31 modules). Verified in-browser (Chrome): rail, column-slide, all panels, no console errors.

### Added / Changed
- **`src/world/render.js`** — `renderWorld` rewritten into the chat-first shell: a scene header (place + diegetic clock), the chat column (opening → DM feed → a collapsed "⚙ World & transitions" disclosure holding the explore/time controls), and a slide-in `.panel-col`. New helpers: `gameRail` (the 6 granular icons — **Story · Character · Map · Ledger · Gazetteer · Powers**, each gated by the Curve of Revelation, + Universe/Oracle), `worldActions`, `gamePanelContent`, `gazPanel`, `renderCharacterPanel` (the full sheet as a panel), `openPanel` (the rail router).
- **`src/world/play.js`** — `wakeIntoWorld()` (the §9 fade: black → land in Story → fade up) + `autoOpenScene()` (if the DM bridge is live, auto-fires the opening turn so the player wakes into the DM's words; silent no-op otherwise — the rolled opening stands in). `enterWorld` resets the open panel.
- **`src/creator/sheet.js`** — `cgBind` now finishes through `wakeIntoWorld()` instead of a bare render+toast. **`src/creator/bardo.js`** — `bardoFound` raises the fade before assembling world+soul (no flash).
- **`src/ui/chrome.js`** — `showTab('world')` toggles `.wrap.ingame` (hides the top-level nav rail; the in-world rail replaces it). **`src/state.js`** — `GS.gamePanel` + `GS.waking`.
- **CSS + `#wakeFade` overlay** in `genesis.html`; responsive (rail → top strip, panes stack under 760px).

### Notes
- The waking auto-opening uses the DM Bridge; with the bridge down it degrades gracefully to the rolled opening bundle.
- Old characters' stored headlines may still show raw dice (e.g. "(+2d6 gp)") — that's pre-fix data; new souls resolve it (see the creator-fixes entry).

---

## 2026-06-21 — DM Bridge v1 — the AI-DM integration harness (closes the play loop)

Built the dev integration harness from `DM-BRIDGE.md`: the app and an AI DM (Claude Code, subscription-backed → no metered tokens) now run together over a tiny local bridge, replacing the clipboard back-and-forth. The DM returns narration + **typed `EVENT-CONTRACT` events**; the app applies them through its **own existing mutators** (the script stays the sole state owner — anti-drift). All five build-order steps shipped. `check-manifest` clean (**31 modules**, only the 7 known layer-inversion warns).

### Added
- **`dev/dm-bridge.py`** — the bridge: a dumb mailbox + static server (stdlib only, replaces `python3 -m http.server`). Holds `.dm/turn-*.json` / `response-*.json` / `state.json`; routes `POST /turn`, `GET /response?turnId` (204 pending / 200 ready), `POST/GET /state`, `POST /reset`, plus `GET /dm/turns` (pending list for the loop) and `/dm/health`. **No game logic** — the mutators are never forked. Serves everything `Cache-Control: no-store` so a stale cached module never silently breaks the app mid-dev (the ~30 classic `<script>` files mean one stale `state.js`/`render.js` makes a tab look dead — this kills that trap without per-edit version strings).
- **`src/world/dm.js`** (`world.dm`, layer 4) — the bridge client (`dmDigest` = the structured JSON twin of `handToDM`; `sendTurn` / `pollResponse` / `applyResponse` / `postState`; `dmSend` / `dmRollFor` for the player actions + roll handshake) **and `applyEvent(w,e)`** — the EVENT-CONTRACT runtime: a `switch` on every event type dispatching to the real mutators (`addLedger` / `addNode` / faction+front clocks). Unknown types `console.warn` + no-op (forward-compatible). **Reused by `ADVANCEMENT`/`DIFFICULTY` later.**
- **`src/world/render.js`** — `renderDMFeed(w)` + `escHtml`: the **"The DM"** section in the World view — a scrolling chronicle, the "considering…" indicator, the roll-handshake button, the three-options `ask`, and the action box. Shown once a soul is in play.
- **`src/world/state.js`** — `dmLogOf` / `pushDmLog` (the persisted narration feed, on `w.dmlog`). **`src/state.js`** — `GS.dm` transient.
- **`dev/fixtures/`** — 4 turn/response pairs (social / travel / combat / combat-resolve) covering `fact_canonized` + `clock_advanced` + `ask`, `discovery` (mints a node) + front clock, the roll handshake (`rollRequest`, no events), and `encounter_resolved` + `kill` + `adjudication`. They double as the test corpus.
- **CSS** for the feed; `.dm/` git-ignored.

### Verified
- **`dev/verify-bridge.py` — 28/28**: transport + contract (POST /turn echoes id, /response 204→200, static serve, /state round-trip, every fixture's `events[]` conform to the envelope, DM responses carry no `rolls[]`). Dependency-free.
- **`dev/verify-dm-events.mjs` — 21/21** (jsdom, full-app load — every module in real document order): `applyEvent` through the real mutators (clocks advance by exact delta, `discovery` mints a node, `adjudication` writes a canon precedent, unknown types no-op), `dmDigest()` reflects post-event state, **and** the DM-feed render (`renderDMFeed`/`renderWorld` produce the "The DM" panel + action box + roll-handshake button). Doubles as the boot smoke-test — all DM-bridge globals present after the full load, no throw.

### Deferred (v1 gaps, by design)
- **No time-advance event** — the in-world clock still moves only via the existing transition controls (Travel / Rest / Montage). A DM that narrates travel reminds the player to take the transition.
- **Declared events only** — the `detected`-from-state-delta migration stays `EVENT-CONTRACT.md`'s job. `clockId` is fuzzy-matched to a faction (name slug) / front (danger slug) until stable clock ids land with the detected work. XP/leveling consequences are recorded to the ledger but not computed (that's `ADVANCEMENT.md`).

---

## 2026-06-21 — `CLASS_PROGRESSION` data (levels 1–20) — the leveling spine's first build step

Built the load-bearing data task from the advancement spec family (`ADVANCEMENT.md` step 1): structured levels-1–20 advancement for all 12 base classes. Until now only level 1 was wired (`data/srd-creator.js`); this is the data real leveling and richer DM lookups stand on. First Claude Code session. Commit `f9e5601`.

### Added
- **`data/class-progression.js`** (generated, ~144 KB) → `const CLASS_PROGRESSION`, 12 classes × levels 1–20, 254 feature entries. Per level: `pb`, `features[]` (`{name, text}` with **full SRD feature text embedded** — the chosen depth), and for casters `cantrips` / `prepared` / `slots[]` (full+half) or `pactSlots`/`pactSlotLevel`/`invocationsKnown` (Warlock pact); Wizard also carries `spellbook` (6 +2/level, distinct from `prepared`). Class resource scalers where canonical: Barbarian rage uses + damage, Bard inspiration die, Fighter action surge + indomitable, Monk martial-arts die + focus points + unarmored movement, Rogue sneak-attack dice, Sorcerer sorcery points.
- **`build/gen-class-progression.py`** — the generator. **Parse-then-validate**: the SRD's per-level numeric grids survived OCR as space-separated rows (em-dash = empty), so it parses the real `classes.md` grids for 7/8 casters, then **asserts the parsed spell-slot columns equal authored canonical matrices** (full / half / pact) — OCR corruption fails the build loudly. Feature names + prose parse from the clean `### Level N:` headings. Ranger's grid is the one too OCR-scrambled to parse, so it's authored from the Paladin-validated half-caster canon (the substitution is the validation).

### Changed
- **`manifest.json` + `genesis.html`** — registered `data.class-progression` (owns `CLASS_PROGRESSION`, layer 0) in `loadOrder`, the module list, and the `<script>` tags; added to `check-manifest.py`'s LAYER map. `check-manifest` clean: **30 modules, 215 owned symbols** (only the 6 known, documented layer-inversion warnings).

### Verified
- **Headless jsdom harness, 797/797 green** — loads the real `genesis.html` (all modules in document order), then asserts: 12×20 coverage, PB per level, ASI at 4/8/12/16 (Fighter +6/14), subclass-feature levels, caster classification, spell-slot anchors (full/half/pact), cantrip growth, resource scalers, embedded-text presence + no grid leakage, and **L1 reconciliation with `srd-creator.js` `CLASS_CASTING`** (creator cantrip/prepared counts match the progression's L1; the reconciliation surfaced + correctly models Wizard's spellbook-vs-prepared split).

### Notes / deferred
- **Recurring features handled as canonical constants, not parsed** — the SRD prints each feature's prose once (first appearance) and the summary table (which repeats ASI/Expertise/etc.) is too OCR-corrupted to parse (Fighter's lost its level column entirely). So ASI (4/8/12/16, +Fighter 6/14), the few class repeats (Bard/Rogue Expertise, Sorcerer Metamagic, Warlock higher Mystic Arcana), and Wizard's absent-from-source subclass levels (6/10/14) are injected from 2024 canon and asserted by the harness.
- **Out of scope (by design):** subclass feature *content* (only base classes are wired; generic "Subclass feature" markers stand in), the XP-to-level **threshold curve** (still its own decision per `ADVANCEMENT.md` — make before leveling is wired), and any UI / level-up plumbing (data + tests only).

---

## 2026-06-21 — Version control: git repo + `CLAUDE.md` (Claude Code readiness)

Put Genesis under version control and laid down a cross-surface operating contract, so future code work can flow through either Cowork or Claude Code with a safety net.

### Added
- **`Obsidian Files/Genesis/` is now a local git repo.** First commit `6428d47` captures the modular-v0.3 state (924 files, ~9M); `d7f4f76` adds the table artifacts (below). No remote yet — add a GitHub remote later (needs a token; local commits need none → keep it **private**, the ignored PDFs aside).
- **`.gitignore`** — ignores the scanned rulebook **PDFs** (~705M, copyrighted, never push), `node_modules/`, `.DS_Store`, and `Archive/` (pre-git manual backups — git history replaces them). Everything else is tracked.
- **Repo `CLAUDE.md`** (root) — the cross-surface contract both Claude Code *and* the Cowork `genesis` skill read: run command, the classic-script/manifest/`GS` architecture, the command table (check-manifest / compile-tables / gen-spells-slim / jsdom), the non-negotiable disciplines, the `docs/` map, and gotchas. Points at `docs/`, doesn't duplicate.

### Changed
- **`tables.json` / `tables.js` are tracked** (reversed an initial ignore). Rationale: a fresh checkout should always run (the Oracle tab needs `tables.js`) and compile output stays diff-able/bisectable. Still generated — never hand-edit; regenerate with `compile-tables.py --emit`.

---

## 2026-06-21 (docs) — Docs → `docs/`, and the combat/XP/advancement spec family

Reorganized the doc tree and laid down the design specs for the engine's "meat and potatoes": combat, XP, leveling, and the DM↔script event contract.

### Changed
- **All design docs moved to `docs/`.** The thirteen narrative/design/spec/operational docs left the repo root; only `README.md` (front door) and `table-registry.md` (build artifact) stay at root. References fixed everywhere: `README.md`, and the comment/`desc` pointers in `genesis.html`, `src/world/state.js`, `src/state.js`, `src/engine/hexmap.js`, `build/check-manifest.py`, `manifest.json` (all `X.md` → `docs/X.md`). No `[](file.md)` links existed, so sibling cross-references stayed valid. Build green after (`check-manifest` OK, manifest still valid JSON). **The `genesis` skill references several docs by name — it's a read-only cache here, so Adam updates it via Settings → Capabilities (change-list provided).**
- New `docs/README.md` — the docs index + the `type:` genre taxonomy (decision-log / system-spec / research / operational / audit) + the repo-root-relative path convention.

### Added
- **`docs/EVENT-CONTRACT.md`** (`system-spec`) — the DM↔script interface: typed events, the **detected > declared** principle, the event taxonomy, meaningful-choice-as-state-fork, and adjudication-as-precedent. The spine the other three reference.
- **`docs/ADVANCEMENT.md`** (`system-spec`) — ledger-spine XP economy (combat as a gated modifier), XP-threshold leveling applied on a rest, creativity rewarded off the XP axis (Inspiration / better outcomes / failure-as-engagement).
- **`docs/DIFFICULTY.md`** (`system-spec`) — fixed-by-default regional power bands, narrative-exception scaling (`corruption_vector`), mandatory threat-signaling, and murder-hobo answered by named responses via the existing faction-clock machinery.
- **`docs/COMBAT.md`** (`system-spec`, sketch) — theater-of-mind zone-band 5.5 engine, cover from generator terrain specs, scene objectification serving tactics/escape/clever-outs; engine deferred (Fable), event surface specced now.
- Five new decision rows in `DESIGN.md` (advancement / difficulty / combat / event-contract / docs-org).

---

## 2026-06-21 (later) — Guided creator: skills, equipment, spells & feat walkthrough + multi-die display

The bardo creator now walks the choices it used to auto-generate. After scores, four new beats — **Skills → Kit → Spells → Feat** — let the player make the picks the 2024 PHB asks for, each with a 🎲 "choose for me" shortcut (the three-options-+-something-else ethos). Ability-score rolls now show the four d6 they came from.

### Added
- **`data/srd-creator.js`** — curated SRD/2024-PHB class data: `CLASS_SKILLS` (n-from-list), `CLASS_KIT` (starting-equipment A/B/gold packages), `CLASS_CASTING` (L1 cantrip/spell counts + spell list + ability), `ALL_SKILLS`. Transcribed + verified against `Reference/SRD-Data/classes.md`.
- **`data/spells-slim.js`** (generated) — cantrip + level-1 picker surface (name/level/school/classes/flavor). Built by **`build/gen-spells-slim.py`** from `spells.json`; 84 spells, ~17 KB. Loaded as a `<script>` global (file:// can't fetch).
- **Four bardo steps** (`src/creator/bardo.js`): `skills` (class picks, minus background dupes), `equipment` (A/B/gold), `spells` (caster-only; non-casters get a graceful "no magic at level 1" pass; half-casters with 0 cantrips handled), and `feat` (the background **origin feat** — Magic Initiate resolves 2 cantrips + 1 L1 spell from its list; Skilled resolves 3 skills excluding bg/class dupes; Alert/Savage Attacker just confirm). Each with a "choose for me" auto-fill. Running bardo-log shows the picks.
- **`ORIGIN_FEATS`** (`data/srd-creator.js`) — the four origin feats the backgrounds use, with their player choices described declaratively.
- **Multi-die roll display.** `roll4d6breakdown()` keeps the four d6 (and which was dropped); the bardo score slots and the manual Sheet's "YOUR ROLLS" strip render the dice (dropped one struck through) instead of only the total. `miniDice()` helper + `.score-dice` CSS.

### Changed
- **Sheet finalize carries the choices.** `cgSheetExtras()` (shared by `cgBind` + `soulFromCGEN`) merges background + class **+ feat** skills (deduped) and adds `classSkills`, `inventory`, `gold`, `kit`, `cantrips`, `spells`, `spellAbility`, plus `featSkills`/`featCantrips`/`featSpells`/`featSpellAbility`. The manual Sheet's punt line now points to the guided creator instead of deferring everything to the DM.
- **Verification:** 62/62 headless jsdom assertions (real `genesis.html`, all modules in document order) — skill/kit/spell/feat auto-fill across Wizard, Ranger (edge), Fighter, Rogue + feat cases (Magic Initiate Cleric/Wizard, Skilled, Alert, Savage Attacker); the 4d6 breakdown (4 dice, drops lowest, total matches); sheet shape; all four render branches; Bard choose-any-3. `check-manifest` OK (29 modules, 214 owned symbols).

---

## 2026-06-21 — De-monolithing complete, scaling guardrails, creator polish

The big arc: `genesis.html` went from a 2047-line monolith to a **449-line shell + 27 modules**, plus an architecture audit, two scaling guardrails, and a round of creator/dice work.

### Added
- **Full modularization (passes 2–8).** Carved all logic out of `genesis.html` into classic-script modules: the data layer; the engine (`tables` / `world-gen` / `hexmap` / `compiled`); `world.state` + `world.render`; the UI (`oracle` / `chrome` / `dice`); the whole creator (`scores` / `life` / `sheet` / `bardo` / `roster`); and the app core (`world.play` / `fate` / `handoff`). `genesis.html` is now HTML/CSS + init + a few consts.
- **`GS` state container** (`src/state.js`) — all transient mutable state (`CGEN`/`BARDO`/`CG_DRAG`/`FATE_CTX`/`SEED`/`ORC`) lives behind one window-level `GS` object (~270 references migrated via AST). New mutable state goes here. `U` (persistent universe) keeps its own accessor layer.
- **`SCALING.md`** — architecture/scaling audit: classic-scripts vs ES-modules, the state-discipline question, and *when* to migrate (with the eventual graphics engine, not before).
- **Canon Wandering Souls** (`data/souls-canon.js` → `CANON_SOULS`, seeded idempotently by `world.state.seedCanonSouls`). Shipped as source so Adam's characters are canon; end-users' banked souls stay local; the roster is the union. Entries: **Robin Hartley, Brunn Graniteback, Milo**.
- **Pronoun picker** in character creation (`data/pronouns.js`: `PRONOUN_SETS` + `pronounSet`; they / she / he). Appears in both the bardo and the Sheet; flows to the banked soul, the in-play character, and the **DM handoff** (`I am playing X (he / him) — …`). Defaults to they/them.
- **Dice visual engine** (`src/ui/dice.js`: `dieRoll` + `diceSpice`) — the tumble-then-settle animation + spice "juice" consolidated into one place; the four contexts (ritual / creation / fate) delegate to it. First improvement shipped: **tumble-decay** (flips decelerate into rest) + a **settle-pop** bounce.
- **`check-manifest` guardrails:** a **layer-direction check** (warn-mode — flags calls into a higher layer; flips to hard-error once the 6 known inversions are cleaned) and an **HTML-tag check** (every manifest `loadOrder` entry must have a `<script>` tag in `genesis.html`; missing = hard error).

### Changed
- **Ability-score allocation** on the Sheet is now an explicit **Best-for-class / As-rolled toggle** (active mode highlighted) instead of a single button.
- **Retired the one-off `ROBIN_SEED`** into the `CANON_SOULS` data layer + the general `seedCanonSouls` seeder.

### Fixed
- **Canon souls weren't seeding in the browser.** `data/souls-canon.js` was in the manifest `loadOrder` but had **no `<script>` tag** in `genesis.html`, so `CANON_SOULS` was undefined and the seeder silently no-op'd — Robin/Brunn never actually appeared. Added the tag (now Robin/Brunn/Milo all seed); the new HTML-tag check prevents recurrence.
- **The Sheet's "Best for class" button did nothing** from a fresh roll, because rolling already auto-applied best — so re-applying it produced the identical result. Resolved by the toggle above (the allocation math was always correct).

### Deferred (tracked in `NEXT-STEPS.md` / `SCALING.md`)
- Clean the 6 layer-inversion warnings → flip the layer-check to hard-error.
- Relocate the last data consts (`STAGES` / `GUIDE` / `LIFE_STEP`) out of the shell into a data module; `FATE_THRESHOLD` → `fate.js`. Sweep dead `cgResetScores`.
- Feature backlog: deeper creator (skills / equipment / spells from SRD-Data); multi-die roll display; "retire character" action; further dice flourishes.
- ES-module migration + inline-handler rebind — paired with the eventual graphics engine.
