# KGR-8 camera-angle taste card

The finished clay proving room (wall-plane-mounted leaf, card 02) shot at four camera PITCHES.
Everything else is held identical: yaw 45°, orbit distance
24.9557 (the production interior fit + the recorded 3-step zoom-out),
orbit center [0, 0, 0], perspective FOV 20.
Pitch is burned into each frame's corner label. Adam names a winner; that pitch freezes as the
production camera constant (today: CAM_ELEV_DEG = 35 in src/ui/theater-boot.js — cam-b).

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
