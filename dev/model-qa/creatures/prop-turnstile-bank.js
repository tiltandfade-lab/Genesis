/* dev/model-qa/creatures/prop-turnstile-bank.js — the TURNSTILE BANK: a Chrome-realm transit prop
   (whole-object prop, no anchors). Not a gate — mechanical, not barred. Tells, left→right (3 units,
   ~1.2u total width, waist-high):
     - three squat STUB PEDESTALS (~0.5u tall) standing in a row on a shared low base plate
     - each pedestal caps in a small housing collar (the mechanism box the rotor spins out of)
     - three TRI-ARM ROTORS (each arm >=0.05u thick, pale worn metal = the value zone) spun out
       above the collars at waist height
     - ONE rotor frozen mid-turn — its three arms sit at an off-axis rest angle (not aligned to the
       other two, which sit at their resting "closed" angle) — the use-tell: someone stopped it
       mid-push
     - a dark grimy handrail stub flanking each end pedestal (the queue-lane read)
   VS-desaturated steel palette: a few close gunmetal greys + one pale worn-chrome highlight on the
   rotor arms + a small rust-accent at the base bolts. Scale reference: figures ~1.5u tall, waist
   ≈0.5u — the pedestal top (where the rotor mounts) sits right at waist height. Footprint 1x1 cell
   (≈1.25u); the three units span ~1.2u so they read as a bank tiling one 5-ft cell. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropTurnstileBank(){
  /* ---------- PALETTE (VS desaturated gunmetal / chrome) ---------- */
  const P = {
    body:0x53575c, bodyDk:0x393c40, bodyDkr:0x27292c, bodyLt:0x686c72,   // pedestals + collars
    base:0x46484c, baseDk:0x2f3134,                                        // shared base plate
    rotor:0x9a9d9f, rotorHi:0xacafb2,                                       // pale worn-chrome arms — HIGH VALUE ZONE
    rotorDk:0x6d7073,                                                       // rotor hub shadow
    rust:0x6b4030, rustDk:0x4a2b20,                                         // base bolt accent
    rail:0x35373a, railDk:0x232527,                                         // handrail stubs
    disc:0x2a2c2e, discTop:0x323436,
  };

  /* axis-aligned box, 3-tone shading (top lit, sides mid, front lit like the exemplar). */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05);
    quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05);
    quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);
    quad(Cc,G,H,D, top, 0.05);
  }

  const GROUND = 0.055;

  /* ===== 1) SHARED BASE PLATE — a low broad plate the three pedestals stand on, reads as one bank. ===== */
  const PLATE_TOP = GROUND + 0.05;
  box(-0.62,0.62, GROUND,PLATE_TOP, -0.16,0.16, P.baseDk, P.base, P.bodyDkr);
  // rust bolt accents at the plate corners (small, readable dots)
  for (const bx of [-0.56,0.56]) for (const bz of [-0.11,0.11]){
    quad(V(bx-0.02,PLATE_TOP+0.001,bz-0.02), V(bx+0.02,PLATE_TOP+0.001,bz-0.02), V(bx+0.02,PLATE_TOP+0.001,bz+0.02), V(bx-0.02,PLATE_TOP+0.001,bz+0.02), P.rust, 0.03);
  }

  const PED_TOP = PLATE_TOP + 0.46;      // pedestal top ≈ waist height (0.5u overall from ground)
  const COLLAR_TOP = PED_TOP + 0.06;
  const rotorY = COLLAR_TOP + 0.02;      // rotor hub height — where the arms radiate from

  const xs = [-0.42, 0, 0.42];   // three pedestal centers, ~1.2u span end-to-end incl. width
  xs.forEach((cx, i) => {
    /* ===== 2) STUB PEDESTAL — squat box standing on the plate. ===== */
    box(cx-0.09, cx+0.09, PLATE_TOP, PED_TOP, -0.09, 0.09, P.bodyLt, P.body, P.bodyDkr);

    /* ===== 3) HOUSING COLLAR — small mechanism box capping the pedestal, slightly wider. ===== */
    box(cx-0.11, cx+0.11, PED_TOP, COLLAR_TOP, -0.11, 0.11, P.bodyLt, P.body, P.bodyDk);

    /* ===== 4) TRI-ARM ROTOR — three arms radiating from a small hub, 120° apart. The middle
       unit (i===1) is the FROZEN one: its rest angle is offset +35° from the other two, reading
       as caught mid-turn. Arms are stout tubes, thick enough to survive 1/3-res (>=0.05u radius). */
    const restAngle = (i === 1) ? Math.PI/2 + 0.6 : Math.PI/2;   // frozen unit rotated off-axis
    const armLen = 0.30;
    const armR = 0.028;   // radius -> ~0.056u diameter, clears the 0.04u feature floor
    // small hub cap
    stack([
      {y:rotorY-0.02, rx:0.045, rz:0.045, cx, cz:0, hex:P.rotorDk},
      {y:rotorY+0.03, rx:0.045, rz:0.045, cx, cz:0, hex:P.rotor},
    ], 8, {capTop:{hex:P.rotorHi, lift:0.004}});
    for (let a = 0; a < 3; a++){
      const ang = restAngle + a * (Math.PI * 2 / 3);
      const dx = Math.cos(ang) * armLen, dz = Math.sin(ang) * armLen;
      const tip = V(cx + dx, rotorY, dz);
      const hub = V(cx, rotorY, 0);
      tube(hub, tip, armR, armR * 0.7, 6, P.rotorHi, {capB:{hex:P.rotor}});
    }
  });

  /* ===== 5) HANDRAIL STUBS — dark grimy rail nubs flanking the two end pedestals, the queue-lane
     read. Short vertical post + a short horizontal top rail segment reaching outward. ===== */
  for (const side of [-1, 1]){
    const rx = side * 0.60;
    const railTop = PLATE_TOP + 0.34;
    tube(V(rx, PLATE_TOP, 0.10), V(rx, railTop, 0.10), 0.028, 0.028, 6, P.rail, {capT:{hex:P.railDk}});
    tube(V(rx, PLATE_TOP, -0.10), V(rx, railTop, -0.10), 0.028, 0.028, 6, P.rail, {capT:{hex:P.railDk}});
    tube(V(rx, railTop, -0.10), V(rx, railTop, 0.10), 0.026, 0.026, 6, P.railDk);
  }

  /* base disc — shared style. */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 16);
    const r2 = ring(V(0,GROUND,0), V(0,1,0), 0.66, 0.66, 16);
    stitch([r1,r2], () => P.disc);
    capFan(r2, V(0,GROUND+0.003,0), P.discTop);
  }
}
