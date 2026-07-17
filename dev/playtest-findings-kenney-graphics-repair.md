# Kenney graphics repair — live bridge finding

Date: 2026-07-16  
Build: `test/kenney-repair-proving-run` at `bfb0c44d` plus the texture-readiness follow-up  
World / walk: The Bell of Grey / Prison / Asylum, dungeon, The Loop, segment 1  
Evidence: `dev/battle-gate/kenney-graphics-repair/live-playtest-prison-asylum.png`

## Result

- No P0/P1 Kenney alignment or collision complaint was visible at gameplay scale. The two live door
  leaves were upright, grounded, and remained associated with their dark compiled-shell apertures;
  no detached leaf/frame scale mismatch or polygon interference appeared.
- The first frontier render was a flat fallback board because `prepPending` had not been serviced.
  The active walk existed, but `prep.nodes[activeWalkId].spatial` is attached only by `prep_applied`.
  Applying the dungeon overlay immediately promoted the same canonical walk to the volumetric interior.
  This is a prep-autopilot/runbook gap, not a Kenney transform failure.
- This roll supplied algae, bones, mud, and relief-carving nouns. None truthfully matched the ten
  approved Kenney barrel/crate/table/bench/chair/light pilots, so this live scene did not exercise a
  promoted prop. The KGR-6 current-engine furnished-room and lineup captures remain the direct visual
  evidence for those ten assets; no noun was rewritten merely to force catalog coverage.
- P2 visual/readability complaint: the Chrome dressing pass produced an overexposed white flora cluster
  and very dark aperture frames, making correctly-sized brown door leaves read more slab-like than the
  calibrated isolated door capture. This is lighting/material composition, not measured detachment.
- First-interior console evidence contained 85 instances of `Texture marked for update but no image
  data found`. The cause is `nearestify()` marking the placeholder returned by `TextureLoader.load()`
  dirty before image decode. The follow-up guard now marks only textures with an image; the material-
  texel verifier exercises both pending and decoded texture paths so the readiness bug cannot return.

The earlier `loadU is not defined` console entry belonged to the abandoned sparse integration-tree
boot and predates the successful materialized-worktree reload; it is not attributed to this build.
