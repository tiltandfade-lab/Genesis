/* dev/model-qa/creatures/rlm-cosmic-gibbering-mouther.js — GIBBERING MOUTHER (cosmic-w1, CR1, Medium)
   FEATURE CHECKLIST: (1) low spreading flesh-mound body, wider than tall; (2) 6 countable eyes of
   mixed size scattered across the mound, staring every which way; (3) 5 open mouths mid-syllable,
   each ringed with small teeth, scattered at different angles/heights; (4) one pseudo-limb of flesh
   surging/reaching toward the viewer (+z), the mound's single articulated gesture; (5) sickly
   flesh-tone value ladder (pale wet highlights over a dark diseased base) so the teeth-rings and
   eye-whites read as the loud high-value zone against the cosmic void.
   POSE SENTENCE: the babble-surge — the whole mound heaves forward mid-flow toward the viewer, its
   forward edge drawn up into one groping pseudopod, every mouth open and mid-syllable at once.
   SPINE-GESTURE SENTENCE: there is no skeleton, so the "spine" is the mound's forward-heaving mass
   line — low and wide at the back, rising and surging up-and-out through the reaching pseudopod at
   the front, an amorphous C-curve substituting for a spine (per ANATOMY-CANON, amorphous bodies
   carry the gesture in mass-flow, not joints — the reaching limb is the one place a true
   "joint bend" appears, at its own base-to-tip taper). */
import { V, quad, blob, tube, ring, capFan } from '../probe-lib.js';

/* an eye = pale sphere + a dark pupil nudged toward dir=[dx,dy,dz] (cosmic-set.js convention). */
function eye(cx, cy, cz, r, dir, pale, pupil, glow){
  blob(cx, cy, cz, r, r, r, pale, 6, 4);
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0]/n, dy = dir[1]/n, dz = dir[2]/n;
  blob(cx + dx*r*0.62, cy + dy*r*0.62, cz + dz*r*0.62, r*0.52, r*0.52, r*0.52, pupil, 5, 3);
  if(glow) blob(cx + dx*r*0.86, cy + dy*r*0.86, cz + dz*r*0.86, r*0.20, r*0.20, r*0.20, glow, 4, 2);
}

export function buildGibberingMouther(){
  const P = {
    fleshDk:  0x5a3f3a,   // base mound, dark diseased flesh
    flesh:    0x86584a,   // mid flesh
    fleshWet: 0xb8846a,   // wet highlight ridges — the high-value zone law 3 wants
    tongue:   0x8f2f3a,   // interior mouth flesh
    teeth:    0xe8ddc4,   // pale teeth ring — HIGH VALUE (>=140 RGB)
    gum:      0x3a1418,   // dark mouth cavity behind the teeth
    eyeWhite: 0xd8d2b8,   // eye sclera — HIGH VALUE
    pupil:    0x140c0a,
  };

  // ---- BODY: low spreading flesh mound, wider than tall, ground-hugging ----
  // back mass (low, broad) building forward into a raised heaving front edge
  blob(0, 0.14, -0.22, 0.46, 0.14, 0.34, P.fleshDk, 12, 5);
  blob(-0.24, 0.16, -0.05, 0.30, 0.16, 0.28, P.flesh, 10, 5);
  blob(0.26, 0.16, -0.06, 0.32, 0.16, 0.28, P.flesh, 10, 5);   // y 0.15->0.16: this lobe's underside sat
                                                                // exactly on the -0.01 gate boundary
  blob(0, 0.20, 0.10, 0.34, 0.19, 0.30, P.flesh, 10, 5);
  blob(-0.08, 0.24, 0.28, 0.24, 0.20, 0.22, P.fleshWet, 8, 5);   // rising forward edge, wet highlight
  blob(0.14, 0.26, 0.30, 0.20, 0.19, 0.20, P.fleshWet, 8, 5);
  blob(0, 0.12, -0.02, 0.44, 0.11, 0.40, P.fleshDk, 10, 4);      // flattened base skirt, wide+low (y lifted
                                                                  // 0.11->0.12: jitter put minY exactly at the
                                                                  // -0.01 floor gate — orchestrator margin fix)

  // ---- SIGNATURE PSEUDOPOD: one limb of flesh reaching toward the viewer, mid-surge ----
  // articulated taper — base thick, mid narrower (the "bend"), tip pointed, arcing up and out (+z, +y)
  const pb = V(0.02, 0.32, 0.34);
  const pm = V(0.07, 0.52, 0.62);
  const pt = V(0.03, 0.50, 0.94);
  tube(pb, pm, 0.17, 0.115, 8, P.flesh, { phase: 0.3 });
  tube(pm, pt, 0.115, 0.05, 8, P.fleshWet, { phase: 0.3, capB: { hex: P.fleshWet, lift: 0.03 } });
  // a mouth right at the pseudopod tip — it's reaching AND babbling (top-facing, camera-visible)
  mouth(pt.x, pt.y + 0.01, pt.z - 0.03, 0.08, [0.1, 0.7, 0.6], 5);

  // ---- SIGNATURE: 6 eyes on raised bumps across the TOP of the mound (camera-facing hemisphere,
  // so every one clears the body surface instead of sinking into an overlapping blob) ----
  eyeOnBump(-0.30, 0.26, 0.10, 0.055, [-0.5, 0.7, 0.5], P);
  eyeOnBump(0.33, 0.25, 0.06, 0.06, [0.55, 0.65, 0.45], P);
  eyeOnBump(-0.12, 0.34, 0.22, 0.05, [-0.2, 0.75, 0.6], P);
  eyeOnBump(0.20, 0.35, 0.20, 0.052, [0.3, 0.75, 0.55], P);
  eyeOnBump(0.02, 0.28, -0.28, 0.058, [0.05, 0.65, -0.5], P);
  eyeOnBump(-0.32, 0.22, -0.12, 0.046, [-0.7, 0.6, -0.2], P);

  // ---- SIGNATURE: 5 open mouths mid-syllable, on raised bumps across the top, different angles ----
  mouth(-0.10, 0.24, 0.32, 0.09, [-0.15, 0.6, 0.75], 6);
  mouth(0.22, 0.22, 0.22, 0.085, [0.5, 0.55, 0.55], 6);
  mouth(-0.30, 0.20, -0.02, 0.078, [-0.75, 0.45, 0.15], 5);
  mouth(0.32, 0.18, -0.06, 0.075, [0.7, 0.4, -0.15], 5);
  mouth(-0.02, 0.19, -0.32, 0.078, [0.0, 0.5, -0.8], 5);

  // ---- flattened base ring so the mound reads as spreading across the floor, not floating ----
  const skirt = ring(V(0, 0.015, -0.02), V(0,1,0), 0.46, 0.42, 12, 0.2);
  capFan(skirt, V(0, 0.012, -0.02), P.fleshDk);   // apex lifted off y=0: ring jitter was putting the
                                                   // bake minY exactly at the -0.01 gate boundary
}

/* a raised flesh bump (small blob) a feature sits on, so it always pokes proud of the mound
   surface instead of risking burial inside an overlapping body blob. */
function bump(cx, cy, cz, nrm, r, hex){
  const len = Math.hypot(nrm[0], nrm[1], nrm[2]) || 1;
  const nx = nrm[0]/len, ny = nrm[1]/len, nz = nrm[2]/len;
  blob(cx + nx*r*0.4, cy + ny*r*0.4, cz + nz*r*0.4, r, r*0.85, r, hex, 7, 4);
}

/* an eye = raised bump + pale sclera sphere + dark pupil nudged toward dir, sitting proud of the
   mound surface (visible from the camera hemisphere by construction). */
function eyeOnBump(cx, cy, cz, r, dir, P){
  bump(cx, cy, cz, dir, r * 1.35, P.flesh);
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0]/n, dy = dir[1]/n, dz = dir[2]/n;
  const ex = cx + dx*r*0.75, ey = cy + dy*r*0.75, ez = cz + dz*r*0.75;
  blob(ex, ey, ez, r, r, r, P.eyeWhite, 7, 4);
  blob(ex + dx*r*0.6, ey + dy*r*0.6, ez + dz*r*0.6, r*0.5, r*0.5, r*0.5, P.pupil, 5, 3);
}

/* an open, teeth-ringed mouth on a raised bump: a dark cavity cone + a ring of small pale teeth
   at the rim, each tooth its own quad so it's a countable feature (law 1). n = tooth count. */
function mouth(cx, cy, cz, r, nrm, n){
  bump(cx, cy, cz, nrm, r * 1.3, [0x86584a, 0xb8846a, 0x86584a][n % 3]);
  const len = Math.hypot(nrm[0], nrm[1], nrm[2]) || 1;
  const nx = nrm[0]/len, ny = nrm[1]/len, nz = nrm[2]/len;
  const mx = cx + nx*r*0.55, my = cy + ny*r*0.55, mz = cz + nz*r*0.55;   // lip sits proud of the bump
  const center = V(mx, my, mz);
  const deep = V(mx - nx*r*0.85, my - ny*r*0.85, mz - nz*r*0.85);
  const rim = ring(center, V(nx, ny, nz), r, r*0.92, n, 0);
  capFan(rim, deep, 0x3a1418);   // dark open cavity behind the teeth
  // teeth: small triangular quads pointing inward from the rim, pale + HIGH VALUE
  for(let i = 0; i < n; i++){
    const a = rim[i], b = rim[(i+1) % n];
    const tmx = (a.x+b.x)/2, tmy = (a.y+b.y)/2, tmz = (a.z+b.z)/2;
    const tipx = tmx*0.68 + center.x*0.32, tipy = tmy*0.68 + center.y*0.32, tipz = tmz*0.68 + center.z*0.32;
    quad(a, b, V(tipx, tipy, tipz), V(tipx, tipy, tipz), 0xe8ddc4, 0.03);
  }
}
