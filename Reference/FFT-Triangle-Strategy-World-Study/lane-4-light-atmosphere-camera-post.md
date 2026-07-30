# Lane 4 — Light, atmosphere, camera, and post

Answers §5.5. Sources: primary interviews (Matsuno/Ito 1997; Asano/Arai 4Gamer;
Asano Destructoid; Maehiro 2025), frame corpus, IC first-party mode pairs, Genesis BW3
suite + light-lab + clay captures, measured value stats (lane 3 table).

## 4.1 Camera regimes and their production consequences (§5.5 Q1–2)

| | projection & pitch | player freedom | documented cost |
|---|---|---|---|
| FFT | dimetric-feel, one pitch | 4 yaws (90° steps), 2 zooms | rotation exists to see behind things (Matsuno); maps composed so approach/threshold read from useful angles |
| TS | perspective isometric-feel, steeper pitch available | ~free rotation, top-down Tactical View, zoom | "a lot of resources to make the map observable from all sides"; edge treatment debated early (Arai); 8-direction sprites rationed to 4 characters (Morimoto) |
| IC Enhanced | as FFT + new Tactical View overhead | as FFT | remaster inherits FFT's coverage; adds UI-layer views |
| Genesis | gentle perspective (~20° FOV, 35° elev, 45° yaw start), ortho fallback | fixed production yaw; governed pan/zoom (~8.3×); strategic top view (all walls render) | rotation cost structurally avoided (canon W3 §12.13); information function replaced by compile-time omission + stubs + strategic view — clay-proven |

**The corpus's information-vs-cost trade:** FFT and TS pay art/QA so the *player* can
rotate for information; Genesis moves that job to the compiler (omission, cutaway,
strategic view). Nothing in the corpus contradicts the viability of the fixed-camera
translation — FFT itself composed "useful angles" per map, conceding that most bearings
are non-primary anyway.

## 4.2 Key light and fill (§5.5 Q3–4)

- FFT: baked directional sun, consistent per map; shade painted; no dynamic response.
- TS: real key + graded ambient; night scenes go cool-blue ambient with warm practicals
  (canal frame); day scenes hold high-value sun (p98 91) with readable shadow interiors.
- IC: graded sun; rain/storm states re-light whole boards (Orbonne rain pair); shadows
  deepened (p2 7–8 vs FFT's 11–20) yet forms inside shadow stay readable.
- Genesis: celestial arc profiles (daylit/overcast/moonlit), hemisphere bounce floor
  (ruled so shadow forms stay readable), camera-side sprite fill (shadowless). **Measured
  issue:** the darkest room grade (G4) crushes terrain interiors to near-silhouette
  (capture inventory #8) — the corpus never lets its darkest scene lose form; the
  hemisphere-floor law is right and needs a grade-side floor too (smallest correction:
  minimum ambient term per grade tier, verified by a p2/form-readability check).

## 4.3 Practicals (§5.5 Q5)

TS practicals are physically owned (lamps, braziers, awning-lanterns) and pool warm light
against the cool grade — the canal frame's entire mood is that opposition. Genesis's
practical law is already stricter than the corpus (visible emitter required, per-light
state, deterministic flicker, torch 120 ft/decay 1.5). **No gap in law; the gap is scenes
that use them** (bench fixtures have one torch; targets show 1–3 practicals).

## 4.4 Grounding: contact, AO, riser darkening (§5.5 Q6)

TS/IC: strong contact darkening at wall feet and under units; riser faces read darker
than tops everywhere (the corpus's depth cue). Genesis: env-AO A/B exists in Clayroom,
multiply contact shadows, riser-darkening material routing — matches. The natural-surface
default shows honest self-shadowing on folds. Adequate; no corrective proposed beyond
keeping AO on in production captures.

## 4.5 The post stack (§5.5 Q7–10)

- **TS:** tilt-shift DoF blurs *context bands, never the playable floor* (canal frame:
  action tiles sharp, surrounding fabric soft); selective warm bloom on practicals/embers;
  film grade per scene state; particles (embers, rain, snow) everywhere; no hard vignette.
- **IC:** DoF + corner vignette + the paper-grain overlay (full-frame, documented) — the
  "handcrafted tabletop" cue; grade softens highlights (Agrias frame p98 85).
- **FFT:** none (register is the post).
- **Genesis:** BW3 suite BUILT — interior-only chain (RenderPass→DoF→Bloom→Grade→sRGB),
  focal band tracks board center; selective emissive bloom with negative controls; per-
  realm filmic grade; fog whisper; 125–165 fps. **Genesis owns the corpus's post stack
  already.** Two deltas: (1) the suite is interior-only — exterior scenes (where the
  vignette targets live) bypass it; (2) DoF on a 10–16-cell board must exempt the whole
  playable floor (TS's rule) — the focal-band approach does this if the band is sized to
  the board, worth one explicit check when exteriors mount the suite.

**Which post helps compact maps (Q10):** grade + selective bloom + context-band DoF are
safe multipliers; hard vignette and floor-crossing DoF are the two that damage a compact
board (they eat the very cells the player owns). IC's paper-grain is an interesting
tabletop cue but would fight the crisp-texel law — noted, not proposed.

## 4.6 Where effects apply (§5.5 Q8–9)

The corpus separates floor from envelope: sharp/lit floor, atmospheric envelope (fog,
blur, particles biased to depth). Genesis's ruled four-band context contract encodes the
same split (contrast classes per band; far field gets fog/grade separation, "no cinematic
DoF blur" on far context per the projection spec — consistent with TS practice).

## 4.7 Findings

```text
FINDING L4-1
Claim: Genesis already owns every post/lighting instrument the corpus uses (DoF, selective
       bloom, grade, fog, practicals, contact/AO) — the remaining lighting gaps are
       scene-usage gaps (exterior post routing, dark-grade form floor, practical density),
       not missing features.
Evidence: BW3 build records + capture inventory vs TS/IC frame reads.
Evidence class: direct frame + implementation evidence
Confidence: high
Genesis translation: H6 SUPPORTED — next lighting work is corrections, not systems: route
       the suite to exteriors, add a per-grade ambient floor check, and let rolled scenes
       carry 2–4 practicals where lore-native.
Solo-cost class: renderer multiplier
Decision status: research finding only
```

```text
FINDING L4-2
Claim: The playable floor is never blurred in shipped HD-2D tactics; DoF belongs to
       context bands.
Evidence: TS frames (canal, Wolffort views); IC gameplay frame.
Evidence class: direct frame
Confidence: high
Genesis translation: encode "floor-exempt DoF" as an explicit check when the post suite
       mounts on exterior vignettes.
Solo-cost class: renderer multiplier (one check)
Decision status: research finding only
```
