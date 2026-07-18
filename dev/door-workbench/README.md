# KGR-8 DOOR WORKBENCH — position the door yourself, then lock it in

You asked for the controls. This is them.

## Launch (one command)

```
node dev/door-workbench/serve.mjs
```

Then open the URL it prints: **http://127.0.0.1:5333/dev/door-workbench/workbench.html**

Give it ~15 seconds — it boots the real engine (genesis.html) into the 5×5 clay proving room:
real board, real Kenney shell, real production camera (pitch 28 / yaw 45, frozen), clay pass,
the works. Not a mock-up — the same room the capture rig shoots.

## Controls

Click a row (or press its number) to select it, then nudge with the arrow keys.

| # | control | what it does |
| --- | --- | --- |
| 1 | **Leaf depth in wall (z)** | slides the leaf through the wall. 0 = centered in the slab; **+ toward the room**, − deeper into the wall |
| 2 | **Leaf thickness** | fraction of the measured wall slab depth (0.5 = the half-depth canon, 1.0 = full slab) |
| 3 | **Leaf width (side lap)** | how far the leaf laps past the aperture onto each jamb |
| 4 | **Leaf height (head drop)** | 0 = full-height slot; raising it stops the leaf short of the wall top and fills clay **wall above the door head** (the portal-shape idea, clay draft) |
| 5 | **Sill height** | raises the threshold; the leaf stands on the sill top |
| 6 | **Reveal lining** | the two clay jamb linings through the aperture tunnel, on/off |

**Keys:** `1–6` pick a control · `↑`/`→` nudge up · `↓`/`←` nudge down ·
**hold `Shift` for fine steps (×⅒)** · `R` toggle reveal lining · `D` doorway dolly ·
`S` save/lock.

**Doorway dolly (`D`)** zooms the frozen production camera onto the door (the rig's own
door-card dolly, dist 13). Toggle again to jump back to the full-room view. The camera never
moves on its own — it is frozen; only `D` changes it.

Every nudge re-fits the leaf live against the measured wall geometry (same measurement code as
the rig — slab plane from the mount frames, visible face from the flanking details, aperture
from the world boxes) and the panel shows the resulting numbers (leaf box, reveal depth, etc.).
**Reset to v4** puts every control back to the current rig behavior.

## SAVE / LOCK

The **SAVE / LOCK** button (or `S`) writes your numbers to

```
dev/battle-gate/kgr8-clay-room/door-mount-lock.json
```

— stamped "Adam's hand placement" with the date, plus the measured leaf box at save time.
From then on **every run of the capture rig uses your placement instead of the v4 fit**
(`node dev/battle-gate/capture-kgr8-clay-room.mjs` — it logs when the lock is in effect and
records it in the diagnosis JSON). Saving again overwrites; **deleting the file falls back to
the v4 default**. The fit code is one shared file (`kgr8-leaf-fit.page.js`) evaluated by both
this page and the rig, so what you see here is exactly what the rig reproduces.

## Bonus card — the suite's only wall-with-doorway module

```
node dev/battle-gate/capture-kgr8-clay-room.mjs --mode miniwall
```

renders kenney-mini-dungeon's `wall-opening` standing in the clay room (2-cell study aperture,
labels burned in) → `dev/battle-gate/kgr8-clay-room/kenney-doors/mini-wall-opening.png` +
`-zoom.png`, appended to the kenney-doors manifest.

## If something looks off

- The workbench never touches production files; the ONLY thing SAVE writes is the lock JSON.
- Boot failed / black stage: reload the page (the boot veil reports the failing stage).
- Port 5333 busy: something else grabbed it — kill it or edit `PORT` in `serve.mjs`.
