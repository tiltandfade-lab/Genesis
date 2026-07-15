# PLAY-LENS Ledger — run-pl1-002 (2026-07-14)

First full audit: 26 shots, 14/14 legs, 3 vision auditors + orchestrator synthesis. Frames graded
on pixels, not intentions. Run predates the D4c/D4d merges (leaf variants + slim frames) — door
findings get re-checked next run. **This ledger orders the visual waves** (docs/PLAY-LENS.md law).

## P0 — BROKEN, small, high-visibility (the QUICK-FIX WAVE)

| # | finding | evidence | sev×freq | owner |
|---|---|---|---|---|
| 1 | **"Giant Rat" renders as a robed humanoid with a floating hat** — sprite casting/join bug | pl-018/019/020/021 (every combat frame) | 3×4 | casting join (figureFor/registry) |
| 2 | **PC token absent from the combat board** in rounds 2–3 (present in round 1) | pl-019/020/021 | 3×3 | combat board rebuild |
| 3 | **Door leaf floats unanchored in real rolled rooms** — no frame/wall socket contact (unlike the clean study-card scene) | pl-011, pl-016 | 3×2 | door anchoring in production rooms |
| 4 | **Unshaded white wireframe mesh** floating in the settlement tray — material fallback | pl-002 | 3×1 | material fallback guard |
| 5 | **Arrival scene renders as a single ellipse on black** — degenerate walk_complete frame | pl-010 | 3×1 | node-tray arrival source |
| 6 | **Tray camera clips the PC's head** | pl-001, pl-002 | 2×2 | tray camera fit |

## P1 — MISSING (the big waves; ranked by mass)

| # | finding | evidence | owner wave |
|---|---|---|---|
| 7 | **The entire travel/wilderness surface is an empty tile plane** — no terrain, foliage, sky, path variety, or PC token, across all 6 legs | pl-003..009 | **ENV/EXTERIOR WAVE** |
| 8 | **Light profiles are visually unwired outside interiors** — daylit ≡ moonlit ≡ overcast, pixel-identical | pl-004..009 | **ENV/EXTERIOR WAVE** (profile wiring; Adam's "we don't even have daytime") |
| 9 | **No town scene exists** — settlement tray shows zero buildings/street/NPCs; a compositional settlement tray was already confirmed missing by the rig itself | pl-002 + rig report | **TOWN TRAY** |
| 10 | **Combat stages on a grid floating in black void** — the room's geometry is dropped at the exploration→combat cut; total spatial continuity loss | pl-018/019/020 | **COMBAT-IN-ROOM** (BW5 S0-1 slice) |
| 11 | **State beats have no staging** — dungeon-complete / shop-open / shop-closed / long-rest all render the identical idle pedestal; day→night changes only as sidebar text | pl-023..026 | **STAGING BEATS** unit |

## P2 — UGLY (Stage E territory)

| # | finding | evidence | owner |
|---|---|---|---|
| 12 | **Exposure extremes**: ~half of most interior frames crushed to illegible black; hot sources blow to white (bloom re-blows what AgX compressed) | pl-012, pl-013, pl-014, pl-017, pl-022 | **STAGE E** (exposure floor + emissive-masked bloom) |
| 13 | Bloom mask artifact — hard jagged edge on a glow sprite | pl-013 | Stage E |
| 14 | Orphaned small sprites (no ground contact/mount): purple crystal mid-air; crusty green clusters | pl-014, pl-015 | P3-2 standee/contact rules + D5 |
| 15 | PC idle figure: stiff pose, axe occluding the face, flat shading | pl-023..026 | figure polish (foundry lane) |

## WORKING (the protection set — regressions here are P0)

UI chrome (sidebar, polaroid frame, clock) · dungeon material language (brick/torch/tile) ·
crates/altar/shelf props · wolf + skeleton sprites · **pl-022** (combat-end diorama: prop variety,
mood, palette — the best frame of the run).

## Rig improvements (PL-1b, before the next run)

Bot should fight (attack/move events so rounds visibly differ) · a state_transition capture should
focus the room where the transition happened · verify the shop panel actually renders in-capture ·
re-run post-D4c/D4d to re-grade the door findings.

## THE ORDERING (what the ledger says comes first)

1. **QUICK-FIX WAVE** (P0 #1–6): days, not weeks — every one is visible in normal play.
2. **ENV/EXTERIOR WAVE** (#7+8+9): the single biggest visual-debt mass — travel trays, light-profile
   wiring (daytime!), and the town tray. This IS Adam's "no daytime, no town" instinct, measured.
3. **STAGE E** (#12+13): exposure floor + emissive-masked bloom (interiors are close; this is the
   finishing pass).
4. **COMBAT-IN-ROOM** (#10) + **STAGING BEATS** (#11): the continuity-of-place work.
5. **P3-2 sprites** (still gated on the sprite-QA session) + D5 archetypes ride their existing gates.

---

# PL-3 DELTAS — run-pl3-001 (2026-07-15, the composed stack)

Same 14-leg route, 26 shots, zero breaks. Against the pl1-002 baseline:

## FIXED (verified in real play)
- **#7 travel legs empty** → biome flora + ground tint + daylight sky on every exterior leg (pl-005: chrome flora under a morning sky).
- **#8 profiles unwired** → daylit/moonlit/dark visibly distinct in play; the PC casts a MORNING-DIRECTION shadow (ENV-1b+1c composing).
- **P0 #2 PC missing/corner** → PC centered + fully in frame at the node tray (pl-002), casting shadows.
- **P0 #4 wireframe mesh** → no unshaded fallbacks observed.
- **P0 #6 head-clip** → full figure + headroom (pl-002).
- **P0 #5 arrival blob** → arrival resolves a real tray.

## PARTIAL / ROUTED-AS-DESIGNED
- **#9 town**: this run's start node bound a place record (Dorsal Market) → single-site tray took precedence (correct). The town builder's own card (env3-town-daylit) passed the gate; a lens run at a record-less settlement node still owed.

## STANDING (unchanged, known)
- Headless captures under-render figure meshes (rig caveat; the shadow is the witness).
- P0 #1 rat-miscast + combat-void staging: combat legs still owed a delta read (combat frames not re-read this pass — next audit).
- Facade art (doors/windows/roofs), NPC card art, exposure crush in interiors → Adam's packets + Stage E.
