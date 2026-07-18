# KGR-8 camera-angle taste card

The finished clay proving room (wall-plane-mounted leaf, card 02) shot at four camera PITCHES.
Everything else is held identical: yaw 45°, orbit distance
24.9557 (the production interior fit + the recorded 3-step zoom-out),
orbit center [0, 0, 0], perspective FOV 20.
Pitch is burned into each frame's corner label. Adam names a winner; that pitch freezes as the
production camera constant. **DECIDED: 28° — frozen.** (History: CAM_ELEV_DEG was 35 — cam-b —
when this card was shot; the battlefield tiebreaker below decided 28, and the graduation landed.
See "The graduation" at the bottom.)

| frame | pitch | read | yaw | distance | camera position |
| --- | --- | --- | --- | --- | --- |
| cam-a | 50° | high / more top-down | yaw 45° | dist 24.9557 | pos [11.3429, 19.1172, 11.3429] |
| cam-b | 35° | CURRENT production pitch (CAM_ELEV_DEG = 35) | yaw 45° | dist 24.9557 | pos [14.455, 14.314, 14.455] |
| cam-c | 28° | intermediate low | yaw 45° | dist 24.9557 | pos [15.5808, 11.716, 15.5808] |
| cam-d | 22° | cinematic low / near eye-level | yaw 45° | dist 24.9557 | pos [16.3614, 9.3486, 16.3614] |

Recovered pre-override pitch (sanity: must equal the production constant): 35°.
Contact sheet: camera-taste-card.png (2×2, a/b upper, c/d lower).
Re-run: `node dev/battle-gate/capture-kgr8-clay-room.mjs --mode camera` then rebuild the sheet per
the command in this folder's history (PIL side-by-side compose).

## The battlefield-vision tiebreaker (card 03 unit 2)

Adam on the card above: *"i honestly like the 22 degree angle, but maybe 28 degrees is the safer
bet for more battlefield vision."* Settled with evidence: the SAME clay room (card-03 shut door)
with **7 clay-grey proxy pieces** — six Medium standee-scale primitives (1-cell footprint,
boxes/cylinders ~1.0–1.05 tall) plus one Large (2×2-cell box, 1.7 tall) — spread across the floor
grid, shot at **pitch 22° / 25° / 28°**. Yaw 45°, orbit center [0, 0, 0], distance 24.9557, and
FOV 20 are HELD at the recorded params above (the live production fit was recovered per frame as
a cross-check: drift 0.0000 on all three). Only pitch varies. Labels burned in-frame.

| frame | pitch | camera position |
| --- | --- | --- |
| battlefield-22.png | 22° | [16.3614, 9.3486, 16.3614] (= cam-d) |
| battlefield-25.png | 25° | [15.9930, 10.5467, 15.9930] |
| battlefield-28.png | 28° | [15.5808, 11.7160, 15.5808] (= cam-c) |

Proxy layout (plan cells, interior 1..5; front band = cells hugging the parapet-cut south/east
walls): M1 cylinder (1,1) far NW corner · M2 box (3,2) · M3 cylinder (2,3) · M4 box (5,4) FRONT
BAND east · M5 cylinder (2,5) FRONT BAND south · M6 box (4,5) FRONT BAND south · L1 Large box
centered (3.5,3.5). Exact manifest + per-frame camera data: `battlefield-params.json`.

Two deliberate stress reads baked into the layout, for the frame judgement:
- **M1 sits dead on the camera diagonal BEHIND the Large piece** (far NW corner vs a 2×2 blocker
  at board center on the yaw-45 axis) — worst-case far-corner occlusion. How much of M1 peeks
  over L1, and how much floor separates them on screen, is exactly what pitch buys.
- **Three front-band pieces stand behind the parapet-cut walls** (M4/M5/M6): how much of their
  bases + the floor cells they stand on survives behind the parapet caps is the front-line
  legibility read.

Contact sheet: `battlefield-taste-card.png` (3-up, 22/25/28 left to right).
Re-run: `node dev/battle-gate/capture-kgr8-clay-room.mjs --mode battlefield`, then compose the
sheet: PIL — open the three frames, downscale ×0.5, paste side-by-side with an 8 px divider.
Adam's pick freezes as the production `CAM_ELEV_DEG`.

## The graduation (card 04 unit 3 — LANDED)

Adam's pick: **28°** ("at 22° a piece behind cover vanishes; at 28° every piece reads" —
DESIGN.md 2026-07-17 "THE CAMERA IS FROZEN AT 28°"). The approved single-constant swap landed:
`CAM_ELEV_DEG` 35→28 in `src/ui/theater-boot.js` — no other camera surgery; this taste card +
the battlefield tiebreaker ARE the prototype-proof approval trail.

Verification (`--mode verify28`): the clay room re-shot through the pure production camera path,
NO pitch override anywhere — `production-28-verify.png`. Recovered from the live camera's world
direction: **pitch 28.000, yaw 45.000, FOV 20** (`production-28-verify-diagnosis.json`,
`cameraVerify`). Note the production fit at 28° chooses its own orbit distance (camera pos
[14.4723, 10.8825, 14.4723], dist ≈ 23.18) — the taste/tiebreaker frames held the 35°-fit
distance 24.9557 with a pitch override, so the verify frame is the first TRUE native-28 framing.
