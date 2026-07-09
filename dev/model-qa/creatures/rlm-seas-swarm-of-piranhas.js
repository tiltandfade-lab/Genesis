/* dev/model-qa/creatures/rlm-seas-swarm-of-piranhas.js — SWARM OF PIRANHAS landmark table
   (SWARM family, Medium, CR 1/4, realm high-seas), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot, seas-w1 cell 5). Core identity: a boiling ball
   of biting fish erupting out of a breached hull — bespoke to render key "swarm-of-piranhas";
   realm reskins ride this chassis narratively (data/realm-bestiary.js "Coral-Fanged Moray Swarm"
   / "Backyard Above-Ground Pool Leech Swarm").

   FEATURE CHECKLIST (the ~1,200-1,300 budget buys):
     1. 10 individual torpedo-bodied fish radiating from a central knot, each a countable
        tail->body->head loft (law 1: tris spent on countable fish, not smoothing).
     2. Forked tail fin + a raised dorsal fin + two pectoral fins per fish, built as real-volume
        cone shards off the body surface (law: seat appendages from the surface, give small
        features real 3D volume) — the spiky churning silhouette that reads "biting swarm" and
        not "smooth blob" at a squint (law 2).
     3. SIGNATURE — a bright ivory tooth-flash cluster at every snout (open under-bite jaw) and a
        pale silvery belly strip riding the underside of every body: the two high-value zones law
        3 needs, set against dark oily backs so they pop at 1/3-res.
     4. Erupting-boil pose (law 5) — three fish pitched steep, breaking the surface plane of the
        mass at a sharp upward angle; the rest churn low and wide at varied yaw/pitch so no two
        fish share an angle (never a synchronized ring).
     5. One prey BONE flung clear of the boil — a knobby-ended shaft tumbling up and outward past
        the fish silhouette, the one narrative tell that this is a feeding frenzy, not a school.
     6. Small red gill-flash per fish (cheap countable tell, territorial/blood-hungry flavor) plus
        a central dark fused knot the tails root into, so the mass reads as one boiling thing.

   POSE SENTENCE: a boiling knot of ten fish churns low over the disc, three erupting steeply
   through the surface of the mass at sharp angles with jaws flared and teeth bared, the rest
   knifing through the frenzy at every other angle, one stripped prey bone flung clear and
   tumbling above the boil.

   Whole-object grammar: one exported build fn, probe-lib primitives only, LOCAL FRAME per fish
   via a frame() closure (yaw+pitch about the hub, then translate — never mixes raw world-space
   points into the local frame), ground y=0, no anchors. Imported by ps1-sheet.html
   (SETS['seas-w1'], cell 5, fn buildSwarmOfPiranhas). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildSwarmOfPiranhas(){
  /* ---------- PALETTE (high-seas hull-breach murk; dark oily backs vs. pale belly + ivory teeth
     — the two law-3 high-value zones) ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): every fish body sampled 15-35 RGB in-engine —
     within the void band — so the whole boil read as thin dark spikes instead of a solid biting
     mass; the source hexes below are lifted well past the Lambert key(0.72)+fill(0.22) falloff
     so they still clear ~35+ RGB after shading (matches the yuan-ti "lifted off void" fix). */
  const P = {
    back:  0x557a64, back2: 0x5f8a70, back3: 0x466b56,   // 3 cycling coats, lifted clear of void
    backDk:0x3c5a48,                                      // head/snout — still darker, but lifted
    fin:   0x3c5c4a,                                      // fins — lifted to match the body tier
    belly: 0xf0f4e8,                                      // pale belly strip — the value spine
    tooth: 0xf2ead2,                                      // ivory teeth flash
    gill:  0xc24444,                                      // blood-red gill flash, lifted
    eye:   0xa8c8b4,                                      // small pale eye fleck (never darkest tier)
    knot:  0x2c4438,                                      // fused core the tails root into — lifted
    bone:  0xe4dcc2, boneDk: 0xb8ae94,                     // the one flung prey bone
    disc:  0x2c3a3a, discTop: 0x384a48,
  };

  const hubY = 0.16;

  /* local frame for one radiating fish arm: yaw spreads it around the hub, pitch tips the whole
     body up/out (breaching). lx/ly/lz are local coords (lz = outward along the body, ly = local
     up) — never mixed with raw world-space V() points (the coordinate-frame law). */
  function frame(yaw, pitch){
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cy = Math.cos(yaw),   sy = Math.sin(yaw);
    return (lx, ly, lz) => {
      const y1 = ly*cp + lz*sp, z1 = -ly*sp + lz*cp;   // pitch about local x (positive pitch breaches UP)
      const x2 = lx*cy + z1*sy, z2 = -lx*sy + z1*cy;   // yaw about y
      return V(x2, hubY + y1, z2);
    };
  }

  /* a small real-volume cone shard (fin/tooth) — base ring tapering to a point, seated ON the
     body surface, never a flat 2-tri sliver (the cross-family "small features need real 3D
     volume" rule). */
  function shard(base, tip, w, hex){
    const axis = new THREE.Vector3(tip.x-base.x, tip.y-base.y, tip.z-base.z).normalize();
    const rBase = ring(base, axis, w, w*0.4, 4, 0.4);
    capFan(rBase, tip, hex);
  }
  /* a thicker two-stage shard (dorsal fin) — base ring -> mid ring -> apex, more presence in the
     silhouette than the single-cone shard above. */
  function bigShard(base, mid, tip, w0, w1, hex){
    const axis0 = new THREE.Vector3(mid.x-base.x, mid.y-base.y, mid.z-base.z).normalize();
    const r0 = ring(base, axis0, w0, w0*0.4, 4, 0.4);
    const r1 = ring(mid, axis0, w1, w1*0.4, 4, 0.4);
    stitch([r0,r1], ()=>hex);
    capFan(r1, tip, hex);
  }

  /* one fish: tail root buried in the hub -> body -> head/snout at the far (outward) end.
     sc scales the whole arm; coat cycles the 3 back tones; breach lifts the pose to a steeper
     erupting angle for the 3 signature breaching fish. */
  function fish(yaw, pitch, sc, coat){
    const P3 = (lx, ly, lz) => frame(yaw, pitch)(lx*sc, ly*sc, lz*sc);

    const tailRoot = P3(0,     0.000, 0.05);
    const midA     = P3(0,     0.012, 0.17);
    const midB     = P3(0,     0.018, 0.30);
    const headBase = P3(0,     0.006, 0.40);
    const snoutTip = P3(0,    -0.012, 0.48);

    tube(tailRoot, midA, 0.052, 0.080, 6, coat,     {phase:Math.PI/6});
    tube(midA,     midB, 0.080, 0.067, 6, coat,     {phase:Math.PI/6});
    tube(midB, headBase, 0.067, 0.048, 6, P.backDk, {phase:Math.PI/6});
    tube(headBase, snoutTip, 0.048, 0.015, 6, P.backDk, {phase:Math.PI/6, capB:{hex:P.backDk}});

    /* forked tail fin — two lobes splaying up/down off the tail root, toward the hub */
    shard(tailRoot, P3(0.075,  0.095, -0.02), 0.030, P.fin);
    shard(tailRoot, P3(0.075, -0.095, -0.02), 0.030, P.fin);

    /* dorsal fin — the thicker shard, rising off the back mid-body (breaks the top silhouette) */
    bigShard(P3(0,0.055,0.27), P3(0,0.12,0.255), P3(0,0.185,0.24), 0.028, 0.018, P.fin);

    /* pectoral fins — a shard each side, near the head */
    shard(P3(0.045,-0.01,0.36), P3(0.135,-0.05,0.335), 0.022, P.fin);
    shard(P3(-0.045,-0.01,0.36), P3(-0.135,-0.05,0.335), 0.022, P.fin);

    /* SIGNATURE — the tooth-flash cluster: 3 ivory cones in the flared open under-bite jaw */
    for(const dlx of [-0.014, 0, 0.014]){
      shard(P3(dlx,-0.02,0.455), P3(dlx*1.4,-0.05,0.485), 0.012, P.tooth);
    }

    /* SIGNATURE — pale belly strip: CRITIC R2 fix — a strictly-ventral quad (straight -ly) never
       faces the ~30deg-elevation engine camera on a low-pitch fish, so it read as invisible in the
       r2 render despite a bright hex. Moved to a pair of lower-FLANK bands (lateral lx offset, not
       centerline) so whichever side happens to face camera for a given fish's yaw still shows the
       pale value zone; kept low (-ly) so it still reads as "belly", not "stripe on the back". */
    quad(P3(0.058,-0.020,0.10), P3(0.058,-0.020,0.40), P3(0.030,-0.048,0.40), P3(0.030,-0.048,0.10), P.belly, 0.05);
    quad(P3(-0.058,-0.020,0.10), P3(-0.030,-0.048,0.10), P3(-0.030,-0.048,0.40), P3(-0.058,-0.020,0.40), P.belly, 0.05);

    /* blood-red gill flash, small pale eye fleck */
    quad(P3(0.038,0.01,0.365), P3(0.050,0.005,0.35), P3(0.050,-0.02,0.35), P3(0.038,-0.015,0.365), P.gill, 0.05);
    quad(P3(-0.036,0.03,0.40), P3(-0.020,0.03,0.40), P3(-0.020,0.015,0.415), P3(-0.036,0.015,0.415), P.eye, 0.05);
  }

  /* ---------- 10 fish radiating from the hub: 3 breaching steep through the surface, 7 churning
     low/wide through the mass at every other angle (never a synchronized ring) ---------- */
  //  i    yaw(rad)   pitch     scale   coat        breach?
  const coats = [P.back, P.back2, P.back3];
  const arms = [
    { yaw: 0.10, pitch: 0.62, sc: 1.00 },   // breach
    { yaw: 0.78, pitch: 0.14, sc: 0.94 },
    { yaw: 1.38, pitch: 0.38, sc: 1.05 },
    { yaw: 1.98, pitch: 0.06, sc: 0.90 },
    { yaw: 2.55, pitch: 0.55, sc: 0.99 },   // breach
    { yaw: 3.15, pitch: 0.05, sc: 0.93 },
    { yaw: 3.80, pitch: 0.28, sc: 1.02 },
    { yaw: 4.45, pitch: 0.10, sc: 0.88 },
    { yaw: 5.05, pitch: 0.58, sc: 0.97 },   // breach
    { yaw: 5.70, pitch: 0.20, sc: 1.00 },
  ];
  arms.forEach((a, i) => fish(a.yaw, a.pitch, a.sc, coats[i % 3]));

  /* ---------- fused core knot the tails root into ---------- */
  blob(0, hubY + 0.03, 0, 0.11, 0.075, 0.11, P.knot, 7, 4);

  /* ---------- the one flung prey bone — tumbling clear of the boil, up and to the side ---------- */
  {
    const b0 = V(0.24, hubY + 0.30, -0.10);
    const b1 = V(0.42, hubY + 0.44,  0.06);
    tube(b0, b1, 0.020, 0.020, 5, P.bone, {phase:Math.PI/5});
    blob(b0.x, b0.y, b0.z, 0.032, 0.030, 0.032, P.boneDk, 5, 3);
    blob(b1.x, b1.y, b1.z, 0.032, 0.030, 0.032, P.boneDk, 5, 3);
  }

  /* ---------- base disc (Medium: r=0.42, house pattern) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2 = ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
